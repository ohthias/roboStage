import { count, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { documents, folders } from "@/db/schema";
import { scopeWhere } from "@/utils/stagebook/permissions";
import { resolveStagebookScope } from "@/utils/stagebook/scope";
import { FoldersView, type FolderItem } from "./folders-view";

export default async function FoldersPage() {
  const scope = await resolveStagebookScope();
  const folderScope = scopeWhere(scope, {
    userId: folders.userId,
    teamId: folders.teamId,
  });
  const documentScope = scopeWhere(scope, {
    userId: documents.userId,
    teamId: documents.teamId,
  });

  const [folderRows, documentCounts] = await Promise.all([
    db
      .select({
        id: folders.id,
        parentId: folders.parentId,
        name: folders.name,
        icon: folders.icon,
        position: folders.position,
      })
      .from(folders)
      .where(folderScope)
      .orderBy(folders.position, folders.name),
    db
      .select({
        folderId: documents.folderId,
        count: count(documents.id),
      })
      .from(documents)
      .where(documentScope)
      .groupBy(documents.folderId),
  ]);

  const counts = new Map(
    documentCounts
      .filter((row): row is { folderId: string; count: number } => row.folderId !== null)
      .map((row) => [row.folderId, Number(row.count)])
  );

  const items: FolderItem[] = folderRows.map((folder) => ({
    ...folder,
    documentCount: counts.get(folder.id) ?? 0,
  }));

  return <FoldersView folders={items} />;
}
