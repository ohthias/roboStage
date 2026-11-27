import type { MissionFilterKey, MissionGuideMission, RawMissionType } from "./types";

/** "20 pts" for a fixed number, "Até 30 pts" for a points ladder. */
export function formatPoints(points: number | number[]): string {
  if (Array.isArray(points)) {
    if (points.length === 0) return "0 pts";
    const max = Math.max(...points);
    return `Até ${max} pts`;
  }
  return `${points} pts`;
}

/**
 * Distribution of index → points for an array-based scoring field, e.g.
 * [0, 10, 20, 30] → [{ step: 0, points: 0 }, { step: 1, points: 10 }, ...]
 * Returns null for fixed (non-array) points, since there is nothing to distribute.
 */
export function getPointsDistribution(
  points: number | number[]
): { step: number; points: number }[] | null {
  if (!Array.isArray(points)) return null;
  return points.map((value, step) => ({ step, points: value }));
}

/**
 * Human-readable label for a mission's `type` tuple, without exposing the
 * internal "switch" / "range" vocabulary to the end user.
 */
export function formatMissionType(type?: RawMissionType): string | null {
  if (!type || type.length === 0) return null;
  const [kind, ...options] = type;

  if (kind === "range") {
    const [min, max] = options as [number | null, number | null];
    if (typeof min === "number" && typeof max === "number") {
      return `Quantidade (${min}–${max})`;
    }
    return "Quantidade";
  }

  if (kind === "switch") {
    const labels = options.filter((opt): opt is string => typeof opt === "string");
    if (labels.length > 0) {
      return `Condição (${labels.join(" / ")})`;
    }
    return "Condição";
  }

  return null;
}

/** Count used for the card's "N objetivos" indicator. */
export function countObjectives(mission: MissionGuideMission): number {
  return mission.subMissions.length;
}

/** Count used for the "+N bônus" indicator, when the caller wants the bonus-only count. */
export function countBonusSubMissions(mission: MissionGuideMission): number {
  return mission.subMissions.filter((sub) => sub.isBonus).length;
}

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function matchesSearch(mission: MissionGuideMission, query: string): boolean {
  const q = stripDiacritics(query.trim().toLowerCase());
  if (!q) return true;

  const haystack = stripDiacritics(
    `${mission.id} ${mission.name} ${mission.description}`.toLowerCase()
  );
  return haystack.includes(q);
}

export function matchesFilter(mission: MissionGuideMission, filter: MissionFilterKey): boolean {
  switch (filter) {
    case "equipment":
      return mission.equipments;
    case "no-equipment":
      return !mission.equipments;
    case "bonus":
      return mission.subMissions.length > 0;
    case "all":
    default:
      return true;
  }
}
