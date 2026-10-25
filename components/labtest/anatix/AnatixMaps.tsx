"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartTheme } from "@/components/labtest/charts/chart-theme";
import {
  fmtMs,
  fmtNum,
  heatmap,
  pairXY,
  stateSegments,
} from "@/utils/labtest/anatix/analysis";
import type { AnatixStore } from "@/utils/labtest/anatix/store";
import { AnatixEmpty, AnatixPanel } from "./AnatixPanel";

export function AnatixMaps({
  store,
  version,
  mapX,
  mapY,
  onAxesChange,
}: {
  store: AnatixStore;
  version: number;
  mapX: string | null;
  mapY: string | null;
  onAxesChange: (x: string | null, y: string | null) => void;
}) {
  const { ref, theme } = useChartTheme();

  const names = useMemo(
    () => [...store.metrics.keys()].sort(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, version],
  );

  // Sugestão automática: pares tipo x/y, pos_x/pos_y.
  const guessX = names.find((n) => /(^|_)x$/i.test(n)) ?? names[0] ?? null;
  const guessY =
    names.find((n) => /(^|_)y$/i.test(n)) ?? names.find((n) => n !== guessX) ?? null;
  const x = mapX && store.metrics.has(mapX) ? mapX : guessX;
  const y = mapY && store.metrics.has(mapY) ? mapY : guessY;

  const xy = useMemo(() => {
    if (!x || !y) return [];
    return pairXY(store.metrics.get(x)!, store.metrics.get(y)!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, version, x, y]);
  const lastPoint = xy.at(-1);

  const startMs = store.firstT ?? 0;
  const endMs = store.lastT ?? 0;

  const heat = useMemo(
    () => heatmap(store.metrics, startMs, endMs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, version],
  );

  const states = useMemo(
    () => stateSegments(store.transitions, endMs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, version],
  );

  const stateColors = useMemo(() => {
    const map = new Map<string, string>();
    for (const segs of states.values()) {
      for (const s of segs) {
        if (!map.has(s.state)) map.set(s.state, theme.series[map.size % theme.series.length]);
      }
    }
    return map;
  }, [states, theme.series]);

  const span = Math.max(1, endMs - startMs);
  const axis = { stroke: theme.axis, fontSize: 11, tickLine: false };

  return (
    <div ref={ref} className="grid gap-4 xl:grid-cols-2">
      <AnatixPanel
        title="Mapa XY"
        hint="Cruza duas métricas pelo tempo (ex.: posição x × y, velocidade × erro)"
        actions={
          names.length >= 2 && (
            <>
              <select
                className="select select-xs select-bordered"
                value={x ?? ""}
                onChange={(e) => onAxesChange(e.target.value, y)}
                aria-label="Eixo X"
              >
                {names.map((n) => (
                  <option key={n} value={n}>X: {n}</option>
                ))}
              </select>
              <select
                className="select select-xs select-bordered"
                value={y ?? ""}
                onChange={(e) => onAxesChange(x, e.target.value)}
                aria-label="Eixo Y"
              >
                {names.map((n) => (
                  <option key={n} value={n}>Y: {n}</option>
                ))}
              </select>
            </>
          )
        }
      >
        {names.length < 2 ? (
          <AnatixEmpty>O mapa XY precisa de pelo menos duas métricas.</AnatixEmpty>
        ) : xy.length === 0 ? (
          <AnatixEmpty>Sem amostras de {x} e {y} próximas no tempo.</AnatixEmpty>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
                <CartesianGrid stroke={theme.grid} />
                <XAxis type="number" dataKey="x" name={x ?? "x"} domain={["auto", "auto"]} tickFormatter={(v) => fmtNum(v)} {...axis} />
                <YAxis type="number" dataKey="y" name={y ?? "y"} domain={["auto", "auto"]} tickFormatter={(v) => fmtNum(v)} width={56} {...axis} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(v) => fmtNum(Number(v))}
                  contentStyle={{ background: theme.surface, border: `1px solid ${theme.grid}`, borderRadius: 12, fontSize: 12 }}
                />
                <Scatter
                  data={xy}
                  line={{ stroke: theme.series[1], strokeWidth: 1.5, strokeOpacity: 0.6 }}
                  fill={theme.series[1]}
                  shape={(props: { cx?: number; cy?: number }) => (
                    <circle cx={props.cx} cy={props.cy} r={1.8} fill={theme.series[1]} fillOpacity={0.6} />
                  )}
                  isAnimationActive={false}
                />
                {lastPoint && (
                  <Scatter data={[lastPoint]} fill={theme.series[0]} isAnimationActive={false} />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </AnatixPanel>

      <AnatixPanel title="Mapa de estados" hint="ANX_STATE — em qual estado cada máquina passou o tempo">
        {states.size === 0 ? (
          <AnatixEmpty>Nenhuma máquina de estados recebida ainda.</AnatixEmpty>
        ) : (
          <div className="flex flex-col gap-4">
            {[...states].map(([machine, segs]) => {
              const totals = new Map<string, number>();
              for (const s of segs) totals.set(s.state, (totals.get(s.state) ?? 0) + (s.to - s.from));
              return (
                <div key={machine}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold">{machine}</span>
                    <span className="text-base-content/50">{segs.length} trocas</span>
                  </div>
                  <div className="relative h-7 overflow-hidden rounded-lg bg-base-200">
                    {segs.map((s, i) => (
                      <div
                        key={i}
                        title={`${s.state} · ${fmtMs(s.to - s.from)}`}
                        className="absolute inset-y-0 border-r border-base-100/60"
                        style={{
                          left: `${((s.from - startMs) / span) * 100}%`,
                          width: `${Math.max(0.3, ((s.to - s.from) / span) * 100)}%`,
                          background: stateColors.get(s.state),
                        }}
                      />
                    ))}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-base-content/60">
                    {[...totals].map(([state, ms]) => (
                      <span key={state} className="flex items-center gap-1">
                        <span className="size-2 rounded-sm" style={{ background: stateColors.get(state) }} />
                        {state} · {fmtMs(ms)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AnatixPanel>

      <AnatixPanel
        className="xl:col-span-2"
        title="Mapa de calor"
        hint="Média de cada métrica em 40 blocos de tempo, normalizada por linha"
      >
        {heat.length === 0 ? (
          <AnatixEmpty>Nenhuma métrica para o mapa de calor.</AnatixEmpty>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex min-w-[640px] flex-col gap-1">
              {heat.map((row) => (
                <div key={row.name} className="grid grid-cols-[140px_1fr_120px] items-center gap-2">
                  <span className="truncate text-xs font-semibold" title={row.name}>
                    {row.name}
                  </span>
                  <div className="grid h-6 grid-cols-[repeat(40,minmax(0,1fr))] gap-px overflow-hidden rounded-md">
                    {row.cells.map((cell, i) => (
                      <div
                        key={i}
                        title={cell === null ? "sem dados" : fmtNum(cell)}
                        style={{
                          background:
                            row.norm[i] === null
                              ? "transparent"
                              : `color-mix(in oklab, ${theme.series[0]} ${Math.round(12 + row.norm[i]! * 88)}%, ${theme.surface})`,
                        }}
                        className={row.norm[i] === null ? "bg-base-200" : ""}
                      />
                    ))}
                  </div>
                  <span className="text-right text-[11px] text-base-content/50">
                    {fmtNum(row.min)} → {fmtNum(row.max)}
                  </span>
                </div>
              ))}
              <div className="mt-1 grid grid-cols-[140px_1fr_120px] gap-2 text-[11px] text-base-content/40">
                <span />
                <div className="flex justify-between">
                  <span>{fmtMs(0)}</span>
                  <span>{fmtMs(span)}</span>
                </div>
                <span />
              </div>
            </div>
          </div>
        )}
      </AnatixPanel>
    </div>
  );
}
