import "server-only";

import { and, asc, desc, eq, gte, ilike, inArray, lt, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db/client";
import { journalEntries, journalEntryLinks, journalTemplates, teamMembers, teams, users } from "@/db/schema";
import {
  BUILTIN_JOURNAL_TEMPLATES,
  JOURNAL_TEMPLATE_ICONS,
  addDays,
  isIsoDate,
  journalExcerpt,
  journalStats,
  normalizeJournalContent,
  type JournalAuthor,
  type JournalEntryDetail,
  type JournalEntryListItem,
  type JournalLink,
  type JournalLinkKind,
  type JournalScopeInfo,
  type JournalTemplate,
  type JournalTemplateIcon,
} from "@/features/stagebook/types/journal";
import { scopeWhere } from "./permissions";
import { milestonesForResources, tagsForResources } from "./labels-core";
import { workspaceItemsByIds } from "./pins-core";
import type { StagebookScope } from "./scope";
import { canDeleteResource } from "./team-permissions";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

/** "2026-11" válido, ou null. */
export function parseJournalMonth(value: unknown): string | null {
  return typeof value === "string" && MONTH_RE.test(value) ? value : null;
}

/** [primeiro dia do mês, primeiro dia do mês seguinte). */
export function monthRange(month: string): [string, string] {
  const [y, m] = month.split("-").map(Number);
  const start = `${month}-01`;
  const next = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
  return [start, next];
}

const entryScope = (scope: StagebookScope) =>
  scopeWhere(scope, { userId: journalEntries.userId, teamId: journalEntries.teamId });

const templateScope = (scope: StagebookScope) =>
  scopeWhere(scope, { userId: journalTemplates.userId, teamId: journalTemplates.teamId });

/** Quem é o espaço atual (e os membros, para o filtro por pessoa). */
export async function getJournalScopeInfo(scope: StagebookScope): Promise<JournalScopeInfo> {
  if (scope.type === "personal") return { type: "personal" };
  const [team, members] = await Promise.all([
    db.select({ name: teams.name }).from(teams).where(eq(teams.id, scope.teamId)).limit(1),
    db
      .select({ id: users.id, name: users.name, avatarUrl: users.avatarUrl })
      .from(teamMembers)
      .innerJoin(users, eq(users.id, teamMembers.userId))
      .where(eq(teamMembers.teamId, scope.teamId))
      .orderBy(asc(users.name)),
  ]);
  return { type: "team", teamId: scope.teamId, teamName: team[0]?.name ?? "Equipe", members };
}

const listColumns = {
  id: journalEntries.id,
  entryDate: journalEntries.entryDate,
  title: journalEntries.title,
  templateKey: journalEntries.templateKey,
  content: journalEntries.content,
  updatedAt: journalEntries.updatedAt,
  authorId: journalEntries.authorId,
  authorName: users.name,
  authorAvatar: users.avatarUrl,
};

type ListRow = {
  id: string;
  entryDate: string;
  title: string | null;
  templateKey: string | null;
  content: unknown;
  updatedAt: Date;
  authorId: string;
  authorName: string | null;
  authorAvatar: string | null;
};

type Labels = Pick<JournalEntryListItem, "tags" | "milestone" | "linkCount">;

function toListItem(row: ListRow, viewerId: string, labels: Labels): JournalEntryListItem {
  const content = normalizeJournalContent(row.content);
  return {
    ...labels,
    id: row.id,
    entryDate: row.entryDate,
    title: row.title,
    templateKey: row.templateKey,
    excerpt: journalExcerpt(content),
    stats: journalStats(content),
    author: { id: row.authorId, name: row.authorName, avatarUrl: row.authorAvatar },
    isMine: row.authorId === viewerId,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Entradas do espaço atual: de um mês (`month`); com `q`, a busca no texto de
 * todas as datas; com `milestoneId`, todas as entradas daquele marco (meta).
 */
export async function listJournalEntries(
  scope: StagebookScope,
  { month, q, milestoneId }: { month: string; q?: string | null; milestoneId?: string | null },
): Promise<JournalEntryListItem[]> {
  const term = q?.trim().slice(0, 80);
  let where: SQL | undefined;
  if (milestoneId) {
    where = and(entryScope(scope), eq(journalEntries.milestoneId, milestoneId));
  } else if (term) {
    const like = `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    where = and(entryScope(scope), or(ilike(journalEntries.searchText, like), ilike(journalEntries.title, like)));
  } else {
    const [start, end] = monthRange(month);
    where = and(entryScope(scope), gte(journalEntries.entryDate, start), lt(journalEntries.entryDate, end));
  }

  const rows = await db
    .select(listColumns)
    .from(journalEntries)
    .innerJoin(users, eq(users.id, journalEntries.authorId))
    .where(where)
    .orderBy(desc(journalEntries.entryDate), desc(journalEntries.createdAt))
    .limit(term || milestoneId ? 200 : 500);

  const ids = rows.map((r) => r.id);
  const [tagMap, milestoneMap, linkCounts] = await Promise.all([
    tagsForResources("journal", ids),
    milestonesForResources("journal", ids),
    countLinks(ids),
  ]);
  return rows.map((row) =>
    toListItem(row, scope.userId, {
      tags: tagMap.get(row.id) ?? [],
      milestone: milestoneMap.get(row.id) ?? null,
      linkCount: linkCounts.get(row.id) ?? 0,
    }),
  );
}

async function countLinks(entryIds: string[]): Promise<Map<string, number>> {
  if (!entryIds.length) return new Map();
  const rows = await db
    .select({ entryId: journalEntryLinks.entryId, count: sql<number>`count(*)::int` })
    .from(journalEntryLinks)
    .where(inArray(journalEntryLinks.entryId, entryIds))
    .groupBy(journalEntryLinks.entryId);
  return new Map(rows.map((r) => [r.entryId, r.count]));
}

/** Coluna preenchida de um vínculo → tipo e id do item. */
export function linkTarget(row: {
  documentId: string | null;
  testId: string | null;
  quickbrickId: string | null;
  thinklabId: string | null;
}): { kind: JournalLinkKind; id: string } | null {
  if (row.documentId) return { kind: "stagebook", id: row.documentId };
  if (row.testId) return { kind: "labtest", id: row.testId };
  if (row.quickbrickId) return { kind: "quickbrick", id: row.quickbrickId };
  if (row.thinklabId) return { kind: "thinklab", id: row.thinklabId };
  return null;
}

/** Vínculos de uma entrada, com título e endereço atuais de cada item (na ordem em que foram feitos). */
export async function listJournalLinks(scope: StagebookScope, entryId: string): Promise<JournalLink[]> {
  const rows = await db
    .select({
      linkId: journalEntryLinks.id,
      documentId: journalEntryLinks.documentId,
      testId: journalEntryLinks.testId,
      quickbrickId: journalEntryLinks.quickbrickId,
      thinklabId: journalEntryLinks.thinklabId,
    })
    .from(journalEntryLinks)
    .where(eq(journalEntryLinks.entryId, entryId))
    .orderBy(asc(journalEntryLinks.createdAt));

  const targets = rows.flatMap((r) => {
    const t = linkTarget(r);
    return t ? [{ linkId: r.linkId, ...t }] : [];
  });
  const byKind = new Map<JournalLinkKind, string[]>();
  for (const t of targets) byKind.set(t.kind, [...(byKind.get(t.kind) ?? []), t.id]);
  const items = new Map<string, Awaited<ReturnType<typeof workspaceItemsByIds>>[number]>();
  await Promise.all(
    [...byKind].map(async ([kind, ids]) => {
      for (const item of await workspaceItemsByIds(scope, kind, ids)) items.set(`${kind}:${item.id}`, item);
    }),
  );
  // Item que saiu do espaço (ex.: página na lixeira) simplesmente não aparece.
  return targets.flatMap((t) => {
    const item = items.get(`${t.kind}:${t.id}`);
    return item ? [{ linkId: t.linkId, kind: t.kind, id: item.id, title: item.title, icon: item.icon, href: item.href }] : [];
  });
}

/** Dias (do autor, no espaço atual) com registro nos últimos `days` dias: base da sequência. */
export async function listMyJournalDates(scope: StagebookScope, today: string, days = 400): Promise<string[]> {
  const since = isIsoDate(today) ? addDays(today, -days) : "1970-01-01";
  const rows = await db
    .selectDistinct({ entryDate: journalEntries.entryDate })
    .from(journalEntries)
    .where(and(entryScope(scope), eq(journalEntries.authorId, scope.userId), gte(journalEntries.entryDate, since)))
    .orderBy(desc(journalEntries.entryDate));
  return rows.map((r) => r.entryDate);
}

/** Entrada do autor numa data (o botão "Escrever hoje" abre a existente em vez de duplicar). */
export async function findMyJournalEntryOn(scope: StagebookScope, date: string): Promise<string | null> {
  if (!isIsoDate(date)) return null;
  const [row] = await db
    .select({ id: journalEntries.id })
    .from(journalEntries)
    .where(and(entryScope(scope), eq(journalEntries.authorId, scope.userId), eq(journalEntries.entryDate, date)))
    .orderBy(desc(journalEntries.updatedAt))
    .limit(1);
  return row?.id ?? null;
}

/** Detalhe de uma entrada do espaço atual (null se não existir ou for de outro espaço). */
export async function getJournalEntry(scope: StagebookScope, id: string): Promise<JournalEntryDetail | null> {
  const [row] = await db
    .select({
      id: journalEntries.id,
      entryDate: journalEntries.entryDate,
      title: journalEntries.title,
      templateKey: journalEntries.templateKey,
      content: journalEntries.content,
      createdAt: journalEntries.createdAt,
      updatedAt: journalEntries.updatedAt,
      authorId: journalEntries.authorId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(journalEntries)
    .innerJoin(users, eq(users.id, journalEntries.authorId))
    .where(and(eq(journalEntries.id, id), entryScope(scope)))
    .limit(1);
  if (!row) return null;

  const author: JournalAuthor = { id: row.authorId, name: row.authorName, avatarUrl: row.authorAvatar };
  const isAuthor = row.authorId === scope.userId;
  const [tagMap, milestoneMap, links] = await Promise.all([
    tagsForResources("journal", [row.id]),
    milestonesForResources("journal", [row.id]),
    listJournalLinks(scope, row.id),
  ]);
  return {
    tags: tagMap.get(row.id) ?? [],
    milestone: milestoneMap.get(row.id) ?? null,
    links,
    id: row.id,
    entryDate: row.entryDate,
    title: row.title,
    templateKey: row.templateKey,
    content: normalizeJournalContent(row.content),
    author,
    canEdit: isAuthor,
    canDelete: scope.type === "personal" ? isAuthor : canDeleteResource(scope.role, row.authorId, scope.userId),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const toIcon = (v: string): JournalTemplateIcon =>
  (JOURNAL_TEMPLATE_ICONS as readonly string[]).includes(v) ? (v as JournalTemplateIcon) : "NotebookPen";

/** Templates prontos + os salvos no espaço atual. */
export async function listJournalTemplates(scope: StagebookScope): Promise<JournalTemplate[]> {
  const rows = await db
    .select()
    .from(journalTemplates)
    .where(templateScope(scope))
    .orderBy(asc(journalTemplates.name));

  const saved: JournalTemplate[] = rows.map((row) => ({
    key: row.id,
    name: row.name,
    description: row.description ?? "",
    icon: toIcon(row.icon),
    builtin: false,
    content: normalizeJournalContent(row.content),
    createdBy: row.createdBy,
    canManage: scope.type === "personal" || canDeleteResource(scope.role, row.createdBy, scope.userId),
  }));
  return [...saved, ...BUILTIN_JOURNAL_TEMPLATES];
}
