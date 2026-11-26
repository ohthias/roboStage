// ---------------------------------------------------------------------------
// Tipos do Anatix (protocolo v1 — ver github.com/ohthias/Anatix_C/docs/PROTOCOLO.md)
// ---------------------------------------------------------------------------

export type AnatixFrame =
  | { k: "H"; t: number; version: number; robot: string; board: string; periodMs: number }
  | { k: "V"; t: number; name: string; value: number }
  | { k: "E"; t: number; name: string; data: number }
  | { k: "S"; t: number; machine: string; state: string }
  | { k: "T"; t: number; section: string; runs: number; avgUs: number; maxUs: number }
  | { k: "L"; t: number; lps: number; avgUs: number; maxUs: number; freeRam: number; dropped: number }
  | { k: "M"; t: number; text: string };

export type AnatixParsed =
  | { kind: "frame"; frame: AnatixFrame }
  | { kind: "console"; text: string }
  | { kind: "invalid"; raw: string };

export type AnatixViewKey = "custom" | "charts" | "maps" | "tables";

// ---------------------------------------------------------------------------
// Painel personalizado: cada laboratório guarda uma lista de blocos (widgets)
// que o usuário monta, edita, reordena e redimensiona como quiser.
// ---------------------------------------------------------------------------

export type AnatixWidgetType =
  // Gráficos
  | "line"
  | "area"
  | "bars"
  | "scatter"
  | "histogram"
  | "gauge"
  | "kpi"
  | "radar"
  | "state-pie"
  | "event-rate"
  // Tabelas
  | "table-stats"
  | "table-samples"
  | "table-correlation"
  | "table-transitions"
  | "table-events";

export type AnatixWidgetSize = "sm" | "md" | "lg" | "full";

/** Transformação aplicada às séries antes de desenhar (linha/área). */
export type AnatixSeriesTransform = "raw" | "smooth" | "derivative" | "normalize";

/** Estatística usada nos gráficos de barras. */
export type AnatixStatKey = "last" | "avg" | "min" | "max" | "median" | "std" | "p95" | "range";

export interface AnatixWidgetOptions {
  transform?: AnatixSeriesTransform;
  /** Janela da média móvel (amostras) quando transform = "smooth". */
  smoothN?: number;
  /** Linhas em degrau. */
  step?: boolean;
  /** Áreas empilhadas. */
  stacked?: boolean;
  /** Estatísticas mostradas no gráfico de barras. */
  stats?: AnatixStatKey[];
  /** Barras na horizontal. */
  horizontal?: boolean;
  /** Número de faixas do histograma / blocos de tempo. */
  bins?: number;
  /** Limites fixos (medidor). Vazio = mínimo/máximo observado. */
  min?: number | null;
  max?: number | null;
  /** Unidade exibida (ex.: "cm", "°"). */
  unit?: string;
  /** Meta/linha de referência (linha, área, KPI, medidor). */
  target?: number | null;
  /** Máquina de estados (pizza de estados / transições). */
  machine?: string | null;
  /** Intervalo de agrupamento das tabelas de amostras, em ms. */
  bucketMs?: number;
}

export interface AnatixWidget {
  id: string;
  type: AnatixWidgetType;
  title: string;
  /** Métricas (ANX_VALUE). No mapa XY: [x, y]. Vazio = automático. */
  metrics: string[];
  size: AnatixWidgetSize;
  /** Janela de tempo em segundos (null = sessão inteira). */
  windowSec: number | null;
  options: AnatixWidgetOptions;
}

export const ANATIX_MAX_WIDGETS = 24;

/**
 * Como o robô se conecta:
 *  - serial:   Arduino/ESP32… com a biblioteca Anatix_C, pelo cabo USB (Web Serial);
 *  - pybricks: hub LEGO com Pybricks e o anatix.py, por Bluetooth ou cabo USB (FLL).
 */
export type AnatixTransport = "serial" | "pybricks";

export const ANATIX_TRANSPORTS: AnatixTransport[] = ["serial", "pybricks"];

export interface AnatixLabConfig {
  transport: AnatixTransport;
  /** Só vale para `serial`. */
  baudRate: number;
  views: Record<AnatixViewKey, boolean>;
  /** Métricas mostradas no gráfico de linhas (vazio = todas). */
  chartMetrics: string[];
  /** Eixos do mapa XY (ex.: pos_x × pos_y). */
  mapX: string | null;
  mapY: string | null;
  /** Blocos do painel personalizado, na ordem em que aparecem. */
  dashboard: AnatixWidget[];
}

export const ANATIX_BAUD_RATES = [9600, 57600, 115200, 250000, 500000, 1000000] as const;

export const DEFAULT_ANATIX_CONFIG: AnatixLabConfig = {
  transport: "serial",
  baudRate: 115200,
  views: { custom: true, charts: true, maps: true, tables: true },
  chartMetrics: [],
  mapX: null,
  mapY: null,
  dashboard: [],
};

export interface AnatixMetricSummary {
  min: number;
  max: number;
  avg: number;
  count: number;
  last: number;
}

export interface AnatixSessionSummary {
  metrics: Record<string, AnatixMetricSummary>;
  states: Record<string, string>;
  sections: Record<string, { runs: number; avgUs: number; maxUs: number }>;
  events: Record<string, number>;
  loop?: { lps: number; avgUs: number; maxUs: number; freeRam: number };
}

export interface AnatixLabRecord {
  id: string;
  name: string;
  description: string | null;
  robotName: string | null;
  board: string | null;
  config: AnatixLabConfig;
  lastConnectedAt: string | null;
  createdAt: string;
  sessionCount: number;
}

export interface AnatixSessionRecord {
  id: string;
  robotName: string | null;
  board: string | null;
  baudRate: number | null;
  frameCount: number;
  invalidFrames: number;
  droppedFrames: number;
  summary: AnatixSessionSummary;
  startedAt: string;
  endedAt: string | null;
}
