import type { ReactNode } from "react";
import { count } from "drizzle-orm";
import { db } from "@/db/client";
import { folders, documents } from "@/db/schema";
import { resolveStagebookScope } from "@/utils/stagebook/scope";
import { scopeWhere } from "@/utils/stagebook/permissions";
import { NotebookTree } from "./notebook-tree";
import { NotebookProvider, type TreeNode } from "./notebook-context";
import { liveDocumentWhere, trashedDocumentWhere } from "./history-core";
import { docFontVariables } from "./doc-fonts";
import type { FolderRow } from "@/types/folders";

type DocumentRow = {
  id: string;
  folderId: string | null;
  parentId: string | null;
  title: string;
  icon: string | null;
  position: number;
};

function byPosition<T extends { position: number }>(a: T, b: T) {
  return a.position - b.position;
}

function buildDocumentChildren(
  parentId: string,
  allDocuments: DocumentRow[]
): TreeNode[] {
  return allDocuments
    .filter((d) => d.parentId === parentId)
    .sort(byPosition)
    .map((d) => ({
      type: "document" as const,
      id: d.id,
      title: d.title,
      icon: d.icon,
      children: buildDocumentChildren(d.id, allDocuments),
    }));
}

function buildTree(
  parentFolderId: string | null,
  allFolders: FolderRow[],
  allDocuments: DocumentRow[]
): TreeNode[] {
  const childFolders: TreeNode[] = allFolders
    .filter((f) => f.parentId === parentFolderId)
    .sort(byPosition)
    .map((f) => ({
      type: "folder" as const,
      id: f.id,
      name: f.name,
      icon: f.icon,
      children: buildTree(f.id, allFolders, allDocuments),
    }));

  const rootDocuments: TreeNode[] = allDocuments
    .filter((d) => d.folderId === parentFolderId && d.parentId === null)
    .sort(byPosition)
    .map((d) => ({
      type: "document" as const,
      id: d.id,
      title: d.title,
      icon: d.icon,
      children: buildDocumentChildren(d.id, allDocuments),
    }));

  return [...childFolders, ...rootDocuments];
}

export default async function NotebookLayout({
  children,
}: {
  children: ReactNode;
}) {
  const scope = await resolveStagebookScope();

  const folderScope = scopeWhere(scope, {
    userId: folders.userId,
    teamId: folders.teamId,
  });
  const [allFolders, rawDocuments, [trash]] = await Promise.all([
    db
      .select({
        id: folders.id,
        parentId: folders.parentId,
        name: folders.name,
        icon: folders.icon,
        position: folders.position,
      })
      .from(folders)
      .where(folderScope),
    db
      .select({
        id: documents.id,
        folderId: documents.folderId,
        parentId: documents.parentId,
        title: documents.title,
        icon: documents.icon,
        position: documents.position,
      })
      .from(documents)
      .where(liveDocumentWhere(scope)),
    db
      .select({ value: count() })
      .from(documents)
      .where(trashedDocumentWhere(scope)),
  ]);

  // Subpage cuja página-pai não está visível (ex.: dados antigos) aparece na
  // raiz em vez de sumir da árvore.
  const liveIds = new Set(rawDocuments.map((d) => d.id));
  const allDocuments = rawDocuments.map((d) =>
    d.parentId && !liveIds.has(d.parentId) ? { ...d, parentId: null } : d
  );

  const tree = buildTree(null, allFolders, allDocuments);
  const trashCount = Number(trash?.value ?? 0);

  return (
    <NotebookProvider tree={tree} trashCount={trashCount}>
      <div className={`flex h-full min-h-[calc(100vh-3.5rem)] lg:flex-row ${docFontVariables}`}>
        <NotebookTree tree={tree} trashCount={trashCount} />

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </NotebookProvider>
  );
}
