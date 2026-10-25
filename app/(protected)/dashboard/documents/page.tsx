import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { documents } from "@/db/schema";
import { resolveStagebookScope } from "@/utils/stagebook/scope";
import { scopeWhere } from "@/utils/stagebook/permissions";
import { DocumentsHome, type HomeDocument } from "./documents-home";

export default async function NotebookIndexPage() {
  const scope = await resolveStagebookScope();

  const rows = await db
    .select({
      id: documents.id,
      title: documents.title,
      icon: documents.icon,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .where(scopeWhere(scope, { userId: documents.userId, teamId: documents.teamId }))
    .orderBy(desc(documents.updatedAt))
    .limit(40);

  const docs: HomeDocument[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    icon: r.icon,
    updatedAt: new Date(r.updatedAt).toISOString(),
  }));

  return <DocumentsHome docs={docs} />;
}
