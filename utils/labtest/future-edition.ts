// ---------------------------------------------------------------------------
// FLL Future Edition — modelo de dados e pontuação de uma PARTIDA cronometrada.
//
// A partida é registrada como uma lista de EVENTOS com carimbo de tempo
// ("aos 42,3 s o objetivo X passou a valer 2"). O placar de qualquer instante
// é recalculado reproduzindo os eventos, o que permite:
//   - desfazer o último toque sem perder o histórico;
//   - mostrar a pontuação acumulada ao longo do tempo (ritmo da partida);
//   - analisar quanto cada fase da partida rendeu.
//
// As regras de pontuação são as MESMAS de `hooks/useScoreCalculator.ts`
// (contadores, interruptores, limite por missão e tabela de penalidades).
// ---------------------------------------------------------------------------

export const FE_EDITION = "future-edition";

/** Duração padrão da partida em segundos. É configurável por teste. */
export const FE_DEFAULT_MATCH_SECONDS = 150;

/** Id reservado nos eventos para o contador de penalidades. */
export const FE_PENALTY_EVENT_ID = "__penalties";

export type FEObjectiveValue = number | boolean | string;

export interface FEObjectiveOption {
  id: string;
  label: string;
  points: number;
}

export interface FEObjective {
  id: string;
  label: string;
  type: "counter" | "toggle" | "select";
  min?: number;
  max?: number;
  pointsPerUnit?: number;
  points?: number;
  options?: FEObjectiveOption[];
}

export interface FEMission {
  id: string;
  code: string;
  title: string;
  description?: string;
  image?: string;
  maxScore?: number;
  objectives: FEObjective[];
}

export interface FEPenaltyTier {
  count: number;
  points: number;
  zeroesTotal?: boolean;
}

export interface FEPenalties {
  id: string;
  code: string;
  title: string;
  table: FEPenaltyTier[];
}

export interface FEData {
  season: string;
  edition: string;
  title: string;
  missions: FEMission[];
  penalties: FEPenalties;
}

/** Um toque no pontuador. `t` = segundos desde o início da partida. */
export interface FEEvent {
  t: number;
  id: string;
  value: FEObjectiveValue;
  /** true quando o ajuste foi feito depois do fim do tempo (revisão). */
  review?: boolean;
}

export interface FEScores {
  total: number;
  missionsTotal: number;
  penaltyPoints: number;
  penaltyCount: number;
  zeroed: boolean;
  byMission: Record<string, number>;
  byObjective: Record<string, number>;
}

/** O que é gravado em `test_executions.results.futureEdition`. */
export interface FEExecutionResult {
  version: 1;
  durationSec: number;
  elapsedSec: number;
  finishedBy: "time" | "manual";
  values: Record<string, FEObjectiveValue>;
  penaltyCount: number;
  events: FEEvent[];
  scores: FEScores;
}

// ---------------------------------------------------------------------------
// Detecção
// ---------------------------------------------------------------------------

export function isFutureEditionConfig(config: unknown): boolean {
  return (
    !!config &&
    typeof config === "object" &&
    (config as Record<string, unknown>).edition === FE_EDITION
  );
}

export function getMatchDuration(config: unknown): number {
  const raw =
    config && typeof config === "object"
      ? (config as Record<string, unknown>).matchDuration
      : undefined;
  return typeof raw === "number" && raw >= 10 && raw <= 900
    ? Math.round(raw)
    : FE_DEFAULT_MATCH_SECONDS;
}

// ---------------------------------------------------------------------------
// Pontuação
// ---------------------------------------------------------------------------

export function clampObjectiveValue(
  objective: FEObjective,
  value: FEObjectiveValue,
): FEObjectiveValue {
  if (objective.type === "counter") {
    const n = typeof value === "number" && Number.isFinite(value) ? value : 0;
    const min = objective.min ?? 0;
    const max = objective.max ?? Number.POSITIVE_INFINITY;
    return Math.min(Math.max(Math.round(n), min), max);
  }
  if (objective.type === "toggle") return value === true;
  return typeof value === "string" ? value : "";
}

export function scoreObjective(
  objective: FEObjective,
  raw: FEObjectiveValue | undefined,
): number {
  if (objective.type === "toggle") {
    return raw === true ? (objective.points ?? 0) : 0;
  }
  if (objective.type === "counter") {
    const count = typeof raw === "number" ? raw : (objective.min ?? 0);
    return count * (objective.pointsPerUnit ?? 0);
  }
  return objective.options?.find((option) => option.id === raw)?.points ?? 0;
}

export function resolvePenaltyTier(
  table: FEPenaltyTier[],
  count: number,
): FEPenaltyTier {
  const sorted = [...table].sort((a, b) => a.count - b.count);
  let tier = sorted[0] ?? { count: 0, points: 0 };
  for (const item of sorted) {
    if (count >= item.count) tier = item;
  }
  return tier;
}

export function scoreFutureEdition(
  data: FEData,
  values: Record<string, FEObjectiveValue>,
  penaltyCount: number,
): FEScores & {
  missions: {
    id: string;
    code: string;
    title: string;
    score: number;
    objectives: { id: string; label: string; score: number }[];
  }[];
  penaltyTier: FEPenaltyTier;
} {
  const byObjective: Record<string, number> = {};
  const byMission: Record<string, number> = {};

  const missions = data.missions.map((mission) => {
    const objectives = mission.objectives.map((objective) => {
      const score = scoreObjective(objective, values[objective.id]);
      byObjective[objective.id] = score;
      return { id: objective.id, label: objective.label, score };
    });

    let score = objectives.reduce((sum, item) => sum + item.score, 0);
    if (mission.maxScore !== undefined) score = Math.min(score, mission.maxScore);
    byMission[mission.id] = score;

    return { id: mission.id, code: mission.code, title: mission.title, score, objectives };
  });

  const missionsTotal = missions.reduce((sum, mission) => sum + mission.score, 0);
  const penaltyTier = resolvePenaltyTier(data.penalties.table, penaltyCount);
  const zeroed = Boolean(penaltyTier.zeroesTotal);
  const total = zeroed ? 0 : missionsTotal + penaltyTier.points;

  return {
    total,
    missionsTotal,
    penaltyPoints: penaltyTier.points,
    penaltyCount,
    zeroed,
    byMission,
    byObjective,
    missions,
    penaltyTier,
  };
}

// ---------------------------------------------------------------------------
// Eventos
// ---------------------------------------------------------------------------

/** Reproduz os eventos (até `untilSec`, se informado) e devolve o estado. */
export function replayEvents(
  data: FEData,
  events: FEEvent[],
  untilSec?: number,
): { values: Record<string, FEObjectiveValue>; penaltyCount: number } {
  const objectives = new Map<string, FEObjective>();
  data.missions.forEach((mission) =>
    mission.objectives.forEach((objective) => objectives.set(objective.id, objective)),
  );

  const values: Record<string, FEObjectiveValue> = {};
  let penaltyCount = 0;

  for (const event of events) {
    if (untilSec !== undefined && event.t > untilSec) continue;

    if (event.id === FE_PENALTY_EVENT_ID) {
      penaltyCount = Math.max(0, Math.round(Number(event.value) || 0));
      continue;
    }

    const objective = objectives.get(event.id);
    if (!objective) continue;
    values[event.id] = clampObjectiveValue(objective, event.value);
  }

  return { values, penaltyCount };
}

export function scoreAt(data: FEData, events: FEEvent[], untilSec?: number) {
  const { values, penaltyCount } = replayEvents(data, events, untilSec);
  return scoreFutureEdition(data, values, penaltyCount);
}

export interface FETimelinePoint {
  t: number;
  total: number;
}

/**
 * Placar acumulado a cada `stepSec` segundos (0, 10, 20 … duração).
 * Eventos de revisão (feitos após o fim) entram no último ponto.
 */
export function buildTimeline(
  data: FEData,
  events: FEEvent[],
  durationSec: number,
  stepSec = 10,
): FETimelinePoint[] {
  const points: FETimelinePoint[] = [];
  for (let t = 0; t < durationSec; t += stepSec) {
    points.push({ t, total: scoreAt(data, events, t).total });
  }
  // Ponto final: inclui também os ajustes de revisão feitos depois do apito.
  points.push({
    t: durationSec,
    total: scoreAt(data, events, Number.POSITIVE_INFINITY).total,
  });
  return points;
}

export function buildFEResult(
  data: FEData,
  events: FEEvent[],
  durationSec: number,
  elapsedSec: number,
  finishedBy: "time" | "manual",
): FEExecutionResult {
  const { values, penaltyCount } = replayEvents(data, events);
  const scored = scoreFutureEdition(data, values, penaltyCount);

  return {
    version: 1,
    durationSec,
    elapsedSec: Math.round(elapsedSec * 10) / 10,
    finishedBy,
    values,
    penaltyCount,
    events: events.map((event) => ({
      ...event,
      t: Math.round(event.t * 10) / 10,
    })),
    scores: {
      total: scored.total,
      missionsTotal: scored.missionsTotal,
      penaltyPoints: scored.penaltyPoints,
      penaltyCount: scored.penaltyCount,
      zeroed: scored.zeroed,
      byMission: scored.byMission,
      byObjective: scored.byObjective,
    },
  };
}

/** Leitura defensiva de `results.futureEdition` vindo do banco. */
export function normalizeFEResult(raw: unknown): FEExecutionResult | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const source = raw as Record<string, unknown>;
  const scores = source.scores as Record<string, unknown> | undefined;

  if (!scores || typeof scores.total !== "number" || !Array.isArray(source.events)) {
    return undefined;
  }

  const num = (value: unknown, fallback = 0) =>
    typeof value === "number" && Number.isFinite(value) ? value : fallback;
  const record = (value: unknown): Record<string, number> =>
    value && typeof value === "object" && !Array.isArray(value)
      ? Object.fromEntries(
          Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, num(v)]),
        )
      : {};

  return {
    version: 1,
    durationSec: num(source.durationSec, FE_DEFAULT_MATCH_SECONDS),
    elapsedSec: num(source.elapsedSec, num(source.durationSec, FE_DEFAULT_MATCH_SECONDS)),
    finishedBy: source.finishedBy === "manual" ? "manual" : "time",
    values:
      source.values && typeof source.values === "object"
        ? (source.values as Record<string, FEObjectiveValue>)
        : {},
    penaltyCount: num(source.penaltyCount),
    events: (source.events as unknown[]).flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const event = item as Record<string, unknown>;
      if (typeof event.id !== "string") return [];
      const value = event.value;
      if (
        typeof value !== "number" &&
        typeof value !== "boolean" &&
        typeof value !== "string"
      ) {
        return [];
      }
      return [
        {
          t: num(event.t),
          id: event.id,
          value,
          ...(event.review ? { review: true } : {}),
        } as FEEvent,
      ];
    }),
    scores: {
      total: num(scores.total),
      missionsTotal: num(scores.missionsTotal),
      penaltyPoints: num(scores.penaltyPoints),
      penaltyCount: num(scores.penaltyCount, num(source.penaltyCount)),
      zeroed: scores.zeroed === true,
      byMission: record(scores.byMission),
      byObjective: record(scores.byObjective),
    },
  };
}

/** Pontuação máxima possível de uma missão (null se algum contador não tem teto). */
export function maxMissionScore(mission: FEMission): number | null {
  let total = 0;
  for (const objective of mission.objectives) {
    if (objective.type === "toggle") total += objective.points ?? 0;
    else if (objective.type === "counter") {
      if (objective.max === undefined) return mission.maxScore ?? null;
      total += objective.max * (objective.pointsPerUnit ?? 0);
    } else {
      total += Math.max(0, ...(objective.options ?? []).map((o) => o.points));
    }
  }
  return mission.maxScore !== undefined ? Math.min(total, mission.maxScore) : total;
}

export function formatClock(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = String(Math.floor(safe / 60)).padStart(2, "0");
  const s = String(safe % 60).padStart(2, "0");
  return `${m}:${s}`;
}
