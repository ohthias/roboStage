"use server";

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
  fllMissions,
} from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import type {
  RunPlanMissionInput,
  CalibrationConfig,
  CustomParameterInput,
  CalibrationSubtype,
} from "./[id]/setup/types";
import type {
  RunExecutionInput,
  CalibrationExecutionInput,
  PersonalizadoExecutionInput,
} from "./[id]/execute/types";
import { auth } from "@clerk/nextjs/server";

type DbCalibrationType = (typeof labTestCalibrationPlan.$inferInsert)["calibrationType"];

const MAX_CUSTOM_PARAMETERS = 10;
// Antes, saveRunPlan/saveCalibrationPlan/saveCustomParameters revalidavam
// "/labtest/..." (sem o prefixo "/dashboard"), enquanto updateLabTestInfo já
// usava "/dashboard/labtest/...". Como a rota real é /dashboard/labtest (ver
// page.tsx da listagem), o revalidatePath daquelas três funções não batia em
// nada — o Next simplesmente invalidava um path que não existe, então a
// listagem/detalhe não atualizavam sozinhos depois de salvar o plano.
// Centralizando num único BASE_PATH pra não reintroduzir essa divergência.
const BASE_PATH = "/dashboard/labtest";

interface CreateLabTestInput {
  name: string;
  description?: string;
  type: "run" | "calibrabot" | "personalizado";
  teamId?: string;
}

export async function createLabTest(input: CreateLabTestInput) {
  const session = await auth();
  if (!session?.userId) throw new Error("Não autenticado.");

  const [test] = await db
    .insert(labTests)
    .values({
      name: input.name,
      description: input.description,
      type: input.type,
      userId: session.userId,
      teamId: input.teamId ?? null,
      createdBy: session.userId,
      // Reintroduzido: sem isso, todo teste nasce direto com o status
      // default do schema ('ativo'), e o guard de "configure antes de
      // executar" em getLabTestForExecute nunca dispara porque nunca existe
      // um teste em rascunho. Se isso foi removido de propósito no seu
      // merge, é só apagar esta linha — o resto do arquivo não depende dela.
      status: "rascunho",
    })
    .returning();

  // Não chamamos revalidatePath aqui: a listagem só precisa atualizar
  // depois que a configuração (fase 2) também existir, então quem
  // dispara o refresh é a página de setup ao concluir.
  return test;
}

export async function getLabTestForSetup(testId: string) {
  const session = await auth();
  if (!session?.userId) throw new Error("Não autenticado.");

  const test = await db.query.labTests.findFirst({
    where: eq(labTests.id, testId),
  });

  if (!test) throw new Error("Teste não encontrado.");
  // Reforce aqui a checagem de permissão real do seu projeto
  // (dono do teste ou membro do team_id), isso é só um placeholder.
  if (test.userId !== session.userId) {
    throw new Error("Você não tem acesso a este teste.");
  }

  return test;
}

async function markTestConfigured(testId: string) {
  await db.update(labTests).set({ status: "ativo" }).where(eq(labTests.id, testId));
}

export async function saveRunPlan(
  testId: string,
  season: string,
  missions: RunPlanMissionInput[]
) {
  const session = await auth();
  if (!session?.userId) throw new Error("Não autenticado.");
  if (missions.length === 0) throw new Error("Selecione ao menos uma missão.");

  // Look up mission UUIDs by code and season
  const missionCodes = missions.map((m) => m.missionId);
  const missionRecords = await db
    .select({
      code: fllMissions.code,
      id: fllMissions.id,
    })
    .from(fllMissions)
    .where(
      and(
        inArray(fllMissions.code, missionCodes),
        eq(fllMissions.season, season)
      )
    );

  const codeToId = new Map(missionRecords.map((m) => [m.code, m.id]));

  // Generate UUIDs for missing missions and insert them
  const missingCodes = missionCodes.filter((code) => !codeToId.has(code));
  if (missingCodes.length > 0) {
    for (const code of missingCodes) {
      const newId = randomUUID();
      await db.insert(fllMissions).values({
        id: newId,
        code,
        name: code, // Use code as name for auto-generated missions
        season,
        maxScore: 0, // Default value, can be updated later
      });
      codeToId.set(code, newId);
    }
  }

  await db.delete(labTestRunPlan).where(eq(labTestRunPlan.testId, testId));
  await db.insert(labTestRunPlan).values(
    missions.map((m) => {
      const missionUuid = codeToId.get(m.missionId);
      if (!missionUuid) {
        throw new Error(`Missão não encontrada: ${m.missionId}`);
      }
      return {
        testId,
        missionId: missionUuid,
        orderIndex: m.orderIndex,
        fullAttempt: m.fullAttempt,
        notes: m.notes,
      };
    })
  );

  await markTestConfigured(testId);
  revalidatePath(`${BASE_PATH}/${testId}`);
  revalidatePath(BASE_PATH);
}

export async function saveCalibrationPlan(
  testId: string,
  calibrationType: CalibrationSubtype,
  config: CalibrationConfig
) {
  const session = await auth();
  if (!session?.userId) throw new Error("Não autenticado.");

  await db.insert(labTestCalibrationPlan).values({
    testId,
    calibrationType: calibrationType as DbCalibrationType,
    config,
  });

  await markTestConfigured(testId);
  revalidatePath(`${BASE_PATH}/${testId}`);
  revalidatePath(BASE_PATH);
}

export async function saveCustomParameters(testId: string, parameters: CustomParameterInput[]) {
  const session = await auth();
  if (!session?.userId) throw new Error("Não autenticado.");

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

  // Checagem defensiva contra parâmetros já existentes (retomando um rascunho).
  const existing = await db
    .select({ id: labTestParameters.id })
    .from(labTestParameters)
    .where(eq(labTestParameters.testId, testId));

  if (existing.length + parameters.length > MAX_CUSTOM_PARAMETERS) {
    throw new Error(`No máximo ${MAX_CUSTOM_PARAMETERS} parâmetros por teste.`);
  }

  await db.insert(labTestParameters).values(
    parameters.map((p) => ({
      testId,
      name: p.name.trim(),
      type: p.type,
      unit: p.unit || null,
      description: p.description || null,
      isRequired: p.isRequired,
    }))
  );

  await markTestConfigured(testId);
  revalidatePath(`${BASE_PATH}/${testId}`);
  revalidatePath(BASE_PATH);
}

interface UpdateLabTestInfoInput {
  name: string;
  description?: string;
  teamId?: string;
}

export async function updateLabTestInfo(testId: string, input: UpdateLabTestInfoInput) {
  const session = await auth();
  if (!session?.userId) throw new Error("Não autenticado.");

  // Verificar se o teste existe e se o usuário tem acesso
  const test = await db.query.labTests.findFirst({
    where: eq(labTests.id, testId),
  });

  if (!test) throw new Error("Teste não encontrado.");
  if (test.userId !== session.userId) {
    throw new Error("Você não tem acesso a este teste.");
  }

  if (!input.name.trim()) {
    throw new Error("Dá um nome pro teste.");
  }

  // Atualizar apenas as informações básicas
  await db
    .update(labTests)
    .set({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      teamId: input.teamId || null,
    })
    .where(eq(labTests.id, testId));

  revalidatePath(`${BASE_PATH}/${testId}`);
  revalidatePath(BASE_PATH);
}

// ---------------------------------------------------------------------------
// Execução (/[id]/execute)
// ---------------------------------------------------------------------------

export async function getLabTestForExecute(testId: string) {
  const session = await auth();
  if (!session?.userId) throw new Error("Não autenticado.");

  const test = await db.query.labTests.findFirst({ where: eq(labTests.id, testId) });
  if (!test) throw new Error("Teste não encontrado.");
  if (test.userId !== session.userId) throw new Error("Você não tem acesso a este teste.");
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

// drizzle-orm tipa colunas `numeric(...)` como `string` no insert (pra não
// perder precisão convertendo por float), mesmo que o valor "pareça" um
// número. `duration_seconds` e `final_time_seconds` são numeric(10,2), então
// precisam ser convertidos aqui antes de entrar no `.values()`.
function toNumeric(value: number | undefined): string | undefined {
  return value === undefined ? undefined : value.toString();
}

async function nextAttemptNumber(testId: string) {
  const rows = await db
    .select({ attemptNumber: labTestExecutions.attemptNumber })
    .from(labTestExecutions)
    .where(eq(labTestExecutions.testId, testId));
  return rows.reduce((max, r) => Math.max(max, r.attemptNumber), 0) + 1;
}

export async function createRunExecution(base: BaseExecutionInput, input: RunExecutionInput) {
  const session = await auth();
  if (!session?.userId) throw new Error("Não autenticado.");
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
  const session = await auth();
  if (!session?.userId) throw new Error("Não autenticado.");

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
      calibrationType: input.calibrationType as DbCalibrationType,
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
  const session = await auth();
  if (!session?.userId) throw new Error("Não autenticado.");
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