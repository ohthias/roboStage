"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { documents, folders } from "@/db/schema";
import {
  liveDocumentWhere,
  purgeExpiredTrash,
  snapshotBeforeContentChange,
} from "./history-core";
import {
  resolveStagebookScope,
  scopeOwnership,
  type StagebookScope,
} from "@/utils/stagebook/scope";
import { scopeWhere } from "@/utils/stagebook/permissions";
import { nextPosition } from "@/utils/stagebook/position";
import {
  ValidationError,
  cleanText,
  optionalText,
  optionalUuid,
} from "@/utils/stagebook/validation";
import { runAction } from "@/utils/stagebook/action-result";
import { sanitizeDocIcon } from "@/utils/stagebook/doc-icon";
import { sanitizeDocCover } from "@/utils/stagebook/doc-cover";
import { sanitizeFolderColor } from "@/utils/stagebook/folder-colors";
import { isDocFontId } from "@/utils/stagebook/doc-fonts";

const PATH = "/dashboard/documents";
const PATHS = [PATH, "/dashboard/folders"];

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
    liveDocumentWhere(scope),
    folderId ? eq(documents.folderId, folderId) : isNull(documents.folderId),
    parentId ? eq(documents.parentId, parentId) : isNull(documents.parentId)
  );
  const rows = await db.select({ position: documents.position }).from(documents).where(where);
  return nextPosition(rows.map((r) => r.position));
}

// ---------------------------------------------------------------------------
// Folders
// ---------------------------------------------------------------------------

async function insertFolder(scope: StagebookScope, parentId: string | null) {
  if (parentId) {
    const [parent] = await db
      .select({ id: folders.id })
      .from(folders)
      .where(
        and(
          eq(folders.id, parentId),
          scopeWhere(scope, { userId: folders.userId, teamId: folders.teamId })
        )
      )
      .limit(1);
    if (!parent) throw new ValidationError("Pasta pai inválida.");
  }

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

  return created;
}

async function setFolderName(scope: StagebookScope, id: string, name: string) {
  await db
    .update(folders)
    .set({ name, updatedAt: new Date() })
    .where(
      and(
        eq(folders.id, id),
        scopeWhere(scope, { userId: folders.userId, teamId: folders.teamId })
      )
    );
}

async function setDocumentTitle(scope: StagebookScope, id: string, title: string) {
  await db
    .update(documents)
    .set({ title, updatedBy: scope.userId, updatedAt: new Date() })
    .where(
      and(
        eq(documents.id, id),
        liveDocumentWhere(scope)
      )
    );
}

async function setDocumentContent(
  scope: StagebookScope,
  id: string,
  content: Record<string, unknown>
) {
  // Guarda o estado anterior no histórico (no máximo uma versão a cada
  // VERSION_INTERVAL_MS; só as 5 mais recentes ficam).
  await snapshotBeforeContentChange(scope, id, content);
  const [saved] = await db
    .update(documents)
    .set({ content, updatedBy: scope.userId, updatedAt: new Date() })
    .where(and(eq(documents.id, id), liveDocumentWhere(scope)))
    .returning({ updatedAt: documents.updatedAt });
  return saved ?? null;
}

async function setDocumentIcon(scope: StagebookScope, id: string, icon: string | null) {
  await db
    .update(documents)
    .set({ icon: sanitizeDocIcon(icon), updatedBy: scope.userId, updatedAt: new Date() })
    .where(
      and(
        eq(documents.id, id),
        liveDocumentWhere(scope)
      )
    );
}

function revalidateDocumentPaths() {
  PATHS.forEach((path) => revalidatePath(path, "layout"));
}

export async function createFolder(parentId: string | null = null) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const created = await insertFolder(scope, parentId);

    PATHS.forEach((path) => revalidatePath(path, "layout"));
    return created;
  });
}

export async function renameFolder(id: string, name: string) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const clean = cleanText(name, { fallback: "Nova pasta", maxLength: 120 });
    await setFolderName(scope, id, clean);
    revalidateDocumentPaths();
  });
}

/** Atualiza o ícone (mesmo formato dos ícones de página) e/ou a cor da pasta. */
export async function updateFolderAppearance(
  id: string,
  patch: { icon?: string | null; color?: string | null }
) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const values: { icon?: string | null; color?: string | null; updatedAt: Date } = {
      updatedAt: new Date(),
    };
    if ("icon" in patch) values.icon = sanitizeDocIcon(patch.icon ?? null);
    if ("color" in patch) values.color = sanitizeFolderColor(patch.color);
    await db
      .update(folders)
      .set(values)
      .where(
        and(eq(folders.id, id), scopeWhere(scope, { userId: folders.userId, teamId: folders.teamId }))
      );
    PATHS.forEach((path) => revalidatePath(path, "layout"));
  });
}

export async function deleteFolder(id: string) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    // Pages dentro da pasta não são apagadas: a FK folder_id tem onDelete "set
    // null", então elas voltam pra raiz do Stagebook (seção 42).
    await db
      .delete(folders)
      .where(
        and(eq(folders.id, id), scopeWhere(scope, { userId: folders.userId, teamId: folders.teamId }))
      );
    PATHS.forEach((path) => revalidatePath(path, "layout"));
  });
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export async function createDocument(
  folderId: string | null = null,
  parentId: string | null = null
) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();

    if (folderId) {
      const [folder] = await db
        .select({ id: folders.id })
        .from(folders)
        .where(
          and(
            eq(folders.id, folderId),
            scopeWhere(scope, { userId: folders.userId, teamId: folders.teamId })
          )
        )
        .limit(1);
      if (!folder) throw new ValidationError("Pasta inválida.");
    }

    if (parentId) {
      const [parent] = await db
        .select({ id: documents.id })
        .from(documents)
        .where(
          and(
            eq(documents.id, parentId),
            liveDocumentWhere(scope)
          )
        )
        .limit(1);
      if (!parent) throw new ValidationError("Página pai inválida.");
    }

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
  });
}

export async function duplicateDocument(id: string) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const [source] = await db
      .select({
        title: documents.title,
        icon: documents.icon,
        cover: documents.cover,
        description: documents.description,
        font: documents.font,
        folderId: documents.folderId,
        parentId: documents.parentId,
        content: documents.content,
        properties: documents.properties,
        milestoneId: documents.milestoneId,
      })
      .from(documents)
      .where(
        and(eq(documents.id, id), liveDocumentWhere(scope))
      )
      .limit(1);

    if (!source) throw new ValidationError("Página não encontrada.");

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
        font: source.font,
        content: source.content,
        properties: source.properties,
        milestoneId: source.milestoneId,
        createdBy: scope.userId,
        position,
      })
      .returning({ id: documents.id });

    revalidatePath(PATH, "layout");
    return created;
  });
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
  return runAction(async () => {
    const scope = await resolveStagebookScope();

    if (type === "document") {
      const folderId = target.folderId ?? null;
      const parentPageId = target.parentPageId ?? null;

      if (parentPageId === id) {
        throw new ValidationError("Uma página não pode ser subpage de si mesma.");
      }

      if (parentPageId) {
        // Impede ciclos: a página-alvo não pode ser descendente da que está sendo movida.
        const scopedDocs = await db
          .select({ id: documents.id, parentId: documents.parentId })
          .from(documents)
          .where(liveDocumentWhere(scope));
        const byId = new Map(scopedDocs.map((d) => [d.id, d]));
        if (!byId.has(parentPageId)) {
          throw new ValidationError("Página de destino inválida.");
        }
        let cursor: string | null = byId.get(parentPageId)?.parentId ?? null;
        while (cursor) {
          if (cursor === id) {
            throw new ValidationError("Uma página não pode ser movida para dentro de uma de suas próprias subpages.");
          }
          cursor = byId.get(cursor)?.parentId ?? null;
        }
      }

      const position = await nextDocumentPosition(scope, parentPageId ? null : folderId, parentPageId);

      await db
        .update(documents)
        .set({ folderId: parentPageId ? null : folderId, parentId: parentPageId, position, updatedAt: new Date() })
        .where(
          and(eq(documents.id, id), liveDocumentWhere(scope))
        );
    } else {
      const targetFolderId = target.folderId ?? null;
      if (targetFolderId === id) {
        throw new ValidationError("Uma pasta não pode conter a si mesma.");
      }

      const scopedFolders = await db
        .select({ id: folders.id, parentId: folders.parentId })
        .from(folders)
        .where(scopeWhere(scope, { userId: folders.userId, teamId: folders.teamId }));
      const byId = new Map(scopedFolders.map((f) => [f.id, f]));

      if (targetFolderId && !byId.has(targetFolderId)) {
        throw new ValidationError("Pasta de destino inválida.");
      }

      let cursor = targetFolderId ? byId.get(targetFolderId)?.parentId ?? null : null;
      while (cursor) {
        if (cursor === id) {
          throw new ValidationError("Uma pasta não pode ser movida para dentro de si mesma.");
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
  });
}

export async function renameDocument(id: string, title: string) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const clean = cleanText(title, { fallback: "Sem título", maxLength: 200 });
    await setDocumentTitle(scope, id, clean);
    revalidatePath(PATH, "layout");
  });
}

export async function updateDocumentIcon(id: string, icon: string | null) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    await setDocumentIcon(scope, id, icon);
    revalidatePath(PATH, "layout");
  });
}

export async function updateDocumentCover(id: string, cover: string | null) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    await db
      .update(documents)
      .set({ cover: sanitizeDocCover(cover), updatedBy: scope.userId, updatedAt: new Date() })
      .where(
        and(eq(documents.id, id), liveDocumentWhere(scope))
      );
    revalidatePath(PATH, "layout");
  });
}

/** Fonte da página inteira ("default" ou null volta para a fonte padrão). */
export async function updateDocumentFont(id: string, font: string | null) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    if (font !== null && !isDocFontId(font)) throw new ValidationError("Fonte inválida.");
    await db
      .update(documents)
      .set({
        font: font === "default" ? null : font,
        updatedBy: scope.userId,
        updatedAt: new Date(),
      })
      .where(and(eq(documents.id, id), liveDocumentWhere(scope)));
  });
}

export async function updateDocumentDescription(id: string, description: string) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    await db
      .update(documents)
      .set({
        description: optionalText(description, 500),
        updatedBy: scope.userId,
        updatedAt: new Date(),
      })
      .where(
        and(eq(documents.id, id), liveDocumentWhere(scope))
      );
    revalidatePath(PATH, "layout");
  });
}

export async function updateDocumentProperty(id: string, key: string, value: unknown) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const safeKey = cleanText(key, { maxLength: 60 });
    if (!safeKey) throw new ValidationError("Nome de propriedade inválido.");

    const [current] = await db
      .select({ properties: documents.properties })
      .from(documents)
      .where(
        and(eq(documents.id, id), liveDocumentWhere(scope))
      )
      .limit(1);
    if (!current) throw new ValidationError("Página não encontrada.");

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
  });
}

// Chamada a cada autosave do editor — não revalida a árvore da sidebar
// (título/ícone não mudam aqui), só grava o conteúdo.
export async function updateDocumentContent(id: string, content: unknown) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const saved = await setDocumentContent(scope, id, content as Record<string, unknown>);
    if (!saved) throw new ValidationError("Página não encontrada.");
    return { updatedAt: new Date(saved.updatedAt).toISOString() };
  });
}

/**
 * Envia a página para a lixeira (fica restaurável por 7 dias). As subpages não
 * vão junto: sobem um nível, para o lugar que a página ocupava (seção 42).
 */
export async function deleteDocument(id: string) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const [page] = await db
      .select({ id: documents.id, folderId: documents.folderId, parentId: documents.parentId })
      .from(documents)
      .where(and(eq(documents.id, id), liveDocumentWhere(scope)))
      .limit(1);
    if (!page) return;

    const now = new Date();
    await db
      .update(documents)
      .set({
        parentId: page.parentId,
        folderId: page.parentId ? null : page.folderId,
        updatedAt: now,
      })
      .where(and(eq(documents.parentId, page.id), liveDocumentWhere(scope)));
    await db
      .update(documents)
      .set({ deletedAt: now, updatedBy: scope.userId })
      .where(and(eq(documents.id, page.id), liveDocumentWhere(scope)));

    await purgeExpiredTrash(scope, now);
    revalidatePath(PATH, "layout");
  });
}

// Tags e milestones de páginas: veja utils/stagebook/actions/{tags,milestones}.ts
// (kind "document").

export { optionalUuid };
