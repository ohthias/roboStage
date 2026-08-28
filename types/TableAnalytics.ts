export type ColumnType = 'text' | 'number' | 'select';

export interface Column {
  id: string;
  label: string;
  type: ColumnType;
  options?: string[]; // For select type (comma separated in UI)
  isSystem?: boolean; // If true, cannot be deleted (e.g., Name, Pontos)
  readOnly?: boolean; // If true, cell is computed and cannot be typed into
}

// ---------------------------------------------------------------------------
// Scoring model — mirrors the official FLL mission JSON (switch / range types,
// options with per-option points, and count fields whose points are either a
// flat rate per unit or an explicit lookup table indexed by count).
// ---------------------------------------------------------------------------

export type ScoringType =
  | { kind: 'boolean'; points: number }
  | { kind: 'options'; options: string[]; points: number[] }
  | { kind: 'count'; min: number; max: number; points: number | number[] };

export type ScoreValue = boolean | number | string | undefined;

export interface RequireCondition {
  /** id of the referenced field: either the parent mission's own id, or a sibling sub-mission id */
  mission: string;
  /** boolean equality, string equality, or [min,max] inclusive numeric range */
  value: boolean | string | [number, number];
  /** only evaluate this condition when the field's own selected value equals this (used for exclusive-choice bonuses) */
  whenSelf?: string;
}

export interface SubMissionDef {
  id: string;
  label: string;
  scoring: ScoringType;
  zeroWholeMissionIfFalse?: boolean;
  requires?: RequireCondition[];
  manualTrackingRequired?: boolean;
  note?: string;
}

export interface MissionDefinition {
  /** the mission's own control, if it has one (most do) */
  scoring?: ScoringType;
  subMissions: SubMissionDef[];
  description?: string;
  image?: string;
  requiresEquipment?: boolean;
}

export interface Mission {
  id: string;
  name: string;
  // Official scoring data (present only for missions loaded from the season dataset)
  definition?: MissionDefinition;
  value?: ScoreValue; // the mission's own control value
  subValues?: Record<string, ScoreValue>; // sub-mission id -> value
  points?: number; // COMPUTED achieved points, kept in sync automatically
  maxPoints?: number; // COMPUTED max possible points, kept in sync automatically
  [key: string]: any; // dynamic keys for custom, user-added columns
}

export interface AnalysisResult {
  summary: string;
  recommendations: string[];
}

export enum ViewMode {
  TABLE = 'table',
  ANALYTICS = 'analytics',
}