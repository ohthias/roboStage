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
  s: Pick<MetricSeries, "t" | "v">,
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
  xs: Pick<MetricSeries, "t" | "v">,
  ys: Pick<MetricSeries, "t" | "v">,
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

// ---------------------------------------------------------------------------
// Painel personalizado: estatísticas, transformações e agrupamentos.
// ---------------------------------------------------------------------------

/** Recorta a série para a janela (sem reduzir pontos). */
export function sliceWindow(
  s: Pick<MetricSeries, "t" | "v">,
  windowSec: number | null,
  endT: number | null,
): { t: number[]; v: number[] } {
  if (!windowSec) return { t: s.t, v: s.v };
  const end = endT ?? s.t.at(-1) ?? 0;
  const start = end - windowSec * 1000;
  let i = 0;
  while (i < s.t.length && s.t[i] < start) i++;
  return { t: s.t.slice(i), v: s.v.slice(i) };
}

export interface FullStats {
  count: number;
  last: number;
  min: number;
  max: number;
  avg: number;
  median: number;
  std: number;
  p5: number;
  p95: number;
  range: number;
  /** Amostras por segundo. */
  rate: number;
}

function quantile(sorted: number[], q: number) {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export function fullStats(t: number[], v: number[]): FullStats | null {
  const n = v.length;
  if (!n) return null;
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;
  for (const x of v) {
    sum += x;
    if (x < min) min = x;
    if (x > max) max = x;
  }
  const avg = sum / n;
  let sq = 0;
  for (const x of v) sq += (x - avg) ** 2;
  const sorted = [...v].sort((a, b) => a - b);
  const spanS = n > 1 ? (t[n - 1] - t[0]) / 1000 : 0;
  return {
    count: n,
    last: v[n - 1],
    min,
    max,
    avg,
    median: quantile(sorted, 0.5),
    std: Math.sqrt(sq / n),
    p5: quantile(sorted, 0.05),
    p95: quantile(sorted, 0.95),
    range: max - min,
    rate: spanS > 0 ? (n - 1) / spanS : 0,
  };
}

/** Média móvel simples (janela centrada à esquerda: últimas `n` amostras). */
export function movingAverage(v: number[], n: number): number[] {
  const out = new Array<number>(v.length);
  let acc = 0;
  for (let i = 0; i < v.length; i++) {
    acc += v[i];
    if (i >= n) acc -= v[i - n];
    out[i] = acc / Math.min(i + 1, n);
  }
  return out;
}

/** Taxa de variação por segundo entre amostras consecutivas. */
export function derivative(t: number[], v: number[]): number[] {
  return v.map((x, i) => {
    if (i === 0) return 0;
    const dt = (t[i] - t[i - 1]) / 1000;
    return dt > 0 ? (x - v[i - 1]) / dt : 0;
  });
}

export function normalize01(v: number[]): number[] {
  let min = Infinity;
  let max = -Infinity;
  for (const x of v) {
    if (x < min) min = x;
    if (x > max) max = x;
  }
  return v.map((x) => (max === min ? 0.5 : (x - min) / (max - min)));
}

export interface HistogramBin {
  from: number;
  to: number;
  mid: number;
  count: number;
  pct: number;
}

export function histogram(v: number[], bins: number): HistogramBin[] {
  if (!v.length) return [];
  let min = Infinity;
  let max = -Infinity;
  for (const x of v) {
    if (x < min) min = x;
    if (x > max) max = x;
  }
  if (min === max) {
    return [{ from: min, to: max, mid: min, count: v.length, pct: 100 }];
  }
  const width = (max - min) / bins;
  const counts = new Array<number>(bins).fill(0);
  for (const x of v) counts[Math.min(bins - 1, Math.floor((x - min) / width))]++;
  return counts.map((count, i) => {
    const from = min + i * width;
    return { from, to: from + width, mid: from + width / 2, count, pct: (count / v.length) * 100 };
  });
}

/**
 * Agrupa várias métricas em intervalos de `bucketMs` (média de cada intervalo).
 * Devolve linhas `{ t, [métrica]: valor | null }`, mais antigas primeiro.
 */
export function alignBuckets(
  series: { name: string; t: number[]; v: number[] }[],
  bucketMs: number,
): { t: number; values: Record<string, number | null> }[] {
  const buckets = new Map<number, Map<string, { sum: number; n: number }>>();
  for (const s of series) {
    for (let k = 0; k < s.t.length; k++) {
      const key = Math.floor(s.t[k] / bucketMs) * bucketMs;
      let row = buckets.get(key);
      if (!row) buckets.set(key, (row = new Map()));
      const cell = row.get(s.name) ?? { sum: 0, n: 0 };
      cell.sum += s.v[k];
      cell.n++;
      row.set(s.name, cell);
    }
  }
  return [...buckets.keys()]
    .sort((a, b) => a - b)
    .map((t) => {
      const row = buckets.get(t)!;
      const values: Record<string, number | null> = {};
      for (const s of series) {
        const c = row.get(s.name);
        values[s.name] = c ? c.sum / c.n : null;
      }
      return { t, values };
    });
}

/** Correlação de Pearson entre duas colunas (ignora linhas com lacunas). */
export function pearson(a: (number | null)[], b: (number | null)[]): number | null {
  let n = 0;
  let sa = 0;
  let sb = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === null || b[i] === null) continue;
    n++;
    sa += a[i]!;
    sb += b[i]!;
  }
  if (n < 3) return null;
  const ma = sa / n;
  const mb = sb / n;
  let cov = 0;
  let va = 0;
  let vb = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === null || b[i] === null) continue;
    const da = a[i]! - ma;
    const db = b[i]! - mb;
    cov += da * db;
    va += da * da;
    vb += db * db;
  }
  if (va === 0 || vb === 0) return null;
  return cov / Math.sqrt(va * vb);
}

/** Tempo total em cada estado de uma máquina, dentro de [startMs, endMs]. */
export function timeInStates(
  segments: StateSegment[],
  startMs: number,
  endMs: number,
): { state: string; ms: number; pct: number; visits: number }[] {
  const totals = new Map<string, { ms: number; visits: number }>();
  let total = 0;
  for (const s of segments) {
    const from = Math.max(s.from, startMs);
    const to = Math.min(s.to, endMs);
    if (to <= from && !(s.from >= startMs && s.from <= endMs)) continue;
    const ms = Math.max(0, to - from);
    const cur = totals.get(s.state) ?? { ms: 0, visits: 0 };
    cur.ms += ms;
    cur.visits++;
    totals.set(s.state, cur);
    total += ms;
  }
  return [...totals]
    .map(([state, { ms, visits }]) => ({ state, ms, visits, pct: total ? (ms / total) * 100 : 0 }))
    .sort((a, b) => b.ms - a.ms);
}

/** Contagem de eventos por bloco de tempo, por nome de evento. */
export function eventBuckets(
  events: Extract<AnatixFrame, { k: "E" }>[],
  startMs: number,
  endMs: number,
  bins: number,
): { names: string[]; rows: ({ t: number } & Record<string, number>)[] } {
  const span = Math.max(1, endMs - startMs);
  const names = [...new Set(events.filter((e) => e.t >= startMs && e.t <= endMs).map((e) => e.name))].sort();
  const rows = Array.from({ length: bins }, (_, i) => {
    const row: { t: number } & Record<string, number> = { t: (startMs + (span * (i + 0.5)) / bins) / 1000 } as {
      t: number;
    } & Record<string, number>;
    for (const n of names) row[n] = 0;
    return row;
  });
  for (const e of events) {
    if (e.t < startMs || e.t > endMs) continue;
    const b = Math.min(bins - 1, Math.floor(((e.t - startMs) / span) * bins));
    rows[b][e.name]++;
  }
  return { names, rows };
}

export interface EventSummaryRow {
  name: string;
  total: number;
  first: number;
  last: number;
  avgIntervalMs: number | null;
  avgData: number;
}

export function eventSummary(events: Extract<AnatixFrame, { k: "E" }>[]): EventSummaryRow[] {
  const by = new Map<string, Extract<AnatixFrame, { k: "E" }>[]>();
  for (const e of events) {
    const list = by.get(e.name) ?? [];
    list.push(e);
    by.set(e.name, list);
  }
  return [...by]
    .map(([name, list]) => ({
      name,
      total: list.length,
      first: list[0].t,
      last: list[list.length - 1].t,
      avgIntervalMs: list.length > 1 ? (list[list.length - 1].t - list[0].t) / (list.length - 1) : null,
      avgData: list.reduce((acc, e) => acc + e.data, 0) / list.length,
    }))
    .sort((a, b) => b.total - a.total);
}

/** CSV genérico a partir de cabeçalho + linhas. */
export function toCsv(header: string[], rows: (string | number | null)[][]) {
  const esc = (v: string | number | null) => {
    if (v === null) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
}
