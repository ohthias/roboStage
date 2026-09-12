import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { folders, documents } from "@/db/schema";
import { resolveStagebookScope } from "@/lib/stagebook/scope";
import { scopeWhere } from "@/lib/stagebook/permissions";
import { NotebookTree, type TreeNode } from "./notebook-tree";
import { StagebookAuthError } from "@/lib/stagebook/scope";

type FolderRow = {
  id: string;
  parentId: string | null;
  name: string;
  icon: string | null;
  position: number;
};
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
  let scope;
  try {
    scope = await resolveStagebookScope();
  } catch (error) {
    if (error instanceof StagebookAuthError) redirect("/sign-in");
    throw error;
  }

  const folderScope = scopeWhere(scope, {
    userId: folders.userId,
    teamId: folders.teamId,
  });
  const documentScope = scopeWhere(scope, {
    userId: documents.userId,
    teamId: documents.teamId,
  });

  const [allFolders, allDocuments] = await Promise.all([
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
      .where(documentScope),
  ]);

  const tree = buildTree(null, allFolders, allDocuments);

  return (
    <div className="flex h-full flex-col gap-6 lg:flex-row">
      <aside className="flex w-full max-w-[250px] flex-col gap-2 lg:w-[250px] lg:flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-base-300/50 bg-base-100/90 px-2 py-3 backdrop-blur-md">
        <NotebookTree tree={tree} />
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
}
