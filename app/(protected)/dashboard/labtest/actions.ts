"use server";

// ATENÇÃO: este arquivo assume os caminhos de import do seu projeto
// (`@/db`, `@/db/schema`) e o formato dos tipos definidos em
// `[id]/setup/types.ts`. Ajuste os imports para o caminho real do seu
// drizzle client e do schema antes de integrar.

import { db } from "@/db/client";
import {
  labTests,
  labTestRunPlan,
  labTestCalibrationPlan,
  labTestParameters,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type {
  RunPlanMissionInput,
  CalibrationConfig,
  CustomParameterInput,
  CalibrationSubtype,
} from "./[id]/setup/types";
import { auth } from "@clerk/nextjs/server";

type DbCalibrationType = (typeof labTestCalibrationPlan.$inferInsert)["calibrationType"];

const MAX_CUSTOM_PARAMETERS = 10;

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

export async function saveRunPlan(testId: string, missions: RunPlanMissionInput[]) {
  const session = await auth();
  if (!session?.userId) throw new Error("Não autenticado.");
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

  revalidatePath(`/labtest/${testId}`);
  revalidatePath("/labtest");
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

  revalidatePath(`/labtest/${testId}`);
  revalidatePath("/labtest");
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

  await db.transaction(async (tx) => {
    // Checagem defensiva contra parâmetros já existentes (retomando um rascunho).
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

  revalidatePath(`/labtest/${testId}`);
  revalidatePath("/labtest");
}