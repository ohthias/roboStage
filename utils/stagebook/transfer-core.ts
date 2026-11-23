import "server-only";

import { and, desc, eq, inArray, isNull, sql, type AnyColumn, type SQL } from "drizzle-orm";
import { db } from "@/db/client";
import {
  boardCardDocuments,
  calendarEventDocuments,
  documents,
  folders,
  journalEntryLinks,
  quickbrickNotebooks,
  quickbrickPhotos,
  syncedBlocks,
  testExecutions,
  tests,
  thinklab,
  userPins,
} from "@/db/schema";
import type { LabelableKind } from "@/types/labels";
import {
  LEGACY_LIMITS,
  TRANSFER_KIND_LABEL,
  type TransferCandidateDTO,
  type TransferKind,
  type TransferResultDTO,
} from "@/types/legacy";
import { pinHref, type PinKind } from "@/types/pins";
import { adapterFor, getOrCreateTag } from "./labels-core";
import { collectSyncIds } from "./page-links";
import type { TeamScope } from "./scope";
import { ValidationError } from "./validation";

/**
 * Transferência de arquivos do espaço PESSOAL para uma EQUIPE.
 *
 * É uma mudança de dono (o item continua o mesmo, com o mesmo id, histórico,
 * execuções, fotos…), não uma cópia. O que vai junto:
 *
 *  - página do StageBook → todas as subpáginas (inclusive as que estão na lixeira);
 *  - pasta → subpastas, páginas das pastas (e subpáginas delas) e os testes e
 *    quadros do ThinkLab guardados nessas pastas;
 *  - teste do LabTest → execuções; caderno do QuickBrick → fotos e diagramas.
 *
 * O que precisa ser ajustado porque pertencia ao espaço pessoal:
 *
 *  - tags: viram as tags da equipe com o mesmo nome (criadas se faltarem);
 *  - meta (milestone): é pessoal, então o item fica sem meta;
 *  - blocos sincronizados usados nas páginas: ganham uma cópia na equipe;
 *  - vínculos que vinham de coisas pessoais (Diário, cards do Kanban, eventos
 *    da agenda) e os fixados pessoais: são removidos;
 *  - pasta/página-pai que ficou no pessoal: o item vai para a raiz da equipe;
 *  - nome repetido de teste ou quadro na equipe: ganha " (2)", " (3)"…
 *
 * O driver neon-http não tem transação, então cada passo grava em sequência,
 * na ordem que deixa o estado sempre consistente: primeiro o que é auxiliar
 * (cópias de blocos), depois o dono, por fim a limpeza de vínculos.
 */

type Ref = { kind: TransferKind; id: string };

const personalOf = (userId: string, cols: { userId: AnyColumn; teamId: AnyColumn }): SQL =>
  and(eq(cols.userId, userId), isNull(cols.teamId)) as SQL;

const like = (column: AnyColumn, q: string): SQL | undefined =>
  q ? sql`${column} ilike ${`%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`}` : undefined;

// Subconsultas correlacionadas usam o nome qualificado ("tabela"."coluna"): numa
// consulta de uma tabela só o drizzle escreve a coluna sem a tabela, e dentro da
// subconsulta ela passaria a apontar para a tabela de dentro.
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

// ---------------------------------------------------------------------------
// Candidatos (o que a pessoa pode transferir)
// ---------------------------------------------------------------------------

export async function listTransferCandidates(
  userId: string,
  { q = "", kinds, perKind = 40 }: { q?: string; kinds: TransferKind[]; perKind?: number },
): Promise<TransferCandidateDTO[]> {
  const query = q.trim().slice(0, 80);
  const lists = await Promise.all(kinds.map((kind) => candidatesOf(kind, userId, query, perKind)));
  return lists.flat().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function candidatesOf(kind: TransferKind, userId: string, q: string, limit: number): Promise<TransferCandidateDTO[]> {
  switch (kind) {
    case "folder": {
      const rows = await db
        .select({
          id: folders.id,
          title: folders.name,
          icon: folders.icon,
          updatedAt: folders.updatedAt,
          pages: sql<number>`(select count(*)::int from ${documents} d where d.folder_id = "folders"."id" and d.deleted_at is null)`,
          subfolders: sql<number>`(select count(*)::int from ${folders} f2 where f2.parent_id = "folders"."id")`,
        })
        .from(folders)
        .where(and(personalOf(userId, folders), like(folders.name, q)))
        .orderBy(desc(folders.updatedAt))
        .limit(limit);
      return rows.map((r) => ({
        kind,
        id: r.id,
        title: r.title || "Nova pasta",
        icon: r.icon,
        detail: [plural(r.pages, "página", "páginas"), r.subfolders ? plural(r.subfolders, "subpasta", "subpastas") : null]
          .filter(Boolean)
          .join(" · "),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }
    case "stagebook": {
      const rows = await db
        .select({
          id: documents.id,
          title: documents.title,
          icon: documents.icon,
          updatedAt: documents.updatedAt,
          parentTitle: sql<string | null>`(select p.title from ${documents} p where p.id = "documents"."parent_id")`,
          children: sql<number>`(select count(*)::int from ${documents} c where c.parent_id = "documents"."id" and c.deleted_at is null)`,
        })
        .from(documents)
        .where(and(personalOf(userId, documents), isNull(documents.deletedAt), like(documents.title, q)))
        .orderBy(desc(documents.updatedAt))
        .limit(limit);
      return rows.map((r) => ({
        kind,
        id: r.id,
        title: r.title || "Sem título",
        icon: r.icon,
        detail:
          [r.parentTitle ? `dentro de “${r.parentTitle}”` : null, r.children ? plural(r.children, "subpágina", "subpáginas") : null]
            .filter(Boolean)
            .join(" · ") || null,
        updatedAt: r.updatedAt.toISOString(),
      }));
    }
    case "labtest": {
      const rows = await db
        .select({
          id: tests.id,
          title: tests.name,
          updatedAt: tests.updatedAt,
          runs: sql<number>`(select count(*)::int from ${testExecutions} e where e.test_id = "tests"."id")`,
        })
        .from(tests)
        .where(and(personalOf(userId, tests), like(tests.name, q)))
        .orderBy(desc(tests.updatedAt))
        .limit(limit);
      return rows.map((r) => ({
        kind,
        id: r.id,
        title: r.title || "Sem título",
        icon: null,
        detail: plural(r.runs, "rodada", "rodadas"),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }
    case "quickbrick": {
      const rows = await db
        .select({
          id: quickbrickNotebooks.id,
          title: quickbrickNotebooks.name,
          robot: quickbrickNotebooks.robotName,
          updatedAt: quickbrickNotebooks.updatedAt,
          photos: sql<number>`(select count(*)::int from ${quickbrickPhotos} p where p.notebook_id = "quickbrick_notebooks"."id")`,
        })
        .from(quickbrickNotebooks)
        .where(and(personalOf(userId, quickbrickNotebooks), like(quickbrickNotebooks.name, q)))
        .orderBy(desc(quickbrickNotebooks.updatedAt))
        .limit(limit);
      return rows.map((r) => ({
        kind,
        id: r.id,
        title: r.title || "Sem título",
        icon: null,
        detail: [r.robot, plural(r.photos, "foto", "fotos")].filter(Boolean).join(" · "),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }
    case "thinklab": {
      const rows = await db
        .select({ id: thinklab.id, title: thinklab.name, updatedAt: thinklab.updatedAt })
        .from(thinklab)
        .where(and(personalOf(userId, thinklab), like(thinklab.name, q)))
        .orderBy(desc(thinklab.updatedAt))
        .limit(limit);
      return rows.map((r) => ({
        kind,
        id: r.id,
        title: r.title || "Sem título",
        icon: null,
        detail: null,
        updatedAt: r.updatedAt.toISOString(),
      }));
    }
  }
}

// ---------------------------------------------------------------------------
// Coleta do que vai junto
// ---------------------------------------------------------------------------

/** Pastas e todas as subpastas (só as pessoais da pessoa). */
async function collectFolderTree(userId: string, roots: string[]): Promise<Set<string>> {
  const out = new Set(roots);
  let frontier = roots;
  while (frontier.length) {
    const children = await db
      .select({ id: folders.id })
      .from(folders)
      .where(and(inArray(folders.parentId, frontier), personalOf(userId, folders)));
    frontier = children.map((c) => c.id).filter((id) => !out.has(id));
    frontier.forEach((id) => out.add(id));
  }
  return out;
}

/** Páginas pedidas + páginas das pastas + todas as subpáginas (lixeira incluída). */
async function collectPageTree(userId: string, pageIds: string[], folderIds: string[]): Promise<Set<string>> {
  const out = new Set(pageIds);
  if (folderIds.length) {
    const inFolders = await db
      .select({ id: documents.id })
      .from(documents)
      .where(and(inArray(documents.folderId, folderIds), personalOf(userId, documents)));
    inFolders.forEach((p) => out.add(p.id));
  }
  let frontier = [...out];
  while (frontier.length) {
    const children = await db
      .select({ id: documents.id })
      .from(documents)
      .where(and(inArray(documents.parentId, frontier), personalOf(userId, documents)));
    frontier = children.map((c) => c.id).filter((id) => !out.has(id));
    frontier.forEach((id) => out.add(id));
  }
  return out;
}

/** Garante que cada item pedido existe e é do espaço pessoal da pessoa. */
async function requirePersonal(userId: string, refs: Ref[]) {
  const byKind = (kind: TransferKind) => refs.filter((r) => r.kind === kind).map((r) => r.id);
  const checks: [TransferKind, Promise<{ id: string }[]>][] = [
    ["folder", byKind("folder").length ? db.select({ id: folders.id }).from(folders).where(and(inArray(folders.id, byKind("folder")), personalOf(userId, folders))) : Promise.resolve([])],
    ["stagebook", byKind("stagebook").length ? db.select({ id: documents.id }).from(documents).where(and(inArray(documents.id, byKind("stagebook")), personalOf(userId, documents), isNull(documents.deletedAt))) : Promise.resolve([])],
    ["labtest", byKind("labtest").length ? db.select({ id: tests.id }).from(tests).where(and(inArray(tests.id, byKind("labtest")), personalOf(userId, tests))) : Promise.resolve([])],
    ["quickbrick", byKind("quickbrick").length ? db.select({ id: quickbrickNotebooks.id }).from(quickbrickNotebooks).where(and(inArray(quickbrickNotebooks.id, byKind("quickbrick")), personalOf(userId, quickbrickNotebooks))) : Promise.resolve([])],
    ["thinklab", byKind("thinklab").length ? db.select({ id: thinklab.id }).from(thinklab).where(and(inArray(thinklab.id, byKind("thinklab")), personalOf(userId, thinklab))) : Promise.resolve([])],
  ];
  for (const [kind, promise] of checks) {
    const found = new Set((await promise).map((r) => r.id));
    const missing = byKind(kind).filter((id) => !found.has(id));
    if (missing.length) {
      throw new ValidationError(
        `${missing.length === 1 ? `Um(a) ${TRANSFER_KIND_LABEL[kind].one}` : `${missing.length} ${TRANSFER_KIND_LABEL[kind].many}`} não está mais no seu espaço pessoal (foi excluído ou já foi transferido).`,
      );
    }
  }
}

/** Nome livre na equipe: "Nome", senão "Nome (2)", "Nome (3)"… */
function freeName(name: string, taken: Set<string>): string {
  const base = name.trim() || "Sem título";
  if (!taken.has(base.toLowerCase())) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base} (${n})`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
}

/** Troca os ids dos blocos sincronizados no estado do Lexical. */
function remapSyncIds(content: unknown, map: Map<string, string>): unknown {
  if (Array.isArray(content)) return content.map((c) => remapSyncIds(c, map));
  if (!content || typeof content !== "object") return content;
  const node = content as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(node)) {
    out[k] = k === "syncId" && node.type === "synced-block" && typeof v === "string" && map.has(v) ? map.get(v) : remapSyncIds(v, map);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Transferência
// ---------------------------------------------------------------------------

export async function transferToTeam(userId: string, team: TeamScope, refs: Ref[]): Promise<TransferResultDTO> {
  const unique = [...new Map(refs.map((r) => [`${r.kind}:${r.id}`, r])).values()];
  if (!unique.length) throw new ValidationError("Escolha ao menos um item para transferir.");
  if (unique.length > LEGACY_LIMITS.transferBatch) {
    throw new ValidationError(`Transfira no máximo ${LEGACY_LIMITS.transferBatch} itens de uma vez.`);
  }
  await requirePersonal(userId, unique);

  const pick = (kind: TransferKind) => unique.filter((r) => r.kind === kind).map((r) => r.id);
  const notes: string[] = [];
  const renamed: TransferResultDTO["renamed"] = [];

  // ----------------------------------------------------- o que vai junto
  const folderSet = await collectFolderTree(userId, pick("folder"));
  const folderIds = [...folderSet];
  const pageIds = [...(await collectPageTree(userId, pick("stagebook"), folderIds))];

  const testIds = new Set(pick("labtest"));
  const thinkIds = new Set(pick("thinklab"));
  if (folderIds.length) {
    (await db.select({ id: tests.id }).from(tests).where(and(inArray(tests.folderId, folderIds), personalOf(userId, tests)))).forEach((t) =>
      testIds.add(t.id),
    );
    (
      await db.select({ id: thinklab.id }).from(thinklab).where(and(inArray(thinklab.folderId, folderIds), personalOf(userId, thinklab)))
    ).forEach((t) => thinkIds.add(t.id));
  }
  const notebookIds = pick("quickbrick");

  // ----------------------------------------------------- metas pessoais caem
  const withMilestone = (
    await Promise.all([
      pageIds.length ? db.select({ id: documents.id }).from(documents).where(and(inArray(documents.id, pageIds), sql`${documents.milestoneId} is not null`)) : [],
      testIds.size ? db.select({ id: tests.id }).from(tests).where(and(inArray(tests.id, [...testIds]), sql`${tests.milestoneId} is not null`)) : [],
      thinkIds.size ? db.select({ id: thinklab.id }).from(thinklab).where(and(inArray(thinklab.id, [...thinkIds]), sql`${thinklab.milestoneId} is not null`)) : [],
      notebookIds.length
        ? db.select({ id: quickbrickNotebooks.id }).from(quickbrickNotebooks).where(and(inArray(quickbrickNotebooks.id, notebookIds), sql`${quickbrickNotebooks.milestoneId} is not null`))
        : [],
    ])
  ).flat().length;
  if (withMilestone) notes.push(`${plural(withMilestone, "item tinha", "itens tinham")} uma meta pessoal e ficou sem meta.`);

  // ----------------------------------------------------- blocos sincronizados
  const syncMap = new Map<string, string>();
  const pageRows = pageIds.length
    ? await db
        .select({ id: documents.id, folderId: documents.folderId, parentId: documents.parentId, content: documents.content })
        .from(documents)
        .where(inArray(documents.id, pageIds))
    : [];
  const syncIds = [...new Set(pageRows.flatMap((p) => collectSyncIds(p.content)))];
  if (syncIds.length) {
    const blocks = await db
      .select({ id: syncedBlocks.id, title: syncedBlocks.title, content: syncedBlocks.content })
      .from(syncedBlocks)
      .where(and(inArray(syncedBlocks.id, syncIds), personalOf(userId, syncedBlocks)));
    for (const block of blocks) {
      const [copy] = await db
        .insert(syncedBlocks)
        .values({ userId: null, teamId: team.teamId, title: block.title, content: block.content, createdBy: userId, updatedBy: userId })
        .returning({ id: syncedBlocks.id });
      syncMap.set(block.id, copy.id);
    }
    if (blocks.length) notes.push(`${plural(blocks.length, "bloco sincronizado foi copiado", "blocos sincronizados foram copiados")} para a equipe.`);
  }

  // ----------------------------------------------------- posições no fim da raiz da equipe
  const [{ maxDoc }] = await db
    .select({ maxDoc: sql<number>`coalesce(max(${documents.position}), 0)` })
    .from(documents)
    .where(and(eq(documents.teamId, team.teamId), isNull(documents.folderId), isNull(documents.parentId)));
  const [{ maxFolder }] = await db
    .select({ maxFolder: sql<number>`coalesce(max(${folders.position}), 0)` })
    .from(folders)
    .where(and(eq(folders.teamId, team.teamId), isNull(folders.parentId)));
  let nextDoc = Number(maxDoc);
  let nextFolder = Number(maxFolder);
  const now = new Date();

  // ----------------------------------------------------- pastas
  if (folderIds.length) {
    const rows = await db.select({ id: folders.id, parentId: folders.parentId }).from(folders).where(inArray(folders.id, folderIds));
    for (const f of rows) {
      const keepParent = f.parentId !== null && folderSet.has(f.parentId);
      await db
        .update(folders)
        .set({
          userId: null,
          teamId: team.teamId,
          ...(keepParent ? {} : { parentId: null, position: ++nextFolder }),
          updatedAt: now,
        })
        .where(eq(folders.id, f.id));
    }
  }

  // ----------------------------------------------------- páginas
  const pageSet = new Set(pageIds);
  for (const p of pageRows) {
    const keepParent = p.parentId !== null && pageSet.has(p.parentId);
    const keepFolder = p.folderId !== null && folderSet.has(p.folderId);
    const root = !keepParent && !keepFolder;
    await db
      .update(documents)
      .set({
        userId: null,
        teamId: team.teamId,
        milestoneId: null,
        ...(keepParent ? {} : { parentId: null }),
        ...(keepFolder ? {} : { folderId: null }),
        ...(root ? { position: ++nextDoc } : {}),
        ...(syncMap.size && collectSyncIds(p.content).some((id) => syncMap.has(id))
          ? { content: remapSyncIds(p.content, syncMap) as Record<string, unknown> }
          : {}),
        updatedBy: userId,
        updatedAt: now,
      })
      .where(eq(documents.id, p.id));
  }

  // ----------------------------------------------------- testes e quadros (nome único na equipe)
  if (testIds.size) {
    const taken = new Set(
      (await db.select({ name: tests.name }).from(tests).where(eq(tests.teamId, team.teamId))).map((t) => t.name.trim().toLowerCase()),
    );
    const rows = await db.select({ id: tests.id, name: tests.name, folderId: tests.folderId }).from(tests).where(inArray(tests.id, [...testIds]));
    for (const t of rows) {
      const name = freeName(t.name, taken);
      taken.add(name.toLowerCase());
      if (name !== t.name.trim()) renamed.push({ from: t.name, to: name });
      await db
        .update(tests)
        .set({
          teamId: team.teamId,
          name,
          milestoneId: null,
          ...(t.folderId && folderSet.has(t.folderId) ? {} : { folderId: null }),
          updatedAt: now,
        })
        .where(eq(tests.id, t.id));
    }
  }
  if (thinkIds.size) {
    const taken = new Set(
      (await db.select({ name: thinklab.name }).from(thinklab).where(eq(thinklab.teamId, team.teamId))).map((t) => t.name.trim().toLowerCase()),
    );
    const rows = await db
      .select({ id: thinklab.id, name: thinklab.name, folderId: thinklab.folderId })
      .from(thinklab)
      .where(inArray(thinklab.id, [...thinkIds]));
    for (const t of rows) {
      const name = freeName(t.name, taken);
      taken.add(name.toLowerCase());
      if (name !== t.name.trim()) renamed.push({ from: t.name, to: name });
      await db
        .update(thinklab)
        .set({
          teamId: team.teamId,
          name,
          milestoneId: null,
          ...(t.folderId && folderSet.has(t.folderId) ? {} : { folderId: null }),
          updatedAt: now,
        })
        .where(eq(thinklab.id, t.id));
    }
  }

  // ----------------------------------------------------- cadernos do QuickBrick
  if (notebookIds.length) {
    await db
      .update(quickbrickNotebooks)
      .set({ teamId: team.teamId, milestoneId: null, updatedAt: now })
      .where(inArray(quickbrickNotebooks.id, notebookIds));
  }

  // ----------------------------------------------------- tags → tags da equipe
  const tagJobs: [LabelableKind, string[]][] = [
    ["document", pageIds],
    ["labtest", [...testIds]],
    ["thinklab", [...thinkIds]],
    ["quickbrick", notebookIds],
  ];
  let retagged = 0;
  const teamTags = new Map<string, string>();
  for (const [kind, ids] of tagJobs) {
    if (!ids.length) continue;
    const adapter = adapterFor(kind);
    for (const { resourceId, tag } of await adapter.tagsOf(ids)) {
      const key = tag.name.toLowerCase();
      let teamTagId = teamTags.get(key);
      if (!teamTagId) {
        teamTagId = (await getOrCreateTag(team, tag.name, tag.color)).id;
        teamTags.set(key, teamTagId);
      }
      if (teamTagId === tag.id) continue;
      await adapter.addTag(resourceId, teamTagId);
      await adapter.removeTag(resourceId, tag.id);
      retagged++;
    }
  }
  if (retagged) notes.push(`As tags foram trocadas pelas tags da equipe com o mesmo nome (${plural(teamTags.size, "tag", "tags")}).`);

  // ----------------------------------------------------- vínculos que vinham do pessoal
  let unlinked = 0;
  const count = (rows: unknown[]) => (unlinked += rows.length);
  if (pageIds.length) {
    count(await db.delete(journalEntryLinks).where(inArray(journalEntryLinks.documentId, pageIds)).returning({ id: journalEntryLinks.id }));
    count(await db.delete(boardCardDocuments).where(inArray(boardCardDocuments.documentId, pageIds)).returning({ id: boardCardDocuments.id }));
    count(await db.delete(calendarEventDocuments).where(inArray(calendarEventDocuments.documentId, pageIds)).returning({ id: calendarEventDocuments.id }));
  }
  if (testIds.size) count(await db.delete(journalEntryLinks).where(inArray(journalEntryLinks.testId, [...testIds])).returning({ id: journalEntryLinks.id }));
  if (thinkIds.size) count(await db.delete(journalEntryLinks).where(inArray(journalEntryLinks.thinklabId, [...thinkIds])).returning({ id: journalEntryLinks.id }));
  if (notebookIds.length) count(await db.delete(journalEntryLinks).where(inArray(journalEntryLinks.quickbrickId, notebookIds)).returning({ id: journalEntryLinks.id }));
  if (unlinked) notes.push(`${plural(unlinked, "vínculo do seu espaço pessoal (Diário, Kanban ou agenda) foi removido", "vínculos do seu espaço pessoal (Diário, Kanban ou agenda) foram removidos")}.`);

  const pinIds: [PinKind, string[]][] = [
    ["stagebook", pageIds],
    ["labtest", [...testIds]],
    ["thinklab", [...thinkIds]],
    ["quickbrick", notebookIds],
  ];
  for (const [kind, ids] of pinIds) {
    if (!ids.length) continue;
    await db
      .delete(userPins)
      .where(and(eq(userPins.kind, kind), inArray(userPins.resourceId, ids), isNull(userPins.teamId)));
  }

  // ----------------------------------------------------- resumo
  const titles = await titlesOf(unique);
  const moved = unique.map((r) => ({
    kind: r.kind,
    id: r.id,
    title: titles.get(`${r.kind}:${r.id}`) ?? "Sem título",
    href: r.kind === "folder" ? `/dashboard/folders/${r.id}` : pinHref(r.kind, r.id),
  }));
  const explicitPages = pick("stagebook").length;
  if (pageIds.length > explicitPages) notes.unshift(`${plural(pageIds.length - explicitPages, "página foi junto", "páginas foram junto")} (subpáginas e conteúdo das pastas).`);
  const extraTests = testIds.size - pick("labtest").length;
  const extraThink = thinkIds.size - pick("thinklab").length;
  if (extraTests + extraThink > 0) {
    notes.push(`${plural(extraTests + extraThink, "teste ou quadro guardado nas pastas foi junto", "testes e quadros guardados nas pastas foram junto")}.`);
  }

  return { moved, pages: pageIds.length, folders: folderIds.length, renamed, notes };
}

async function titlesOf(refs: Ref[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const ids = (kind: TransferKind) => refs.filter((r) => r.kind === kind).map((r) => r.id);
  const put = (kind: TransferKind, rows: { id: string; title: string }[]) => rows.forEach((r) => out.set(`${kind}:${r.id}`, r.title || "Sem título"));
  if (ids("folder").length) put("folder", await db.select({ id: folders.id, title: folders.name }).from(folders).where(inArray(folders.id, ids("folder"))));
  if (ids("stagebook").length) put("stagebook", await db.select({ id: documents.id, title: documents.title }).from(documents).where(inArray(documents.id, ids("stagebook"))));
  if (ids("labtest").length) put("labtest", await db.select({ id: tests.id, title: tests.name }).from(tests).where(inArray(tests.id, ids("labtest"))));
  if (ids("thinklab").length) put("thinklab", await db.select({ id: thinklab.id, title: thinklab.name }).from(thinklab).where(inArray(thinklab.id, ids("thinklab"))));
  if (ids("quickbrick").length)
    put("quickbrick", await db.select({ id: quickbrickNotebooks.id, title: quickbrickNotebooks.name }).from(quickbrickNotebooks).where(inArray(quickbrickNotebooks.id, ids("quickbrick"))));
  return out;
}
