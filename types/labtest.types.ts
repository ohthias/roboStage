import type { FEExecutionResult } from "@/utils/labtest/future-edition";
import type { ObrRoundResult } from "@/utils/labtest/obr";

// ---------------------------------------------------------------------------
// Tipos genéricos do LabTest.
// Tudo (Runs, CalibraBot, Individual, Personalizado) usa exatamente estas
// mesmas formas — é isso que permite um único motor de UI para os 4 modos.
// ---------------------------------------------------------------------------

export type FieldType = "number" | "boolean" | "text" | "select" | "duration";
export type FieldSource = "manual" | "device";
export type ModeId = "runs" | "calibrabot" | "individual" | "custom";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDefinition {
  fieldKey: string;
  label: string;
  description?: string | null;
  type: FieldType;
  unit?: string | null;
  targetValue?: number | null;
  order: number;
  options?: FieldOption[] | null;
  required?: boolean;
  source?: FieldSource;
  /** Limites para campos numéricos (ex.: parâmetros personalizados). */
  min?: number | null;
  max?: number | null;
  /** Campo calculado (presets): fórmula de `utils/labtest/calc.ts`. */
  calc?: string | null;
}

export interface FieldValue {
  fieldKey: string;
  value: number | boolean | string | null;
}

export interface TestEntry {
  id: string;
  executionNumber: number;
  notes: string | null;
  createdAt: string;
  values: FieldValue[];
  fllAnswers?: Record<
    string,
    {
      value: number;
      subAnswers: Record<string, number>;
    }
  >;
  precisionDiscs?: {
    total: number;
    remaining: number;
    used: number;
  };
  /** Partida cronometrada da FLL Future Edition (modo runs). */
  futureEdition?: FEExecutionResult;
  /** Rodada da OBR Resgate (modo runs). */
  obrRound?: ObrRoundResult;
  /** Modo "Round 2:30": placar completo (missões + inspeção + tokens). */
  roundTotal?: number;
  roundSeconds?: number;
}

export interface TestRecord {
  id: string;
  name: string;
  description: string | null;
  mode: ModeId;
  season: string | null;
  status: string;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers puros usados por vários componentes/hooks
// ---------------------------------------------------------------------------

export function getFieldValue(
  values: FieldValue[],
  fieldKey: string,
): FieldValue["value"] | null {
  return values.find((v) => v.fieldKey === fieldKey)?.value ?? null;
}

export function getNumericValue(values: FieldValue[], fieldKey: string): number {
  const raw = getFieldValue(values, fieldKey);
  return typeof raw === "number" ? raw : 0;
}

export function emptyValueForType(type: FieldType): FieldValue["value"] {
  switch (type) {
    case "text":
    case "select":
      return "";
    case "number":
    case "duration":
    case "boolean":
    default:
      return null;
  }
}

export type FllExecutionResults = {
  answers?: Record<
    string,
    {
      order?: number;
      value: number;
      missionId?: string;
      /** Segundo do round em que a missão recebeu a primeira marcação. */
      firstMarkSeconds?: number | null;
      /** Primeira marcação feita depois do fim dos 2:30. */
      markedAfterTime?: boolean;
      subAnswers: Record<string, number>;
      objectiveAnswers?: Record<string, unknown>;
    }
  >;
  missions?: string[];
  precisionDiscs?: {
    total?: number;
    remaining?: number;
    used?: number;
  };
  round?: {
    total?: number;
    seconds?: number;
    firstMarks?: Record<string, { seconds: number; afterTime: boolean }>;
  };
};