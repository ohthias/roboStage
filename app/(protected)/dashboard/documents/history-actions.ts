"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { documents, documentVersions, folders, users } from "@/db/schema";
import { resolveStagebookScope, type StagebookScope } from "@/utils/stagebook/scope";
import { scopeWhere } from "@/utils/stagebook/permissions";
import { nextPosition } from "@/utils/stagebook/position";
import { ValidationError, requireUuid } from "@/utils/stagebook/validation";
import { runAction } from "@/utils/stagebook/action-result";
import { MAX_DOCUMENT_VERSIONS } from "@/utils/stagebook/document-history";
import { lexicalToPlainText } from "@/utils/stagebook/lexical-text";
import {
  liveDocumentWhere,
  loadTrash,
  pruneVersions,
  purgeExpiredTrash,
  recordVersion,
  trashedDocumentWhere,
} from "./history-core";

const PATH = "/dashboard/documents";

export type DocumentVersionSummary = {
  id: string;
  title: string;
  icon: string | null;
  createdAt: string; // ISO
  authorName: string | null;
  text: string;
};

export type { TrashedDocument } from "./history-core";

async function requireLiveDocument(scope: StagebookScope, documentId: string) {
  requireUuid(documentId, "Identificador da página");
  const [page] = await db
    .select({
      id: documents.id,
      title: documents.title,
      icon: documents.icon,
      content: documents.content,
    })
    .from(documents)
    .where(and(eq(documents.id, documentId), liveDocumentWhere(scope)))
    .limit(1);
  if (!page) throw new ValidationError("Página não encontrada.");
  return page;
}

// ---------------------------------------------------------------------------
// Histórico de versões
// ---------------------------------------------------------------------------

/** As (até 5) versões salvas da página, da mais recente para a mais antiga. */
export async function listDocumentVersions(documentId: string) {
  return runAction(async (): Promise<DocumentVersionSummary[]> => {
    const scope = await resolveStagebookScope();
    await requireLiveDocument(scope, documentId);

    const rows = await db
      .select({
        id: documentVersions.id,
        title: documentVersions.title,
        icon: documentVersions.icon,
        content: documentVersions.content,
        createdAt: documentVersions.createdAt,
        authorName: users.name,
      })
      .from(documentVersions)
      .leftJoin(users, eq(users.id, documentVersions.createdBy))
      .where(eq(documentVersions.documentId, documentId))
      .orderBy(desc(documentVersions.createdAt), desc(documentVersions.id))
      .limit(MAX_DOCUMENT_VERSIONS);

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      icon: row.icon,
      createdAt: new Date(row.createdAt).toISOString(),
      authorName: row.authorName,
      text: lexicalToPlainText(row.content),
    }));
  });
}

/** Guarda o estado atual da página como uma versão, na hora. */
export async function saveDocumentVersion(documentId: string) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const page = await requireLiveDocument(scope, documentId);
    if (!page.content) throw new ValidationError("A página ainda está vazia.");
    const created = await recordVersion(scope, documentId, page);
    return { created };
  });
}

/**
 * Volta a página para uma versão do histórico. O estado atual entra no
 * histórico antes, então a restauração também pode ser desfeita.
 */
export async function restoreDocumentVersion(documentId: string, versionId: string) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    requireUuid(versionId, "Identificador da versão");
    const page = await requireLiveDocument(scope, documentId);

    const [version] = await db
      .select({
        title: documentVersions.title,
        icon: documentVersions.icon,
        content: documentVersions.content,
      })
      .from(documentVersions)
      .where(and(eq(documentVersions.id, versionId), eq(documentVersions.documentId, documentId)))
      .limit(1);
    if (!version) throw new ValidationError("Versão não encontrada.");

    await recordVersion(scope, documentId, page);
    await db
      .update(documents)
      .set({
        title: version.title,
        icon: version.icon,
        content: version.content,
        updatedBy: scope.userId,
        updatedAt: new Date(),
      })
      .where(and(eq(documents.id, documentId), liveDocumentWhere(scope)));
    await pruneVersions(documentId);

    revalidatePath(PATH, "layout");
    return version;
  });
}

// ---------------------------------------------------------------------------
// Lixeira
// ---------------------------------------------------------------------------

/** Páginas na lixeira do scope atual (as vencidas são apagadas antes). */
export async function listTrashedDocuments() {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    return loadTrash(scope);
  });
}

/**
 * Tira a página da lixeira. Volta para onde estava; se a pasta ou a página-pai
 * não existirem mais (ou também estiverem na lixeira), volta para a raiz.
 */
export async function restoreDocument(id: string) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    requireUuid(id, "Identificador da página");

    const [page] = await db
      .select({ id: documents.id, folderId: documents.folderId, parentId: documents.parentId })
      .from(documents)
      .where(and(eq(documents.id, id), trashedDocumentWhere(scope)))
      .limit(1);
    if (!page) throw new ValidationError("Página não encontrada na lixeira.");

    let parentId = page.parentId;
    if (parentId) {
      const [parent] = await db
        .select({ id: documents.id })
        .from(documents)
        .where(and(eq(documents.id, parentId), liveDocumentWhere(scope)))
        .limit(1);
      if (!parent) parentId = null;
    }

    let folderId = parentId ? null : page.folderId;
    if (folderId) {
      const [folder] = await db
        .select({ id: folders.id })
        .from(folders)
        .where(
          and(
            eq(folders.id, folderId),
            scopeWhere(scope, { userId: folders.userId, teamId: folders.teamId }),
          ),
        )
        .limit(1);
      if (!folder) folderId = null;
    }

    const siblings = await db
      .select({ position: documents.position })
      .from(documents)
      .where(
        and(
          liveDocumentWhere(scope),
          folderId ? eq(documents.folderId, folderId) : isNull(documents.folderId),
          parentId ? eq(documents.parentId, parentId) : isNull(documents.parentId),
        ),
      );

    await db
      .update(documents)
      .set({
        deletedAt: null,
        folderId,
        parentId,
        position: nextPosition(siblings.map((s) => s.position)),
        updatedBy: scope.userId,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, page.id));

    revalidatePath(PATH, "layout");
    return { id: page.id };
  });
}

/** Apaga de vez uma página que está na lixeira (com o histórico dela). */
export async function deleteDocumentForever(id: string) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    requireUuid(id, "Identificador da página");
    await db.delete(documents).where(and(eq(documents.id, id), trashedDocumentWhere(scope)));
    revalidatePath(PATH, "layout");
  });
}

/** Esvazia a lixeira do scope atual. */
export async function emptyTrash() {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    await purgeExpiredTrash(scope);
    await db.delete(documents).where(trashedDocumentWhere(scope));
    revalidatePath(PATH, "layout");
  });
}
