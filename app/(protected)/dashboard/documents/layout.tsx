import type { ReactNode } from "react";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { documents, folders } from "@/db/schema";
import { DocumentsSidebar } from "./documents-sidebar";

export default async function DocumentsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: any;
}) {
  const { organizationId } = params as { organizationId: string };

  const [docs, allFolders] = await Promise.all([
    db
      .select({
        id: documents.id,
        title: documents.title,
        icon: documents.icon,
        folderId: documents.folderId,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .where(eq(documents.teamId, organizationId))
      .orderBy(desc(documents.updatedAt)),
    db
      .select({
        id: folders.id,
        name: folders.name,
        icon: folders.icon,
        parentId: folders.parentId,
      })
      .from(folders)
      .where(eq(folders.teamId, organizationId))
      .orderBy(asc(folders.name)),
  ]);

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <DocumentsSidebar
        organizationId={organizationId}
        documents={docs}
        folders={allFolders}
      />

      <div className="min-h-[560px] rounded-2xl border border-base-300 bg-base-100">
        {children}
      </div>
    </div>
  );
}