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

export type CalibrationSubtype = "atuadores" | "programacao" | "sensores";

export interface AtuadoresConfig {
  actuators: string[];
  grouping: "individual" | "duplas" | "trios";
  combinations: string[][];
}

export interface ProgramacaoConfig {
  subject: "pid" | "giroscopio" | "andar";
  axes?: Array<"arfagem" | "guinada" | "rotacao">;
}

export interface SensoresConfig {
  sensors: Array<"luz" | "ultrassonico">;
}

export type CalibrationConfig = AtuadoresConfig | ProgramacaoConfig | SensoresConfig;

// Assumido a partir do default 'text' da coluna `type` em lab_test_parameters.
// Confirmar os valores reais do enum `parameter_type` antes de integrar.
export type ParameterType = "text" | "number" | "boolean";

export interface CustomParameterInput {
  name: string;
  type: ParameterType;
  unit?: string;
  description?: string;
  isRequired: boolean;
}