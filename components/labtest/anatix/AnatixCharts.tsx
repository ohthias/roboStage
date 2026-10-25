"use client";

import { useMemo, useState } from "react";
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
import { useChartTheme } from "@/components/labtest/charts/chart-theme";
import { fmtNum, seriesWindow } from "@/utils/labtest/anatix/analysis";
import type { AnatixStore } from "@/utils/labtest/anatix/store";
import { AnatixEmpty, AnatixPanel } from "./AnatixPanel";

const WINDOWS: { label: string; value: number | null }[] = [
  { label: "10 s", value: 10 },
  { label: "30 s", value: 30 },
  { label: "60 s", value: 60 },
  { label: "Tudo", value: null },
];

export function AnatixCharts({
  store,
  version,
  selected,
  onSelectedChange,
}: {
  store: AnatixStore;
  version: number;
  selected: string[];
  onSelectedChange: (metrics: string[]) => void;
}) {
  const { ref, theme } = useChartTheme();
  const [windowSec, setWindowSec] = useState<number | null>(30);

  const names = useMemo(
    () => [...store.metrics.keys()].sort(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, version],
  );
  const active = selected.filter((n) => store.metrics.has(n));
  const shown = active.length ? active : names.slice(0, 4);

  const shownKey = shown.join("|");
  const lines = useMemo(() => {
    const end = store.lastT;
    return shown.map((name) => ({
      name,
      data: seriesWindow(store.metrics.get(name)!, windowSec, end),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, version, shownKey, windowSec]);

  const loopData = useMemo(() => {
    const end = store.lastT ?? 0;
    const start = windowSec ? end - windowSec * 1000 : -Infinity;
    return store.loop
      .filter((l) => l.t >= start)
      .map((l) => ({ t: l.t / 1000, lps: l.lps, maxUs: l.maxUs, avgUs: l.avgUs }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, version, windowSec]);

  const sections = useMemo(
    () =>
      [...store.sections.values()].map((s) => ({
        name: s.section,
        "média (µs)": s.avgUs,
        "máx (µs)": s.maxUs,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, version],
  );

  const events = useMemo(
    () =>
      [...store.eventCounts]
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 12),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, version],
  );

  const toggle = (name: string) => {
    const base = active.length ? active : shown;
    onSelectedChange(
      base.includes(name) ? base.filter((n) => n !== name) : [...base, name].slice(0, 8),
    );
  };

  const axis = { stroke: theme.axis, fontSize: 11, tickLine: false };
  const tooltip = {
    contentStyle: {
      background: theme.surface,
      border: `1px solid ${theme.grid}`,
      borderRadius: 12,
      fontSize: 12,
    },
    labelFormatter: (t: unknown) => `t = ${fmtNum(Number(t))} s`,
    formatter: (v: unknown) => fmtNum(Number(v)),
  };

  return (
    <div ref={ref} className="grid gap-4 xl:grid-cols-2">
      <AnatixPanel
        className="xl:col-span-2"
        title="Métricas no tempo"
        hint="ANX_VALUE — escolha até 8 métricas"
        actions={
          <div className="join">
            {WINDOWS.map((w) => (
              <button
                key={w.label}
                type="button"
                onClick={() => setWindowSec(w.value)}
                className={`btn join-item btn-xs ${windowSec === w.value ? "btn-primary" : "btn-ghost border-base-300"}`}
              >
                {w.label}
              </button>
            ))}
          </div>
        }
      >
        {names.length === 0 ? (
          <AnatixEmpty>Nenhuma métrica recebida ainda. Use ANX_VALUE no sketch.</AnatixEmpty>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {names.map((name) => {
                const idx = shown.indexOf(name);
                const on = idx >= 0;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggle(name)}
                    className={`btn btn-xs rounded-full ${on ? "btn-neutral" : "btn-ghost border-base-300"}`}
                  >
                    {on && (
                      <span
                        className="size-2 rounded-full"
                        style={{ background: theme.series[idx % theme.series.length] }}
                      />
                    )}
                    {name}
                  </button>
                );
              })}
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart margin={{ top: 4, right: 12, bottom: 0, left: -8 }}>
                  <CartesianGrid stroke={theme.grid} vertical={false} />
                  <XAxis
                    dataKey="t"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    tickFormatter={(t) => `${fmtNum(t, 1)}s`}
                    allowDuplicatedCategory={false}
                    {...axis}
                  />
                  <YAxis tickFormatter={(v) => fmtNum(v)} width={56} {...axis} />
                  <Tooltip {...tooltip} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {lines.map((line, i) => (
                    <Line
                      key={line.name}
                      data={line.data}
                      dataKey="v"
                      name={line.name}
                      type="linear"
                      dot={false}
                      strokeWidth={2}
                      stroke={theme.series[i % theme.series.length]}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </AnatixPanel>

      <AnatixPanel title="Desempenho do loop" hint="Loops por segundo e pior tempo do loop (relatório automático)">
        {loopData.length === 0 ? (
          <AnatixEmpty>Aguardando relatórios automáticos (frame L).</AnatixEmpty>
        ) : (
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={loopData} margin={{ top: 4, right: 0, bottom: 0, left: -8 }}>
                <CartesianGrid stroke={theme.grid} vertical={false} />
                <XAxis dataKey="t" type="number" domain={["dataMin", "dataMax"]} tickFormatter={(t) => `${fmtNum(t, 1)}s`} {...axis} />
                <YAxis yAxisId="lps" tickFormatter={(v) => fmtNum(v)} width={48} {...axis} />
                <YAxis yAxisId="us" orientation="right" tickFormatter={(v) => fmtNum(v)} width={52} {...axis} />
                <Tooltip {...tooltip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line yAxisId="lps" dataKey="lps" name="loops/s" dot={false} strokeWidth={2} stroke={theme.series[0]} isAnimationActive={false} />
                <Line yAxisId="us" dataKey="maxUs" name="pior loop (µs)" dot={false} strokeWidth={2} stroke={theme.series[1]} isAnimationActive={false} />
                <Line yAxisId="us" dataKey="avgUs" name="loop médio (µs)" dot={false} strokeWidth={1.5} strokeDasharray="4 3" stroke={theme.series[3]} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </AnatixPanel>

      <AnatixPanel title="Tempo das seções" hint="ANX_SCOPE / ANX_SECTION — média e máximo do último período">
        {sections.length === 0 ? (
          <AnatixEmpty>Nenhuma seção cronometrada ainda.</AnatixEmpty>
        ) : (
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sections} margin={{ top: 4, right: 0, bottom: 0, left: -8 }}>
                <CartesianGrid stroke={theme.grid} vertical={false} />
                <XAxis dataKey="name" {...axis} />
                <YAxis tickFormatter={(v) => fmtNum(v)} width={52} {...axis} />
                <Tooltip {...tooltip} labelFormatter={(l) => String(l)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="média (µs)" fill={theme.series[2]} radius={[6, 6, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="máx (µs)" fill={theme.series[0]} radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </AnatixPanel>

      <AnatixPanel className="xl:col-span-2" title="Eventos" hint="ANX_EVENT — quantas vezes cada evento aconteceu">
        {events.length === 0 ? (
          <AnatixEmpty>Nenhum evento recebido ainda.</AnatixEmpty>
        ) : (
          <div style={{ height: Math.max(120, events.length * 30 + 30) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={events} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
                <CartesianGrid stroke={theme.grid} horizontal={false} />
                <XAxis type="number" allowDecimals={false} {...axis} />
                <YAxis type="category" dataKey="name" width={120} {...axis} />
                <Tooltip {...tooltip} labelFormatter={(l) => String(l)} />
                <Bar dataKey="total" name="ocorrências" fill={theme.series[4]} radius={[0, 6, 6, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </AnatixPanel>
    </div>
  );
}
