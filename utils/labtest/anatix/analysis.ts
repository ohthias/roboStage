// ---------------------------------------------------------------------------
// Transformações puras dos dados do AnatixStore para gráficos, mapas e tabelas.
// ---------------------------------------------------------------------------

import type { AnatixFrame } from "@/types/anatix.types";
import type { MetricSeries } from "./store";

export interface Point {
  t: number; // segundos (tempo do robô)
  v: number;
}

/** Recorta a janela de tempo e reduz para no máx. `max` pontos (mantém picos por bloco). */
export function seriesWindow(
  s: MetricSeries,
  windowSec: number | null,
  endT: number | null,
  max = 600,
): Point[] {
  const end = endT ?? s.t.at(-1) ?? 0;
  const startMs = windowSec ? end - windowSec * 1000 : -Infinity;
  let i = 0;
  while (i < s.t.length && s.t[i] < startMs) i++;
  const n = s.t.length - i;
  if (n <= 0) return [];

  if (n <= max) {
    const out: Point[] = [];
    for (let k = i; k < s.t.length; k++) out.push({ t: s.t[k] / 1000, v: s.v[k] });
    return out;
  }

  // Min/máx por bloco: o gráfico não esconde picos.
  const out: Point[] = [];
  const block = Math.ceil(n / (max / 2));
  for (let b = i; b < s.t.length; b += block) {
    let lo = b;
    let hi = b;
    const stop = Math.min(b + block, s.t.length);
    for (let k = b; k < stop; k++) {
      if (s.v[k] < s.v[lo]) lo = k;
      if (s.v[k] > s.v[hi]) hi = k;
    }
    const [a, c] = lo < hi ? [lo, hi] : [hi, lo];
    out.push({ t: s.t[a] / 1000, v: s.v[a] });
    if (c !== a) out.push({ t: s.t[c] / 1000, v: s.v[c] });
  }
  return out;
}

/**
 * Junta duas métricas pelo tempo mais próximo (mapa XY, ex.: posição x/y).
 * Pares com diferença maior que `toleranceMs` são ignorados.
 */
export function pairXY(
  xs: MetricSeries,
  ys: MetricSeries,
  toleranceMs = 150,
  max = 1500,
): { x: number; y: number; t: number }[] {
  const out: { x: number; y: number; t: number }[] = [];
  let j = 0;
  for (let i = 0; i < xs.t.length; i++) {
    const t = xs.t[i];
    while (j + 1 < ys.t.length && Math.abs(ys.t[j + 1] - t) <= Math.abs(ys.t[j] - t)) j++;
    if (ys.t.length && Math.abs(ys.t[j] - t) <= toleranceMs) {
      out.push({ x: xs.v[i], y: ys.v[j], t: t / 1000 });
    }
  }
  if (out.length <= max) return out;
  const step = out.length / max;
  return Array.from({ length: max }, (_, k) => out[Math.floor(k * step)]);
}

export interface HeatRow {
  name: string;
  cells: (number | null)[]; // média do bloco
  norm: (number | null)[]; // 0..1 dentro da linha
  min: number;
  max: number;
}

/** Mapa de calor: métricas × blocos de tempo, normalizado por métrica. */
export function heatmap(
  metrics: Map<string, MetricSeries>,
  startMs: number,
  endMs: number,
  buckets = 40,
): HeatRow[] {
  const span = Math.max(1, endMs - startMs);
  const rows: HeatRow[] = [];
  for (const [name, s] of metrics) {
    const sum = new Array<number>(buckets).fill(0);
    const cnt = new Array<number>(buckets).fill(0);
    for (let k = 0; k < s.t.length; k++) {
      if (s.t[k] < startMs || s.t[k] > endMs) continue;
      const b = Math.min(buckets - 1, Math.floor(((s.t[k] - startMs) / span) * buckets));
      sum[b] += s.v[k];
      cnt[b]++;
    }
    const cells = sum.map((v, b) => (cnt[b] ? v / cnt[b] : null));
    const present = cells.filter((c): c is number => c !== null);
    if (!present.length) continue;
    const min = Math.min(...present);
    const max = Math.max(...present);
    rows.push({
      name,
      cells,
      norm: cells.map((c) => (c === null ? null : max === min ? 0.5 : (c - min) / (max - min))),
      min,
      max,
    });
  }
  return rows;
}

export interface StateSegment {
  state: string;
  from: number; // ms
  to: number; // ms
}

/** Linha do tempo de cada máquina de estados (mapa de estados). */
export function stateSegments(
  transitions: Extract<AnatixFrame, { k: "S" }>[],
  endMs: number,
): Map<string, StateSegment[]> {
  const byMachine = new Map<string, StateSegment[]>();
  for (const tr of transitions) {
    const list = byMachine.get(tr.machine) ?? [];
    const prev = list.at(-1);
    if (prev) prev.to = tr.t;
    list.push({ state: tr.state, from: tr.t, to: endMs });
    byMachine.set(tr.machine, list);
  }
  for (const list of byMachine.values()) {
    const last = list.at(-1);
    if (last) last.to = Math.max(last.from, endMs);
  }
  return byMachine;
}

export function fmtNum(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const d = abs >= 1000 ? 0 : abs >= 100 ? 1 : digits;
  return value.toLocaleString("pt-BR", { maximumFractionDigits: d });
}

export function fmtMs(ms: number | null | undefined) {
  if (ms === null || ms === undefined || !Number.isFinite(ms)) return "—";
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)} s`;
  const m = Math.floor(s / 60);
  return `${m} min ${Math.round(s % 60)} s`;
}

/** CSV com todas as amostras (t_ms, métrica, valor). */
export function metricsToCsv(metrics: Map<string, MetricSeries>) {
  const lines = ["t_ms,metrica,valor"];
  const rows: [number, string, number][] = [];
  for (const [name, s] of metrics) {
    for (let k = 0; k < s.t.length; k++) rows.push([s.t[k], name, s.v[k]]);
  }
  rows.sort((a, b) => a[0] - b[0]);
  for (const [t, n, v] of rows) lines.push(`${t},${n},${v}`);
  return lines.join("\n");
}
