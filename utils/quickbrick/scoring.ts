import {
  Mission,
  MissionDefinition,
  RequireCondition,
  ScoreValue,
  ScoringType,
  SubMissionDef,
} from "@/types/TableAnalytics";

/**
 * Raw shapes coming straight from /api/data/missions (the season JSON).
 * Kept loose on purpose — the real files are not 100% consistent
 * (some sub-missions have explicit ids, some don't; "points" is sometimes
 * a number and sometimes an array; etc).
 */
interface RawRequire {
  condition?: unknown;
  when_self?: string;
  mission: string;
  value: boolean | string | [number, number];
}

interface RawSubMission {
  id?: string;
  submission: string;
  points: number | number[];
  type: [string, ...(string | number | null)[]];
  zero_whole_mission_if_false?: boolean;
  requires?: RawRequire[];
  manual_tracking_required?: boolean;
  bonus_exclusive?: boolean;
  note?: string;
  manual_tracking_note?: string;
}

export interface RawMission {
  id: string;
  name: string;
  mission?: string;
  points: number | number[];
  equipaments?: boolean;
  image?: string;
  type: [string, ...(string | number | null)[]];
  "sub-mission"?: RawSubMission[];
}

/** Parses a raw ["switch"|"range", ...] tuple + its points into a ScoringType */
function parseScoring(
  type: [string, ...(string | number | null)[]] | undefined,
  points: number | number[] | undefined
): ScoringType | undefined {
  if (!type) return undefined;
  const [kind, ...rest] = type;

  if (kind === "switch") {
    const namedOptions = rest.filter(
      (v): v is string => typeof v === "string" && v.length > 0
    );
    if (namedOptions.length > 0) {
      const pts = Array.isArray(points) ? points : [points ?? 0];
      return { kind: "options", options: namedOptions, points: pts };
    }
    const pts = Array.isArray(points) ? points[0] ?? 0 : points ?? 0;
    return { kind: "boolean", points: pts };
  }

  if (kind === "range") {
    const min = typeof rest[0] === "number" ? (rest[0] as number) : 0;
    const max = typeof rest[1] === "number" ? (rest[1] as number) : 0;
    return { kind: "count", min, max, points: points ?? 0 };
  }

  return undefined;
}

/** Converts one raw mission (from the season JSON) into a normalized MissionDefinition */
export function normalizeMissionDefinition(raw: RawMission): MissionDefinition {
  const subMissions: SubMissionDef[] = (raw["sub-mission"] || []).map(
    (sub, idx) => ({
      id: sub.id || `${raw.id}-sub-${idx}`,
      label: sub.submission,
      scoring: parseScoring(sub.type, sub.points) ?? { kind: "boolean", points: 0 },
      zeroWholeMissionIfFalse: sub.zero_whole_mission_if_false,
      manualTrackingRequired: sub.manual_tracking_required,
      note: sub.note || sub.manual_tracking_note,
      requires: sub.requires?.map(
        (r): RequireCondition => ({
          mission: r.mission,
          value: r.value,
          whenSelf: r.when_self,
        })
      ),
    })
  );

  return {
    scoring: parseScoring(raw.type, raw.points),
    subMissions,
    description: raw.mission,
    image: raw.image,
    requiresEquipment: raw.equipaments,
  };
}

/** Converts a full raw season mission list into table-ready Mission rows */
export function missionsFromRaw(rawMissions: RawMission[]): Mission[] {
  return rawMissions.map((raw) => {
    const definition = normalizeMissionDefinition(raw);
    const mission: Mission = {
      id: raw.id,
      name: raw.id === "EL" || raw.id === "PT" || raw.id === "GP" ? raw.name : `${raw.id} · ${raw.name}`,
      definition,
      value: undefined,
      subValues: {},
    };
    const { points, maxPoints } = computeMissionPoints(mission);
    mission.points = points;
    mission.maxPoints = maxPoints;
    return mission;
  });
}

function scoreOf(scoring: ScoringType | undefined, value: ScoreValue): number {
  if (!scoring || value === undefined || value === null || value === "") return 0;
  switch (scoring.kind) {
    case "boolean":
      return value === true ? scoring.points : 0;
    case "options": {
      const idx = scoring.options.indexOf(String(value));
      return idx >= 0 ? scoring.points[idx] ?? 0 : 0;
    }
    case "count": {
      const n = Math.max(scoring.min, Math.min(scoring.max, Number(value) || 0));
      if (Array.isArray(scoring.points)) {
        return scoring.points[n - scoring.min] ?? 0;
      }
      return n * (scoring.points || 0);
    }
  }
}

function maxOf(scoring: ScoringType | undefined): number {
  if (!scoring) return 0;
  switch (scoring.kind) {
    case "boolean":
      return scoring.points;
    case "options":
      return Math.max(0, ...scoring.points);
    case "count":
      return Array.isArray(scoring.points)
        ? Math.max(0, ...scoring.points)
        : (scoring.max - scoring.min) * scoring.points;
  }
}

function evalRequires(
  requires: RequireCondition[] | undefined,
  getValue: (id: string) => ScoreValue,
  selfValue: ScoreValue
): boolean {
  if (!requires || requires.length === 0) return true;
  return requires.every((req) => {
    if (req.whenSelf && req.whenSelf !== selfValue) return true; // condition doesn't apply to this choice
    const target = getValue(req.mission);
    const cond = req.value;
    if (typeof cond === "boolean") return target === cond;
    if (Array.isArray(cond)) {
      const n = Number(target);
      return !Number.isNaN(n) && n >= cond[0] && n <= cond[1];
    }
    return String(target) === cond;
  });
}

/** Is this sub-mission currently unlocked, given the mission's own value + sibling values? */
export function isSubMissionUnlocked(
  mission: Mission,
  sub: SubMissionDef
): boolean {
  const getValue = (id: string): ScoreValue =>
    id === mission.id ? mission.value : mission.subValues?.[id];
  const selfValue = mission.subValues?.[sub.id];
  return evalRequires(sub.requires, getValue, selfValue);
}

/** Recomputes achieved + max points for a mission (own control + eligible sub-missions) */
export function computeMissionPoints(mission: Mission): {
  points: number;
  maxPoints: number;
} {
  const def = mission.definition;
  if (!def) {
    // Custom, user-added mission with no official scoring — fall back to whatever
    // was typed directly into the "points" cell.
    const n = Number(mission.points);
    return { points: Number.isFinite(n) ? n : 0, maxPoints: Number.isFinite(n) ? n : 0 };
  }

  const gateFailed = def.subMissions.some(
    (sub) => sub.zeroWholeMissionIfFalse && mission.subValues?.[sub.id] !== true
  );

  const ownPoints = scoreOf(def.scoring, mission.value);
  const ownMax = maxOf(def.scoring);

  let subPoints = 0;
  let subMax = 0;
  for (const sub of def.subMissions) {
    subMax += maxOf(sub.scoring);
    if (sub.zeroWholeMissionIfFalse) continue; // the gate itself never scores points
    if (!isSubMissionUnlocked(mission, sub)) continue;
    subPoints += scoreOf(sub.scoring, mission.subValues?.[sub.id]);
  }

  return {
    points: gateFailed ? 0 : ownPoints + subPoints,
    maxPoints: ownMax + subMax,
  };
}

/** Returns a fresh Mission with .value / .subValues updated and .points / .maxPoints recomputed */
export function updateMissionValue(
  mission: Mission,
  field: "self" | string,
  value: ScoreValue
): Mission {
  const next: Mission =
    field === "self"
      ? { ...mission, value }
      : { ...mission, subValues: { ...mission.subValues, [field]: value } };
  const { points, maxPoints } = computeMissionPoints(next);
  next.points = points;
  next.maxPoints = maxPoints;
  return next;
}