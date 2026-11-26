import { notFound } from "next/navigation";

import RobotGame from "@/features/timers/components/views/RobotGame";
import { JudgingRoom } from "@/features/timers/components/views/JudgingRoom";
import { CustomTimer } from "@/features/timers/components/views/CustomTimer";
import { ObrRound } from "@/features/timers/components/views/ObrRound";
import { FtcMatch } from "@/features/timers/components/views/FtcMatch";
import { getTimers } from "@/features/timers/lib/config";

type Props = {
  params: Promise<{
    competicao: string;
    mode: string;
  }>;
};

export default async function TimerPage({ params }: Props) {
  const { competicao, mode } = await params;

  // só libera modos cadastrados para a competição
  if (!getTimers(competicao).some((t) => t.slug === mode)) notFound();

  const backHref = `/${competicao}/timers`;

  switch (mode) {
    case "robot-game":
      return <RobotGame />;

    case "judging":
      return <JudgingRoom />;

    case "custom":
      return <CustomTimer backHref={backHref} />;

    case "round":
      return <ObrRound backHref={backHref} />;

    case "match":
      return <FtcMatch backHref={backHref} />;

    default:
      notFound();
  }
}
