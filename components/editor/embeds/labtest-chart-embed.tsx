"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, FlaskConical, LineChart as LineChartIcon } from "lucide-react";
import type { FieldDefinition, TestEntry } from "@/types/labtest.types";
import { getFieldValue } from "@/types/labtest.types";
import { getModeDefinition } from "@/utils/labtest/modes";
import { computeFieldStats, entryTotal } from "@/utils/labtest/stats";
import { scoreFllExecution, type FllMissionDefinition } from "@/utils/labtest/fll";
import { FllRunsCharts } from "@/components/labtest/FllRunsCharts";
import { LabTestModeCharts } from "@/components/labtest/LabTestModeCharts";
import { CustomTooltip } from "@/components/labtest/shared";
import { EmbedShell, EmbedSkeleton } from "./embed-shell";
import { loadMissionCatalog, useEmbedData } from "./embed-data";
import { EMBED_HREF, type LabTestChartOptions } from "./embed-types";

// Mesma paleta de LabTestModeCharts.
const PALETTE = ["#cf2a2a", "#1e459f", "#fabd32", "#6ca3c8", "#466421", "#efb24b", "#de5017"];
const TOTAL_KEY = "__total";

type Series = { key: string; label: string; unit?: string | null; color: string };
type SummaryResult = {
  loading: boolean;
  available: Series[];
  active: Series[];
  data: Record<string, string | number>[];
};

/**
 * Séries do resumo:
 *  - Runs com temporada → pontuação total de cada execução (regras da FLL);
 *  - Runs sem temporada → total + cada parâmetro numérico;
 *  - demais modos       → parâmetros numéricos.
 */
function useSummary(
  mode: string,
  season: string | null,
  fields: FieldDefinition[],
  entries: TestEntry[],
  selected: string[] | undefined,
): SummaryResult {
  const isFll = mode === "runs" && !!season;
  const [missions, setMissions] = useState<FllMissionDefinition[] | null>(null);

  useEffect(() => {
    if (!isFll || !season) return;
    let active = true;
    loadMissionCatalog()
      .then((all) => {
        const list = all[season];
        if (active) setMissions(Array.isArray(list) ? (list as FllMissionDefinition[]) : []);
      })
      .catch(() => active && setMissions([]));
    return () => {
      active = false;
    };
  }, [isFll, season]);

  return useMemo<SummaryResult>(() => {
    const numeric = fields.filter((f) => f.type === "number" || f.type === "duration");
    const rowName = (e: TestEntry, i: number) => `#${e.executionNumber ?? i + 1}`;

    if (isFll) {
      if (!missions) return { loading: true, available: [], active: [], data: [] };
      const s: Series = { key: TOTAL_KEY, label: "Pontuação total", unit: "pts", color: PALETTE[0] };
      const data = entries.map((e, i) => ({
        name: rowName(e, i),
        [TOTAL_KEY]: scoreFllExecution(missions, e.fllAnswers),
      }));
      return { loading: false, available: [s], active: [s], data };
    }

    const available: Series[] = [];
    if (mode === "runs" && numeric.length > 0) {
      available.push({ key: TOTAL_KEY, label: "Total", color: PALETTE[0] });
    }
    numeric.forEach((f, i) =>
      available.push({
        key: f.fieldKey,
        label: f.label,
        unit: f.unit,
        color: PALETTE[(i + (mode === "runs" ? 1 : 0)) % PALETTE.length],
      }),
    );

    const defaults =
      mode === "runs" ? available.filter((s) => s.key === TOTAL_KEY) : available;
    const chosen = selected?.length
      ? available.filter((s) => selected.includes(s.key))
      : defaults;
    const active = chosen.length ? chosen : defaults;

    const data = entries.map((e, i) => {
      const row: Record<string, string | number> = { name: rowName(e, i) };
      for (const s of active) {
        if (s.key === TOTAL_KEY) {
          row[s.key] = entryTotal(e, fields);
        } else {
          const raw = getFieldValue(e.values, s.key);
          row[s.key] = typeof raw === "number" ? raw : 0;
        }
      }
      return row;
    });

    return { loading: false, available, active, data };
  }, [isFll, missions, fields, entries, mode, selected]);
}

export function LabTestChartEmbed({
  refId,
  label,
  options,
  onOptionsChange,
  onRemove,
}: {
  refId: string;
  label: string;
  options: LabTestChartOptions;
  onOptionsChange: (next: LabTestChartOptions) => void;
  onRemove: () => void;
}) {
  const { data, error, loading, refresh } = useEmbedData("labtest-chart", refId);

  const view = options.view ?? "resumo";
  const chartType = options.chartType ?? "line";

  const summary = useSummary(
    data?.test.mode ?? "",
    data?.test.season ?? null,
    data?.fields ?? [],
    data?.entries ?? [],
    options.fieldKeys,
  );

  const mode = data ? getModeDefinition(data.test.mode) : null;
  const canPickSeries = view === "resumo" && summary.available.length > 1;
  // "Completo" reaproveita os gráficos da página do teste; Runs sem temporada
  // não tem painel próprio, então fica sempre no resumo.
  const hasFullView = !!data && !(data.test.mode === "runs" && !data.test.season);

  const toggleSeries = (key: string) => {
    const current = summary.active.map((s) => s.key);
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    if (next.length === 0) return;
    onOptionsChange({ ...options, fieldKeys: next });
  };

  const toolbar = data && (
    <>
      {view === "resumo" && (
        <div className="join mr-1">
          <button
            type="button"
            title="Linhas"
            onClick={() => onOptionsChange({ ...options, chartType: "line" })}
            className={`btn btn-xs join-item ${chartType === "line" ? "btn-neutral" : "btn-ghost"}`}
          >
            <LineChartIcon size={12} />
          </button>
          <button
            type="button"
            title="Barras"
            onClick={() => onOptionsChange({ ...options, chartType: "bar" })}
            className={`btn btn-xs join-item ${chartType === "bar" ? "btn-neutral" : "btn-ghost"}`}
          >
            <BarChart3 size={12} />
          </button>
        </div>
      )}
      {hasFullView && (
        <div className="join mr-1">
          {(["resumo", "completo"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onOptionsChange({ ...options, view: v })}
              className={`btn btn-xs join-item capitalize ${view === v ? "btn-neutral" : "btn-ghost"}`}
            >
              {v}
            </button>
          ))}
        </div>
      )}
    </>
  );

  const Chart = chartType === "bar" ? BarChart : LineChart;

  return (
    <EmbedShell
      kind="labtest-chart"
      icon={FlaskConical}
      href={EMBED_HREF["labtest-chart"](refId)}
      loading={loading}
      error={error}
      fallbackLabel={label}
      onRefresh={refresh}
      onRemove={onRemove}
      toolbar={toolbar}
    >
      {!data || !mode ? (
        <EmbedSkeleton height="h-64" />
      ) : (
        <div className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-semibold">{data.test.name}</h4>
            <span className="badge badge-outline badge-sm gap-1">
              <mode.icon size={11} />
              {mode.label}
            </span>
            {data.test.season && (
              <span className="badge badge-ghost badge-sm">{data.test.season}</span>
            )}
            <span className="text-xs text-base-content/45">
              {data.entries.length} execuç{data.entries.length === 1 ? "ão" : "ões"}
            </span>
          </div>

          {view === "completo" && hasFullView ? (
            data.test.mode === "runs" && data.test.season ? (
              <FllRunsCharts season={data.test.season} entries={data.entries} accent={mode.accent} />
            ) : (
              <LabTestModeCharts
                mode={data.test.mode}
                config={data.test.config}
                fields={data.fields}
                entries={data.entries}
                accent={mode.accent}
              />
            )
          ) : summary.loading ? (
            <EmbedSkeleton height="h-60" />
          ) : data.entries.length === 0 ? (
            <p className="rounded-xl border border-dashed border-base-300 py-10 text-center text-sm text-base-content/45">
              Este teste ainda não tem execuções registradas.
            </p>
          ) : summary.available.length === 0 ? (
            <p className="rounded-xl border border-dashed border-base-300 py-10 text-center text-sm text-base-content/45">
              Este teste não tem parâmetros numéricos para exibir em gráfico.
            </p>
          ) : (
            <>
              {canPickSeries && (
                <div className="no-print flex flex-wrap gap-1.5">
                  {summary.available.map((s) => {
                    const on = summary.active.some((a) => a.key === s.key);
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => toggleSeries(s.key)}
                        className={`btn btn-xs rounded-lg ${on ? "text-white" : "btn-ghost text-base-content/50"}`}
                        style={on ? { backgroundColor: s.color, borderColor: s.color } : undefined}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              )}

              <ResponsiveContainer width="100%" height={260}>
                <Chart data={summary.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(97% 0 0)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#12121275" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#12121275" />
                  <Tooltip content={<CustomTooltip />} />
                  {summary.active.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
                  {summary.active.map((s) =>
                    chartType === "bar" ? (
                      <Bar
                        key={s.key}
                        dataKey={s.key}
                        name={s.label}
                        fill={s.color}
                        radius={[6, 6, 0, 0]}
                        isAnimationActive={false}
                      />
                    ) : (
                      <Line
                        key={s.key}
                        type="monotone"
                        dataKey={s.key}
                        name={s.label}
                        stroke={s.color}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: s.color }}
                        activeDot={{ r: 5 }}
                        isAnimationActive={false}
                      />
                    ),
                  )}
                </Chart>
              </ResponsiveContainer>

              <SummaryBadges series={summary.active} data={summary.data} fields={data.fields} entries={data.entries} />
            </>
          )}
        </div>
      )}
    </EmbedShell>
  );
}

function SummaryBadges({
  series,
  data,
  fields,
  entries,
}: {
  series: Series[];
  data: Record<string, string | number>[];
  fields: FieldDefinition[];
  entries: TestEntry[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {series.map((s) => {
        const field = fields.find((f) => f.fieldKey === s.key);
        let avg: number | undefined;
        let best: number | undefined;
        if (field && field.type !== "boolean") {
          const st = computeFieldStats(field, entries);
          avg = st.average;
          best = st.best;
        } else {
          const nums = data.map((r) => Number(r[s.key])).filter((n) => Number.isFinite(n));
          if (nums.length) {
            avg = Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
            best = Math.max(...nums);
          }
        }
        if (avg == null) return null;
        const unit = s.unit ? ` ${s.unit}` : "";
        return (
          <span key={s.key} className="badge badge-outline gap-1.5 py-3 text-xs" style={{ color: s.color }}>
            {s.label}: média {avg}
            {unit} · melhor {best}
            {unit}
          </span>
        );
      })}
    </div>
  );
}
