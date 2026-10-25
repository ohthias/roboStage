// ---------------------------------------------------------------------------
// Cálculos genéricos sobre fields + entries. Não sabem nada sobre "runs" ou
// "calibrabot" — só olham o tipo de cada campo (number/boolean/...), então
// funcionam automaticamente para o modo Personalizado também.
// ---------------------------------------------------------------------------

import type { FieldDefinition, TestEntry } from "@/types/labtest.types";
import { getFieldValue } from "@/types/labtest.types";
import { toNumber } from "./chart-data";

export function entryTotal(entry: TestEntry, fields: FieldDefinition[]): number {
  return fields
    .filter((f) => f.type === "number")
    .reduce((sum, f) => {
      return sum + (toNumber(getFieldValue(entry.values, f.fieldKey)) ?? 0);
    }, 0);
}

export function maxPossibleTotal(fields: FieldDefinition[]): number {
  return fields
    .filter((f) => f.type === "number" && f.targetValue != null)
    .reduce((sum, f) => sum + (f.targetValue ?? 0), 0);
}

export interface FieldStats {
  /** Média com até 2 casas decimais (antes era arredondada para inteiro). */
  average?: number;
  /** Maior valor (mantido por compatibilidade). */
  best?: number;
  min?: number;
  max?: number;
  count?: number;
  completionRate?: number;
}

export function computeFieldStats(
  field: FieldDefinition,
  entries: TestEntry[],
): FieldStats {
  if (field.type === "boolean") {
    const total = entries.length;
    const trueCount = entries.filter(
      (e) => getFieldValue(e.values, field.fieldKey) === true,
    ).length;
    return {
      completionRate: total > 0 ? Math.round((trueCount / total) * 100) : 0,
    };
  }

  if (field.type === "number" || field.type === "duration") {
    const values = entries
      .map((e) => toNumber(getFieldValue(e.values, field.fieldKey)))
      .filter((v): v is number => v !== null);
    if (values.length === 0) return {};
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    return {
      average: Math.round(avg * 100) / 100,
      best: max,
      max,
      min: Math.min(...values),
      count: values.length,
    };
  }

  return {};
}
