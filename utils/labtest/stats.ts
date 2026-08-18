// ---------------------------------------------------------------------------
// Estatísticas genéricas por campo — usadas por qualquer modo na visualização.
// ---------------------------------------------------------------------------
// Antes, cada modo (`RunsView`, `CalibrabotView`, `IndividualView`) tinha seu
// próprio cálculo de "melhor", "média", "tendência". Aqui isso vira uma função
// só, que funciona para qualquer FieldDefinition — inclusive campos criados
// pelo usuário no modo Personalizado.

import type { FieldDefinition, TestEntry } from "@/types/labtest.types";
import { getNumericValue } from "@/types/labtest.types";

export interface FieldStats {
  fieldKey: string;
  label: string;
  values: number[];
  best: number;
  avg: number;
  latest: number | null;
  trend: "up" | "down" | "flat";
  completionRate: number | null; // só para campos booleanos, 0-100
}

export function trend(values: number[]): "up" | "down" | "flat" {
  if (values.length < 2) return "flat";
  const last = values[values.length - 1];
  const prev = values[values.length - 2];
  if (last > prev) return "up";
  if (last < prev) return "down";
  return "flat";
}

export function computeFieldStats(
  field: FieldDefinition,
  entries: TestEntry[],
): FieldStats {
  if (field.type === "boolean") {
    const bools = entries.map(
      (e) => e.values.find((v) => v.fieldKey === field.fieldKey)?.value,
    );
    const total = bools.length;
    const trueCount = bools.filter((v) => v === true).length;
    return {
      fieldKey: field.fieldKey,
      label: field.label,
      values: [],
      best: trueCount,
      avg: 0,
      latest: null,
      trend: "flat",
      completionRate: total ? Math.round((trueCount / total) * 100) : 0,
    };
  }

  const values = entries.map((e) => getNumericValue(e.values, field.fieldKey));
  const best = values.length ? Math.max(...values) : 0;
  const avg = values.length
    ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    : 0;

  return {
    fieldKey: field.fieldKey,
    label: field.label,
    values,
    best,
    avg,
    latest: values.length ? values[values.length - 1] : null,
    trend: trend(values),
    completionRate: null,
  };
}

/** Soma de todos os campos numéricos de um lançamento — equivalente ao antigo `runTotal`. */
export function entryTotal(
  entry: TestEntry,
  fields: FieldDefinition[],
): number {
  return fields
    .filter((f) => f.type === "number")
    .reduce((sum, f) => sum + getNumericValue(entry.values, f.fieldKey), 0);
}

export function maxPossibleTotal(fields: FieldDefinition[]): number {
  return fields
    .filter((f) => f.type === "number")
    .reduce((sum, f) => sum + (f.targetValue ?? 0), 0);
}
