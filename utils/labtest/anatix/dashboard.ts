// ---------------------------------------------------------------------------
// Painel personalizado do Anatix: catálogo de blocos, modelos prontos e a
// validação do que vem do banco (jsonb). Puro — usado no cliente e no servidor.
// ---------------------------------------------------------------------------

import {
  ANATIX_MAX_WIDGETS,
  type AnatixSeriesTransform,
  type AnatixStatKey,
  type AnatixWidget,
  type AnatixWidgetOptions,
  type AnatixWidgetSize,
  type AnatixWidgetType,
} from "@/types/anatix.types";

export type WidgetOptionKey =
  | "transform"
  | "step"
  | "stacked"
  | "stats"
  | "horizontal"
  | "bins"
  | "limits"
  | "unit"
  | "target"
  | "machine"
  | "bucketMs";

export interface WidgetSpec {
  type: AnatixWidgetType;
  group: "chart" | "table";
  label: string;
  description: string;
  /** Quantas métricas o bloco usa (0 = nenhuma; usa estados/eventos). */
  metrics: { min: number; max: number; labels?: string[] };
  /** Usa janela de tempo? */
  windowed: boolean;
  options: WidgetOptionKey[];
  defaultSize: AnatixWidgetSize;
  defaults?: AnatixWidgetOptions;
}

export const WIDGET_SPECS: WidgetSpec[] = [
  {
    type: "line",
    group: "chart",
    label: "Linhas no tempo",
    description: "Uma ou mais métricas ao longo do tempo, com suavização, derivada ou normalização.",
    metrics: { min: 1, max: 8 },
    windowed: true,
    options: ["transform", "step", "target", "unit"],
    defaultSize: "lg",
    defaults: { transform: "raw", smoothN: 5 },
  },
  {
    type: "area",
    group: "chart",
    label: "Área",
    description: "Como o gráfico de linhas, preenchido. Empilhe para ver a soma das métricas.",
    metrics: { min: 1, max: 6 },
    windowed: true,
    options: ["transform", "stacked", "target", "unit"],
    defaultSize: "lg",
    defaults: { transform: "raw", smoothN: 5 },
  },
  {
    type: "bars",
    group: "chart",
    label: "Barras de estatísticas",
    description: "Compara mínimo, média, máximo, mediana, desvio… entre métricas.",
    metrics: { min: 1, max: 12 },
    windowed: true,
    options: ["stats", "horizontal"],
    defaultSize: "md",
    defaults: { stats: ["avg", "max"] },
  },
  {
    type: "scatter",
    group: "chart",
    label: "Dispersão X × Y",
    description: "Cruza duas métricas pelo tempo (posição, erro × correção…). Cores mostram o tempo.",
    metrics: { min: 2, max: 2, labels: ["Eixo X", "Eixo Y"] },
    windowed: true,
    options: [],
    defaultSize: "md",
  },
  {
    type: "histogram",
    group: "chart",
    label: "Histograma",
    description: "Distribuição dos valores de uma métrica: onde ela passa a maior parte do tempo.",
    metrics: { min: 1, max: 1 },
    windowed: true,
    options: ["bins", "target", "unit"],
    defaultSize: "md",
    defaults: { bins: 20 },
  },
  {
    type: "gauge",
    group: "chart",
    label: "Medidor",
    description: "Valor atual em um mostrador, com limites fixos ou observados.",
    metrics: { min: 1, max: 1 },
    windowed: false,
    options: ["limits", "target", "unit"],
    defaultSize: "sm",
  },
  {
    type: "kpi",
    group: "chart",
    label: "Indicador",
    description: "Número grande com mini-gráfico e variação na janela.",
    metrics: { min: 1, max: 1 },
    windowed: true,
    options: ["target", "unit"],
    defaultSize: "sm",
  },
  {
    type: "radar",
    group: "chart",
    label: "Radar",
    description: "Perfil das métricas: cada eixo mostra onde o valor atual está entre o mín. e o máx.",
    metrics: { min: 3, max: 10 },
    windowed: true,
    options: [],
    defaultSize: "md",
  },
  {
    type: "state-pie",
    group: "chart",
    label: "Tempo em cada estado",
    description: "Rosca com a fatia de tempo que uma máquina de estados (ANX_STATE) passou em cada estado.",
    metrics: { min: 0, max: 0 },
    windowed: true,
    options: ["machine"],
    defaultSize: "sm",
  },
  {
    type: "event-rate",
    group: "chart",
    label: "Eventos no tempo",
    description: "Quantos eventos (ANX_EVENT) aconteceram em cada bloco de tempo.",
    metrics: { min: 0, max: 0 },
    windowed: true,
    options: ["bins", "stacked"],
    defaultSize: "md",
    defaults: { bins: 30, stacked: true },
  },
  {
    type: "table-stats",
    group: "table",
    label: "Estatísticas completas",
    description: "Mínimo, máximo, média, mediana, desvio padrão, percentis e taxa de amostras.",
    metrics: { min: 0, max: 16 },
    windowed: true,
    options: [],
    defaultSize: "full",
  },
  {
    type: "table-samples",
    group: "table",
    label: "Amostras lado a lado",
    description: "Uma linha por intervalo de tempo e uma coluna por métrica. Exporta CSV.",
    metrics: { min: 1, max: 8 },
    windowed: true,
    options: ["bucketMs"],
    defaultSize: "lg",
    defaults: { bucketMs: 250 },
  },
  {
    type: "table-correlation",
    group: "table",
    label: "Matriz de correlação",
    description: "Quanto as métricas sobem e descem juntas (Pearson, de −1 a 1).",
    metrics: { min: 0, max: 10 },
    windowed: true,
    options: ["bucketMs"],
    defaultSize: "md",
    defaults: { bucketMs: 100 },
  },
  {
    type: "table-transitions",
    group: "table",
    label: "Histórico de estados",
    description: "Cada troca de estado com horário e quanto tempo durou.",
    metrics: { min: 0, max: 0 },
    windowed: true,
    options: ["machine"],
    defaultSize: "md",
  },
  {
    type: "table-events",
    group: "table",
    label: "Resumo de eventos",
    description: "Por evento: total, primeiro, último, intervalo médio e dado médio.",
    metrics: { min: 0, max: 0 },
    windowed: true,
    options: [],
    defaultSize: "md",
  },
];

export const WIDGET_SPEC = Object.fromEntries(WIDGET_SPECS.map((s) => [s.type, s])) as Record<
  AnatixWidgetType,
  WidgetSpec
>;

export const WIDGET_SIZES: { key: AnatixWidgetSize; label: string }[] = [
  { key: "sm", label: "1/4" },
  { key: "md", label: "1/2" },
  { key: "lg", label: "3/4" },
  { key: "full", label: "Inteiro" },
];

export const WIDGET_WINDOWS: { label: string; value: number | null }[] = [
  { label: "5 s", value: 5 },
  { label: "10 s", value: 10 },
  { label: "30 s", value: 30 },
  { label: "60 s", value: 60 },
  { label: "5 min", value: 300 },
  { label: "Tudo", value: null },
];

export const STAT_LABEL: Record<AnatixStatKey, string> = {
  last: "Último",
  avg: "Média",
  min: "Mínimo",
  max: "Máximo",
  median: "Mediana",
  std: "Desvio padrão",
  p95: "Percentil 95",
  range: "Amplitude",
};

export const TRANSFORM_LABEL: Record<AnatixSeriesTransform, string> = {
  raw: "Valor bruto",
  smooth: "Média móvel",
  derivative: "Taxa de variação (/s)",
  normalize: "Normalizado (0–1)",
};

export const BUCKET_OPTIONS = [50, 100, 250, 500, 1000, 5000];

let seq = 0;
export function newWidgetId() {
  seq = (seq + 1) % 1e6;
  return `w${Date.now().toString(36)}${seq.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function createWidget(type: AnatixWidgetType, metrics: string[] = []): AnatixWidget {
  const spec = WIDGET_SPEC[type];
  return {
    id: newWidgetId(),
    type,
    title: spec.label,
    metrics: metrics.slice(0, spec.metrics.max),
    size: spec.defaultSize,
    windowSec: spec.windowed ? 30 : null,
    options: { ...(spec.defaults ?? {}) },
  };
}

// ---------------------------------------------------------------------------
// Modelos prontos
// ---------------------------------------------------------------------------

export interface DashboardPreset {
  key: string;
  label: string;
  description: string;
  build: (metrics: string[]) => AnatixWidget[];
}

const pick = (metrics: string[], re: RegExp, fallback: number) =>
  metrics.find((m) => re.test(m)) ?? metrics[fallback] ?? null;

function titled(w: AnatixWidget, title: string, patch: Partial<AnatixWidget> = {}) {
  return { ...w, title, ...patch, options: { ...w.options, ...(patch.options ?? {}) } };
}

export const DASHBOARD_PRESETS: DashboardPreset[] = [
  {
    key: "overview",
    label: "Visão geral",
    description: "Indicadores das principais métricas, linhas no tempo e estatísticas.",
    build: (metrics) => [
      ...metrics.slice(0, 4).map((m) => titled(createWidget("kpi", [m]), m)),
      createWidget("line", metrics.slice(0, 4)),
      titled(createWidget("bars", metrics.slice(0, 6)), "Comparação", { size: "sm" }),
      createWidget("table-stats", []),
    ],
  },
  {
    key: "pid",
    label: "Controle (PID / seguidor)",
    description: "Erro suavizado, distribuição do erro, correção e correlação entre sinais.",
    build: (metrics) => {
      const error = pick(metrics, /err|erro/i, 0);
      const correction = pick(metrics, /corr|out|pid|steer|turn/i, 1);
      const signals = [error, correction].filter((m): m is string => !!m);
      return [
        titled(createWidget("line", signals), "Erro × correção", {
          options: { transform: "smooth", smoothN: 5, target: 0 },
        }),
        ...(error
          ? [
              titled(createWidget("kpi", [error]), `${error} agora`, { options: { target: 0 } }),
              titled(createWidget("histogram", [error]), `Distribuição de ${error}`, {
                options: { bins: 24, target: 0 },
              }),
            ]
          : []),
        ...(signals.length === 2
          ? [titled(createWidget("scatter", signals), `${signals[0]} × ${signals[1]}`)]
          : []),
        titled(createWidget("table-correlation", metrics.slice(0, 6)), "Correlação"),
      ];
    },
  },
  {
    key: "navigation",
    label: "Navegação",
    description: "Trajetória XY, velocidades, tempo em cada estado e histórico de estados.",
    build: (metrics) => {
      const x = pick(metrics, /(^|_)x$/i, 0);
      const y = pick(metrics, /(^|_)y$/i, 1);
      const speed = metrics.filter((m) => /vel|speed|rpm|motor/i.test(m)).slice(0, 4);
      return [
        ...(x && y && x !== y ? [titled(createWidget("scatter", [x, y]), "Trajetória", { windowSec: null })] : []),
        titled(createWidget("area", speed.length ? speed : metrics.slice(0, 3)), "Velocidades"),
        createWidget("state-pie"),
        createWidget("table-transitions"),
      ];
    },
  },
  {
    key: "sensors",
    label: "Sensores",
    description: "Medidores, radar do perfil atual e amostras lado a lado.",
    build: (metrics) => [
      ...metrics.slice(0, 4).map((m) => titled(createWidget("gauge", [m]), m)),
      ...(metrics.length >= 3 ? [titled(createWidget("radar", metrics.slice(0, 8)), "Perfil dos sensores")] : []),
      createWidget("table-samples", metrics.slice(0, 6)),
    ],
  },
  {
    key: "events",
    label: "Eventos e estados",
    description: "Ritmo dos eventos, resumo por evento e tempo em cada estado.",
    build: () => [
      titled(createWidget("event-rate"), "Eventos no tempo", { size: "lg", windowSec: null }),
      titled(createWidget("state-pie"), "Estados", { windowSec: null }),
      titled(createWidget("table-events"), "Resumo de eventos", { windowSec: null }),
      titled(createWidget("table-transitions"), "Histórico de estados", { windowSec: null }),
    ],
  },
];

// ---------------------------------------------------------------------------
// Validação (jsonb → AnatixWidget[])
// ---------------------------------------------------------------------------

const STAT_KEYS = Object.keys(STAT_LABEL) as AnatixStatKey[];
const TRANSFORMS = Object.keys(TRANSFORM_LABEL) as AnatixSeriesTransform[];
const SIZES = WIDGET_SIZES.map((s) => s.key);

const finite = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const clampInt = (v: unknown, lo: number, hi: number) => {
  const n = finite(v);
  return n === null ? undefined : Math.min(hi, Math.max(lo, Math.round(n)));
};
const shortStr = (v: unknown, max: number) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

function normalizeOptions(raw: unknown): AnatixWidgetOptions {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const out: AnatixWidgetOptions = {};
  if (TRANSFORMS.includes(o.transform as AnatixSeriesTransform)) {
    out.transform = o.transform as AnatixSeriesTransform;
  }
  const smoothN = clampInt(o.smoothN, 2, 200);
  if (smoothN !== undefined) out.smoothN = smoothN;
  if (typeof o.step === "boolean") out.step = o.step;
  if (typeof o.stacked === "boolean") out.stacked = o.stacked;
  if (typeof o.horizontal === "boolean") out.horizontal = o.horizontal;
  if (Array.isArray(o.stats)) {
    const stats = [...new Set(o.stats.filter((s): s is AnatixStatKey => STAT_KEYS.includes(s)))];
    if (stats.length) out.stats = stats;
  }
  const bins = clampInt(o.bins, 4, 80);
  if (bins !== undefined) out.bins = bins;
  if ("min" in o) out.min = finite(o.min);
  if ("max" in o) out.max = finite(o.max);
  if ("target" in o) out.target = finite(o.target);
  const unit = shortStr(o.unit, 12);
  if (unit) out.unit = unit;
  const machine = shortStr(o.machine, 80);
  if (machine) out.machine = machine;
  const bucketMs = clampInt(o.bucketMs, 10, 60_000);
  if (bucketMs !== undefined) out.bucketMs = bucketMs;
  return out;
}

export function normalizeWidget(raw: unknown): AnatixWidget | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const spec = WIDGET_SPEC[o.type as AnatixWidgetType];
  if (!spec) return null;
  const metrics = Array.isArray(o.metrics)
    ? o.metrics
        .filter((m): m is string => typeof m === "string" && m.trim() !== "")
        .map((m) => m.slice(0, 80))
        .slice(0, spec.metrics.max)
    : [];
  const windowSec = o.windowSec === null ? null : clampInt(o.windowSec, 1, 86_400);
  return {
    id: shortStr(o.id, 40) ?? newWidgetId(),
    type: spec.type,
    title: shortStr(o.title, 80) ?? spec.label,
    metrics,
    size: SIZES.includes(o.size as AnatixWidgetSize) ? (o.size as AnatixWidgetSize) : spec.defaultSize,
    windowSec: windowSec === undefined ? (spec.windowed ? 30 : null) : windowSec,
    options: normalizeOptions(o.options),
  };
}

export function normalizeDashboard(raw: unknown): AnatixWidget[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: AnatixWidget[] = [];
  for (const item of raw) {
    const w = normalizeWidget(item);
    if (!w) continue;
    if (seen.has(w.id)) w.id = newWidgetId();
    seen.add(w.id);
    out.push(w);
    if (out.length >= ANATIX_MAX_WIDGETS) break;
  }
  return out;
}
