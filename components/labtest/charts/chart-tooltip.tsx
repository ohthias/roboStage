"use client";

import type { TooltipContentProps } from "recharts";
import {
  formatNumber,
  formatWithUnit,
  type ChartSeries,
  type SeriesDatum,
  type TooltipExtra,
} from "@/utils/labtest/chart-data";

function Shell({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="min-w-40 max-w-64 rounded-xl border border-base-300 bg-base-100 px-3 py-2.5 text-xs shadow-xl">
      {title && <p className="mb-1.5 font-semibold text-base-content">{title}</p>}
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function Row({
  color,
  label,
  value,
  muted,
}: {
  color?: string;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex min-w-0 items-center gap-1.5 text-base-content/60">
        {color && (
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
        <span className="truncate">{label}</span>
      </span>
      <span
        className={`shrink-0 font-semibold tabular-nums ${muted ? "text-base-content/35" : "text-base-content"}`}
      >
        {value}
      </span>
    </div>
  );
}

function Extras({ extras }: { extras?: TooltipExtra[] }) {
  if (!extras?.length) return null;
  return (
    <div className="mt-1 flex flex-col gap-1 border-t border-base-300 pt-1.5">
      {extras.map((extra) => (
        <Row key={extra.label} label={extra.label} value={extra.text} />
      ))}
    </div>
  );
}

export type ChartTooltipProps = TooltipContentProps & {
  series: ChartSeries[];
  /** Mostra a soma quando as barras estão empilhadas. */
  showTotal?: boolean;
  /** Modo do gráfico de pizza (mostra % do total). */
  pieTotal?: number;
  /** Unidade do valor nos gráficos por categoria. */
  unit?: string | null;
};

export function ChartTooltip({
  active,
  payload,
  label,
  series,
  showTotal,
  pieTotal,
  unit,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const first = payload[0];
  const datum = (first.payload ?? {}) as Record<string, unknown>;

  // Pizza / rosca ---------------------------------------------------------
  if (pieTotal !== undefined) {
    const value = Number(first.value ?? 0);
    const pct = pieTotal > 0 ? (value / pieTotal) * 100 : 0;
    const fill = (datum.fill as string | undefined) ?? first.color;
    return (
      <Shell title={String(first.name ?? "")}>
        <Row
          color={fill}
          label="Valor"
          value={formatWithUnit(value, unit)}
        />
        <Row label="Participação" value={`${formatNumber(pct)}%`} />
        <Extras extras={datum.__extras as TooltipExtra[] | undefined} />
      </Shell>
    );
  }

  // Dispersão: o ponto carrega seus próprios metadados ----------------------
  if (datum.__point) {
    return (
      <Shell title={String(datum.__title ?? "")}>
        <Row
          color={first.color ?? (datum.__color as string | undefined)}
          label={String(datum.__seriesLabel ?? "")}
          value={formatWithUnit(
            datum.__raw as number | null,
            datum.__unit as string | null,
          )}
        />
      </Shell>
    );
  }

  const row = datum as SeriesDatum;
  const title =
    (typeof row.__title === "string" && row.__title) ||
    (typeof label === "string" || typeof label === "number" ? String(label) : "") ||
    String(first.name ?? "");

  const lookup = new Map(series.map((item) => [item.key, item]));

  const rows = payload.map((item) => {
    const key = String(item.dataKey ?? "");
    const meta = lookup.get(key);
    const raw = row[`__raw_${key}`];
    const value =
      raw !== undefined ? (raw as number | null) : (item.value as number | null | undefined);

    return {
      key,
      color: item.color ?? item.fill ?? item.stroke,
      label: meta?.label ?? String(item.name ?? key),
      value: typeof value === "number" ? value : null,
      unit: meta?.unit ?? unit,
    };
  });

  const total =
    showTotal && rows.length > 1
      ? rows.reduce((sum, item) => sum + (item.value ?? 0), 0)
      : null;

  return (
    <Shell title={title}>
      {rows.map((item) => (
        <Row
          key={item.key}
          color={item.color}
          label={item.label}
          value={item.value === null ? "Sem registro" : formatWithUnit(item.value, item.unit)}
          muted={item.value === null}
        />
      ))}
      {total !== null && <Row label="Total" value={formatNumber(total)} />}
      <Extras extras={row.__extras} />
    </Shell>
  );
}
