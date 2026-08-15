// Formato do JSON servido por /api/data/missions.
// Reflete o arquivo de definição de temporada (ex: masterpiece, submerged, unearthed, bioglow).
// Mantido como "quase cru" de propósito — ver ADR-001, seção "Run": a lógica de
// pontuação da FLL muda todo ano e não vale a pena normalizar no banco.

export type MissionType = ["switch" | "range", ...(string | number | null)[]];

export interface SubMission {
  id?: string;
  submission: string;
  points: number | number[];
  type: MissionType;
  note?: string;
  requires?: unknown[];
  zero_whole_mission_if_false?: boolean;
  bonus_exclusive?: boolean;
  manual_tracking_required?: boolean;
  manual_tracking_note?: string;
}

export interface Mission {
  id: string;
  name: string;
  mission: string;
  points: number | number[];
  equipaments?: boolean;
  image?: string;
  type: MissionType;
  "sub-mission"?: SubMission[];
}

export type SeasonMissions = Record<string, Mission[]>;

// ---- Plano de configuração (o que é salvo na criação do teste) ----

export interface RunPlanMissionInput {
  missionId: string;
  orderIndex: number;
  fullAttempt: boolean;
  notes?: string;
}

export type CalibrationSubtype =
  | "sensor"
  | "motor"
  | "servo"
  | "pid"
  | "giroscopio"
  | "sensor_cor"
  | "sensor_distancia"
  | "linha"
  | "curvas"
  | "outro";

export interface AtuadoresConfig {
  actuators: string[];
  grouping: "individual" | "duplas" | "trios";
  combinations: string[][];
}

export interface GiroscopioConfig {
  axes: Array<"arfagem" | "guinada" | "rotacao">;
}

// Usado por todo o resto (pid, linha, curvas, sensor, sensor_cor,
// sensor_distancia, outro): esses não têm formato próprio, só uma nota livre.
export interface GenericCalibrationConfig {
  notes?: string;
}

export type CalibrationConfig = AtuadoresConfig | GiroscopioConfig | GenericCalibrationConfig;

// Enum real de `parameter_type`: "number" | "boolean" | "text" | "select".
export type ParameterType = "text" | "number" | "boolean" | "select";

export interface CustomParameterInput {
  name: string;
  type: ParameterType;
  unit?: string;
  description?: string;
  isRequired: boolean;
  // Só usado quando type === "select": lista de opções separada por vírgula.
  // Reaproveita a coluna `default_value` (não existe uma coluna `options`
  // dedicada no schema atual) — funcional, mas vale considerar uma migration
  // pra uma coluna própria se isso crescer.
  defaultValue?: string;
}