import "server-only";

import { and, asc, desc, eq, gte, inArray, isNotNull, isNull, lte, notInArray, or, sql, type AnyColumn, type SQL } from "drizzle-orm";
import { db } from "@/db/client";
import {
  boardCards,
  boards,
  documents,
  folders,
  journalEntries,
  milestones,
  quickbrickNotebooks,
  quickbrickPhotos,
  teamActivity,
  teamLegacyChapters,
  teamLegacyItems,
  teamMembers,
  testExecutions,
  tests,
  thinklab,
  trainingSessions,
  users,
} from "@/db/schema";
import { formatJournalDate } from "@/features/stagebook/types/journal";
import { sessionKindLabel } from "@/features/stagebook/types/training";
import {
  compareChapters,
  legacyItemHref,
  normalizeLegacyContent,
  seasonPreset,
  type LegacyCandidateDTO,
  type LegacyChapterDTO,
  type LegacyChapterKind,
  type LegacyItemDTO,
  type LegacyItemKind,
  type LegacyLeague,
  type LegacyMemberDTO,
  type LegacyStage,
  type LegacyStats,
} from "@/features/stagebook/types/legacy";

/**
 * Leitura do Legado da equipe: abas, itens guardados (dados vivos de cada
 * ferramenta), números do período e sugestões para sincronizar.
 *
 * Tudo aqui recebe um `teamId` JÁ validado (o chamador garante que a pessoa é
 * membro). As datas do período são dias locais de Brasília: o servidor
 * converte `timestamptz` com `at time zone 'America/Sao_Paulo'`.
 */

const TZ = "America/Sao_Paulo";
const localDay = (col: AnyColumn | SQL) => sql`(${col} at time zone ${TZ})::date`;

export function todayInBrazil(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);
}

/** Período de uma aba: temporada sem fim vai até hoje; competição sem fim dura um dia. */
export function chapterRange(
  chapter: { kind: string; startDate: string | null; endDate: string | null },
  today = todayInBrazil(),
): { start: string; end: string } | null {
  if (!chapter.startDate) return null;
  const end = chapter.endDate ?? (chapter.kind === "competition" ? chapter.startDate : today);
  return { start: chapter.startDate, end: end < chapter.startDate ? chapter.startDate : end };
}

const like = (column: AnyColumn, q: string): SQL | undefined =>
  q ? sql`${column} ilike ${`%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`}` : undefined;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const shortDate = (d: Date | string) => formatJournalDate(typeof d === "string" ? d.slice(0, 10) : todayInBrazil(d), "short");

// ---------------------------------------------------------------------------
// Fontes (uma por ferramenta)
// ---------------------------------------------------------------------------

type ItemRow = { id: string; title: string; icon: string | null; date: string; meta: string | null };
type Range = { start: string; end: string };
type SuggestCtx = { range: Range | null; seasonKey: string | null; league: LegacyLeague | null };

type Source = {
  /** Itens da equipe por id (o que não for da equipe some). */
  byIds(teamId: string, ids: string[]): Promise<ItemRow[]>;
  /** Busca por título, mais recentes primeiro. */
  search(teamId: string, q: string, limit: number, exclude: string[]): Promise<ItemRow[]>;
  /** Sugestões para uma aba: mesma temporada, mesma liga ou do período. */
  suggest(teamId: string, ctx: SuggestCtx, limit: number, exclude: string[]): Promise<(ItemRow & { reason: string })[]>;
};

const notIn = (col: AnyColumn, ids: string[]) => (ids.length ? notInArray(col, ids) : undefined);
const inRange = (col: AnyColumn, range: Range) => and(gte(localDay(col), sql`${range.start}::date`), lte(localDay(col), sql`${range.end}::date`));

const testsMeta = sql<number>`(select count(*)::int from ${testExecutions} e where e.test_id = "tests"."id")`;
const photosMeta = sql<number>`(select count(*)::int from ${quickbrickPhotos} p where p.notebook_id = "quickbrick_notebooks"."id")`;
const folderPages = sql<number>`(select count(*)::int from ${documents} d where d.folder_id = "folders"."id" and d.deleted_at is null)`;
const boardCardCount = sql<number>`(select count(*)::int from ${boardCards} c where c.board_id = "boards"."id")`;
const sessionDate = sql<Date>`coalesce(${trainingSessions.startedAt}, ${trainingSessions.scheduledFor}, ${trainingSessions.createdAt})`.mapWith(
  (v: string | Date) => (v instanceof Date ? v : new Date(v)),
);

function milestoneMeta(m: { dueAt: Date | null; completedAt: Date | null }): string | null {
  if (m.completedAt) return `concluída em ${shortDate(m.completedAt)}`;
  if (m.dueAt) return `prazo ${shortDate(m.dueAt)}`;
  return null;
}

const SOURCES: Record<LegacyItemKind, Source> = {
  stagebook: {
    async byIds(teamId, ids) {
      const rows = await db
        .select({ id: documents.id, title: documents.title, icon: documents.icon, updatedAt: documents.updatedAt })
        .from(documents)
        .where(and(inArray(documents.id, ids), eq(documents.teamId, teamId), isNull(documents.deletedAt)));
      return rows.map((r) => ({ id: r.id, title: r.title || "Sem título", icon: r.icon, date: r.updatedAt.toISOString(), meta: `editada em ${shortDate(r.updatedAt)}` }));
    },
    async search(teamId, q, limit, exclude) {
      const rows = await db
        .select({ id: documents.id, title: documents.title, icon: documents.icon, updatedAt: documents.updatedAt })
        .from(documents)
        .where(and(eq(documents.teamId, teamId), isNull(documents.deletedAt), like(documents.title, q), notIn(documents.id, exclude)))
        .orderBy(desc(documents.updatedAt))
        .limit(limit);
      return rows.map((r) => ({ id: r.id, title: r.title || "Sem título", icon: r.icon, date: r.updatedAt.toISOString(), meta: null }));
    },
    async suggest(teamId, { range }, limit, exclude) {
      if (!range) return [];
      const rows = await db
        .select({ id: documents.id, title: documents.title, icon: documents.icon, createdAt: documents.createdAt })
        .from(documents)
        .where(
          and(
            eq(documents.teamId, teamId),
            isNull(documents.deletedAt),
            // Só páginas "de topo": subpáginas vão junto ao abrir a página-mãe.
            isNull(documents.parentId),
            inRange(documents.createdAt, range),
            notIn(documents.id, exclude),
          ),
        )
        .orderBy(desc(documents.createdAt))
        .limit(limit);
      return rows.map((r) => ({ id: r.id, title: r.title || "Sem título", icon: r.icon, date: r.createdAt.toISOString(), meta: null, reason: `criada em ${shortDate(r.createdAt)}` }));
    },
  },

  labtest: {
    async byIds(teamId, ids) {
      const rows = await db
        .select({ id: tests.id, title: tests.name, updatedAt: tests.updatedAt, runs: testsMeta })
        .from(tests)
        .where(and(inArray(tests.id, ids), eq(tests.teamId, teamId)));
      return rows.map((r) => ({ id: r.id, title: r.title || "Sem título", icon: null, date: r.updatedAt.toISOString(), meta: plural(r.runs, "rodada", "rodadas") }));
    },
    async search(teamId, q, limit, exclude) {
      const rows = await db
        .select({ id: tests.id, title: tests.name, updatedAt: tests.updatedAt, runs: testsMeta })
        .from(tests)
        .where(and(eq(tests.teamId, teamId), like(tests.name, q), notIn(tests.id, exclude)))
        .orderBy(desc(tests.updatedAt))
        .limit(limit);
      return rows.map((r) => ({ id: r.id, title: r.title || "Sem título", icon: null, date: r.updatedAt.toISOString(), meta: plural(r.runs, "rodada", "rodadas") }));
    },
    async suggest(teamId, { range, seasonKey, league }, limit, exclude) {
      const bySeason = seasonKey ? sql`lower(${tests.season}) = ${seasonKey}` : undefined;
      // Do período: criado nele, ou com rodadas lançadas nele (teste antigo usado no ano).
      const byRange = range
        ? or(
            inRange(tests.createdAt, range),
            sql`exists (select 1 from ${testExecutions} e where e.test_id = "tests"."id" and (e.created_at at time zone ${TZ})::date between ${range.start}::date and ${range.end}::date)`,
          )
        : undefined;
      if (!bySeason && !byRange) return [];
      // OBR: rodadas do Resgate e calibrações OBR primeiro (dentro do período).
      const isObr = sql<boolean>`(${tests.config}->>'edition' = 'obr-resgate' or ${tests.config}->>'tipo' = 'obr')`;
      const rows = await db
        .select({ id: tests.id, title: tests.name, season: tests.season, createdAt: tests.createdAt, runs: testsMeta, obr: isObr })
        .from(tests)
        .where(and(eq(tests.teamId, teamId), or(bySeason, byRange), league === "obr" ? isObr : undefined, notIn(tests.id, exclude)))
        .orderBy(desc(tests.createdAt))
        .limit(limit);
      return rows.map((r) => ({
        id: r.id,
        title: r.title || "Sem título",
        icon: null,
        date: r.createdAt.toISOString(),
        meta: plural(r.runs, "rodada", "rodadas"),
        reason:
          seasonKey && r.season?.toLowerCase() === seasonKey
            ? "mesma temporada"
            : r.obr
              ? "OBR no período"
              : range && todayInBrazil(r.createdAt) >= range.start && todayInBrazil(r.createdAt) <= range.end
                ? `criado em ${shortDate(r.createdAt)}`
                : "rodadas no período",
      }));
    },
  },

  quickbrick: {
    async byIds(teamId, ids) {
      const rows = await db
        .select({ id: quickbrickNotebooks.id, title: quickbrickNotebooks.name, robot: quickbrickNotebooks.robotName, updatedAt: quickbrickNotebooks.updatedAt, photos: photosMeta })
        .from(quickbrickNotebooks)
        .where(and(inArray(quickbrickNotebooks.id, ids), eq(quickbrickNotebooks.teamId, teamId)));
      return rows.map((r) => ({
        id: r.id,
        title: r.title || "Sem título",
        icon: null,
        date: r.updatedAt.toISOString(),
        meta: [r.robot, plural(r.photos, "foto", "fotos")].filter(Boolean).join(" · "),
      }));
    },
    async search(teamId, q, limit, exclude) {
      const rows = await db
        .select({ id: quickbrickNotebooks.id, title: quickbrickNotebooks.name, robot: quickbrickNotebooks.robotName, updatedAt: quickbrickNotebooks.updatedAt })
        .from(quickbrickNotebooks)
        .where(and(eq(quickbrickNotebooks.teamId, teamId), like(quickbrickNotebooks.name, q), notIn(quickbrickNotebooks.id, exclude)))
        .orderBy(desc(quickbrickNotebooks.updatedAt))
        .limit(limit);
      return rows.map((r) => ({ id: r.id, title: r.title || "Sem título", icon: null, date: r.updatedAt.toISOString(), meta: r.robot }));
    },
    async suggest(teamId, { range, seasonKey }, limit, exclude) {
      const bySeason = seasonKey ? sql`lower(${quickbrickNotebooks.season}) = ${seasonKey}` : undefined;
      const byRange = range ? inRange(quickbrickNotebooks.createdAt, range) : undefined;
      if (!bySeason && !byRange) return [];
      const rows = await db
        .select({ id: quickbrickNotebooks.id, title: quickbrickNotebooks.name, robot: quickbrickNotebooks.robotName, season: quickbrickNotebooks.season, createdAt: quickbrickNotebooks.createdAt })
        .from(quickbrickNotebooks)
        .where(and(eq(quickbrickNotebooks.teamId, teamId), or(bySeason, byRange), notIn(quickbrickNotebooks.id, exclude)))
        .orderBy(desc(quickbrickNotebooks.createdAt))
        .limit(limit);
      return rows.map((r) => ({
        id: r.id,
        title: r.title || "Sem título",
        icon: null,
        date: r.createdAt.toISOString(),
        meta: r.robot,
        reason: seasonKey && r.season?.toLowerCase() === seasonKey ? "mesma temporada" : `criado em ${shortDate(r.createdAt)}`,
      }));
    },
  },

  thinklab: {
    async byIds(teamId, ids) {
      const rows = await db
        .select({ id: thinklab.id, title: thinklab.name, updatedAt: thinklab.updatedAt })
        .from(thinklab)
        .where(and(inArray(thinklab.id, ids), eq(thinklab.teamId, teamId)));
      return rows.map((r) => ({ id: r.id, title: r.title || "Sem título", icon: null, date: r.updatedAt.toISOString(), meta: `editado em ${shortDate(r.updatedAt)}` }));
    },
    async search(teamId, q, limit, exclude) {
      const rows = await db
        .select({ id: thinklab.id, title: thinklab.name, updatedAt: thinklab.updatedAt })
        .from(thinklab)
        .where(and(eq(thinklab.teamId, teamId), like(thinklab.name, q), notIn(thinklab.id, exclude)))
        .orderBy(desc(thinklab.updatedAt))
        .limit(limit);
      return rows.map((r) => ({ id: r.id, title: r.title || "Sem título", icon: null, date: r.updatedAt.toISOString(), meta: null }));
    },
    async suggest(teamId, { range }, limit, exclude) {
      if (!range) return [];
      const rows = await db
        .select({ id: thinklab.id, title: thinklab.name, createdAt: thinklab.createdAt })
        .from(thinklab)
        .where(and(eq(thinklab.teamId, teamId), inRange(thinklab.createdAt, range), notIn(thinklab.id, exclude)))
        .orderBy(desc(thinklab.createdAt))
        .limit(limit);
      return rows.map((r) => ({ id: r.id, title: r.title || "Sem título", icon: null, date: r.createdAt.toISOString(), meta: null, reason: `criado em ${shortDate(r.createdAt)}` }));
    },
  },

  journal: {
    async byIds(teamId, ids) {
      const rows = await db
        .select({ id: journalEntries.id, title: journalEntries.title, entryDate: journalEntries.entryDate, author: users.name })
        .from(journalEntries)
        .leftJoin(users, eq(users.id, journalEntries.authorId))
        .where(and(inArray(journalEntries.id, ids), eq(journalEntries.teamId, teamId)));
      return rows.map((r) => ({
        id: r.id,
        title: r.title || `Diário de ${formatJournalDate(r.entryDate, "weekday")}`,
        icon: null,
        date: `${r.entryDate}T12:00:00.000Z`,
        meta: [formatJournalDate(r.entryDate, "short"), r.author].filter(Boolean).join(" · "),
      }));
    },
    async search(teamId, q, limit, exclude) {
      const rows = await db
        .select({ id: journalEntries.id, title: journalEntries.title, entryDate: journalEntries.entryDate, author: users.name })
        .from(journalEntries)
        .leftJoin(users, eq(users.id, journalEntries.authorId))
        .where(
          and(
            eq(journalEntries.teamId, teamId),
            q ? or(like(journalEntries.title, q), like(journalEntries.searchText, q)) : undefined,
            notIn(journalEntries.id, exclude),
          ),
        )
        .orderBy(desc(journalEntries.entryDate), desc(journalEntries.createdAt))
        .limit(limit);
      return rows.map((r) => ({
        id: r.id,
        title: r.title || `Diário de ${formatJournalDate(r.entryDate, "weekday")}`,
        icon: null,
        date: `${r.entryDate}T12:00:00.000Z`,
        meta: r.author,
      }));
    },
    async suggest(teamId, { range }, limit, exclude) {
      if (!range) return [];
      const rows = await db
        .select({ id: journalEntries.id, title: journalEntries.title, entryDate: journalEntries.entryDate, author: users.name })
        .from(journalEntries)
        .leftJoin(users, eq(users.id, journalEntries.authorId))
        .where(
          and(
            eq(journalEntries.teamId, teamId),
            gte(journalEntries.entryDate, range.start),
            lte(journalEntries.entryDate, range.end),
            notIn(journalEntries.id, exclude),
          ),
        )
        .orderBy(desc(journalEntries.entryDate), desc(journalEntries.createdAt))
        .limit(limit);
      return rows.map((r) => ({
        id: r.id,
        title: r.title || `Diário de ${formatJournalDate(r.entryDate, "weekday")}`,
        icon: null,
        date: `${r.entryDate}T12:00:00.000Z`,
        meta: r.author,
        reason: formatJournalDate(r.entryDate, "short"),
      }));
    },
  },

  folder: {
    async byIds(teamId, ids) {
      const rows = await db
        .select({ id: folders.id, title: folders.name, icon: folders.icon, updatedAt: folders.updatedAt, pages: folderPages })
        .from(folders)
        .where(and(inArray(folders.id, ids), eq(folders.teamId, teamId)));
      return rows.map((r) => ({ id: r.id, title: r.title || "Pasta", icon: r.icon, date: r.updatedAt.toISOString(), meta: plural(r.pages, "página", "páginas") }));
    },
    async search(teamId, q, limit, exclude) {
      const rows = await db
        .select({ id: folders.id, title: folders.name, icon: folders.icon, updatedAt: folders.updatedAt, pages: folderPages })
        .from(folders)
        .where(and(eq(folders.teamId, teamId), like(folders.name, q), notIn(folders.id, exclude)))
        .orderBy(desc(folders.updatedAt))
        .limit(limit);
      return rows.map((r) => ({ id: r.id, title: r.title || "Pasta", icon: r.icon, date: r.updatedAt.toISOString(), meta: plural(r.pages, "página", "páginas") }));
    },
    async suggest(teamId, { range }, limit, exclude) {
      if (!range) return [];
      const rows = await db
        .select({ id: folders.id, title: folders.name, icon: folders.icon, createdAt: folders.createdAt })
        .from(folders)
        .where(and(eq(folders.teamId, teamId), isNull(folders.parentId), inRange(folders.createdAt, range), notIn(folders.id, exclude)))
        .orderBy(desc(folders.createdAt))
        .limit(limit);
      return rows.map((r) => ({ id: r.id, title: r.title || "Pasta", icon: r.icon, date: r.createdAt.toISOString(), meta: null, reason: `criada em ${shortDate(r.createdAt)}` }));
    },
  },

  kanban: {
    async byIds(teamId, ids) {
      const rows = await db
        .select({ id: boards.id, title: boards.name, icon: boards.icon, updatedAt: boards.updatedAt, cards: boardCardCount })
        .from(boards)
        .where(and(inArray(boards.id, ids), eq(boards.teamId, teamId)));
      return rows.map((r) => ({ id: r.id, title: r.title || "Kanban", icon: null, date: r.updatedAt.toISOString(), meta: plural(r.cards, "card", "cards") }));
    },
    async search(teamId, q, limit, exclude) {
      const rows = await db
        .select({ id: boards.id, title: boards.name, updatedAt: boards.updatedAt, cards: boardCardCount })
        .from(boards)
        .where(and(eq(boards.teamId, teamId), like(boards.name, q), notIn(boards.id, exclude)))
        .orderBy(desc(boards.updatedAt))
        .limit(limit);
      return rows.map((r) => ({ id: r.id, title: r.title || "Kanban", icon: null, date: r.updatedAt.toISOString(), meta: plural(r.cards, "card", "cards") }));
    },
    async suggest(teamId, { range }, limit, exclude) {
      if (!range) return [];
      const rows = await db
        .select({ id: boards.id, title: boards.name, createdAt: boards.createdAt })
        .from(boards)
        .where(and(eq(boards.teamId, teamId), inRange(boards.createdAt, range), notIn(boards.id, exclude)))
        .orderBy(desc(boards.createdAt))
        .limit(limit);
      return rows.map((r) => ({ id: r.id, title: r.title || "Kanban", icon: null, date: r.createdAt.toISOString(), meta: null, reason: `criado em ${shortDate(r.createdAt)}` }));
    },
  },

  session: {
    async byIds(teamId, ids) {
      const rows = await db
        .select({ id: trainingSessions.id, title: trainingSessions.title, kind: trainingSessions.kind, at: sessionDate })
        .from(trainingSessions)
        .where(and(inArray(trainingSessions.id, ids), eq(trainingSessions.teamId, teamId)));
      return rows.map((r) => ({ id: r.id, title: r.title, icon: null, date: r.at.toISOString(), meta: `${sessionKindLabel(r.kind)} · ${shortDate(r.at)}` }));
    },
    async search(teamId, q, limit, exclude) {
      const rows = await db
        .select({ id: trainingSessions.id, title: trainingSessions.title, kind: trainingSessions.kind, at: sessionDate })
        .from(trainingSessions)
        .where(and(eq(trainingSessions.teamId, teamId), like(trainingSessions.title, q), notIn(trainingSessions.id, exclude)))
        .orderBy(desc(sessionDate))
        .limit(limit);
      return rows.map((r) => ({ id: r.id, title: r.title, icon: null, date: r.at.toISOString(), meta: `${sessionKindLabel(r.kind)} · ${shortDate(r.at)}` }));
    },
    async suggest(teamId, { range }, limit, exclude) {
      if (!range) return [];
      // Só o que aconteceu: competições e simulados primeiro, depois treinos.
      const rows = await db
        .select({ id: trainingSessions.id, title: trainingSessions.title, kind: trainingSessions.kind, at: sessionDate })
        .from(trainingSessions)
        .where(
          and(
            eq(trainingSessions.teamId, teamId),
            isNotNull(trainingSessions.startedAt),
            inRange(trainingSessions.startedAt, range),
            notIn(trainingSessions.id, exclude),
          ),
        )
        .orderBy(sql`case ${trainingSessions.kind} when 'competicao' then 0 when 'simulado' then 1 else 2 end`, desc(trainingSessions.startedAt))
        .limit(limit);
      return rows.map((r) => ({ id: r.id, title: r.title, icon: null, date: r.at.toISOString(), meta: null, reason: `${sessionKindLabel(r.kind)} · ${shortDate(r.at)}` }));
    },
  },

  milestone: {
    async byIds(teamId, ids) {
      const rows = await db
        .select({ id: milestones.id, title: milestones.name, dueAt: milestones.dueAt, completedAt: milestones.completedAt, updatedAt: milestones.updatedAt })
        .from(milestones)
        .where(and(inArray(milestones.id, ids), eq(milestones.teamId, teamId)));
      return rows.map((r) => ({ id: r.id, title: r.title, icon: null, date: r.updatedAt.toISOString(), meta: milestoneMeta(r) }));
    },
    async search(teamId, q, limit, exclude) {
      const rows = await db
        .select({ id: milestones.id, title: milestones.name, dueAt: milestones.dueAt, completedAt: milestones.completedAt, updatedAt: milestones.updatedAt })
        .from(milestones)
        .where(and(eq(milestones.teamId, teamId), like(milestones.name, q), notIn(milestones.id, exclude)))
        .orderBy(desc(milestones.updatedAt))
        .limit(limit);
      return rows.map((r) => ({ id: r.id, title: r.title, icon: null, date: r.updatedAt.toISOString(), meta: milestoneMeta(r) }));
    },
    async suggest(teamId, { range }, limit, exclude) {
      if (!range) return [];
      const rows = await db
        .select({ id: milestones.id, title: milestones.name, dueAt: milestones.dueAt, completedAt: milestones.completedAt, updatedAt: milestones.updatedAt })
        .from(milestones)
        .where(and(eq(milestones.teamId, teamId), or(inRange(milestones.completedAt, range), inRange(milestones.dueAt, range)), notIn(milestones.id, exclude)))
        .orderBy(desc(sql`coalesce(${milestones.completedAt}, ${milestones.dueAt})`))
        .limit(limit);
      return rows.map((r) => ({ id: r.id, title: r.title, icon: null, date: r.updatedAt.toISOString(), meta: null, reason: milestoneMeta(r) ?? "meta do período" }));
    },
  },
};

export const legacySource = (kind: LegacyItemKind) => SOURCES[kind];

// ---------------------------------------------------------------------------
// Itens guardados
// ---------------------------------------------------------------------------

/** Coluna preenchida de um vínculo → (tipo, id do recurso). */
export function legacyItemTarget(row: typeof teamLegacyItems.$inferSelect): { kind: LegacyItemKind; id: string } | null {
  if (row.documentId) return { kind: "stagebook", id: row.documentId };
  if (row.testId) return { kind: "labtest", id: row.testId };
  if (row.quickbrickId) return { kind: "quickbrick", id: row.quickbrickId };
  if (row.thinklabId) return { kind: "thinklab", id: row.thinklabId };
  if (row.journalId) return { kind: "journal", id: row.journalId };
  if (row.boardId) return { kind: "kanban", id: row.boardId };
  if (row.folderId) return { kind: "folder", id: row.folderId };
  if (row.sessionId) return { kind: "session", id: row.sessionId };
  if (row.milestoneId) return { kind: "milestone", id: row.milestoneId };
  return null;
}

/** Valores de INSERT para guardar um recurso numa aba. */
export function legacyItemValues(kind: LegacyItemKind, resourceId: string) {
  return {
    documentId: kind === "stagebook" ? resourceId : null,
    testId: kind === "labtest" ? resourceId : null,
    quickbrickId: kind === "quickbrick" ? resourceId : null,
    thinklabId: kind === "thinklab" ? resourceId : null,
    journalId: kind === "journal" ? resourceId : null,
    boardId: kind === "kanban" ? resourceId : null,
    folderId: kind === "folder" ? resourceId : null,
    sessionId: kind === "session" ? resourceId : null,
    milestoneId: kind === "milestone" ? resourceId : null,
  };
}

/** Itens das abas, com os dados vivos (itens na lixeira ficam de fora). */
export async function legacyItemsFor(teamId: string, chapterIds: string[]): Promise<Map<string, LegacyItemDTO[]>> {
  const out = new Map<string, LegacyItemDTO[]>(chapterIds.map((id) => [id, []]));
  if (!chapterIds.length) return out;
  const links = await db
    .select()
    .from(teamLegacyItems)
    .where(inArray(teamLegacyItems.chapterId, chapterIds))
    .orderBy(asc(teamLegacyItems.position), asc(teamLegacyItems.createdAt));

  const byKind = new Map<LegacyItemKind, Set<string>>();
  for (const link of links) {
    const t = legacyItemTarget(link);
    if (t) byKind.set(t.kind, (byKind.get(t.kind) ?? new Set()).add(t.id));
  }
  const found = new Map<string, ItemRow>();
  await Promise.all(
    [...byKind.entries()].map(async ([kind, ids]) => {
      for (const row of await SOURCES[kind].byIds(teamId, [...ids])) found.set(`${kind}:${row.id}`, row);
    }),
  );

  for (const link of links) {
    const t = legacyItemTarget(link);
    const row = t && found.get(`${t.kind}:${t.id}`);
    if (!t || !row) continue;
    out.get(link.chapterId)?.push({
      id: link.id,
      kind: t.kind,
      resourceId: t.id,
      title: row.title,
      icon: row.icon,
      href: legacyItemHref(t.kind, t.id, teamId),
      meta: row.meta,
      note: link.note,
      updatedAt: row.date,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Números do período
// ---------------------------------------------------------------------------

export async function legacyStats(teamId: string, range: Range): Promise<LegacyStats> {
  const start = sql`${range.start}::date`;
  const end = sql`${range.end}::date`;
  const [[runs], [best], [journal], [sessions], [goals]] = await Promise.all([
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(testExecutions)
      .innerJoin(tests, eq(tests.id, testExecutions.testId))
      .where(and(eq(tests.teamId, teamId), gte(localDay(testExecutions.createdAt), start), lte(localDay(testExecutions.createdAt), end))),
    // O feed guarda a pontuação das rodadas pontuadas (`bestScore`): é a fonte barata do "melhor do período".
    db
      .select({ best: sql<number | null>`max(nullif(${teamActivity.data}->>'bestScore', '')::numeric)::float8` })
      .from(teamActivity)
      .where(
        and(
          eq(teamActivity.teamId, teamId),
          inArray(teamActivity.verb, ["test.executed", "test.record"]),
          gte(localDay(teamActivity.updatedAt), start),
          lte(localDay(teamActivity.updatedAt), end),
        ),
      ),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(journalEntries)
      .where(and(eq(journalEntries.teamId, teamId), gte(journalEntries.entryDate, range.start), lte(journalEntries.entryDate, range.end))),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(trainingSessions)
      .where(
        and(
          eq(trainingSessions.teamId, teamId),
          isNotNull(trainingSessions.startedAt),
          gte(localDay(trainingSessions.startedAt), start),
          lte(localDay(trainingSessions.startedAt), end),
        ),
      ),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(milestones)
      .where(and(eq(milestones.teamId, teamId), isNotNull(milestones.completedAt), gte(localDay(milestones.completedAt), start), lte(localDay(milestones.completedAt), end))),
  ]);
  return {
    executions: runs?.n ?? 0,
    bestScore: best?.best ?? null,
    journalEntries: journal?.n ?? 0,
    trainingSessions: sessions?.n ?? 0,
    milestonesCompleted: goals?.n ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Legado completo de uma equipe
// ---------------------------------------------------------------------------

export async function getTeamLegacy(teamId: string, today = todayInBrazil()): Promise<LegacyChapterDTO[]> {
  const rows = await db.select().from(teamLegacyChapters).where(eq(teamLegacyChapters.teamId, teamId));
  if (!rows.length) return [];

  const ids = rows.map((r) => r.id);
  const memberIds = [...new Set(rows.flatMap((r) => normalizeLegacyContent(r.content).members ?? []))];
  const [items, people, current, stats] = await Promise.all([
    legacyItemsFor(teamId, ids),
    memberIds.length
      ? db.select({ id: users.id, name: users.name, avatarUrl: users.avatarUrl }).from(users).where(inArray(users.id, memberIds))
      : Promise.resolve([]),
    db.select({ userId: teamMembers.userId }).from(teamMembers).where(eq(teamMembers.teamId, teamId)),
    Promise.all(rows.map(async (r) => [r.id, await statsFor(teamId, r, today)] as const)),
  ]);
  const peopleById = new Map(people.map((p) => [p.id, p]));
  const currentIds = new Set(current.map((c) => c.userId));
  const statsById = new Map(stats);

  return rows
    .map((r): LegacyChapterDTO => {
      const content = normalizeLegacyContent(r.content);
      const members: LegacyMemberDTO[] = (content.members ?? []).flatMap((id) => {
        const p = peopleById.get(id);
        return p ? [{ id, name: p.name, avatarUrl: p.avatarUrl, current: currentIds.has(id) }] : [];
      });
      return {
        id: r.id,
        kind: r.kind as LegacyChapterKind,
        parentId: r.parentId,
        title: r.title,
        seasonKey: r.seasonKey,
        league: chapterLeague(r, rows),
        stage: (r.stage as LegacyStage | null) ?? null,
        startDate: r.startDate,
        endDate: r.endDate,
        location: r.location,
        color: r.color,
        content,
        createdBy: r.createdBy,
        updatedAt: r.updatedAt.toISOString(),
        items: items.get(r.id) ?? [],
        stats: statsById.get(r.id) ?? null,
        members,
      };
    })
    .sort(compareChapters);
}

/** Liga da aba: a própria, a da temporada-mãe, ou a do preset da temporada. */
export function chapterLeague(
  chapter: { league: string | null; parentId: string | null; seasonKey: string | null },
  all: { id: string; league: string | null; seasonKey: string | null }[] = [],
): LegacyLeague | null {
  const own = chapter.league ?? seasonPreset(chapter.seasonKey)?.league ?? null;
  if (own) return own as LegacyLeague;
  const parent = chapter.parentId ? all.find((c) => c.id === chapter.parentId) : null;
  return parent ? ((parent.league ?? seasonPreset(parent.seasonKey)?.league ?? null) as LegacyLeague | null) : null;
}

async function statsFor(teamId: string, chapter: { kind: string; startDate: string | null; endDate: string | null }, today: string) {
  const range = chapterRange(chapter, today);
  return range ? legacyStats(teamId, range) : null;
}

/** Sugestões de itens para uma aba (o que ainda não está nela). */
export async function legacySuggestions(
  teamId: string,
  chapter: { id: string; kind: string; startDate: string | null; endDate: string | null; seasonKey: string | null; league: LegacyLeague | null },
  perKind = 12,
): Promise<LegacyCandidateDTO[]> {
  const range = chapterRange(chapter);
  // Só temporadas FLL/FTC batem com `tests.season`; a OBR vai pelo período.
  const preset = seasonPreset(chapter.seasonKey);
  const seasonKey = preset && preset.league !== "obr" ? preset.key : null;
  if (!range && !seasonKey) return [];
  const existing = await db.select().from(teamLegacyItems).where(eq(teamLegacyItems.chapterId, chapter.id));
  const exclude = (kind: LegacyItemKind) => existing.flatMap((l) => (legacyItemTarget(l)?.kind === kind ? [legacyItemTarget(l)!.id] : []));

  const kinds = Object.keys(SOURCES) as LegacyItemKind[];
  const lists = await Promise.all(
    kinds.map(async (kind) =>
      (await SOURCES[kind].suggest(teamId, { range, seasonKey, league: chapter.league }, perKind, exclude(kind))).map(
        (row): LegacyCandidateDTO => ({ kind, id: row.id, title: row.title, icon: row.icon, href: legacyItemHref(kind, row.id, teamId), reason: row.reason, date: row.date }),
      ),
    ),
  );
  return lists.flat();
}
