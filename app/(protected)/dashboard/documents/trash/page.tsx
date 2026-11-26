import { resolveStagebookScope } from "@/features/stagebook/lib/scope";
import { loadTrash } from "@/features/stagebook/documents/lib/history-core";
import { TrashView } from "@/features/stagebook/documents/components/trash-view";

export const metadata = { title: "Lixeira" };

export default async function TrashPage() {
  const scope = await resolveStagebookScope();
  const items = await loadTrash(scope);
  return <TrashView items={items} />;
}
