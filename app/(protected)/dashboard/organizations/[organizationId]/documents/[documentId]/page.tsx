import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import type { SerializedEditorState } from "lexical";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { DocumentEditor } from "./document-editor";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ organizationId: string; documentId: string }>;
}) {
  const { organizationId, documentId } = await params;

  const [document] = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.id, documentId),
        eq(documents.organizationId, organizationId)
      )
    );

  if (!document) {
    notFound();
  }

  return (
    <DocumentEditor
      organizationId={organizationId}
      documentId={document.id}
      initialTitle={document.title}
      initialContent={document.content as SerializedEditorState | null}
      updatedAt={document.updatedAt}
    />
  );
}