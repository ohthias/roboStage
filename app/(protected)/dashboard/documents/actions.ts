"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ilike, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { documents, folders, tags, documentTags } from "@/db/schema";
import {
  resolveStagebookScope,
  scopeOwnership,
  type StagebookScope,
} from "@/lib/stagebook/scope";
import { scopeWhere } from "@/lib/stagebook/permissions";
import { nextPosition } from "@/lib/stagebook/position";
import { cleanText, optionalText, optionalUuid } from "@/lib/stagebook/validation";

const PATH = "/dashboard/documents";

async function nextFolderPosition(scope: StagebookScope, parentId: string | null) {
  const where = and(
    scopeWhere(scope, { userId: folders.userId, teamId: folders.teamId }),
    parentId ? eq(folders.parentId, parentId) : isNull(folders.parentId)
  );
  const rows = await db.select({ position: folders.position }).from(folders).where(where);
  return nextPosition(rows.map((r) => r.position));
}

async function nextDocumentPosition(
  scope: StagebookScope,
  folderId: string | null,
  parentId: string | null
) {
  const where = and(
    scopeWhere(scope, { userId: documents.userId, teamId: documents.teamId }),
    folderId ? eq(documents.folderId, folderId) : isNull(documents.folderId),
    parentId ? eq(documents.parentId, parentId) : isNull(documents.parentId)
  );
  const rows = await db.select({ position: documents.position }).from(documents).where(where);
  return nextPosition(rows.map((r) => r.position));
}

// ---------------------------------------------------------------------------
// Folders
// ---------------------------------------------------------------------------

export async function createFolder(parentId: string | null = null) {
  const scope = await resolveStagebookScope();
  const position = await nextFolderPosition(scope, parentId);

  const [created] = await db
    .insert(folders)
    .values({
      ...scopeOwnership(scope),
      parentId,
      name: "Nova pasta",
      createdBy: scope.userId,
      position,
    })
    .returning({ id: folders.id });

  revalidatePath(PATH, "layout");
  return created;
}

export async function renameFolder(id: string, name: string) {
  const scope = await resolveStagebookScope();
  const clean = cleanText(name, { fallback: "Nova pasta", maxLength: 120 });
  await db
    .update(folders)
    .set({ name: clean, updatedAt: new Date() })
    .where(
      and(eq(folders.id, id), scopeWhere(scope, { userId: folders.userId, teamId: folders.teamId }))
    );
  revalidatePath(PATH, "layout");
}

export async function deleteFolder(id: string) {
  const scope = await resolveStagebookScope();
  // Pages dentro da pasta não são apagadas: a FK folder_id tem onDelete "set
  // null", então elas voltam pra raiz do Stagebook (seção 42).
  await db
    .delete(folders)
    .where(
      and(eq(folders.id, id), scopeWhere(scope, { userId: folders.userId, teamId: folders.teamId }))
    );
  revalidatePath(PATH, "layout");
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export async function createDocument(
  folderId: string | null = null,
  parentId: string | null = null
) {
  const scope = await resolveStagebookScope();
  const position = await nextDocumentPosition(scope, folderId, parentId);

  const [created] = await db
    .insert(documents)
    .values({
      ...scopeOwnership(scope),
      folderId,
      parentId,
      title: "Sem título",
      createdBy: scope.userId,
      position,
    })
    .returning({ id: documents.id });

  revalidatePath(PATH, "layout");
  return created;
}

export async function duplicateDocument(id: string) {
  const scope = await resolveStagebookScope();
  const [source] = await db
    .select({
      title: documents.title,
      icon: documents.icon,
      cover: documents.cover,
      description: documents.description,
      folderId: documents.folderId,
      parentId: documents.parentId,
      content: documents.content,
      properties: documents.properties,
    })
    .from(documents)
    .where(
      and(eq(documents.id, id), scopeWhere(scope, { userId: documents.userId, teamId: documents.teamId }))
    )
    .limit(1);

  if (!source) throw new Error("Página não encontrada.");

  const position = await nextDocumentPosition(scope, source.folderId, source.parentId);

  const [created] = await db
    .insert(documents)
    .values({
      ...scopeOwnership(scope),
      folderId: source.folderId,
      parentId: source.parentId,
      title: `${source.title} (cópia)`,
      icon: source.icon,
      cover: source.cover,
      description: source.description,
      content: source.content,
      properties: source.properties,
      createdBy: scope.userId,
      position,
    })
    .returning({ id: documents.id });

  revalidatePath(PATH, "layout");
  return created;
}

/**
 * Move um item da árvore. `target` pode ser:
 *  - { folderId }      → vira página/pasta raiz dentro daquela pasta
 *  - { parentPageId }  → (só para documentos) vira subpage daquela página
 * Ambos null = raiz do Stagebook.
 */
export async function moveNotebookItem(
  type: "folder" | "document",
  id: string,
  target: { folderId?: string | null; parentPageId?: string | null } = {}
) {
  const scope = await resolveStagebookScope();

  if (type === "document") {
    const folderId = target.folderId ?? null;
    const parentPageId = target.parentPageId ?? null;

    if (parentPageId === id) {
      throw new Error("Uma página não pode ser subpage de si mesma.");
    }

    if (parentPageId) {
      // Impede ciclos: a página-alvo não pode ser descendente da que está sendo movida.
      const scopedDocs = await db
        .select({ id: documents.id, parentId: documents.parentId })
        .from(documents)
        .where(scopeWhere(scope, { userId: documents.userId, teamId: documents.teamId }));
      const byId = new Map(scopedDocs.map((d) => [d.id, d]));
      let cursor: string | null = byId.get(parentPageId)?.parentId ?? null;
      while (cursor) {
        if (cursor === id) {
          throw new Error("Uma página não pode ser movida para dentro de uma de suas próprias subpages.");
        }
        cursor = byId.get(cursor)?.parentId ?? null;
      }
    }

    const position = await nextDocumentPosition(scope, parentPageId ? null : folderId, parentPageId);

    await db
      .update(documents)
      .set({ folderId: parentPageId ? null : folderId, parentId: parentPageId, position, updatedAt: new Date() })
      .where(
        and(eq(documents.id, id), scopeWhere(scope, { userId: documents.userId, teamId: documents.teamId }))
      );
  } else {
    const targetFolderId = target.folderId ?? null;
    if (targetFolderId === id) {
      throw new Error("Uma pasta não pode conter a si mesma.");
    }

    const scopedFolders = await db
      .select({ id: folders.id, parentId: folders.parentId })
      .from(folders)
      .where(scopeWhere(scope, { userId: folders.userId, teamId: folders.teamId }));
    const byId = new Map(scopedFolders.map((f) => [f.id, f]));

    if (targetFolderId && !byId.has(targetFolderId)) {
      throw new Error("Pasta de destino inválida.");
    }

    let cursor = targetFolderId ? byId.get(targetFolderId)?.parentId ?? null : null;
    while (cursor) {
      if (cursor === id) {
        throw new Error("Uma pasta não pode ser movida para dentro de si mesma.");
      }
      cursor = byId.get(cursor)?.parentId ?? null;
    }

    const position = await nextFolderPosition(scope, targetFolderId);

    await db
      .update(folders)
      .set({ parentId: targetFolderId, position, updatedAt: new Date() })
      .where(
        and(eq(folders.id, id), scopeWhere(scope, { userId: folders.userId, teamId: folders.teamId }))
      );
  }

  revalidatePath(PATH, "layout");
}

export async function renameDocument(id: string, title: string) {
  const scope = await resolveStagebookScope();
  const clean = cleanText(title, { fallback: "Sem título", maxLength: 200 });
  await db
    .update(documents)
    .set({ title: clean, updatedBy: scope.userId, updatedAt: new Date() })
    .where(
      and(eq(documents.id, id), scopeWhere(scope, { userId: documents.userId, teamId: documents.teamId }))
    );
  revalidatePath(PATH, "layout");
}

export async function updateDocumentIcon(id: string, icon: string | null) {
  const scope = await resolveStagebookScope();
  await db
    .update(documents)
    .set({ icon, updatedBy: scope.userId, updatedAt: new Date() })
    .where(
      and(eq(documents.id, id), scopeWhere(scope, { userId: documents.userId, teamId: documents.teamId }))
    );
  revalidatePath(PATH, "layout");
}

export async function updateDocumentCover(id: string, cover: string | null) {
  const scope = await resolveStagebookScope();
  await db
    .update(documents)
    .set({ cover: optionalText(cover, 2000), updatedBy: scope.userId, updatedAt: new Date() })
    .where(
      and(eq(documents.id, id), scopeWhere(scope, { userId: documents.userId, teamId: documents.teamId }))
    );
  revalidatePath(PATH, "layout");
}

export async function updateDocumentDescription(id: string, description: string) {
  const scope = await resolveStagebookScope();
  await db
    .update(documents)
    .set({
      description: optionalText(description, 500),
      updatedBy: scope.userId,
      updatedAt: new Date(),
    })
    .where(
      and(eq(documents.id, id), scopeWhere(scope, { userId: documents.userId, teamId: documents.teamId }))
    );
  revalidatePath(PATH, "layout");
}

export async function updateDocumentProperty(id: string, key: string, value: unknown) {
  const scope = await resolveStagebookScope();
  const safeKey = cleanText(key, { maxLength: 60 });
  if (!safeKey) throw new Error("Nome de propriedade inválido.");

  const [current] = await db
    .select({ properties: documents.properties })
    .from(documents)
    .where(
      and(eq(documents.id, id), scopeWhere(scope, { userId: documents.userId, teamId: documents.teamId }))
    )
    .limit(1);
  if (!current) throw new Error("Página não encontrada.");

  const nextProperties = { ...(current.properties ?? {}) };
  if (value === null || value === "") {
    delete nextProperties[safeKey];
  } else {
    nextProperties[safeKey] = value;
  }

  await db
    .update(documents)
    .set({ properties: nextProperties, updatedBy: scope.userId, updatedAt: new Date() })
    .where(eq(documents.id, id));
  revalidatePath(PATH, "layout");
}

// Chamada a cada autosave do editor — não revalida a árvore da sidebar
// (título/ícone não mudam aqui), só grava o conteúdo.
export async function updateDocumentContent(id: string, content: unknown) {
  const scope = await resolveStagebookScope();
  await db
    .update(documents)
    .set({
      content: content as Record<string, unknown>,
      updatedBy: scope.userId,
      updatedAt: new Date(),
    })
    .where(
      and(eq(documents.id, id), scopeWhere(scope, { userId: documents.userId, teamId: documents.teamId }))
    );
}

export async function deleteDocument(id: string) {
  const scope = await resolveStagebookScope();
  // Subpages não são apagadas junto: a FK parent_id tem onDelete "set null",
  // então elas sobem um nível em vez de sumir (seção 42).
  await db
    .delete(documents)
    .where(
      and(eq(documents.id, id), scopeWhere(scope, { userId: documents.userId, teamId: documents.teamId }))
    );
  revalidatePath(PATH, "layout");
}

// ---------------------------------------------------------------------------
// Tags (seção 26)
// ---------------------------------------------------------------------------

export async function getDocumentTags(id: string) {
  return db
    .select({ tagId: tags.id, name: tags.name })
    .from(documentTags)
    .innerJoin(tags, eq(tags.id, documentTags.tagId))
    .where(eq(documentTags.documentId, id));
}

export async function toggleDocumentTag(id: string, tagName: string) {
  await resolveStagebookScope();
  const clean = cleanText(tagName, { maxLength: 40 });
  if (!clean) return;

  let [tag] = await db.select().from(tags).where(ilike(tags.name, clean)).limit(1);
  if (!tag) {
    [tag] = await db.insert(tags).values({ name: clean }).returning();
  }

  const existing = await db
    .select()
    .from(documentTags)
    .where(and(eq(documentTags.documentId, id), eq(documentTags.tagId, tag.id)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(documentTags).where(and(eq(documentTags.documentId, id), eq(documentTags.tagId, tag.id)));
  } else {
    await db.insert(documentTags).values({ documentId: id, tagId: tag.id });
  }
  revalidatePath(PATH, "layout");
}

export { optionalUuid };
