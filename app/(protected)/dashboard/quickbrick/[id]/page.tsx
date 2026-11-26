import { notFound } from "next/navigation";
import { NotebookStudio } from "@/features/quickbrick/notebook/components/NotebookStudio";
import { getNotebook } from "@/features/quickbrick/shared/actions";

export const metadata = { title: "Caderno · QuickBrick Studio" };

export default async function NotebookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getNotebook(id);
  if (!detail) notFound();
  // `key` reinicia o estado local quando outro caderno é aberto.
  return <NotebookStudio key={detail.notebook.id} detail={detail} />;
}
