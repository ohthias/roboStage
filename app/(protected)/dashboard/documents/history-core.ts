import "server-only";

import { and, desc, eq, isNotNull, isNull, lt, notInArray, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { documents, documentVersions, users } from "@/db/schema";
import type { StagebookScope } from "@/utils/stagebook/scope";
import { scopeWhere } from "@/utils/stagebook/permissions";
import {
  MAX_DOCUMENT_VERSIONS,
  shouldSnapshot,
  trashCutoff,
  trashExpiresAt,
} from "@/utils/stagebook/document-history";
import { lexicalToPlainText } from "@/utils/stagebook/lexical-text";

export type TrashedDocument = {
  id: string;
  title: string;
  icon: string | null;
  deletedAt: string; // ISO
  expiresAt: string; // ISO
  deletedByName: string | null;
  preview: string;
};

/** Páginas do scope que NÃO estão na lixeira. */
export function liveDocumentWhere(scope: StagebookScope) {
  return and(
    scopeWhere(scope, { userId: documents.userId, teamId: documents.teamId }),
    isNull(documents.deletedAt),
  );
}

/** Páginas do scope que estão na lixeira e ainda dentro do prazo de 7 dias. */
export function trashedDocumentWhere(scope: StagebookScope, now = new Date()) {
  return and(
    scopeWhere(scope, { userId: documents.userId, teamId: documents.teamId }),
    isNotNull(documents.deletedAt),
    sql`${documents.deletedAt} > ${trashCutoff(now).toISOString()}`,
  );
}

/** Apaga de vez as páginas do scope que estão na lixeira há mais de 7 dias. */
export async function purgeExpiredTrash(scope: StagebookScope, now = new Date()) {
  await db
    .delete(documents)
    .where(
      and(
        scopeWhere(scope, { userId: documents.userId, teamId: documents.teamId }),
        isNotNull(documents.deletedAt),
        lt(documents.deletedAt, trashCutoff(now)),
      ),
    );
}

/** JSON com chaves ordenadas: o jsonb do Postgres reordena as chaves. */
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

export function sameContent(a: unknown, b: unknown) {
  return stableStringify(a) === stableStringify(b);
}

/** Mantém só as MAX_DOCUMENT_VERSIONS versões mais recentes da página. */
export async function pruneVersions(documentId: string) {
  const keep = await db
    .select({ id: documentVersions.id })
    .from(documentVersions)
    .where(eq(documentVersions.documentId, documentId))
    .orderBy(desc(documentVersions.createdAt), desc(documentVersions.id))
    .limit(MAX_DOCUMENT_VERSIONS);
  if (keep.length < MAX_DOCUMENT_VERSIONS) return;
  await db.delete(documentVersions).where(
    and(
      eq(documentVersions.documentId, documentId),
      notInArray(
        documentVersions.id,
        keep.map((row) => row.id),
      ),
    ),
  );
}

type Snapshot = {
  title: string;
  icon: string | null;
  content: Record<string, unknown> | null;
};

/**
 * Registra `snapshot` como versão da página (sem checar o intervalo), a não ser
 * que seja idêntico à versão mais recente. Depois aplica o limite de 5.
 */
export async function recordVersion(
  scope: StagebookScope,
  documentId: string,
  snapshot: Snapshot,
  now = new Date(),
) {
  if (!snapshot.content) return false;
  const [latest] = await db
    .select({ content: documentVersions.content, title: documentVersions.title })
    .from(documentVersions)
    .where(eq(documentVersions.documentId, documentId))
    .orderBy(desc(documentVersions.createdAt), desc(documentVersions.id))
    .limit(1);
  if (latest && latest.title === snapshot.title && sameContent(latest.content, snapshot.content)) {
    return false;
  }
  await db.insert(documentVersions).values({
    documentId,
    title: snapshot.title,
    icon: snapshot.icon,
    content: snapshot.content,
    createdBy: scope.userId,
    createdAt: now,
  });
  await pruneVersions(documentId);
  return true;
}

/**
 * Chamado antes de cada gravação de conteúdo (autosave). Se a última versão
 * tem mais de VERSION_INTERVAL_MS, guarda o conteúdo atual — o estado antes
 * desta sessão de edição — como uma nova versão.
 */
export async function snapshotBeforeContentChange(
  scope: StagebookScope,
  documentId: string,
  nextContent: Record<string, unknown>,
  now = new Date(),
) {
  const [current] = await db
    .select({ title: documents.title, icon: documents.icon, content: documents.content })
    .from(documents)
    .where(and(eq(documents.id, documentId), liveDocumentWhere(scope)))
    .limit(1);
  if (!current?.content || sameContent(current.content, nextContent)) return;

  const [last] = await db
    .select({ createdAt: documentVersions.createdAt })
    .from(documentVersions)
    .where(eq(documentVersions.documentId, documentId))
    .orderBy(desc(documentVersions.createdAt))
    .limit(1);
  if (!shouldSnapshot(last ? new Date(last.createdAt) : null, now)) return;

  await recordVersion(scope, documentId, current, now);
}

/** Páginas na lixeira do scope (as vencidas são apagadas antes de listar). */
export async function loadTrash(scope: StagebookScope): Promise<TrashedDocument[]> {
  const now = new Date();
  await purgeExpiredTrash(scope, now);
  const rows = await db
    .select({
      id: documents.id,
      title: documents.title,
      icon: documents.icon,
      content: documents.content,
      deletedAt: documents.deletedAt,
      deletedByName: users.name,
    })
    .from(documents)
    .leftJoin(users, eq(users.id, documents.updatedBy))
    .where(trashedDocumentWhere(scope, now))
    .orderBy(desc(documents.deletedAt));

  return rows.map((row) => {
    const deletedAt = new Date(row.deletedAt!);
    return {
      id: row.id,
      title: row.title,
      icon: row.icon,
      deletedAt: deletedAt.toISOString(),
      expiresAt: trashExpiresAt(deletedAt).toISOString(),
      deletedByName: row.deletedByName,
      preview: lexicalToPlainText(row.content, 160),
    };
  });
}

