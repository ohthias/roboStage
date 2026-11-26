/**
 * Paleta única do editor (texto, fundo e divisor).
 *
 * As cores são guardadas como referências a variáveis CSS (`var(--ed-red-text)`),
 * definidas em editor.css com `light-dark()`. Assim o mesmo documento mantém
 * contraste tanto no tema claro quanto no escuro.
 */
export type Swatch = {
  id: string;
  label: string;
};

export const SWATCHES: Swatch[] = [
  { id: "gray", label: "Cinza" },
  { id: "brown", label: "Marrom" },
  { id: "orange", label: "Laranja" },
  { id: "yellow", label: "Amarelo" },
  { id: "green", label: "Verde" },
  { id: "teal", label: "Turquesa" },
  { id: "blue", label: "Azul" },
  { id: "purple", label: "Roxo" },
  { id: "pink", label: "Rosa" },
  { id: "red", label: "Vermelho" },
];

/** Cor do texto (forte, legível sobre o fundo da página). */
export const textVar = (id: string) => `var(--ed-${id}-text)`;
/** Fundo suave (marca-texto) — mantém o texto padrão legível. */
export const bgVar = (id: string) => `var(--ed-${id}-bg)`;
/** Fundo sólido de alto contraste. */
export const solidVar = (id: string) => `var(--ed-${id}-solid)`;
/** Texto que combina com o fundo sólido. */
export const onSolidVar = (id: string) => `var(--ed-${id}-on)`;

/** Combinações prontas (fundo + texto) com contraste AA garantido. */
export const COMBOS: { id: string; label: string; bg: string; color: string }[] = [
  { id: "yellow", label: "Destaque amarelo", bg: solidVar("yellow"), color: onSolidVar("yellow") },
  { id: "orange", label: "Destaque laranja", bg: solidVar("orange"), color: onSolidVar("orange") },
  { id: "green", label: "Destaque verde", bg: solidVar("green"), color: onSolidVar("green") },
  { id: "teal", label: "Destaque turquesa", bg: solidVar("teal"), color: onSolidVar("teal") },
  { id: "blue", label: "Destaque azul", bg: solidVar("blue"), color: onSolidVar("blue") },
  { id: "purple", label: "Destaque roxo", bg: solidVar("purple"), color: onSolidVar("purple") },
  { id: "red", label: "Destaque vermelho", bg: solidVar("red"), color: onSolidVar("red") },
  { id: "gray", label: "Destaque neutro", bg: solidVar("gray"), color: onSolidVar("gray") },
];

export const DEFAULT_DIVIDER_COLOR = "var(--ed-divider-default)";
