"use server";

import { and, count, desc, eq, ilike, inArray, ne, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { documents, syncedBlocks, users } from "@/db/schema";
import { quickbrickDiagrams, quickbrickNotebooks, quickbrickPhotos } from "@/db/schema/quickbrick";
import { leagues } from "@/db/schema/leagues";
import { liveDocumentWhere } from "./history-core";
import { resolveStagebookScope, scopeOwnership, type StagebookScope } from "@/utils/stagebook/scope";
import { creatorScopeWhere, scopeWhere } from "@/utils/stagebook/permissions";
import { runAction } from "@/utils/stagebook/action-result";
import { ValidationError, cleanText, requireUuid } from "@/utils/stagebook/validation";
import { lexicalToPlainText } from "@/utils/stagebook/lexical-text";
import {
  collectDecisions,
  findReferenceSnippets,
  likePattern,
  searchSnippet,
  type DecisionData,
  type Snippet,
} from "@/utils/stagebook/page-links";
import { isR2Configured, presignDownload } from "@/utils/quickbrick/r2";

/**
 * Server actions dos blocos novos do editor: blocos sincronizados, ficha do
 * robô (QuickBrick), índice de decisões, backlinks e busca com contexto.
 * Tudo passa pelo scope atual (pessoal / equipe).
 */

const MAX_CONTENT_BYTES = 400_000;
const iso = (d: Date | string | null | undefined) => (d ? new Date(d).toISOString() : null);

function syncedScope(scope: StagebookScope) {
  return scopeWhere(scope, { userId: syncedBlocks.userId, teamId: syncedBlocks.teamId });
}

/** Valida o estado serializado de um editor ({ root: { type: "root", children } }). */
function cleanContent(content: unknown): Record<string, unknown> {
  const root = (content as { root?: { type?: string; children?: unknown } } | null)?.root;
  if (!root || root.type !== "root" || !Array.isArray(root.children)) {
    throw new ValidationError("Conteúdo do bloco inválido.");
  }
  if (JSON.stringify(content).length > MAX_CONTENT_BYTES) {
    throw new ValidationError("O bloco ficou grande demais. Divida em blocos menores.");
  }
  return content as Record<string, unknown>;
}

/** Páginas (vivas, do scope) cujo JSON contém o texto. */
function contentContains(needle: string) {
  return sql`${documents.content}::text like ${likePattern(needle)}`;
}

/** Algum nó do conteúdo tem `field` igual a `value` (busca em qualquer nível). */
function contentHasNode(field: "type" | "kind" | "syncId", value: string) {
  return sql`jsonb_path_exists(${documents.content}, ${`$.** ? (@.${field} == $v)`}::jsonpath, jsonb_build_object('v', ${value}::text))`;
}

// ---------------------------------------------------------------------------
// Blocos sincronizados
// ---------------------------------------------------------------------------

export type SyncedBlockData = {
  id: string;
  title: string;
  content: Record<string, unknown> | null;
  updatedAt: string;
  updatedByName: string | null;
};

export type SyncedBlockListItem = {
  id: string;
  title: string;
  updatedAt: string;
  preview: string;
  usage: number;
};

export async function createSyncedBlock(title: string, content: unknown) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const [row] = await db
      .insert(syncedBlocks)
      .values({
        ...scopeOwnership(scope),
        title: cleanText(title, { maxLength: 120 }) || "Bloco sincronizado",
        content: cleanContent(content),
        createdBy: scope.userId,
        updatedBy: scope.userId,
      })
      .returning({ id: syncedBlocks.id, updatedAt: syncedBlocks.updatedAt });
    return { id: row.id, updatedAt: iso(row.updatedAt)! };
  });
}

async function loadSyncedBlock(id: string): Promise<SyncedBlockData> {
  requireUuid(id, "bloco");
  const scope = await resolveStagebookScope();
  const [row] = await db
    .select({
      id: syncedBlocks.id,
      title: syncedBlocks.title,
      content: syncedBlocks.content,
      updatedAt: syncedBlocks.updatedAt,
      updatedByName: users.name,
    })
    .from(syncedBlocks)
    .leftJoin(users, eq(users.id, syncedBlocks.updatedBy))
    .where(and(eq(syncedBlocks.id, id), syncedScope(scope)))
    .limit(1);
  if (!row) throw new ValidationError("Bloco sincronizado não encontrado.");
  return { ...row, updatedAt: iso(row.updatedAt)! };
}

export async function getSyncedBlock(id: string) {
  return runAction(() => loadSyncedBlock(id));
}

export async function updateSyncedBlock(id: string, patch: { title?: string; content?: unknown }) {
  return runAction(async () => {
    requireUuid(id, "bloco");
    const scope = await resolveStagebookScope();
    const values: Partial<typeof syncedBlocks.$inferInsert> = { updatedBy: scope.userId, updatedAt: new Date() };
    if (patch.title !== undefined) values.title = cleanText(patch.title, { maxLength: 120 }) || "Bloco sincronizado";
    if (patch.content !== undefined) values.content = cleanContent(patch.content);
    const [row] = await db
      .update(syncedBlocks)
      .set(values)
      .where(and(eq(syncedBlocks.id, id), syncedScope(scope)))
      .returning({ updatedAt: syncedBlocks.updatedAt });
    if (!row) throw new ValidationError("Bloco sincronizado não encontrado.");
    return { updatedAt: iso(row.updatedAt)! };
  });
}

async function loadSyncedBlockList(scope: StagebookScope): Promise<SyncedBlockListItem[]> {
  const rows = await db
    .select({ id: syncedBlocks.id, title: syncedBlocks.title, content: syncedBlocks.content, updatedAt: syncedBlocks.updatedAt })
    .from(syncedBlocks)
    .where(syncedScope(scope))
    .orderBy(desc(syncedBlocks.updatedAt))
    .limit(200);
  if (rows.length === 0) return [];

  // Uso = páginas vivas que têm o id no conteúdo.
  const pages = await db
    .select({ content: documents.content })
    .from(documents)
    .where(and(liveDocumentWhere(scope), contentHasNode("type", "synced-block")));
  const text = pages.map((p) => JSON.stringify(p.content ?? ""));
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    updatedAt: iso(r.updatedAt)!,
    preview: lexicalToPlainText(r.content, 140),
    usage: text.filter((t) => t.includes(`"syncId":"${r.id}"`)).length,
  }));
}

/** Biblioteca de blocos do espaço (para inserir em outra página). */
export async function listSyncedBlocks() {
  return runAction(async (): Promise<SyncedBlockListItem[]> => {
    const scope = await resolveStagebookScope();
    return loadSyncedBlockList(scope);
  });
}

/** Páginas que usam o bloco. */
export async function getSyncedBlockUsage(id: string) {
  return runAction(async () => {
    requireUuid(id, "bloco");
    const scope = await resolveStagebookScope();
    return db
      .select({ id: documents.id, title: documents.title, icon: documents.icon })
      .from(documents)
      .where(and(liveDocumentWhere(scope), contentHasNode("syncId", id)))
      .orderBy(desc(documents.updatedAt))
      .limit(50);
  });
}

/** Conteúdo de vários blocos (exportação em PDF/HTML/Markdown). */
export async function getSyncedBlocksForExport(ids: string[]) {
  return runAction(async () => {
    const clean = ids.filter((id) => /^[0-9a-f-]{36}$/i.test(id)).slice(0, 100);
    if (clean.length === 0) return {} as Record<string, { title: string; content: Record<string, unknown> | null }>;
    const scope = await resolveStagebookScope();
    const rows = await db
      .select({ id: syncedBlocks.id, title: syncedBlocks.title, content: syncedBlocks.content })
      .from(syncedBlocks)
      .where(and(inArray(syncedBlocks.id, clean), syncedScope(scope)));
    return Object.fromEntries(rows.map((r) => [r.id, { title: r.title, content: r.content }]));
  });
}

// ---------------------------------------------------------------------------
// Ficha do robô (QuickBrick)
// ---------------------------------------------------------------------------

export type RobotNotebookItem = { id: string; name: string; robotName: string | null; season: string | null };

export type RobotSheetData = {
  id: string;
  name: string;
  robotName: string | null;
  description: string | null;
  season: string | null;
  league: string | null;
  coverColor: string | null;
  photoUrl: string | null;
  photoTitle: string | null;
  photoTakenAt: string | null;
  versions: number;
  diagrams: number;
  studioFileName: string | null;
  updatedAt: string;
};

function notebookScope(scope: StagebookScope) {
  return creatorScopeWhere(scope, { userId: quickbrickNotebooks.userId, teamId: quickbrickNotebooks.teamId });
}

export async function listRobotNotebooks() {
  return runAction(async (): Promise<RobotNotebookItem[]> => {
    const scope = await resolveStagebookScope();
    return db
      .select({
        id: quickbrickNotebooks.id,
        name: quickbrickNotebooks.name,
        robotName: quickbrickNotebooks.robotName,
        season: quickbrickNotebooks.season,
      })
      .from(quickbrickNotebooks)
      .where(notebookScope(scope))
      .orderBy(desc(quickbrickNotebooks.updatedAt))
      .limit(100);
  });
}

async function loadRobotNotebook(notebookId: string, scope: StagebookScope) {
  const [row] = await db
    .select({ notebook: quickbrickNotebooks, league: leagues.name })
    .from(quickbrickNotebooks)
    .leftJoin(leagues, eq(leagues.id, quickbrickNotebooks.leagueId))
    .where(and(eq(quickbrickNotebooks.id, notebookId), notebookScope(scope)))
    .limit(1);
  if (!row) throw new ValidationError("Caderno do robô não encontrado.");
  return row;
}

async function loadRobotMedia(notebookId: string) {
  const [[latest], [versions], [diagrams]] = await Promise.all([
    db
      .select({ objectKey: quickbrickPhotos.objectKey, title: quickbrickPhotos.title, takenAt: quickbrickPhotos.takenAt })
      .from(quickbrickPhotos)
      .where(eq(quickbrickPhotos.notebookId, notebookId))
      .orderBy(desc(quickbrickPhotos.takenAt))
      .limit(1),
    db.select({ n: count() }).from(quickbrickPhotos).where(eq(quickbrickPhotos.notebookId, notebookId)),
    db.select({ n: count() }).from(quickbrickDiagrams).where(eq(quickbrickDiagrams.notebookId, notebookId)),
  ]);
  const photoUrl = latest && isR2Configured()
    ? await presignDownload(latest.objectKey, { expiresIn: 3600 })
    : null;
  return { latest, photoUrl, versions: versions?.n ?? 0, diagrams: diagrams?.n ?? 0 };
}

export async function getRobotSheet(notebookId: string) {
  return runAction(async (): Promise<RobotSheetData> => {
    requireUuid(notebookId, "caderno");
    const scope = await resolveStagebookScope();
    const [notebookRow, media] = await Promise.all([
      loadRobotNotebook(notebookId, scope),
      loadRobotMedia(notebookId),
    ]);
    const n = notebookRow.notebook;
    return {
      id: n.id,
      name: n.name,
      robotName: n.robotName,
      description: n.description,
      season: n.season,
      league: notebookRow.league ?? null,
      coverColor: n.coverColor,
      photoUrl: media.photoUrl,
      photoTitle: media.latest?.title ?? null,
      photoTakenAt: iso(media.latest?.takenAt),
      versions: media.versions,
      diagrams: media.diagrams,
      studioFileName: n.studioFileName,
      updatedAt: iso(n.updatedAt)!,
    };
  });
}

// ---------------------------------------------------------------------------
// Índice de decisões
// ---------------------------------------------------------------------------

export type DecisionIndexItem = DecisionData & { pageId: string; pageTitle: string; pageIcon: string | null };

export async function listDecisions() {
  return runAction(async (): Promise<DecisionIndexItem[]> => {
    const scope = await resolveStagebookScope();
    const rows = await db
      .select({ id: documents.id, title: documents.title, icon: documents.icon, content: documents.content })
      .from(documents)
      .where(and(liveDocumentWhere(scope), contentHasNode("kind", "decision")))
      .orderBy(desc(documents.updatedAt))
      .limit(200);
    return rows
      .flatMap((r) =>
        collectDecisions(r.content).map((d) => ({ ...d, pageId: r.id, pageTitle: r.title, pageIcon: r.icon })),
      )
      .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  });
}

// ---------------------------------------------------------------------------
// Backlinks e menções sem link
// ---------------------------------------------------------------------------

export type BacklinkItem = { id: string; title: string; icon: string | null; snippets: string[] };
export type UnlinkedMention = { id: string; title: string; icon: string | null; snippet: Snippet };

async function loadBacklinks(documentId: string): Promise<{ links: BacklinkItem[]; unlinked: UnlinkedMention[] }> {
    requireUuid(documentId, "página");
    const scope = await resolveStagebookScope();
    const [page] = await db
      .select({ title: documents.title })
      .from(documents)
      .where(and(eq(documents.id, documentId), liveDocumentWhere(scope)))
      .limit(1);
    if (!page) throw new ValidationError("Página não encontrada.");

    const linkedRows = await db
      .select({ id: documents.id, title: documents.title, icon: documents.icon, content: documents.content })
      .from(documents)
      .where(and(liveDocumentWhere(scope), ne(documents.id, documentId), contentContains(documentId)))
      .orderBy(desc(documents.updatedAt))
      .limit(50);
    const links = linkedRows
      .map((r) => ({ id: r.id, title: r.title, icon: r.icon, snippets: findReferenceSnippets(r.content, documentId) }))
      .filter((r) => r.snippets.length > 0);

    // Citam o título da página em texto, mas sem link — sugestão de conexão.
    const title = page.title.trim();
    let unlinked: UnlinkedMention[] = [];
    if (title.length >= 4 && title !== "Sem título") {
      const linkedIds = new Set(links.map((l) => l.id));
      const rows = await db
        .select({ id: documents.id, title: documents.title, icon: documents.icon, content: documents.content })
        .from(documents)
        .where(and(liveDocumentWhere(scope), ne(documents.id, documentId), sql`${documents.content}::text ilike ${likePattern(title)}`))
        .orderBy(desc(documents.updatedAt))
        .limit(20);
      unlinked = rows
        .filter((r) => !linkedIds.has(r.id))
        .map((r) => {
          const snippet = searchSnippet(lexicalToPlainText(r.content, 20_000), title, 60);
          return snippet ? { id: r.id, title: r.title, icon: r.icon, snippet } : null;
        })
        .filter((r): r is UnlinkedMention => r !== null)
        .slice(0, 10);
    }
    return { links, unlinked };
}

export async function getBacklinks(documentId: string) {
  return runAction(() => loadBacklinks(documentId));
}

// ---------------------------------------------------------------------------
// Busca com contexto
// ---------------------------------------------------------------------------

export type PageSearchResult = {
  id: string;
  title: string;
  icon: string | null;
  inTitle: boolean;
  snippet: Snippet | null;
  updatedAt: string;
};

async function searchPagesInScope(query: string): Promise<PageSearchResult[]> {
  const q = cleanText(query, { maxLength: 80 });
  if (q.length < 2) return [];
  const scope = await resolveStagebookScope();
  const pattern = likePattern(q);
  const rows = await db
    .select({
      id: documents.id,
      title: documents.title,
      icon: documents.icon,
      description: documents.description,
      content: documents.content,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .where(
      and(
        liveDocumentWhere(scope),
        or(
          ilike(documents.title, pattern),
          ilike(documents.description, pattern),
          sql`${documents.content}::text ilike ${pattern}`,
        ),
      ),
    )
    .orderBy(desc(documents.updatedAt))
    .limit(40);
  const lower = q.toLowerCase();
  return rows
    .map((r) => {
      const text = [r.description ?? "", lexicalToPlainText(r.content, 30_000)].join("\n");
      const snippet = searchSnippet(text, q);
      const inTitle = r.title.toLowerCase().includes(lower);
      return { id: r.id, title: r.title, icon: r.icon, inTitle, snippet, updatedAt: iso(r.updatedAt)! };
    })
    // Casou só no JSON (ex.: id/atributo) e não no texto: descarta.
    .filter((r) => r.inTitle || r.snippet)
    .sort((a, b) => Number(b.inTitle) - Number(a.inTitle))
    .slice(0, 20);
}

function runPageSearch(query: string) {
  return runAction(() => searchPagesInScope(query));
}

export async function searchPages(query: string) {
  return runPageSearch(query);
}
