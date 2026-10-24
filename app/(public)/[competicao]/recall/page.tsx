import { notFound } from "next/navigation";
import RecallApp from "./RecallApp";
import { isRecallCompetition } from "./modes";

type Props = {
  params: Promise<{ competicao: string }>;
};

export default async function RecallPage({ params }: Props) {
  const { competicao } = await params;
  if (!isRecallCompetition(competicao)) notFound();

  return <RecallApp key={competicao} competicao={competicao} />;
}
