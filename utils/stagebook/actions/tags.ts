"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ilike, inArray, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { tags } from "@/db/schema";
import { resolveStagebookScope } from "../scope";
import { requireRole } from "../permissions";
import { cleanText, requireUuid } from "../validation";
import { normalizeHexColor } from "../label-colors";
import {
  adapterFor,
  assertKind,
  findTagByName,
  getOrCreateTag,
  requireResourceInScope,
  requireTagInScope,
  tagScope,
  tagUsageByKind,
  tagsForResources,
} from "../labels-core";
import type { LabelableKind, TagDTO, TagWithUsage } from "@/types/labels";

/**
 * Tags UNIVERSAIS: as mesmas tags (nome + cor) valem para Kanban, páginas,
 * calendário, ThinkLab, LabTest e QuickBrick dentro do mesmo espaço (pessoal ou equipe).
 */

const tagColumns = { id: tags.id, name: tags.name, color: tags.color };

function refresh() {
  // Tags aparecem em todas as ferramentas; renomear/recolorir reflete em todas.
  revalidatePath("/dashboard", "layout");
}

function parseColor(color: unknown): string | null {
  if (color === null || color === undefined || color === "") return null;
  const hex = normalizeHexColor(color);
  if (!hex) throw new Error("Cor inválida. Use o formato #rrggbb.");
  return hex;
}

function parseName(name: unknown) {
  const clean = cleanText(name, { maxLength: 40 });
  if (!clean) throw new Error("Informe um nome para a tag.");
  return clean;
}

// ---------------------------------------------------------------------------
// Catálogo
// ---------------------------------------------------------------------------

export async function listTags(): Promise<TagDTO[]> {
  const scope = await resolveStagebookScope();
  return db.select(tagColumns).from(tags).where(tagScope(scope)).orderBy(tags.name);
}

export async function searchTags(query: string): Promise<TagDTO[]> {
  const scope = await resolveStagebookScope();
  const clean = query.trim().replace(/[%_\\]/g, "\\$&");
  return db
    .select(tagColumns)
    .from(tags)
    .where(clean ? and(tagScope(scope), ilike(tags.name, `%${clean}%`)) : tagScope(scope))
    .orderBy(tags.name)
    .limit(30);
}

/** Catálogo + em quantos itens de cada ferramenta cada tag é usada (tela de gestão). */
export async function listTagsWithUsage(): Promise<TagWithUsage[]> {
  const scope = await resolveStagebookScope();
  const rows = await db.select(tagColumns).from(tags).where(tagScope(scope)).orderBy(tags.name);
  const { usage, empty } = await tagUsageByKind(rows.map((r) => r.id));
  return rows.map((tag) => {
    const u = usage.get(tag.id) ?? empty();
    return { ...tag, usage: u, total: Object.values(u).reduce((a, b) => a + b, 0) };
  });
}

export async function createTag(name: string, color?: string | null): Promise<TagDTO> {
  const scope = await resolveStagebookScope();
  const clean = parseName(name);
  if (await findTagByName(scope, clean)) throw new Error("Já existe uma tag com esse nome.");
  const tag = await getOrCreateTag(scope, clean, parseColor(color));
  refresh();
  return tag;
}

/** Renomeia e/ou troca a cor. `color: null` volta para a cor automática. */
export async function updateTag(
  tagId: string,
  input: { name?: string; color?: string | null },
): Promise<TagDTO> {
  const scope = await resolveStagebookScope();
  requireUuid(tagId, "tag");
  await requireTagInScope(scope, tagId);

  const patch: { name?: string; color?: string | null; updatedAt: Date } = { updatedAt: new Date() };

  if (input.name !== undefined) {
    const clean = parseName(input.name);
    const clash = await findTagByName(scope, clean);
    if (clash && clash.id !== tagId) throw new Error("Já existe uma tag com esse nome.");
    patch.name = clean;
  }
  if (input.color !== undefined) patch.color = parseColor(input.color);

  const [updated] = await db
    .update(tags)
    .set(patch)
    .where(and(eq(tags.id, tagId), tagScope(scope)))
    .returning(tagColumns);
  refresh();
  return updated;
}

/** Exclui a tag de TODAS as ferramentas (os vínculos caem em cascata). */
export async function deleteTag(tagId: string): Promise<void> {
  const scope = await resolveStagebookScope();
  requireRole(scope, ["owner", "mentor"]);
  requireUuid(tagId, "tag");
  await requireTagInScope(scope, tagId);
  await db.delete(tags).where(and(eq(tags.id, tagId), tagScope(scope)));
  refresh();
}

/** Junta `fromId` em `intoId`: itens com a primeira passam a ter a segunda. */
export async function mergeTags(fromId: string, intoId: string): Promise<void> {
  const scope = await resolveStagebookScope();
  requireRole(scope, ["owner", "mentor"]);
  requireUuid(fromId, "tag");
  requireUuid(intoId, "tag");
  if (fromId === intoId) return;
  await requireTagInScope(scope, fromId);
  await requireTagInScope(scope, intoId);

  // ON CONFLICT não existe em UPDATE: primeiro removemos os itens que já têm a
  // tag de destino, depois movemos o restante. Um par de comandos por tabela.
  const links = [
    ["board_card_tags", "card_id"],
    ["document_tags", "document_id"],
    ["calendar_event_tags", "event_id"],
    ["thinklab_tags", "thinklab_id"],
    ["test_tags", "test_id"],
    ["quickbrick_notebook_tags", "notebook_id"],
  ] as const;
  for (const [table, col] of links) {
    const t = sql.identifier(table);
    const c = sql.identifier(col);
    await db.execute(
      sql`DELETE FROM ${t} a USING ${t} b WHERE a.tag_id = ${fromId} AND b.tag_id = ${intoId} AND a.${c} = b.${c}`,
    );
    await db.execute(sql`UPDATE ${t} SET tag_id = ${intoId} WHERE tag_id = ${fromId}`);
  }
  await db.delete(tags).where(and(eq(tags.id, fromId), tagScope(scope)));
  refresh();
}

// ---------------------------------------------------------------------------
// Tags de um item (qualquer ferramenta)
// ---------------------------------------------------------------------------

export async function getResourceTags(kind: LabelableKind, id: string): Promise<TagDTO[]> {
  assertKind(kind);
  requireUuid(id, "item");
  const scope = await resolveStagebookScope();
  await requireResourceInScope(scope, kind, id);
  return (await tagsForResources(kind, [id])).get(id) ?? [];
}

/** Tags de vários itens de uma vez — para listas e cartões (evita N consultas). */
export async function getResourcesTags(
  kind: LabelableKind,
  ids: string[],
): Promise<Record<string, TagDTO[]>> {
  assertKind(kind);
  const scope = await resolveStagebookScope();
  ids.forEach((id) => requireUuid(id, "item"));
  if (ids.length === 0) return {};

  // Só devolve tags do scope atual — itens de outro scope não vazam.
  const map = await tagsForResources(kind, ids);
  if (map.size === 0) return {};
  const visible = new Set(
    (
      await db
        .select({ id: tags.id })
        .from(tags)
        .where(and(tagScope(scope), inArray(tags.id, [...new Set([...map.values()].flat().map((t) => t.id))])))
    ).map((t) => t.id),
  );
  const result: Record<string, TagDTO[]> = {};
  for (const [id, list] of map) result[id] = list.filter((t) => visible.has(t.id));
  return result;
}

/** Marca/desmarca uma tag (pelo id) em um item e devolve as tags atuais do item. */
export async function toggleResourceTag(
  kind: LabelableKind,
  id: string,
  tagId: string,
): Promise<TagDTO[]> {
  assertKind(kind);
  requireUuid(id, "item");
  requireUuid(tagId, "tag");
  const scope = await resolveStagebookScope();
  await requireResourceInScope(scope, kind, id);
  await requireTagInScope(scope, tagId);

  const adapter = adapterFor(kind);
  const current = (await tagsForResources(kind, [id])).get(id) ?? [];
  if (current.some((t) => t.id === tagId)) await adapter.removeTag(id, tagId);
  else await adapter.addTag(id, tagId);

  refresh();
  return (await tagsForResources(kind, [id])).get(id) ?? [];
}

/** Aplica uma tag pelo nome, criando-a no catálogo se ainda não existir. */
export async function addResourceTagByName(
  kind: LabelableKind,
  id: string,
  name: string,
  color?: string | null,
): Promise<{ tags: TagDTO[]; tag: TagDTO }> {
  assertKind(kind);
  requireUuid(id, "item");
  const scope = await resolveStagebookScope();
  await requireResourceInScope(scope, kind, id);

  const tag = await getOrCreateTag(scope, parseName(name), parseColor(color));
  await adapterFor(kind).addTag(id, tag.id);
  refresh();
  return { tags: (await tagsForResources(kind, [id])).get(id) ?? [], tag };
}

export async function removeResourceTag(
  kind: LabelableKind,
  id: string,
  tagId: string,
): Promise<TagDTO[]> {
  assertKind(kind);
  requireUuid(id, "item");
  requireUuid(tagId, "tag");
  const scope = await resolveStagebookScope();
  await requireResourceInScope(scope, kind, id);
  await adapterFor(kind).removeTag(id, tagId);
  refresh();
  return (await tagsForResources(kind, [id])).get(id) ?? [];
}
