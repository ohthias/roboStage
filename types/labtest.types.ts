// ---------------------------------------------------------------------------
// LabTest — tipos genéricos compartilhados por todos os modos
// ---------------------------------------------------------------------------
// A ideia central: qualquer teste (Runs, CalibraBot, Individual, Personalizado)
// é "uma lista de campos" (FieldDefinition[]) + "lançamentos que preenchem esses
// campos" (TestEntry[]). Modos diferentes só mudam COMO os campos são definidos
// (catálogo fixo vs. usuário digita) e como a UI de resposta/visualização se
// organiza — os dados em si seguem o mesmo formato.

export type ModeId = "runs" | "custom";

export type FieldType = "number" | "boolean" | "text" | "select" | "duration";

export interface FieldOption {
  value: string;
  label: string;
}

/** Definição de um campo de um teste (equivale a uma "missão" ou "variável" antigas). */
export interface FieldDefinition {
  /** chave estável, usada para casar com valores lançados (ex: "M01", "velocidade") */
  fieldKey: string;
  label: string;
  type: FieldType;
  unit?: string | null;
  /** "pontuação máxima" / "meta" — nome genérico para caber em qualquer modo */
  targetValue?: number | null;
  order: number;
  options?: FieldOption[];
  required?: boolean;
  /** abre espaço para integração de hardware futura sem mudar o schema */
  source?: "manual" | "device";
}

/** Valor de um campo dentro de um lançamento específico. */
export interface FieldValue {
  fieldKey: string;
  value: number | boolean | string | null;
}

/** Um lançamento genérico: uma run, uma combinação do CalibraBot, uma tentativa... */
export interface TestEntry {
  id: string;
  executionNumber: number;
  createdAt: string;
  values: FieldValue[];
  notes?: string | null;
}

export interface TestRecord {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  mode: ModeId;
  season?: string | null;
  status: string;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  lastAccessAt?: string | null;
}

// ---------------------------------------------------------------------------
// Helpers puros de acesso a valor/campo — usados por formulários e views
// ---------------------------------------------------------------------------

export function getFieldValue(
  values: FieldValue[],
  fieldKey: string,
): number | boolean | string | null {
  return values.find((v) => v.fieldKey === fieldKey)?.value ?? null;
}

export function getNumericValue(
  values: FieldValue[],
  fieldKey: string,
): number {
  const raw = getFieldValue(values, fieldKey);
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const n = Number(raw);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

export function emptyValueForType(type: FieldType): FieldValue["value"] {
  switch (type) {
    case "number":
    case "duration":
      return null;
    case "boolean":
      return null;
    case "select":
    case "text":
    default:
      return "";
  }
}
