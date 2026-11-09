// ---------------------------------------------------------------------------
// Visão personalizável do teste (labtest/[id]): métricas derivadas das
// execuções, filtros, blocos do painel e modos predefinidos. Puro (sem React).
// ---------------------------------------------------------------------------

import type { FieldDefinition, ModeId, TestEntry } from "@/types/labtest.types";
import { getFieldValue } from "@/types/labtest.types";
import { toNumber } from "./chart-data";
import { entryTotal } from "./stats";
import type { FllMissionDefinition } from "./fll";
import { fllEntryScore, fllMissionPoints, missionMaxPoints } from "./fll-analysis";

// ---- Métricas ---------------------------------------------------------------

export interface ViewMetric {
  key: string;
  label: string;
  unit?: string | null;
  /** boolean = 1 (sim) / 0 (não); estatísticas viram taxa de sucesso. */
  kind: "number" | "boolean";
  target?: number | null;
  /** Para "melhor": maior é melhor (padrão) ou menor (tempo, falhas…). */
  lowerIsBetter?: boolean;
  group: "resultado" | "campo" | "missao";
  /** Rótulo curto para cabeçalhos de tabela (ex.: "M04"). */
  short?: string;
}

export interface ViewRow {
  entry: TestEntry;
  values: Record<string, number | null>;
}

const DURATION_RE = /tempo|time|segundo|second|dura|lap|volta/i;

/** Métricas que fazem sentido para este teste (só as que têm algum valor). */
export function buildViewMetrics(
  mode: ModeId,
  fields: FieldDefinition[],
  entries: TestEntry[],
  /** Testes "runs" da FLL: missões do teste (pontuação por missão). */
  fll?: { missions: FllMissionDefinition[] } | null,
): { metrics: ViewMetric[]; rows: ViewRow[] } {
  const candidates: { metric: ViewMetric; pick: (e: TestEntry) => number | null }[] = [];
  const numeric = fields.filter((f) => f.type === "number");

  // Soma dos campos só faz sentido quando eles medem a mesma coisa (ex.: pontos).
  const units = new Set(numeric.map((f) => (f.unit ?? "").trim().toLowerCase()).map((u) => (u === "pts" ? "" : u)));
  const summable = (mode === "runs" || mode === "individual") && numeric.length > 1 && units.size === 1;
  candidates.push({
    metric: { key: "__total", label: "Pontuação total", short: "Placar", unit: "pts", kind: "number", group: "resultado" },
    pick: (e) =>
      e.obrRound?.scores.total ??
      e.futureEdition?.scores.total ??
      (fll ? fllEntryScore(fll.missions, e) : null) ??
      (typeof e.roundTotal === "number" ? e.roundTotal : null) ??
      (summable ? entryTotal(e, fields) : null),
  });
  candidates.push({
    metric: { key: "__time", label: "Tempo da rodada", short: "Tempo", unit: "s", kind: "number", group: "resultado", lowerIsBetter: true },
    pick: (e) => e.obrRound?.elapsedSec ?? e.futureEdition?.elapsedSec ?? e.roundSeconds ?? null,
  });
  candidates.push({
    metric: { key: "__multiplier", label: "Multiplicador OBR", unit: "×", kind: "number", group: "resultado" },
    pick: (e) => e.obrRound?.scores.multiplier ?? null,
  });
  candidates.push({
    metric: { key: "__failures", label: "Falhas", kind: "number", group: "resultado", lowerIsBetter: true },
    pick: (e) => e.obrRound?.round.falhas ?? null,
  });
  candidates.push({
    metric: { key: "__penalties", label: "Penalidades", kind: "number", group: "resultado", lowerIsBetter: true },
    pick: (e) => e.futureEdition?.scores.penaltyCount ?? null,
  });
  candidates.push({
    metric: { key: "__discs", label: "Discos de precisão restantes", short: "Discos", kind: "number", group: "resultado" },
    pick: (e) => e.precisionDiscs?.remaining ?? null,
  });

  // FLL: uma métrica por missão (pontos, com o máximo possível como meta).
  for (const mission of fll?.missions ?? []) {
    candidates.push({
      metric: {
        key: `m:${mission.id}`,
        label: `${mission.id} · ${mission.name}`,
        short: mission.id,
        unit: "pts",
        kind: "number",
        target: missionMaxPoints(mission) || null,
        group: "missao",
      },
      pick: (e) => fllMissionPoints(mission, e),
    });
  }

  for (const f of [...fields].sort((a, b) => a.order - b.order)) {
    if (f.type === "number" || f.type === "duration") {
      candidates.push({
        metric: {
          key: `f:${f.fieldKey}`,
          label: f.label,
          unit: f.unit ?? (f.type === "duration" ? "s" : null),
          kind: "number",
          target: f.targetValue ?? null,
          lowerIsBetter: f.type === "duration" || DURATION_RE.test(`${f.label} ${f.unit ?? ""}`),
          group: "campo",
        },
        pick: (e) => toNumber(getFieldValue(e.values, f.fieldKey)),
      });
    } else if (f.type === "boolean") {
      candidates.push({
        metric: { key: `f:${f.fieldKey}`, label: f.label, unit: "%", kind: "boolean", group: "campo" },
        pick: (e) => {
          const raw = getFieldValue(e.values, f.fieldKey);
          return raw === true ? 1 : raw === false ? 0 : null;
        },
      });
    }
  }

  const rows: ViewRow[] = entries.map((entry) => ({ entry, values: {} }));
  const metrics: ViewMetric[] = [];
  for (const { metric, pick } of candidates) {
    let any = false;
    rows.forEach((row) => {
      const v = pick(row.entry);
      const n = typeof v === "number" && Number.isFinite(v) ? v : null;
      row.values[metric.key] = n;
      if (n !== null) any = true;
    });
    // Campos e missões sempre aparecem (mesmo sem dados ainda); resultados só se existirem.
    if (any || metric.group !== "resultado") metrics.push(metric);
    else rows.forEach((row) => delete row.values[metric.key]);
  }
  return { metrics, rows };
}

// ---- Estatísticas -------------------------------------------------------------

export interface MetricSummary {
  count: number;
  last: number | null;
  first: number | null;
  min: number;
  max: number;
  avg: number;
  median: number;
  std: number;
  /** Coeficiente de variação (%): desvio / média. */
  cv: number | null;
  best: number;
  /** Inclinação da reta de tendência por execução. */
  slope: number;
  /** Fração de execuções que atingiram a meta (null sem meta). */
  hitRate: number | null;
}

export function metricValues(rows: ViewRow[], key: string) {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const r of rows) {
    const v = r.values[key];
    if (v !== null && v !== undefined) {
      xs.push(r.entry.executionNumber);
      ys.push(v);
    }
  }
  return { xs, ys };
}

export function linearFit(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n < 2) return { slope: 0, intercept: ys[0] ?? 0 };
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: my - slope * mx };
}

export function summarize(rows: ViewRow[], metric: ViewMetric): MetricSummary | null {
  const { xs, ys } = metricValues(rows, metric.key);
  const n = ys.length;
  if (!n) return null;
  const sorted = [...ys].sort((a, b) => a - b);
  const avg = ys.reduce((a, b) => a + b, 0) / n;
  const std = Math.sqrt(ys.reduce((a, v) => a + (v - avg) ** 2, 0) / n);
  const mid = (n - 1) / 2;
  const median = (sorted[Math.floor(mid)] + sorted[Math.ceil(mid)]) / 2;
  const target = metric.target;
  return {
    count: n,
    first: ys[0],
    last: ys[n - 1],
    min: sorted[0],
    max: sorted[n - 1],
    avg,
    median,
    std,
    cv: avg !== 0 ? (std / Math.abs(avg)) * 100 : null,
    best: metric.lowerIsBetter ? sorted[0] : sorted[n - 1],
    slope: linearFit(xs, ys).slope,
    hitRate:
      target === null || target === undefined
        ? null
        : ys.filter((v) => (metric.lowerIsBetter ? v <= target : v >= target)).length / n,
  };
}

// ---- Filtros ------------------------------------------------------------------

export type ViewRange = "all" | "last5" | "last10" | "last20" | "execs" | "dates";

export interface ViewFilters {
  range: ViewRange;
  fromExec?: number | null;
  toExec?: number | null;
  /** yyyy-mm-dd */
  fromDate?: string | null;
  toDate?: string | null;
  search?: string;
  withNotes?: boolean;
  /** Métricas escondidas da tabela/resumo do painel (chaves). */
  hiddenMetrics?: string[];
}

export const DEFAULT_FILTERS: ViewFilters = { range: "all" };

export const RANGE_LABEL: Record<ViewRange, string> = {
  all: "Todas",
  last5: "Últimas 5",
  last10: "Últimas 10",
  last20: "Últimas 20",
  execs: "Por número",
  dates: "Por data",
};

function dayKey(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function applyFilters<T extends TestEntry>(entries: T[], f: ViewFilters): T[] {
  let list = [...entries].sort((a, b) => a.executionNumber - b.executionNumber);
  if (f.range === "last5") list = list.slice(-5);
  else if (f.range === "last10") list = list.slice(-10);
  else if (f.range === "last20") list = list.slice(-20);
  else if (f.range === "execs") {
    list = list.filter(
      (e) =>
        (f.fromExec == null || e.executionNumber >= f.fromExec) &&
        (f.toExec == null || e.executionNumber <= f.toExec),
    );
  } else if (f.range === "dates") {
    list = list.filter((e) => {
      const day = dayKey(e.createdAt);
      return (!f.fromDate || day >= f.fromDate) && (!f.toDate || day <= f.toDate);
    });
  }
  if (f.withNotes) list = list.filter((e) => e.notes && e.notes.trim());
  const q = f.search?.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (e) =>
        `#${e.executionNumber}`.includes(q) ||
        (e.notes ?? "").toLowerCase().includes(q) ||
        e.values.some((v) => typeof v.value === "string" && v.value.toLowerCase().includes(q)),
    );
  }
  return list;
}

export function activeFilterCount(f: ViewFilters) {
  return (
    (f.range !== "all" ? 1 : 0) +
    (f.search?.trim() ? 1 : 0) +
    (f.withNotes ? 1 : 0) +
    (f.hiddenMetrics?.length ? 1 : 0)
  );
}

// ---- Blocos do painel ---------------------------------------------------------

export type ViewWidgetType =
  | "evolution"
  | "trend"
  | "kpi"
  | "stat-bars"
  | "histogram"
  | "scatter"
  | "success"
  | "targets"
  | "fll-missions"
  | "table-missions"
  | "table-mission-grid"
  | "table-entries"
  | "table-stats"
  | "table-correlation";

export type ViewWidgetSize = "sm" | "md" | "lg" | "full";
export type ViewChartType = "line" | "area" | "bar" | "stacked" | "step" | "scatter" | "radar";
export type ViewStat = "avg" | "median" | "min" | "max" | "best" | "last" | "std";

export interface ViewWidget {
  id: string;
  type: ViewWidgetType;
  title: string;
  /** Vazio = automático. */
  metrics: string[];
  size: ViewWidgetSize;
  options: {
    chart?: ViewChartType;
    /** Média móvel (execuções) no gráfico de tendência. */
    movingN?: number;
    stats?: ViewStat[];
    bins?: number;
  };
}

export interface ViewWidgetSpec {
  type: ViewWidgetType;
  group: "chart" | "table";
  label: string;
  description: string;
  metrics: { min: number; max: number; booleanOnly?: boolean; labels?: string[] };
  /** Só para testes da FLL (precisa das missões da temporada). */
  fllOnly?: boolean;
  defaultSize: ViewWidgetSize;
  defaults?: ViewWidget["options"];
}

export const VIEW_WIDGET_SPECS: ViewWidgetSpec[] = [
  { type: "evolution", group: "chart", label: "Evolução por execução", description: "Linha, área, barras, empilhado, degraus, dispersão ou radar — uma série por métrica.", metrics: { min: 1, max: 8 }, defaultSize: "lg", defaults: { chart: "line" } },
  { type: "trend", group: "chart", label: "Tendência", description: "Uma métrica com média móvel, reta de tendência e meta: está melhorando?", metrics: { min: 1, max: 1 }, defaultSize: "md", defaults: { movingN: 3 } },
  { type: "kpi", group: "chart", label: "Indicador", description: "Último valor, melhor, média e variação em relação à execução anterior.", metrics: { min: 1, max: 1 }, defaultSize: "sm" },
  { type: "stat-bars", group: "chart", label: "Barras de estatísticas", description: "Compara média, mediana, melhor, mínimo, máximo ou desvio entre métricas.", metrics: { min: 1, max: 10 }, defaultSize: "md", defaults: { stats: ["avg", "best"] } },
  { type: "histogram", group: "chart", label: "Distribuição", description: "Em que faixa os resultados mais caem — mostra a consistência.", metrics: { min: 1, max: 1 }, defaultSize: "md", defaults: { bins: 8 } },
  { type: "scatter", group: "chart", label: "Relação X × Y", description: "Cruza duas métricas por execução, com reta e correlação.", metrics: { min: 2, max: 2, labels: ["Eixo X", "Eixo Y"] }, defaultSize: "md" },
  { type: "success", group: "chart", label: "Taxa de sucesso", description: "Percentual de \"sim\" em cada campo sim/não.", metrics: { min: 1, max: 16, booleanOnly: true }, defaultSize: "md" },
  { type: "targets", group: "chart", label: "Metas", description: "Média e melhor resultado de cada campo em relação à meta definida.", metrics: { min: 1, max: 12 }, defaultSize: "md" },
  { type: "fll-missions", group: "chart", label: "Ranking das missões", description: "Média de pontos de cada missão contra o máximo possível — onde o robô mais perde pontos.", metrics: { min: 0, max: 0 }, defaultSize: "lg", fllOnly: true },
  { type: "table-missions", group: "table", label: "Desempenho por missão", description: "Tentativas, % que pontuou, % no máximo, média, melhor, aproveitamento, pontos perdidos e tempo da 1ª marcação.", metrics: { min: 0, max: 0 }, defaultSize: "full", fllOnly: true },
  { type: "table-mission-grid", group: "table", label: "Missões × execuções", description: "Mapa de calor: pontos de cada missão em cada execução, colorido pelo % do máximo.", metrics: { min: 0, max: 0 }, defaultSize: "full", fllOnly: true },
  { type: "table-entries", group: "table", label: "Tabela de execuções", description: "Uma linha por execução e uma coluna por métrica. Ordena, destaca o melhor e exporta CSV.", metrics: { min: 1, max: 40 }, defaultSize: "full" },
  { type: "table-stats", group: "table", label: "Estatísticas", description: "Média, mediana, desvio, consistência, melhor, tendência e % de metas atingidas.", metrics: { min: 1, max: 40 }, defaultSize: "full" },
  { type: "table-correlation", group: "table", label: "Correlação", description: "Quais métricas sobem e descem juntas entre as execuções.", metrics: { min: 2, max: 10 }, defaultSize: "md" },
];

export const VIEW_WIDGET_SPEC = Object.fromEntries(VIEW_WIDGET_SPECS.map((s) => [s.type, s])) as Record<
  ViewWidgetType,
  ViewWidgetSpec
>;

export const VIEW_STAT_LABEL: Record<ViewStat, string> = {
  avg: "Média",
  median: "Mediana",
  min: "Mínimo",
  max: "Máximo",
  best: "Melhor",
  last: "Último",
  std: "Desvio",
};

export const VIEW_CHART_LABEL: Record<ViewChartType, string> = {
  line: "Linhas",
  area: "Área",
  bar: "Barras",
  stacked: "Empilhado",
  step: "Degraus",
  scatter: "Pontos",
  radar: "Radar",
};

let seq = 0;
export function newViewWidgetId() {
  seq = (seq + 1) % 1e6;
  return `v${Date.now().toString(36)}${seq.toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

export function createViewWidget(type: ViewWidgetType, metrics: string[] = [], title?: string): ViewWidget {
  const spec = VIEW_WIDGET_SPEC[type];
  return {
    id: newViewWidgetId(),
    type,
    title: title ?? spec.label,
    metrics: metrics.slice(0, spec.metrics.max),
    size: spec.defaultSize,
    options: { ...(spec.defaults ?? {}) },
  };
}

/** Métricas que o bloco usa: as escolhidas que existem, ou automáticas. */
export function resolveWidgetMetrics(widget: ViewWidget, metrics: ViewMetric[]): ViewMetric[] {
  const spec = VIEW_WIDGET_SPEC[widget.type];
  const pool = metrics.filter((m) => (spec.metrics.booleanOnly ? m.kind === "boolean" : true));
  const byKey = new Map(pool.map((m) => [m.key, m]));
  const chosen = widget.metrics.map((k) => byKey.get(k)).filter((m): m is ViewMetric => !!m);
  if (chosen.length) return chosen.slice(0, spec.metrics.max);
  let auto = pool;
  if (widget.type === "targets") auto = pool.filter((m) => m.target != null);
  else if (widget.type === "evolution") auto = unitGroups(pool)[0] ?? pool;
  else if (!spec.metrics.booleanOnly && spec.group === "chart") {
    const numeric = pool.filter((m) => m.kind === "number");
    auto = numeric.length >= spec.metrics.min ? numeric : pool;
  }
  return auto.slice(0, spec.group === "table" ? spec.metrics.max : Math.max(spec.metrics.min, Math.min(spec.metrics.max, 4)));
}

// ---- Modos predefinidos -------------------------------------------------------

export interface ViewPreset {
  key: string;
  label: string;
  description: string;
  /** Só aparece em testes da FLL. */
  fllOnly?: boolean;
  filters?: Partial<ViewFilters>;
  build: (metrics: ViewMetric[]) => ViewWidget[];
}

/** Agrupa métricas numéricas por unidade (gráficos sem misturar escalas). */
export function unitGroups(metrics: ViewMetric[], max = 6): ViewMetric[][] {
  const groups = new Map<string, ViewMetric[]>();
  for (const m of metrics) {
    if (m.kind !== "number") continue;
    const u = (m.unit ?? "").trim().toLowerCase();
    const list = groups.get(u) ?? [];
    if (list.length < max) list.push(m);
    groups.set(u, list);
  }
  return [...groups.values()].sort((a, b) => b.length - a.length);
}

function unitTitle(group: ViewMetric[], prefix: string) {
  return group.length === 1 ? `${prefix} · ${group[0].label}` : `${prefix}${group[0].unit ? ` (${group[0].unit})` : ""}`;
}

function main(metrics: ViewMetric[]) {
  return metrics.find((m) => m.key === "__total") ?? metrics.find((m) => m.kind === "number") ?? metrics[0];
}
const keys = (ms: (ViewMetric | undefined)[]) => ms.filter((m): m is ViewMetric => !!m).map((m) => m.key);

export const VIEW_PRESETS: ViewPreset[] = [
  {
    key: "fll",
    label: "Missões FLL",
    description: "Placar, ranking das missões, desempenho por missão e mapa missão × execução.",
    fllOnly: true,
    filters: { range: "all" },
    build: (ms) => {
      const pick = (k: string) => ms.find((m) => m.key === k);
      const kpis = [pick("__total"), pick("__time"), pick("__discs")].filter((m): m is ViewMetric => !!m);
      return [
        ...kpis.map((m) => createViewWidget("kpi", [m.key], m.label)),
        // Completa a primeira linha (4 colunas) com a distribuição do placar.
        ...(pick("__total") && kpis.length < 4
          ? [{ ...createViewWidget("histogram", ["__total"], "Distribuição do placar"), size: (kpis.length === 3 ? "sm" : kpis.length === 2 ? "md" : "lg") as ViewWidgetSize, options: { bins: 6 } }]
          : []),
        ...(pick("__total") ? [{ ...createViewWidget("trend", ["__total"], "Placar por execução"), size: "full" as const }] : []),
        { ...createViewWidget("fll-missions", [], "Ranking das missões"), size: "full" as const },
        createViewWidget("table-missions", [], "Desempenho por missão"),
        createViewWidget("table-mission-grid", [], "Missões × execuções"),
      ];
    },
  },
  {
    key: "fll-consistency",
    label: "Consistência das missões",
    description: "Quais missões oscilam mais entre execuções e quanto cada uma rende.",
    fllOnly: true,
    filters: { range: "all" },
    build: (ms) => {
      const missions = ms.filter((m) => m.group === "missao");
      return [
        ...(ms.some((m) => m.key === "__total") ? [createViewWidget("histogram", ["__total"], "Distribuição do placar")] : []),
        { ...createViewWidget("stat-bars", keys(missions.slice(0, 10)), "Média × melhor por missão"), options: { stats: ["avg", "best"] as ViewStat[] }, size: "lg" as const },
        { ...createViewWidget("stat-bars", keys(missions.slice(0, 10)), "Oscilação por missão"), options: { stats: ["std"] as ViewStat[] } },
        createViewWidget("table-stats", keys(missions), "Estatísticas por missão"),
      ];
    },
  },
  {
    key: "overview",
    label: "Visão geral",
    description: "Indicadores principais, evolução de tudo e a tabela de estatísticas.",
    filters: { range: "all" },
    build: (ms) => {
      const numeric = ms.filter((m) => m.kind === "number");
      const kpis = [main(ms), ...numeric.filter((m) => m !== main(ms))].slice(0, 4);
      return [
        ...kpis.filter(Boolean).map((m) => createViewWidget("kpi", [m.key], m.label)),
        ...unitGroups(ms).slice(0, 2).map((g) => createViewWidget("evolution", keys(g), unitTitle(g, "Evolução"))),
        ...(ms.some((m) => m.kind === "boolean")
          ? [{ ...createViewWidget("success", [], "Taxa de sucesso"), size: "sm" as const }]
          : []),
        createViewWidget("table-stats", [], "Estatísticas"),
      ];
    },
  },
  {
    key: "trend",
    label: "Evolução e tendência",
    description: "O robô está melhorando? Tendência com média móvel e últimas execuções.",
    filters: { range: "all" },
    build: (ms) => {
      const m = main(ms);
      const others = ms.filter((x) => x.kind === "number" && x !== m).slice(0, 3);
      return [
        ...(m ? [{ ...createViewWidget("trend", [m.key], `Tendência · ${m.label}`), size: "lg" as const }] : []),
        ...(m ? [createViewWidget("kpi", [m.key], m.label)] : []),
        ...others.map((o) => createViewWidget("trend", [o.key], `Tendência · ${o.label}`)),
        ...unitGroups(ms).slice(0, 2).map((g) => ({ ...createViewWidget("evolution", keys(g), unitTitle(g, "Por execução")), options: { chart: "area" as const } })),
      ];
    },
  },
  {
    key: "consistency",
    label: "Consistência",
    description: "Quão repetível é o resultado: distribuição, desvio e variação.",
    filters: { range: "all" },
    build: (ms) => {
      const m = main(ms);
      const numeric = ms.filter((x) => x.kind === "number");
      return [
        ...(m ? [createViewWidget("histogram", [m.key], `Distribuição · ${m.label}`)] : []),
        { ...createViewWidget("stat-bars", keys(numeric.slice(0, 6)), "Desvio padrão"), options: { stats: ["std"] as ViewStat[] } },
        { ...createViewWidget("stat-bars", keys(numeric.slice(0, 6)), "Faixa de resultados"), options: { stats: ["min", "median", "max"] as ViewStat[] }, size: "lg" as const },
        createViewWidget("table-stats", [], "Estatísticas"),
      ];
    },
  },
  {
    key: "compare",
    label: "Comparar parâmetros",
    description: "Relação entre os campos: correlação, dispersão e médias lado a lado.",
    filters: { range: "all" },
    build: (ms) => {
      const numeric = ms.filter((x) => x.kind === "number");
      return [
        ...unitGroups(ms).slice(0, 2).map((g) => ({ ...createViewWidget("evolution", keys(g), unitTitle(g, "Parâmetros por execução")), options: { chart: "bar" as const } })),
        ...(numeric.length >= 2 ? [createViewWidget("scatter", keys(numeric.slice(0, 2)), `${numeric[0].label} × ${numeric[1].label}`)] : []),
        ...(numeric.length >= 2 ? [createViewWidget("table-correlation", keys(numeric.slice(0, 8)), "Correlação")] : []),
        { ...createViewWidget("stat-bars", keys(numeric.slice(0, 8)), "Médias"), options: { stats: ["avg"] as ViewStat[] }, size: "lg" as const },
      ];
    },
  },
  {
    key: "goals",
    label: "Metas e sucesso",
    description: "Quanto falta para as metas e quais etapas sim/não mais falham.",
    filters: { range: "all" },
    build: (ms) => [
      ...(ms.some((m) => m.target != null) ? [createViewWidget("targets", [], "Metas")] : []),
      ...(ms.some((m) => m.kind === "boolean") ? [createViewWidget("success", [], "Taxa de sucesso")] : []),
      createViewWidget("table-entries", [], "Execuções"),
    ],
  },
  {
    key: "recent",
    label: "Últimas 5 execuções",
    description: "Foco no treino de hoje: só as 5 execuções mais recentes, em detalhe.",
    filters: { range: "last5" },
    build: (ms) => {
      const m = main(ms);
      return [
        ...(m ? [createViewWidget("kpi", [m.key], m.label)] : []),
        ...unitGroups(ms, 5).slice(0, 1).map((g) => ({ ...createViewWidget("evolution", keys(g), unitTitle(g, "Últimas execuções")), options: { chart: "bar" as const } })),
        createViewWidget("table-entries", [], "Execuções"),
      ];
    },
  },
];

export function presetsFor(isFll: boolean) {
  return VIEW_PRESETS.filter((p) => !p.fllOnly || isFll);
}

/** Painel inicial quando o usuário ainda não montou o dele. */
export function defaultWidgets(metrics: ViewMetric[], isFll: boolean) {
  return (isFll ? VIEW_PRESETS.find((p) => p.key === "fll")! : VIEW_PRESETS.find((p) => p.key === "overview")!).build(metrics);
}

// ---- Persistência (localStorage) ---------------------------------------------

export type ViewTab = "analysis" | "dashboard" | "history";

export interface ViewState {
  tab: ViewTab;
  filters: ViewFilters;
  widgets: ViewWidget[] | null; // null = ainda não montado (usa "Visão geral")
  showSummary: boolean;
  showAside: boolean;
  historyLayout: "cards" | "table";
}

export const DEFAULT_VIEW_STATE: ViewState = {
  tab: "analysis",
  filters: DEFAULT_FILTERS,
  widgets: null,
  showSummary: true,
  showAside: true,
  historyLayout: "cards",
};

const TYPES = new Set(VIEW_WIDGET_SPECS.map((s) => s.type));
const SIZES = new Set(["sm", "md", "lg", "full"]);
const CHARTS = new Set(Object.keys(VIEW_CHART_LABEL));
const STATS = new Set(Object.keys(VIEW_STAT_LABEL));
const RANGES = new Set(Object.keys(RANGE_LABEL));

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : undefined);
const int = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v) : null);

export function normalizeViewState(raw: unknown): ViewState {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const f = o.filters && typeof o.filters === "object" ? (o.filters as Record<string, unknown>) : {};
  const widgets = Array.isArray(o.widgets)
    ? o.widgets.flatMap((w): ViewWidget[] => {
        if (!w || typeof w !== "object") return [];
        const x = w as Record<string, unknown>;
        if (!TYPES.has(x.type as ViewWidgetType)) return [];
        const spec = VIEW_WIDGET_SPEC[x.type as ViewWidgetType];
        const opts = (x.options && typeof x.options === "object" ? x.options : {}) as Record<string, unknown>;
        const stats = Array.isArray(opts.stats) ? opts.stats.filter((s): s is ViewStat => STATS.has(s)) : [];
        return [
          {
            id: str(x.id, 40) || newViewWidgetId(),
            type: spec.type,
            title: str(x.title, 80)?.trim() || spec.label,
            metrics: Array.isArray(x.metrics)
              ? x.metrics.filter((m): m is string => typeof m === "string").slice(0, spec.metrics.max)
              : [],
            size: SIZES.has(x.size as string) ? (x.size as ViewWidgetSize) : spec.defaultSize,
            options: {
              ...(CHARTS.has(opts.chart as string) ? { chart: opts.chart as ViewChartType } : {}),
              ...(int(opts.movingN) ? { movingN: Math.min(20, Math.max(2, int(opts.movingN)!)) } : {}),
              ...(stats.length ? { stats } : {}),
              ...(int(opts.bins) ? { bins: Math.min(40, Math.max(3, int(opts.bins)!)) } : {}),
            },
          },
        ];
      }).slice(0, 24)
    : null;
  return {
    tab: o.tab === "dashboard" || o.tab === "history" ? o.tab : "analysis",
    filters: {
      range: RANGES.has(f.range as string) ? (f.range as ViewRange) : "all",
      fromExec: int(f.fromExec),
      toExec: int(f.toExec),
      fromDate: str(f.fromDate, 10) ?? null,
      toDate: str(f.toDate, 10) ?? null,
      search: str(f.search, 80) ?? "",
      withNotes: f.withNotes === true,
      hiddenMetrics: Array.isArray(f.hiddenMetrics)
        ? f.hiddenMetrics.filter((m): m is string => typeof m === "string").slice(0, 64)
        : [],
    },
    widgets,
    showSummary: o.showSummary !== false,
    showAside: o.showAside !== false,
    historyLayout: o.historyLayout === "table" ? "table" : "cards",
  };
}
