/**
 * Types for the Mission Guide tool.
 *
 * Two data sources are combined:
 *  - /public/data/missions.json          → official, structural data (per season)
 *  - /public/data/mission-guide/{season}.json → editorial content (mechanism, strategy, tips)
 *
 * These types intentionally mirror the *real* shape of missions.json, including its
 * inconsistencies (optional fields, points as number|array, etc). Normalization happens
 * in normalize.ts, which turns these into the safe `MissionGuideMission` shape the UI uses.
 */

/** `["switch", null, null]` | `["switch", "Label A", "Label B", ...]` | `["range", min, max]` */
export type RawMissionType = [string, ...(string | number | null)[]];

export interface RawMissionRequirement {
  condition?: [string, boolean];
  mission?: string;
  value?: unknown;
  when_self?: string;
}

export interface RawSubMission {
  id?: string;
  submission: string;
  points: number | number[];
  type?: RawMissionType;
  requires?: RawMissionRequirement[];
  zero_whole_mission_if_false?: boolean;
  note?: string;
  manual_tracking_required?: boolean;
  manual_tracking_note?: string;
  bonus_exclusive?: boolean;
}

export interface RawMission {
  id: string;
  name: string;
  mission: string;
  points: number | number[];
  equipaments?: boolean;
  image?: string;
  type?: RawMissionType;
  requires?: RawMissionRequirement[];
  manual_tracking_required?: boolean;
  manual_tracking_note?: string;
  zero_whole_mission_if_false?: boolean;
  bonus_exclusive?: boolean;
  "sub-mission"?: RawSubMission[];
}

/** Root shape of /public/data/missions.json — one array per season. */
export type MissionsBySeasonFile = Record<string, RawMission[]>;

export interface MissionGuideEditorialEntry {
  mechanism?: string;
  objective?: string;
  strategy?: string;
  tips?: string[];
}

/** Root shape of /public/data/mission-guide/{season}.json */
export interface MissionGuideEditorialFile {
  season: string;
  missions: Record<string, MissionGuideEditorialEntry>;
}

/** Normalized, UI-safe requirement. */
export interface MissionGuideRequirement {
  conditionLabel: string | null;
  missionRef: string | null;
  value: unknown;
  whenSelf: string | null;
}

/** Normalized, UI-safe sub-mission. */
export interface MissionGuideSubMission {
  id: string;
  description: string;
  points: number | number[];
  type?: RawMissionType;
  isBonus: boolean;
  bonusExclusive: boolean;
  requires: MissionGuideRequirement[];
  zeroWholeMissionIfFalse: boolean;
  note: string | null;
  manualTrackingRequired: boolean;
  manualTrackingNote: string | null;
}

/** Normalized, UI-safe mission — the only shape components should consume. */
export interface MissionGuideMission {
  id: string;
  name: string;
  description: string;
  image: string | null;
  points: number | number[];
  equipments: boolean;
  type?: RawMissionType;
  subMissions: MissionGuideSubMission[];
  hasBonus: boolean;
  manualTrackingRequired: boolean;
  manualTrackingNote: string | null;
  zeroWholeMissionIfFalse: boolean;
  mechanism: string | null;
  objective: string | null;
  strategy: string | null;
  tips: string[];
}

export type MissionFilterKey = "all" | "equipment" | "no-equipment" | "bonus";
