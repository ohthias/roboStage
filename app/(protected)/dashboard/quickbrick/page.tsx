import { NotebookShelf } from "@/features/quickbrick/notebook/components/NotebookShelf";
import { listNotebooks, listQuickbrickLeagues } from "@/features/quickbrick/shared/actions";
import { PersonalTransferButton } from "@/features/stagebook/components/transfer/personal-transfer-button";

export const metadata = { title: "QuickBrick Studio · RoboStage" };

export default async function QuickBrickStudioPage() {
  const [notebooks, leagues] = await Promise.all([listNotebooks(), listQuickbrickLeagues()]);
  return <NotebookShelf notebooks={notebooks} leagues={leagues} headerAction={<PersonalTransferButton kind="quickbrick" />} />;
}
