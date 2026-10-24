import { notFound } from "next/navigation";

import RobotGame from "../views/RobotGame";
import { JudgingRoom } from "../views/JudgingRoom";
import { CustomTimer } from "../views/CustomTimer";
import { ObrRound } from "../views/ObrRound";
import { getTimers } from "../config";

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

    default:
      notFound();
  }
}
