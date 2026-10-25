import { NotebookShelf } from "@/components/QuickBrick/Notebook/NotebookShelf";
import { listNotebooks, listQuickbrickLeagues } from "./actions";

export const metadata = { title: "QuickBrick Studio · RoboStage" };

export default async function QuickBrickStudioPage() {
  const [notebooks, leagues] = await Promise.all([listNotebooks(), listQuickbrickLeagues()]);
  return <NotebookShelf notebooks={notebooks} leagues={leagues} />;
}
