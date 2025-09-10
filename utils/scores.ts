interface SubMission {
  submission: string;
  points: number | number[];
  type: ["switch" | "range", ...(string | number | null)[]];
}

interface Mission {
  id: string;
  name: string;
  mission: string;
  points: number | number[];
  equipment: boolean;
  type: ["switch" | "range", ...(string | number | null)[]];
  image?: string;
  ["sub-mission"]?: SubMission[];
}

interface Responses {
  [index: string]: { [subIndex: number]: number | string }; // missionId → index → valor
}

/**
 * Converte índice ou valor antigo em pontos reais
 */
function resolveRangePoints(
  selection: number | string | undefined,
  points: number | number[],
  start = 0,
  end = 10
): number {
  if (selection === undefined || selection === null) return 0;

  const count = end - start + 1;
  const toIdx = (): number | undefined => {
    if (typeof selection === "number") {
      if (Number.isInteger(selection) && selection >= 0 && selection < count)
        return selection;
      if (Array.isArray(points)) {
        const idx = (points as number[]).findIndex((p) => p === selection);
        if (idx !== -1) return idx;
      } else {
        const step = Number(points) || 0;
        if (step > 0) {
          const idx = Math.round(selection / step);
          if (step * idx === selection && idx >= 0 && idx < count) return idx;
        }
      }
    } else if (typeof selection === "string") {
      const m = selection.match(/(?:^i:|^-?\d+(?:\.\d+)?-)(\d+)$/);
      if (m) {
        const idx = Number(m[1]);
        if (idx >= 0 && idx < count) return idx;
      }
    }
    return undefined;
  };

  const idx = toIdx();
  if (idx === undefined) return 0;

  if (Array.isArray(points)) return Number((points as number[])[idx] ?? 0);
  return (Number(points) || 0) * idx;
}

/**
 * Soma todos os pontos de missões e sub-missões usando responses
 */
export function sumAllMissions(
  missions: Mission[],
  responses: { [missionId: string]: { [index: number]: number | string } }
): number {
  let total = 0;

  for (const mission of missions) {
    const missionResponses = responses[mission.id] || {};

    // Missão principal
    if (mission.type[0] === "range") {
      total += resolveRangePoints(
        missionResponses[0],
        mission.points,
        Number(mission.type[1]) || 0,
        Number(mission.type[2]) || 10
      );
    } else {
      total += Number(missionResponses[0] || 0);
    }

    // Submissões
    mission["sub-mission"]?.forEach((sub, idx) => {
      const resp = missionResponses[idx + 1];
      if (sub.type[0] === "range") {
        total += resolveRangePoints(
          resp,
          sub.points,
          Number(sub.type[1]) || 0,
          Number(sub.type[2]) || 10
        );
      } else {
        total += Number(resp || 0);
      }
    });
  }

  return total;
}
