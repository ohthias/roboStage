import { resolveStagebookScope } from "@/utils/stagebook/scope";
import { loadTrash } from "../history-core";
import { TrashView } from "./trash-view";

export const metadata = { title: "Lixeira" };

export default async function TrashPage() {
  const scope = await resolveStagebookScope();
  const items = await loadTrash(scope);
  return <TrashView items={items} />;
}
