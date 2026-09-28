import { computeMissionBreakdown } from "@/utils/scores";

export interface FllMissionDefinition {
  id: string;
  name: string;
  mission?: string;
  equipaments?: boolean;
  type?: ["switch" | "range", ...(string | number | null)[]];
  points?: number | number[];
  "sub-mission"?: FllSubMissionDefinition[];
}

export interface FllSubMissionDefinition {
  id?: string;
  submission?: string;
  name?: string;
  type?: ["switch" | "range", ...(string | number | null)[]];
  points?: number | number[];
  requires?: unknown[];
  zero_whole_mission_if_false?: boolean;
}

export interface FllAnswer {
  value: number;
  subAnswers: Record<string, number>;
}

export const getSubMissionKey = (
  mission: FllMissionDefinition,
  subMission: FllSubMissionDefinition,
  index: number,
) => {
  return subMission.id ?? `${mission.id}-sub-${index}`;
};

export function scoreFllMission(
  mission: FllMissionDefinition,
  answer: FllAnswer | undefined,
) {
  if (!answer || !mission.type || mission.points == null) {
    return 0;
  }

  const responses: Record<number, number> = {
    0: answer.value,
  };

  (mission["sub-mission"] ?? []).forEach((subMission, index) => {
    const subId = getSubMissionKey(
      mission,
      subMission,
      index,
    );

    responses[index + 1] =
      answer.subAnswers[subId] ?? 0;
  });

  const breakdown = computeMissionBreakdown(
    {
      ...mission,
      equipaments: mission.equipaments ?? false,
      type: mission.type,
      points: mission.points,
    } as unknown as Parameters<
      typeof computeMissionBreakdown
    >[0],
    responses,
  );

  return breakdown.total;
}

export function scoreFllExecution(
  missions: FllMissionDefinition[],
  answers: Record<string, FllAnswer> | undefined,
) {
  return missions.reduce((total, mission) => total + scoreFllMission(mission, answers?.[mission.id]), 0);
}