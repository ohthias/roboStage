import { notFound } from "next/navigation";
import { AnatixLabView } from "@/components/labtest/anatix/AnatixLabView";
import { TrainingSessionBanner } from "@/components/stagebook/training-session-banner";
import { getActiveSessionFor } from "@/utils/stagebook/actions/training";
import { getAnatixLab } from "../actions";

export default async function AnatixLabPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const data = await getAnatixLab(id).catch(() => null);
  if (!data) notFound();

  // Lab de equipe com sessão de treino em andamento: as conexões caem nela.
  const activeSession = await getActiveSessionFor({ labId: id });

  return (
    <AnatixLabView
      lab={data.lab}
      sessions={data.sessions}
      banner={activeSession ? <TrainingSessionBanner session={activeSession} /> : null}
    />
  );
}
