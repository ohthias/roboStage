// ---------------------------------------------------------------------------
// OBR Resgate — rodada registrada no LabTest.
//
// A pontuação é a MESMA do Pontuador (`utils/competitions/obr/scoring.ts`):
// `breakdown()` calcula o placar a partir de um `Round`. Aqui o LabTest guarda,
// além do `Round`, o que o Pontuador não guarda e que serve para treinar:
//   - tentativas de cada perigo (ex.: gangorra 2 de 3) → taxa de sucesso;
//   - onde cada falha aconteceu (ladrilho da arena ou checkpoint) → mapa de calor;
//   - linha do tempo da sala de resgate (entrada, cada depósito, capturas).
//
// As vítimas do `Round` (vivas, mortas, invertidas) são DERIVADAS dos depósitos
// registrados, e as falhas do `Round` são derivadas da lista de falhas. Assim
// não há dois lugares dizendo coisas diferentes.
// ---------------------------------------------------------------------------

import {
  HAZARD_DEFS,
  MAX_MORTAS,
  MAX_VIVAS,
  ROUND_MAX_SECONDS,
  breakdown,
  type Breakdown,
} from "@/utils/competitions/obr/scoring";
import type { Hazards, Round } from "@/utils/competitions/obr/types";
import { sanitizeProject } from "@/utils/quickbrick/ArenaBuilder/project";
import type { Project } from "@/utils/quickbrick/ArenaBuilder/types";

export const OBR_EDITION = "obr-resgate";

export type HazardKey = keyof Hazards;
export const HAZARD_KEYS = HAZARD_DEFS.map((d) => d.key);

/** Nome curto dos perigos, para gráficos. */
export const HAZARD_SHORT: Record<HazardKey, string> = {
  intersecoes: "Interseção",
  gangorras: "Gangorra",
  obstaculos: "Obstáculo",
  gaps: "Gap",
  rampas: "Rampa",
  lombadas: "Lombada",
  passagens: "Passagem",
};

export type HazardAttempts = Record<HazardKey, number>;

/** Ladrilho de um tablado do Criador de Arenas (tablado 1–3, célula 0–8). */
export interface TileRef {
  board: number;
  cell: number;
}

export type FailureKind = "falha" | "desistencia";

export interface ObrFailure {
  /** segundos corridos no round */
  t: number;
  kind: FailureKind;
  /** onde aconteceu, se a rodada está ligada a uma arena */
  tile: TileRef | null;
  /** checkpoint em que o robô estava (1, 2, 3…), se informado */
  checkpoint: number | null;
}

export type VictimKind = "viva" | "morta";
export type DepositArea = "correta" | "invertida";

export interface ObrDeposit {
  t: number;
  kind: VictimKind;
  area: DepositArea;
}

export interface ObrRescueLog {
  /** segundos corridos quando o robô entrou na sala de resgate */
  entrySec: number | null;
  /** quantas vezes o robô tentou pegar uma vítima */
  captureAttempts: number;
  deposits: ObrDeposit[];
}

export interface ObrScores {
  total: number;
  base: number;
  hazards: number;
  checkpoints: number;
  start: number;
  chegada: number;
  multiplier: number;
  /** tempo considerado para desempate */
  tempo: number;
}

/** O que é gravado em `test_executions.results.obrRound`. */
export interface ObrRoundResult {
  version: 1;
  round: Round;
  attempts: HazardAttempts;
  failures: ObrFailure[];
  rescue: ObrRescueLog;
  /** segundos corridos no round (sem penalidades de desistência) */
  elapsedSec: number;
  scores: ObrScores;
}

// ---------------------------------------------------------------------------
// Detecção e configuração
// ---------------------------------------------------------------------------

export function isObrConfig(config: unknown): boolean {
  return (
    !!config &&
    typeof config === "object" &&
    (config as Record<string, unknown>).edition === OBR_EDITION
  );
}

/** Arena ligada ao teste (cópia do Criador de Arenas), ou null. */
export function getObrArena(config: unknown): Project | null {
  if (!config || typeof config !== "object") return null;
  return sanitizeProject((config as Record<string, unknown>).arena);
}

/** O ladrilho existe na arena e não está vazio? */
export function tileInArena(arena: Project | null, tile: TileRef): boolean {
  if (!arena) return false;
  const board = arena.boards.find((b) => b.id === tile.board);
  return !!board && tile.cell >= 0 && tile.cell < 9 && board.tiles[tile.cell]?.shape !== "empty";
}

export const tileKey = (t: TileRef) => `${t.board}:${t.cell}`;

// ---------------------------------------------------------------------------
// Montagem do resultado
// ---------------------------------------------------------------------------

export function emptyAttempts(): HazardAttempts {
  return Object.fromEntries(HAZARD_KEYS.map((k) => [k, 0])) as HazardAttempts;
}

/** Vítimas do placar a partir dos depósitos (respeitando os limites da regra). */
export function victimsFromDeposits(deposits: ObrDeposit[]) {
  const correct = (kind: VictimKind) =>
    deposits.filter((d) => d.kind === kind && d.area === "correta").length;
  return {
    vivasVerde: Math.min(MAX_VIVAS, correct("viva")),
    mortasVermelha: Math.min(MAX_MORTAS, correct("morta")),
    invertidas: Math.min(3, deposits.filter((d) => d.area === "invertida").length),
  };
}

/** Round final: aplica falhas e vítimas derivadas sobre o round editado. */
export function finalizeRound(
  round: Round,
  failures: ObrFailure[],
  deposits: ObrDeposit[],
): Round {
  return {
    ...round,
    falhas: failures.filter((f) => f.kind === "falha").length,
    ...victimsFromDeposits(deposits),
  };
}

export function toScores(b: Breakdown): ObrScores {
  return {
    total: b.total,
    base: b.base,
    hazards: b.hazards,
    checkpoints: b.checkpoints,
    start: b.start,
    chegada: b.chegada,
    multiplier: b.multiplier,
    tempo: b.tempo,
  };
}

export function buildObrResult(input: {
  round: Round;
  attempts: HazardAttempts;
  failures: ObrFailure[];
  rescue: ObrRescueLog;
  elapsedSec: number;
}): ObrRoundResult {
  const round = finalizeRound(input.round, input.failures, input.rescue.deposits);
  return {
    version: 1,
    round,
    attempts: input.attempts,
    failures: input.failures,
    rescue: input.rescue,
    elapsedSec: Math.max(0, Math.min(ROUND_MAX_SECONDS, Math.round(input.elapsedSec))),
    scores: toScores(breakdown(round)),
  };
}

// ---------------------------------------------------------------------------
// Leitura defensiva (banco → tela) e validação (cliente → banco)
// ---------------------------------------------------------------------------

const int = (v: unknown, min = 0, max = 999) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.min(max, Math.max(min, Math.round(v)))
    : min;
const sec = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.min(ROUND_MAX_SECONDS, Math.max(0, Math.round(v * 10) / 10))
    : 0;

function readTile(raw: unknown): TileRef | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const board = int(r.board, 1, 3);
  const cell = int(r.cell, 0, 8);
  return typeof r.board === "number" && typeof r.cell === "number" ? { board, cell } : null;
}

function readRound(raw: unknown): Round | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const hz = (r.hazards ?? {}) as Record<string, unknown>;
  return {
    hazards: Object.fromEntries(HAZARD_KEYS.map((k) => [k, int(hz[k])])) as unknown as Hazards,
    startTile: r.startTile === true,
    checkpoints: Array.isArray(r.checkpoints)
      ? r.checkpoints.slice(0, 30).map((c) => {
          const cp = (c ?? {}) as Record<string, unknown>;
          return { tiles: int(cp.tiles, 0, 60), attempt: int(cp.attempt, 1, 4) };
        })
      : [],
    falhas: int(r.falhas),
    chegada: r.chegada === true,
    vivasVerde: int(r.vivasVerde, 0, MAX_VIVAS),
    mortasVermelha: int(r.mortasVermelha, 0, MAX_MORTAS),
    invertidas: int(r.invertidas, 0, 3),
    surpresa: r.surpresa === true,
    tempo: int(r.tempo, 0, ROUND_MAX_SECONDS),
    desistiu: r.desistiu === true,
  };
}

export function normalizeObrResult(raw: unknown): ObrRoundResult | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  const round = readRound(r.round);
  if (!round) return undefined;

  const att = (r.attempts ?? {}) as Record<string, unknown>;
  const attempts = Object.fromEntries(
    HAZARD_KEYS.map((k) => [k, Math.max(int(att[k]), round.hazards[k])]),
  ) as HazardAttempts;

  const failures: ObrFailure[] = Array.isArray(r.failures)
    ? r.failures.slice(0, 200).map((f) => {
        const x = (f ?? {}) as Record<string, unknown>;
        return {
          t: sec(x.t),
          kind: x.kind === "desistencia" ? "desistencia" : "falha",
          tile: readTile(x.tile),
          checkpoint: typeof x.checkpoint === "number" ? int(x.checkpoint, 1, 30) : null,
        };
      })
    : [];

  const res = (r.rescue ?? {}) as Record<string, unknown>;
  const deposits: ObrDeposit[] = Array.isArray(res.deposits)
    ? res.deposits.slice(0, 10).map((d) => {
        const x = (d ?? {}) as Record<string, unknown>;
        return {
          t: sec(x.t),
          kind: x.kind === "morta" ? "morta" : "viva",
          area: x.area === "invertida" ? "invertida" : "correta",
        };
      })
    : [];

  const rescue: ObrRescueLog = {
    entrySec: typeof res.entrySec === "number" ? sec(res.entrySec) : null,
    captureAttempts: Math.max(int(res.captureAttempts, 0, 99), deposits.length),
    deposits,
  };

  const b = breakdown(round);
  return {
    version: 1,
    round,
    attempts,
    failures,
    rescue,
    elapsedSec: int(r.elapsedSec, 0, ROUND_MAX_SECONDS),
    scores: toScores(b),
  };
}

/**
 * Validação no servidor: o pacote tem de ser coerente e o total enviado tem
 * de bater com o recálculo (o cliente não é a fonte da verdade do placar).
 */
export function validateObrResult(raw: unknown, arena: Project | null): ObrRoundResult {
  const fe = normalizeObrResult(raw);
  if (!fe) throw new Error("Rodada inválida: resultado da OBR ausente.");
  const sent = raw as { scores?: { total?: unknown }; round?: { falhas?: unknown } };

  if (sent.scores?.total !== fe.scores.total) {
    throw new Error("A pontuação enviada não confere com a rodada.");
  }
  const falhas = fe.failures.filter((f) => f.kind === "falha").length;
  if (fe.round.falhas !== falhas) {
    throw new Error("O número de falhas não confere com as falhas registradas.");
  }
  const v = victimsFromDeposits(fe.rescue.deposits);
  if (
    fe.round.vivasVerde !== v.vivasVerde ||
    fe.round.mortasVermelha !== v.mortasVermelha ||
    fe.round.invertidas !== v.invertidas
  ) {
    throw new Error("As vítimas do placar não conferem com os depósitos registrados.");
  }
  for (const f of fe.failures) {
    if (f.tile && !tileInArena(arena, f.tile)) {
      throw new Error("Uma falha aponta para um ladrilho que não existe na arena.");
    }
  }
  return fe;
}

// ---------------------------------------------------------------------------
// Análise entre rodadas
// ---------------------------------------------------------------------------

export interface HazardRate {
  key: HazardKey;
  label: string;
  success: number;
  attempts: number;
  /** 0–100, ou null sem tentativas */
  rate: number | null;
}

export function hazardRates(rounds: ObrRoundResult[]): HazardRate[] {
  return HAZARD_KEYS.map((key) => {
    const success = rounds.reduce((s, r) => s + r.round.hazards[key], 0);
    const attempts = rounds.reduce((s, r) => s + Math.max(r.attempts[key], r.round.hazards[key]), 0);
    return {
      key,
      label: HAZARD_SHORT[key],
      success,
      attempts,
      rate: attempts > 0 ? Math.round((success / attempts) * 1000) / 10 : null,
    };
  });
}

/** Contagem de falhas por ladrilho e por checkpoint. */
export function failureHeat(rounds: ObrRoundResult[]) {
  const tiles = new Map<string, number>();
  const checkpoints = new Map<number, number>();
  let unplaced = 0;
  for (const r of rounds) {
    for (const f of r.failures) {
      if (f.tile) tiles.set(tileKey(f.tile), (tiles.get(tileKey(f.tile)) ?? 0) + 1);
      if (f.checkpoint) checkpoints.set(f.checkpoint, (checkpoints.get(f.checkpoint) ?? 0) + 1);
      if (!f.tile && !f.checkpoint) unplaced += 1;
    }
  }
  return { tiles, checkpoints, unplaced };
}

/** Tempos da sala de resgate de uma rodada. */
export function rescueTimes(r: ObrRoundResult) {
  const entry = r.rescue.entrySec;
  const sorted = [...r.rescue.deposits].sort((a, b) => a.t - b.t);
  const perVictim: number[] = [];
  let prev = entry;
  for (const d of sorted) {
    if (prev !== null) perVictim.push(Math.max(0, Math.round((d.t - prev) * 10) / 10));
    prev = d.t;
  }
  const timeInRoom =
    entry === null ? null : Math.max(0, Math.round((r.elapsedSec - entry) * 10) / 10);
  return { entry, perVictim, timeInRoom };
}

/** Quanto a pontuação teria sem o multiplicador (mostra o peso do resgate). */
export function multiplierGain(r: ObrRoundResult) {
  return r.scores.total - r.scores.base;
}

export function formatSec(seconds: number | null | undefined) {
  if (seconds === null || seconds === undefined) return "—";
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * Quanto cada depósito somou no placar (placar com ele − placar sem ele) e
 * quanto tempo levou (desde a entrada na sala ou o depósito anterior).
 * Responde "compensa buscar a vítima morta ou garantir as vivas?".
 */
export function depositContributions(r: ObrRoundResult) {
  const sorted = [...r.rescue.deposits].sort((a, b) => a.t - b.t);
  return sorted.map((d, i) => {
    const without = sorted.filter((_, j) => j !== i);
    const round = { ...r.round, ...victimsFromDeposits(without) };
    const gain = r.scores.total - breakdown(round).total;
    const prev = i === 0 ? r.rescue.entrySec : sorted[i - 1].t;
    return {
      kind: d.kind,
      area: d.area,
      gain,
      seconds: prev === null ? null : Math.max(0, d.t - prev),
    };
  });
}
