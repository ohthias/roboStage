"use server";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { tests, testExecutions } from "@/db/schema/labtest";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

/* =========================================================================
 * Tipos de entrada — espelham o estado que o hook `useCreateTest` produz
 * (t.mode, t.orderedSelected, t.answers, t.calibraMode, t.motors,
 * t.customParams etc). Ajuste os nomes de campo se o hook usar outros.
 * ========================================================================= */

type MissionAnswer = {
  value?: number; // resposta principal (missão legada)
  objectiveAnswers?: Record<string, number>; // resposta por objetivo (missão FE)
  subAnswers?: Record<string, number>; // resposta por sub-missão (missão legada)
};

type RunsPayload = {
  mode: "runs";
  competitionId: string;
  season?: string | null;
  missionOrder: string[]; // t.orderedSelected.map(m => m.id) — ordem definida pelo usuário
  answers: Record<string, MissionAnswer>; // t.answers
};

type CalibrabotMotoresPayload = {
  mode: "calibrabot";
  calibraMode: "motores";
  motores: string[]; // t.motors
  motorTestType: "individual" | "duplas"; // t.motorTestType
};

type CalibrabotGiroPayload = {
  mode: "calibrabot";
  calibraMode: "giroscópio";
  giroAngle: number; // t.giroAngle
  giroAnalysis: string[]; // t.giroAnalysis
};

type CalibrabotPidPayload = {
  mode: "calibrabot";
  calibraMode: "pid";
  pidDistance: number; // t.pidDistance
  pidParams: string[]; // t.pidParams
};

type CalibrabotPayload =
  | CalibrabotMotoresPayload
  | CalibrabotGiroPayload
  | CalibrabotPidPayload;

type CustomParamPayload = {
  id: string;
  name: string; // p.name
  type: string; // p.type
  required?: boolean;
  description?: string;
  min?: number; // p.min (apenas type === "number")
  max?: number; // p.max (apenas type === "number")
};

type CustomPayload = {
  mode: "custom";
  params: CustomParamPayload[]; // t.customParams
};

export type CreateTestInput = (RunsPayload | CalibrabotPayload | CustomPayload) & {
  name: string;
  description?: string;
  teamId?: string | null;
  folderId?: string | null;
};

/* =========================================================================
 * Helpers
 * ========================================================================= */

/** Mesma lógica de `t.motorPairs()` do hook: todas as combinações 2 a 2. */
function buildMotorPairs(motores: string[]): [string, string][] {
  const pairs: [string, string][] = [];
  for (let i = 0; i < motores.length; i++) {
    for (let j = i + 1; j < motores.length; j++) {
      pairs.push([motores[i], motores[j]]);
    }
  }
  return pairs;
}

/** Monta o jsonb `config` de acordo com o modo, seguindo o formato pedido:
 *  - runs      -> { missions: [id, id, id...], answers }
 *  - calibrabot -> { tipo, modo, ... } (motores | giroscópio | pid)
 *  - custom    -> { parametros: [{ nome, obrigatorio, descricao, tipo, min, max }] }
 */
function buildConfig(input: CreateTestInput) {
  switch (input.mode) {
    case "runs": {
      return {
        missions: input.missionOrder,
        answers: input.answers,
      };
    }

    case "calibrabot": {
      if (input.calibraMode === "motores") {
        const pares =
          input.motorTestType === "duplas"
            ? buildMotorPairs(input.motores)
            : undefined;

        return {
          tipo: "motores",
          modo: input.motorTestType,
          motores: input.motores,
          ...(pares ? { pares } : {}),
        };
      }

      if (input.calibraMode === "giroscópio") {
        return {
          tipo: "giroscopio",
          anguloAlvo: input.giroAngle,
          indicadores: input.giroAnalysis,
        };
      }

      // pid
      return {
        tipo: "pid",
        distanciaAlvo: input.pidDistance,
        parametros: input.pidParams,
      };
    }

    case "custom": {
      return {
        parametros: input.params.map((p) => ({
          nome: p.name,
          obrigatorio: p.required ?? false,
          descricao: p.description ?? "",
          tipo: p.type,
          ...(p.type === "number"
            ? { min: p.min ?? 0, max: p.max ?? 100 }
            : {}),
        })),
      };
    }
  }
}

/** O form tem 3 abas (runs | calibrabot | custom), mas o enum do banco tem 4
 * valores (runs | calibrabot | individual | custom) — "individual" existe
 * separadamente para o sub-caso "motores". Aqui eu direciono "motores" para
 * "individual" e mantenho giroscópio/pid como "calibrabot".
 * Se preferir manter tudo simplesmente como "calibrabot", troque o enum
 * no schema para 3 valores e remova esta função (use input.mode direto). */
function resolveTestMode(
  input: CreateTestInput,
): "runs" | "calibrabot" | "individual" | "custom" {
  if (input.mode === "calibrabot" && input.calibraMode === "motores") {
    return "individual";
  }
  return input.mode;
}

/* =========================================================================
 * createTest — action principal, chamada pelo botão "Gerar teste"
 * ========================================================================= */

export async function createTest(input: CreateTestInput) {
  const session = await auth();
  if (!session?.userId) {
    throw new Error("Usuário não autenticado.");
  }

  if (!input.name?.trim()) {
    throw new Error("Informe um nome para o teste.");
  }

  const config = buildConfig(input);
  const mode = resolveTestMode(input);

  // "season: se tiver a da fll registra o nome da temporada em minúsculo"
  const season =
    "season" in input && input.season ? input.season.toLowerCase() : null;

  const [created] = await db
    .insert(tests)
    .values({
      userId: session.userId,
      teamId: input.teamId ?? null,
      folderId: input.folderId ?? null,
      name: input.name.trim(),
      description: input.description ?? null,
      mode,
      season,
      status: "planejamento", // "começa com planejamento"
      config,
    })
    .returning();

  revalidatePath("/tests");

  return created;
}

/* =========================================================================
 * updateTestStatus — "futuramente o usuário poderá alterar" o status
 * ========================================================================= */

export async function updateTestStatus(testId: string, status: string) {
  const session = await auth();
  if (!session?.userId) {
    throw new Error("Usuário não autenticado.");
  }

  const [updated] = await db
    .update(tests)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(tests.id, testId), eq(tests.userId, session.userId)))
    .returning();

  if (!updated) {
    throw new Error("Teste não encontrado ou sem permissão.");
  }

  revalidatePath("/tests");
  revalidatePath(`/tests/${testId}`);

  return updated;
}

/* =========================================================================
 * deleteTest
 * ========================================================================= */

export async function deleteTest(testId: string) {
  const session = await auth();
  if (!session?.userId) {
    throw new Error("Usuário não autenticado.");
  }

  await db
    .delete(tests)
    .where(and(eq(tests.id, testId), eq(tests.userId, session.userId)));

  revalidatePath("/tests");
}

/* =========================================================================
 * createTestExecution — registra um lançamento/execução de um teste
 * já criado (tabela test_executions)
 * ========================================================================= */

export async function createTestExecution(input: {
  testId: string;
  notes?: string;
  results?: Record<string, unknown>;
}) {
  const session = await auth();
  if (!session?.userId) {
    throw new Error("Usuário não autenticado.");
  }

  const [owned] = await db
    .select({ id: tests.id })
    .from(tests)
    .where(and(eq(tests.id, input.testId), eq(tests.userId, session.userId)));

  if (!owned) {
    throw new Error("Teste não encontrado ou sem permissão.");
  }

  const [lastExecution] = await db
    .select({ executionNumber: testExecutions.executionNumber })
    .from(testExecutions)
    .where(eq(testExecutions.testId, input.testId))
    .orderBy(desc(testExecutions.executionNumber))
    .limit(1);

  const nextNumber = (lastExecution?.executionNumber ?? 0) + 1;

  const [created] = await db
    .insert(testExecutions)
    .values({
      testId: input.testId,
      executionNumber: nextNumber,
      notes: input.notes ?? null,
      results: input.results ?? {},
    })
    .returning();

  revalidatePath(`/tests/${input.testId}`);

  return created;
}

/* =========================================================================
 * listTests — leitura simples para o painel/listagem de testes
 * ========================================================================= */

export async function listTests() {
  const session = await auth();
  if (!session?.userId) {
    throw new Error("Usuário não autenticado.");
  }

  return db
    .select()
    .from(tests)
    .where(eq(tests.userId, session.userId))
    .orderBy(desc(tests.createdAt));
}