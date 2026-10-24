/**
 * Paleta de cores do Stagebook para pastas.
 * Mesmas 9 cores usadas nas colunas do Kanban (COLUMN_COLORS) e no Calendário,
 * para manter a identidade visual consistente em todo o dashboard.
 */
export const FOLDER_COLORS = [
  { value: "#64748b", label: "Ardósia" },
  { value: "#2563eb", label: "Azul" },
  { value: "#0891b2", label: "Ciano" },
  { value: "#16a34a", label: "Verde" },
  { value: "#ca8a04", label: "Âmbar" },
  { value: "#ea580c", label: "Laranja" },
  { value: "#dc2626", label: "Vermelho" },
  { value: "#9333ea", label: "Violeta" },
  { value: "#db2777", label: "Rosa" },
] as const;

/** Aceita apenas cores da paleta; qualquer outra coisa vira null (padrão). */
export function sanitizeFolderColor(color: string | null | undefined): string | null {
  if (!color) return null;
  const normalized = color.trim().toLowerCase();
  return FOLDER_COLORS.some((c) => c.value === normalized) ? normalized : null;
}

/** Versão translúcida da cor: funciona em qualquer tema (claro/escuro). */
export function folderTint(color: string, percent: number) {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

/** Estilos inline de uma pasta colorida (fundo, borda, tile do ícone). */
export function folderColorStyles(color: string | null | undefined) {
  if (!color) return null;
  return {
    card: {
      backgroundColor: folderTint(color, 9),
      borderColor: folderTint(color, 38),
    },
    tile: {
      backgroundColor: folderTint(color, 20),
      color,
    },
    accent: { backgroundColor: color },
  } as const;
}
