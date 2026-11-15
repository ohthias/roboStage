/**
 * Scouting FTC (BIOBUZZ): registros por robô, médias por equipe e sugestão
 * de duplas para a seleção de alianças dos playoffs.
 *
 * Tudo aqui é puro (sem React, sem storage) para poder ser testado.
 */
import { POINTS, RANKING_POINTS, allianceCountFor } from "./biobuzz";

export type AllianceColor = "red" | "blue";

/** Um robô em uma partida, do ponto de vista do scout. */
export type ScoutEntry = {
  id: string;
  match: number;
  team: string;
  alliance: AllianceColor;
  autoLeave: boolean;
  autoPark: boolean;
  /** TIPs que o lançamento deste robô provocou no AUTO */
  autoTips: number;
  /** TIPs provocados no TELEOP */
  tips: number;
  /** elementos deste robô que ficaram na CELL voltada para cima no fim */
  cell: number;
  /** elementos colocados em FLOWER (contam 2 se a aliança possuir a FLOWER) */
  flower: number;
  /** garantiu o NECTAR mais baixo em alguma FLOWER */
  bottomNectar: number;
  /** elementos levados ao GARDEN */
  garden: number;
  park: boolean;
  minorFouls: number;
  majorFouls: number;
  /** 0 = não defendeu · 3 = defesa forte */
  defense: number;
  /** 1–5, impressão do scout sobre a pilotagem */
  driver: number;
  /** robô parou, tombou ou ficou sem comunicação */
  broke: boolean;
  noShow: boolean;
  notes: string;
  scout?: string;
  createdAt: number;
};

export type ScoutTeam = {
  number: string;
  name: string;
  /** posição oficial no ranking de qualificação, se a equipe já souber */
  rank?: number;
  /** recusou convite ou não vai jogar os playoffs */
  unavailable?: boolean;
};

export type ScoutEvent = {
  teamNumber: string;
  teamName: string;
  eventName: string;
  eventDate: string;
  scout: string;
};

export type ScoutingData = {
  version: 1;
  event: ScoutEvent;
  teams: ScoutTeam[];
  entries: ScoutEntry[];
};

export const emptyScouting = (): ScoutingData => ({
  version: 1,
  event: { teamNumber: "", teamName: "", eventName: "", eventDate: "", scout: "" },
  teams: [],
  entries: [],
});

export const newEntry = (partial: Partial<ScoutEntry> = {}): ScoutEntry => ({
  id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
  match: 1,
  team: "",
  alliance: "red",
  autoLeave: false,
  autoPark: false,
  autoTips: 0,
  tips: 0,
  cell: 0,
  flower: 0,
  bottomNectar: 0,
  garden: 0,
  park: false,
  minorFouls: 0,
  majorFouls: 0,
  defense: 0,
  driver: 3,
  broke: false,
  noShow: false,
  notes: "",
  createdAt: Date.now(),
  ...partial,
});

/* ------------------------------------------------------- por partida */

export function entryAuto(e: ScoutEntry) {
  return (
    (e.autoLeave ? POINTS.auto.leave : 0) +
    (e.autoPark ? POINTS.auto.park : 0) +
    e.autoTips * POINTS.auto.tip
  );
}

export function entryTips(e: ScoutEntry) {
  return e.tips * POINTS.teleop.tip + e.cell * POINTS.teleop.cell;
}

/** Fechamento: FLOWERS, NECTAR mais baixo, GARDEN e PARK. */
export function entryEndgame(e: ScoutEntry) {
  return (
    e.flower * POINTS.teleop.flower +
    e.bottomNectar * POINTS.teleop.bottomNectar +
    e.garden * POINTS.teleop.garden +
    (e.park ? POINTS.teleop.park : 0)
  );
}

export function entryTeleop(e: ScoutEntry) {
  return entryTips(e) + entryEndgame(e);
}

/** Pontos que o robô gerou para a aliança (estimativa do scout). */
export function entryPoints(e: ScoutEntry) {
  if (e.noShow) return 0;
  return entryAuto(e) + entryTeleop(e);
}

/** Pontos entregues ao adversário em faltas. */
export function entryFoulPoints(e: ScoutEntry) {
  return e.minorFouls * POINTS.foul.minor + e.majorFouls * POINTS.foul.major;
}

/** LEAVE + PARK do robô (metade do caminho para o RP SWARM). */
export function entrySwarm(e: ScoutEntry) {
  return (
    (e.autoLeave ? POINTS.auto.leave : 0) +
    (e.autoPark ? POINTS.auto.park : 0) +
    (e.park ? POINTS.teleop.park : 0)
  );
}

/* --------------------------------------------------------- por equipe */

export type TeamStats = {
  number: string;
  name: string;
  rank?: number;
  unavailable: boolean;
  matches: number;
  avg: number;
  auto: number;
  teleop: number;
  tipsPts: number;
  endgame: number;
  tipsCount: number;
  autoTips: number;
  teleTips: number;
  cell: number;
  flower: number;
  bottomNectar: number;
  garden: number;
  autoParkRate: number;
  swarm: number;
  fouls: number;
  leaveRate: number;
  parkRate: number;
  reliability: number;
  stdev: number;
  best: number;
  driver: number;
  defense: number;
  /** nota final usada para ordenar: média × confiabilidade − faltas */
  rating: number;
  /** perfil: fração dos pontos de TELEOP que vêm de TIPs/CELL (0–1) */
  hiveShare: number;
};

const mean = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);
const stdev = (xs: number[]) => {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
};

export function teamStats(team: ScoutTeam, entries: ScoutEntry[]): TeamStats {
  const mine = entries.filter((e) => e.team === team.number);
  const played = mine.filter((e) => !e.noShow);
  const totals = mine.map(entryPoints);
  const failures = mine.filter((e) => e.broke || e.noShow).length;
  const reliability = mine.length ? 1 - failures / mine.length : 1;
  const avg = mean(totals);
  const fouls = mean(mine.map(entryFoulPoints));
  const tipsPts = mean(played.map(entryTips));
  const endgame = mean(played.map(entryEndgame));

  return {
    number: team.number,
    name: team.name,
    rank: team.rank,
    unavailable: Boolean(team.unavailable),
    matches: mine.length,
    avg,
    auto: mean(played.map(entryAuto)),
    teleop: mean(played.map(entryTeleop)),
    tipsPts,
    endgame,
    tipsCount: mean(played.map((e) => e.autoTips + e.tips)),
    autoTips: mean(played.map((e) => e.autoTips)),
    teleTips: mean(played.map((e) => e.tips)),
    cell: mean(played.map((e) => e.cell)),
    flower: mean(played.map((e) => e.flower)),
    bottomNectar: mean(played.map((e) => e.bottomNectar)),
    garden: mean(played.map((e) => e.garden)),
    autoParkRate: mean(played.map((e) => (e.autoPark ? 1 : 0))),
    swarm: mean(played.map(entrySwarm)),
    fouls,
    leaveRate: mean(played.map((e) => (e.autoLeave ? 1 : 0))),
    parkRate: mean(played.map((e) => (e.park ? 1 : 0))),
    reliability,
    stdev: stdev(totals),
    best: totals.length ? Math.max(...totals) : 0,
    driver: mean(played.map((e) => e.driver)),
    defense: mean(played.map((e) => e.defense)),
    rating: avg * reliability - fouls,
    hiveShare: tipsPts + endgame > 0 ? tipsPts / (tipsPts + endgame) : 0.5,
  };
}

export function allTeamStats(data: Pick<ScoutingData, "teams" | "entries">): TeamStats[] {
  // Equipes que só aparecem nos registros também entram.
  const known = new Map(data.teams.map((t) => [t.number, t]));
  for (const e of data.entries) {
    if (e.team && !known.has(e.team)) known.set(e.team, { number: e.team, name: "" });
  }
  return [...known.values()].map((t) => teamStats(t, data.entries));
}

/** Ordem de qualificação: ranking oficial quando houver, senão a nota do scouting. */
export function qualificationOrder(stats: TeamStats[]): TeamStats[] {
  return [...stats].sort((a, b) => {
    const ra = a.rank ?? Number.POSITIVE_INFINITY;
    const rb = b.rank ?? Number.POSITIVE_INFINITY;
    if (ra !== rb) return ra - rb;
    return b.rating - a.rating || a.number.localeCompare(b.number, undefined, { numeric: true });
  });
}

/* ------------------------------------------------------------ duplas */

export type PairEvaluation = {
  a: TeamStats;
  b: TeamStats;
  /** pontos esperados da aliança nos playoffs */
  expected: number;
  /** cenário ruim: esperado menos a variação das duas equipes */
  floor: number;
  /** soma de TIPs por partida: compara com os RP POLLINATOR */
  tips: number;
  /** LEAVE + PARK das duas: compara com o RP SWARM */
  swarm: number;
  score: number;
  reasons: string[];
};

/**
 * Avalia uma dupla para os playoffs. Nos playoffs só importam os pontos da
 * partida, então a conta é: médias ponderadas pela confiabilidade, menos a
 * disputa pela mesma HIVE e pelas mesmas FLOWERS (duas equipes que fazem a
 * mesma coisa rendem menos que a soma), menos faltas.
 */
export function evaluatePair(a: TeamStats, b: TeamStats): PairEvaluation {
  const base = a.avg * a.reliability + b.avg * b.reliability;
  // As duas lançam na mesma HIVE e disputam as mesmas 4 FLOWERS.
  const hiveOverlap = 0.15 * Math.min(a.tipsPts, b.tipsPts);
  const endOverlap = 0.1 * Math.min(a.endgame, b.endgame);
  const expected = Math.max(0, base - hiveOverlap - endOverlap - a.fouls - b.fouls);
  const spread = Math.sqrt(a.stdev ** 2 + b.stdev ** 2);
  const floor = Math.max(0, expected - spread);
  const tips = a.tipsCount + b.tipsCount;
  const swarm = a.swarm + b.swarm;
  const score = expected - 0.35 * spread;

  const reasons: string[] = [];
  const complement = Math.abs(a.hiveShare - b.hiveShare);
  if (complement >= 0.35) {
    const [hive, end] = a.hiveShare > b.hiveShare ? [a, b] : [b, a];
    reasons.push(`${hive.number} puxa a HIVE e ${end.number} fecha nas FLOWERS`);
  } else if (a.tipsPts > 0 && b.tipsPts > 0 && complement < 0.15) {
    reasons.push("Perfis parecidos: vão disputar a mesma HIVE");
  }
  if (tips >= RANKING_POINTS.pollinator2Tips) reasons.push(`${tips.toFixed(1)} TIPs por partida juntas`);
  if (swarm >= RANKING_POINTS.swarmThreshold) reasons.push("LEAVE + PARK garantem o SWARM");
  if (Math.min(a.reliability, b.reliability) < 0.75) reasons.push("Atenção: histórico de quebras");
  if (a.fouls + b.fouls >= 10) reasons.push(`Entregam ~${Math.round(a.fouls + b.fouls)} pts em faltas`);
  if (spread <= 10 && a.matches >= 3 && b.matches >= 3) reasons.push("Dupla consistente");

  return { a, b, expected, floor, tips, swarm, score, reasons };
}

/** Melhores parceiros para uma equipe, entre as disponíveis. */
export function bestPartners(team: TeamStats, pool: TeamStats[]): PairEvaluation[] {
  return pool
    .filter((t) => t.number !== team.number && !t.unavailable)
    .map((t) => evaluatePair(team, t))
    .sort((x, y) => y.score - x.score);
}

/** Todas as duplas possíveis, da melhor para a pior. */
export function rankPairs(pool: TeamStats[], limit = 10): PairEvaluation[] {
  const list = pool.filter((t) => !t.unavailable);
  const pairs: PairEvaluation[] = [];
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) pairs.push(evaluatePair(list[i], list[j]));
  }
  return pairs.sort((x, y) => y.score - x.score).slice(0, limit);
}

/* ------------------------------------------------ seleção de alianças */

export type SimAlliance = {
  seed: number;
  captain: TeamStats;
  pick?: TeamStats;
  pair?: PairEvaluation;
};

/**
 * Simula a seleção (seção 13.7): o capitão da vez é sempre a equipe mais bem
 * ranqueada ainda livre — se um capitão aceitar convite, os de baixo sobem e
 * a próxima livre vira capitã. Cada capitão convida o melhor parceiro
 * disponível, a não ser que `forcedPicks` diga quem ele escolhe.
 */
export function simulateSelection(
  ranked: TeamStats[],
  opts: { alliances?: number; forcedPicks?: Record<string, string> } = {},
): SimAlliance[] {
  const eligible = ranked.filter((t) => !t.unavailable);
  const count = opts.alliances ?? allianceCountFor(eligible.length);
  const free = [...eligible];
  const result: SimAlliance[] = [];

  for (let seed = 1; seed <= count && free.length > 0; seed++) {
    const captain = free.shift()!;
    let pick: TeamStats | undefined;
    const forced = opts.forcedPicks?.[captain.number];
    if (forced) pick = free.find((t) => t.number === forced);
    if (!pick) pick = bestPartners(captain, free)[0]?.b;
    if (pick) free.splice(free.indexOf(pick), 1);
    result.push({ seed, captain, pick, pair: pick ? evaluatePair(captain, pick) : undefined });
  }
  return result;
}

/** Chance aproximada da aliança A vencer B, pelos pontos esperados e variação. */
export function winChance(a?: PairEvaluation, b?: PairEvaluation) {
  if (!a && !b) return 0.5;
  if (!a) return 0;
  if (!b) return 1;
  const diff = a.expected - b.expected;
  const spread = Math.max(12, Math.sqrt((a.expected - a.floor) ** 2 + (b.expected - b.floor) ** 2));
  // logística ≈ normal acumulada; nunca 0% ou 100%: partida de robô tem imprevisto
  const p = 1 / (1 + Math.exp((-1.7 * diff) / spread));
  return Math.min(0.95, Math.max(0.05, p));
}

/* ------------------------------------------------------- import/export */

export function mergeScouting(base: ScoutingData, incoming: ScoutingData): ScoutingData {
  const ids = new Set(base.entries.map((e) => e.id));
  const teams = new Map(base.teams.map((t) => [t.number, t]));
  for (const t of incoming.teams ?? []) {
    const prev = teams.get(t.number);
    teams.set(t.number, prev ? { ...t, ...prev, name: prev.name || t.name } : t);
  }
  return {
    ...base,
    event: {
      ...incoming.event,
      ...Object.fromEntries(Object.entries(base.event).filter(([, v]) => v)),
    } as ScoutEvent,
    teams: [...teams.values()],
    entries: [...base.entries, ...(incoming.entries ?? []).filter((e) => !ids.has(e.id))],
  };
}

export function parseScouting(raw: unknown): ScoutingData | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Partial<ScoutingData>;
  if (!Array.isArray(d.entries) || !Array.isArray(d.teams)) return null;
  const base = emptyScouting();
  return {
    version: 1,
    event: { ...base.event, ...(d.event ?? {}) },
    teams: d.teams
      .filter((t) => t && typeof t.number === "string" && t.number.trim())
      .map((t) => ({ ...t, number: t.number.trim(), name: String(t.name ?? "") })),
    entries: d.entries
      .filter((e) => e && typeof e.team === "string" && typeof e.id === "string")
      .map((e) => newEntry(e)),
  };
}

const CSV_COLUMNS: (keyof ScoutEntry)[] = [
  "match",
  "team",
  "alliance",
  "autoLeave",
  "autoPark",
  "autoTips",
  "tips",
  "cell",
  "flower",
  "bottomNectar",
  "garden",
  "park",
  "minorFouls",
  "majorFouls",
  "defense",
  "driver",
  "broke",
  "noShow",
  "scout",
  "notes",
];

export function entriesToCsv(entries: ScoutEntry[]) {
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = [...CSV_COLUMNS, "pontos", "faltas_entregues"].join(",");
  const rows = [...entries]
    .sort((a, b) => a.match - b.match || a.team.localeCompare(b.team))
    .map((e) => [...CSV_COLUMNS.map((c) => esc(e[c])), entryPoints(e), entryFoulPoints(e)].join(","));
  return [head, ...rows].join("\n");
}

/** "12345 Nome da equipe" por linha (ou separado por vírgula/;) → equipes. */
export function parseTeamList(text: string): ScoutTeam[] {
  return text
    .split(/[\n;]+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^#?(\d{1,6})\s*[-–:,]?\s*(.*)$/);
      return m ? { number: m[1], name: m[2].trim() } : null;
    })
    .filter((t): t is ScoutTeam => t !== null);
}
