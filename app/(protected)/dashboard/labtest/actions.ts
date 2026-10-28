"use server";

import {
  requireAuthenticatedUser,
  resolveStagebookScope,
} from "@/utils/stagebook/scope";
import { creatorScopeWhere, scopeWhere } from "@/utils/stagebook/permissions";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { folders } from "@/db/schema/notebook";
import { tests, testExecutions } from "@/db/schema/labtest";
import type {
  FieldDefinition,
  FllExecutionResults,
  TestEntry,
  TestRecord,
} from "@/types/labtest.types";
import { createTestExecution as createTestExecutionAction } from "./new/actions";
import { normalizeFEResult } from "@/utils/labtest/future-edition";
import { normalizeObrResult } from "@/utils/labtest/obr";
import { isValidCalc } from "@/utils/labtest/calc";

export async function createTestExecution(input: {
  testId: string;
  notes?: string;
  results?: Record<string, unknown>;
}) {
  return createTestExecutionAction(input);
}

function toFieldLabel(key: string) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(.)/, (char) => char.toUpperCase());
}

function normalizeScalar(value: unknown): number | boolean | string | null {
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "string"
  ) {
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
        const key =
          typeof entry.fieldKey === "string"
            ? entry.fieldKey
            : `campo_${index + 1}`;
        return [key, entry.value ?? null];
      }),
    );
  }

  return obj;
}

function normalizeFllAnswers(raw: unknown): TestEntry["fllAnswers"] {
  if (!raw || typeof raw !== "object") return undefined;

  const answers = (raw as Record<string, unknown>).answers;
  if (!answers || typeof answers !== "object" || Array.isArray(answers))
    return undefined;

  const normalized = Object.fromEntries(
    Object.entries(answers).flatMap(([missionId, answer]) => {
      if (!answer || typeof answer !== "object") return [];
      const record = answer as Record<string, unknown>;
      const subAnswers = record.subAnswers;
      return [
        [
          missionId,
          {
            value: typeof record.value === "number" ? record.value : 0,
            subAnswers:
              subAnswers &&
              typeof subAnswers === "object" &&
              !Array.isArray(subAnswers)
                ? Object.fromEntries(
                    Object.entries(subAnswers).map(([key, value]) => [
                      key,
                      typeof value === "number" ? value : 0,
                    ]),
                  )
                : {},
          },
        ],
      ];
    }),
  );

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

// ---------------------------------------------------------------------------
// CalibraBot · Motores — não guarda "parametros"/"indicadores" no config,
// guarda a lista de motores (e, no modo duplas, os pares já combinados).
// Cada motor (ou cada dupla) vira DOIS campos numéricos sintéticos:
// rotação (RPM) e tempo de execução (s). É o que os gráficos de comparação
// do modo Motores usam como eixo de dados.
// ---------------------------------------------------------------------------

function buildMotorFields(config: Record<string, unknown>): FieldDefinition[] {
  const defs: FieldDefinition[] = [];

  const motores = Array.isArray(config.motores)
    ? (config.motores as unknown[]).filter(
        (m): m is string => typeof m === "string",
      )
    : [];

  const pares = Array.isArray(config.pares) ? (config.pares as unknown[]) : [];
  const isDuplas = config.modo === "duplas" && pares.length > 0;

  if (isDuplas) {
    pares.forEach((pair, index) => {
      if (!Array.isArray(pair)) return;
      const [a, b] = pair as unknown[];
      if (typeof a !== "string" || typeof b !== "string") return;
      const base = `${a}__${b}`;
      defs.push({
        fieldKey: `${base}__rotacao`,
        label: `${a} + ${b} · Rotação`,
        description: "Velocidade de rotação dos motores durante o teste.",
        type: "number",
        unit: "RPM",
        order: index * 2,
      });
      defs.push({
        fieldKey: `${base}__tempo`,
        label: `${a} + ${b} · Tempo`,
        description: "Tempo de execução dos motores durante o teste.",
        type: "duration",
        unit: "s",
        order: index * 2 + 1,
      });
    });
    return defs;
  }

  motores.forEach((motor, index) => {
    defs.push({
      fieldKey: `${motor}__rotacao`,
      label: `${motor} · Rotação`,
      description: "Velocidade de rotação do motor durante o teste.",
      type: "number",
      unit: "RPM",
      order: index * 2,
    });
    defs.push({
      fieldKey: `${motor}__tempo`,
      label: `${motor} · Tempo`,
      description: "Tempo de execução do motor durante o teste.",
      type: "duration",
      unit: "s",
      order: index * 2 + 1,
    });
  });

  return defs;
}

/** Rótulos e unidades dos indicadores do giroscópio e parâmetros do PID. */
const KNOWN_FIELDS: Record<
  string,
  { label: string; unit?: string; type?: FieldDefinition["type"] }
> = {
  erro: { label: "Erro do giroscópio", unit: "°" },
  guinada: { label: "Guinada", unit: "°" },
  tempo: { label: "Tempo", unit: "s", type: "duration" },
  velocidade: { label: "Velocidade" },
  valor_p: { label: "Valor P" },
  valor_i: { label: "Valor I" },
  valor_d: { label: "Valor D" },
  k_p: { label: "Kp" },
  k_i: { label: "Ki" },
  k_d: { label: "Kd" },
};

function buildFieldsFromConfig(
  config: Record<string, unknown> | null | undefined,
): FieldDefinition[] {
  const defs: FieldDefinition[] = [];

  if (!config || typeof config !== "object") return defs;

  if (config.tipo === "motores") {
    return buildMotorFields(config);
  }

  if (Array.isArray(config.missions)) {
    config.missions.forEach((mission, index) => {
      const key =
        typeof mission === "string"
          ? mission
          : String(mission ?? `missao_${index + 1}`);
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
      const item =
        typeof param === "string"
          ? { nome: param }
          : (param as Record<string, unknown>);
      const key =
        typeof item.nome === "string" ? item.nome : `parametro_${index + 1}`;
      const options = Array.isArray(item.opcoes)
        ? (item.opcoes as unknown[]).flatMap((option) =>
            typeof option === "string" ? [{ value: option, label: option }] : [],
          )
        : null;
      // PID guarda só os nomes; os rótulos vêm de KNOWN_FIELDS.
      const known = typeof param === "string" ? KNOWN_FIELDS[key] : undefined;
      defs.push({
        fieldKey: key,
        label:
          typeof item.rotulo === "string" && item.rotulo
            ? item.rotulo
            : (known?.label ?? toFieldLabel(key)),
        description:
          typeof item.descricao === "string" && item.descricao
            ? item.descricao
            : null,
        options: options && options.length > 0 ? options : null,
        targetValue: typeof item.meta === "number" ? item.meta : null,
        type:
          item.tipo === "boolean" ||
          item.tipo === "text" ||
          item.tipo === "select" ||
          item.tipo === "duration"
            ? item.tipo
            : (known?.type ?? "number"),
        unit:
          typeof item.unidade === "string" ? item.unidade : (known?.unit ?? null),
        required: item.obrigatorio === true,
        calc: isValidCalc(item.calc) ? item.calc : null,
        min: typeof item.min === "number" ? item.min : null,
        max: typeof item.max === "number" ? item.max : null,
        order: index,
      });
    });
    return defs;
  }

  if (Array.isArray(config.indicadores)) {
    config.indicadores.forEach((indicator, index) => {
      const key =
        typeof indicator === "string" ? indicator : `indicador_${index + 1}`;
      const known = KNOWN_FIELDS[key];
      defs.push({
        fieldKey: key,
        label: known?.label ?? toFieldLabel(key),
        type: known?.type ?? "number",
        unit: known?.unit ?? null,
        order: index,
      });
    });
    return defs;
  }

  return defs;
}

function resolveFields(test: TestRecord): FieldDefinition[] {
  const configFields = buildFieldsFromConfig(test.config ?? {});
  const seen = new Map<string, FieldDefinition>();

  for (const field of configFields) seen.set(field.fieldKey, field);

  return Array.from(seen.values()).sort((a, b) => a.order - b.order);
}

export async function getLabTestViewData(testId: string) {
  const userId = await requireAuthenticatedUser();

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

    // Partida da Future Edition: os valores genéricos (usados pelo histórico,
    // exportação e gráficos básicos) são a pontuação de cada missão.
    const futureEdition = normalizeFEResult(
      (execution.results as Record<string, unknown> | null)?.futureEdition,
    );

    const obrRound = normalizeObrResult(
      (execution.results as Record<string, unknown> | null)?.obrRound,
    );

    const values = futureEdition
      ? Object.entries(futureEdition.scores.byMission).map(([fieldKey, value]) => ({
          fieldKey,
          value,
        }))
      : obrRound
        ? // Rodada OBR: valores genéricos = partes do placar.
          (
            [
              ["total", obrRound.scores.total],
              ["perigos", obrRound.scores.hazards],
              ["checkpoints", obrRound.scores.checkpoints],
              ["chegada", obrRound.scores.chegada],
              ["multiplicador", obrRound.scores.multiplier],
              ["tempo", obrRound.scores.tempo],
            ] as const
          ).map(([fieldKey, value]) => ({ fieldKey, value }))
      : Object.entries(normalized).map(([fieldKey, value]) => ({
          fieldKey,
          value: normalizeScalar(value),
        }));

    const results = execution.results as FllExecutionResults | null;

    const precisionDiscs = results?.precisionDiscs;

    return {
      id: execution.id,
      executionNumber: execution.executionNumber,
      notes: execution.notes,
      createdAt: execution.createdAt.toISOString(),
      values,
      fllAnswers:
        futureEdition || obrRound ? undefined : normalizeFllAnswers(execution.results),
      futureEdition,
      obrRound,
      roundTotal:
        typeof results?.round?.total === "number" ? results.round.total : undefined,
      roundSeconds:
        typeof results?.round?.seconds === "number"
          ? results.round.seconds
          : undefined,

      precisionDiscs: precisionDiscs
        ? {
            total: precisionDiscs.total ?? 6,
            remaining: precisionDiscs.remaining ?? 0,
            used:
              precisionDiscs.used ??
              (precisionDiscs.total ?? 6) - (precisionDiscs.remaining ?? 0),
          }
        : undefined,
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

  const fields = resolveFields(record);
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

// ---------------------------------------------------------------------------
// Edição dos dados do teste (/dashboard/labtest/[id]/edit): nome, descrição e
// pasta. Tags e marco são salvos pelas actions universais de etiquetas.
// ---------------------------------------------------------------------------

export type EditFolderOption = { id: string; label: string; color: string | null; icon: string | null };

/** Pastas do scope atual, com o caminho completo ("Pai / Filho") e em ordem. */
async function listFolderOptions(
  scope: Awaited<ReturnType<typeof resolveStagebookScope>>,
): Promise<EditFolderOption[]> {
  const rows = await db
    .select({
      id: folders.id,
      parentId: folders.parentId,
      name: folders.name,
      icon: folders.icon,
      color: folders.color,
      position: folders.position,
    })
    .from(folders)
    .where(scopeWhere(scope, { userId: folders.userId, teamId: folders.teamId }))
    .orderBy(folders.position, folders.name);

  const byParent = new Map<string | null, typeof rows>();
  for (const row of rows) {
    const key = row.parentId && rows.some((r) => r.id === row.parentId) ? row.parentId : null;
    byParent.set(key, [...(byParent.get(key) ?? []), row]);
  }

  const out: EditFolderOption[] = [];
  const walk = (parent: string | null, prefix: string, depth: number) => {
    if (depth > 20) return; // proteção contra ciclos
    for (const row of byParent.get(parent) ?? []) {
      const label = prefix ? `${prefix} / ${row.name}` : row.name;
      out.push({ id: row.id, label, color: row.color, icon: row.icon });
      walk(row.id, label, depth + 1);
    }
  };
  walk(null, "", 0);
  return out;
}

export async function getTestEditData(testId: string) {
  const scope = await resolveStagebookScope();

  const [test] = await db
    .select({
      id: tests.id,
      name: tests.name,
      description: tests.description,
      folderId: tests.folderId,
      mode: tests.mode,
      season: tests.season,
      status: tests.status,
      config: tests.config,
      createdAt: tests.createdAt,
      updatedAt: tests.updatedAt,
    })
    .from(tests)
    .where(
      and(eq(tests.id, testId), creatorScopeWhere(scope, { userId: tests.userId, teamId: tests.teamId })),
    )
    .limit(1);

  if (!test) return null;

  return {
    test: {
      ...test,
      createdAt: test.createdAt.toISOString(),
      updatedAt: test.updatedAt.toISOString(),
    },
    folders: await listFolderOptions(scope),
  };
}

export async function updateTestDetails(
  testId: string,
  input: { name: string; description?: string | null; folderId?: string | null },
) {
  const scope = await resolveStagebookScope();

  const name = String(input.name ?? "").trim();
  const description = String(input.description ?? "").trim();
  const folderId = input.folderId || null;

  if (!name) throw new Error("Informe um nome para o teste.");
  if (name.length > 100) throw new Error("O nome deve ter no máximo 100 caracteres.");
  if (description.length > 200) {
    throw new Error("A descrição deve ter no máximo 200 caracteres.");
  }

  if (folderId) {
    const [folder] = await db
      .select({ id: folders.id })
      .from(folders)
      .where(
        and(
          eq(folders.id, folderId),
          scopeWhere(scope, { userId: folders.userId, teamId: folders.teamId }),
        ),
      )
      .limit(1);
    if (!folder) throw new Error("Pasta inválida ou sem permissão.");
  }

  const [previous] = await db
    .select({ folderId: tests.folderId })
    .from(tests)
    .where(
      and(eq(tests.id, testId), creatorScopeWhere(scope, { userId: tests.userId, teamId: tests.teamId })),
    )
    .limit(1);

  if (!previous) throw new Error("Teste não encontrado ou sem permissão para editá-lo.");

  const [updated] = await db
    .update(tests)
    .set({ name, description: description || null, folderId, updatedAt: new Date() })
    .where(
      and(eq(tests.id, testId), creatorScopeWhere(scope, { userId: tests.userId, teamId: tests.teamId })),
    )
    .returning({ id: tests.id, name: tests.name });

  if (!updated) throw new Error("Teste não encontrado ou sem permissão para editá-lo.");

  revalidatePath("/dashboard/labtest");
  revalidatePath(`/dashboard/labtest/${testId}`);
  revalidatePath("/dashboard/folders", "layout");
  for (const id of [previous.folderId, folderId]) {
    if (id) revalidatePath(`/dashboard/folders/${id}`);
  }

  return updated;
}
