import { notFound } from "next/navigation";
import { AnatixLabView } from "@/features/labtest/anatix/components/AnatixLabView";
import { TrainingSessionBanner } from "@/features/stagebook/components/training-session-banner";
import { getActiveSessionFor } from "@/features/stagebook/actions/training";
import { getAnatixLab } from "@/features/labtest/anatix/actions";

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
