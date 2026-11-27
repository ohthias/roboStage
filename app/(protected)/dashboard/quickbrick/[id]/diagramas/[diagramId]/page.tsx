import { notFound } from "next/navigation";
import { DiagramEditor } from "@/features/quickbrick/notebook/components/DiagramEditor";
import { getDiagram } from "@/features/quickbrick/shared/actions";

export const metadata = { title: "Diagrama · QuickBrick Studio" };

export default async function DiagramPage({
  params,
}: {
  params: Promise<{ id: string; diagramId: string }>;
}) {
  const { id, diagramId } = await params;
  const diagram = await getDiagram(diagramId);
  if (!diagram || diagram.notebookId !== id) notFound();
  // `key` recria o editor se outro diagrama for aberto na mesma rota.
  return <DiagramEditor key={diagram.id} diagram={diagram} />;
}
