import { notFound } from "next/navigation";

import { RobotGame } from "../views/RobotGame";
import { JudgingRoom } from "../views/JudgingRoom";
import { CustomTimer } from "../views/CustomTimer";

type Props = {
  params: Promise<{
    mode: string;
  }>;
};

export default async function TimerPage({ params }: Props) {
  const { mode } = await params;

  switch (mode) {
    case "robot-game":
      return <RobotGame />;

    case "judging":
      return <JudgingRoom />;

    case "custom":
      return <CustomTimer />;

    default:
      notFound();
  }
}
