/**
 * Cores de tags e milestones (código puro — pode ser usado no cliente e no
 * servidor). A cor é sempre um hex `#rrggbb`: é o "fundo" da etiqueta; a cor
 * do texto é calculada para manter o contraste.
 */

export const LABEL_PALETTE: { value: string; name: string }[] = [
  { value: "#64748b", name: "Ardósia" },
  { value: "#ef4444", name: "Vermelho" },
  { value: "#f97316", name: "Laranja" },
  { value: "#eab308", name: "Amarelo" },
  { value: "#22c55e", name: "Verde" },
  { value: "#14b8a6", name: "Turquesa" },
  { value: "#0ea5e9", name: "Azul-claro" },
  { value: "#3b82f6", name: "Azul" },
  { value: "#6366f1", name: "Índigo" },
  { value: "#a855f7", name: "Roxo" },
  { value: "#ec4899", name: "Rosa" },
  { value: "#92400e", name: "Marrom" },
];

const HEX_RE = /^#[0-9a-f]{6}$/i;

export function isValidHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_RE.test(value);
}

/** Aceita "#abc", "abc", "#AABBCC"… e devolve "#aabbcc" (ou null se inválido). */
export function normalizeHexColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let v = value.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(v)) v = v.split("").map((c) => c + c).join("");
  return /^[0-9a-f]{6}$/i.test(v) ? `#${v.toLowerCase()}` : null;
}

function hashString(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

/** Cor da tag: a escolhida pelo usuário ou, se não houver, uma da paleta pelo nome. */
export function resolveLabelColor(color: string | null | undefined, seed: string): string {
  if (color && isValidHexColor(color)) return color.toLowerCase();
  return LABEL_PALETTE[hashString(seed.toLowerCase()) % LABEL_PALETTE.length].value;
}

/** Preto ou branco, o que tiver mais contraste com o fundo (WCAG). */
export function readableTextColor(background: string): "#111827" | "#ffffff" {
  const hex = normalizeHexColor(background) ?? "#64748b";
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const luminance = 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
  const DARK_TEXT_LUMINANCE = 0.0097; // luminância relativa de #111827
  const withWhite = 1.05 / (luminance + 0.05);
  const withDark = (luminance + 0.05) / (DARK_TEXT_LUMINANCE + 0.05);
  return withWhite >= withDark ? "#ffffff" : "#111827";
}
