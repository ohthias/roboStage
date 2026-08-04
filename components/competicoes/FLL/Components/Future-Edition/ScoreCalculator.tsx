"use client";
import { MissionsData } from "@/app/(public)/[competicao]/(fll)/future-edition/score/scoring.type";
import { useScoreCalculator } from "@/hooks/useScoreCalculator";
import MissionCard from "./MissionCard";
import PenaltyCard from "./PenaltyCard";

interface ScoreCalculatorProps {
  data: MissionsData;
}

export default function ScoreCalculator({ data }: ScoreCalculatorProps) {
  const {
    objectiveValues,
    setObjectiveValue,
    penaltyCount,
    setPenaltyCount,
    reset,
    missionScores,
    penaltyTier,
    total,
  } = useScoreCalculator(data);

  const missionScoreById = Object.fromEntries(missionScores.map((m) => [m.id, m]));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
      <div className="space-y-4">
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

        <PenaltyCard
          penalties={data.penalties}
          count={penaltyCount}
          tier={penaltyTier}
          onChange={setPenaltyCount}
        />
      </div>

      <aside className="lg:sticky lg:top-6 h-fit">
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 text-center">
          <p className="uppercase text-xs tracking-widest text-secondary font-semibold mb-1">
            Pontuação total
          </p>
          <p className="text-6xl font-black text-secondary">{total}</p>
          {penaltyTier.zeroesTotal && (
            <p className="text-xs text-error font-semibold mt-2">
              Pontuação zerada por excesso de penalidades
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            className="mt-6 w-full btn btn-outline btn-secondary"
          >
            Reiniciar
          </button>
        </div>
      </aside>
    </div>
  );
}