/**
 * Formato do ícone de página, guardado na coluna `icon` (texto) — sem migração:
 *
 *   "🚀"                                  → emoji simples (formato antigo, continua válido)
 *   "emo:🚀;b=blue;m=solid;s=circle"       → emoji com fundo
 *   "ico:rocket;c=red;b=yellow;m=soft;s=round" → ícone vetorial com cor e fundo
 *
 *   c = cor do ícone (id da paleta)         b = fundo (id da paleta ou "g:<gradiente>")
 *   m = soft | solid (só para fundo de paleta)   s = round | circle | none
 *
 * Este arquivo é puro (sem React) para poder validar a entrada também no servidor.
 */
import { SWATCHES } from "@/components/editor/editor-colors";

export type DocIconKind = "emoji" | "icon";
export type DocIconMode = "soft" | "solid";
export type DocIconShape = "round" | "circle" | "none";

export type DocIconValue = {
  kind: DocIconKind;
  value: string;
  color: string | null;
  bg: string | null;
  mode: DocIconMode;
  shape: DocIconShape;
};

export const GRADIENTS = [
  { id: "sunset", label: "Pôr do sol" },
  { id: "ocean", label: "Oceano" },
  { id: "forest", label: "Floresta" },
  { id: "aurora", label: "Aurora" },
  { id: "candy", label: "Doce" },
  { id: "night", label: "Noite" },
] as const;

const PALETTE_IDS = new Set(SWATCHES.map((s) => s.id));
const GRADIENT_IDS = new Set<string>(GRADIENTS.map((g) => g.id));
const MAX_LEN = 120;

export const defaultDocIcon = (kind: DocIconKind, value: string): DocIconValue => ({
  kind,
  value,
  color: null,
  bg: null,
  mode: "soft",
  shape: "none",
});

function validBg(v: string | undefined): string | null {
  if (!v) return null;
  if (PALETTE_IDS.has(v)) return v;
  if (v.startsWith("g:") && GRADIENT_IDS.has(v.slice(2))) return v;
  return null;
}

export function parseDocIcon(raw: string | null | undefined): DocIconValue | null {
  if (!raw) return null;
  const text = raw.trim().slice(0, MAX_LEN);
  if (!text) return null;

  const m = text.match(/^(emo|ico):([\s\S]*)$/);
  if (!m) {
    // Formato antigo: emoji puro.
    return defaultDocIcon("emoji", text.slice(0, 16));
  }

  const [head, ...rest] = m[2].split(";");
  const kind: DocIconKind = m[1] === "ico" ? "icon" : "emoji";
  const value = kind === "icon" ? head.toLowerCase() : head;
  if (kind === "icon" && !/^[a-z0-9-]{1,40}$/.test(value)) return null;
  if (kind === "emoji" && (!value || value.length > 16)) return null;

  const opts: Record<string, string> = {};
  rest.forEach((p) => {
    const i = p.indexOf("=");
    if (i > 0) opts[p.slice(0, i)] = p.slice(i + 1);
  });

  const bg = validBg(opts.b);
  const shape: DocIconShape =
    opts.s === "circle" || opts.s === "round" || opts.s === "none" ? opts.s : bg ? "round" : "none";
  return {
    kind,
    value,
    color: opts.c && PALETTE_IDS.has(opts.c) ? opts.c : null,
    bg,
    mode: opts.m === "solid" ? "solid" : "soft",
    shape,
  };
}

export function serializeDocIcon(v: DocIconValue | null): string | null {
  if (!v) return null;
  const plain = v.kind === "emoji" && !v.color && !v.bg;
  if (plain) return v.value;
  const parts = [`${v.kind === "icon" ? "ico" : "emo"}:${v.value}`];
  if (v.color) parts.push(`c=${v.color}`);
  if (v.bg) {
    parts.push(`b=${v.bg}`);
    if (!v.bg.startsWith("g:")) parts.push(`m=${v.mode}`);
  }
  parts.push(`s=${v.shape}`);
  return parts.join(";");
}

/** Usado nas server actions: devolve uma string segura ou null. */
export function sanitizeDocIcon(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  return serializeDocIcon(parseDocIcon(raw));
}
