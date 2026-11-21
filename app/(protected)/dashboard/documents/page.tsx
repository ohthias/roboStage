import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { documents } from "@/db/schema";
import { resolveStagebookScope } from "@/utils/stagebook/scope";
import { liveDocumentWhere } from "./history-core";
import { DocumentsHome, type HomeDocument } from "./documents-home";
import { PersonalTransferButton } from "@/components/stagebook/transfer/personal-transfer-button";

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
    .where(liveDocumentWhere(scope))
    .orderBy(desc(documents.updatedAt))
    .limit(40);

  const docs: HomeDocument[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    icon: r.icon,
    updatedAt: new Date(r.updatedAt).toISOString(),
  }));

  return <DocumentsHome docs={docs} headerAction={<PersonalTransferButton kind="stagebook" size="sm" />} />;
}
