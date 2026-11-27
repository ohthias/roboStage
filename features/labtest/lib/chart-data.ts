// ---------------------------------------------------------------------------
// Helpers puros (sem React) para montar e formatar os dados dos gráficos.
//
// Regras que corrigem as "tags" (tooltips) dos pontos:
//  - dado ausente é `null` e NUNCA vira 0 (antes aparecia "0" onde o usuário
//    simplesmente não tinha registrado nada);
//  - todo valor exibido carrega a unidade do campo (RPM, s, pts, °, cm…);
//  - valores numéricos guardados como texto ("12,5") também são entendidos;
//  - o rótulo do ponto usa o número REAL da execução (executionNumber) e a
//    data/hora do registro, e não a posição do item no array.
// ---------------------------------------------------------------------------

export interface ChartSeries {
  key: string;
  label: string;
  unit?: string | null;
}

export interface TooltipExtra {
  label: string;
  text: string;
}

/**
 * Uma linha do gráfico. As chaves com prefixo `__` são metadados reservados;
 * todas as outras são `series.key -> valor`.
 */
export type SeriesDatum = {
  __name: string;
  __title: string;
  __x: number;
  __extras?: TooltipExtra[];
  [key: string]: string | number | null | TooltipExtra[] | undefined;
};

export interface ExecutionLike {
  executionNumber: number;
  createdAt: string;
}

const numberFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
});

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** "1.200 RPM", "2,5 s", "90°", "—" quando não há valor. */
export function formatWithUnit(
  value: number | null | undefined,
  unit?: string | null,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";

  const formatted = formatNumber(value);
  const cleanUnit = unit?.trim();

  if (!cleanUnit) return formatted;
  if (cleanUnit === "%" || cleanUnit === "°") return `${formatted}${cleanUnit}`;

  return `${formatted} ${cleanUnit}`;
}

/** Converte number | "12,5" | "12.5" em number; qualquer outra coisa vira null. */
export function toNumber(raw: unknown): number | null {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;

  if (typeof raw === "string") {
    const text = raw.trim().replace(",", ".");
    if (text === "") return null;
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

const titleFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatExecutionTitle(
  executionNumber: number,
  createdAt?: string | Date | null,
): string {
  const base = `Execução #${executionNumber}`;
  if (!createdAt) return base;

  const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  if (Number.isNaN(date.getTime())) return base;

  return `${base} · ${titleFormatter.format(date).replace(",", "")}`;
}

/**
 * Monta uma linha por execução. `pick` devolve o valor numérico (ou null) de
 * cada série naquela execução.
 */
export function buildExecutionRows<E extends ExecutionLike>(
  entries: E[],
  series: ChartSeries[],
  pick: (entry: E, series: ChartSeries) => number | null,
  extras?: (entry: E) => TooltipExtra[] | undefined,
): SeriesDatum[] {
  return entries.map((entry) => {
    const row: SeriesDatum = {
      __name: `#${entry.executionNumber}`,
      __title: formatExecutionTitle(entry.executionNumber, entry.createdAt),
      __x: entry.executionNumber,
      __extras: extras?.(entry),
    };

    for (const item of series) {
      row[item.key] = pick(entry, item);
    }

    return row;
  });
}

/**
 * Coloca cada série em escala 0–100 (% do maior valor dela). Serve para
 * comparar grandezas com unidades diferentes (RPM × s × °) no mesmo gráfico.
 * O valor real continua disponível em `__raw_<key>` para o tooltip.
 */
export function normalizeRows(
  rows: SeriesDatum[],
  series: ChartSeries[],
): SeriesDatum[] {
  const maxima = new Map<string, number>();

  for (const item of series) {
    let max = 0;
    for (const row of rows) {
      const value = row[item.key];
      if (typeof value === "number") max = Math.max(max, Math.abs(value));
    }
    maxima.set(item.key, max);
  }

  return rows.map((row) => {
    const next: SeriesDatum = { ...row };

    for (const item of series) {
      const value = row[item.key];
      const max = maxima.get(item.key) ?? 0;

      next[`__raw_${item.key}`] = typeof value === "number" ? value : null;
      next[item.key] =
        typeof value === "number" ? (max === 0 ? 0 : (value / max) * 100) : null;
    }

    return next;
  });
}

export function hasMixedUnits(series: ChartSeries[]): boolean {
  const units = new Set(
    series.map((item) => (item.unit ?? "").trim()).filter(Boolean),
  );

  return units.size > 1;
}
