"use client";

// ---------------------------------------------------------------------------
// Desenho de cada bloco do painel do teste (labtest/[id]). Recebe as linhas
// já filtradas (uma por execução) e as métricas derivadas do teste.
// ---------------------------------------------------------------------------

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Download, Minus, Trophy } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartTheme } from "@/components/labtest/charts/chart-theme";
import { SeriesChartPanel } from "@/components/labtest/charts/SeriesChart";
import { buildExecutionRows, formatWithUnit, type ChartSeries } from "@/utils/labtest/chart-data";
import { histogram, movingAverage, pearson, toCsv } from "@/utils/labtest/anatix/analysis";
import {
  VIEW_STAT_LABEL,
  VIEW_WIDGET_SPEC,
  linearFit,
  metricValues,
  resolveWidgetMetrics,
  summarize,
  type MetricSummary,
  type ViewMetric,
  type ViewRow,
  type ViewStat,
  type ViewWidget,
} from "@/utils/labtest/view-dashboard";
import { fmtDate } from "@/components/labtest/shared";
import type { FllMissionDefinition } from "@/utils/labtest/fll";
import { FllMissionGrid, FllMissionRanking, FllMissionTable } from "@/components/labtest/fll/FllMissionViews";

export interface ViewContext {
  rows: ViewRow[];
  metrics: ViewMetric[];
  theme: ChartTheme;
  fileName: string;
  /** Testes da FLL: missões do teste (null = carregando / sem temporada). */
  fll?: { missions: FllMissionDefinition[] } | null;
}

const fmt = (v: number | null | undefined, unit?: string | null) => formatWithUnit(v ?? null, unit);
/** Booleanos aparecem como % (média de 0/1). */
function fmtMetric(m: ViewMetric, v: number | null | undefined) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  if (m.kind === "boolean") return `${Math.round(v * 100)}%`;
  return fmt(v, m.unit);
}
function fmtCell(m: ViewMetric, v: number | null | undefined) {
  if (v === null || v === undefined) return "—";
  if (m.kind === "boolean") return v ? "Sim" : "Não";
  return fmt(v, m.unit);
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-36 items-center justify-center rounded-xl border border-dashed border-base-300 px-4 py-6 text-center text-sm text-base-content/50">
      {children}
    </div>
  );
}

function downloadCsv(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([`﻿${text}`], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const axis = (t: ChartTheme) => ({ stroke: t.axis, fontSize: 11, tickLine: false });
const tip = (t: ChartTheme) => ({
  contentStyle: { background: t.surface, border: `1px solid ${t.grid}`, borderRadius: 12, fontSize: 12 },
  labelStyle: { color: t.text },
  itemStyle: { color: t.text },
});

export function ViewWidgetBody({ widget, ctx, height = 240 }: { widget: ViewWidget; ctx: ViewContext; height?: number }) {
  const metrics = useMemo(() => resolveWidgetMetrics(widget, ctx.metrics), [widget, ctx.metrics]);
  const spec = VIEW_WIDGET_SPEC[widget.type];

  if (ctx.rows.length === 0) return <Empty>Nenhuma execução com os filtros atuais.</Empty>;
  if (spec.fllOnly) {
    if (!ctx.fll) return <Empty>Este bloco é para testes da FLL (carregando as missões da temporada…).</Empty>;
    const entries = ctx.rows.map((r) => r.entry);
    if (widget.type === "fll-missions") return <FllMissionRanking missions={ctx.fll.missions} entries={entries} theme={ctx.theme} height={height} />;
    if (widget.type === "table-missions") return <FllMissionTable missions={ctx.fll.missions} entries={entries} fileName={ctx.fileName} maxHeight={height + 260} />;
    return <FllMissionGrid missions={ctx.fll.missions} entries={entries} theme={ctx.theme} fileName={ctx.fileName} />;
  }
  if (metrics.length < spec.metrics.min) {
    return (
      <Empty>
        {spec.metrics.booleanOnly
          ? "Este teste não tem campos sim/não."
          : widget.type === "targets"
            ? "Nenhum campo com meta definida. Defina metas ao editar o teste."
            : spec.metrics.min > 1
              ? `Precisa de ${spec.metrics.min} métricas numéricas.`
              : "Nenhuma métrica disponível."}
      </Empty>
    );
  }
  const props = { widget, ctx, metrics, height };
  switch (widget.type) {
    case "evolution":
      return <EvolutionWidget {...props} />;
    case "trend":
      return <TrendWidget {...props} />;
    case "kpi":
      return <KpiWidget {...props} />;
    case "stat-bars":
      return <StatBarsWidget {...props} />;
    case "histogram":
      return <HistogramWidget {...props} />;
    case "scatter":
      return <ScatterWidget {...props} />;
    case "success":
      return <SuccessWidget {...props} />;
    case "targets":
      return <TargetsWidget {...props} />;
    case "table-entries":
      return <EntriesTable {...props} />;
    case "table-stats":
      return <StatsTable {...props} />;
    case "table-correlation":
      return <CorrelationTable {...props} />;
    default:
      return null;
  }
}

type Props = { widget: ViewWidget; ctx: ViewContext; metrics: ViewMetric[]; height: number };

// ---- Gráficos -------------------------------------------------------------

function EvolutionWidget({ widget, ctx, metrics, height }: Props) {
  const series = useMemo<ChartSeries[]>(
    () => metrics.map((m) => ({ key: m.key, label: m.label, unit: m.kind === "boolean" ? null : m.unit })),
    [metrics],
  );
  const rows = useMemo(
    () => buildExecutionRows(ctx.rows.map((r) => r.entry), series, (entry, s) => {
      const row = ctx.rows.find((r) => r.entry === entry);
      return row?.values[s.key] ?? null;
    }),
    [ctx.rows, series],
  );
  return (
    <SeriesChartPanel
      key={`${widget.options.chart ?? "line"}-${series.map((s) => s.key).join("|")}`}
      compact
      title={widget.title}
      series={series}
      rows={rows}
      defaultType={widget.options.chart ?? "line"}
      height={height}
    />
  );
}

function TrendWidget({ widget, ctx, metrics, height }: Props) {
  const { theme } = ctx;
  const m = metrics[0];
  const n = widget.options.movingN ?? 3;
  const data = useMemo(() => {
    const { xs, ys } = metricValues(ctx.rows, m.key);
    const ma = movingAverage(ys, n);
    const fit = linearFit(xs, ys);
    return xs.map((x, i) => ({
      x,
      v: ys[i],
      ma: i >= n - 1 ? ma[i] : null,
      trend: fit.intercept + fit.slope * x,
    }));
  }, [ctx.rows, m.key, n]);
  const st = summarize(ctx.rows, m);
  if (!data.length || !st) return <Empty>Sem valores de {m.label} nas execuções filtradas.</Empty>;
  const improving = m.lowerIsBetter ? st.slope < 0 : st.slope > 0;
  const flat = Math.abs(st.slope) < Math.max(1e-9, Math.abs(st.avg) * 0.005);
  const scale = m.kind === "boolean" ? 100 : 1;
  return (
    <div className="flex flex-col gap-2">
      <div style={{ height: height - 30 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data.map((d) => ({ ...d, v: d.v * scale, ma: d.ma === null ? null : d.ma * scale, trend: d.trend * scale }))} margin={{ top: 6, right: 12, bottom: 0, left: -8 }}>
            <CartesianGrid stroke={theme.grid} vertical={false} />
            <XAxis dataKey="x" tickFormatter={(x) => `#${x}`} {...axis(theme)} />
            <YAxis width={52} tickFormatter={(v) => fmt(v)} domain={["auto", "auto"]} {...axis(theme)} />
            <Tooltip {...tip(theme)} labelFormatter={(x) => `Execução #${x}`} formatter={(v, name) => [fmt(Number(v), m.kind === "boolean" ? "%" : m.unit), String(name)]} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {m.target != null && <ReferenceLine y={m.target} stroke={theme.series[4]} strokeDasharray="5 4" label={{ value: "meta", fill: theme.axis, fontSize: 10, position: "insideTopRight" }} />}
            <Bar dataKey="v" name={m.label} fill={theme.series[1]} fillOpacity={0.35} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Line dataKey="ma" name={`Média móvel (${n})`} stroke={theme.series[0]} strokeWidth={2.2} dot={false} connectNulls isAnimationActive={false} />
            <Line dataKey="trend" name="Tendência" stroke={theme.axis} strokeDasharray="6 4" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/60">
        <span className={`badge badge-soft badge-sm gap-1 ${flat ? "badge-ghost" : improving ? "badge-success" : "badge-error"}`}>
          {flat ? <Minus size={11} /> : st.slope > 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
          {flat ? "estável" : improving ? "melhorando" : "piorando"}
        </span>
        <span>{fmt(st.slope * scale)} {m.kind === "boolean" ? "p.p." : (m.unit ?? "")} por execução</span>
        <span>· melhor {fmtMetric(m, st.best)}</span>
      </p>
    </div>
  );
}

function KpiWidget({ ctx, metrics }: Props) {
  const { theme } = ctx;
  const m = metrics[0];
  const st = summarize(ctx.rows, m);
  const { xs, ys } = metricValues(ctx.rows, m.key);
  if (!st) return <Empty>Sem valores de {m.label}.</Empty>;
  const prev = ys.length > 1 ? ys[ys.length - 2] : null;
  const delta = prev === null || st.last === null ? null : st.last - prev;
  const good = delta === null || delta === 0 ? null : m.lowerIsBetter ? delta < 0 : delta > 0;
  const isBest = st.last === st.best && ys.length > 1;
  const spark = xs.map((x, i) => ({ x, v: ys[i] }));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end justify-between gap-2">
        <p className="truncate text-3xl font-black tracking-tight">{fmtMetric(m, m.kind === "boolean" ? st.avg : st.last)}</p>
        {m.kind === "number" && delta !== null && delta !== 0 && (
          <span className={`badge badge-soft badge-sm gap-0.5 ${good ? "badge-success" : "badge-error"}`}>
            {delta > 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
            {fmt(Math.abs(delta))}
          </span>
        )}
      </div>
      <p className="-mt-1 text-[11px] text-base-content/50">
        {m.kind === "boolean" ? "taxa de sucesso nas execuções filtradas" : `última execução (#${xs.at(-1)})`}
        {isBest && m.kind === "number" && (
          <span className="ml-1.5 inline-flex items-center gap-0.5 font-semibold text-success"><Trophy size={11} /> recorde</span>
        )}
      </p>
      {spark.length > 1 && (
        <div className="h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <YAxis hide domain={["auto", "auto"]} />
              <XAxis hide dataKey="x" />
              {m.target != null && <ReferenceLine y={m.target} stroke={theme.axis} strokeDasharray="3 3" />}
              <Area dataKey="v" type="monotone" stroke={theme.series[0]} fill={theme.series[0]} fillOpacity={0.15} strokeWidth={1.8} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="flex flex-wrap gap-x-3 text-[11px] text-base-content/60">
        <span>melhor <b>{fmtMetric(m, st.best)}</b></span>
        <span>média <b>{fmtMetric(m, st.avg)}</b></span>
        {m.target != null && <span>meta <b>{fmt(m.target, m.unit)}</b></span>}
      </p>
    </div>
  );
}

function statOf(st: MetricSummary, k: ViewStat) {
  return k === "last" ? (st.last ?? 0) : st[k];
}

function StatBarsWidget({ widget, ctx, metrics, height }: Props) {
  const { theme } = ctx;
  const stats = widget.options.stats?.length ? widget.options.stats : (["avg", "best"] as ViewStat[]);
  const data = metrics.flatMap((m) => {
    const st = summarize(ctx.rows, m);
    if (!st) return [];
    const row: Record<string, string | number> = { name: m.label };
    for (const k of stats) row[k] = m.kind === "boolean" ? statOf(st, k) * 100 : statOf(st, k);
    return [row];
  });
  if (!data.length) return <Empty>Sem valores nas execuções filtradas.</Empty>;
  const horizontal = data.length > 4;
  return (
    <div style={{ height: horizontal ? Math.max(height, data.length * (14 * stats.length + 12) + 50) : height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 4, right: 12, bottom: 0, left: horizontal ? 4 : -8 }}>
          <CartesianGrid stroke={theme.grid} horizontal={!horizontal} vertical={horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" tickFormatter={(v) => fmt(v)} {...axis(theme)} />
              <YAxis type="category" dataKey="name" width={110} {...axis(theme)} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" interval={0} {...axis(theme)} />
              <YAxis width={52} tickFormatter={(v) => fmt(v)} {...axis(theme)} />
            </>
          )}
          <Tooltip {...tip(theme)} formatter={(v, n) => [fmt(Number(v)), String(n)]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {stats.map((k, i) => (
            <Bar key={k} dataKey={k} name={VIEW_STAT_LABEL[k]} fill={theme.series[i % theme.series.length]} radius={horizontal ? [0, 5, 5, 0] : [5, 5, 0, 0]} isAnimationActive={false} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function HistogramWidget({ widget, ctx, metrics, height }: Props) {
  const { theme } = ctx;
  const m = metrics[0];
  const { ys } = metricValues(ctx.rows, m.key);
  const st = summarize(ctx.rows, m);
  const bins = histogram(ys, widget.options.bins ?? 8);
  if (!st || !bins.length) return <Empty>Sem valores de {m.label}.</Empty>;
  const data = bins.map((b) => ({ ...b, label: fmt(b.mid) }));
  return (
    <div className="flex flex-col gap-2">
      <div style={{ height: height - 26 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={2} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid stroke={theme.grid} vertical={false} />
            <XAxis dataKey="label" {...axis(theme)} />
            <YAxis allowDecimals={false} width={44} {...axis(theme)} />
            <Tooltip
              {...tip(theme)}
              labelFormatter={(_, p) => {
                const b = p?.[0]?.payload as (typeof data)[number] | undefined;
                return b ? `${fmt(b.from, m.unit)} a ${fmt(b.to, m.unit)}` : "";
              }}
              formatter={(v) => [`${v} execução(ões)`, "Quantidade"]}
            />
            <Bar dataKey="count" isAnimationActive={false} radius={[4, 4, 0, 0]}>
              {data.map((b, i) => (
                <Cell key={i} fill={m.target != null && m.target >= b.from && m.target <= b.to ? theme.series[4] : theme.series[1]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="flex flex-wrap gap-x-3 text-[11px] text-base-content/60">
        <span>média <b>{fmtMetric(m, st.avg)}</b></span>
        <span>mediana <b>{fmtMetric(m, st.median)}</b></span>
        <span>desvio <b>{fmt(st.std)}</b></span>
        {st.cv !== null && <span>variação <b>{fmt(st.cv)}%</b></span>}
      </p>
    </div>
  );
}

function ScatterWidget({ ctx, metrics, height }: Props) {
  const { theme } = ctx;
  const [mx, my] = metrics;
  const points = ctx.rows.flatMap((r) => {
    const x = r.values[mx.key];
    const y = r.values[my.key];
    return x == null || y == null ? [] : [{ x, y, n: r.entry.executionNumber }];
  });
  if (points.length < 2) return <Empty>Poucas execuções com {mx.label} e {my.label} preenchidos.</Empty>;
  const r = pearson(points.map((p) => p.x), points.map((p) => p.y));
  const fit = linearFit(points.map((p) => p.x), points.map((p) => p.y));
  const xMin = Math.min(...points.map((p) => p.x));
  const xMax = Math.max(...points.map((p) => p.x));
  return (
    <div className="flex flex-col gap-2">
      <div style={{ height: height - 26 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
            <CartesianGrid stroke={theme.grid} />
            <XAxis type="number" dataKey="x" name={mx.label} domain={["auto", "auto"]} tickFormatter={(v) => fmt(v)} {...axis(theme)} />
            <YAxis type="number" dataKey="y" name={my.label} domain={["auto", "auto"]} tickFormatter={(v) => fmt(v)} width={52} {...axis(theme)} />
            <Tooltip
              {...tip(theme)}
              cursor={{ strokeDasharray: "3 3" }}
              content={({ payload }) => {
                const p = payload?.[0]?.payload as (typeof points)[number] | undefined;
                if (!p) return null;
                return (
                  <div className="rounded-xl border border-base-300 bg-base-100 px-3 py-2 text-xs shadow">
                    <p className="font-semibold">Execução #{p.n}</p>
                    <p>{mx.label}: {fmtCell(mx, p.x)}</p>
                    <p>{my.label}: {fmtCell(my, p.y)}</p>
                  </div>
                );
              }}
            />
            <ReferenceLine
              segment={[{ x: xMin, y: fit.intercept + fit.slope * xMin }, { x: xMax, y: fit.intercept + fit.slope * xMax }]}
              stroke={theme.axis}
              strokeDasharray="6 4"
            />
            <Scatter data={points} fill={theme.series[1]} isAnimationActive={false} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-base-content/60">
        correlação <b>{r === null ? "—" : r.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</b>
        {r !== null && (Math.abs(r) >= 0.7 ? " · forte" : Math.abs(r) >= 0.4 ? " · moderada" : " · fraca")}
        {" "}· {points.length} execuções
      </p>
    </div>
  );
}

function SuccessWidget({ ctx, metrics }: Props) {
  const items = metrics
    .map((m) => {
      const { ys } = metricValues(ctx.rows, m.key);
      const yes = ys.filter((v) => v === 1).length;
      return { m, yes, total: ys.length, pct: ys.length ? (yes / ys.length) * 100 : null };
    })
    .sort((a, b) => (a.pct ?? -1) - (b.pct ?? -1));
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map(({ m, yes, total, pct }) => (
        <li key={m.key} className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate font-semibold" title={m.label}>{m.label}</span>
            <span className="shrink-0 font-mono text-base-content/60">
              {pct === null ? "—" : `${Math.round(pct)}%`} <span className="text-base-content/40">({yes}/{total})</span>
            </span>
          </div>
          <progress
            className={`progress h-2 ${pct === null ? "" : pct >= 80 ? "progress-success" : pct >= 50 ? "progress-warning" : "progress-error"}`}
            value={pct ?? 0}
            max={100}
          />
        </li>
      ))}
      <li className="text-[11px] text-base-content/45">Ordenado do que mais falha para o que mais dá certo.</li>
    </ul>
  );
}

function TargetsWidget({ ctx, metrics }: Props) {
  const items = metrics.filter((m) => m.target != null);
  if (!items.length) return <Empty>Nenhuma das métricas escolhidas tem meta.</Empty>;
  return (
    <ul className="flex flex-col gap-3">
      {items.map((m) => {
        const st = summarize(ctx.rows, m);
        const target = m.target!;
        const ratio = (v: number) =>
          target === 0 ? (v === 0 ? 100 : 0) : m.lowerIsBetter ? (target / Math.max(v, 1e-9)) * 100 : (v / target) * 100;
        const avgPct = st ? Math.min(100, ratio(st.avg)) : 0;
        const bestPct = st ? Math.min(100, ratio(st.best)) : 0;
        return (
          <li key={m.key} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate font-semibold">{m.label}</span>
              <span className="shrink-0 text-base-content/60">
                meta {fmt(target, m.unit)}
                {st?.hitRate != null && <> · atingida em <b>{Math.round(st.hitRate * 100)}%</b></>}
              </span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full bg-base-200" title={`média ${fmt(st?.avg, m.unit)} · melhor ${fmt(st?.best, m.unit)}`}>
              <div className="absolute inset-y-0 left-0 rounded-full bg-primary/25" style={{ width: `${bestPct}%` }} />
              <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${avgPct}%` }} />
            </div>
            <p className="text-[11px] text-base-content/50">
              média {fmt(st?.avg, m.unit)} ({Math.round(avgPct)}%) · melhor {fmt(st?.best, m.unit)}
              {m.lowerIsBetter && " · menor é melhor"}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

// ---- Tabelas --------------------------------------------------------------

function CsvButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="btn btn-ghost btn-xs border-base-300" onClick={onClick}>
      <Download size={12} /> CSV
    </button>
  );
}

function SortTh({ label, active, dir, onClick, right = true, title }: { label: string; active: boolean; dir: 1 | -1; onClick: () => void; right?: boolean; title?: string }) {
  return (
    <th className={right ? "text-right" : ""} title={title}>
      <button type="button" className="inline-flex items-center gap-0.5 whitespace-nowrap hover:text-base-content" onClick={onClick}>
        {label}
        {active && (dir === 1 ? <ArrowUp size={10} /> : <ArrowDown size={10} />)}
      </button>
    </th>
  );
}

function EntriesTable({ ctx, metrics, height }: Props) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: "__n", dir: -1 });
  const best = new Map(metrics.map((m) => [m.key, m.kind === "number" ? summarize(ctx.rows, m)?.best : undefined]));
  const sorted = [...ctx.rows].sort((a, b) => {
    if (sort.key === "__n") return (a.entry.executionNumber - b.entry.executionNumber) * sort.dir;
    const va = a.values[sort.key];
    const vb = b.values[sort.key];
    if (va == null) return 1;
    if (vb == null) return -1;
    return (va - vb) * sort.dir;
  });
  const toggle = (key: string) => setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : -1 }));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] text-base-content/50">
        <span>{ctx.rows.length} execuções · clique no cabeçalho para ordenar · <b className="text-success">verde</b> = melhor</span>
        <CsvButton
          onClick={() =>
            downloadCsv(
              `${ctx.fileName}-execucoes.csv`,
              toCsv(
                ["execucao", "data", ...metrics.map((m) => m.label), "observacoes"],
                sorted.map((r) => [
                  r.entry.executionNumber,
                  r.entry.createdAt,
                  ...metrics.map((m) => r.values[m.key] ?? null),
                  r.entry.notes ?? "",
                ]),
              ),
            )
          }
        />
      </div>
      <div className="overflow-auto" style={{ maxHeight: height + 120 }}>
        <table className="table table-pin-rows table-sm">
          <thead>
            <tr>
              <SortTh label="#" active={sort.key === "__n"} dir={sort.dir} onClick={() => toggle("__n")} right={false} />
              <th>Data</th>
              {metrics.map((m) => (
                <SortTh
                  key={m.key}
                  label={m.short ? (m.target != null ? `${m.short} /${m.target}` : m.short) : m.unit && m.kind === "number" ? `${m.label} (${m.unit})` : m.label}
                  title={m.short ? `${m.label}${m.unit ? ` (${m.unit})` : ""}` : undefined}
                  active={sort.key === m.key}
                  dir={sort.dir}
                  onClick={() => toggle(m.key)}
                />
              ))}
              <th>Observações</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.entry.id}>
                <td className="font-mono font-semibold">#{r.entry.executionNumber}</td>
                <td className="whitespace-nowrap text-base-content/60">{fmtDate(r.entry.createdAt)}</td>
                {metrics.map((m) => {
                  const v = r.values[m.key];
                  const isBest = v != null && best.get(m.key) === v && ctx.rows.length > 1;
                  return (
                    <td key={m.key} className={`text-right font-mono ${isBest ? "font-bold text-success" : ""} ${m.kind === "boolean" && v === 0 ? "text-error" : ""}`}>
                      {m.kind === "number" ? fmt(v) : fmtCell(m, v)}
                    </td>
                  );
                })}
                <td className="max-w-56 truncate text-xs text-base-content/60" title={r.entry.notes ?? ""}>{r.entry.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const STAT_COLS: { key: keyof MetricSummary; label: string }[] = [
  { key: "count", label: "N" },
  { key: "last", label: "Último" },
  { key: "best", label: "Melhor" },
  { key: "avg", label: "Média" },
  { key: "median", label: "Mediana" },
  { key: "min", label: "Mín" },
  { key: "max", label: "Máx" },
  { key: "std", label: "Desvio" },
  { key: "cv", label: "Variação" },
  { key: "slope", label: "Tendência" },
  { key: "hitRate", label: "Metas" },
];

function StatsTable({ ctx, metrics }: Props) {
  const rows = metrics.map((m) => ({ m, st: summarize(ctx.rows, m) }));
  const cell = (m: ViewMetric, st: MetricSummary, key: keyof MetricSummary) => {
    const v = st[key];
    if (v === null || v === undefined) return "—";
    if (key === "count") return String(v);
    if (key === "cv") return m.kind === "boolean" ? "—" : `${fmt(v)}%`;
    if (key === "hitRate") return `${Math.round(v * 100)}%`;
    if (key === "slope") {
      const good = m.lowerIsBetter ? v < 0 : v > 0;
      return (
        <span className={v === 0 ? "" : good ? "text-success" : "text-error"}>
          {v > 0 ? "+" : ""}{fmt(m.kind === "boolean" ? v * 100 : v)}{m.kind === "boolean" ? " p.p." : ""}
        </span>
      );
    }
    return m.kind === "boolean" && key !== "std" ? fmtMetric(m, v) : fmt(v);
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] text-base-content/50">
        <span>Tendência = quanto muda por execução · Variação = desvio ÷ média (menor = mais consistente)</span>
        <CsvButton
          onClick={() =>
            downloadCsv(
              `${ctx.fileName}-estatisticas.csv`,
              toCsv(["metrica", "unidade", ...STAT_COLS.map((c) => c.key)], rows.map(({ m, st }) => [m.label, m.unit ?? "", ...STAT_COLS.map((c) => (st ? (st[c.key] as number | null) : null))])),
            )
          }
        />
      </div>
      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Métrica</th>
              {STAT_COLS.map((c) => (
                <th key={c.key} className="text-right">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ m, st }) => (
              <tr key={m.key}>
                <td className="font-semibold">
                  {m.label}
                  {m.unit && m.kind === "number" && <span className="ml-1 font-normal text-base-content/40">({m.unit})</span>}
                  {m.kind === "boolean" && <span className="badge badge-ghost badge-xs ml-1.5">sim/não</span>}
                </td>
                {STAT_COLS.map((c) => (
                  <td key={c.key} className="text-right font-mono">{st ? cell(m, st, c.key) : "—"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CorrelationTable({ ctx, metrics }: Props) {
  const { theme } = ctx;
  const cols = metrics.map((m) => ctx.rows.map((r) => r.values[m.key] ?? null));
  const bg = (r: number | null) =>
    r === null ? "transparent" : `color-mix(in oklab, ${r >= 0 ? theme.series[0] : theme.series[1]} ${Math.round(Math.abs(r) * 85)}%, ${theme.surface})`;
  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto">
        <table className="table table-xs">
          <thead>
            <tr>
              <th />
              {metrics.map((m) => (
                <th key={m.key} className="max-w-24 truncate text-center" title={m.label}>{m.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((row, i) => (
              <tr key={row.key}>
                <th className="max-w-32 truncate" title={row.label}>{row.label}</th>
                {metrics.map((col, j) => {
                  const r = i === j ? 1 : pearson(cols[i], cols[j]);
                  return (
                    <td key={col.key} className="text-center font-mono" style={{ background: bg(r), color: r !== null && Math.abs(r) > 0.6 ? theme.surface : undefined }}>
                      {r === null ? "—" : (Math.abs(r) < 0.005 ? 0 : r).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-base-content/50">Perto de 1: sobem juntas · perto de −1: uma sobe, a outra desce · precisa de 3+ execuções.</p>
    </div>
  );
}
