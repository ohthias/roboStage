"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { tests, testExecutions } from "@/db/schema/labtest";
import type { FieldDefinition, TestEntry, TestRecord } from "@/types/labtest.types";

function toFieldLabel(key: string) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(.)/, (char) => char.toUpperCase());
}

function inferFieldType(value: unknown): FieldDefinition["type"] {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (typeof value === "string") return "text";
  return "text";
}

function normalizeScalar(value: unknown): number | boolean | string | null {
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "string") {
    return value;
  }
  if (value === null || value === undefined) return null;
  return String(value);
}

function normalizeResults(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") return {};

  const obj = raw as Record<string, unknown>;

  if (Array.isArray(obj)) {
    return Object.fromEntries(
      obj.map((item, index) => {
        const entry = item as Record<string, unknown>;
        const key =
          typeof entry.fieldKey === "string"
            ? entry.fieldKey
            : typeof entry.key === "string"
              ? entry.key
              : `campo_${index + 1}`;
        return [key, entry.value ?? null];
      }),
    );
  }

  if (Array.isArray((obj as { values?: unknown }).values)) {
    const values = (obj as { values: Array<Record<string, unknown>> }).values;
    return Object.fromEntries(
      values.map((entry, index) => {
        const key = typeof entry.fieldKey === "string" ? entry.fieldKey : `campo_${index + 1}`;
        return [key, entry.value ?? null];
      }),
    );
  }

  return obj;
}

function buildFieldsFromConfig(config: Record<string, unknown> | null | undefined): FieldDefinition[] {
  const defs: FieldDefinition[] = [];

  if (!config || typeof config !== "object") return defs;

  if (Array.isArray(config.missions)) {
    config.missions.forEach((mission, index) => {
      const key = typeof mission === "string" ? mission : String(mission ?? `missao_${index + 1}`);
      defs.push({
        fieldKey: key,
        label: toFieldLabel(key),
        type: "number",
        order: index,
      });
    });
    return defs;
  }

  if (Array.isArray(config.parametros)) {
    config.parametros.forEach((param, index) => {
      const item = param as Record<string, unknown>;
      const key = typeof item.nome === "string" ? item.nome : `parametro_${index + 1}`;
      defs.push({
        fieldKey: key,
        label: toFieldLabel(key),
        type: typeof item.tipo === "string" && item.tipo === "boolean" ? "boolean" : "number",
        unit: typeof item.unidade === "string" ? item.unidade : null,
        order: index,
      });
    });
    return defs;
  }

  if (Array.isArray(config.indicadores)) {
    config.indicadores.forEach((indicator, index) => {
      const key = typeof indicator === "string" ? indicator : `indicador_${index + 1}`;
      defs.push({
        fieldKey: key,
        label: toFieldLabel(key),
        type: "number",
        order: index,
      });
    });
    return defs;
  }

  return defs;
}

function resolveFields(test: TestRecord, entries: TestEntry[]): FieldDefinition[] {
  const configFields = buildFieldsFromConfig(test.config ?? {});
  const seen = new Map<string, FieldDefinition>();

  for (const field of configFields) seen.set(field.fieldKey, field);

  for (const entry of entries) {
    for (const value of entry.values) {
      if (!seen.has(value.fieldKey)) {
        seen.set(value.fieldKey, {
          fieldKey: value.fieldKey,
          label: toFieldLabel(value.fieldKey),
          type: inferFieldType(value.value),
          order: seen.size,
        });
      }
    }
  }

  return Array.from(seen.values()).sort((a, b) => a.order - b.order);
}

export async function getLabTestViewData(testId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Usuário não autenticado.");

  const test = await db.query.tests.findFirst({
    where: and(eq(tests.id, testId), eq(tests.userId, userId)),
  });

  if (!test) {
    throw new Error("Teste não encontrado.");
  }

  const executionRows = await db
    .select()
    .from(testExecutions)
    .where(eq(testExecutions.testId, testId))
    .orderBy(testExecutions.executionNumber);

  const entries: TestEntry[] = executionRows.map((execution) => {
    const normalized = normalizeResults(execution.results);
    const values = Object.entries(normalized).map(([fieldKey, value]) => ({
      fieldKey,
      value: normalizeScalar(value),
    }));

    return {
      id: execution.id,
      executionNumber: execution.executionNumber,
      notes: execution.notes,
      createdAt: execution.createdAt.toISOString(),
      values,
    };
  });

  const record: TestRecord = {
    id: test.id,
    name: test.name,
    description: test.description,
    mode: test.mode,
    season: test.season,
    status: test.status,
    config: (test.config ?? {}) as Record<string, unknown>,
    createdAt: test.createdAt.toISOString(),
    updatedAt: test.updatedAt.toISOString(),
  };

  const fields = resolveFields(record, entries);
  const nextExecutionNumber = entries.length
    ? Math.max(...entries.map((entry) => entry.executionNumber)) + 1
    : 1;

  return {
    test: record,
    fields,
    entries,
    nextExecutionNumber,
  };
}
