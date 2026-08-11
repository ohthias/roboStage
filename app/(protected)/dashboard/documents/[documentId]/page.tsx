import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import type { SerializedEditorState } from "lexical";
import { db } from "@/db";
import { documents, folders } from "@/db/schema";
import { DocumentEditor } from "./document-editor";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ organizationId: string; documentId: string }>;
}) {
  const { organizationId, documentId } = await params;

  const [documentRows, allFolders] = await Promise.all([
    db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.id, documentId),
          eq(documents.organizationId, organizationId)
        )
      ),
    db
      .select({
        id: folders.id,
        name: folders.name,
        icon: folders.icon,
        parentId: folders.parentId,
      })
      .from(folders)
      .where(eq(folders.organizationId, organizationId))
      .orderBy(asc(folders.name)),
  ]);

  const document = documentRows[0];

  if (!document) {
    notFound();
  }

  return (
    <DocumentEditor
      organizationId={organizationId}
      documentId={document.id}
      initialTitle={document.title}
      initialIcon={document.icon}
      initialFolderId={document.folderId}
      initialContent={document.content as SerializedEditorState | null}
      folders={allFolders}
      updatedAt={document.updatedAt}
    />
  );
}