"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import {
  labTests,
  labTestRunPlan,
  labTestCalibrationPlan,
  labTestParameters,
  labTestExecutions,
  labTestMissionResults,
  labTestRunDetails,
  labTestCalibrationDetails,
  labTestParameterValues,
} from "@/db/schema";
import type {
  RunPlanMissionInput,
  CalibrationSubtype,
  CalibrationConfig,
  CustomParameterInput,
} from "../setup/types";
import type {
  RunExecutionInput,
  CalibrationExecutionInput,
  PersonalizadoExecutionInput,
} from "./types";

const MAX_CUSTOM_PARAMETERS = 10;
const BASE_PATH = "/dashboard/labtest";

// drizzle-orm tipa colunas `numeric(...)` como `string` no insert (pra não
// perder precisão convertendo por float), mesmo que o valor "pareça" um
// número. `duration_seconds` e `final_time_seconds` são numeric(10,2), então
// precisam ser convertidos aqui — é isso que causava o erro de "no overload
// matches this call" nos dois pontos que inserem essas colunas.
function toNumeric(value: number | undefined): string | undefined {
  return value === undefined ? undefined : value.toString();
}

type CalibrationDetailType =
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

function toCalibrationDetailType(value: CalibrationSubtype): CalibrationDetailType {
  const subtype = String(value);

  switch (subtype) {
    case "sensor":
    case "motor":
    case "servo":
    case "pid":
    case "giroscopio":
    case "sensor_cor":
    case "sensor_distancia":
    case "linha":
    case "curvas":
      return subtype as CalibrationDetailType;
    case "atuadores":
      return "motor";
    default:
      return "outro";
  }
}

interface CreateLabTestInput {
  name: string;
  description?: string;
  type: "run" | "calibrabot" | "personalizado";
  teamId?: string;
}

export async function createLabTest(input: CreateLabTestInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Não autenticado.");

  const [test] = await db
    .insert(labTests)
    .values({
      name: input.name,
      description: input.description,
      type: input.type,
      userId,
      teamId: input.teamId ?? null,
      createdBy: userId,
      // Todo teste nasce como rascunho: só vira "ativo" quando a configuração
      // do tipo (missões / calibração / parâmetros) é salva com sucesso.
      status: "rascunho",
    })
    .returning();

  revalidatePath(BASE_PATH);
  return test;
}

export async function getLabTestForSetup(testId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Não autenticado.");

  const test = await db.query.labTests.findFirst({
    where: eq(labTests.id, testId),
  });

  if (!test) throw new Error("Teste não encontrado.");
  // Placeholder: se testes de equipe devem poder ser configurados por
  // qualquer membro do team, troque esta checagem pela sua regra real de
  // membership (ex: consultar team_members em vez de comparar userId direto).
  if (test.userId !== userId) {
    throw new Error("Você não tem acesso a este teste.");
  }

  return test;
}

async function markTestConfigured(testId: string) {
  await db.update(labTests).set({ status: "ativo" }).where(eq(labTests.id, testId));
}

export async function saveRunPlan(testId: string, missions: RunPlanMissionInput[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Não autenticado.");
  if (missions.length === 0) throw new Error("Selecione ao menos uma missão.");

  await db.transaction(async (tx) => {
    await tx.delete(labTestRunPlan).where(eq(labTestRunPlan.testId, testId));
    await tx.insert(labTestRunPlan).values(
      missions.map((m) => ({
        testId,
        missionId: m.missionId,
        orderIndex: m.orderIndex,
        fullAttempt: m.fullAttempt,
        notes: m.notes,
      }))
    );
  });

  await markTestConfigured(testId);
  revalidatePath(`${BASE_PATH}/${testId}`);
  revalidatePath(BASE_PATH);
}

export async function saveCalibrationPlan(
  testId: string,
  calibrationType: CalibrationSubtype,
  config: CalibrationConfig
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Não autenticado.");

  await db.insert(labTestCalibrationPlan).values({
    testId,
    calibrationType: toCalibrationDetailType(calibrationType),
    config,
  });

  await markTestConfigured(testId);
  revalidatePath(`${BASE_PATH}/${testId}`);
  revalidatePath(BASE_PATH);
}

export async function getLabTestForExecute(testId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Não autenticado.");

  const test = await db.query.labTests.findFirst({ where: eq(labTests.id, testId) });
  if (!test) throw new Error("Teste não encontrado.");
  if (test.userId !== userId) throw new Error("Você não tem acesso a este teste.");
  if (test.status === "rascunho") {
    throw new Error("Configure o teste antes de registrar uma execução.");
  }

  return test;
}

interface BaseExecutionInput {
  testId: string;
  operatorId: string;
  durationSeconds?: number;
  notes?: string;
  resultSummary?: string;
}

async function nextAttemptNumber(testId: string) {
  const rows = await db
    .select({ attemptNumber: labTestExecutions.attemptNumber })
    .from(labTestExecutions)
    .where(eq(labTestExecutions.testId, testId));
  return rows.reduce((max, r) => Math.max(max, r.attemptNumber), 0) + 1;
}

export async function createRunExecution(base: BaseExecutionInput, input: RunExecutionInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Não autenticado.");
  if (input.missions.length === 0) throw new Error("Registre o resultado de ao menos uma missão.");

  await db.transaction(async (tx) => {
    const attemptNumber = await nextAttemptNumber(base.testId);
    const [execution] = await tx
      .insert(labTestExecutions)
      .values({
        testId: base.testId,
        attemptNumber,
        operatorId: base.operatorId,
        durationSeconds: toNumeric(base.durationSeconds),
        notes: base.notes,
        resultSummary: base.resultSummary,
      })
      .returning();

    await tx.insert(labTestMissionResults).values(
      input.missions.map((m) => ({
        executionId: execution.id,
        missionId: m.missionId,
        scoreObtained: m.scoreObtained,
        completed: m.completed,
        notes: m.notes,
      }))
    );

    await tx.insert(labTestRunDetails).values({
      executionId: execution.id,
      strategyVersionId: input.strategyVersionId ?? null,
      season: input.season,
      arena: input.arena,
      totalScore: input.totalScore,
      finalTimeSeconds: toNumeric(input.finalTimeSeconds),
      penalties: input.penalties,
      finalResult: input.finalResult,
    });
  });

  revalidatePath(`${BASE_PATH}/${base.testId}`);
}

export async function createCalibrationExecution(
  base: BaseExecutionInput,
  input: CalibrationExecutionInput
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Não autenticado.");

  await db.transaction(async (tx) => {
    const attemptNumber = await nextAttemptNumber(base.testId);
    const [execution] = await tx
      .insert(labTestExecutions)
      .values({
        testId: base.testId,
        attemptNumber,
        operatorId: base.operatorId,
        durationSeconds: toNumeric(base.durationSeconds),
        notes: base.notes,
        resultSummary: base.resultSummary,
      })
      .returning();

    await tx.insert(labTestCalibrationDetails).values({
      executionId: execution.id,
      calibrationType: toCalibrationDetailType(input.calibrationType),
      robotModel: input.robotModel,
      firmware: input.firmware,
      batteryUsed: input.batteryUsed,
      sensorUsed: input.sensorUsed,
      motorUsed: input.motorUsed,
      portUsed: input.portUsed,
      idealValueFound: input.idealValueFound,
      configurationUsed: input.configurationUsed,
      result: input.result,
      finalNotes: input.finalNotes,
    });
  });

  revalidatePath(`${BASE_PATH}/${base.testId}`);
}

export async function createPersonalizadoExecution(
  base: BaseExecutionInput,
  input: PersonalizadoExecutionInput
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Não autenticado.");
  if (input.values.length === 0) throw new Error("Preencha ao menos um parâmetro.");

  await db.transaction(async (tx) => {
    const attemptNumber = await nextAttemptNumber(base.testId);
    const [execution] = await tx
      .insert(labTestExecutions)
      .values({
        testId: base.testId,
        attemptNumber,
        operatorId: base.operatorId,
        durationSeconds: toNumeric(base.durationSeconds),
        notes: base.notes,
        resultSummary: base.resultSummary,
      })
      .returning();

    await tx.insert(labTestParameterValues).values(
      input.values.map((v) => ({
        executionId: execution.id,
        parameterId: v.parameterId,
        value: v.value,
      }))
    );
  });

  revalidatePath(`${BASE_PATH}/${base.testId}`);
}

export async function saveCustomParameters(testId: string, parameters: CustomParameterInput[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Não autenticado.");

  if (parameters.length === 0) {
    throw new Error("Adicione ao menos um parâmetro.");
  }
  if (parameters.length > MAX_CUSTOM_PARAMETERS) {
    throw new Error(`No máximo ${MAX_CUSTOM_PARAMETERS} parâmetros por teste.`);
  }
  const names = parameters.map((p) => p.name.trim().toLowerCase());
  if (new Set(names).size !== names.length) {
    throw new Error("Os nomes dos parâmetros precisam ser únicos.");
  }

  await db.transaction(async (tx) => {
    const existing = await tx
      .select({ id: labTestParameters.id })
      .from(labTestParameters)
      .where(eq(labTestParameters.testId, testId));

    if (existing.length + parameters.length > MAX_CUSTOM_PARAMETERS) {
      throw new Error(`No máximo ${MAX_CUSTOM_PARAMETERS} parâmetros por teste.`);
    }

    await tx.insert(labTestParameters).values(
      parameters.map((p) => ({
        testId,
        name: p.name.trim(),
        type: p.type,
        unit: p.unit || null,
        description: p.description || null,
        isRequired: p.isRequired,
      }))
    );
  });

  await markTestConfigured(testId);
  revalidatePath(`${BASE_PATH}/${testId}`);
  revalidatePath(BASE_PATH);
}