"use server";

import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import {
  boards,
  boardColumns,
  milestones,
  boardCards,
  boardCardAssignees,
  boardCardDocuments,
  boardCardTags,
  calendarEvents,
  calendarEventDocuments,
  documents,
  tags,
  users,
} from "@/db/schema";
import { thinklab } from "@/db/schema/thinklab";
import { quickbrickDiagrams, quickbrickNotebooks, quickbrickPhotos } from "@/db/schema/quickbrick";
import { isR2Configured, presignDownload } from "@/utils/quickbrick/r2";
import { summarizeDiagram } from "@/utils/quickbrick/notebook";
import { tests } from "@/db/schema/labtest";
import {
  requireAuthenticatedUser,
  resolveStagebookScope,
  type StagebookScope,
} from "@/utils/stagebook/scope";
import { assertSameScope, creatorScopeWhere, scopeWhere } from "@/utils/stagebook/permissions";
import { requireUuid } from "@/utils/stagebook/validation";
import type { CanvasElement } from "@/types/thinklab.types";
import type {
  CardEmbedData,
  CardPickerItem,
  EmbedKind,
  EventEmbedData,
  EventPickerItem,
  LabTestEmbedData,
  LabTestPickerItem,
  ThinkLabEmbedData,
  ThinkLabPickerItem,
  QuickbrickDiagramEmbedData,
  QuickbrickDiagramPickerItem,
  QuickbrickPhotoEmbedData,
  QuickbrickPhotoPickerItem,
} from "@/components/editor/embeds/embed-types";
import { getLabTestViewData } from "../labtest/actions";

/**
 * Server actions dos blocos embed (cards do Kanban, eventos do calendário,
 * gráficos do LabTest e miniaturas do ThinkLab dentro dos documentos).
 *
 * Toda leitura passa pelo scope atual (pessoal/equipe) — um documento nunca
 * enxerga um item que o usuário não poderia abrir no próprio módulo.
 */

const MAX_LIST = 300;

const iso = (value: Date | string | null | undefined) =>
  value ? new Date(value).toISOString() : null;

function thinkLabScope(scope: StagebookScope) {
  return creatorScopeWhere(scope, { userId: thinklab.userId, teamId: thinklab.teamId });
}

// ---------------------------------------------------------------------------
// Cards do Kanban
// ---------------------------------------------------------------------------

export async function listEmbeddableCards(): Promise<CardPickerItem[]> {
  const scope = await resolveStagebookScope();
  const rows = await db
    .select({
      id: boardCards.id,
      boardId: boardCards.boardId,
      title: boardCards.title,
      priority: boardCards.priority,
      dueAt: boardCards.dueAt,
      boardName: boards.name,
      columnName: boardColumns.name,
    })
    .from(boardCards)
    .innerJoin(boards, eq(boards.id, boardCards.boardId))
    .innerJoin(boardColumns, eq(boardColumns.id, boardCards.columnId))
    .where(scopeWhere(scope, { userId: boards.userId, teamId: boards.teamId }))
    .orderBy(boards.name, boardColumns.position, boardCards.position)
    .limit(MAX_LIST);

  return rows.map((r) => ({ ...r, dueAt: iso(r.dueAt) }));
}

export async function getEmbedCard(cardId: string): Promise<CardEmbedData> {
  requireUuid(cardId, "card");
  const scope = await resolveStagebookScope();

  const [row] = await db
    .select({
      card: boardCards,
      boardName: boards.name,
      columnName: boardColumns.name,
      columnColor: boardColumns.color,
    })
    .from(boardCards)
    .innerJoin(boards, eq(boards.id, boardCards.boardId))
    .innerJoin(boardColumns, eq(boardColumns.id, boardCards.columnId))
    .where(
      and(
        eq(boardCards.id, cardId),
        scopeWhere(scope, { userId: boards.userId, teamId: boards.teamId }),
      ),
    )
    .limit(1);
  if (!row) throw new Error("Card não encontrado.");

  const { card } = row;

  const [tagRows, assigneeRows, milestone] = await Promise.all([
    db
      .select({ name: tags.name, color: tags.color })
      .from(boardCardTags)
      .innerJoin(tags, eq(tags.id, boardCardTags.tagId))
      .where(eq(boardCardTags.cardId, cardId)),
    db
      .select({
        userId: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      })
      .from(boardCardAssignees)
      .innerJoin(users, eq(users.id, boardCardAssignees.userId))
      .where(eq(boardCardAssignees.cardId, cardId)),
    card.milestoneId
      ? db
          .select({ name: milestones.name, color: milestones.color, dueAt: milestones.dueAt })
          .from(milestones)
          .where(eq(milestones.id, card.milestoneId))
          .limit(1)
      : Promise.resolve([] as { name: string; color: string | null; dueAt: Date | null }[]),
  ]);

  return {
    id: card.id,
    boardId: card.boardId,
    boardName: row.boardName,
    title: card.title,
    description: card.description ?? null,
    priority: card.priority,
    dueAt: iso(card.dueAt),
    columnName: row.columnName,
    columnColor: row.columnColor ?? null,
    milestone: milestone[0]
      ? { name: milestone[0].name, color: milestone[0].color, dueAt: iso(milestone[0].dueAt) }
      : null,
    tags: tagRows,
    assignees: assigneeRows,
  };
}

// ---------------------------------------------------------------------------
// Eventos do calendário
// ---------------------------------------------------------------------------

export async function listEmbeddableEvents(): Promise<EventPickerItem[]> {
  const scope = await resolveStagebookScope();
  const rows = await db
    .select({
      id: calendarEvents.id,
      title: calendarEvents.title,
      startAt: calendarEvents.startAt,
      endAt: calendarEvents.endAt,
      allDay: calendarEvents.allDay,
      type: calendarEvents.type,
      color: calendarEvents.color,
    })
    .from(calendarEvents)
    .where(
      scopeWhere(scope, {
        userId: calendarEvents.userId,
        teamId: calendarEvents.teamId,
      }),
    )
    .orderBy(desc(calendarEvents.startAt))
    .limit(MAX_LIST);

  return rows.map((r) => ({
    ...r,
    startAt: new Date(r.startAt).toISOString(),
    endAt: iso(r.endAt),
    allDay: Boolean(r.allDay),
  }));
}

export async function getEmbedEvent(eventId: string): Promise<EventEmbedData> {
  requireUuid(eventId, "evento");
  const scope = await resolveStagebookScope();
  const [event] = await db
    .select()
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.id, eventId),
        scopeWhere(scope, {
          userId: calendarEvents.userId,
          teamId: calendarEvents.teamId,
        }),
      ),
    )
    .limit(1);
  if (!event) throw new Error("Evento não encontrado.");

  return {
    id: event.id,
    title: event.title,
    description: event.description ?? null,
    startAt: new Date(event.startAt).toISOString(),
    endAt: iso(event.endAt),
    allDay: Boolean(event.allDay),
    type: event.type,
    status: event.status,
    color: event.color ?? null,
    location: event.location ?? null,
  };
}

// ---------------------------------------------------------------------------
// ThinkLab (miniatura)
// ---------------------------------------------------------------------------

export async function listEmbeddableThinkLabs(): Promise<ThinkLabPickerItem[]> {
  const scope = await resolveStagebookScope();
  const rows = await db
    .select({
      id: thinklab.id,
      name: thinklab.name,
      description: thinklab.description,
      updatedAt: thinklab.updatedAt,
    })
    .from(thinklab)
    .where(thinkLabScope(scope))
    .orderBy(desc(thinklab.updatedAt))
    .limit(MAX_LIST);

  return rows.map((r) => ({ ...r, updatedAt: new Date(r.updatedAt).toISOString() }));
}

/** Leitura pura: não atualiza `lastAccessAt` (ao contrário de getThinkLabById). */
export async function getEmbedThinkLab(id: string): Promise<ThinkLabEmbedData> {
  const scope = await resolveStagebookScope();
  const [found] = await db
    .select()
    .from(thinklab)
    .where(and(eq(thinklab.id, id), thinkLabScope(scope)))
    .limit(1);
  if (!found) throw new Error("Quadro não encontrado.");

  const config = (found.config ?? {}) as { elements?: unknown[] };
  return {
    id: found.id,
    name: found.name,
    description: found.description ?? null,
    updatedAt: new Date(found.updatedAt).toISOString(),
    elements: (Array.isArray(config.elements) ? config.elements : []) as CanvasElement[],
  };
}

// ---------------------------------------------------------------------------
// LabTest (gráficos)
// ---------------------------------------------------------------------------

export async function listEmbeddableLabTests(): Promise<LabTestPickerItem[]> {
  const userId = await requireAuthenticatedUser();
  const rows = await db
    .select({
      id: tests.id,
      name: tests.name,
      mode: tests.mode,
      season: tests.season,
      updatedAt: tests.updatedAt,
    })
    .from(tests)
    .where(eq(tests.userId, userId))
    .orderBy(desc(tests.updatedAt))
    .limit(MAX_LIST);

  return rows.map((r) => ({ ...r, updatedAt: new Date(r.updatedAt).toISOString() }));
}

export async function getEmbedLabTest(testId: string): Promise<LabTestEmbedData> {
  const { test, fields, entries } = await getLabTestViewData(testId);
  return { test, fields, entries };
}

// ---------------------------------------------------------------------------
// QuickBrick Studio — fotos do robô e diagramas dos cadernos
// ---------------------------------------------------------------------------

function notebookScope(scope: StagebookScope) {
  return creatorScopeWhere(scope, {
    userId: quickbrickNotebooks.userId,
    teamId: quickbrickNotebooks.teamId,
  });
}

/** URL temporária (1h) da foto no R2 — o arquivo nunca fica público. */
async function photoUrl(objectKey: string) {
  return isR2Configured() ? presignDownload(objectKey, { expiresIn: 3600 }) : "";
}

export async function listEmbeddableQuickbrickPhotos(): Promise<QuickbrickPhotoPickerItem[]> {
  const scope = await resolveStagebookScope();
  const rows = await db
    .select({
      id: quickbrickPhotos.id,
      objectKey: quickbrickPhotos.objectKey,
      title: quickbrickPhotos.title,
      takenAt: quickbrickPhotos.takenAt,
      notebookId: quickbrickNotebooks.id,
      notebookName: quickbrickNotebooks.name,
      robotName: quickbrickNotebooks.robotName,
    })
    .from(quickbrickPhotos)
    .innerJoin(quickbrickNotebooks, eq(quickbrickNotebooks.id, quickbrickPhotos.notebookId))
    .where(notebookScope(scope))
    .orderBy(desc(quickbrickPhotos.takenAt))
    .limit(MAX_LIST);

  return Promise.all(
    rows.map(async ({ objectKey, takenAt, ...row }) => ({
      ...row,
      takenAt: iso(takenAt)!,
      thumbUrl: await photoUrl(objectKey),
    })),
  );
}

export async function getEmbedQuickbrickPhoto(photoId: string): Promise<QuickbrickPhotoEmbedData> {
  requireUuid(photoId, "foto");
  const scope = await resolveStagebookScope();
  const [row] = await db
    .select({
      photo: quickbrickPhotos,
      notebookName: quickbrickNotebooks.name,
      robotName: quickbrickNotebooks.robotName,
    })
    .from(quickbrickPhotos)
    .innerJoin(quickbrickNotebooks, eq(quickbrickNotebooks.id, quickbrickPhotos.notebookId))
    .where(and(eq(quickbrickPhotos.id, photoId), notebookScope(scope)))
    .limit(1);
  if (!row) throw new Error("Foto não encontrada.");
  if (!isR2Configured()) throw new Error("O armazenamento de arquivos não está configurado.");

  const versions = await db
    .select({ id: quickbrickPhotos.id })
    .from(quickbrickPhotos)
    .where(eq(quickbrickPhotos.notebookId, row.photo.notebookId))
    .orderBy(quickbrickPhotos.takenAt);

  return {
    id: row.photo.id,
    notebookId: row.photo.notebookId,
    notebookName: row.notebookName,
    robotName: row.robotName,
    url: await photoUrl(row.photo.objectKey),
    title: row.photo.title,
    notes: row.photo.notes,
    takenAt: iso(row.photo.takenAt)!,
    version: versions.findIndex((v) => v.id === row.photo.id) + 1,
    totalVersions: versions.length,
  };
}

export async function listEmbeddableQuickbrickDiagrams(): Promise<QuickbrickDiagramPickerItem[]> {
  const scope = await resolveStagebookScope();
  const rows = await db
    .select({
      id: quickbrickDiagrams.id,
      kind: quickbrickDiagrams.kind,
      title: quickbrickDiagrams.title,
      data: quickbrickDiagrams.data,
      updatedAt: quickbrickDiagrams.updatedAt,
      notebookId: quickbrickNotebooks.id,
      notebookName: quickbrickNotebooks.name,
    })
    .from(quickbrickDiagrams)
    .innerJoin(quickbrickNotebooks, eq(quickbrickNotebooks.id, quickbrickDiagrams.notebookId))
    .where(notebookScope(scope))
    .orderBy(desc(quickbrickDiagrams.updatedAt))
    .limit(MAX_LIST);

  return rows.map(({ data, updatedAt, ...row }) => ({
    ...row,
    summary: summarizeDiagram(row.kind, data),
    updatedAt: iso(updatedAt)!,
  }));
}

export async function getEmbedQuickbrickDiagram(diagramId: string): Promise<QuickbrickDiagramEmbedData> {
  requireUuid(diagramId, "diagrama");
  const scope = await resolveStagebookScope();
  const [row] = await db
    .select({
      diagram: quickbrickDiagrams,
      notebookName: quickbrickNotebooks.name,
    })
    .from(quickbrickDiagrams)
    .innerJoin(quickbrickNotebooks, eq(quickbrickNotebooks.id, quickbrickDiagrams.notebookId))
    .where(and(eq(quickbrickDiagrams.id, diagramId), notebookScope(scope)))
    .limit(1);
  if (!row) throw new Error("Diagrama não encontrado.");

  const { diagram } = row;
  return {
    id: diagram.id,
    notebookId: diagram.notebookId,
    notebookName: row.notebookName,
    kind: diagram.kind,
    title: diagram.title,
    season: diagram.season,
    summary: summarizeDiagram(diagram.kind, diagram.data),
    data: diagram.data,
    updatedAt: iso(diagram.updatedAt)!,
  };
}

// ---------------------------------------------------------------------------
// Vínculo documento ⇄ item
//
// Kanban e Calendário já têm "páginas vinculadas" (boardCardDocuments /
// calendarEventDocuments). Ao inserir o bloco, a página passa a aparecer no
// card/evento — a integração vale nos dois sentidos.
// ---------------------------------------------------------------------------

export async function linkDocumentToEmbed(
  documentId: string,
  kind: EmbedKind,
  refId: string,
): Promise<void> {
  if (kind !== "kanban-card" && kind !== "calendar-event") return;

  requireUuid(documentId, "página");
  requireUuid(refId, "item");
  const scope = await resolveStagebookScope();

  const [page] = await db
    .select({ userId: documents.userId, teamId: documents.teamId })
    .from(documents)
    .where(
      and(
        eq(documents.id, documentId),
        scopeWhere(scope, { userId: documents.userId, teamId: documents.teamId }),
        isNull(documents.deletedAt),
      ),
    )
    .limit(1);
  if (!page) throw new Error("Página não encontrada.");

  if (kind === "kanban-card") {
    const [card] = await db
      .select({ userId: boards.userId, teamId: boards.teamId })
      .from(boardCards)
      .innerJoin(boards, eq(boards.id, boardCards.boardId))
      .where(
        and(
          eq(boardCards.id, refId),
          scopeWhere(scope, { userId: boards.userId, teamId: boards.teamId }),
        ),
      )
      .limit(1);
    if (!card) throw new Error("Card não encontrado.");
    assertSameScope(card, page);

    const existing = await db
      .select({ cardId: boardCardDocuments.cardId })
      .from(boardCardDocuments)
      .where(
        and(
          eq(boardCardDocuments.cardId, refId),
          eq(boardCardDocuments.documentId, documentId),
        ),
      )
      .limit(1);
    if (existing.length === 0) {
      await db.insert(boardCardDocuments).values({ cardId: refId, documentId });
    }
    return;
  }

  const [event] = await db
    .select({ userId: calendarEvents.userId, teamId: calendarEvents.teamId })
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.id, refId),
        scopeWhere(scope, {
          userId: calendarEvents.userId,
          teamId: calendarEvents.teamId,
        }),
      ),
    )
    .limit(1);
  if (!event) throw new Error("Evento não encontrado.");
  assertSameScope(event, page);

  await db
    .insert(calendarEventDocuments)
    .values({ eventId: refId, documentId })
    .onConflictDoNothing();
}
