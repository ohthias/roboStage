"use client";

// Gráfico "por execução": eixo X = execução, uma série por campo.
// O usuário escolhe o tipo (linha, área, barras, empilhado, degraus,
// dispersão, radar), pode ocultar séries, normalizar escalas, mostrar a média
// e rótulos de valor.

import { useMemo, useState, type ComponentType } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LucideProps } from "lucide-react";

import {
  average,
  formatNumber,
  hasMixedUnits,
  normalizeRows,
  type ChartSeries,
  type SeriesDatum,
} from "@/utils/labtest/chart-data";
import { useChartTheme } from "./chart-theme";
import { ChartTooltip } from "./chart-tooltip";
import {
  ChartPanel,
  ChartTypePicker,
  OptionToggle,
  SeriesLegend,
  type SeriesChartType,
} from "./chart-panel";

const ALL_TYPES: SeriesChartType[] = [
  "line",
  "area",
  "bar",
  "stacked",
  "step",
  "scatter",
  "radar",
];

export interface SeriesChartPanelProps {
  title: string;
  subtitle?: string;
  icon?: ComponentType<LucideProps>;
  series: ChartSeries[];
  rows: SeriesDatum[];
  defaultType?: SeriesChartType;
  /** Restringe os tipos oferecidos. */
  types?: SeriesChartType[];
  height?: number;
  /** Valor máximo de referência (ex.: pontuação máxima). */
  referenceMax?: number;
  footer?: React.ReactNode;
  /** Versão enxuta para dentro de outros cards: sem moldura nem opções. */
  compact?: boolean;
}

export function SeriesChartPanel({
  title,
  subtitle,
  icon,
  series,
  rows,
  defaultType = "line",
  types = ALL_TYPES,
  height = 300,
  referenceMax,
  footer,
  compact,
}: SeriesChartPanelProps) {
  const { ref, theme } = useChartTheme();
  const [type, setType] = useState<SeriesChartType>(defaultType);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [normalize, setNormalize] = useState(false);
  const [showAverage, setShowAverage] = useState(false);
  const [showLabels, setShowLabels] = useState(false);

  const colored = useMemo(
    () =>
      series.map((item, index) => ({
        ...item,
        color: theme.series[index % theme.series.length],
      })),
    [series, theme],
  );

  const visible = colored.filter((item) => !hidden.has(item.key));
  const mixed = hasMixedUnits(series);
  const canNormalize = visible.length > 1;
  const isNormalized = normalize && canNormalize;
  const isRadar = type === "radar";
  const normalized = isNormalized || isRadar;

  const data = useMemo(
    () => (normalized ? normalizeRows(rows, series) : rows),
    [normalized, rows, series],
  );

  const disabled: Partial<Record<SeriesChartType, string>> = {};
  if (series.length < 2) disabled.stacked = "precisa de 2 ou mais séries";
  if (rows.length < 3) disabled.radar = "precisa de 3 ou mais execuções";

  const available = types.filter((item) => ALL_TYPES.includes(item));
  const effectiveType = disabled[type] ? "line" : type;

  const tickStyle = { fontSize: 11, fill: theme.axis };
  const fmtLabel = (value: unknown) =>
    typeof value === "number" ? formatNumber(value) : "";

  const averages = visible.map((item) => {
    const values = data
      .map((row) => row[item.key])
      .filter((value): value is number => typeof value === "number");
    return { item, value: average(values) };
  });

  const renderTooltip = (extra?: { showTotal?: boolean }) => (
    <Tooltip
      cursor={
        effectiveType === "bar" || effectiveType === "stacked"
          ? { fill: theme.grid, opacity: 0.5 }
          : { stroke: theme.grid }
      }
      content={(props) => (
        <ChartTooltip {...props} series={series} showTotal={extra?.showTotal} />
      )}
    />
  );

  const grid = (
    <CartesianGrid stroke={theme.grid} strokeDasharray="3 4" vertical={false} />
  );
  const xAxis = (
    <XAxis
      dataKey="__name"
      tick={tickStyle}
      tickLine={false}
      axisLine={{ stroke: theme.grid }}
      interval="preserveStartEnd"
    />
  );
  const yAxis = (
    <YAxis
      tick={tickStyle}
      tickLine={false}
      axisLine={false}
      width={44}
      allowDecimals
      domain={isNormalized ? [0, 100] : undefined}
      tickFormatter={(value: number) =>
        isNormalized ? `${value}%` : formatNumber(value)
      }
    />
  );

  const averageLines =
    showAverage && !isNormalized
      ? averages.map(({ item, value }) =>
          value === null ? null : (
            <ReferenceLine
              key={`avg-${item.key}`}
              y={value}
              stroke={item.color}
              strokeDasharray="5 4"
              strokeOpacity={0.7}
              label={{
                value: `média ${formatNumber(value)}`,
                position: "insideTopRight",
                fontSize: 10,
                fill: item.color,
              }}
            />
          ),
        )
      : null;

  const maxLine =
    referenceMax && !isNormalized ? (
      <ReferenceLine
        y={referenceMax}
        stroke={theme.axis}
        strokeDasharray="2 4"
        label={{
          value: `máx ${formatNumber(referenceMax)}`,
          position: "insideTopLeft",
          fontSize: 10,
          fill: theme.axis,
        }}
      />
    ) : null;

  const labelProp = showLabels
    ? { position: "top" as const, fontSize: 10, fill: theme.axis, formatter: fmtLabel }
    : false;

  const margin = { top: 12, right: 12, bottom: 0, left: 0 };

  let chart: React.ReactElement;

  if (effectiveType === "bar" || effectiveType === "stacked") {
    // Empilhar valores já normalizados (cada um até 100%) não faz sentido.
    const stacked = effectiveType === "stacked" && !isNormalized;
    chart = (
      <BarChart data={data} margin={margin} barGap={4}>
        {grid}
        {xAxis}
        {yAxis}
        {renderTooltip({ showTotal: stacked && !isNormalized })}
        {maxLine}
        {averageLines}
        {visible.map((item, index) => (
          <Bar
            key={item.key}
            dataKey={item.key}
            name={item.label}
            fill={item.color}
            stackId={stacked ? "stack" : undefined}
            radius={
              stacked
                ? index === visible.length - 1
                  ? [6, 6, 0, 0]
                  : 0
                : [6, 6, 0, 0]
            }
            maxBarSize={40}
            label={labelProp}
          />
        ))}
      </BarChart>
    );
  } else if (effectiveType === "area") {
    chart = (
      <AreaChart data={data} margin={margin}>
        {grid}
        {xAxis}
        {yAxis}
        {renderTooltip()}
        {maxLine}
        {averageLines}
        {visible.map((item) => (
          <Area
            key={item.key}
            type="monotone"
            dataKey={item.key}
            name={item.label}
            stroke={item.color}
            fill={item.color}
            fillOpacity={0.16}
            strokeWidth={2.5}
            connectNulls
            dot={{ r: 3, fill: item.color, stroke: theme.surface, strokeWidth: 1.5 }}
            activeDot={{ r: 5.5 }}
            label={labelProp}
          />
        ))}
      </AreaChart>
    );
  } else if (effectiveType === "scatter") {
    chart = (
      <ScatterChart margin={margin}>
        {grid}
        <XAxis
          type="number"
          dataKey="x"
          name="Execução"
          tick={tickStyle}
          tickLine={false}
          axisLine={{ stroke: theme.grid }}
          allowDecimals={false}
          domain={["dataMin", "dataMax"]}
          padding={{ left: 16, right: 16 }}
          tickFormatter={(value: number) => `#${value}`}
        />
        <YAxis
          type="number"
          dataKey="y"
          tick={tickStyle}
          tickLine={false}
          axisLine={false}
          width={44}
          domain={isNormalized ? [0, 100] : undefined}
          tickFormatter={(value: number) =>
            isNormalized ? `${value}%` : formatNumber(value)
          }
        />
        <Tooltip
          cursor={{ strokeDasharray: "3 4", stroke: theme.grid }}
          content={(props) => <ChartTooltip {...props} series={series} />}
        />
        {maxLine}
        {visible.map((item) => {
          const points = data
            .filter((row) => typeof row[item.key] === "number")
            .map((row) => ({
              x: row.__x,
              y: row[item.key] as number,
              __point: true,
              __title: row.__title,
              __seriesLabel: item.label,
              __unit: item.unit ?? null,
              __color: item.color,
              __raw: (row[`__raw_${item.key}`] ?? row[item.key]) as number,
            }));
          return (
            <Scatter
              key={item.key}
              name={item.label}
              data={points}
              fill={item.color}
              fillOpacity={0.85}
            />
          );
        })}
      </ScatterChart>
    );
  } else if (effectiveType === "radar") {
    chart = (
      <RadarChart data={data} outerRadius="72%" margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
        <PolarGrid stroke={theme.grid} />
        <PolarAngleAxis dataKey="__name" tick={tickStyle} />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fontSize: 9, fill: theme.axis }}
          tickFormatter={(value: number) => `${value}%`}
          axisLine={false}
        />
        {renderTooltip()}
        {visible.map((item) => (
          <Radar
            key={item.key}
            dataKey={item.key}
            name={item.label}
            stroke={item.color}
            fill={item.color}
            fillOpacity={0.18}
            strokeWidth={2}
          />
        ))}
      </RadarChart>
    );
  } else {
    chart = (
      <LineChart data={data} margin={margin}>
        {grid}
        {xAxis}
        {yAxis}
        {renderTooltip()}
        {maxLine}
        {averageLines}
        {visible.map((item) => (
          <Line
            key={item.key}
            type={effectiveType === "step" ? "stepAfter" : "monotone"}
            dataKey={item.key}
            name={item.label}
            stroke={item.color}
            strokeWidth={2.5}
            connectNulls
            dot={{ r: 3.5, fill: item.color, stroke: theme.surface, strokeWidth: 1.5 }}
            activeDot={{ r: 6 }}
            label={labelProp}
          />
        ))}
      </LineChart>
    );
  }

  return (
    <ChartPanel
      bare={compact}
      icon={icon}
      title={title}
      subtitle={subtitle}
      actions={
        <ChartTypePicker
          value={effectiveType}
          options={available}
          disabled={disabled}
          onChange={setType}
        />
      }
      footer={footer}
    >
      <div ref={ref} className="flex flex-col gap-3">
        <SeriesLegend
          items={colored}
          hidden={hidden}
          onToggle={(key) =>
            setHidden((prev) => {
              const next = new Set(prev);
              if (next.has(key)) next.delete(key);
              else if (next.size < series.length - 1) next.add(key);
              return next;
            })
          }
        />

        {rows.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-base-300 text-sm text-base-content/45">
            Sem execuções registradas.
          </div>
        ) : (
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              {chart}
            </ResponsiveContainer>
          </div>
        )}

        <div
          className={`flex-wrap items-center gap-x-5 gap-y-2 border-t border-base-200 pt-3 ${compact ? "hidden" : "flex"}`}
        >
          {effectiveType !== "radar" && effectiveType !== "scatter" && (
            <>
              <OptionToggle
                label="Rótulos de valor"
                checked={showLabels && !isNormalized}
                disabled={isNormalized}
                onChange={setShowLabels}
              />
              <OptionToggle
                label="Linha de média"
                checked={showAverage && !isNormalized}
                disabled={isNormalized}
                onChange={setShowAverage}
              />
            </>
          )}
          {effectiveType !== "radar" && (
            <OptionToggle
              label="Normalizar escalas (%)"
              checked={isNormalized}
              disabled={!canNormalize}
              onChange={setNormalize}
            />
          )}
          {isRadar && (
            <span className="text-xs text-base-content/50">
              Radar compara séries em % do próprio máximo; o tooltip mostra o
              valor real.
            </span>
          )}
          {mixed && !isNormalized && !isRadar && (
            <span className="text-xs text-warning">
              Unidades diferentes no mesmo eixo — use “Normalizar escalas”.
            </span>
          )}
        </div>
      </div>
    </ChartPanel>
  );
}
