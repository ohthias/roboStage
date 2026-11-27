import type { Hazards, Round } from "./types";

/** Caderno Verde – Perigos do Trajeto */
export const HAZARD_DEFS: {
  key: keyof Hazards;
  label: string;
  points: number;
  hint: string;
}[] = [
  { key: "intersecoes", label: "Interseção / Beco sem saída", points: 10, hint: "10 pts cada" },
  { key: "gangorras", label: "Gangorra", points: 20, hint: "20 pts cada" },
  { key: "obstaculos", label: "Obstáculo desviado", points: 20, hint: "20 pts cada" },
  { key: "gaps", label: "Ladrilho com Gap(s)", points: 10, hint: "10 pts por ladrilho" },
  { key: "rampas", label: "Ladrilho com Rampa (subir/descer)", points: 10, hint: "10 pts por ladrilho" },
  { key: "lombadas", label: "Ladrilho com Lombada(s)", points: 10, hint: "10 pts por ladrilho" },
  { key: "passagens", label: "Passagem", points: 0, hint: "0 pts (não pontua)" },
];

export const START_TILE_POINTS = 5;
export const FINISH_MAX = 60;
export const FINISH_PENALTY = 5;
export const ROUND_MAX_SECONDS = 300;

/** Pontos por ladrilho conforme a tentativa em que o checkpoint foi superado */
export function checkpointRate(attempt: number): number {
  if (attempt <= 1) return 5;
  if (attempt === 2) return 3;
  if (attempt === 3) return 1;
  return 0;
}

/** Multiplicadores em décimos (evita erro de ponto flutuante: 1.3*1.3 etc.) */
export const MULT_VIVA_VERDE = 13;
export const MULT_MORTA_VERMELHA = 13;
export const MULT_INVERTIDA = 11;
export const MULT_SURPRESA = 15;

export const MAX_VIVAS = 2;
export const MAX_MORTAS = 1;

export function emptyRound(): Round {
  return {
    hazards: {
      intersecoes: 0,
      gangorras: 0,
      obstaculos: 0,
      gaps: 0,
      rampas: 0,
      lombadas: 0,
      passagens: 0,
    },
    startTile: true,
    checkpoints: [],
    falhas: 0,
    chegada: false,
    vivasVerde: 0,
    mortasVermelha: 0,
    invertidas: 0,
    surpresa: false,
    tempo: ROUND_MAX_SECONDS,
    desistiu: false,
  };
}

export interface Breakdown {
  hazards: number;
  checkpoints: number;
  start: number;
  chegada: number;
  base: number;
  multiplier: number; // ex.: 1.69
  multiplierParts: string[];
  total: number; // arredondado para cima
  tempo: number; // tempo efetivo para desempate
}

export function breakdown(r: Round): Breakdown {
  const hazards = HAZARD_DEFS.reduce((s, d) => s + d.points * (r.hazards[d.key] || 0), 0);
  const checkpoints = r.checkpoints.reduce(
    (s, c) => s + Math.max(0, c.tiles) * checkpointRate(c.attempt),
    0
  );
  const start = r.startTile ? START_TILE_POINTS : 0;
  const chegada = r.chegada
    ? Math.max(0, FINISH_MAX - FINISH_PENALTY * Math.max(0, r.falhas))
    : 0;
  const base = hazards + checkpoints + start + chegada;

  const vivas = Math.min(MAX_VIVAS, Math.max(0, r.vivasVerde));
  const mortas = Math.min(MAX_MORTAS, Math.max(0, r.mortasVermelha));
  const inv = Math.max(0, r.invertidas);
  const surp = r.surpresa ? 1 : 0;

  const num = Math.pow(13, vivas + mortas) * Math.pow(11, inv) * Math.pow(15, surp);
  const nFactors = vivas + mortas + inv + surp;
  const den = Math.pow(10, nFactors);

  const parts: string[] = [];
  if (vivas) parts.push(`${vivas}× viva (×1,3)`);
  if (mortas) parts.push(`${mortas}× morta (×1,3)`);
  if (inv) parts.push(`${inv}× invertida (×1,1)`);
  if (surp) parts.push(`Desafio Surpresa (×1,5)`);

  // arredonda para cima o inteiro mais próximo, em aritmética inteira
  const total = Math.floor((base * num + den - 1) / den);

  const tempo =
    r.chegada && !r.desistiu
      ? Math.min(ROUND_MAX_SECONDS, Math.max(0, r.tempo))
      : ROUND_MAX_SECONDS;

  return {
    hazards,
    checkpoints,
    start,
    chegada,
    base,
    multiplier: num / den,
    multiplierParts: parts,
    total,
    tempo,
  };
}

export function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
