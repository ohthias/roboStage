/**
 * Fontes do editor de páginas do Stagebook. Sem dependências: usado pelo
 * editor (seletor de fonte e fonte da página), pelas actions (validação) e
 * pelo layout (que carrega os arquivos de fonte com next/font).
 *
 * As famílias apontam para variáveis CSS definidas no layout de documentos,
 * com alternativas do sistema caso o arquivo ainda não tenha carregado.
 */
export type DocFontId = "default" | "sans" | "serif" | "mono" | "hand";

export type DocFont = {
  id: DocFontId;
  label: string;
  /** Valor de `font-family` (null = herda a fonte padrão do app). */
  family: string | null;
};

export const DOC_FONTS: DocFont[] = [
  { id: "default", label: "Padrão", family: null },
  {
    id: "sans",
    label: "Sans",
    family: "var(--font-doc-sans), ui-sans-serif, system-ui, sans-serif",
  },
  {
    id: "serif",
    label: "Serifa",
    family: "var(--font-doc-serif), Georgia, 'Times New Roman', serif",
  },
  {
    id: "mono",
    label: "Mono",
    family: "var(--font-doc-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
  },
  {
    id: "hand",
    label: "Manuscrita",
    family: "var(--font-doc-hand), 'Comic Sans MS', cursive",
  },
];

export function isDocFontId(value: unknown): value is DocFontId {
  return typeof value === "string" && DOC_FONTS.some((font) => font.id === value);
}

export function docFontFamily(id: string | null | undefined): string | null {
  return DOC_FONTS.find((font) => font.id === id)?.family ?? null;
}

/** Descobre qual fonte da lista corresponde a um `font-family` salvo no texto. */
export function docFontFromFamily(family: string | null | undefined): DocFont | null {
  if (!family) return null;
  return DOC_FONTS.find((font) => font.family === family) ?? null;
}
