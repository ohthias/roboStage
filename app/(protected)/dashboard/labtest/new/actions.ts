"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { FUTURE_EDITION_DATA } from "@/utils/data/static-data";
import { getUserLeagues } from "@/utils/stagebook/user-leagues";
import {
  FE_EDITION,
  getMatchDuration,
  normalizeFEResult,
  scoreAt,
} from "@/utils/labtest/future-edition";
import { KIT_IA_ID, getKitPreset, type KitPreset } from "@/utils/labtest/kit-ia";
import { OBR_LEAGUE, getObrPreset } from "@/utils/labtest/obr-presets";
import { OBR_EDITION, getObrArena, isObrConfig, validateObrResult } from "@/utils/labtest/obr";
import { calcInputs, computeCalc, isValidCalc } from "@/utils/labtest/calc";
import { sanitizeProject } from "@/utils/quickbrick/ArenaBuilder/project";
import { folders } from "@/db/schema/notebook";
import { tests, testExecutions } from "@/db/schema/labtest";
import { revalidatePath } from "next/cache";
import {
  resolveStagebookScope,
  StagebookAuthError,
  type StagebookScope,
} from "@/utils/stagebook/scope";
import { creatorScopeWhere, scopeWhere } from "@/utils/stagebook/permissions";
import { canDeleteResource } from "@/utils/stagebook/team-permissions";
import { ValidationError } from "@/utils/stagebook/validation";
import { runAction } from "@/utils/stagebook/action-result";

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
  competitionName?: string | null;
  season?: string | null;
  runMode?: string | null; // modo dentro da competição (ex.: "round")
  competitionCode?: string | null; // ex.: "FLL" (usado no ícone do card)
  missionOrder: string[]; // t.orderedSelected.map(m => m.id) — ordem definida pelo usuário
  answers: Record<string, MissionAnswer>; // t.answers
  /**
   * "future-edition" => partida cronometrada (missões fixas da temporada).
   * "obr-resgate"    => rodada da OBR Resgate (sem missões; pontuação do Pontuador).
   */
  edition?: string;
  /** OBR: cópia da arena do Criador de Arenas (opcional). */
  arena?: unknown;
  /** Duração da partida em segundos (Future Edition). */
  matchDuration?: number;
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

/** Testes prontos do kit LEGO Education Ciência e IA (só com a liga Future Edition ativa). */
type CalibrabotKitPayload = {
  mode: "calibrabot";
  calibraMode: "kit-ia";
  kitPreset: string;
  kitParams: string[]; // nomes dos parâmetros escolhidos dentro do preset
};

/** Testes prontos do CalibraBot para a OBR Resgate (só com a liga OBR ativa). */
type CalibrabotObrPayload = {
  mode: "calibrabot";
  calibraMode: "obr";
  obrPreset: string;
  obrParams: string[];
};

type CalibrabotPayload =
  | CalibrabotMotoresPayload
  | CalibrabotGiroPayload
  | CalibrabotPidPayload
  | CalibrabotKitPayload
  | CalibrabotObrPayload;

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
/**
 * Parâmetros escolhidos de um preset, na ordem do preset. Um campo calculado
 * leva junto os campos de que depende (senão nunca teria valor).
 */
function presetParams(preset: KitPreset, chosen: string[]) {
  const names = new Set(chosen);
  for (const param of preset.params) {
    if (param.calc && names.has(param.nome)) calcInputs(param.calc).forEach((n) => names.add(n));
  }
  return preset.params
    .filter((param) => names.has(param.nome))
    .map((param) => ({
      nome: param.nome,
      rotulo: param.rotulo,
      descricao: param.descricao,
      tipo: param.tipo,
      ...(param.unidade ? { unidade: param.unidade } : {}),
      ...(param.opcoes ? { opcoes: param.opcoes } : {}),
      ...(param.meta !== undefined ? { meta: param.meta } : {}),
      ...(param.calc ? { calc: param.calc } : {}),
    }));
}

function buildConfig(input: CreateTestInput) {
  switch (input.mode) {
    case "runs": {
      // OBR Resgate: rodada sem missões; a arena é opcional.
      if (input.edition === OBR_EDITION) {
        const arena = input.arena ? sanitizeProject(input.arena) : null;
        return {
          edition: OBR_EDITION,
          ...(input.competitionId ? { competitionId: input.competitionId } : {}),
          ...(input.competitionName ? { competitionName: input.competitionName } : {}),
          ...(input.competitionCode ? { competitionCode: input.competitionCode } : {}),
          ...(arena ? { arena } : {}),
        };
      }
      return {
        missions: input.missionOrder,
        answers: input.answers,
        ...(input.competitionId ? { competitionId: input.competitionId } : {}),
        ...(input.competitionName ? { competitionName: input.competitionName } : {}),
        ...(input.runMode ? { runMode: input.runMode } : {}),
        ...(input.competitionCode ? { competitionCode: input.competitionCode } : {}),
        ...(input.edition === FE_EDITION
          ? { edition: FE_EDITION, matchDuration: getMatchDuration({ matchDuration: input.matchDuration }) }
          : {}),
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

      if (input.calibraMode === "obr") {
        const preset = getObrPreset(input.obrPreset)!;
        return {
          tipo: "obr",
          preset: preset.id,
          presetNome: preset.label,
          liga: OBR_LEAGUE,
          parametros: presetParams(preset, input.obrParams),
        };
      }

      if (input.calibraMode === "kit-ia") {
        const preset = getKitPreset(input.kitPreset)!;
        return {
          tipo: "kit-ia",
          preset: preset.id,
          presetNome: preset.label,
          kit: KIT_IA_ID,
          liga: FE_EDITION,
          parametros: preset.params
            .filter((param) => input.kitParams.includes(param.nome))
            .map((param) => ({
              nome: param.nome,
              rotulo: param.rotulo,
              descricao: param.descricao,
              tipo: param.tipo,
              ...(param.unidade ? { unidade: param.unidade } : {}),
              ...(param.opcoes ? { opcoes: param.opcoes } : {}),
              ...(param.meta !== undefined ? { meta: param.meta } : {}),
            })),
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

function validateCreateInput(input: CreateTestInput) {
  if (input.mode === "runs" && input.edition === OBR_EDITION) {
    if (input.arena && !sanitizeProject(input.arena)) {
      throw new ValidationError("A arena importada é inválida.");
    }
    return;
  }
  if (input.mode === "runs") {
    if (
      !Array.isArray(input.missionOrder) ||
      input.missionOrder.length === 0 ||
      input.missionOrder.some(
        (mission) => typeof mission !== "string" || !mission.trim(),
      ) ||
      new Set(input.missionOrder).size !== input.missionOrder.length
    ) {
      throw new ValidationError("Selecione ao menos uma missão para a run.");
    }
    return;
  }

  if (input.mode === "calibrabot") {
    if (
      input.calibraMode === "motores" &&
      (!Array.isArray(input.motores) || input.motores.length === 0)
    ) {
      throw new ValidationError("Adicione ao menos um motor.");
    }
    if (input.calibraMode === "obr") {
      const preset = getObrPreset(input.obrPreset);
      if (!preset) throw new ValidationError("Escolha um teste da OBR.");
      const valid = new Set(preset.params.map((param) => param.nome));
      if (
        !Array.isArray(input.obrParams) ||
        input.obrParams.length === 0 ||
        input.obrParams.some((name) => !valid.has(name))
      ) {
        throw new ValidationError("Selecione ao menos uma medição válida do teste.");
      }
      return;
    }
    if (input.calibraMode === "kit-ia") {
      const preset = getKitPreset(input.kitPreset);
      if (!preset) throw new ValidationError("Escolha um teste do kit Ciência e IA.");
      const valid = new Set(preset.params.map((param) => param.nome));
      if (
        !Array.isArray(input.kitParams) ||
        input.kitParams.length === 0 ||
        input.kitParams.some((name) => !valid.has(name))
      ) {
        throw new ValidationError("Selecione ao menos um parâmetro válido do teste.");
      }
      return;
    }
    if (
      input.calibraMode === "giroscópio" &&
      (!Array.isArray(input.giroAnalysis) || input.giroAnalysis.length === 0)
    ) {
      throw new ValidationError("Selecione ao menos um indicador.");
    }
    if (
      input.calibraMode === "pid" &&
      (!Array.isArray(input.pidParams) || input.pidParams.length === 0)
    ) {
      throw new ValidationError("Selecione ao menos um parâmetro do PID.");
    }
    return;
  }

  if (
    !Array.isArray(input.params) ||
    input.params.length === 0 ||
    input.params.some((param) => !param.name.trim()) ||
    new Set(input.params.map((param) => param.name.trim().toLowerCase())).size !==
      input.params.length
  ) {
    throw new ValidationError("Adicione ao menos um parâmetro com nome.");
  }
}

/**
 * Partida da Future Edition: o resultado precisa ser o pacote
 * `futureEdition` e o total enviado tem de bater com o recálculo feito aqui
 * a partir dos eventos (o cliente não é a fonte da verdade da pontuação).
 */
async function validateFutureEditionResults(results: Record<string, unknown>) {
  const extra = Object.keys(results).filter((key) => key !== "futureEdition");
  const fe = normalizeFEResult(results.futureEdition);

  if (!fe || extra.length > 0) {
    throw new ValidationError("Partida inválida: resultado da Future Edition ausente ou incompleto.");
  }

  const data = FUTURE_EDITION_DATA;
  const recomputed = scoreAt(data, fe.events);

  if (recomputed.total !== fe.scores.total) {
    throw new ValidationError("A pontuação enviada não confere com os eventos da partida.");
  }
}

function validateExecutionResults(
  config: Record<string, unknown>,
  results: Record<string, unknown>,
) {
  const configuredFields = new Set<string>();

  if (Array.isArray(config.missions)) {
    config.missions.forEach((mission) => {
      if (typeof mission === "string") configuredFields.add(mission);
    });

    const answers = results.answers;
    const resultFields =
      answers && typeof answers === "object" && !Array.isArray(answers)
        ? Object.keys(answers)
        : Object.keys(results);

    if (
      resultFields.length === 0 ||
      resultFields.some((fieldKey) =>
        fieldKey === "answers" || fieldKey === "missions" || fieldKey === "precisionDiscs"
          ? false
          : !configuredFields.has(fieldKey),
      )
    ) {
      throw new ValidationError("A execução contém um campo que não pertence a este teste.");
    }
    return;
  }

  if (config.tipo === "motores") {
    const motores = Array.isArray(config.motores)
      ? config.motores.filter((motor): motor is string => typeof motor === "string")
      : [];
    const pares = Array.isArray(config.pares) ? config.pares : [];
    const bases = config.modo === "duplas"
      ? pares.flatMap((pair) =>
          Array.isArray(pair) && pair.every((motor) => typeof motor === "string")
            ? [`${pair[0]}__${pair[1]}`]
            : [],
        )
      : motores;
    bases.forEach((base) => {
      configuredFields.add(`${base}__rotacao`);
      configuredFields.add(`${base}__tempo`);
    });
  } else if (Array.isArray(config.parametros)) {
    config.parametros.forEach((param) => {
      if (typeof param === "string") configuredFields.add(param);
      else if (param && typeof param === "object" && typeof param.nome === "string") {
        configuredFields.add(param.nome);
      }
    });
  } else if (Array.isArray(config.indicadores)) {
    config.indicadores.forEach((indicator) => {
      if (typeof indicator === "string") configuredFields.add(indicator);
    });
  }

  const isEmpty = (v: unknown) =>
    v === null || v === undefined || (typeof v === "string" && !v.trim());

  const resultKeys = Object.keys(results);
  if (
    configuredFields.size === 0 ||
    resultKeys.length === 0 ||
    resultKeys.some((fieldKey) => !configuredFields.has(fieldKey))
  ) {
    throw new ValidationError("A execução contém campos inválidos para este teste.");
  }

  if (resultKeys.every((key) => isEmpty(results[key]))) {
    throw new ValidationError("Preencha ao menos um campo da execução.");
  }

  // Parâmetros personalizados marcados como obrigatórios.
  if (Array.isArray(config.parametros)) {
    const missing = config.parametros
      .filter(
        (p): p is { nome: string; obrigatorio?: boolean } =>
          !!p && typeof p === "object" && typeof (p as { nome?: unknown }).nome === "string",
      )
      .filter((p) => p.obrigatorio === true && isEmpty(results[p.nome]))
      .map((p) => p.nome);
    if (missing.length) {
      throw new ValidationError(`Preencha os campos obrigatórios: ${missing.join(", ")}.`);
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

/** A liga Future Edition está entre as ligas/competições do usuário? */
async function userHasFutureEdition(userId: string) {
  return (await getUserLeagues(userId)).some(
    (row) => /future/i.test(row.code) || /future edition/i.test(row.name),
  );
}

/** A OBR está entre as ligas/competições do usuário? */
async function userHasObr(userId: string) {
  return (await getUserLeagues(userId)).some((row) =>
    /\bobr\b|olimp[ií]ada brasileira de rob[oó]tica/i.test(`${row.code} ${row.name}`),
  );
}

/** Testes visíveis no scope atual (o criador fica em `userId` mesmo na equipe). */
function testScope(scope: StagebookScope) {
  return creatorScopeWhere(scope, { userId: tests.userId, teamId: tests.teamId });
}

const MAX_EXECUTION_INSERT_ATTEMPTS = 5;

function isUniqueViolation(error: unknown): boolean {
  // O driver do Neon expõe o SQLSTATE em `code`; o Drizzle embrulha o erro em `cause`.
  for (let current = error, depth = 0; current && depth < 4; depth++) {
    if ((current as { code?: unknown }).code === "23505") return true;
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}

/**
 * Grava um lançamento com o próximo número do teste. O número é calculado no
 * próprio INSERT e a constraint única `(test_id, execution_number)` rejeita o
 * perdedor de uma corrida (duas abas salvando juntas), que tenta de novo.
 * O driver HTTP do Neon não tem transação interativa, por isso a constraint.
 */
async function insertNextExecution(values: {
  testId: string;
  notes: string | null;
  results: Record<string, unknown>;
}) {
  for (let attempt = 1; ; attempt++) {
    try {
      const [created] = await db
        .insert(testExecutions)
        .values({
          ...values,
          executionNumber: sql<number>`(
            select coalesce(max(${testExecutions.executionNumber}), 0) + 1
            from ${testExecutions}
            where ${testExecutions.testId} = ${values.testId}
          )`,
        })
        .returning();
      return created;
    } catch (error) {
      if (attempt >= MAX_EXECUTION_INSERT_ATTEMPTS || !isUniqueViolation(error)) throw error;
    }
  }
}

/* =========================================================================
 * createTest — action principal, chamada pelo botão "Gerar teste"
 * ========================================================================= */

export async function createTest(input: CreateTestInput) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();

    if (!input.name?.trim()) {
      throw new ValidationError("Informe um nome para o teste.");
    }

    validateCreateInput(input);

    // Future Edition (partidas e testes do kit) só para quem tem a liga ativa.
    const needsFutureEdition =
      (input.mode === "runs" && input.edition === FE_EDITION) ||
      (input.mode === "calibrabot" && input.calibraMode === "kit-ia");

    if (needsFutureEdition && !(await userHasFutureEdition(scope.userId))) {
      throw new ValidationError(
        "Ative a liga FLL Future Edition em Ligas e Competições para criar este teste.",
      );
    }

    // Rodadas e presets da OBR só para quem tem a liga OBR ativa.
    const needsObr =
      (input.mode === "runs" && input.edition === OBR_EDITION) ||
      (input.mode === "calibrabot" && input.calibraMode === "obr");

    if (needsObr && !(await userHasObr(scope.userId))) {
      throw new ValidationError("Ative a liga OBR em Ligas e Competições para criar este teste.");
    }

    if (input.folderId) {
      const [folder] = await db
        .select({ id: folders.id })
        .from(folders)
        .where(
          and(
            eq(folders.id, input.folderId),
            scopeWhere(scope, { userId: folders.userId, teamId: folders.teamId }),
          ),
        )
        .limit(1);

      if (!folder) throw new ValidationError("Pasta inválida ou sem permissão.");
    }

    const config = buildConfig(input);
    const mode = resolveTestMode(input);

    // "season: se tiver a da fll registra o nome da temporada em minúsculo"
    const season =
      "season" in input && input.season ? input.season.toLowerCase() : null;

    const [created] = await db
      .insert(tests)
      .values({
        userId: scope.userId,
        teamId: scope.type === "team" ? scope.teamId : null,
        folderId: input.folderId ?? null,
        name: input.name.trim(),
        description: input.description ?? null,
        mode,
        season,
        status: "planejamento", // "começa com planejamento"
        config,
      })
      .returning();

    revalidatePath("/dashboard/labtest");
    revalidatePath("/dashboard/folders", "layout");

    return created;
  });
}

/* =========================================================================
 * updateTestStatus — "futuramente o usuário poderá alterar" o status
 * ========================================================================= */

export async function updateTestStatus(testId: string, status: string) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();

    const [updated] = await db
      .update(tests)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(tests.id, testId), testScope(scope)))
      .returning();

    if (!updated) {
      throw new ValidationError("Teste não encontrado ou sem permissão.");
    }

    revalidatePath("/dashboard/labtest");
    revalidatePath(`/dashboard/labtest/${testId}`);

    return updated;
  });
}

/* =========================================================================
 * deleteTest
 * ========================================================================= */

export async function deleteTest(testId: string) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();

    const [existing] = await db
      .select({ creatorId: tests.userId })
      .from(tests)
      .where(and(eq(tests.id, testId), testScope(scope)))
      .limit(1);

    if (!existing) throw new ValidationError("Teste não encontrado ou sem permissão.");

    // Na equipe, membros excluem só o que criaram; técnicos e mentores, qualquer teste.
    if (scope.type === "team" && !canDeleteResource(scope.role, existing.creatorId, scope.userId)) {
      throw new StagebookAuthError(
        "Só técnicos e mentores podem excluir testes criados por outras pessoas.",
      );
    }

    await db.delete(tests).where(and(eq(tests.id, testId), testScope(scope)));

    revalidatePath("/dashboard/labtest");
  });
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
  return runAction(async () => {
    const scope = await resolveStagebookScope();

    const [owned] = await db
      .select({ id: tests.id, config: tests.config })
      .from(tests)
      .where(and(eq(tests.id, input.testId), testScope(scope)));

    if (!owned) {
      throw new ValidationError("Teste não encontrado ou sem permissão.");
    }

    let results = input.results ?? {};
    const ownedConfig = owned.config as Record<string, unknown>;

    if (ownedConfig.edition === FE_EDITION) {
      await validateFutureEditionResults(results);
    } else if (isObrConfig(ownedConfig)) {
      // Rodada OBR: só o pacote `obrRound`, coerente e com o placar recalculado.
      const extra = Object.keys(results).filter((key) => key !== "obrRound");
      if (extra.length > 0) throw new ValidationError("Rodada inválida: campos desconhecidos.");
      results = { obrRound: validateObrResult(results.obrRound, getObrArena(ownedConfig)) };
    } else {
      // Campos calculados (presets) são refeitos aqui, não confiados ao cliente.
      if (Array.isArray(ownedConfig.parametros)) {
        const calcs = (ownedConfig.parametros as unknown[]).flatMap((param) => {
          const p = param as { nome?: unknown; calc?: unknown };
          return typeof p?.nome === "string" && isValidCalc(p.calc) ? [{ nome: p.nome, calc: p.calc }] : [];
        });
        if (calcs.length) {
          const next = { ...results };
          for (const { nome, calc } of calcs) {
            const value = computeCalc(calc, results);
            if (value === null) delete next[nome];
            else next[nome] = value;
          }
          results = next;
        }
      }
      validateExecutionResults(ownedConfig, results);
    }

    const created = await insertNextExecution({
      testId: input.testId,
      notes: input.notes ?? null,
      results,
    });

    revalidatePath(`/dashboard/labtest/${input.testId}`);

    return created;
  });
}

/* =========================================================================
 * listTests — leitura simples para o painel/listagem de testes
 * ========================================================================= */

export async function listTests() {
  const scope = await resolveStagebookScope();

  return db
    .select()
    .from(tests)
    .where(testScope(scope))
    .orderBy(desc(tests.createdAt));
}

export async function updateLabTestStatus({
  testId,
  status,
}: {
  testId: string;
  status: string;
}) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();

    const [updated] = await db
      .update(tests)
      .set({
        status,
      })
      .where(and(eq(tests.id, testId), testScope(scope)))
      .returning();

    if (!updated) {
      throw new ValidationError("Teste não encontrado ou sem permissão.");
    }

    return updated;
  });
}