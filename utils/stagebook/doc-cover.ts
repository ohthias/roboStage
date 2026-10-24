/**
 * Formato da capa da página, guardado na coluna `cover` (texto) — sem migração:
 *
 *   "#cf2a2a"              → cor sólida (formato antigo, continua válido)
 *   "pal:blue;m=solid"      → cor da paleta do editor (m = soft | solid)
 *   "grad:ocean"            → gradiente (os mesmos dos ícones)
 *   "img:montanhas"         → uma das imagens prontas em /public/covers
 *
 * Puro (sem React): usado também para validar a entrada no servidor.
 */
import { SWATCHES } from "@/components/editor/editor-colors";
import { GRADIENTS } from "./doc-icon";

export const COVER_IMAGES = [
  { id: "montanhas", label: "Montanhas ao pôr do sol" },
  { id: "oceano", label: "Ondas do oceano" },
  { id: "aurora", label: "Aurora boreal" },
  { id: "floresta", label: "Floresta com névoa" },
  { id: "geometrico", label: "Formas geométricas" },
] as const;

export type DocCoverValue =
  | { kind: "color"; hex: string }
  | { kind: "palette"; id: string; mode: "soft" | "solid" }
  | { kind: "gradient"; id: string }
  | { kind: "image"; id: string };

const PALETTE = new Set(SWATCHES.map((s) => s.id));
const GRADS = new Set<string>(GRADIENTS.map((g) => g.id));
const IMAGES = new Set<string>(COVER_IMAGES.map((i) => i.id));
const HEX = /^#[0-9a-fA-F]{6}$/;

export const coverImageUrl = (id: string) => `/covers/${id}.svg`;

export function parseDocCover(raw: string | null | undefined): DocCoverValue | null {
  if (!raw) return null;
  const text = raw.trim().slice(0, 80);
  if (HEX.test(text)) return { kind: "color", hex: text };

  const m = text.match(/^(pal|grad|img):([a-z0-9-]+)(?:;m=(soft|solid))?$/);
  if (!m) return null;
  const [, type, id, mode] = m;
  if (type === "pal" && PALETTE.has(id)) return { kind: "palette", id, mode: mode === "solid" ? "solid" : "soft" };
  if (type === "grad" && GRADS.has(id)) return { kind: "gradient", id };
  if (type === "img" && IMAGES.has(id)) return { kind: "image", id };
  return null;
}

export function serializeDocCover(v: DocCoverValue | null): string | null {
  if (!v) return null;
  switch (v.kind) {
    case "color":
      return v.hex;
    case "palette":
      return `pal:${v.id};m=${v.mode}`;
    case "gradient":
      return `grad:${v.id}`;
    case "image":
      return `img:${v.id}`;
  }
}

/** Server actions: devolve uma string segura ou null. */
export function sanitizeDocCover(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  return serializeDocCover(parseDocCover(raw));
}
