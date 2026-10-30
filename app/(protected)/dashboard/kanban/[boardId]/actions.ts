"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  boards,
  boardColumns,
  milestones,
  boardCards,
  boardCardAssignees,
  boardCardDocuments,
  boardCardEvents,
  boardCardTags,
  tags,
  teamMembers,
  users,
  documents,
  calendarEvents,
} from "@/db/schema";
import { resolveStagebookScope, StagebookAuthError } from "@/utils/stagebook/scope";
import { scopeWhere, assertSameScope } from "@/utils/stagebook/permissions";
import { nextPosition, positionBetween } from "@/utils/stagebook/position";
import {
  ValidationError,
  cleanText,
  optionalText,
  optionalDate,
  requireUuid,
} from "@/utils/stagebook/validation";
import { notifyUser } from "@/utils/stagebook/actions/notifications";
import {
  milestoneColumns,
  milestoneScope,
  requireMilestoneInScope,
  tagScope,
} from "@/utils/stagebook/labels-core";
import { runAction } from "@/utils/stagebook/action-result";

type ColumnRules = {
  maxCards?: number | null;
  allowedPriorities?: string[];
  dueDateRequired?: boolean;
  maxDueDays?: number | null;
  milestoneId?: string | null;
};

function boardPath(boardId: string) {
  return `/dashboard/kanban/${boardId}`;
}

async function requireBoardInScope(boardId: string) {
  const scope = await resolveStagebookScope();
  const [board] = await db
    .select()
    .from(boards)
    .where(and(eq(boards.id, boardId), scopeWhere(scope, { userId: boards.userId, teamId: boards.teamId })))
    .limit(1);
  if (!board) throw new ValidationError("Board não encontrado.");
  return { scope, board };
}

async function requireColumnInBoard(boardId: string, columnId: string) {
  const [column] = await db
    .select({ id: boardColumns.id })
    .from(boardColumns)
    .where(and(eq(boardColumns.id, columnId), eq(boardColumns.boardId, boardId)))
    .limit(1);
  if (!column) throw new ValidationError("Coluna não encontrada.");
}

export async function getBoardDetail(boardId: string) {
  const { scope, board } = await requireBoardInScope(boardId);

  const [columns, cards, assignees, cardTags, allTags, milestoneRows] = await Promise.all([
    db.select().from(boardColumns).where(eq(boardColumns.boardId, boardId)).orderBy(boardColumns.position),
    db.select().from(boardCards).where(eq(boardCards.boardId, boardId)).orderBy(boardCards.position),
    db
      .select({ cardId: boardCardAssignees.cardId, userId: users.id, name: users.name, avatarUrl: users.avatarUrl })
      .from(boardCardAssignees)
      .innerJoin(users, eq(users.id, boardCardAssignees.userId))
      .innerJoin(boardCards, eq(boardCards.id, boardCardAssignees.cardId))
      .where(eq(boardCards.boardId, boardId)),
    db
      .select({ cardId: boardCardTags.cardId, tagId: tags.id, name: tags.name, color: tags.color })
      .from(boardCardTags)
      .innerJoin(tags, eq(tags.id, boardCardTags.tagId))
      .innerJoin(boardCards, eq(boardCards.id, boardCardTags.cardId))
      .where(eq(boardCards.boardId, boardId)),
    // Tags e milestones são universais: o catálogo é o do espaço (pessoal/equipe),
    // o mesmo usado por páginas, calendário, ThinkLab e LabTest.
    db.select({ id: tags.id, name: tags.name, color: tags.color }).from(tags).where(tagScope(scope)).orderBy(tags.name),
    db.select(milestoneColumns).from(milestones).where(milestoneScope(scope)).orderBy(milestones.dueAt, milestones.name),
  ]);

  return {
    board,
    columns,
    cards,
    assignees,
    cardTags,
    allTags,
    milestones: milestoneRows.map((m) => ({ ...m, dueAt: m.dueAt ? m.dueAt.toISOString() : null })),
  };
}

export async function listTeamMembersForAssignment(teamId: string) {
  const scope = await resolveStagebookScope();
  if (scope.type !== "team" || scope.teamId !== teamId) {
    throw new StagebookAuthError("A equipe não pertence ao espaço atual.");
  }

  return db
    .select({ userId: users.id, name: users.name, avatarUrl: users.avatarUrl, role: teamMembers.role })
    .from(teamMembers)
    .innerJoin(users, eq(users.id, teamMembers.userId))
    .where(eq(teamMembers.teamId, teamId));
}

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

export async function createColumn(boardId: string, name: string) {
  return runAction(async () => {
    await requireBoardInScope(boardId);
    const existing = await db.select({ position: boardColumns.position }).from(boardColumns).where(eq(boardColumns.boardId, boardId));
    await db.insert(boardColumns).values({
      boardId,
      name: cleanText(name, { fallback: "Nova coluna", maxLength: 80 }),
      position: nextPosition(existing.map((c) => c.position)),
    });
    revalidatePath(boardPath(boardId), "layout");
  });
}

export async function renameColumn(boardId: string, columnId: string, name: string) {
  return runAction(async () => {
    await requireBoardInScope(boardId);
    await db
      .update(boardColumns)
      .set({ name: cleanText(name, { fallback: "Nova coluna", maxLength: 80 }) })
      .where(and(eq(boardColumns.id, columnId), eq(boardColumns.boardId, boardId)));
    revalidatePath(boardPath(boardId), "layout");
  });
}

const COLUMN_COLORS = ["#64748b", "#2563eb", "#0891b2", "#16a34a", "#ca8a04", "#ea580c", "#dc2626", "#9333ea", "#db2777"];

export async function updateColumnColor(boardId: string, columnId: string, color: string | null) {
  return runAction(async () => {
    await requireBoardInScope(boardId);
    const nextColor = color && COLUMN_COLORS.includes(color) ? color : null;
    await db
      .update(boardColumns)
      .set({ color: nextColor })
      .where(and(eq(boardColumns.id, columnId), eq(boardColumns.boardId, boardId)));
    revalidatePath(boardPath(boardId), "layout");
  });
}

export async function updateColumnRules(boardId: string, columnId: string, rules: ColumnRules) {
  return runAction(async () => {
    const { scope } = await requireBoardInScope(boardId);
    const cleanRules: ColumnRules = {
      maxCards: rules.maxCards && rules.maxCards > 0 ? Math.floor(rules.maxCards) : null,
      allowedPriorities: (rules.allowedPriorities ?? []).filter((priority) =>
        ["baixa", "media", "alta", "urgente"].includes(priority)
      ),
      dueDateRequired: Boolean(rules.dueDateRequired),
      maxDueDays: rules.maxDueDays && rules.maxDueDays > 0 ? Math.floor(rules.maxDueDays) : null,
      milestoneId: rules.milestoneId || null,
    };
    if (cleanRules.milestoneId) {
      requireUuid(cleanRules.milestoneId, "milestone");
      await requireMilestoneInScope(scope, cleanRules.milestoneId);
    }
    await db.update(boardColumns).set({ rules: cleanRules })
      .where(and(eq(boardColumns.id, columnId), eq(boardColumns.boardId, boardId)));
    revalidatePath(boardPath(boardId), "layout");
  });
}

function validateColumnRules(
  rules: ColumnRules | null | undefined,
  columnCards: { priority: string; dueAt: Date | null; milestoneId: string | null }[],
  card: { priority: string; dueAt: Date | null; milestoneId: string | null }
) {
  if (!rules) return;
  if (rules.maxCards && columnCards.length >= rules.maxCards) {
    throw new ValidationError(`Esta coluna atingiu o limite de ${rules.maxCards} cards.`);
  }
  if (rules.allowedPriorities?.length && !rules.allowedPriorities.includes(card.priority)) {
    throw new ValidationError("A prioridade deste card não é permitida nesta coluna.");
  }
  if (rules.dueDateRequired && !card.dueAt) {
    throw new ValidationError("Esta coluna exige um prazo de entrega.");
  }
  if (rules.maxDueDays && card.dueAt) {
    const limit = new Date();
    limit.setDate(limit.getDate() + rules.maxDueDays);
    if (card.dueAt > limit) throw new ValidationError(`O prazo deve estar dentro de ${rules.maxDueDays} dias.`);
  }
  if (rules.milestoneId && card.milestoneId !== rules.milestoneId) {
    throw new ValidationError("Este card precisa estar vinculado à milestone exigida pela coluna.");
  }
}

export async function deleteColumn(boardId: string, columnId: string) {
  return runAction(async () => {
    await requireBoardInScope(boardId);
    await db.delete(boardColumns).where(and(eq(boardColumns.id, columnId), eq(boardColumns.boardId, boardId)));
    revalidatePath(boardPath(boardId), "layout");
  });
}

export async function reorderColumns(boardId: string, orderedColumnIds: string[]) {
  return runAction(async () => {
    await requireBoardInScope(boardId);
    await Promise.all(
      orderedColumnIds.map((id, index) =>
        db
          .update(boardColumns)
          .set({ position: (index + 1) * 1024 })
          .where(and(eq(boardColumns.id, id), eq(boardColumns.boardId, boardId)))
      )
    );
    revalidatePath(boardPath(boardId), "layout");
  });
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

export async function createCard(boardId: string, columnId: string, title: string) {
  return runAction(async () => {
    const { scope } = await requireBoardInScope(boardId);
    await requireColumnInBoard(boardId, columnId);
    const [column] = await db.select().from(boardColumns).where(eq(boardColumns.id, columnId)).limit(1);
    const existing = await db.select({ position: boardCards.position }).from(boardCards).where(eq(boardCards.columnId, columnId));
    const priority = column?.rules?.allowedPriorities?.[0] ?? "media";
    const dueAt = column?.rules?.dueDateRequired ? new Date() : null;
    const milestoneId = column?.rules?.milestoneId ?? null;
    validateColumnRules(column?.rules, existing.map(() => ({ priority, dueAt, milestoneId })), { priority, dueAt, milestoneId });

    const [card] = await db
      .insert(boardCards)
      .values({
        boardId,
        columnId,
        title: cleanText(title, { fallback: "Novo card", maxLength: 200 }),
        createdBy: scope.userId,
        position: nextPosition(existing.map((c) => c.position)),
        priority,
        dueAt,
        milestoneId,
      })
      .returning({ id: boardCards.id });

    revalidatePath(boardPath(boardId), "layout");
    return card;
  });
}

export async function updateCard(
  boardId: string,
  cardId: string,
  input: { title: string; description?: string; dueAt?: string | null; priority?: string; milestoneId?: string | null }
) {
  return runAction(async () => {
    const { scope } = await requireBoardInScope(boardId);
    const [current] = await db.select().from(boardCards).where(and(eq(boardCards.id, cardId), eq(boardCards.boardId, boardId))).limit(1);
    if (!current) throw new ValidationError("Card não encontrado.");
    const [column] = await db.select().from(boardColumns).where(eq(boardColumns.id, current.columnId)).limit(1);
    const milestoneId = input.milestoneId === undefined ? current.milestoneId : input.milestoneId;
    if (milestoneId && milestoneId !== current.milestoneId) {
      requireUuid(milestoneId, "milestone");
      await requireMilestoneInScope(scope, milestoneId);
    }
    const dueAt = optionalDate(input.dueAt);
    const priority = input.priority || current.priority;
    const updateRules = column?.rules ? { ...column.rules, maxCards: null } : undefined;
    validateColumnRules(updateRules, [], { priority, dueAt, milestoneId });
    await db
      .update(boardCards)
      .set({
        title: cleanText(input.title, { fallback: "Novo card", maxLength: 200 }),
        description: optionalText(input.description, 2000),
        dueAt,
        priority,
        milestoneId,
        updatedBy: scope.userId,
        updatedAt: new Date(),
      })
      .where(and(eq(boardCards.id, cardId), eq(boardCards.boardId, boardId)));
    revalidatePath(boardPath(boardId), "layout");
  });
}

export async function deleteCard(boardId: string, cardId: string) {
  return runAction(async () => {
    await requireBoardInScope(boardId);
    await db.delete(boardCards).where(and(eq(boardCards.id, cardId), eq(boardCards.boardId, boardId)));
    revalidatePath(boardPath(boardId), "layout");
  });
}

/** Move um card para outra coluna/posição. beforeId/afterId = vizinhos na coluna destino (podem ser null). */
export async function moveCard(
  boardId: string,
  cardId: string,
  targetColumnId: string,
  beforePosition: number | null,
  afterPosition: number | null
) {
  return runAction(async () => {
    await requireBoardInScope(boardId);
    await requireColumnInBoard(boardId, targetColumnId);
    const [card] = await db.select().from(boardCards).where(and(eq(boardCards.id, cardId), eq(boardCards.boardId, boardId))).limit(1);
    const [column] = await db.select().from(boardColumns).where(eq(boardColumns.id, targetColumnId)).limit(1);
    const targetCards = await db.select({ priority: boardCards.priority, dueAt: boardCards.dueAt, milestoneId: boardCards.milestoneId })
      .from(boardCards).where(eq(boardCards.columnId, targetColumnId));
    if (!card) throw new ValidationError("Card não encontrado.");
    const movingWithinSameColumn = card.columnId === targetColumnId;
    validateColumnRules(
      movingWithinSameColumn && column?.rules ? { ...column.rules, maxCards: null } : column?.rules,
      movingWithinSameColumn ? [] : targetCards,
      card
    );
    const position = positionBetween(beforePosition, afterPosition);
    await db
      .update(boardCards)
      .set({ columnId: targetColumnId, position, updatedAt: new Date() })
      .where(and(eq(boardCards.id, cardId), eq(boardCards.boardId, boardId)));
    revalidatePath(boardPath(boardId), "layout");
  });
}

// ---------------------------------------------------------------------------
// Assignees
// ---------------------------------------------------------------------------

export async function toggleCardAssignee(boardId: string, cardId: string, userId: string) {
  return runAction(async () => {
    const { scope } = await requireBoardInScope(boardId);
    const canAssign =
      scope.type === "personal"
        ? userId === scope.userId
        : Boolean(
            await db.query.teamMembers.findFirst({
              where: and(eq(teamMembers.teamId, scope.teamId), eq(teamMembers.userId, userId)),
              columns: { id: true },
            })
          );
    if (!canAssign) {
      throw new StagebookAuthError("Este usuário não pertence ao espaço atual.");
    }

    const existing = await db
      .select()
      .from(boardCardAssignees)
      .where(and(eq(boardCardAssignees.cardId, cardId), eq(boardCardAssignees.userId, userId)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .delete(boardCardAssignees)
        .where(and(eq(boardCardAssignees.cardId, cardId), eq(boardCardAssignees.userId, userId)));
    } else {
      await db.insert(boardCardAssignees).values({ cardId, userId });
      if (userId !== scope.userId) {
        const [card] = await db.select({ title: boardCards.title }).from(boardCards).where(eq(boardCards.id, cardId)).limit(1);
        await notifyUser({
          userId,
          type: "board_card_assigned",
          title: "Você foi atribuído a um card",
          message: card?.title ?? undefined,
          data: { boardId, cardId },
        });
      }
    }
    revalidatePath(boardPath(boardId), "layout");
  });
}

// Tags e milestones agora são universais — veja
// utils/stagebook/actions/tags.ts e utils/stagebook/actions/milestones.ts
// (toggleResourceTag("kanban-card", cardId, tagId) etc.).

// ---------------------------------------------------------------------------
// Linking to Pages / Calendar
// ---------------------------------------------------------------------------

export async function listPagesForCard() {
  const scope = await resolveStagebookScope();
  return db
    .select({ id: documents.id, title: documents.title, icon: documents.icon })
    .from(documents)
    .where(scopeWhere(scope, { userId: documents.userId, teamId: documents.teamId }))
    .orderBy(documents.title);
}

export async function listEventsForCard() {
  const scope = await resolveStagebookScope();
  return db
    .select({ id: calendarEvents.id, title: calendarEvents.title, startAt: calendarEvents.startAt })
    .from(calendarEvents)
    .where(scopeWhere(scope, { userId: calendarEvents.userId, teamId: calendarEvents.teamId }))
    .orderBy(calendarEvents.startAt);
}

export async function getCardLinks(cardId: string) {
  const [linkedDocuments, linkedEvents] = await Promise.all([
    db
      .select({ id: documents.id, title: documents.title, icon: documents.icon })
      .from(boardCardDocuments)
      .innerJoin(documents, eq(documents.id, boardCardDocuments.documentId))
      .where(eq(boardCardDocuments.cardId, cardId)),
    db
      .select({ id: calendarEvents.id, title: calendarEvents.title, startAt: calendarEvents.startAt })
      .from(boardCardEvents)
      .innerJoin(calendarEvents, eq(calendarEvents.id, boardCardEvents.eventId))
      .where(eq(boardCardEvents.cardId, cardId)),
  ]);
  return { documents: linkedDocuments, events: linkedEvents };
}

export async function toggleCardDocumentLink(boardId: string, cardId: string, documentId: string) {
  return runAction(async () => {
    const { board } = await requireBoardInScope(boardId);
    requireUuid(documentId, "página");

    const [page] = await db
      .select({ userId: documents.userId, teamId: documents.teamId })
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);
    if (!page) throw new ValidationError("Página não encontrada.");
    assertSameScope(board, page);

    const existing = await db
      .select()
      .from(boardCardDocuments)
      .where(and(eq(boardCardDocuments.cardId, cardId), eq(boardCardDocuments.documentId, documentId)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .delete(boardCardDocuments)
        .where(and(eq(boardCardDocuments.cardId, cardId), eq(boardCardDocuments.documentId, documentId)));
    } else {
      await db.insert(boardCardDocuments).values({ cardId, documentId });
    }
    revalidatePath(boardPath(boardId), "layout");
  });
}

export async function toggleCardEventLink(boardId: string, cardId: string, eventId: string) {
  return runAction(async () => {
    const { board } = await requireBoardInScope(boardId);
    requireUuid(eventId, "evento");

    const [event] = await db
      .select({ userId: calendarEvents.userId, teamId: calendarEvents.teamId })
      .from(calendarEvents)
      .where(eq(calendarEvents.id, eventId))
      .limit(1);
    if (!event) throw new ValidationError("Evento não encontrado.");
    assertSameScope(board, event);

    const existing = await db
      .select()
      .from(boardCardEvents)
      .where(and(eq(boardCardEvents.cardId, cardId), eq(boardCardEvents.eventId, eventId)))
      .limit(1);

    if (existing.length > 0) {
      await db.delete(boardCardEvents).where(and(eq(boardCardEvents.cardId, cardId), eq(boardCardEvents.eventId, eventId)));
    } else {
      await db.insert(boardCardEvents).values({ cardId, eventId });
    }
    revalidatePath(boardPath(boardId), "layout");
  });
}
