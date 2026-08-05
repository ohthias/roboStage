"use client";
import {
  Mission,
  MissionValue,
} from "@/app/(public)/[competicao]/(fll)/future-edition/score/scoring.type";
import ObjectiveControl from "./ObjectiveControl";

interface MissionCardProps {
  mission: Mission;
  values: Record<string, MissionValue>;
  objectiveScores: { id: string; score: number }[];
  missionScore: number;
  image?: string;
  onChange: (objectiveId: string, value: MissionValue) => void;
}

export default function MissionCard({
  mission,
  values,
  objectiveScores,
  missionScore,
  image,
  onChange,
}: MissionCardProps) {
  const scoreById = Object.fromEntries(
    objectiveScores.map((o) => [o.id, o.score]),
  );

  return (
    <div className="border border-base-300 rounded-2xl p-5">
      <div className="flex items-start gap-4 mb-4">
        <img
          src={mission.image}
          alt={mission.title}
          className="w-[100px] h-[100px] rounded-lg bg-base-300"
        />
        <div className="flex items-start justify-between gap-4 mb-2 w-full">
          <div>
            <span className="text-xs font-bold text-secondary">
              {mission.code}
            </span>
            <h3 className="font-bold text-lg leading-tight">{mission.title}</h3>
            {mission.description && (
              <p className="text-sm text-base-content/70 mt-1">
                {mission.description}
              </p>
            )}
            {mission.maxScore !== undefined && (
              <p className="text-xs text-base-content/50 mt-1">
                Máximo da missão: {mission.maxScore} pts
              </p>
            )}
          </div>
          <span className="text-2xl font-black text-secondary shrink-0">
            {missionScore}
          </span>
        </div>
      </div>

      <div>
        {mission.objectives.map((objective) => (
          <ObjectiveControl
            key={objective.id}
            objective={objective}
            value={values[objective.id]}
            score={scoreById[objective.id] ?? 0}
            onChange={(v) => onChange(objective.id, v)}
          />
        ))}
      </div>
    </div>
  );
}
