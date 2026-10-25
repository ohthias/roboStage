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

export type AnatixViewKey = "charts" | "maps" | "tables";

export interface AnatixLabConfig {
  baudRate: number;
  views: Record<AnatixViewKey, boolean>;
  /** Métricas mostradas no gráfico de linhas (vazio = todas). */
  chartMetrics: string[];
  /** Eixos do mapa XY (ex.: pos_x × pos_y). */
  mapX: string | null;
  mapY: string | null;
}

export const ANATIX_BAUD_RATES = [9600, 57600, 115200, 250000, 500000, 1000000] as const;

export const DEFAULT_ANATIX_CONFIG: AnatixLabConfig = {
  baudRate: 115200,
  views: { charts: true, maps: true, tables: true },
  chartMetrics: [],
  mapX: null,
  mapY: null,
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
