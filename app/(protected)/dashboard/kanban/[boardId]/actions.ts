"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ilike } from "drizzle-orm";
import { db } from "@/db/client";
import {
  boards,
  boardColumns,
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
import { resolveStagebookScope } from "@/lib/stagebook/scope";
import { scopeWhere, assertSameScope } from "@/lib/stagebook/permissions";
import { nextPosition, positionBetween } from "@/lib/stagebook/position";
import { cleanText, optionalText, optionalDate, requireUuid } from "@/lib/stagebook/validation";
import { notifyUser } from "@/lib/stagebook/actions/notifications";

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
  if (!board) throw new Error("Board não encontrado.");
  return { scope, board };
}

export async function getBoardDetail(boardId: string) {
  const { board } = await requireBoardInScope(boardId);

  const [columns, cards, assignees, cardTags] = await Promise.all([
    db.select().from(boardColumns).where(eq(boardColumns.boardId, boardId)).orderBy(boardColumns.position),
    db.select().from(boardCards).where(eq(boardCards.boardId, boardId)).orderBy(boardCards.position),
    db
      .select({ cardId: boardCardAssignees.cardId, userId: users.id, name: users.name, avatarUrl: users.avatarUrl })
      .from(boardCardAssignees)
      .innerJoin(users, eq(users.id, boardCardAssignees.userId))
      .innerJoin(boardCards, eq(boardCards.id, boardCardAssignees.cardId))
      .where(eq(boardCards.boardId, boardId)),
    db
      .select({ cardId: boardCardTags.cardId, tagId: tags.id, name: tags.name })
      .from(boardCardTags)
      .innerJoin(tags, eq(tags.id, boardCardTags.tagId))
      .innerJoin(boardCards, eq(boardCards.id, boardCardTags.cardId))
      .where(eq(boardCards.boardId, boardId)),
  ]);

  return { board, columns, cards, assignees, cardTags };
}

export async function listTeamMembersForAssignment(teamId: string) {
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
  await requireBoardInScope(boardId);
  const existing = await db.select({ position: boardColumns.position }).from(boardColumns).where(eq(boardColumns.boardId, boardId));
  await db.insert(boardColumns).values({
    boardId,
    name: cleanText(name, { fallback: "Nova coluna", maxLength: 80 }),
    position: nextPosition(existing.map((c) => c.position)),
  });
  revalidatePath(boardPath(boardId), "layout");
}

export async function renameColumn(boardId: string, columnId: string, name: string) {
  await requireBoardInScope(boardId);
  await db
    .update(boardColumns)
    .set({ name: cleanText(name, { fallback: "Nova coluna", maxLength: 80 }) })
    .where(and(eq(boardColumns.id, columnId), eq(boardColumns.boardId, boardId)));
  revalidatePath(boardPath(boardId), "layout");
}

export async function deleteColumn(boardId: string, columnId: string) {
  await requireBoardInScope(boardId);
  await db.delete(boardColumns).where(and(eq(boardColumns.id, columnId), eq(boardColumns.boardId, boardId)));
  revalidatePath(boardPath(boardId), "layout");
}

export async function reorderColumns(boardId: string, orderedColumnIds: string[]) {
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
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

export async function createCard(boardId: string, columnId: string, title: string) {
  const { scope } = await requireBoardInScope(boardId);
  const existing = await db.select({ position: boardCards.position }).from(boardCards).where(eq(boardCards.columnId, columnId));

  const [card] = await db
    .insert(boardCards)
    .values({
      boardId,
      columnId,
      title: cleanText(title, { fallback: "Novo card", maxLength: 200 }),
      createdBy: scope.userId,
      position: nextPosition(existing.map((c) => c.position)),
    })
    .returning({ id: boardCards.id });

  revalidatePath(boardPath(boardId), "layout");
  return card;
}

export async function updateCard(
  boardId: string,
  cardId: string,
  input: { title: string; description?: string; dueAt?: string | null; priority?: string }
) {
  const { scope } = await requireBoardInScope(boardId);
  await db
    .update(boardCards)
    .set({
      title: cleanText(input.title, { fallback: "Novo card", maxLength: 200 }),
      description: optionalText(input.description, 2000),
      dueAt: optionalDate(input.dueAt),
      priority: input.priority || "media",
      updatedBy: scope.userId,
      updatedAt: new Date(),
    })
    .where(and(eq(boardCards.id, cardId), eq(boardCards.boardId, boardId)));
  revalidatePath(boardPath(boardId), "layout");
}

export async function deleteCard(boardId: string, cardId: string) {
  await requireBoardInScope(boardId);
  await db.delete(boardCards).where(and(eq(boardCards.id, cardId), eq(boardCards.boardId, boardId)));
  revalidatePath(boardPath(boardId), "layout");
}

/** Move um card para outra coluna/posição. beforeId/afterId = vizinhos na coluna destino (podem ser null). */
export async function moveCard(
  boardId: string,
  cardId: string,
  targetColumnId: string,
  beforePosition: number | null,
  afterPosition: number | null
) {
  await requireBoardInScope(boardId);
  const position = positionBetween(beforePosition, afterPosition);
  await db
    .update(boardCards)
    .set({ columnId: targetColumnId, position, updatedAt: new Date() })
    .where(and(eq(boardCards.id, cardId), eq(boardCards.boardId, boardId)));
  revalidatePath(boardPath(boardId), "layout");
}

// ---------------------------------------------------------------------------
// Assignees
// ---------------------------------------------------------------------------

export async function toggleCardAssignee(boardId: string, cardId: string, userId: string) {
  const { scope } = await requireBoardInScope(boardId);
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
}

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export async function searchTags(query: string) {
  const clean = query.trim();
  if (!clean) return db.select().from(tags).orderBy(tags.name).limit(20);
  return db.select().from(tags).where(ilike(tags.name, `%${clean}%`)).orderBy(tags.name).limit(20);
}

export async function toggleCardTag(boardId: string, cardId: string, tagName: string) {
  await requireBoardInScope(boardId);
  const clean = cleanText(tagName, { maxLength: 40 });
  if (!clean) return;

  let [tag] = await db.select().from(tags).where(ilike(tags.name, clean)).limit(1);
  if (!tag) {
    [tag] = await db.insert(tags).values({ name: clean }).returning();
  }

  const existing = await db
    .select()
    .from(boardCardTags)
    .where(and(eq(boardCardTags.cardId, cardId), eq(boardCardTags.tagId, tag.id)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(boardCardTags).where(and(eq(boardCardTags.cardId, cardId), eq(boardCardTags.tagId, tag.id)));
  } else {
    await db.insert(boardCardTags).values({ cardId, tagId: tag.id });
  }
  revalidatePath(boardPath(boardId), "layout");
}

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
  const { board } = await requireBoardInScope(boardId);
  requireUuid(documentId, "página");

  const [page] = await db
    .select({ userId: documents.userId, teamId: documents.teamId })
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);
  if (!page) throw new Error("Página não encontrada.");
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
}

export async function toggleCardEventLink(boardId: string, cardId: string, eventId: string) {
  const { board } = await requireBoardInScope(boardId);
  requireUuid(eventId, "evento");

  const [event] = await db
    .select({ userId: calendarEvents.userId, teamId: calendarEvents.teamId })
    .from(calendarEvents)
    .where(eq(calendarEvents.id, eventId))
    .limit(1);
  if (!event) throw new Error("Evento não encontrado.");
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
}
