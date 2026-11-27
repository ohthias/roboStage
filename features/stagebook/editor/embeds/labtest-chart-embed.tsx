"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Filter, FlaskConical, SlidersHorizontal, X } from "lucide-react";
import type { FieldDefinition, TestEntry } from "@/features/labtest/types";
import { getFieldValue } from "@/features/labtest/types";
import { getModeDefinition } from "@/features/labtest/lib/modes";
import { computeFieldStats, entryTotal } from "@/features/labtest/lib/stats";
import { type FllMissionDefinition } from "@/features/labtest/lib/fll";
import { fllEntryScore, missionsForTest } from "@/features/labtest/lib/fll-analysis";
import { FllRunsCharts } from "@/features/labtest/components/FllRunsCharts";
import { LabTestModeCharts } from "@/features/labtest/components/LabTestModeCharts";
import { CustomTooltip } from "@/features/labtest/components/shared";
import { CHART_TYPE_META } from "@/features/labtest/components/charts/chart-panel";
import { EmbedShell, EmbedSkeleton } from "./embed-shell";
import { useEmbedData } from "./embed-data";
import { loadSeasonMissions } from "@/lib/data/missions-client";
import {
  EMBED_HREF,
  type EmbedLayoutOptions,
  type LabTestChartOptions,
  type LabTestChartType,
  type LabTestFilter,
} from "./embed-types";
import {
  EmbedLayoutFrame,
  EmbedPopover,
  HeightControls,
  LayoutControls,
  PopoverSection,
} from "./embed-layout";
import {
  CHART_HEIGHT_PX,
  LABTEST_CHART_TYPES,
  chartTypeDisabledReason,
  cleanLabTestFilter,
  describeLabTestFilter,
  filterLabTestEntries,
  isSectionVisible,
  labTestSections,
  normalizeChartType,
  normalizeHeight,
  toggleHiddenSection,
} from "./embed-options";

type Options = LabTestChartOptions & EmbedLayoutOptions;

// Mesma paleta de LabTestModeCharts.
const PALETTE = ["#cf2a2a", "#1e459f", "#fabd32", "#6ca3c8", "#466421", "#efb24b", "#de5017"];
const TOTAL_KEY = "__total";

type Series = { key: string; label: string; unit?: string | null; color: string };

/** Missões da temporada (só para Runs com temporada). null = carregando. */
function useFllMissions(
  isFll: boolean,
  season: string | null,
  missionIds: unknown,
  entries: TestEntry[],
): FllMissionDefinition[] | null {
  const [loaded, setLoaded] = useState<{ season: string; list: FllMissionDefinition[] } | null>(null);

  useEffect(() => {
    if (!isFll || !season) return;
    let active = true;
    loadSeasonMissions<FllMissionDefinition>(season)
      .then((list) => active && setLoaded({ season, list }))
      .catch(() => active && setLoaded({ season, list: [] }));
    return () => {
      active = false;
    };
  }, [isFll, season]);

  return useMemo(() => {
    if (!isFll || !season) return [];
    if (loaded?.season !== season) return null;
    return missionsForTest(loaded.list, missionIds, entries);
  }, [isFll, season, loaded, missionIds, entries]);
}

/**
 * Séries disponíveis:
 *  - Runs com temporada → pontuação total de cada execução (regras da FLL);
 *  - Runs sem temporada → total + cada parâmetro numérico;
 *  - demais modos       → parâmetros numéricos.
 */
function availableSeries(mode: string, isFll: boolean, fields: FieldDefinition[]): Series[] {
  if (isFll) return [{ key: TOTAL_KEY, label: "Pontuação total", unit: "pts", color: PALETTE[0] }];
  const numeric = fields.filter((f) => f.type === "number" || f.type === "duration");
  const out: Series[] = [];
  if (mode === "runs" && numeric.length > 0) out.push({ key: TOTAL_KEY, label: "Total", color: PALETTE[0] });
  numeric.forEach((f, i) =>
    out.push({
      key: f.fieldKey,
      label: f.label,
      unit: f.unit,
      color: PALETTE[(i + (mode === "runs" ? 1 : 0)) % PALETTE.length],
    }),
  );
  return out;
}

export function LabTestChartEmbed({
  refId,
  label,
  options,
  editable,
  onOptionsChange,
  onRemove,
}: {
  refId: string;
  label: string;
  options: Options;
  editable: boolean;
  onOptionsChange: (next: Options) => void;
  onRemove: () => void;
}) {
  const { data, error, loading, refresh } = useEmbedData("labtest-chart", refId);

  const testMode = data?.test.mode ?? "";
  const season = data?.test.season ?? null;
  const isFll = testMode === "runs" && !!season;
  const fields = useMemo(() => data?.fields ?? [], [data]);
  const allEntries = useMemo(() => data?.entries ?? [], [data]);
  const missions = useFllMissions(isFll, season, data?.test.config?.missions, allEntries);

  // "Completo" reaproveita os gráficos da página do teste; Runs sem temporada
  // não tem painel próprio, então fica sempre no resumo.
  const hasFullView = !!data && !(data.test.mode === "runs" && !data.test.season);
  const view = hasFullView ? (options.view ?? "resumo") : "resumo";
  const chartType = normalizeChartType(options.chartType);
  const chartHeight = normalizeHeight(options.chartHeight, "md");

  const available = useMemo(() => availableSeries(testMode, isFll, fields), [testMode, isFll, fields]);
  const labelOf = (key: string) => available.find((s) => s.key === key)?.label ?? key;

  const valueOf = useMemo(
    () =>
      (entry: TestEntry, key: string): number | null => {
        if (key === TOTAL_KEY) {
          if (isFll) return missions ? fllEntryScore(missions, entry) : null;
          return entryTotal(entry, fields);
        }
        const raw = getFieldValue(entry.values, key);
        return typeof raw === "number" ? raw : null;
      },
    [isFll, missions, fields],
  );

  const rawFilter = options.filter;
  const filter = cleanLabTestFilter(rawFilter);
  const waitingMissions = isFll && missions === null;
  const entries = useMemo(
    () => (waitingMissions ? [] : filterLabTestEntries(allEntries, rawFilter, valueOf)),
    [allEntries, rawFilter, valueOf, waitingMissions],
  );

  const active = useMemo(() => {
    const defaults = testMode === "runs" ? available.filter((s) => s.key === TOTAL_KEY) : available;
    const chosen = options.fieldKeys?.length
      ? available.filter((s) => options.fieldKeys!.includes(s.key))
      : defaults;
    return chosen.length ? chosen : defaults;
  }, [available, options.fieldKeys, testMode]);

  const rows = useMemo(
    () =>
      entries.map((e, i) => {
        const row: Record<string, string | number> = { name: `#${e.executionNumber ?? i + 1}` };
        for (const s of active) row[s.key] = valueOf(e, s.key) ?? 0;
        return row;
      }),
    [entries, active, valueOf],
  );

  const sections = labTestSections(view, testMode, season, data?.test.config);
  const shown = (id: string) => isSectionVisible(options.hiddenSections, id);
  const filterChips = describeLabTestFilter(filter, labelOf);
  const mode = data ? getModeDefinition(data.test.mode) : null;

  const set = (patch: Partial<Options>) => onOptionsChange({ ...options, ...patch });
  const setFilter = (next: LabTestFilter | undefined) => set({ filter: cleanLabTestFilter(next) });

  const toggleSeries = (key: string) => {
    const current = active.map((s) => s.key);
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    if (next.length === 0) return;
    set({ fieldKeys: next });
  };

  const toolbar = data && editable && (
    <>
      <EmbedPopover
        icon={<Filter size={13} />}
        label="Filtrar execuções"
        badge={filterChips.length}
        width={320}
      >
        <FilterControls
          filter={filter}
          series={available}
          total={allEntries.length}
          shown={entries.length}
          onChange={setFilter}
        />
      </EmbedPopover>
      <EmbedPopover icon={<SlidersHorizontal size={13} />} label="Configurar bloco" width={320}>
        {hasFullView && (
          <PopoverSection title="Visualização">
            <div className="join w-full">
              {(["resumo", "completo"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set({ view: v })}
                  className={`btn join-item btn-sm flex-1 capitalize ${view === v ? "btn-neutral" : "btn-ghost border-base-300"}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <p className="text-xs text-base-content/50">
              {view === "resumo"
                ? "Um gráfico compacto com os parâmetros escolhidos."
                : "Os mesmos painéis da página do teste."}
            </p>
          </PopoverSection>
        )}

        <PopoverSection title={view === "resumo" ? "Tipo de gráfico" : "Tipo inicial dos gráficos"}>
          <ChartTypeGrid
            value={chartType}
            seriesCount={view === "resumo" ? active.length : 2}
            rowCount={entries.length}
            onChange={(t) => set({ chartType: t })}
          />
        </PopoverSection>

        {view === "resumo" && available.length > 1 && (
          <PopoverSection title="O que mostrar">
            <div className="flex flex-wrap gap-1.5">
              {available.map((s) => {
                const on = active.some((a) => a.key === s.key);
                return (
                  <button
                    key={s.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleSeries(s.key)}
                    className={`btn btn-xs rounded-lg ${on ? "text-white" : "btn-ghost border-base-300 text-base-content/55"}`}
                    style={on ? { backgroundColor: s.color, borderColor: s.color } : undefined}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </PopoverSection>
        )}

        {sections.length > 1 && (
          <PopoverSection title="Partes do bloco">
            <div className="space-y-1">
              {sections.map((sec) => (
                <label key={sec.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-1 py-0.5 hover:bg-base-200">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-xs checkbox-primary"
                    checked={shown(sec.id)}
                    onChange={() =>
                      set({ hiddenSections: toggleHiddenSection(options.hiddenSections, sec.id, sections) })
                    }
                  />
                  <span className="text-sm">{sec.label}</span>
                </label>
              ))}
            </div>
          </PopoverSection>
        )}

        {view === "resumo" && (
          <>
            <PopoverSection title="Detalhes do gráfico">
              <Toggle label="Linha da média" checked={!!options.showAverage} onChange={(v) => set({ showAverage: v })} />
              <Toggle label="Valores nos pontos" checked={!!options.showLabels} onChange={(v) => set({ showLabels: v })} />
            </PopoverSection>
            <HeightControls title="Altura do gráfico" value={chartHeight} onChange={(h) => set({ chartHeight: h })} />
          </>
        )}

        <LayoutControls layout={options} onChange={(next) => set(next)} />
      </EmbedPopover>
    </>
  );

  let body: ReactNode;
  if (!data || !mode) {
    body = <EmbedSkeleton height="h-64" />;
  } else if (waitingMissions) {
    body = <EmbedSkeleton height="h-60" />;
  } else if (allEntries.length === 0) {
    body = <EmptyNote>Este teste ainda não tem execuções registradas.</EmptyNote>;
  } else if (entries.length === 0) {
    body = (
      <EmptyNote>
        Nenhuma execução atende aos filtros.{" "}
        {editable && (
          <button type="button" className="link link-primary no-print" onClick={() => setFilter(undefined)}>
            Limpar filtros
          </button>
        )}
      </EmptyNote>
    );
  } else if (view === "completo") {
    body = isFll ? (
      <FllRunsCharts
        season={data.test.season!}
        missionIds={data.test.config?.missions}
        entries={entries}
        accent={mode.accent}
        hiddenSections={options.hiddenSections}
        seriesType={options.chartType ? chartType : undefined}
      />
    ) : (
      <LabTestModeCharts
        mode={data.test.mode}
        config={data.test.config}
        fields={data.fields}
        entries={entries}
        accent={mode.accent}
        hiddenSections={options.hiddenSections}
        seriesType={options.chartType ? chartType : undefined}
      />
    );
  } else if (available.length === 0) {
    body = <EmptyNote>Este teste não tem parâmetros numéricos para exibir em gráfico.</EmptyNote>;
  } else {
    body = (
      <>
        {shown("chart") && (
          <SummaryChart
            type={chartType}
            series={active}
            rows={rows}
            height={CHART_HEIGHT_PX[chartHeight]}
            showAverage={!!options.showAverage}
            showLabels={!!options.showLabels}
          />
        )}
        {shown("stats") && <SummaryBadges series={active} rows={rows} fields={fields} entries={entries} />}
      </>
    );
  }

  return (
    <EmbedLayoutFrame layout={options} editable={editable} onChange={(next) => set(next)}>
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
          body
        ) : (
          <div className="space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base font-semibold">{data.test.name}</h4>
              <span className="badge badge-outline badge-sm gap-1">
                <mode.icon size={11} />
                {mode.label}
              </span>
              {data.test.season && <span className="badge badge-ghost badge-sm">{data.test.season}</span>}
              <span className="text-xs text-base-content/45">
                {filterChips.length > 0 && !waitingMissions
                  ? `${entries.length} de ${allEntries.length} execuções`
                  : `${allEntries.length} execuç${allEntries.length === 1 ? "ão" : "ões"}`}
              </span>
            </div>

            {filterChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <Filter size={12} className="text-base-content/40" />
                {filterChips.map((chip) => (
                  <span key={chip} className="badge badge-soft badge-primary badge-sm">
                    {chip}
                  </span>
                ))}
                {editable && (
                  <button
                    type="button"
                    className="no-print btn btn-ghost btn-xs gap-1 text-base-content/55"
                    onClick={() => setFilter(undefined)}
                  >
                    <X size={11} /> Limpar
                  </button>
                )}
              </div>
            )}

            {body}
          </div>
        )}
      </EmbedShell>
    </EmbedLayoutFrame>
  );
}

// ---------------------------------------------------------------------------
// Peças
// ---------------------------------------------------------------------------

function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-base-300 py-10 text-center text-sm text-base-content/45">
      {children}
    </p>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 text-sm">
      {label}
      <input
        type="checkbox"
        className="toggle toggle-sm toggle-primary"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

function ChartTypeGrid({
  value,
  seriesCount,
  rowCount,
  onChange,
}: {
  value: LabTestChartType;
  seriesCount: number;
  rowCount: number;
  onChange: (t: LabTestChartType) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-1" role="radiogroup" aria-label="Tipo de gráfico">
      {LABTEST_CHART_TYPES.map((t) => {
        const meta = CHART_TYPE_META[t];
        const Icon = meta.icon;
        const reason = chartTypeDisabledReason(t, seriesCount, rowCount);
        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={value === t}
            disabled={!!reason}
            title={reason ? `${meta.label} — ${reason}` : meta.label}
            onClick={() => onChange(t)}
            className={`btn btn-sm h-auto flex-col gap-0.5 px-1 py-1.5 text-[10px] font-normal ${
              value === t ? "btn-neutral" : "btn-ghost border-base-300"
            }`}
          >
            <Icon size={15} />
            {meta.label.replace("Barras empilhadas", "Empilhado")}
          </button>
        );
      })}
    </div>
  );
}

/** Campo numérico que só grava ao sair do campo ou apertar Enter. */
function DraftNumber({
  value,
  placeholder,
  onCommit,
  min,
  step,
  label,
}: {
  value: number | undefined;
  placeholder?: string;
  onCommit: (v: number | undefined) => void;
  min?: number;
  step?: number;
  label: string;
}) {
  const [draft, setDraft] = useState(value == null ? "" : String(value));
  // Valor mudou por fora (ex.: "Limpar filtros"): reinicia o rascunho.
  const [synced, setSynced] = useState(value);
  if (synced !== value) {
    setSynced(value);
    setDraft(value == null ? "" : String(value));
  }
  const commit = () => {
    const n = draft.trim() === "" ? undefined : Number(draft.replace(",", "."));
    if (n === value || (n !== undefined && !Number.isFinite(n))) return;
    onCommit(n);
  };
  return (
    <input
      type="number"
      inputMode="decimal"
      aria-label={label}
      className="input input-sm input-bordered w-full"
      value={draft}
      min={min}
      step={step}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && commit()}
    />
  );
}

function FilterControls({
  filter,
  series,
  total,
  shown,
  onChange,
}: {
  filter: LabTestFilter | undefined;
  series: Series[];
  total: number;
  shown: number;
  onChange: (next: LabTestFilter | undefined) => void;
}) {
  const f = filter ?? {};
  const patch = (p: Partial<LabTestFilter>) => onChange({ ...f, ...p });
  // Parâmetro/comparação escolhidos antes de digitar o valor ficam aqui.
  const [pending, setPending] = useState<{ key?: string; op: "gte" | "lte" }>({ op: "gte" });
  const valueKey = f.value?.key ?? pending.key ?? series[0]?.key ?? "";
  const valueOp = f.value?.op ?? pending.op;

  return (
    <>
      <p className="text-xs text-base-content/55">
        Mostrando <b>{shown}</b> de {total} execuções. Os filtros valem para o resumo e para a visão completa.
      </p>

      <PopoverSection title="Últimas execuções">
        <div className="flex items-center gap-1.5">
          {[5, 10, 20].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => patch({ last: f.last === n ? undefined : n })}
              className={`btn btn-xs ${f.last === n ? "btn-neutral" : "btn-ghost border-base-300"}`}
            >
              {n}
            </button>
          ))}
          <div className="w-24">
            <DraftNumber label="Quantidade de execuções" value={f.last} min={1} placeholder="Todas" onCommit={(v) => patch({ last: v })} />
          </div>
        </div>
      </PopoverSection>

      <PopoverSection title="Intervalo de execuções">
        <div className="flex items-center gap-2">
          <DraftNumber label="Da execução" value={f.fromExec} min={1} placeholder="#de" onCommit={(v) => patch({ fromExec: v })} />
          <span className="text-base-content/40">–</span>
          <DraftNumber label="Até a execução" value={f.toExec} min={1} placeholder="#até" onCommit={(v) => patch({ toExec: v })} />
        </div>
      </PopoverSection>

      <PopoverSection title="Período">
        <div className="flex items-center gap-2">
          <input
            type="date"
            aria-label="Data inicial"
            className="input input-sm input-bordered w-full px-2"
            value={f.dateFrom ?? ""}
            onChange={(e) => patch({ dateFrom: e.target.value || undefined })}
          />
          <span className="text-base-content/40">–</span>
          <input
            type="date"
            aria-label="Data final"
            className="input input-sm input-bordered w-full px-2"
            value={f.dateTo ?? ""}
            onChange={(e) => patch({ dateTo: e.target.value || undefined })}
          />
        </div>
      </PopoverSection>

      {series.length > 0 && (
        <PopoverSection title="Condição de valor">
          <div className="flex items-center gap-1.5">
            <select
              aria-label="Parâmetro"
              className="select select-sm select-bordered min-w-0 flex-1"
              value={valueKey}
              onChange={(e) =>
                f.value
                  ? patch({ value: { ...f.value, key: e.target.value } })
                  : setPending((p) => ({ ...p, key: e.target.value }))
              }
            >
              {series.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              aria-label="Comparação"
              className="select select-sm select-bordered w-16"
              value={valueOp}
              onChange={(e) => {
                const op = e.target.value as "gte" | "lte";
                if (f.value) patch({ value: { ...f.value, op } });
                else setPending((p) => ({ ...p, op }));
              }}
            >
              <option value="gte">≥</option>
              <option value="lte">≤</option>
            </select>
            <div className="w-20">
              <DraftNumber
                label="Valor"
                value={f.value?.value}
                placeholder="valor"
                onCommit={(v) =>
                  patch({
                    value: v === undefined ? undefined : { key: valueKey, op: valueOp, value: v },
                  })
                }
              />
            </div>
          </div>
          <p className="text-xs text-base-content/50">Ex.: só execuções com pontuação ≥ 200.</p>
        </PopoverSection>
      )}

      <button
        type="button"
        className="btn btn-ghost btn-sm w-full border-base-300"
        disabled={!filter}
        onClick={() => onChange(undefined)}
      >
        Limpar filtros
      </button>
    </>
  );
}

function SummaryChart({
  type,
  series,
  rows,
  height,
  showAverage,
  showLabels,
}: {
  type: LabTestChartType;
  series: Series[];
  rows: Record<string, string | number>[];
  height: number;
  showAverage: boolean;
  showLabels: boolean;
}) {
  // Tipo escolhido que não serve para os dados (ex.: radar com 2 execuções) cai para linha.
  const effective = chartTypeDisabledReason(type, series.length, rows.length) ? "line" : type;
  const tick = { fontSize: 11 };
  const labels = (s: Series) =>
    showLabels ? <LabelList dataKey={s.key} position="top" fontSize={10} fill={s.color} /> : null;

  if (effective === "radar") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={rows} outerRadius="75%">
          <PolarGrid />
          <PolarAngleAxis dataKey="name" tick={tick} />
          <PolarRadiusAxis tick={{ fontSize: 9 }} />
          <Tooltip content={<CustomTooltip />} />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {series.map((s) => (
            <Radar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              fill={s.color}
              fillOpacity={0.2}
              isAnimationActive={false}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    );
  }

  const averages = showAverage
    ? series.map((s) => {
        const nums = rows.map((r) => Number(r[s.key])).filter((n) => Number.isFinite(n));
        return { s, avg: nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null };
      })
    : [];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={rows}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(92% 0 0)" vertical={false} />
        <XAxis dataKey="name" tick={tick} stroke="#12121275" />
        <YAxis tick={tick} stroke="#12121275" />
        <Tooltip content={<CustomTooltip />} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {series.map((s) => {
          switch (effective) {
            case "bar":
            case "stacked":
              return (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  fill={s.color}
                  stackId={effective === "stacked" ? "stack" : undefined}
                  radius={effective === "stacked" ? 0 : [6, 6, 0, 0]}
                  isAnimationActive={false}
                >
                  {labels(s)}
                </Bar>
              );
            case "area":
              return (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  fill={s.color}
                  fillOpacity={0.18}
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {labels(s)}
                </Area>
              );
            case "scatter":
              return (
                <Line
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  stroke="transparent"
                  legendType="circle"
                  dot={{ r: 4, fill: s.color, stroke: s.color }}
                  activeDot={{ r: 6, fill: s.color }}
                  isAnimationActive={false}
                >
                  {labels(s)}
                </Line>
              );
            default:
              return (
                <Line
                  key={s.key}
                  type={effective === "step" ? "stepAfter" : "monotone"}
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: s.color }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                >
                  {labels(s)}
                </Line>
              );
          }
        })}
        {averages.map(({ s, avg }) =>
          avg == null ? null : (
            <ReferenceLine
              key={`avg-${s.key}`}
              y={Math.round(avg * 100) / 100}
              stroke={s.color}
              strokeDasharray="5 4"
              strokeOpacity={0.8}
              label={{ value: `média ${Math.round(avg * 10) / 10}`, position: "insideTopRight", fontSize: 10, fill: s.color }}
            />
          ),
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function SummaryBadges({
  series,
  rows,
  fields,
  entries,
}: {
  series: Series[];
  rows: Record<string, string | number>[];
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
          const nums = rows.map((r) => Number(r[s.key])).filter((n) => Number.isFinite(n));
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
