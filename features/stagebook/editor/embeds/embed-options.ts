import type {
  EmbedAlign,
  EmbedHeight,
  EmbedLayoutOptions,
  LabTestChartType,
  LabTestFilter,
} from "./embed-types";

/**
 * Regras puras (sem React) das opções dos embeds de ThinkLab e LabTest:
 * tamanho/posição, filtros de execuções e partes visíveis do gráfico.
 */

// ---------------------------------------------------------------------------
// Tamanho e posição
// ---------------------------------------------------------------------------

export const MIN_EMBED_WIDTH = 30;
export const MAX_EMBED_WIDTH = 100;

export const WIDTH_PRESETS: { value: number; label: string; title: string }[] = [
  { value: 33, label: "P", title: "Pequeno (1/3)" },
  { value: 50, label: "M", title: "Médio (1/2)" },
  { value: 75, label: "G", title: "Grande (3/4)" },
  { value: 100, label: "100%", title: "Largura inteira" },
];

export const ALIGN_LABELS: Record<EmbedAlign, string> = {
  left: "Esquerda",
  center: "Centro",
  right: "Direita",
};

/** Largura válida (inteiro entre 30 e 100); qualquer lixo vira 100. */
export function clampEmbedWidth(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return MAX_EMBED_WIDTH;
  return Math.round(Math.min(MAX_EMBED_WIDTH, Math.max(MIN_EMBED_WIDTH, n)));
}

export function normalizeEmbedLayout(options: EmbedLayoutOptions | undefined): {
  width: number;
  align: EmbedAlign;
} {
  const align = options?.align;
  return {
    width: options?.width == null ? MAX_EMBED_WIDTH : clampEmbedWidth(options.width),
    align: align === "left" || align === "right" ? align : "center",
  };
}

/** Margens que posicionam o bloco (só fazem efeito com largura < 100%). */
export function embedLayoutStyle(options: EmbedLayoutOptions | undefined): {
  width: string;
  marginLeft: string;
  marginRight: string;
} {
  const { width, align } = normalizeEmbedLayout(options);
  return {
    width: `${width}%`,
    marginLeft: align === "left" ? "0" : "auto",
    marginRight: align === "right" ? "0" : "auto",
  };
}

/**
 * Nova largura (%) durante o arraste da alça. `pointerX` e `rect` em px da
 * tela; `edge` é o lado da alça. No centro o bloco cresce para os dois lados,
 * então a distância até o centro conta em dobro. Encaixa de 5 em 5%.
 */
export function widthFromDrag({
  pointerX,
  blockLeft,
  blockRight,
  containerWidth,
  align,
  edge,
}: {
  pointerX: number;
  blockLeft: number;
  blockRight: number;
  containerWidth: number;
  align: EmbedAlign;
  edge: "left" | "right";
}): number {
  if (containerWidth <= 0) return MAX_EMBED_WIDTH;
  let px: number;
  if (align === "center") {
    const center = (blockLeft + blockRight) / 2;
    px = Math.abs(pointerX - center) * 2;
  } else if (edge === "right") {
    px = pointerX - blockLeft;
  } else {
    px = blockRight - pointerX;
  }
  const pct = (px / containerWidth) * 100;
  return clampEmbedWidth(Math.round(pct / 5) * 5);
}

// ---------------------------------------------------------------------------
// Alturas
// ---------------------------------------------------------------------------

export const HEIGHT_LABELS: Record<EmbedHeight, string> = {
  sm: "Baixa",
  md: "Média",
  lg: "Alta",
  xl: "Muito alta",
};

export const CHART_HEIGHT_PX: Record<EmbedHeight, number> = {
  sm: 180,
  md: 260,
  lg: 360,
  xl: 480,
};

export const THUMB_HEIGHT_CLASS: Record<EmbedHeight, string> = {
  sm: "h-40",
  md: "h-64",
  lg: "h-96",
  xl: "h-[32rem]",
};

export function normalizeHeight(value: unknown, fallback: EmbedHeight = "md"): EmbedHeight {
  return value === "sm" || value === "md" || value === "lg" || value === "xl" ? value : fallback;
}

// ---------------------------------------------------------------------------
// Tipos de gráfico
// ---------------------------------------------------------------------------

export const LABTEST_CHART_TYPES: LabTestChartType[] = [
  "line",
  "area",
  "bar",
  "stacked",
  "step",
  "scatter",
  "radar",
];

export function normalizeChartType(value: unknown): LabTestChartType {
  return LABTEST_CHART_TYPES.includes(value as LabTestChartType)
    ? (value as LabTestChartType)
    : "line";
}

/** Motivo pelo qual um tipo não serve para os dados atuais (ou nada). */
export function chartTypeDisabledReason(
  type: LabTestChartType,
  seriesCount: number,
  rowCount: number,
): string | null {
  if (type === "stacked" && seriesCount < 2) return "precisa de 2 ou mais séries";
  if (type === "radar" && rowCount < 3) return "precisa de 3 ou mais execuções";
  return null;
}

// ---------------------------------------------------------------------------
// Filtros de execuções
// ---------------------------------------------------------------------------

type FilterableEntry = { executionNumber?: number | null; createdAt: string };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Data local (AAAA-MM-DD) de um ISO, para comparar com os campos de data. */
function localDay(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const positiveInt = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.floor(v) : undefined;

/** Remove campos vazios/inválidos; devolve undefined se não sobrar filtro. */
export function cleanLabTestFilter(filter: LabTestFilter | undefined): LabTestFilter | undefined {
  if (!filter) return undefined;
  const out: LabTestFilter = {};
  const last = positiveInt(filter.last);
  if (last) out.last = last;
  const from = positiveInt(filter.fromExec);
  const to = positiveInt(filter.toExec);
  if (from) out.fromExec = from;
  if (to) out.toExec = to;
  if (from && to && from > to) {
    out.fromExec = to;
    out.toExec = from;
  }
  if (filter.dateFrom && DATE_RE.test(filter.dateFrom)) out.dateFrom = filter.dateFrom;
  if (filter.dateTo && DATE_RE.test(filter.dateTo)) out.dateTo = filter.dateTo;
  if (out.dateFrom && out.dateTo && out.dateFrom > out.dateTo) {
    [out.dateFrom, out.dateTo] = [out.dateTo, out.dateFrom];
  }
  const v = filter.value;
  if (v && v.key && (v.op === "gte" || v.op === "lte") && Number.isFinite(v.value)) {
    out.value = { key: v.key, op: v.op, value: v.value };
  }
  return Object.keys(out).length ? out : undefined;
}

/**
 * Aplica os filtros na ordem: intervalo de execuções, datas, condição de
 * valor e, por último, "últimas N". `valueOf` lê o valor da condição.
 */
export function filterLabTestEntries<E extends FilterableEntry>(
  entries: E[],
  filter: LabTestFilter | undefined,
  valueOf?: (entry: E, key: string) => number | null,
): E[] {
  const f = cleanLabTestFilter(filter);
  if (!f) return entries;

  let out = entries.filter((entry, index) => {
    const exec = entry.executionNumber ?? index + 1;
    if (f.fromExec && exec < f.fromExec) return false;
    if (f.toExec && exec > f.toExec) return false;
    if (f.dateFrom || f.dateTo) {
      const day = localDay(entry.createdAt);
      if (!day) return false;
      if (f.dateFrom && day < f.dateFrom) return false;
      if (f.dateTo && day > f.dateTo) return false;
    }
    if (f.value && valueOf) {
      const v = valueOf(entry, f.value.key);
      if (v == null || !Number.isFinite(v)) return false;
      if (f.value.op === "gte" ? v < f.value.value : v > f.value.value) return false;
    }
    return true;
  });

  if (f.last && out.length > f.last) out = out.slice(out.length - f.last);
  return out;
}

const fmtDay = (day: string) => day.split("-").reverse().join("/");

/** Frases curtas que descrevem os filtros ativos (chips do bloco e PDF). */
export function describeLabTestFilter(
  filter: LabTestFilter | undefined,
  labelOf: (key: string) => string = (k) => k,
): string[] {
  const f = cleanLabTestFilter(filter);
  if (!f) return [];
  const parts: string[] = [];
  if (f.fromExec && f.toExec) parts.push(`Execuções #${f.fromExec}–#${f.toExec}`);
  else if (f.fromExec) parts.push(`A partir da #${f.fromExec}`);
  else if (f.toExec) parts.push(`Até a #${f.toExec}`);
  if (f.dateFrom && f.dateTo) parts.push(`${fmtDay(f.dateFrom)} a ${fmtDay(f.dateTo)}`);
  else if (f.dateFrom) parts.push(`Desde ${fmtDay(f.dateFrom)}`);
  else if (f.dateTo) parts.push(`Até ${fmtDay(f.dateTo)}`);
  if (f.value) {
    parts.push(`${labelOf(f.value.key)} ${f.value.op === "gte" ? "≥" : "≤"} ${f.value.value}`);
  }
  if (f.last) parts.push(f.last === 1 ? "Última execução" : `Últimas ${f.last} execuções`);
  return parts;
}

// ---------------------------------------------------------------------------
// Partes do gráfico
// ---------------------------------------------------------------------------

export type LabTestSection = { id: string; label: string };

export const SUMMARY_SECTIONS: LabTestSection[] = [
  { id: "chart", label: "Gráfico" },
  { id: "stats", label: "Médias e melhores" },
];

export const FLL_SECTIONS: LabTestSection[] = [
  { id: "stats", label: "Indicadores (melhor, média…)" },
  { id: "score", label: "Pontuação por execução" },
  { id: "ranking", label: "Ranking das missões" },
  { id: "table", label: "Desempenho por missão" },
  { id: "grid", label: "Missões × execuções" },
  { id: "answers", label: "Respostas por missão" },
  { id: "discs", label: "Discos de precisão" },
];

export const MOTOR_SECTIONS: LabTestSection[] = [
  { id: "evolution", label: "Rotação por execução" },
  { id: "rotation", label: "Rotação por tempo" },
  { id: "time", label: "Tempo médio de execução" },
  { id: "badges", label: "Resumo das combinações" },
];

/** Partes que o usuário pode mostrar/esconder em cada visualização. */
export function labTestSections(
  view: "resumo" | "completo",
  mode: string,
  season: string | null,
  config?: unknown,
): LabTestSection[] {
  if (view === "resumo") return SUMMARY_SECTIONS;
  if (mode === "runs" && season) return FLL_SECTIONS;
  const cfg = (config && typeof config === "object" ? config : {}) as Record<string, unknown>;
  if (mode === "individual" || (mode === "calibrabot" && cfg.tipo === "motores")) return MOTOR_SECTIONS;
  return [];
}

/** true se a parte deve aparecer. */
export function isSectionVisible(hidden: string[] | undefined, id: string): boolean {
  return !hidden?.includes(id);
}

/** Alterna uma parte sem deixar todas escondidas. */
export function toggleHiddenSection(
  hidden: string[] | undefined,
  id: string,
  all: LabTestSection[],
): string[] {
  const current = (hidden ?? []).filter((h) => all.some((s) => s.id === h));
  if (current.includes(id)) return current.filter((h) => h !== id);
  const next = [...current, id];
  return next.length >= all.length ? current : next;
}
