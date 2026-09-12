import { notFound } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db/client";
import { documents, folders } from "@/db/schema";
import { resolveStagebookScope } from "@/lib/stagebook/scope";
import { scopeWhere } from "@/lib/stagebook/permissions";
import { NotebookEditor } from "./document-editor";
import { getDocumentTags } from "../actions";

export default async function NotebookDocumentPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  const scope = await resolveStagebookScope();

  const documentScope = scopeWhere(scope, {
    userId: documents.userId,
    teamId: documents.teamId,
  });
  const folderScope = scopeWhere(scope, {
    userId: folders.userId,
    teamId: folders.teamId,
  });

  const [document, folderOptions, pageOptions, documentTags] = await Promise.all([
    db.query.documents.findFirst({
      where: and(eq(documents.id, documentId), documentScope),
    }),
    db
      .select({ id: folders.id, name: folders.name, parentId: folders.parentId })
      .from(folders)
      .where(folderScope)
      .orderBy(folders.name),
    db
      .select({ id: documents.id, title: documents.title })
      .from(documents)
      .where(and(documentScope, ne(documents.id, documentId)))
      .orderBy(documents.title),
    getDocumentTags(documentId),
  ]);

  if (!document) notFound();

  return (
    <NotebookEditor
      documentId={document.id}
      initialTitle={document.title}
      initialIcon={document.icon}
      initialDescription={document.description}
      initialCover={document.cover}
      initialProperties={document.properties ?? {}}
      initialTags={documentTags}
      initialContent={document.content}
      currentFolderId={document.folderId}
      currentParentId={document.parentId}
      folders={folderOptions}
      pages={pageOptions}
    />
  );
}
