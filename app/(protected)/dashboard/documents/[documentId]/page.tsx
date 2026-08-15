import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { documents } from "@/db/schema";
import { NotebookEditor } from "./document-editor";

export default async function NotebookDocumentPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const document = await db.query.documents.findFirst({
    where: and(eq(documents.id, documentId), eq(documents.userId, userId)),
  });

  if (!document) notFound();

  return (
    <NotebookEditor
      documentId={document.id}
      initialTitle={document.title}
      initialIcon={document.icon}
      initialContent={document.content}
    />
  );
}