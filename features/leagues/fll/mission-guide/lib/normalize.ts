import type {
  MissionGuideEditorialEntry,
  MissionGuideMission,
  MissionGuideRequirement,
  MissionGuideSubMission,
  RawMission,
  RawMissionRequirement,
  RawSubMission,
} from "./types";

function normalizeRequirement(req: RawMissionRequirement): MissionGuideRequirement {
  return {
    conditionLabel: Array.isArray(req.condition) ? String(req.condition[0]) : null,
    missionRef: req.mission ?? null,
    value: req.value ?? null,
    whenSelf: req.when_self ?? null,
  };
}

function isBonusText(text: string): boolean {
  return /b[oô]nus/i.test(text);
}

function normalizeSubMission(sub: RawSubMission, missionId: string, index: number): MissionGuideSubMission {
  return {
    id: sub.id ?? `${missionId}-sub-${index + 1}`,
    description: sub.submission,
    points: sub.points,
    type: sub.type,
    isBonus: isBonusText(sub.submission) || Boolean(sub.bonus_exclusive),
    bonusExclusive: Boolean(sub.bonus_exclusive),
    requires: (sub.requires ?? []).map(normalizeRequirement),
    zeroWholeMissionIfFalse: Boolean(sub.zero_whole_mission_if_false),
    note: sub.note ?? null,
    manualTrackingRequired: Boolean(sub.manual_tracking_required),
    manualTrackingNote: sub.manual_tracking_note ?? null,
  };
}

/**
 * Combines a raw mission (from missions.json) with its optional editorial
 * content (from mission-guide/{season}.json) into the safe shape the UI uses.
 *
 * Never duplicates name/points/image from the editorial file — those always
 * come from the raw mission, which is the single source of truth for them.
 */
export function normalizeMission(
  raw: RawMission,
  editorial?: MissionGuideEditorialEntry
): MissionGuideMission {
  const subMissions = (raw["sub-mission"] ?? []).map((sub, index) =>
    normalizeSubMission(sub, raw.id, index)
  );

  return {
    id: raw.id,
    name: raw.name,
    description: raw.mission,
    image: raw.image ?? null,
    points: raw.points,
    equipments: Boolean(raw.equipaments),
    type: raw.type,
    subMissions,
    hasBonus: subMissions.length > 0,
    manualTrackingRequired: Boolean(raw.manual_tracking_required),
    manualTrackingNote: raw.manual_tracking_note ?? null,
    zeroWholeMissionIfFalse: Boolean(raw.zero_whole_mission_if_false),
    mechanism: editorial?.mechanism ?? null,
    objective: editorial?.objective ?? null,
    strategy: editorial?.strategy ?? null,
    tips: editorial?.tips ?? [],
  };
}

/**
 * Builds the full list of normalized missions for a season by crossing the
 * raw mission list with the editorial content map. Both inputs are expected
 * to already be in memory (fetched once, in parallel) — this function does
 * no fetching itself.
 */
export function normalizeSeasonMissions(
  rawMissions: RawMission[],
  editorialMissions: Record<string, MissionGuideEditorialEntry> | undefined
): MissionGuideMission[] {
  return rawMissions
    .filter((raw) => !["GP", "EL", "PT"].includes(raw.id))
    .map((raw) => normalizeMission(raw, editorialMissions?.[raw.id]));
}
