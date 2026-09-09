/**
 * lib/mission-timer/calculations.ts
 *
 * Funções puras de cálculo estatístico do Mission Timer.
 * Nenhuma função aqui toca em React, DOM ou storage.
 */

import type {
  Mission,
  MissionAttempt,
  MissionStatistics,
  MissionTimerResult,
  MissionTimerSession,
} from "./types";

function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Tentativas que efetivamente aconteceram (sucesso ou falha, não "skipped"). */
export function executedAttempts(attempts: MissionAttempt[]): MissionAttempt[] {
  return attempts.filter((a) => a.result === "success" || a.result === "failure");
}

export function calculateSuccessRate(attempts: MissionAttempt[]): number {
  const executed = executedAttempts(attempts);
  if (executed.length === 0) return 0;
  const successes = executed.filter((a) => a.result === "success").length;
  return round((successes / executed.length) * 100, 0);
}

export function calculateFailureRate(attempts: MissionAttempt[]): number {
  const rate = calculateSuccessRate(attempts);
  return executedAttempts(attempts).length === 0 ? 0 : round(100 - rate, 0);
}

/**
 * Soma os pontos das missões concluídas com sucesso.
 * Retorna `undefined` se nenhuma das missões executadas com sucesso
 * possuir pontuação definida no JSON de origem (nunca inventa valor).
 */
export function calculateScore(
  attempts: MissionAttempt[],
  missionsById: Map<string, Mission>
): number | undefined {
  const successful = attempts.filter((a) => a.result === "success");
  let hasAnyPoints = false;
  let total = 0;

  for (const attempt of successful) {
    const mission = missionsById.get(attempt.missionId);
    if (mission?.points !== undefined) {
      hasAnyPoints = true;
      total += mission.points;
    }
  }

  return hasAnyPoints ? total : undefined;
}

export function calculateMissionStats(attempts: MissionAttempt[]): MissionStatistics[] {
  const byMission = new Map<string, MissionAttempt[]>();
  for (const attempt of attempts) {
    if (attempt.result === "skipped") continue;
    const list = byMission.get(attempt.missionId) ?? [];
    list.push(attempt);
    byMission.set(attempt.missionId, list);
  }

  // Primeira falha, seguindo a ordem cronológica dos lançamentos.
  const executed = executedAttempts(attempts).sort((a, b) => a.startedAt - b.startedAt);
  const firstFailure = executed.find((a) => a.result === "failure");

  // Missão(ões) com mais falhas.
  const failureCounts = new Map<string, number>();
  for (const [missionId, list] of byMission) {
    failureCounts.set(
      missionId,
      list.filter((a) => a.result === "failure").length
    );
  }
  const maxFailures = Math.max(0, ...Array.from(failureCounts.values()));

  const stats: MissionStatistics[] = [];
  for (const [missionId, list] of byMission) {
    const successes = list.filter((a) => a.result === "success").length;
    const failures = list.filter((a) => a.result === "failure").length;
    stats.push({
      missionId,
      attempts: list.length,
      successes,
      failures,
      successRate: list.length > 0 ? round((successes / list.length) * 100, 0) : 0,
      isFirstFailure: firstFailure?.missionId === missionId,
      isMostInconsistent: maxFailures > 0 && failures === maxFailures,
    });
  }

  return stats;
}

/** Consistência simples: % de lançamentos executados que terminaram em sucesso. */
export function calculateConsistency(attempts: MissionAttempt[]): number {
  return calculateSuccessRate(attempts);
}

/** Duração efetiva do teste, descontando o tempo em pausa, em ms. */
export function calculateTotalDuration(session: MissionTimerSession, now = Date.now()): number {
  if (!session.startedAt) return 0;
  const end = session.finishedAt ?? (session.pausedAt ?? now);
  const raw = end - session.startedAt - session.totalPausedMs;
  return Math.max(0, raw);
}

export function formatDurationMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function generateSummary(
  result: Omit<MissionTimerResult, "summaryText">,
  missionsById: Map<string, Mission>
): string {
  const { totalMissions, executed, successRate, firstFailureMissionId, mostInconsistentMissionIds } =
    result;

  const parts: string[] = [];

  parts.push(
    `Você concluiu ${executed} das ${totalMissions} missões selecionadas, com taxa de sucesso de ${successRate}%.`
  );

  if (firstFailureMissionId) {
    const mission = missionsById.get(firstFailureMissionId);
    const label = mission ? `${mission.id}` : firstFailureMissionId;
    parts.push(`A principal dificuldade deste teste foi ${label}, que apresentou falha durante a execução.`);
  } else if (executed > 0) {
    parts.push("Nenhuma falha foi registrada — todas as tentativas executadas tiveram sucesso.");
  }

  if (mostInconsistentMissionIds.length > 1) {
    parts.push(
      `Houve empate entre ${mostInconsistentMissionIds.join(", ")} como as missões mais inconsistentes.`
    );
  }

  if (successRate >= 80) {
    parts.push("A sequência teve bom desempenho geral.");
  } else if (successRate >= 50) {
    parts.push("A sequência teve desempenho mediano — há espaço para ajustes.");
  } else if (executed > 0) {
    parts.push("A sequência teve desempenho abaixo do esperado — vale revisar a estratégia das missões que falharam.");
  }

  return parts.join(" ");
}

/**
 * Monta o objeto de resultado final a partir da sessão finalizada.
 * Esta é a função central usada tanto pela tela de resultado quanto
 * pela geração do relatório Markdown/PDF — garantindo que os números
 * exibidos em todos os lugares sejam sempre os mesmos.
 */
export function buildMissionTimerResult(
  session: MissionTimerSession,
  missions: Mission[]
): MissionTimerResult {
  const missionsById = new Map(missions.map((m) => [m.id, m]));

  const totalMissions = session.sequence.length;
  const executed = executedAttempts(session.attempts).length;
  const successes = session.attempts.filter((a) => a.result === "success").length;
  const failures = session.attempts.filter((a) => a.result === "failure").length;
  const skipped = session.attempts.filter((a) => a.result === "skipped").length;

  const successRate = calculateSuccessRate(session.attempts);
  const failureRate = calculateFailureRate(session.attempts);
  const score = calculateScore(session.attempts, missionsById);
  const consistency = calculateConsistency(session.attempts);
  const missionStats = calculateMissionStats(session.attempts);

  const firstFailureStat = missionStats.find((s) => s.isFirstFailure);
  const mostInconsistentMissionIds = missionStats
    .filter((s) => s.isMostInconsistent)
    .map((s) => s.missionId);

  const effectiveDurationMs = calculateTotalDuration(session, session.finishedAt ?? Date.now());

  const base: Omit<MissionTimerResult, "summaryText"> = {
    seasonId: session.seasonId,
    seasonName: session.seasonName,
    configuredDurationMs: session.config.durationMs,
    effectiveDurationMs,
    totalMissions,
    executed,
    successes,
    failures,
    skipped,
    successRate,
    failureRate,
    score,
    consistency,
    missionStats,
    firstFailureMissionId: firstFailureStat?.missionId,
    mostInconsistentMissionIds,
    attempts: session.attempts,
    sequence: session.sequence,
    finishedAt: session.finishedAt ?? Date.now(),
  };

  return {
    ...base,
    summaryText: generateSummary(base, missionsById),
  };
}
