// ---------------------------------------------------------------------------
// Cálculos genéricos sobre fields + entries. Não sabem nada sobre "runs" ou
// "calibrabot" — só olham o tipo de cada campo (number/boolean/...), então
// funcionam automaticamente para o modo Personalizado também.
// ---------------------------------------------------------------------------

import type { FieldDefinition, TestEntry } from "@/types/labtest.types";
import { getFieldValue } from "@/types/labtest.types";

export function entryTotal(entry: TestEntry, fields: FieldDefinition[]): number {
  return fields
    .filter((f) => f.type === "number")
    .reduce((sum, f) => {
      const v = getFieldValue(entry.values, f.fieldKey);
      return sum + (typeof v === "number" ? v : 0);
    }, 0);
}

export function maxPossibleTotal(fields: FieldDefinition[]): number {
  return fields
    .filter((f) => f.type === "number" && f.targetValue != null)
    .reduce((sum, f) => sum + (f.targetValue ?? 0), 0);
}

export interface FieldStats {
  average?: number;
  best?: number;
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
      .map((e) => getFieldValue(e.values, field.fieldKey))
      .filter((v): v is number => typeof v === "number");
    if (values.length === 0) return {};
    return {
      average: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      best: Math.max(...values),
    };
  }

  return {};
}
