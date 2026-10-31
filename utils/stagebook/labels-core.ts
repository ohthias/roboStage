import "server-only";

import { and, eq, inArray, sql, type SQL } from "drizzle-orm";
import { db } from "@/db/client";
import {
  boards,
  boardCards,
  boardCardTags,
  calendarEvents,
  calendarEventTags,
  documents,
  documentTags,
  milestones,
  tags,
  tests,
  testTags,
  thinklab,
  thinklabTags,
} from "@/db/schema";
import { scopeOwnership, type StagebookScope } from "./scope";
import { isOwnedByScope, scopeWhere } from "./permissions";
import { resolveLabelColor } from "./label-colors";
import { ValidationError } from "./validation";
import {
  LABELABLE_KINDS,
  type LabelableKind,
  type MilestoneDTO,
  type TagDTO,
} from "@/types/labels";
import { quickbrickNotebooks, quickbrickNotebookTags } from "@/db/schema/quickbrick";

/**
 * Núcleo do sistema UNIVERSAL de tags e milestones.
 *
 * Tudo aqui é escopado: uma tag/milestone pertence a um scope (pessoal ou
 * equipe) e só pode ser aplicada a itens do MESMO scope (seção 30 da spec).
 * Cada ferramenta entra por um "adaptador" — este arquivo é o único lugar que
 * sabe qual tabela de vínculo e qual coluna de milestone cada uma usa. Para
 * suportar uma ferramenta nova, basta acrescentar um adaptador.
 */

type Owner = { userId: string | null; teamId: string | null };

type Adapter = {
  /** Escopo do item (normalizado para o par userId/teamId exclusivo). */
  owner(id: string): Promise<Owner | null>;
  /** Vínculos de tag do item. */
  tagsOf(ids: string[]): Promise<{ resourceId: string; tag: TagDTO }[]>;
  addTag(id: string, tagId: string): Promise<void>;
  removeTag(id: string, tagId: string): Promise<void>;
  /** Quantas vezes cada tag está em uso nesta ferramenta. */
  tagUsage(tagIds: string[]): Promise<{ tagId: string; count: number }[]>;
  /** Milestone do item. */
  setMilestone(id: string, milestoneId: string | null): Promise<void>;
  milestoneOf(ids: string[]): Promise<{ resourceId: string; milestoneId: string | null }[]>;
  milestoneUsage(milestoneIds: string[]): Promise<{ milestoneId: string; count: number }[]>;
};

const tagColumns = { id: tags.id, name: tags.name, color: tags.color };

/** thinklab/tests guardam userId (criador) + teamId opcional: normaliza para xor. */
const normalizeOwner = (row: { userId: string | null; teamId: string | null }): Owner =>
  row.teamId ? { userId: null, teamId: row.teamId } : { userId: row.userId, teamId: null };

const ADAPTERS: Record<LabelableKind, Adapter> = {
  "kanban-card": {
    async owner(id) {
      const [row] = await db
        .select({ userId: boards.userId, teamId: boards.teamId })
        .from(boardCards)
        .innerJoin(boards, eq(boards.id, boardCards.boardId))
        .where(eq(boardCards.id, id))
        .limit(1);
      return row ?? null;
    },
    async tagsOf(ids) {
      if (!ids.length) return [];
      const rows = await db
        .select({ resourceId: boardCardTags.cardId, ...tagColumns })
        .from(boardCardTags)
        .innerJoin(tags, eq(tags.id, boardCardTags.tagId))
        .where(inArray(boardCardTags.cardId, ids))
        .orderBy(tags.name);
      return rows.map(({ resourceId, ...tag }) => ({ resourceId, tag }));
    },
    async addTag(id, tagId) {
      await db.insert(boardCardTags).values({ cardId: id, tagId }).onConflictDoNothing();
    },
    async removeTag(id, tagId) {
      await db.delete(boardCardTags).where(and(eq(boardCardTags.cardId, id), eq(boardCardTags.tagId, tagId)));
    },
    async tagUsage(tagIds) {
      if (!tagIds.length) return [];
      return db
        .select({ tagId: boardCardTags.tagId, count: sql<number>`count(*)::int` })
        .from(boardCardTags)
        .where(inArray(boardCardTags.tagId, tagIds))
        .groupBy(boardCardTags.tagId);
    },
    async setMilestone(id, milestoneId) {
      await db.update(boardCards).set({ milestoneId, updatedAt: new Date() }).where(eq(boardCards.id, id));
    },
    async milestoneOf(ids) {
      if (!ids.length) return [];
      const rows = await db
        .select({ resourceId: boardCards.id, milestoneId: boardCards.milestoneId })
        .from(boardCards)
        .where(inArray(boardCards.id, ids));
      return rows;
    },
    async milestoneUsage(ids) {
      if (!ids.length) return [];
      const rows = await db
        .select({ milestoneId: boardCards.milestoneId, count: sql<number>`count(*)::int` })
        .from(boardCards)
        .where(inArray(boardCards.milestoneId, ids))
        .groupBy(boardCards.milestoneId);
      return rows.flatMap((r) => (r.milestoneId ? [{ milestoneId: r.milestoneId, count: r.count }] : []));
    },
  },

  document: {
    async owner(id) {
      const [row] = await db
        .select({ userId: documents.userId, teamId: documents.teamId })
        .from(documents)
        .where(eq(documents.id, id))
        .limit(1);
      return row ?? null;
    },
    async tagsOf(ids) {
      if (!ids.length) return [];
      const rows = await db
        .select({ resourceId: documentTags.documentId, ...tagColumns })
        .from(documentTags)
        .innerJoin(tags, eq(tags.id, documentTags.tagId))
        .where(inArray(documentTags.documentId, ids))
        .orderBy(tags.name);
      return rows.map(({ resourceId, ...tag }) => ({ resourceId, tag }));
    },
    async addTag(id, tagId) {
      await db.insert(documentTags).values({ documentId: id, tagId }).onConflictDoNothing();
    },
    async removeTag(id, tagId) {
      await db.delete(documentTags).where(and(eq(documentTags.documentId, id), eq(documentTags.tagId, tagId)));
    },
    async tagUsage(tagIds) {
      if (!tagIds.length) return [];
      return db
        .select({ tagId: documentTags.tagId, count: sql<number>`count(*)::int` })
        .from(documentTags)
        .where(inArray(documentTags.tagId, tagIds))
        .groupBy(documentTags.tagId);
    },
    async setMilestone(id, milestoneId) {
      await db.update(documents).set({ milestoneId, updatedAt: new Date() }).where(eq(documents.id, id));
    },
    async milestoneOf(ids) {
      if (!ids.length) return [];
      return db
        .select({ resourceId: documents.id, milestoneId: documents.milestoneId })
        .from(documents)
        .where(inArray(documents.id, ids));
    },
    async milestoneUsage(ids) {
      if (!ids.length) return [];
      const rows = await db
        .select({ milestoneId: documents.milestoneId, count: sql<number>`count(*)::int` })
        .from(documents)
        .where(inArray(documents.milestoneId, ids))
        .groupBy(documents.milestoneId);
      return rows.flatMap((r) => (r.milestoneId ? [{ milestoneId: r.milestoneId, count: r.count }] : []));
    },
  },

  "calendar-event": {
    async owner(id) {
      const [row] = await db
        .select({ userId: calendarEvents.userId, teamId: calendarEvents.teamId })
        .from(calendarEvents)
        .where(eq(calendarEvents.id, id))
        .limit(1);
      return row ?? null;
    },
    async tagsOf(ids) {
      if (!ids.length) return [];
      const rows = await db
        .select({ resourceId: calendarEventTags.eventId, ...tagColumns })
        .from(calendarEventTags)
        .innerJoin(tags, eq(tags.id, calendarEventTags.tagId))
        .where(inArray(calendarEventTags.eventId, ids))
        .orderBy(tags.name);
      return rows.map(({ resourceId, ...tag }) => ({ resourceId, tag }));
    },
    async addTag(id, tagId) {
      await db.insert(calendarEventTags).values({ eventId: id, tagId }).onConflictDoNothing();
    },
    async removeTag(id, tagId) {
      await db
        .delete(calendarEventTags)
        .where(and(eq(calendarEventTags.eventId, id), eq(calendarEventTags.tagId, tagId)));
    },
    async tagUsage(tagIds) {
      if (!tagIds.length) return [];
      return db
        .select({ tagId: calendarEventTags.tagId, count: sql<number>`count(*)::int` })
        .from(calendarEventTags)
        .where(inArray(calendarEventTags.tagId, tagIds))
        .groupBy(calendarEventTags.tagId);
    },
    async setMilestone(id, milestoneId) {
      await db.update(calendarEvents).set({ milestoneId, updatedAt: new Date() }).where(eq(calendarEvents.id, id));
    },
    async milestoneOf(ids) {
      if (!ids.length) return [];
      return db
        .select({ resourceId: calendarEvents.id, milestoneId: calendarEvents.milestoneId })
        .from(calendarEvents)
        .where(inArray(calendarEvents.id, ids));
    },
    async milestoneUsage(ids) {
      if (!ids.length) return [];
      const rows = await db
        .select({ milestoneId: calendarEvents.milestoneId, count: sql<number>`count(*)::int` })
        .from(calendarEvents)
        .where(inArray(calendarEvents.milestoneId, ids))
        .groupBy(calendarEvents.milestoneId);
      return rows.flatMap((r) => (r.milestoneId ? [{ milestoneId: r.milestoneId, count: r.count }] : []));
    },
  },

  thinklab: {
    async owner(id) {
      const [row] = await db
        .select({ userId: thinklab.userId, teamId: thinklab.teamId })
        .from(thinklab)
        .where(eq(thinklab.id, id))
        .limit(1);
      return row ? normalizeOwner(row) : null;
    },
    async tagsOf(ids) {
      if (!ids.length) return [];
      const rows = await db
        .select({ resourceId: thinklabTags.thinklabId, ...tagColumns })
        .from(thinklabTags)
        .innerJoin(tags, eq(tags.id, thinklabTags.tagId))
        .where(inArray(thinklabTags.thinklabId, ids))
        .orderBy(tags.name);
      return rows.map(({ resourceId, ...tag }) => ({ resourceId, tag }));
    },
    async addTag(id, tagId) {
      await db.insert(thinklabTags).values({ thinklabId: id, tagId }).onConflictDoNothing();
    },
    async removeTag(id, tagId) {
      await db.delete(thinklabTags).where(and(eq(thinklabTags.thinklabId, id), eq(thinklabTags.tagId, tagId)));
    },
    async tagUsage(tagIds) {
      if (!tagIds.length) return [];
      return db
        .select({ tagId: thinklabTags.tagId, count: sql<number>`count(*)::int` })
        .from(thinklabTags)
        .where(inArray(thinklabTags.tagId, tagIds))
        .groupBy(thinklabTags.tagId);
    },
    async setMilestone(id, milestoneId) {
      await db.update(thinklab).set({ milestoneId }).where(eq(thinklab.id, id));
    },
    async milestoneOf(ids) {
      if (!ids.length) return [];
      return db
        .select({ resourceId: thinklab.id, milestoneId: thinklab.milestoneId })
        .from(thinklab)
        .where(inArray(thinklab.id, ids));
    },
    async milestoneUsage(ids) {
      if (!ids.length) return [];
      const rows = await db
        .select({ milestoneId: thinklab.milestoneId, count: sql<number>`count(*)::int` })
        .from(thinklab)
        .where(inArray(thinklab.milestoneId, ids))
        .groupBy(thinklab.milestoneId);
      return rows.flatMap((r) => (r.milestoneId ? [{ milestoneId: r.milestoneId, count: r.count }] : []));
    },
  },

  labtest: {
    async owner(id) {
      const [row] = await db
        .select({ userId: tests.userId, teamId: tests.teamId })
        .from(tests)
        .where(eq(tests.id, id))
        .limit(1);
      return row ? normalizeOwner(row) : null;
    },
    async tagsOf(ids) {
      if (!ids.length) return [];
      const rows = await db
        .select({ resourceId: testTags.testId, ...tagColumns })
        .from(testTags)
        .innerJoin(tags, eq(tags.id, testTags.tagId))
        .where(inArray(testTags.testId, ids))
        .orderBy(tags.name);
      return rows.map(({ resourceId, ...tag }) => ({ resourceId, tag }));
    },
    async addTag(id, tagId) {
      await db.insert(testTags).values({ testId: id, tagId }).onConflictDoNothing();
    },
    async removeTag(id, tagId) {
      await db.delete(testTags).where(and(eq(testTags.testId, id), eq(testTags.tagId, tagId)));
    },
    async tagUsage(tagIds) {
      if (!tagIds.length) return [];
      return db
        .select({ tagId: testTags.tagId, count: sql<number>`count(*)::int` })
        .from(testTags)
        .where(inArray(testTags.tagId, tagIds))
        .groupBy(testTags.tagId);
    },
    async setMilestone(id, milestoneId) {
      await db.update(tests).set({ milestoneId }).where(eq(tests.id, id));
    },
    async milestoneOf(ids) {
      if (!ids.length) return [];
      return db
        .select({ resourceId: tests.id, milestoneId: tests.milestoneId })
        .from(tests)
        .where(inArray(tests.id, ids));
    },
    async milestoneUsage(ids) {
      if (!ids.length) return [];
      const rows = await db
        .select({ milestoneId: tests.milestoneId, count: sql<number>`count(*)::int` })
        .from(tests)
        .where(inArray(tests.milestoneId, ids))
        .groupBy(tests.milestoneId);
      return rows.flatMap((r) => (r.milestoneId ? [{ milestoneId: r.milestoneId, count: r.count }] : []));
    },
  },
  quickbrick: {
    async owner(id) {
      const [row] = await db
        .select({ userId: quickbrickNotebooks.userId, teamId: quickbrickNotebooks.teamId })
        .from(quickbrickNotebooks)
        .where(eq(quickbrickNotebooks.id, id))
        .limit(1);
      return row ? normalizeOwner(row) : null;
    },
    async tagsOf(ids) {
      if (!ids.length) return [];
      const rows = await db
        .select({ resourceId: quickbrickNotebookTags.notebookId, ...tagColumns })
        .from(quickbrickNotebookTags)
        .innerJoin(tags, eq(tags.id, quickbrickNotebookTags.tagId))
        .where(inArray(quickbrickNotebookTags.notebookId, ids))
        .orderBy(tags.name);
      return rows.map(({ resourceId, ...tag }) => ({ resourceId, tag }));
    },
    async addTag(id, tagId) {
      await db.insert(quickbrickNotebookTags).values({ notebookId: id, tagId }).onConflictDoNothing();
    },
    async removeTag(id, tagId) {
      await db
        .delete(quickbrickNotebookTags)
        .where(and(eq(quickbrickNotebookTags.notebookId, id), eq(quickbrickNotebookTags.tagId, tagId)));
    },
    async tagUsage(tagIds) {
      if (!tagIds.length) return [];
      return db
        .select({ tagId: quickbrickNotebookTags.tagId, count: sql<number>`count(*)::int` })
        .from(quickbrickNotebookTags)
        .where(inArray(quickbrickNotebookTags.tagId, tagIds))
        .groupBy(quickbrickNotebookTags.tagId);
    },
    async setMilestone(id, milestoneId) {
      await db
        .update(quickbrickNotebooks)
        .set({ milestoneId, updatedAt: new Date() })
        .where(eq(quickbrickNotebooks.id, id));
    },
    async milestoneOf(ids) {
      if (!ids.length) return [];
      return db
        .select({ resourceId: quickbrickNotebooks.id, milestoneId: quickbrickNotebooks.milestoneId })
        .from(quickbrickNotebooks)
        .where(inArray(quickbrickNotebooks.id, ids));
    },
    async milestoneUsage(ids) {
      if (!ids.length) return [];
      const rows = await db
        .select({ milestoneId: quickbrickNotebooks.milestoneId, count: sql<number>`count(*)::int` })
        .from(quickbrickNotebooks)
        .where(inArray(quickbrickNotebooks.milestoneId, ids))
        .groupBy(quickbrickNotebooks.milestoneId);
      return rows.flatMap((r) => (r.milestoneId ? [{ milestoneId: r.milestoneId, count: r.count }] : []));
    },
  },
};

export function assertKind(kind: unknown): asserts kind is LabelableKind {
  if (!LABELABLE_KINDS.includes(kind as LabelableKind)) {
    throw new ValidationError("Tipo de item inválido.");
  }
}

export const adapterFor = (kind: LabelableKind) => ADAPTERS[kind];

/** Garante que o item existe e pertence ao scope atual. */
export async function requireResourceInScope(scope: StagebookScope, kind: LabelableKind, id: string) {
  const owner = await ADAPTERS[kind].owner(id);
  if (!owner || !isOwnedByScope(scope, owner)) throw new ValidationError("Item não encontrado.");
}

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export const tagScope = (scope: StagebookScope): SQL =>
  scopeWhere(scope, { userId: tags.userId, teamId: tags.teamId });

const sameName = (name: string) => sql`lower(${tags.name}) = ${name.toLowerCase()}`;

export async function findTagByName(scope: StagebookScope, name: string): Promise<TagDTO | null> {
  const [row] = await db
    .select(tagColumns)
    .from(tags)
    .where(and(tagScope(scope), sameName(name)))
    .limit(1);
  return row ?? null;
}

export async function requireTagInScope(scope: StagebookScope, tagId: string): Promise<TagDTO> {
  const [row] = await db
    .select(tagColumns)
    .from(tags)
    .where(and(eq(tags.id, tagId), tagScope(scope)))
    .limit(1);
  if (!row) throw new ValidationError("Tag não encontrada.");
  return row;
}

/** Busca a tag pelo nome (sem diferenciar maiúsculas) ou cria no scope atual. */
export async function getOrCreateTag(
  scope: StagebookScope,
  name: string,
  color?: string | null,
): Promise<TagDTO> {
  const existing = await findTagByName(scope, name);
  if (existing) return existing;

  // A cor automática é gravada: assim a tag mantém a cor mesmo se for renomeada.
  await db
    .insert(tags)
    .values({ ...scopeOwnership(scope), name, color: color ?? resolveLabelColor(null, name) })
    .onConflictDoNothing();

  const created = await findTagByName(scope, name);
  if (!created) throw new ValidationError("Não foi possível criar a tag.");
  return created;
}

export async function tagsForResources(kind: LabelableKind, ids: string[]) {
  const rows = await ADAPTERS[kind].tagsOf(ids);
  const map = new Map<string, TagDTO[]>();
  for (const { resourceId, tag } of rows) {
    if (!map.has(resourceId)) map.set(resourceId, []);
    map.get(resourceId)!.push(tag);
  }
  return map;
}

export async function tagUsageByKind(tagIds: string[]) {
  const entries = await Promise.all(
    LABELABLE_KINDS.map(async (kind) => [kind, await ADAPTERS[kind].tagUsage(tagIds)] as const),
  );
  const usage = new Map<string, Record<LabelableKind, number>>();
  const empty = () =>
    Object.fromEntries(LABELABLE_KINDS.map((k) => [k, 0])) as Record<LabelableKind, number>;
  for (const [kind, rows] of entries) {
    for (const { tagId, count } of rows) {
      if (!usage.has(tagId)) usage.set(tagId, empty());
      usage.get(tagId)![kind] = count;
    }
  }
  return { usage, empty };
}

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

export const milestoneScope = (scope: StagebookScope): SQL =>
  scopeWhere(scope, { userId: milestones.userId, teamId: milestones.teamId });

export const milestoneColumns = {
  id: milestones.id,
  name: milestones.name,
  description: milestones.description,
  color: milestones.color,
  dueAt: milestones.dueAt,
};

export const toMilestoneDTO = (row: {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  dueAt: Date | string | null;
}): MilestoneDTO => ({
  id: row.id,
  name: row.name,
  description: row.description,
  color: row.color,
  dueAt: row.dueAt ? new Date(row.dueAt).toISOString() : null,
});

export async function requireMilestoneInScope(scope: StagebookScope, milestoneId: string) {
  const [row] = await db
    .select(milestoneColumns)
    .from(milestones)
    .where(and(eq(milestones.id, milestoneId), milestoneScope(scope)))
    .limit(1);
  if (!row) throw new ValidationError("Milestone não encontrada neste espaço.");
  return toMilestoneDTO(row);
}

export async function milestonesForResources(kind: LabelableKind, ids: string[]) {
  const links = await ADAPTERS[kind].milestoneOf(ids);
  const milestoneIds = [...new Set(links.flatMap((l) => (l.milestoneId ? [l.milestoneId] : [])))];
  const rows = milestoneIds.length
    ? await db.select(milestoneColumns).from(milestones).where(inArray(milestones.id, milestoneIds))
    : [];
  const byId = new Map(rows.map((r) => [r.id, toMilestoneDTO(r)]));
  return new Map(links.map((l) => [l.resourceId, l.milestoneId ? (byId.get(l.milestoneId) ?? null) : null]));
}

export async function milestoneUsageByKind(milestoneIds: string[]) {
  const entries = await Promise.all(
    LABELABLE_KINDS.map(async (kind) => [kind, await ADAPTERS[kind].milestoneUsage(milestoneIds)] as const),
  );
  const usage = new Map<string, Record<LabelableKind, number>>();
  const empty = () =>
    Object.fromEntries(LABELABLE_KINDS.map((k) => [k, 0])) as Record<LabelableKind, number>;
  for (const [kind, rows] of entries) {
    for (const { milestoneId, count } of rows) {
      if (!usage.has(milestoneId)) usage.set(milestoneId, empty());
      usage.get(milestoneId)![kind] = count;
    }
  }
  return { usage, empty };
}
