// ---------------------------------------------------------------------------
// Análise por missão dos testes "runs" da FLL (puro, sem React).
//
// Cada execução guarda `fllAnswers[missionId]` só para as missões que faziam
// parte daquela execução (as escolhidas no teste). Uma missão presente com 0
// pontos = tentada e não pontuou; ausente = não fazia parte da execução.
// ---------------------------------------------------------------------------

import type { TestEntry } from "@/types/labtest.types";
import {
  getSubMissionKey,
  scoreFllExecution,
  scoreFllMission,
  scoreFllSubMission,
  type FllAnswer,
  type FllMissionDefinition,
  type FllSubMissionDefinition,
} from "./fll";

/** Missões que nunca entram no placar do robô. */
const NOT_ROBOT = new Set(["GP"]);
const MAX_COMBOS = 20_000;

function optionIndexes(type: FllMissionDefinition["type"]): number[] {
  if (!type) return [0];
  if (type[0] === "range") {
    // Índices 0..máx (a resposta guardada é o índice, que no range é a quantidade).
    const max = Number(type[2]);
    if (!Number.isFinite(max) || max < 0) return [0];
    return Array.from({ length: Math.floor(max) + 1 }, (_, i) => i);
  }
  const n = Math.max(2, type.slice(1).filter((v) => v !== null).length);
  return Array.from({ length: n }, (_, i) => i);
}

/**
 * Pontuação máxima possível de uma missão (principal + sub-missões), usando o
 * mesmo motor do placar — respeita `requires`, opções exclusivas e portões.
 */
export function missionMaxPoints(mission: FllMissionDefinition): number {
  if (!mission.type || mission.points == null) return 0;
  const subs = mission["sub-mission"] ?? [];
  const choices = [optionIndexes(mission.type), ...subs.map((s) => optionIndexes(s.type))];
  const combos = choices.reduce((acc, c) => acc * c.length, 1);

  if (combos > MAX_COMBOS) {
    // Fallback (missões enormes): melhor opção de cada parte isoladamente.
    const answer: FllAnswer = { value: choices[0].at(-1) ?? 0, subAnswers: {} };
    subs.forEach((s, i) => (answer.subAnswers[getSubMissionKey(mission, s, i)] = choices[i + 1].at(-1) ?? 0));
    return scoreFllMission(mission, answer);
  }

  let best = 0;
  const idx = new Array<number>(choices.length).fill(0);
  for (let n = 0; n < combos; n++) {
    let rest = n;
    for (let k = choices.length - 1; k >= 0; k--) {
      idx[k] = choices[k][rest % choices[k].length];
      rest = Math.floor(rest / choices[k].length);
    }
    const answer: FllAnswer = { value: idx[0], subAnswers: {} };
    subs.forEach((s, i) => (answer.subAnswers[getSubMissionKey(mission, s, i)] = idx[i + 1]));
    const total = scoreFllMission(mission, answer);
    if (total > best) best = total;
  }
  return best;
}

/** Máximo de uma sub-missão isolada (melhor opção dela). */
export function subMissionMaxPoints(mission: FllMissionDefinition, sub: FllSubMissionDefinition, index: number) {
  let best = 0;
  const main = optionIndexes(mission.type);
  for (const m of main) {
    for (const o of optionIndexes(sub.type)) {
      const answer: FllAnswer = { value: m, subAnswers: {} };
      // As outras sub-missões no máximo (portões e requires costumam depender delas).
      (mission["sub-mission"] ?? []).forEach((s, i) => {
        answer.subAnswers[getSubMissionKey(mission, s, i)] = i === index ? o : (optionIndexes(s.type).at(-1) ?? 0);
      });
      best = Math.max(best, scoreFllSubMission(mission, answer, index));
    }
  }
  return best;
}

/**
 * Missões do teste, na ordem do teste: as escolhidas na criação (config) e as
 * que aparecem nas execuções (testes antigos), sem GP.
 */
export function missionsForTest(
  seasonMissions: FllMissionDefinition[],
  configMissionIds: unknown,
  entries: TestEntry[],
): FllMissionDefinition[] {
  const order: string[] = [];
  const add = (id: unknown) => {
    if (typeof id === "string" && !order.includes(id) && !NOT_ROBOT.has(id)) order.push(id);
  };
  if (Array.isArray(configMissionIds)) configMissionIds.forEach(add);
  for (const e of entries) Object.keys(e.fllAnswers ?? {}).forEach(add);
  const byId = new Map(seasonMissions.map((m) => [m.id, m]));
  const listed = order.map((id) => byId.get(id)).filter((m): m is FllMissionDefinition => !!m);
  // Sem nada escolhido nem respondido ainda: a temporada toda.
  return listed.length ? listed : seasonMissions.filter((m) => !NOT_ROBOT.has(m.id));
}

/** Placar da execução: Round 2:30 já traz o total completo (inspeção, discos). */
export function fllEntryScore(missions: FllMissionDefinition[], entry: TestEntry): number | null {
  if (typeof entry.roundTotal === "number") return entry.roundTotal;
  if (!entry.fllAnswers || !Object.keys(entry.fllAnswers).length) return null;
  return scoreFllExecution(missions, entry.fllAnswers);
}

export function fllMissionPoints(mission: FllMissionDefinition, entry: TestEntry): number | null {
  const answer = entry.fllAnswers?.[mission.id];
  return answer ? scoreFllMission(mission, answer) : null;
}

export interface FllSubStat {
  key: string;
  label: string;
  max: number;
  avg: number;
  scoredRate: number;
}

export interface FllMissionStat {
  id: string;
  name: string;
  max: number;
  /** Execuções em que a missão fazia parte. */
  attempts: number;
  /** Execuções em que pontuou algo. */
  scored: number;
  /** Execuções em que fez o máximo. */
  full: number;
  avg: number;
  best: number;
  last: number | null;
  std: number;
  /** Média de pontos ÷ máximo (0–1). */
  efficiency: number | null;
  /** Fatia do placar total que veio desta missão (0–1). */
  share: number;
  /** Pontos que ficaram na mesa em média (máx − média). */
  lost: number;
  /** Segundo médio da 1ª marcação (Round 2:30). */
  avgFirstMark: number | null;
  /** Execuções marcadas depois do fim do tempo. */
  afterTime: number;
  subs: FllSubStat[];
}

export function fllMissionStats(missions: FllMissionDefinition[], entries: TestEntry[]): FllMissionStat[] {
  const ordered = [...entries].sort((a, b) => a.executionNumber - b.executionNumber);
  const totalPoints = ordered.reduce((sum, e) => sum + missions.reduce((s, m) => s + (fllMissionPoints(m, e) ?? 0), 0), 0);

  return missions.map((mission) => {
    const max = missionMaxPoints(mission);
    const pts: number[] = [];
    const marks: number[] = [];
    let afterTime = 0;
    for (const e of ordered) {
      const answer = e.fllAnswers?.[mission.id];
      if (!answer) continue;
      pts.push(scoreFllMission(mission, answer));
      if (typeof answer.firstMarkSeconds === "number") marks.push(answer.firstMarkSeconds);
      if (answer.markedAfterTime) afterTime++;
    }
    const n = pts.length;
    const sum = pts.reduce((a, b) => a + b, 0);
    const avg = n ? sum / n : 0;
    const std = n ? Math.sqrt(pts.reduce((a, v) => a + (v - avg) ** 2, 0) / n) : 0;

    const subs = (mission["sub-mission"] ?? []).map((sub, i) => {
      const key = getSubMissionKey(mission, sub, i);
      const subPts = ordered
        .filter((e) => e.fllAnswers?.[mission.id])
        .map((e) => scoreFllSubMission(mission, e.fllAnswers![mission.id], i));
      return {
        key,
        label: sub.submission ?? sub.name ?? `Submissão ${i + 1}`,
        max: subMissionMaxPoints(mission, sub, i),
        avg: subPts.length ? subPts.reduce((a, b) => a + b, 0) / subPts.length : 0,
        scoredRate: subPts.length ? subPts.filter((p) => p > 0).length / subPts.length : 0,
      };
    });

    return {
      id: mission.id,
      name: mission.name,
      max,
      attempts: n,
      scored: pts.filter((p) => p > 0).length,
      full: max > 0 ? pts.filter((p) => p >= max).length : 0,
      avg,
      best: n ? Math.max(...pts) : 0,
      last: n ? pts[n - 1] : null,
      std,
      efficiency: n && max > 0 ? avg / max : null,
      share: totalPoints > 0 ? sum / totalPoints : 0,
      lost: n ? Math.max(0, max - avg) : 0,
      avgFirstMark: marks.length ? marks.reduce((a, b) => a + b, 0) / marks.length : null,
      afterTime,
      subs,
    };
  });
}

/** Missão × execução: pontos e % do máximo (mapa de calor). */
export function fllMissionGrid(missions: FllMissionDefinition[], entries: TestEntry[]) {
  const ordered = [...entries].sort((a, b) => a.executionNumber - b.executionNumber);
  return {
    executions: ordered.map((e) => ({ id: e.id, n: e.executionNumber, total: fllEntryScore(missions, e) })),
    rows: missions.map((m) => {
      const max = missionMaxPoints(m);
      return {
        id: m.id,
        name: m.name,
        max,
        cells: ordered.map((e) => {
          const p = fllMissionPoints(m, e);
          return { points: p, ratio: p === null || max <= 0 ? null : Math.min(1, p / max) };
        }),
      };
    }),
  };
}
