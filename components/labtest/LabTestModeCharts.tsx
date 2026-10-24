"use client";

// ---------------------------------------------------------------------------
// Gráficos dos modos CalibraBot (Motores, Giroscópio, PID) e Personalizado.
// O modo Runs usa FllRunsCharts / gráficos de [id]/page.tsx.
//
// Todos os gráficos usam o kit em ./charts: o usuário escolhe o tipo
// (linha, área, barras, empilhado, degraus, dispersão, radar, pizza, rosca…)
// e os tooltips mostram valor + unidade + execução reais.
// ---------------------------------------------------------------------------

import { useMemo, useState } from "react";
import { Gauge, RotateCw, SlidersHorizontal, Timer, TrendingUp } from "lucide-react";

import type { FieldDefinition, TestEntry } from "@/types/labtest.types";
import { getFieldValue } from "@/types/labtest.types";
import { ACCENT_STYLES, type AccentColor } from "@/utils/labtest/modes";
import { computeFieldStats } from "@/utils/labtest/stats";
import {
  average,
  buildExecutionRows,
  formatWithUnit,
  toNumber,
  type ChartSeries,
} from "@/utils/labtest/chart-data";
import { SeriesChartPanel } from "./charts/SeriesChart";
import { CategoryChartPanel, type CategoryDatum } from "./charts/CategoryChart";
import { EmptyState } from "./shared";

function fieldSeries(fields: FieldDefinition[]): ChartSeries[] {
  return fields.map((field) => ({
    key: field.fieldKey,
    label: field.label,
    unit: field.unit,
  }));
}

function pickField(entry: TestEntry, series: ChartSeries) {
  return toNumber(getFieldValue(entry.values, series.key));
}

const isNumeric = (field: FieldDefinition) =>
  field.type === "number" || field.type === "duration";

function FieldStatBadges({
  fields,
  entries,
  accent,
}: {
  fields: FieldDefinition[];
  entries: TestEntry[];
  accent: AccentColor;
}) {
  const style = ACCENT_STYLES[accent];
  return (
    <div className="flex flex-wrap gap-2">
      {fields.map((field) => {
        const stats = computeFieldStats(field, entries);
        if (stats.average === undefined) return null;
        return (
          <span
            key={field.fieldKey}
            className={`badge badge-outline gap-1.5 py-3 text-xs ${style.text} ${style.badgeBorder}`}
          >
            <b>{field.label}</b>
            média {formatWithUnit(stats.average, field.unit)} · mín{" "}
            {formatWithUnit(stats.min, field.unit)} · máx{" "}
            {formatWithUnit(stats.max, field.unit)}
          </span>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CalibraBot · Motores
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

function buildMotorCombinations(entries: TestEntry[]): MotorCombination[] {
  const combinations = new Map<string, MotorCombination>();

  for (const entry of entries) {
    const grouped = new Map<string, MotorSample>();

    for (const value of entry.values) {
      const match = value.fieldKey.match(/^(.*)__(rotacao|tempo)$/);
      if (!match) continue;

      const [, key, variable] = match;
      const sample = grouped.get(key) ?? { rotation: null, time: null };
      grouped.set(key, sample);

      const numeric = toNumber(value.value);
      if (numeric === null) continue;

      if (variable === "rotacao") sample.rotation = numeric;
      else sample.time = numeric;
    }

    for (const [key, sample] of grouped) {
      const combination = combinations.get(key) ?? {
        key,
        label: key.replaceAll("__", " + "),
        samples: [],
      };
      combinations.set(key, combination);
      combination.samples.push(sample);
    }
  }

  return Array.from(combinations.values());
}

/** Rotação média de cada combinação, separada por tempo de execução. */
function rotationByTime(combinations: MotorCombination[]) {
  const groups = new Map<number, Map<string, number[]>>();

  for (const combination of combinations) {
    for (const sample of combination.samples) {
      if (sample.time === null || sample.rotation === null) continue;
      const byCombination = groups.get(sample.time) ?? new Map<string, number[]>();
      groups.set(sample.time, byCombination);
      byCombination.set(combination.key, [
        ...(byCombination.get(combination.key) ?? []),
        sample.rotation,
      ]);
    }
  }

  const labels = new Map(combinations.map((c) => [c.key, c.label]));

  return Array.from(groups.entries())
    .sort(([a], [b]) => a - b)
    .map(([time, byCombination]) => ({
      time,
      data: Array.from(byCombination.entries()).map(
        ([key, numbers]): CategoryDatum => ({
          name: labels.get(key) ?? key,
          value: Math.round((average(numbers) ?? 0) * 100) / 100,
          extras: [
            { label: "Execuções", text: String(numbers.length) },
            { label: "Tempo de execução", text: `${time} s` },
          ],
        }),
      ),
    }));
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
  const style = ACCENT_STYLES[accent];
  const rotationFields = fields.filter((f) => f.fieldKey.endsWith("__rotacao"));
  const timeFields = fields.filter((f) => f.fieldKey.endsWith("__tempo"));
  const combinations = useMemo(() => buildMotorCombinations(entries), [entries]);
  const groups = useMemo(() => rotationByTime(combinations), [combinations]);

  const evolutionSeries = useMemo(() => fieldSeries(rotationFields), [rotationFields]);
  const evolutionRows = useMemo(
    () => buildExecutionRows(entries, evolutionSeries, pickField),
    [entries, evolutionSeries],
  );

  const timeData: CategoryDatum[] = combinations.flatMap((combination) => {
    const times = combination.samples
      .map((s) => s.time)
      .filter((v): v is number => v !== null);
    const mean = average(times);
    return mean === null
      ? []
      : [
          {
            name: combination.label,
            value: Math.round(mean * 100) / 100,
            extras: [{ label: "Execuções", text: String(times.length) }],
          },
        ];
  });

  if (rotationFields.length === 0 && timeFields.length === 0) {
    return <EmptyState>Nenhum motor configurado para este teste ainda.</EmptyState>;
  }

  if (entries.length === 0) {
    return (
      <EmptyState>Registre uma execução para ver a comparação das combinações.</EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {rotationFields.length > 0 && (
        <SeriesChartPanel
          icon={TrendingUp}
          title="Rotação por execução"
          subtitle="Evolução da rotação de cada motor/dupla"
          series={evolutionSeries}
          rows={evolutionRows}
          defaultType="line"
          types={["line", "area", "bar", "stacked", "step", "scatter", "radar"]}
        />
      )}

      {groups.length > 0 && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {groups.map((group) => (
            <CategoryChartPanel
              key={group.time}
              icon={RotateCw}
              title={`Rotação · ${group.time} s`}
              subtitle="Média por combinação de motores"
              measure={{ key: "value", label: "Rotação", unit: "RPM" }}
              data={group.data}
              defaultType="bar"
            />
          ))}
        </div>
      )}

      {timeFields.length > 0 && timeData.length > 0 && (
        <CategoryChartPanel
          icon={Timer}
          title="Tempo médio de execução"
          subtitle="Média por combinação de motores"
          measure={{ key: "value", label: "Tempo", unit: "s" }}
          data={timeData}
          defaultType="bar"
        />
      )}

      <div className="flex flex-wrap gap-2">
        {combinations.map((combination) => {
          const rotation = average(
            combination.samples
              .map((s) => s.rotation)
              .filter((v): v is number => v !== null),
          );
          const time = average(
            combination.samples
              .map((s) => s.time)
              .filter((v): v is number => v !== null),
          );
          return (
            <span
              key={combination.key}
              className={`badge badge-outline gap-1.5 py-3 text-xs ${style.text} ${style.badgeBorder}`}
            >
              <b>{combination.label}</b>
              {rotation !== null && <> média {formatWithUnit(rotation, "RPM")}</>}
              {time !== null && <> · {formatWithUnit(time, "s")}</>}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CalibraBot · Giroscópio / PID
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
  const comparable = useMemo(() => fields.filter(isNumeric), [fields]);
  const series = useMemo(() => fieldSeries(comparable), [comparable]);
  const rows = useMemo(
    () => buildExecutionRows(entries, series, pickField),
    [entries, series],
  );

  if (comparable.length === 0) {
    return <EmptyState>Nenhuma variável numérica configurada para comparar.</EmptyState>;
  }

  if (entries.length === 0) {
    return <EmptyState>Registre uma execução para ver a comparação das variáveis.</EmptyState>;
  }

  return (
    <SeriesChartPanel
      icon={Gauge}
      title="Comparativo entre variáveis"
      subtitle="Clique nas legendas para ocultar séries"
      series={series}
      rows={rows}
      defaultType="line"
      footer={<FieldStatBadges fields={comparable} entries={entries} accent={accent} />}
    />
  );
}

// ---------------------------------------------------------------------------
// Personalizado — o usuário escolhe os parâmetros e o tipo de gráfico.
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
  const comparable = useMemo(() => fields.filter(isNumeric), [fields]);
  const [selected, setSelected] = useState<string[]>(() =>
    comparable.slice(0, 3).map((f) => f.fieldKey),
  );

  const active = useMemo(
    () => comparable.filter((f) => selected.includes(f.fieldKey)),
    [comparable, selected],
  );
  const series = useMemo(() => fieldSeries(active), [active]);
  const rows = useMemo(
    () => buildExecutionRows(entries, series, pickField),
    [entries, series],
  );

  const toggle = (key: string) =>
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  if (comparable.length === 0) {
    return (
      <EmptyState>Este teste não tem parâmetros numéricos para comparar em gráfico.</EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="card border border-base-300/70 bg-base-100 shadow-sm">
        <div className="card-body gap-3 p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <SlidersHorizontal className="size-4 text-primary" />
            Escolha o que comparar
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {comparable.map((field) => (
              <button
                key={field.fieldKey}
                type="button"
                aria-pressed={selected.includes(field.fieldKey)}
                onClick={() => toggle(field.fieldKey)}
                className={`btn btn-sm rounded-full ${
                  selected.includes(field.fieldKey)
                    ? "btn-primary"
                    : "btn-ghost border-base-300 text-base-content/60"
                }`}
              >
                {field.label}
                {field.unit ? <span className="opacity-60">{field.unit}</span> : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <EmptyState>Registre uma execução para ver a comparação.</EmptyState>
      ) : active.length === 0 ? (
        <EmptyState>Selecione ao menos um parâmetro acima para montar o gráfico.</EmptyState>
      ) : (
        <SeriesChartPanel
          icon={TrendingUp}
          title="Comparativo de parâmetros"
          series={series}
          rows={rows}
          defaultType="line"
          footer={<FieldStatBadges fields={active} entries={entries} accent={accent} />}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Entry point
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
  const cfg = (config && typeof config === "object" ? config : {}) as Record<string, unknown>;

  if (mode === "individual" || (mode === "calibrabot" && cfg.tipo === "motores")) {
    return <MotorsCharts fields={fields} entries={entries} accent={accent} />;
  }

  if (mode === "calibrabot") {
    return <CalibrabotVariablesChart fields={fields} entries={entries} accent={accent} />;
  }

  if (mode === "custom") {
    return <CustomComparisonChart fields={fields} entries={entries} accent={accent} />;
  }

  return null;
}
