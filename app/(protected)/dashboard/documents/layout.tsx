import type { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { folders, documents } from "@/db/schema";
import { NotebookTree, type TreeNode } from "./notebook-tree";

type FolderRow = {
  id: string;
  parentId: string | null;
  name: string;
  icon: string | null;
};
type DocumentRow = {
  id: string;
  folderId: string | null;
  title: string;
  icon: string | null;
};

function buildTree(
  parentId: string | null,
  allFolders: FolderRow[],
  allDocuments: DocumentRow[],
): TreeNode[] {
  const childFolders: TreeNode[] = allFolders
    .filter((f) => f.parentId === parentId)
    .map((f) => ({
      type: "folder" as const,
      id: f.id,
      name: f.name,
      icon: f.icon,
      children: buildTree(f.id, allFolders, allDocuments),
    }));

  const childDocuments: TreeNode[] = allDocuments
    .filter((d) => d.folderId === parentId)
    .map((d) => ({
      type: "document" as const,
      id: d.id,
      title: d.title,
      icon: d.icon,
    }));

  return [...childFolders, ...childDocuments];
}

export default async function NotebookLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [allFolders, allDocuments] = await Promise.all([
    db
      .select({
        id: folders.id,
        parentId: folders.parentId,
        name: folders.name,
        icon: folders.icon,
      })
      .from(folders)
      .where(eq(folders.userId, userId))
      .orderBy(folders.name),
    db
      .select({
        id: documents.id,
        folderId: documents.folderId,
        title: documents.title,
        icon: documents.icon,
      })
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(documents.title),
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
