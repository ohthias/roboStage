// ---------------------------------------------------------------------------
// Decodificador do protocolo Anatix v1 (texto, uma mensagem por linha):
//   $ANX,<tipo>,<millis>,<campos...>*<CK>
// CK = XOR dos bytes entre "$" e "*" (exclusive), 2 dígitos hex maiúsculos.
// Linhas sem "$ANX," são saída comum do robô (console).
// ---------------------------------------------------------------------------

import type {
  AnatixFrame,
  AnatixLabConfig,
  AnatixParsed,
} from "@/types/anatix.types";
import { DEFAULT_ANATIX_CONFIG, ANATIX_BAUD_RATES } from "@/types/anatix.types";

export const ANATIX_COMMANDS = {
  ping: "ANX PING",
  hello: "ANX HELLO",
  stop: "ANX STOP",
  reset: "ANX RESET",
  rate: (ms: number) => `ANX RATE ${Math.min(10000, Math.max(20, Math.round(ms)))}`,
} as const;

/** Intervalo recomendado entre PINGs (o robô para após 2000 ms sem PING). */
export const ANATIX_PING_MS = 500;
/** Tempo sem frame H/dados até considerarmos que não há robô Anatix na porta. */
export const ANATIX_HANDSHAKE_TIMEOUT_MS = 6000;

export function anatixChecksum(body: string): string {
  let ck = 0;
  for (let i = 0; i < body.length; i++) ck ^= body.charCodeAt(i) & 0xff;
  return ck.toString(16).toUpperCase().padStart(2, "0");
}

function num(value: string | undefined): number {
  if (value === undefined) return NaN;
  const v = value.trim().toLowerCase();
  if (v === "nan") return NaN;
  if (v === "inf" || v === "+inf") return Infinity;
  if (v === "-inf") return -Infinity;
  return Number(v);
}

export function parseAnatixLine(rawLine: string): AnatixParsed | null {
  const line = rawLine.replace(/\r$/, "");
  if (!line.trim()) return null;

  const start = line.indexOf("$ANX,");
  if (start < 0) return { kind: "console", text: line };

  const star = line.lastIndexOf("*");
  if (star <= start) return { kind: "invalid", raw: line };

  const body = line.slice(start + 1, star);
  const ck = line.slice(star + 1, star + 3).toUpperCase();
  if (anatixChecksum(body) !== ck) return { kind: "invalid", raw: line };

  const fields = body.split(",");
  const type = fields[1];
  const t = num(fields[2]);
  if (!Number.isFinite(t)) return { kind: "invalid", raw: line };

  let frame: AnatixFrame | null = null;
  switch (type) {
    case "H":
      frame = {
        k: "H",
        t,
        version: num(fields[3]),
        robot: fields[4] ?? "",
        board: fields[5] ?? "",
        periodMs: num(fields[6]),
      };
      break;
    case "V":
      frame = { k: "V", t, name: fields[3] ?? "", value: num(fields[4]) };
      break;
    case "E":
      frame = { k: "E", t, name: fields[3] ?? "", data: num(fields[4]) || 0 };
      break;
    case "S":
      frame = { k: "S", t, machine: fields[3] ?? "", state: fields[4] ?? "" };
      break;
    case "T":
      frame = {
        k: "T",
        t,
        section: fields[3] ?? "",
        runs: num(fields[4]),
        avgUs: num(fields[5]),
        maxUs: num(fields[6]),
      };
      break;
    case "L":
      frame = {
        k: "L",
        t,
        lps: num(fields[3]),
        avgUs: num(fields[4]),
        maxUs: num(fields[5]),
        freeRam: num(fields[6]),
        dropped: num(fields[7]),
      };
      break;
    case "M":
      // O texto é o último campo e pode conter vírgulas.
      frame = { k: "M", t, text: fields.slice(3).join(",") };
      break;
  }

  return frame ? { kind: "frame", frame } : { kind: "invalid", raw: line };
}

/** Lê o jsonb do banco e devolve uma configuração sempre completa. */
export function normalizeAnatixConfig(raw: unknown): AnatixLabConfig {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const views = (obj.views && typeof obj.views === "object" ? obj.views : {}) as Record<string, unknown>;
  const baud = Number(obj.baudRate);
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

  return {
    baudRate: (ANATIX_BAUD_RATES as readonly number[]).includes(baud)
      ? baud
      : DEFAULT_ANATIX_CONFIG.baudRate,
    views: {
      charts: views.charts !== false,
      maps: views.maps !== false,
      tables: views.tables !== false,
    },
    chartMetrics: Array.isArray(obj.chartMetrics)
      ? obj.chartMetrics.filter((m): m is string => typeof m === "string").slice(0, 16)
      : [],
    mapX: str(obj.mapX),
    mapY: str(obj.mapY),
  };
}
