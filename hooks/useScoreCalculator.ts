"use client";
import { useMemo, useState } from "react";
import { MissionObjective, MissionsData, MissionValue, PenaltyTier } from "@/app/(public)/[competicao]/(fll)/future-edition/score/scoring.type";

type ObjectiveValues = Record<string, MissionValue>;

function scoreObjective(objective: MissionObjective, raw: MissionValue | undefined): number {
  if (objective.type === "toggle") {
    return raw === true ? objective.points ?? 0 : 0;
  }
  if (objective.type === "counter") {
    const count = typeof raw === "number" ? raw : objective.min ?? 0;
    return count * (objective.pointsPerUnit ?? 0);
  }
  if (objective.type === "select") {
    const opt = objective.options?.find((o) => o.id === raw);
    return opt?.points ?? 0;
  }
  return 0;
}

function resolvePenaltyTier(table: PenaltyTier[], count: number): PenaltyTier {
  const sorted = [...table].sort((a, b) => a.count - b.count);
  let tier = sorted[0];
  for (const t of sorted) {
    if (count >= t.count) tier = t;
  }
  return tier;
}

export function useScoreCalculator(data: MissionsData) {
  const [objectiveValues, setObjectiveValues] = useState<ObjectiveValues>({});
  const [penaltyCount, setPenaltyCount] = useState(0);

  const setObjectiveValue = (id: string, value: MissionValue) =>
    setObjectiveValues((prev) => ({ ...prev, [id]: value }));

  const reset = () => {
    setObjectiveValues({});
    setPenaltyCount(0);
  };

  const missionScores = useMemo(() => {
    return data.missions.map((mission) => {
      const objectiveScores = mission.objectives.map((obj) => ({
        id: obj.id,
        score: scoreObjective(obj, objectiveValues[obj.id]),
      }));
      let missionTotal = objectiveScores.reduce((sum, o) => sum + o.score, 0);
      if (mission.maxScore !== undefined) {
        missionTotal = Math.min(missionTotal, mission.maxScore);
      }
      return { id: mission.id, score: missionTotal, objectiveScores };
    });
  }, [data.missions, objectiveValues]);

  const missionsTotal = useMemo(
    () => missionScores.reduce((sum, m) => sum + m.score, 0),
    [missionScores]
  );

  const penaltyTier = useMemo(
    () => resolvePenaltyTier(data.penalties.table, penaltyCount),
    [data.penalties.table, penaltyCount]
  );

  const total = penaltyTier.zeroesTotal ? 0 : missionsTotal + penaltyTier.points;

  return {
    objectiveValues,
    setObjectiveValue,
    penaltyCount,
    setPenaltyCount,
    reset,
    missionScores,
    missionsTotal,
    penaltyTier,
    total,
  };
}