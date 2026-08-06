import type { ReactNode } from "react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { DocumentsSidebar } from "./documents-sidebar";

export default async function DocumentsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;

  const docs = await db
    .select({
      id: documents.id,
      title: documents.title,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .where(eq(documents.organizationId, organizationId))
    .orderBy(desc(documents.updatedAt));

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <DocumentsSidebar organizationId={organizationId} documents={docs} />

      <div className="min-h-[560px] rounded-2xl border border-base-300 bg-base-100">
        {children}
      </div>
    </div>
  );
}