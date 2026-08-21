import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { documents, folders } from "@/db/schema";
import { NotebookEditor } from "./document-editor";

export default async function NotebookDocumentPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [document, folderOptions] = await Promise.all([
    db.query.documents.findFirst({
      where: and(eq(documents.id, documentId), eq(documents.userId, userId)),
    }),
    db
      .select({ id: folders.id, name: folders.name, parentId: folders.parentId })
      .from(folders)
      .where(eq(folders.userId, userId))
      .orderBy(folders.name),
  ]);

  if (!document) notFound();

  return (
    <NotebookEditor
      documentId={document.id}
      initialTitle={document.title}
      initialIcon={document.icon}
      initialContent={document.content}
      currentFolderId={document.folderId}
      folders={folderOptions}
    />
  );
}