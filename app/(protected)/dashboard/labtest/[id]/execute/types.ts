import type { CalibrationSubtype, ParameterType } from "../setup/types";

export interface RunExecutionInput {
  missions: Array<{
    missionId: string;
    scoreObtained: number;
    completed: boolean;
    notes?: string;
  }>;
  strategyVersionId?: string;
  season: string;
  arena?: string;
  totalScore: number;
  finalTimeSeconds?: number;
  penalties?: number;
  finalResult?: string;
}

// Assumido a partir do DEFAULT 'necessita_ajuste' visto no schema.
// Confirme os valores reais do enum `calibration_result` antes de integrar.
export type CalibrationResult = "aprovado" | "necessita_ajuste" | "reprovado";

export interface CalibrationExecutionInput {
  calibrationType: CalibrationSubtype;
  robotModel?: string;
  firmware?: string;
  batteryUsed?: string;
  sensorUsed?: string;
  motorUsed?: string;
  portUsed?: string;
  idealValueFound?: string;
  configurationUsed?: string;
  result: CalibrationResult;
  finalNotes?: string;
}

export interface PersonalizadoExecutionInput {
  values: Array<{
    parameterId: string;
    value: string;
  }>;
}

export interface ExecuteParameter {
  id: string;
  name: string;
  type: ParameterType;
  unit: string | null;
  description: string | null;
  isRequired: boolean;
}

export interface ExecuteMission {
  missionId: string;
  orderIndex: number;
  fullAttempt: boolean;
  missionCode: string;
  missionName: string;
  maxScore: number;
}