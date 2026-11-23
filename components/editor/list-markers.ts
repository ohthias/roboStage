import { $getState, $setState, createState, type LexicalNode } from "lexical";
import type { ListNode } from "@lexical/list";

/**
 * Estilo do marcador de cada lista (bolinha, seta, estrela, romano…).
 * Fica no próprio nó da lista como NodeState (salvo no JSON em "$.marker"),
 * então documentos antigos continuam válidos e nada muda no banco.
 *
 * Valores: id de um preset abaixo, "c:<texto>" para um marcador livre
 * (ex.: "c:🚀"), ou "" para o padrão do tema.
 */
export const listMarkerState = createState("marker", {
  parse: (value) => (typeof value === "string" ? value.slice(0, 24) : ""),
});

export type MarkerPreset = { id: string; label: string; preview: string; css: string };

export const BULLET_MARKERS: MarkerPreset[] = [
  { id: "disc", label: "Bolinha", preview: "•", css: "disc" },
  { id: "circle", label: "Círculo", preview: "◦", css: "circle" },
  { id: "square", label: "Quadrado", preview: "▪", css: "square" },
  { id: "dash", label: "Traço", preview: "–", css: '"–  "' },
  { id: "arrow", label: "Seta", preview: "→", css: '"→  "' },
  { id: "chevron", label: "Divisa", preview: "›", css: '"›  "' },
  { id: "star", label: "Estrela", preview: "★", css: '"★  "' },
  { id: "diamond", label: "Losango", preview: "◆", css: '"◆  "' },
  { id: "check", label: "Visto", preview: "✓", css: '"✓  "' },
];

export const NUMBER_MARKERS: MarkerPreset[] = [
  { id: "decimal", label: "1, 2, 3", preview: "1.", css: "decimal" },
  { id: "decimal-leading-zero", label: "01, 02, 03", preview: "01.", css: "decimal-leading-zero" },
  { id: "lower-alpha", label: "a, b, c", preview: "a.", css: "lower-alpha" },
  { id: "upper-alpha", label: "A, B, C", preview: "A.", css: "upper-alpha" },
  { id: "lower-roman", label: "i, ii, iii", preview: "i.", css: "lower-roman" },
  { id: "upper-roman", label: "I, II, III", preview: "I.", css: "upper-roman" },
];

/** Emojis sugeridos como marcador livre. */
export const EMOJI_MARKERS = ["🚀", "🤖", "⭐", "🔥", "✅", "📌", "💡", "👉", "🎯", "⚙️"];

const PRESETS = new Map([...BULLET_MARKERS, ...NUMBER_MARKERS].map((m) => [m.id, m]));

/** Valor CSS de list-style-type para um marcador (null = padrão do tema). */
export function markerToCss(marker: string): string | null {
  if (!marker) return null;
  if (marker.startsWith("c:")) {
    const text = marker.slice(2).replace(/["\\\n]/g, "").trim();
    return text ? `"${text}  "` : null;
  }
  return PRESETS.get(marker)?.css ?? null;
}

/** Texto do marcador para exportação (Markdown/HTML) — null = padrão. */
export function markerToText(marker: string): string | null {
  if (!marker) return null;
  if (marker.startsWith("c:")) return marker.slice(2).trim() || null;
  return PRESETS.get(marker)?.preview ?? null;
}

export function $getListMarker(node: ListNode): string {
  return $getState(node, listMarkerState);
}

export function $setListMarker(node: ListNode, marker: string): void {
  $setState(node, listMarkerState, marker);
}

export function readMarkerFromJSON(node: LexicalNode | { $?: Record<string, unknown> }): string {
  const state = (node as { $?: Record<string, unknown> }).$;
  const value = state?.marker;
  return typeof value === "string" ? value : "";
}
