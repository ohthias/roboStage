"use client";
import { MissionsData } from "@/features/scoring/future-edition/types";
import { useScoreCalculator } from "@/features/scoring/hooks/useScoreCalculator";
import { InlineAlert, ScoreBar } from "@/components/stage";
import MissionCard from "./MissionCard";
import PenaltyCard from "./PenaltyCard";

interface ScoreCalculatorProps {
  data: MissionsData;
}

export default function ScoreCalculator({ data }: ScoreCalculatorProps) {
  const { objectiveValues, setObjectiveValue, penaltyCount, setPenaltyCount, reset, missionScores, penaltyTier, total } =
    useScoreCalculator(data);

  const missionScoreById = Object.fromEntries(missionScores.map((m) => [m.id, m]));

  return (
    <div>
      <div className="grid w-full gap-x-5 gap-y-7 pt-3 grid-cols-1 px-4">
        {data.missions.map((mission) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            values={objectiveValues}
            objectiveScores={missionScoreById[mission.id]?.objectiveScores ?? []}
            missionScore={missionScoreById[mission.id]?.score ?? 0}
            onChange={setObjectiveValue}
          />
        ))}

        <PenaltyCard penalties={data.penalties} count={penaltyCount} tier={penaltyTier} onChange={setPenaltyCount} />
      </div>

      <div className="sticky bottom-4 z-20 space-y-2 pt-6">
        {penaltyTier.zeroesTotal && (
          <InlineAlert type="error" className="mx-auto max-w-3xl bg-base-100">
            Pontuação zerada por excesso de penalidades.
          </InlineAlert>
        )}
        <ScoreBar total={total} onReset={reset} className="mx-auto max-w-3xl" />
      </div>
    </div>
  );
}
