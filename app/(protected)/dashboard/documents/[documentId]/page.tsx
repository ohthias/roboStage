import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { documents } from "@/db/schema";
import { resolveStagebookScope } from "@/utils/stagebook/scope";
import { scopeWhere } from "@/utils/stagebook/permissions";
import { requireUuid, ValidationError } from "@/utils/stagebook/validation";
import { trashDaysLeft } from "@/utils/stagebook/document-history";
import { NotebookEditor } from "./document-editor";
import { TrashedDocumentNotice } from "./trashed-document-notice";
import { getResourceTags } from "@/utils/stagebook/actions/tags";
import { getResourceMilestone } from "@/utils/stagebook/actions/milestones";

export default async function NotebookDocumentPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  try {
    requireUuid(documentId);
  } catch (error) {
    if (error instanceof ValidationError) notFound();
    throw error;
  }

  const scope = await resolveStagebookScope();

  // Uma única ida ao banco para a página (mais tags/milestone em paralelo).
  // A árvore, o breadcrumb e as opções de "Mover para..." vêm do layout, que
  // já carregou todas as pastas e páginas — nada disso é buscado de novo aqui.
  const [document, documentTags, documentMilestone] = await Promise.all([
    db
      .select({
        id: documents.id,
        title: documents.title,
        icon: documents.icon,
        description: documents.description,
        cover: documents.cover,
        font: documents.font,
        properties: documents.properties,
        content: documents.content,
        folderId: documents.folderId,
        parentId: documents.parentId,
        updatedAt: documents.updatedAt,
        deletedAt: documents.deletedAt,
      })
      .from(documents)
      .where(
        and(
          eq(documents.id, documentId),
          scopeWhere(scope, { userId: documents.userId, teamId: documents.teamId }),
        ),
      )
      .limit(1)
      .then((rows) => rows[0]),
    getResourceTags("document", documentId).catch(() => []),
    getResourceMilestone("document", documentId).catch(() => null),
  ]);

  if (!document) notFound();

  if (document.deletedAt) {
    const deletedAt = new Date(document.deletedAt);
    // Passou do prazo da lixeira: para o usuário, a página já não existe.
    if (trashDaysLeft(deletedAt) === 0) notFound();
    return (
      <TrashedDocumentNotice
        documentId={document.id}
        title={document.title}
        icon={document.icon}
        deletedAt={deletedAt.toISOString()}
      />
    );
  }

  return (
    <NotebookEditor
      key={document.id}
      documentId={document.id}
      initialTitle={document.title}
      initialIcon={document.icon}
      initialDescription={document.description}
      initialCover={document.cover}
      initialFont={document.font}
      initialProperties={document.properties ?? {}}
      initialTags={documentTags}
      initialMilestone={documentMilestone}
      initialContent={document.content}
      initialUpdatedAt={new Date(document.updatedAt).toISOString()}
      currentFolderId={document.folderId}
      currentParentId={document.parentId}
    />
  );
}
