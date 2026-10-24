"use client";

import type { ComponentType, ReactNode } from "react";
import {
  ChartArea,
  ChartBar,
  ChartColumn,
  ChartColumnStacked,
  ChartLine,
  ChartPie,
  ChartScatter,
  ChartSpline,
  Donut,
  Radar,
  type LucideProps,
} from "lucide-react";

export type SeriesChartType =
  | "line"
  | "area"
  | "bar"
  | "stacked"
  | "step"
  | "scatter"
  | "radar";

export type CategoryChartType =
  | "bar"
  | "hbar"
  | "line"
  | "area"
  | "radar"
  | "pie"
  | "donut";

export const CHART_TYPE_META: Record<
  SeriesChartType | CategoryChartType,
  { label: string; icon: ComponentType<LucideProps> }
> = {
  line: { label: "Linha", icon: ChartLine },
  area: { label: "Área", icon: ChartArea },
  bar: { label: "Barras", icon: ChartColumn },
  hbar: { label: "Barras horizontais", icon: ChartBar },
  stacked: { label: "Barras empilhadas", icon: ChartColumnStacked },
  step: { label: "Degraus", icon: ChartSpline },
  scatter: { label: "Dispersão", icon: ChartScatter },
  radar: { label: "Radar", icon: Radar },
  pie: { label: "Pizza", icon: ChartPie },
  donut: { label: "Rosca", icon: Donut },
};

export function ChartTypePicker<T extends string>({
  value,
  options,
  disabled,
  onChange,
}: {
  value: T;
  options: T[];
  /** Tipos que existem mas não fazem sentido com os dados atuais. */
  disabled?: Partial<Record<T, string>>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-full bg-base-200 p-1" role="radiogroup" aria-label="Tipo de gráfico">
      {options.map((type) => {
        const meta = CHART_TYPE_META[type as keyof typeof CHART_TYPE_META];
        const Icon = meta.icon;
        const reason = disabled?.[type];
        return (
          <div
            key={type}
            className="tooltip tooltip-bottom"
            data-tip={reason ? `${meta.label} — ${reason}` : meta.label}
          >
            <button
              type="button"
              role="radio"
              aria-checked={value === type}
              aria-label={meta.label}
              disabled={Boolean(reason)}
              onClick={() => onChange(type)}
              className={`btn btn-circle btn-xs size-7 border-0 ${
                value === type
                  ? "btn-primary shadow-sm"
                  : "btn-ghost text-base-content/55"
              }`}
            >
              <Icon className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function OptionToggle({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 text-xs text-base-content/70 ${disabled ? "opacity-40" : ""}`}
    >
      <input
        type="checkbox"
        className="toggle toggle-primary toggle-xs"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}

export function SeriesLegend({
  items,
  hidden,
  onToggle,
}: {
  items: { key: string; label: string; unit?: string | null; color: string }[];
  hidden: Set<string>;
  onToggle: (key: string) => void;
}) {
  if (items.length < 2) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => {
        const off = hidden.has(item.key);
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onToggle(item.key)}
            aria-pressed={!off}
            title={off ? "Mostrar série" : "Ocultar série"}
            className={`badge badge-lg gap-2 border-base-300 bg-base-100 px-3 text-xs transition ${off ? "opacity-40 line-through" : ""}`}
          >
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
            {item.unit ? (
              <span className="text-base-content/40">{item.unit}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function ChartPanel({
  icon: Icon,
  title,
  subtitle,
  actions,
  footer,
  bare,
  children,
}: {
  /** Sem moldura de card (para uso dentro de outro card). */
  bare?: boolean;
  icon?: ComponentType<LucideProps>;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  if (bare) {
    return (
      <div className="flex flex-col gap-3">
        {actions && <div className="flex justify-end">{actions}</div>}
        {children}
        {footer}
      </div>
    );
  }

  return (
    <section className="card border border-base-300/70 bg-base-100 shadow-sm">
      <div className="card-body gap-4 p-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
            )}
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold tracking-tight">{title}</h3>
              {subtitle && (
                <p className="truncate text-xs text-base-content/50">{subtitle}</p>
              )}
            </div>
          </div>
          {actions}
        </header>
        {children}
        {footer}
      </div>
    </section>
  );
}
