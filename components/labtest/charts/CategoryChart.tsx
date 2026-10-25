"use client";

// Gráfico "por categoria": cada item (motor, dupla, resposta…) tem um valor.
// Tipos: barras, barras horizontais, linha, área, radar, pizza e rosca.

import { useMemo, useState, type ComponentType } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LucideProps } from "lucide-react";

import {
  formatNumber,
  type ChartSeries,
  type TooltipExtra,
} from "@/utils/labtest/chart-data";
import { useChartTheme } from "./chart-theme";
import { ChartTooltip } from "./chart-tooltip";
import {
  ChartPanel,
  ChartTypePicker,
  OptionToggle,
  type CategoryChartType,
} from "./chart-panel";

export interface CategoryDatum {
  name: string;
  value: number;
  extras?: TooltipExtra[];
}

const ALL_TYPES: CategoryChartType[] = [
  "bar",
  "hbar",
  "line",
  "area",
  "radar",
  "pie",
  "donut",
];

export function CategoryChartPanel({
  title,
  subtitle,
  icon,
  /** Nome e unidade do valor plotado (ex.: Rotação / RPM). */
  measure,
  data,
  defaultType = "bar",
  types = ALL_TYPES,
  height = 260,
  headerExtra,
  compact,
}: {
  compact?: boolean;
  title: string;
  subtitle?: string;
  icon?: ComponentType<LucideProps>;
  measure: ChartSeries;
  data: CategoryDatum[];
  defaultType?: CategoryChartType;
  types?: CategoryChartType[];
  height?: number;
  headerExtra?: React.ReactNode;
}) {
  const { ref, theme } = useChartTheme();
  const [type, setType] = useState<CategoryChartType>(defaultType);
  const [showLabels, setShowLabels] = useState(!compact);

  const disabled: Partial<Record<CategoryChartType, string>> = {};
  if (data.length < 3) disabled.radar = "precisa de 3 ou mais itens";
  if (data.some((item) => item.value < 0)) {
    disabled.pie = "não aceita valores negativos";
    disabled.donut = "não aceita valores negativos";
  }
  const effective = disabled[type] ? "bar" : type;

  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data],
  );
  const rows = useMemo(
    () => data.map((item) => ({ ...item, __extras: item.extras })),
    [data],
  );
  const color = (index: number) => theme.series[index % theme.series.length];
  const tickStyle = { fontSize: 11, fill: theme.axis };
  const labelProp = showLabels
    ? {
        position: "top" as const,
        fontSize: 10,
        fill: theme.axis,
        formatter: (v: unknown) => (typeof v === "number" ? formatNumber(v) : ""),
      }
    : false;
  const margin = { top: 16, right: 12, bottom: 0, left: 0 };
  const tooltipSeries = [measure];

  const tooltip = (pie?: boolean) => (
    <Tooltip
      cursor={
        effective === "bar" || effective === "hbar"
          ? { fill: theme.grid, opacity: 0.5 }
          : { stroke: theme.grid }
      }
      content={(props) => (
        <ChartTooltip
          {...props}
          series={tooltipSeries}
          unit={measure.unit}
          pieTotal={pie ? total : undefined}
        />
      )}
    />
  );

  const grid = (
    <CartesianGrid
      stroke={theme.grid}
      strokeDasharray="3 4"
      vertical={effective === "hbar"}
      horizontal={effective !== "hbar"}
    />
  );
  const valueAxisFormatter = (value: number) => formatNumber(value);
  const nameAxis = (
    <XAxis
      dataKey="name"
      tick={tickStyle}
      tickLine={false}
      axisLine={{ stroke: theme.grid }}
      interval={0}
      height={rows.length > 4 ? 48 : 30}
      angle={rows.length > 4 ? -20 : 0}
      textAnchor={rows.length > 4 ? "end" : "middle"}
    />
  );
  const valueAxis = (
    <YAxis
      tick={tickStyle}
      tickLine={false}
      axisLine={false}
      width={48}
      tickFormatter={valueAxisFormatter}
    />
  );

  let chart: React.ReactElement;

  if (effective === "pie" || effective === "donut") {
    chart = (
      <PieChart>
        {tooltip(true)}
        <Pie
          data={rows}
          dataKey="value"
          nameKey="name"
          innerRadius={effective === "donut" ? "55%" : 0}
          outerRadius="82%"
          paddingAngle={effective === "donut" ? 3 : 1}
          stroke={theme.surface}
          strokeWidth={2}
          label={
            showLabels
              ? ({ name, percent }: { name?: string; percent?: number }) =>
                  `${name ?? ""} · ${formatNumber((percent ?? 0) * 100)}%`
              : false
          }
          labelLine={false}
        >
          {rows.map((_, index) => (
            <Cell key={index} fill={color(index)} />
          ))}
        </Pie>
      </PieChart>
    );
  } else if (effective === "radar") {
    chart = (
      <RadarChart data={rows} outerRadius="70%" margin={{ top: 8, right: 32, bottom: 8, left: 32 }}>
        <PolarGrid stroke={theme.grid} />
        <PolarAngleAxis dataKey="name" tick={tickStyle} />
        <PolarRadiusAxis tick={{ fontSize: 9, fill: theme.axis }} axisLine={false} />
        {tooltip()}
        <Radar
          dataKey="value"
          name={measure.label}
          stroke={color(0)}
          fill={color(0)}
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </RadarChart>
    );
  } else if (effective === "line") {
    chart = (
      <LineChart data={rows} margin={margin}>
        {grid}
        {nameAxis}
        {valueAxis}
        {tooltip()}
        <Line
          type="monotone"
          dataKey="value"
          name={measure.label}
          stroke={color(0)}
          strokeWidth={2.5}
          dot={{ r: 4, fill: color(0), stroke: theme.surface, strokeWidth: 1.5 }}
          activeDot={{ r: 6 }}
          label={labelProp}
        />
      </LineChart>
    );
  } else if (effective === "area") {
    chart = (
      <AreaChart data={rows} margin={margin}>
        {grid}
        {nameAxis}
        {valueAxis}
        {tooltip()}
        <Area
          type="monotone"
          dataKey="value"
          name={measure.label}
          stroke={color(0)}
          fill={color(0)}
          fillOpacity={0.16}
          strokeWidth={2.5}
          dot={{ r: 3.5, fill: color(0), stroke: theme.surface, strokeWidth: 1.5 }}
          label={labelProp}
        />
      </AreaChart>
    );
  } else if (effective === "hbar") {
    chart = (
      <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 40, bottom: 0, left: 8 }}>
        {grid}
        <XAxis
          type="number"
          tick={tickStyle}
          tickLine={false}
          axisLine={false}
          tickFormatter={valueAxisFormatter}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={tickStyle}
          tickLine={false}
          axisLine={false}
          width={110}
        />
        {tooltip()}
        <Bar
          dataKey="value"
          name={measure.label}
          radius={[0, 6, 6, 0]}
          maxBarSize={28}
          label={
            showLabels
              ? { position: "right", fontSize: 10, fill: theme.axis, formatter: (v: unknown) => (typeof v === "number" ? formatNumber(v) : "") }
              : false
          }
        >
          {rows.map((_, index) => (
            <Cell key={index} fill={color(index)} />
          ))}
        </Bar>
      </BarChart>
    );
  } else {
    chart = (
      <BarChart data={rows} margin={margin}>
        {grid}
        {nameAxis}
        {valueAxis}
        {tooltip()}
        <Bar
          dataKey="value"
          name={measure.label}
          radius={[6, 6, 0, 0]}
          maxBarSize={48}
          label={labelProp}
        >
          {rows.map((_, index) => (
            <Cell key={index} fill={color(index)} />
          ))}
        </Bar>
      </BarChart>
    );
  }

  const chartHeight =
    effective === "hbar" ? Math.max(height, rows.length * 40 + 40) : height;

  return (
    <ChartPanel
      bare={compact}
      icon={icon}
      title={title}
      subtitle={subtitle}
      actions={
        <ChartTypePicker
          value={effective}
          options={types}
          disabled={disabled}
          onChange={setType}
        />
      }
    >
      <div ref={ref} className="flex flex-col gap-3">
        {headerExtra}
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            {chart}
          </ResponsiveContainer>
        </div>
        {effective !== "radar" && !compact && (
          <div className="border-t border-base-200 pt-3">
            <OptionToggle
              label="Rótulos de valor"
              checked={showLabels}
              onChange={setShowLabels}
            />
          </div>
        )}
      </div>
    </ChartPanel>
  );
}
