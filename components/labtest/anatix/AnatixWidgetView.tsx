"use client";

// ---------------------------------------------------------------------------
// Desenha um bloco do painel personalizado a partir da configuração dele.
// Cada tipo lê do AnatixStore só o que precisa, dentro da janela escolhida.
// ---------------------------------------------------------------------------

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Download } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
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
import type { ChartTheme } from "@/components/labtest/charts/chart-theme";
import type { AnatixStatKey, AnatixWidget } from "@/types/anatix.types";
import {
  alignBuckets,
  derivative,
  eventBuckets,
  eventSummary,
  fmtMs,
  fmtNum,
  fullStats,
  histogram,
  movingAverage,
  normalize01,
  pairXY,
  pearson,
  seriesWindow,
  sliceWindow,
  stateSegments,
  timeInStates,
  toCsv,
  type FullStats,
} from "@/utils/labtest/anatix/analysis";
import { STAT_LABEL, WIDGET_SPEC } from "@/utils/labtest/anatix/dashboard";
import type { AnatixStore } from "@/utils/labtest/anatix/store";
import { AnatixEmpty } from "./AnatixPanel";

export interface WidgetContext {
  store: AnatixStore;
  version: number;
  theme: ChartTheme;
  fileName: string;
}

/** Métricas efetivas: as escolhidas que existem, ou automáticas. */
export function resolveMetrics(widget: AnatixWidget, store: AnatixStore) {
  const spec = WIDGET_SPEC[widget.type];
  const names = [...store.metrics.keys()].sort();
  const chosen = widget.metrics.filter((m) => store.metrics.has(m));
  if (spec.metrics.max === 0) return { names, used: [] as string[], missing: [] as string[] };
  const missing = widget.metrics.filter((m) => !store.metrics.has(m));
  if (chosen.length >= Math.max(1, spec.metrics.min)) return { names, used: chosen, missing };
  // Nada escolhido (ou só métricas ausentes): tabelas "todas", gráficos as primeiras.
  if (widget.metrics.length === 0) {
    const auto = spec.group === "table" ? names.slice(0, spec.metrics.max) : names.slice(0, Math.min(spec.metrics.max, Math.max(spec.metrics.min, 4)));
    return { names, used: auto.length >= spec.metrics.min ? auto : [], missing };
  }
  return { names, used: [], missing };
}

export function downloadCsv(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const axisProps = (theme: ChartTheme) => ({ stroke: theme.axis, fontSize: 11, tickLine: false });
const tooltipProps = (theme: ChartTheme) => ({
  contentStyle: {
    background: theme.surface,
    border: `1px solid ${theme.grid}`,
    borderRadius: 12,
    fontSize: 12,
  },
  labelStyle: { color: theme.text },
  itemStyle: { color: theme.text },
});
const color = (theme: ChartTheme, i: number) => theme.series[i % theme.series.length];
const withUnit = (v: number | null | undefined, unit?: string, digits = 2) =>
  `${fmtNum(v, digits)}${unit ? ` ${unit}` : ""}`;

function windowEnd(store: AnatixStore) {
  return store.lastT ?? 0;
}
function windowStart(store: AnatixStore, windowSec: number | null) {
  const end = windowEnd(store);
  return windowSec ? Math.max(store.firstT ?? end, end - windowSec * 1000) : (store.firstT ?? 0);
}

/** Série transformada e reduzida para desenhar. */
function prepared(widget: AnatixWidget, store: AnatixStore, name: string) {
  const s = sliceWindow(store.metrics.get(name)!, widget.windowSec, store.lastT);
  const transform = widget.options.transform ?? "raw";
  const v =
    transform === "smooth"
      ? movingAverage(s.v, widget.options.smoothN ?? 5)
      : transform === "derivative"
        ? derivative(s.t, s.v)
        : transform === "normalize"
          ? normalize01(s.v)
          : s.v;
  return { t: s.t, v };
}

const NEED_METRICS = "Escolha as métricas deste bloco em Editar.";
const NO_DATA = "Sem amostras na janela escolhida.";

// ---------------------------------------------------------------------------

export function AnatixWidgetView({ widget, ctx, height = 256 }: { widget: AnatixWidget; ctx: WidgetContext; height?: number }) {
  const { store, version } = ctx;
  const resolved = useMemo(
    () => resolveMetrics(widget, store),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [widget, store, version],
  );
  const spec = WIDGET_SPEC[widget.type];

  if (spec.metrics.max > 0 && store.metrics.size === 0) {
    return <AnatixEmpty>Nenhuma métrica recebida ainda. Use ANX_VALUE no robô.</AnatixEmpty>;
  }
  if (spec.metrics.max > 0 && resolved.used.length < Math.max(1, spec.metrics.min)) {
    return (
      <AnatixEmpty>
        {resolved.missing.length
          ? `Aguardando ${resolved.missing.join(", ")}.`
          : spec.metrics.min > 1
            ? `Este bloco precisa de ${spec.metrics.min} métricas. ${NEED_METRICS}`
            : NEED_METRICS}
      </AnatixEmpty>
    );
  }

  const props = { widget, ctx, metrics: resolved.used, height };
  switch (widget.type) {
    case "line":
      return <LineWidget {...props} />;
    case "area":
      return <AreaWidget {...props} />;
    case "bars":
      return <BarsWidget {...props} />;
    case "scatter":
      return <ScatterWidget {...props} />;
    case "histogram":
      return <HistogramWidget {...props} />;
    case "gauge":
      return <GaugeWidget {...props} />;
    case "kpi":
      return <KpiWidget {...props} />;
    case "radar":
      return <RadarWidget {...props} />;
    case "state-pie":
      return <StatePieWidget {...props} />;
    case "event-rate":
      return <EventRateWidget {...props} />;
    case "table-stats":
      return <StatsTable {...props} />;
    case "table-samples":
      return <SamplesTable {...props} />;
    case "table-correlation":
      return <CorrelationTable {...props} />;
    case "table-transitions":
      return <TransitionsTable {...props} />;
    case "table-events":
      return <EventsTable {...props} />;
  }
}

type WidgetProps = { widget: AnatixWidget; ctx: WidgetContext; metrics: string[]; height: number };

function useWidgetMemo<T>(fn: () => T, ctx: WidgetContext, widget: AnatixWidget, metrics: string[]) {
  const key = `${JSON.stringify(widget)}|${metrics.join("|")}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => fn(), [ctx.store, ctx.version, key]);
}

// ---- Gráficos -------------------------------------------------------------

function LineWidget({ widget, ctx, metrics, height }: WidgetProps) {
  const { theme } = ctx;
  const lines = useWidgetMemo(
    () => metrics.map((name) => ({ name, data: seriesWindow(prepared(widget, ctx.store, name), null, null) })),
    ctx,
    widget,
    metrics,
  );
  if (lines.every((l) => l.data.length === 0)) return <AnatixEmpty>{NO_DATA}</AnatixEmpty>;
  const unit = widget.options.transform === "normalize" ? undefined : widget.options.unit;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart margin={{ top: 4, right: 12, bottom: 0, left: -8 }}>
          <CartesianGrid stroke={theme.grid} vertical={false} />
          <XAxis dataKey="t" type="number" domain={["dataMin", "dataMax"]} tickFormatter={(t) => `${fmtNum(t, 1)}s`} allowDuplicatedCategory={false} {...axisProps(theme)} />
          <YAxis tickFormatter={(v) => fmtNum(v)} width={56} {...axisProps(theme)} />
          <Tooltip {...tooltipProps(theme)} labelFormatter={(t) => `t = ${fmtNum(Number(t))} s`} formatter={(v) => withUnit(Number(v), unit)} />
          {lines.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {widget.options.target !== null && widget.options.target !== undefined && (
            <ReferenceLine y={widget.options.target} stroke={theme.axis} strokeDasharray="5 4" label={{ value: "meta", fill: theme.axis, fontSize: 10, position: "insideTopRight" }} />
          )}
          {lines.map((line, i) => (
            <Line
              key={line.name}
              data={line.data}
              dataKey="v"
              name={line.name}
              type={widget.options.step ? "stepAfter" : "linear"}
              dot={false}
              strokeWidth={2}
              stroke={color(theme, i)}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function AreaWidget({ widget, ctx, metrics, height }: WidgetProps) {
  const { theme } = ctx;
  const data = useWidgetMemo(
    () => {
      const series = metrics.map((name) => ({ name, ...prepared(widget, ctx.store, name) }));
      const first = Math.min(...series.map((s) => s.t[0] ?? Infinity));
      const last = Math.max(...series.map((s) => s.t.at(-1) ?? -Infinity));
      if (!Number.isFinite(first) || !Number.isFinite(last)) return [];
      const bucket = Math.max(10, Math.ceil((last - first) / 300));
      return alignBuckets(series, bucket).map((row) => {
        const out: Record<string, number | null> = { t: row.t / 1000 };
        metrics.forEach((m, i) => (out[`m${i}`] = row.values[m]));
        return out;
      });
    },
    ctx,
    widget,
    metrics,
  );
  if (!data.length) return <AnatixEmpty>{NO_DATA}</AnatixEmpty>;
  const stacked = !!widget.options.stacked;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: -8 }}>
          <CartesianGrid stroke={theme.grid} vertical={false} />
          <XAxis dataKey="t" type="number" domain={["dataMin", "dataMax"]} tickFormatter={(t) => `${fmtNum(t, 1)}s`} {...axisProps(theme)} />
          <YAxis tickFormatter={(v) => fmtNum(v)} width={56} domain={stacked ? [0, "auto"] : ["auto", "auto"]} {...axisProps(theme)} />
          <Tooltip {...tooltipProps(theme)} labelFormatter={(t) => `t = ${fmtNum(Number(t))} s`} formatter={(v) => withUnit(Number(v), widget.options.unit)} />
          {metrics.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {widget.options.target !== null && widget.options.target !== undefined && (
            <ReferenceLine y={widget.options.target} stroke={theme.axis} strokeDasharray="5 4" />
          )}
          {metrics.map((name, i) => (
            <Area
              key={name}
              dataKey={`m${i}`}
              name={name}
              type="monotone"
              stackId={stacked ? "s" : undefined}
              baseValue={stacked ? undefined : "dataMin"}
              stroke={color(theme, i)}
              fill={color(theme, i)}
              fillOpacity={stacked ? 0.55 : 0.18}
              strokeWidth={1.8}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function windowStats(widget: AnatixWidget, store: AnatixStore, name: string) {
  const s = sliceWindow(store.metrics.get(name)!, widget.windowSec, store.lastT);
  return fullStats(s.t, s.v);
}

const statValue = (st: FullStats, key: AnatixStatKey) => (key === "range" ? st.range : st[key]);

function BarsWidget({ widget, ctx, metrics, height }: WidgetProps) {
  const { theme } = ctx;
  const stats = widget.options.stats?.length ? widget.options.stats : (["avg", "max"] as AnatixStatKey[]);
  const data = useWidgetMemo(
    () =>
      metrics.flatMap((name) => {
        const st = windowStats(widget, ctx.store, name);
        if (!st) return [];
        const row: Record<string, string | number> = { name };
        for (const k of stats) row[k] = statValue(st, k);
        return [row];
      }),
    ctx,
    widget,
    metrics,
  );
  if (!data.length) return <AnatixEmpty>{NO_DATA}</AnatixEmpty>;
  const horizontal = !!widget.options.horizontal;
  const h = horizontal ? Math.max(height, data.length * stats.length * 14 + 60) : height;
  return (
    <div style={{ height: h }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 4, right: 12, bottom: 0, left: horizontal ? 4 : -8 }}>
          <CartesianGrid stroke={theme.grid} vertical={horizontal} horizontal={!horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" tickFormatter={(v) => fmtNum(v)} {...axisProps(theme)} />
              <YAxis type="category" dataKey="name" width={96} {...axisProps(theme)} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" {...axisProps(theme)} />
              <YAxis tickFormatter={(v) => fmtNum(v)} width={56} {...axisProps(theme)} />
            </>
          )}
          <Tooltip {...tooltipProps(theme)} formatter={(v) => fmtNum(Number(v))} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {stats.map((k, i) => (
            <Bar key={k} dataKey={k} name={STAT_LABEL[k]} fill={color(theme, i)} radius={horizontal ? [0, 5, 5, 0] : [5, 5, 0, 0]} isAnimationActive={false} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ScatterWidget({ widget, ctx, metrics, height }: WidgetProps) {
  const { theme } = ctx;
  const [xName, yName] = metrics;
  const points = useWidgetMemo(
    () => {
      const xs = sliceWindow(ctx.store.metrics.get(xName)!, widget.windowSec, ctx.store.lastT);
      const ys = sliceWindow(ctx.store.metrics.get(yName)!, widget.windowSec, ctx.store.lastT);
      const pts = pairXY(xs, ys);
      const n = pts.length;
      return pts.map((p, i) => ({ ...p, age: n > 1 ? i / (n - 1) : 1 }));
    },
    ctx,
    widget,
    metrics,
  );
  if (!points.length) return <AnatixEmpty>Sem amostras de {xName} e {yName} próximas no tempo.</AnatixEmpty>;
  const last = points.at(-1)!;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
          <CartesianGrid stroke={theme.grid} />
          <XAxis type="number" dataKey="x" name={xName} domain={["auto", "auto"]} tickFormatter={(v) => fmtNum(v)} {...axisProps(theme)} />
          <YAxis type="number" dataKey="y" name={yName} domain={["auto", "auto"]} tickFormatter={(v) => fmtNum(v)} width={56} {...axisProps(theme)} />
          <Tooltip {...tooltipProps(theme)} cursor={{ strokeDasharray: "3 3" }} formatter={(v) => fmtNum(Number(v))} />
          <Scatter
            data={points}
            isAnimationActive={false}
            shape={(p: { cx?: number; cy?: number; payload?: { age: number } }) => (
              <circle cx={p.cx} cy={p.cy} r={2.2} fill={theme.series[1]} fillOpacity={0.12 + (p.payload?.age ?? 1) * 0.78} />
            )}
          />
          <Scatter data={[last]} fill={theme.series[0]} isAnimationActive={false} />
        </ScatterChart>
      </ResponsiveContainer>
      <p className="-mt-1 text-right text-[11px] text-base-content/50">mais claro = mais antigo · ponto destacado = agora</p>
    </div>
  );
}

function HistogramWidget({ widget, ctx, metrics, height }: WidgetProps) {
  const { theme } = ctx;
  const name = metrics[0];
  const { bins, st } = useWidgetMemo(
    () => {
      const s = sliceWindow(ctx.store.metrics.get(name)!, widget.windowSec, ctx.store.lastT);
      return { bins: histogram(s.v, widget.options.bins ?? 20), st: fullStats(s.t, s.v) };
    },
    ctx,
    widget,
    metrics,
  );
  if (!bins.length || !st) return <AnatixEmpty>{NO_DATA}</AnatixEmpty>;
  const target = widget.options.target;
  const data = bins.map((b) => ({ ...b, label: fmtNum(b.mid) }));
  return (
    <div className="flex flex-col gap-2">
      <div style={{ height: height - 28 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={1} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
            <CartesianGrid stroke={theme.grid} vertical={false} />
            <XAxis dataKey="label" interval="preserveStartEnd" minTickGap={16} {...axisProps(theme)} />
            <YAxis tickFormatter={(v) => `${fmtNum(v, 0)}%`} width={44} {...axisProps(theme)} />
            <Tooltip
              {...tooltipProps(theme)}
              labelFormatter={(_, payload) => {
                const b = payload?.[0]?.payload as (typeof data)[number] | undefined;
                return b ? `${fmtNum(b.from)} a ${fmtNum(b.to)}` : "";
              }}
              formatter={(v, _n, item) => `${fmtNum(Number(v), 1)}% (${(item.payload as (typeof data)[number]).count} amostras)`}
            />
            <Bar dataKey="pct" name="amostras" isAnimationActive={false} radius={[3, 3, 0, 0]}>
              {data.map((b, i) => (
                <Cell
                  key={i}
                  fill={
                    target !== null && target !== undefined && target >= b.from && target <= b.to
                      ? theme.series[0]
                      : theme.series[1]
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="flex flex-wrap gap-x-3 text-[11px] text-base-content/60">
        <span>média <b>{withUnit(st.avg, widget.options.unit)}</b></span>
        <span>mediana <b>{withUnit(st.median, widget.options.unit)}</b></span>
        <span>desvio <b>{fmtNum(st.std)}</b></span>
        <span>{st.count.toLocaleString("pt-BR")} amostras</span>
      </p>
    </div>
  );
}

function GaugeWidget({ widget, ctx, metrics, height }: WidgetProps) {
  const { theme } = ctx;
  const name = metrics[0];
  const s = ctx.store.metrics.get(name)!;
  const value = s.stats.last;
  const lo = widget.options.min ?? s.stats.min;
  const hiRaw = widget.options.max ?? s.stats.max;
  const hi = hiRaw === lo ? lo + 1 : hiRaw;
  const frac = Math.min(1, Math.max(0, (value - lo) / (hi - lo)));
  const target = widget.options.target;
  const tFrac = target === null || target === undefined ? null : Math.min(1, Math.max(0, (target - lo) / (hi - lo)));

  // Arco de 240°: de 150° a 390° (sentido horário, 0° = direita).
  const W = 200;
  const R = 78;
  const cx = W / 2;
  const cy = 96;
  const A0 = (150 * Math.PI) / 180;
  const SWEEP = (240 * Math.PI) / 180;
  const pt = (f: number, r = R) => [cx + r * Math.cos(A0 + SWEEP * f), cy + r * Math.sin(A0 + SWEEP * f)];
  const arc = (f: number) => {
    const [x0, y0] = pt(0);
    const [x1, y1] = pt(f);
    return `M ${x0} ${y0} A ${R} ${R} 0 ${SWEEP * f > Math.PI ? 1 : 0} 1 ${x1} ${y1}`;
  };
  const [nx, ny] = pt(frac, R - 24);
  const tick = tFrac === null ? null : [pt(tFrac, R - 12), pt(tFrac, R + 12)];

  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: Math.min(height, 220) }}>
      <svg viewBox={`0 0 ${W} 170`} className="w-full max-w-[260px]" role="img" aria-label={`${name}: ${fmtNum(value)}`}>
        <path d={arc(1)} fill="none" stroke={theme.grid} strokeWidth={14} strokeLinecap="round" />
        {frac > 0.001 && <path d={arc(frac)} fill="none" stroke={theme.series[0]} strokeWidth={14} strokeLinecap="round" />}
        {tick && <line x1={tick[0][0]} y1={tick[0][1]} x2={tick[1][0]} y2={tick[1][1]} stroke={theme.text} strokeWidth={2.5} />}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={theme.text} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={5} fill={theme.text} />
        <text x={cx} y={cy + 40} textAnchor="middle" fontSize={24} fontWeight={800} fill={theme.text}>
          {fmtNum(value)}
        </text>
        {widget.options.unit && (
          <text x={cx} y={cy + 56} textAnchor="middle" fontSize={11} fill={theme.axis}>
            {widget.options.unit}
          </text>
        )}
        <text x={pt(0)[0]} y={pt(0)[1] + 22} textAnchor="middle" fontSize={10} fill={theme.axis}>{fmtNum(lo)}</text>
        <text x={pt(1)[0]} y={pt(1)[1] + 22} textAnchor="middle" fontSize={10} fill={theme.axis}>{fmtNum(hi)}</text>
      </svg>
      <p className="text-[11px] text-base-content/50">
        {widget.options.min === undefined || widget.options.min === null ? "limites observados" : "limites fixos"}
        {target !== null && target !== undefined && ` · meta ${fmtNum(target)}`}
      </p>
    </div>
  );
}

function KpiWidget({ widget, ctx, metrics }: WidgetProps) {
  const { theme } = ctx;
  const name = metrics[0];
  const { st, spark, first } = useWidgetMemo(
    () => {
      const s = sliceWindow(ctx.store.metrics.get(name)!, widget.windowSec, ctx.store.lastT);
      return { st: fullStats(s.t, s.v), spark: seriesWindow(s, null, null, 120), first: s.v[0] };
    },
    ctx,
    widget,
    metrics,
  );
  if (!st) return <AnatixEmpty>{NO_DATA}</AnatixEmpty>;
  const delta = st.last - first;
  const pct = first !== 0 ? (delta / Math.abs(first)) * 100 : null;
  const target = widget.options.target;
  const up = delta > 0;
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-end justify-between gap-2">
        <p className="truncate text-4xl font-black tracking-tight">
          {fmtNum(st.last)}
          {widget.options.unit && <span className="ml-1 text-base font-semibold text-base-content/50">{widget.options.unit}</span>}
        </p>
        {delta !== 0 && (
          <span className={`badge badge-soft badge-sm gap-0.5 ${up ? "badge-success" : "badge-error"}`}>
            {up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
            {fmtNum(Math.abs(delta))}
            {pct !== null && ` (${fmtNum(Math.abs(pct), 1)}%)`}
          </span>
        )}
      </div>
      <div className="h-14">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={spark} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <YAxis hide domain={["auto", "auto"]} />
            <XAxis hide dataKey="t" type="number" domain={["dataMin", "dataMax"]} />
            {target !== null && target !== undefined && <ReferenceLine y={target} stroke={theme.axis} strokeDasharray="3 3" />}
            <Area dataKey="v" type="monotone" stroke={theme.series[0]} fill={theme.series[0]} fillOpacity={0.15} strokeWidth={1.8} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="flex flex-wrap gap-x-3 text-[11px] text-base-content/60">
        <span>mín <b>{fmtNum(st.min)}</b></span>
        <span>méd <b>{fmtNum(st.avg)}</b></span>
        <span>máx <b>{fmtNum(st.max)}</b></span>
        {target !== null && target !== undefined && (
          <span>
            até a meta <b>{fmtNum(target - st.last)}</b>
          </span>
        )}
      </p>
    </div>
  );
}

function RadarWidget({ widget, ctx, metrics, height }: WidgetProps) {
  const { theme } = ctx;
  const data = useWidgetMemo(
    () =>
      metrics.flatMap((name) => {
        const st = windowStats(widget, ctx.store, name);
        if (!st) return [];
        const span = st.max - st.min || 1;
        return [
          {
            name,
            agora: ((st.last - st.min) / span) * 100,
            média: ((st.avg - st.min) / span) * 100,
            raw: st.last,
          },
        ];
      }),
    ctx,
    widget,
    metrics,
  );
  if (data.length < 3) return <AnatixEmpty>{NO_DATA}</AnatixEmpty>;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke={theme.grid} />
          <PolarAngleAxis dataKey="name" tick={{ fill: theme.axis, fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip {...tooltipProps(theme)} formatter={(v) => `${fmtNum(Number(v), 0)}% da faixa`} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Radar dataKey="média" stroke={theme.series[1]} fill={theme.series[1]} fillOpacity={0.12} isAnimationActive={false} />
          <Radar dataKey="agora" stroke={theme.series[0]} fill={theme.series[0]} fillOpacity={0.3} isAnimationActive={false} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function machineFor(widget: AnatixWidget, store: AnatixStore) {
  const machines = [...new Set(store.transitions.map((t) => t.machine))];
  return widget.options.machine && machines.includes(widget.options.machine)
    ? widget.options.machine
    : (machines[0] ?? null);
}

function StatePieWidget({ widget, ctx, height }: WidgetProps) {
  const { theme, store } = ctx;
  const machine = machineFor(widget, store);
  const slices = useWidgetMemo(
    () => {
      if (!machine) return [];
      const end = windowEnd(store);
      const segs = stateSegments(store.transitions, end).get(machine) ?? [];
      return timeInStates(segs, windowStart(store, widget.windowSec), end);
    },
    ctx,
    widget,
    [machine ?? ""],
  );
  if (!machine) return <AnatixEmpty>Nenhuma máquina de estados (ANX_STATE) recebida ainda.</AnatixEmpty>;
  if (!slices.length) return <AnatixEmpty>{NO_DATA}</AnatixEmpty>;
  return (
    <div className="flex flex-col gap-2">
      <div style={{ height: Math.min(height, 200) }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip {...tooltipProps(theme)} formatter={(v, n) => [fmtMs(Number(v)), String(n)]} />
            <Pie data={slices} dataKey="ms" nameKey="state" innerRadius="55%" outerRadius="90%" paddingAngle={1.5} stroke={theme.surface} isAnimationActive={false}>
              {slices.map((s, i) => (
                <Cell key={s.state} fill={color(theme, i)} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-center text-[11px] font-semibold text-base-content/60">{machine}</p>
      <ul className="flex flex-col gap-1 text-xs">
        {slices.map((s, i) => (
          <li key={s.state} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: color(theme, i) }} />
            <span className="min-w-0 flex-1 truncate">{s.state}</span>
            <span className="font-mono text-base-content/60">{fmtNum(s.pct, 1)}%</span>
            <span className="w-16 text-right font-mono text-base-content/50">{fmtMs(s.ms)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EventRateWidget({ widget, ctx, height }: WidgetProps) {
  const { theme, store } = ctx;
  const { names, rows } = useWidgetMemo(
    () => {
      const end = windowEnd(store);
      const { names, rows } = eventBuckets(store.events, windowStart(store, widget.windowSec), end, widget.options.bins ?? 30);
      // Chaves seguras para o recharts (nomes podem ter ponto).
      return {
        names,
        rows: rows.map((r) => {
          const out: Record<string, number> = { t: r.t };
          names.forEach((n, i) => (out[`e${i}`] = r[n]));
          return out;
        }),
      };
    },
    ctx,
    widget,
    [],
  );
  if (!names.length) return <AnatixEmpty>Nenhum evento (ANX_EVENT) na janela.</AnatixEmpty>;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} barCategoryGap={1} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid stroke={theme.grid} vertical={false} />
          <XAxis dataKey="t" tickFormatter={(t) => `${fmtNum(Number(t), 1)}s`} minTickGap={20} {...axisProps(theme)} />
          <YAxis allowDecimals={false} width={44} {...axisProps(theme)} />
          <Tooltip {...tooltipProps(theme)} labelFormatter={(t) => `≈ ${fmtNum(Number(t), 1)} s`} />
          {names.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {names.map((n, i) => (
            <Bar key={n} dataKey={`e${i}`} name={n} stackId={widget.options.stacked ? "ev" : undefined} fill={color(theme, i)} isAnimationActive={false} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
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

const STATS_COLUMNS: { key: keyof FullStats; label: string }[] = [
  { key: "last", label: "Último" },
  { key: "min", label: "Mín" },
  { key: "max", label: "Máx" },
  { key: "avg", label: "Média" },
  { key: "median", label: "Mediana" },
  { key: "std", label: "Desvio" },
  { key: "p5", label: "P5" },
  { key: "p95", label: "P95" },
  { key: "count", label: "Amostras" },
  { key: "rate", label: "Taxa (/s)" },
];

function StatsTable({ widget, ctx, metrics }: WidgetProps) {
  const [sort, setSort] = useState<{ key: keyof FullStats | "name"; dir: 1 | -1 }>({ key: "name", dir: 1 });
  const rows = useWidgetMemo(
    () => metrics.flatMap((name) => {
      const st = windowStats(widget, ctx.store, name);
      return st ? [{ name, st }] : [];
    }),
    ctx,
    widget,
    metrics,
  );
  const sorted = [...rows].sort((a, b) =>
    sort.key === "name" ? a.name.localeCompare(b.name) * sort.dir : (a.st[sort.key] - b.st[sort.key]) * sort.dir,
  );
  if (!rows.length) return <AnatixEmpty>{NO_DATA}</AnatixEmpty>;
  const header = (key: keyof FullStats | "name", label: string, right = true) => (
    <th key={key} className={right ? "text-right" : ""}>
      <button
        type="button"
        className="inline-flex items-center gap-0.5 hover:text-base-content"
        onClick={() => setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : 1 }))}
      >
        {label}
        {sort.key === key && (sort.dir === 1 ? <ArrowUp size={10} /> : <ArrowDown size={10} />)}
      </button>
    </th>
  );
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <CsvButton
          onClick={() =>
            downloadCsv(
              `${ctx.fileName}-estatisticas.csv`,
              toCsv(["metrica", ...STATS_COLUMNS.map((c) => c.key)], sorted.map((r) => [r.name, ...STATS_COLUMNS.map((c) => r.st[c.key])])),
            )
          }
        />
      </div>
      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr>
              {header("name", "Métrica", false)}
              {STATS_COLUMNS.map((c) => header(c.key, c.label))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(({ name, st }) => (
              <tr key={name}>
                <td className="font-semibold">{name}</td>
                {STATS_COLUMNS.map((c) => (
                  <td key={c.key} className="text-right font-mono">
                    {c.key === "count" ? st.count.toLocaleString("pt-BR") : fmtNum(st[c.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SamplesTable({ widget, ctx, metrics, height }: WidgetProps) {
  const bucketMs = widget.options.bucketMs ?? 250;
  const rows = useWidgetMemo(
    () =>
      alignBuckets(
        metrics.map((name) => ({ name, ...sliceWindow(ctx.store.metrics.get(name)!, widget.windowSec, ctx.store.lastT) })),
        bucketMs,
      ),
    ctx,
    widget,
    metrics,
  );
  if (!rows.length) return <AnatixEmpty>{NO_DATA}</AnatixEmpty>;
  const firstT = ctx.store.firstT ?? 0;
  const shown = rows.slice(-300).reverse();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] text-base-content/50">
        <span>
          média a cada {bucketMs} ms · {rows.length.toLocaleString("pt-BR")} linhas{rows.length > 300 && " (mostrando as 300 mais recentes)"}
        </span>
        <CsvButton
          onClick={() =>
            downloadCsv(
              `${ctx.fileName}-amostras.csv`,
              toCsv(["t_ms", ...metrics], rows.map((r) => [r.t, ...metrics.map((m) => r.values[m])])),
            )
          }
        />
      </div>
      <div className="overflow-auto" style={{ maxHeight: height + 40 }}>
        <table className="table table-pin-rows table-sm">
          <thead>
            <tr>
              <th>Tempo</th>
              {metrics.map((m) => (
                <th key={m} className="text-right">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.t}>
                <td className="font-mono">{fmtMs(r.t - firstT)}</td>
                {metrics.map((m) => (
                  <td key={m} className="text-right font-mono">{fmtNum(r.values[m])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CorrelationTable({ widget, ctx, metrics }: WidgetProps) {
  const { theme } = ctx;
  const matrix = useWidgetMemo(
    () => {
      const rows = alignBuckets(
        metrics.map((name) => ({ name, ...sliceWindow(ctx.store.metrics.get(name)!, widget.windowSec, ctx.store.lastT) })),
        widget.options.bucketMs ?? 100,
      );
      const cols = metrics.map((m) => rows.map((r) => r.values[m]));
      return metrics.map((_, i) => metrics.map((__, j) => (i === j ? 1 : pearson(cols[i], cols[j]))));
    },
    ctx,
    widget,
    metrics,
  );
  if (metrics.length < 2) return <AnatixEmpty>A matriz precisa de pelo menos duas métricas.</AnatixEmpty>;
  const cellBg = (r: number | null) =>
    r === null
      ? "transparent"
      : `color-mix(in oklab, ${r >= 0 ? theme.series[0] : theme.series[1]} ${Math.round(Math.abs(r) * 85)}%, ${theme.surface})`;
  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto">
        <table className="table table-xs">
          <thead>
            <tr>
              <th />
              {metrics.map((m) => (
                <th key={m} className="max-w-24 truncate text-center" title={m}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((row, i) => (
              <tr key={row}>
                <th className="max-w-32 truncate" title={row}>{row}</th>
                {matrix[i].map((r, j) => (
                  <td
                    key={j}
                    className="text-center font-mono"
                    style={{ background: cellBg(r), color: r !== null && Math.abs(r) > 0.6 ? theme.surface : undefined }}
                    title={r === null ? "sem dados suficientes" : `${row} × ${metrics[j]}: ${fmtNum(r)}`}
                  >
                    {r === null ? "—" : (Math.abs(r) < 0.005 ? 0 : r).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="flex flex-wrap items-center gap-3 text-[11px] text-base-content/50">
        <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm" style={{ background: theme.series[0] }} /> sobem juntas</span>
        <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm" style={{ background: theme.series[1] }} /> uma sobe, outra desce</span>
        <span>perto de 0 = sem relação</span>
      </p>
    </div>
  );
}

function TransitionsTable({ widget, ctx, height }: WidgetProps) {
  const { store } = ctx;
  const filter = widget.options.machine ?? null;
  const rows = useWidgetMemo(
    () => {
      const end = windowEnd(store);
      const start = windowStart(store, widget.windowSec);
      const all: { machine: string; state: string; from: number; to: number }[] = [];
      for (const [machine, segs] of stateSegments(store.transitions, end)) {
        if (filter && machine !== filter) continue;
        for (const s of segs) if (s.to >= start) all.push({ machine, ...s });
      }
      return all.sort((a, b) => b.from - a.from).slice(0, 300);
    },
    ctx,
    widget,
    [],
  );
  if (!rows.length) return <AnatixEmpty>Nenhuma troca de estado na janela.</AnatixEmpty>;
  const firstT = store.firstT ?? 0;
  const longest = Math.max(...rows.map((r) => r.to - r.from), 1);
  return (
    <div className="overflow-auto" style={{ maxHeight: height + 40 }}>
      <table className="table table-pin-rows table-sm">
        <thead>
          <tr>
            <th>Início</th>
            {!filter && <th>Máquina</th>}
            <th>Estado</th>
            <th className="w-1/3">Duração</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.machine}-${r.from}-${i}`}>
              <td className="font-mono">{fmtMs(r.from - firstT)}</td>
              {!filter && <td className="font-semibold">{r.machine}</td>}
              <td><span className="badge badge-sm badge-primary badge-soft">{r.state}</span></td>
              <td>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-base-200">
                    <div className="h-full rounded-full bg-primary/60" style={{ width: `${((r.to - r.from) / longest) * 100}%` }} />
                  </div>
                  <span className="w-16 text-right font-mono text-xs">{fmtMs(r.to - r.from)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EventsTable({ widget, ctx }: WidgetProps) {
  const { store } = ctx;
  const rows = useWidgetMemo(
    () => {
      const start = windowStart(store, widget.windowSec);
      return eventSummary(store.events.filter((e) => e.t >= start));
    },
    ctx,
    widget,
    [],
  );
  if (!rows.length) return <AnatixEmpty>Nenhum evento (ANX_EVENT) na janela.</AnatixEmpty>;
  const firstT = store.firstT ?? 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <CsvButton
          onClick={() =>
            downloadCsv(
              `${ctx.fileName}-eventos.csv`,
              toCsv(
                ["evento", "total", "primeiro_ms", "ultimo_ms", "intervalo_medio_ms", "dado_medio"],
                rows.map((r) => [r.name, r.total, r.first, r.last, r.avgIntervalMs, r.avgData]),
              ),
            )
          }
        />
      </div>
      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Evento</th>
              <th className="text-right">Total</th>
              <th className="text-right">Primeiro</th>
              <th className="text-right">Último</th>
              <th className="text-right">Intervalo médio</th>
              <th className="text-right">Dado médio</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td className="font-semibold">{r.name}</td>
                <td className="text-right font-mono">{r.total.toLocaleString("pt-BR")}</td>
                <td className="text-right font-mono">{fmtMs(r.first - firstT)}</td>
                <td className="text-right font-mono">{fmtMs(r.last - firstT)}</td>
                <td className="text-right font-mono">{r.avgIntervalMs === null ? "—" : fmtMs(r.avgIntervalMs)}</td>
                <td className="text-right font-mono">{fmtNum(r.avgData)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-base-content/50">Considera os últimos 500 eventos guardados na tela.</p>
    </div>
  );
}
