/**
 * Pontuador de treino da FTC (BIOBUZZ). Contas puras sobre a tabela 10-2 de
 * biobuzz.ts, mais faltas, resultado da partida e histórico de tentativas.
 */
import {
  FIELD_COUNTS,
  POINTS,
  RANKING_POINTS,
  scoreAlliance,
  type AllianceInput,
  type AllianceScore,
} from "./biobuzz";

export type AllianceSheet = {
  /** LEAVE de cada robô */
  leave: [boolean, boolean];
  /** PARK no fim do AUTO, por robô */
  autoPark: [boolean, boolean];
  autoTips: number;
  tips: number;
  cell: number;
  flowersOwned: number;
  flowerElements: number;
  bottomNectar: number;
  garden: number;
  /** PARK no fim da partida, por robô */
  park: [boolean, boolean];
  /** faltas COMETIDAS por esta aliança (viram pontos para a outra) */
  minorFouls: number;
  majorFouls: number;
};

export const emptySheet = (): AllianceSheet => ({
  leave: [false, false],
  autoPark: [false, false],
  autoTips: 0,
  tips: 0,
  cell: 0,
  flowersOwned: 0,
  flowerElements: 0,
  bottomNectar: 0,
  garden: 0,
  park: [false, false],
  minorFouls: 0,
  majorFouls: 0,
});

const count = (pair: [boolean, boolean]) => Number(pair[0]) + Number(pair[1]);

export function sheetToInput(s: AllianceSheet): AllianceInput {
  return {
    auto: { leave: count(s.leave), park: count(s.autoPark), tips: s.autoTips },
    teleop: {
      tips: s.tips,
      cell: s.cell,
      flowersOwned: s.flowersOwned,
      flowerElements: s.flowerElements,
      bottomNectar: s.bottomNectar,
      garden: s.garden,
      park: count(s.park),
    },
  };
}

export const foulPoints = (s: AllianceSheet) => s.minorFouls * POINTS.foul.minor + s.majorFouls * POINTS.foul.major;

export type SideResult = AllianceScore & {
  /** pontos de faltas cometidas pelo adversário */
  foulsReceived: number;
  /** placar final: pontos próprios + faltas do adversário */
  final: number;
  /** RP total na qualificação (resultado + bônus) */
  rpTotal: number;
};

export type MatchResult = { red: SideResult; blue: SideResult; winner: "red" | "blue" | "tie" };

export function scoreMatch(red: AllianceSheet, blue: AllianceSheet): MatchResult {
  const r = scoreAlliance(sheetToInput(red));
  const b = scoreAlliance(sheetToInput(blue));
  const rFinal = r.total + foulPoints(blue);
  const bFinal = b.total + foulPoints(red);
  const winner = rFinal > bFinal ? "red" : bFinal > rFinal ? "blue" : "tie";
  const result = (s: AllianceScore, received: number, final: number, won: boolean): SideResult => ({
    ...s,
    foulsReceived: received,
    final,
    rpTotal: s.rp.bonus + (winner === "tie" ? RANKING_POINTS.tie : won ? RANKING_POINTS.win : 0),
  });
  return {
    red: result(r, foulPoints(blue), rFinal, winner === "red"),
    blue: result(b, foulPoints(red), bFinal, winner === "blue"),
    winner,
  };
}

/** Avisos de preenchimento que normalmente indicam erro de contagem. */
export function sheetWarnings(s: AllianceSheet): string[] {
  const out: string[] = [];
  if (s.flowerElements > 0 && s.flowersOwned === 0) out.push("Há elementos em FLOWERS, mas nenhuma FLOWER marcada como sua: eles não pontuam.");
  if (s.flowersOwned > 0 && s.flowerElements === 0) out.push("FLOWER possuída sem elementos dentro? Lembre que o NECTAR que dá a posse também conta.");
  if (s.flowersOwned > 0 && s.flowerElements < s.flowersOwned) out.push("Cada FLOWER possuída tem ao menos 1 NECTAR seu dentro.");
  if (s.flowersOwned + s.bottomNectar > FIELD_COUNTS.nectarPerAlliance) out.push(`A aliança só tem ${FIELD_COUNTS.nectarPerAlliance} NECTAR.`);
  if (s.cell + s.flowerElements + s.garden > FIELD_COUNTS.pollen + FIELD_COUNTS.nectarPerAlliance * 2) out.push("Mais elementos marcados do que existem em campo.");
  for (const i of [0, 1] as const) if (s.autoPark[i] && !s.leave[i]) out.push(`Robô ${i + 1}: PARK no AUTO sem LEAVE — confira se ele saiu da parede.`);
  return out;
}

/* ------------------------------------------------------ histórico */

export type TrainingRun = {
  id: string;
  at: number;
  label: string;
  notes: string;
  sheet: AllianceSheet;
  total: number;
  auto: number;
  teleop: number;
  tips: number;
  rpBonus: number;
};

export function makeRun(sheet: AllianceSheet, label: string, notes = ""): TrainingRun {
  const s = scoreAlliance(sheetToInput(sheet));
  return {
    id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
    at: Date.now(),
    label,
    notes,
    sheet,
    total: s.total,
    auto: s.auto,
    teleop: s.teleop,
    tips: s.tips,
    rpBonus: s.rp.bonus,
  };
}

export function runSummary(runs: TrainingRun[]) {
  if (!runs.length) return null;
  const avg = (f: (r: TrainingRun) => number) => runs.reduce((s, r) => s + f(r), 0) / runs.length;
  const last5 = runs.slice(0, 5);
  const prev5 = runs.slice(5, 10);
  const mean = (xs: TrainingRun[]) => (xs.length ? xs.reduce((s, r) => s + r.total, 0) / xs.length : 0);
  return {
    count: runs.length,
    avg: avg((r) => r.total),
    best: Math.max(...runs.map((r) => r.total)),
    auto: avg((r) => r.auto),
    tips: avg((r) => r.tips),
    rpBonus: avg((r) => r.rpBonus),
    /** média das 5 últimas menos a das 5 anteriores (tendência) */
    trend: prev5.length ? mean(last5) - mean(prev5) : null,
  };
}

export function runsToCsv(runs: TrainingRun[]) {
  const head = "data,tentativa,total,auto,teleop,tips,rp_bonus,observacoes";
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const rows = runs.map((r) =>
    [new Date(r.at).toISOString(), esc(r.label), r.total, r.auto, r.teleop, r.tips, r.rpBonus, esc(r.notes)].join(","),
  );
  return [head, ...rows].join("\n");
}
