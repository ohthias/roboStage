"use client";

// ---------------------------------------------------------------------------
// Gráficos de comparação específicos para os modos CalibraBot (Motores,
// Giroscópio, PID) e Personalizado. O modo Runs continua usando os gráficos
// genéricos de pontuação em [id]/page.tsx — este arquivo cobre exatamente os
// dois estilos pedidos: "calibrabot" e "personalizado".
//
// - CalibraBot · Motores  -> usa rotação e tempo de execução (campos
//   sintéticos `${motor}__rotacao` / `${motor}__tempo`, ver actions.ts).
// - CalibraBot · Giroscópio / PID -> usa as variáveis definidas no teste
//   (indicadores / parâmetros), todas comparadas juntas.
// - Personalizado -> o usuário escolhe quais parâmetros entram no gráfico.
// ---------------------------------------------------------------------------

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Gauge,
  SlidersHorizontal,
  BarChart3,
  LineChart as LineChartIcon,
  Timer,
  RotateCw,
} from "lucide-react";

import type { FieldDefinition, TestEntry } from "@/types/labtest.types";
import { getFieldValue } from "@/types/labtest.types";
import { ACCENT_STYLES, type AccentColor } from "@/utils/labtest/modes";
import { computeFieldStats } from "@/utils/labtest/stats";
import { SectionHeader, CustomTooltip } from "./shared";

const PALETTE = [
  "#cf2a2a",
  "#1e459f",
  "#fabd32",
  "#6ca3c8",
  "#466421",
  "#efb24b",
  "#de5017",
];

type ChartType = "line" | "bar";

function ChartTypeToggle({
  value,
  onChange,
}: {
  value: ChartType;
  onChange: (value: ChartType) => void;
}) {
  return (
    <div className="join">
      <button
        type="button"
        onClick={() => onChange("line")}
        className={`btn btn-xs join-item rounded-lg ${value === "line" ? "btn-neutral" : "btn-ghost text-base-content/50"}`}
      >
        <LineChartIcon className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onChange("bar")}
        className={`btn btn-xs join-item rounded-lg ${value === "bar" ? "btn-neutral" : "btn-ghost text-base-content/50"}`}
      >
        <BarChart3 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gráfico multi-série genérico: um <Line>/<Bar> por campo selecionado,
// eixo X = número do lançamento.
// ---------------------------------------------------------------------------

function MultiSeriesChart({
  fields,
  entries,
  data: externalData,
  chartType,
  height = 260,
}: {
  fields: FieldDefinition[];
  entries: TestEntry[];
  data?: Record<string, string | number>[];
  chartType: ChartType;
  height?: number;
}) {
  const data = useMemo(
    () =>
      externalData ??
      entries.map((entry, i) => {
        const point: Record<string, string | number> = {
          name: `#${i + 1}`,
        };

        for (const field of fields) {
          const raw = getFieldValue(entry.values, field.fieldKey);

          point[field.fieldKey] = typeof raw === "number" ? raw : 0;
        }

        return point;
      }),
    [externalData, fields, entries],
  );

  if (fields.length === 0) return null;

  const Chart = chartType === "bar" ? BarChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Chart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="oklch(97% 0 0)"
          vertical={false}
        />

        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#12121275" />

        <YAxis tick={{ fontSize: 11 }} stroke="#12121275" />

        <Tooltip content={<CustomTooltip />} />

        {fields.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}

        {fields.map((field, index) => {
          const color = PALETTE[index % PALETTE.length];

          return chartType === "bar" ? (
            <Bar
              key={field.fieldKey}
              dataKey={field.fieldKey}
              name={field.label}
              fill={color}
              radius={[6, 6, 0, 0]}
            />
          ) : (
            <Line
              key={field.fieldKey}
              type="monotone"
              dataKey={field.fieldKey}
              name={field.label}
              stroke={color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: color }}
              activeDot={{ r: 5 }}
            />
          );
        })}
      </Chart>
    </ResponsiveContainer>
  );
}

function ChartCard({
  icon: Icon,
  title,
  right,
  children,
}: {
  icon: React.ElementType;
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-base-content/10 bg-base-100 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-base-content/60">
          <Icon className="h-3.5 w-3.5" />
          {title}
        </h3>
        {right}
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CalibraBot · Motores — rotação e tempo, um gráfico para cada variável,
// comparando motores (ou duplas) lado a lado.
// ---------------------------------------------------------------------------

interface MotorSample {
  rotation: number | null;
  time: number | null;
}

interface MotorCombination {
  key: string;
  label: string;
  samples: MotorSample[];
}

function buildMotorCombinations(
  fields: FieldDefinition[],
  entries: TestEntry[],
): MotorCombination[] {
  const combinations = new Map<string, MotorCombination>();

  for (const entry of entries) {
    const grouped = new Map<
      string,
      { rotation: number | null; time: number | null }
    >();

    for (const value of entry.values) {
      const match = value.fieldKey.match(/^(.*)__(rotacao|tempo)$/);

      if (!match) continue;

      const [, combinationKey, variable] = match;

      if (!grouped.has(combinationKey)) {
        grouped.set(combinationKey, {
          rotation: null,
          time: null,
        });
      }

      const sample = grouped.get(combinationKey)!;

      if (typeof value.value !== "number") continue;

      if (variable === "rotacao") {
        sample.rotation = value.value;
      }

      if (variable === "tempo") {
        sample.time = value.value;
      }
    }

    for (const [combinationKey, sample] of grouped) {
      if (!combinations.has(combinationKey)) {
        combinations.set(combinationKey, {
          key: combinationKey,
          label: combinationKey.replaceAll("__", " + "),
          samples: [],
        });
      }

      combinations.get(combinationKey)!.samples.push(sample);
    }
  }

  return Array.from(combinations.values());
}

interface CombinationChartData {
  time: number;
  data: {
    name: string;
    value: number;
  }[];
}

function buildChartsByTime(
  combinations: MotorCombination[],
  variable: "rotation" | "time",
): CombinationChartData[] {
  const groups = new Map<number, Map<string, number[]>>();

  for (const combination of combinations) {
    for (const sample of combination.samples) {
      if (sample.time == null) continue;

      const value = sample[variable];

      if (value == null) continue;

      if (!groups.has(sample.time)) {
        groups.set(sample.time, new Map());
      }

      const combinationValues = groups.get(sample.time)!.get(combination.key);

      if (combinationValues) {
        combinationValues.push(value);
      } else {
        groups.get(sample.time)!.set(combination.key, [value]);
      }
    }
  }

  return Array.from(groups.entries())
    .sort(([timeA], [timeB]) => timeA - timeB)
    .map(([time, values]) => ({
      time,
      data: Array.from(values.entries()).map(([combinationKey, numbers]) => ({
        name: combinationKey.replaceAll("__", " + "),
        value: numbers.reduce((sum, value) => sum + value, 0) / numbers.length,
      })),
    }));
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;

  return (
    Math.round(
      (values.reduce((sum, value) => sum + value, 0) / values.length) * 100,
    ) / 100
  );
}

function MotorsCharts({
  fields,
  entries,
  accent,
}: {
  fields: FieldDefinition[];
  entries: TestEntry[];
  accent: AccentColor;
}) {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const style = ACCENT_STYLES[accent];

  const rotationFields = fields.filter((f) => f.fieldKey.endsWith("__rotacao"));

  const timeFields = fields.filter((f) => f.fieldKey.endsWith("__tempo"));

  if (rotationFields.length === 0 && timeFields.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-base-content/15 bg-base-100 py-10 text-center text-sm text-base-content/45">
        Nenhum motor configurado para este teste ainda.
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-base-content/15 bg-base-100 py-10 text-center text-sm text-base-content/45">
        Registre uma execução para ver a comparação das combinações.
      </div>
    );
  }

  const combinations = buildMotorCombinations(fields, entries);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <SectionHeader label="Comparativo · Combinações" />
        <ChartTypeToggle value={chartType} onChange={setChartType} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rotationFields.length > 0 && (
          <ChartCard icon={RotateCw} title="Rotação (RPM)">
            <MotorCombinationCharts
              combinations={combinations}
              variable="rotation"
              chartType={chartType}
            />
          </ChartCard>
        )}

        {timeFields.length > 0 && (
          <ChartCard icon={Timer} title="Tempo de execução (s)">
            <MotorCombinationCharts
              combinations={combinations}
              variable="time"
              chartType={chartType}
            />
          </ChartCard>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {combinations.map((combination) => {
          const rotationAverage = average(combination.samples.map((s) => s.rotation).filter((v): v is number => v != null));
          const timeAverage = average(combination.samples.map((s) => s.time).filter((v): v is number => v != null));

          return (
            <span
              key={combination.key}
              className={`badge badge-outline gap-1.5 py-3 text-xs ${style.text} ${style.badgeBorder}`}
            >
              {combination.label}

              {rotationAverage != null && <>· média {rotationAverage} RPM</>}

              {timeAverage != null && <>· {timeAverage} s</>}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function CombinationChart({
  data,
  chartType,
}: {
  data: { name: string; value: number }[];
  chartType: ChartType;
}) {
  const Chart = chartType === "bar" ? BarChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <Chart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="oklch(97% 0 0)"
          vertical={false}
        />

        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#12121275" />

        <YAxis tick={{ fontSize: 11 }} stroke="#12121275" />

        <Tooltip content={<CustomTooltip />} />

        {chartType === "bar" ? (
          <Bar
            dataKey="value"
            name="Valor"
            fill={PALETTE[0]}
            radius={[6, 6, 0, 0]}
          />
        ) : (
          <Line
            type="monotone"
            dataKey="value"
            name="Valor"
            stroke={PALETTE[0]}
            strokeWidth={2.5}
            dot={{ r: 3, fill: PALETTE[0] }}
            activeDot={{ r: 5 }}
          />
        )}
      </Chart>
    </ResponsiveContainer>
  );
}

function MotorCombinationCharts({
  combinations,
  variable,
  chartType,
}: {
  combinations: MotorCombination[];
  variable: "rotation" | "time";
  chartType: ChartType;
}) {
  const charts = buildChartsByTime(combinations, variable);

  if (charts.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {charts.map((chart) => (
        <div
          key={`${variable}-${chart.time}`}
          className="rounded-xl border border-base-content/10 bg-base-100 p-2"
        >
          <div className="mb-2 px-2 text-xs font-medium text-base-content/60">
            {variable === "rotation"
              ? `Rotação · ${chart.time} s`
              : `Tempo · ${chart.time} s`}
          </div>

          <CombinationChart data={chart.data} chartType={chartType} />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CalibraBot · Giroscópio / PID — compara todas as variáveis do teste juntas
// (indicadores / parâmetros definidos na criação do teste).
// ---------------------------------------------------------------------------

function CalibrabotVariablesChart({
  fields,
  entries,
  accent,
}: {
  fields: FieldDefinition[];
  entries: TestEntry[];
  accent: AccentColor;
}) {
  const [chartType, setChartType] = useState<ChartType>("line");
  const comparableFields = fields.filter(
    (f) => f.type === "number" || f.type === "duration",
  );

  if (comparableFields.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-base-content/15 bg-base-100 py-10 text-center text-sm text-base-content/45">
        Nenhuma variável numérica configurada para comparar.
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-base-content/15 bg-base-100 py-10 text-center text-sm text-base-content/45">
        Registre uma execução para ver a comparação das variáveis.
      </div>
    );
  }

  return (
    <ChartCard
      icon={Gauge}
      title="Comparativo entre variáveis"
      right={<ChartTypeToggle value={chartType} onChange={setChartType} />}
    >
      <MultiSeriesChart
        fields={comparableFields}
        entries={entries}
        chartType={chartType}
        height={300}
      />
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Personalizado — o usuário escolhe quais parâmetros comparar no gráfico.
// ---------------------------------------------------------------------------

function CustomComparisonChart({
  fields,
  entries,
  accent,
}: {
  fields: FieldDefinition[];
  entries: TestEntry[];
  accent: AccentColor;
}) {
  const style = ACCENT_STYLES[accent];
  const comparableFields = fields.filter(
    (f) => f.type === "number" || f.type === "duration",
  );
  const [selected, setSelected] = useState<string[]>(() =>
    comparableFields.slice(0, 3).map((f) => f.fieldKey),
  );
  const [chartType, setChartType] = useState<ChartType>("line");

  const toggle = (fieldKey: string) =>
    setSelected((prev) =>
      prev.includes(fieldKey)
        ? prev.filter((k) => k !== fieldKey)
        : [...prev, fieldKey],
    );

  const activeFields = comparableFields.filter((f) =>
    selected.includes(f.fieldKey),
  );

  if (comparableFields.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-base-content/15 bg-base-100 py-10 text-center text-sm text-base-content/45">
        Este teste não tem parâmetros numéricos para comparar em gráfico.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-base-content/10 bg-base-100 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-base-content/60">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Escolha o que comparar
        </h3>
        <ChartTypeToggle value={chartType} onChange={setChartType} />
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {comparableFields.map((field, index) => {
          const active = selected.includes(field.fieldKey);
          const color =
            PALETTE[
              comparableFields.findIndex((f) => f.fieldKey === field.fieldKey) %
                PALETTE.length
            ];
          return (
            <button
              key={field.fieldKey}
              type="button"
              onClick={() => toggle(field.fieldKey)}
              className={`btn btn-xs gap-1.5 rounded-lg ${active ? "btn-neutral" : "btn-ghost text-base-content/50"}`}
              style={
                active
                  ? {
                      backgroundColor: color,
                      borderColor: color,
                      color: "white",
                    }
                  : undefined
              }
            >
              {field.label}
            </button>
          );
        })}
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-content/15 bg-base-200/30 py-10 text-center text-sm text-base-content/45">
          Registre uma execução para ver a comparação.
        </div>
      ) : activeFields.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-content/15 bg-base-200/30 py-10 text-center text-sm text-base-content/45">
          Selecione ao menos um parâmetro acima para montar o gráfico.
        </div>
      ) : (
        <>
          <MultiSeriesChart
            fields={activeFields}
            entries={entries}
            chartType={chartType}
            height={300}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFields.map((field) => {
              const stats = computeFieldStats(field, entries);
              if (stats.average == null) return null;
              return (
                <span
                  key={field.fieldKey}
                  className={`badge badge-outline gap-1.5 py-3 text-xs ${style.text} ${style.badgeBorder}`}
                >
                  {field.label}: média {stats.average}
                  {field.unit ? ` ${field.unit}` : ""} · melhor {stats.best}
                  {field.unit ? ` ${field.unit}` : ""}
                </span>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Entry point — decide qual visualização renderizar de acordo com o modo.
// mode "individual" ou calibrabot com tipo "motores" -> MotorsCharts
// mode "calibrabot" (giroscópio/pid)                 -> CalibrabotVariablesChart
// mode "custom"                                        -> CustomComparisonChart
// ---------------------------------------------------------------------------

export function LabTestModeCharts({
  mode,
  config,
  fields,
  entries,
  accent,
}: {
  mode: string;
  config: unknown;
  fields: FieldDefinition[];
  entries: TestEntry[];
  accent: AccentColor;
}) {
  const cfg = (
    config && typeof config === "object"
      ? (config as Record<string, unknown>)
      : {}
  ) as Record<string, unknown>;
  const isMotorsMode =
    mode === "individual" || (mode === "calibrabot" && cfg.tipo === "motores");
  const isCalibrabotVariablesMode =
    mode === "calibrabot" && cfg.tipo !== "motores";
  const isCustomMode = mode === "custom";

  if (isMotorsMode) {
    return <MotorsCharts fields={fields} entries={entries} accent={accent} />;
  }

  if (isCalibrabotVariablesMode) {
    return (
      <CalibrabotVariablesChart
        fields={fields}
        entries={entries}
        accent={accent}
      />
    );
  }

  if (isCustomMode) {
    return (
      <CustomComparisonChart
        fields={fields}
        entries={entries}
        accent={accent}
      />
    );
  }

  return null;
}
