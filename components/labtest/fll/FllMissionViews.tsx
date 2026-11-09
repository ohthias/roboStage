"use client";

// ---------------------------------------------------------------------------
// Visões por missão da FLL: ranking (gráfico), desempenho por missão (tabela)
// e mapa missão × execução. Usadas na aba Análise e nos blocos do painel.
// ---------------------------------------------------------------------------

import { Fragment, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Download } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartTheme } from "@/components/labtest/charts/chart-theme";
import type { TestEntry } from "@/types/labtest.types";
import type { FllMissionDefinition } from "@/utils/labtest/fll";
import {
  fllMissionGrid,
  fllMissionStats,
  type FllMissionStat,
} from "@/utils/labtest/fll-analysis";
import { toCsv } from "@/utils/labtest/anatix/analysis";

const nf = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const pct = (v: number | null | undefined) => (v === null || v === undefined ? "—" : `${Math.round(v * 100)}%`);
const pts = (v: number | null | undefined) => (v === null || v === undefined ? "—" : nf.format(v));
const secs = (v: number | null | undefined) => {
  if (v === null || v === undefined) return "—";
  const s = Math.round(v);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

function downloadCsv(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([`﻿${text}`], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-36 items-center justify-center rounded-xl border border-dashed border-base-300 px-4 py-6 text-center text-sm text-base-content/50">
      {children}
    </div>
  );
}

function effClass(e: number | null) {
  if (e === null) return "text-base-content/40";
  if (e >= 0.8) return "text-success";
  if (e >= 0.5) return "text-warning";
  return "text-error";
}

// ---- Ranking --------------------------------------------------------------

export function FllMissionRanking({
  missions,
  entries,
  theme,
  height = 260,
}: {
  missions: FllMissionDefinition[];
  entries: TestEntry[];
  theme: ChartTheme;
  height?: number;
}) {
  const [order, setOrder] = useState<"lost" | "eff" | "test">("lost");
  const stats = useMemo(() => fllMissionStats(missions, entries).filter((s) => s.attempts > 0), [missions, entries]);
  if (!stats.length) return <Empty>Nenhuma execução com missões respondidas.</Empty>;

  const sorted = [...stats].sort((a, b) =>
    order === "lost" ? b.lost - a.lost : order === "eff" ? (a.efficiency ?? 0) - (b.efficiency ?? 0) : 0,
  );
  const data = sorted.map((s) => ({
    name: s.id,
    full: s.name,
    média: Number(s.avg.toFixed(2)),
    perdido: Number(s.lost.toFixed(2)),
    max: s.max,
    eff: s.efficiency,
  }));
  const axis = { stroke: theme.axis, fontSize: 11, tickLine: false };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-base-content/55">
        <span>Barra cheia = máximo da missão · parte clara = pontos que ficaram na mesa</span>
        <div className="join">
          {(
            [
              ["lost", "Mais pontos perdidos"],
              ["eff", "Menor aproveitamento"],
              ["test", "Ordem do teste"],
            ] as const
          ).map(([k, label]) => (
            <button key={k} type="button" onClick={() => setOrder(k)} className={`btn join-item btn-xs ${order === k ? "btn-neutral" : "btn-ghost border-base-300"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: Math.max(height, data.length * 26 + 50) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 4 }} barCategoryGap={4}>
            <CartesianGrid stroke={theme.grid} horizontal={false} />
            <XAxis type="number" {...axis} />
            <YAxis type="category" dataKey="name" width={52} {...axis} />
            <Tooltip
              contentStyle={{ background: theme.surface, border: `1px solid ${theme.grid}`, borderRadius: 12, fontSize: 12 }}
              labelFormatter={(_, p) => {
                const d = p?.[0]?.payload as (typeof data)[number] | undefined;
                return d ? `${d.name} · ${d.full} (máx ${d.max} pts · ${pct(d.eff)})` : "";
              }}
              formatter={(v, n) => [`${pts(Number(v))} pts`, String(n)]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="média" stackId="m" name="Média feita" fill={theme.series[0]} isAnimationActive={false} />
            <Bar dataKey="perdido" stackId="m" name="Perdido em média" fill={/^#[0-9a-f]{6}$/i.test(theme.series[0]) ? `${theme.series[0]}38` : theme.grid} radius={[0, 5, 5, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---- Tabela por missão ----------------------------------------------------

type SortKey = "test" | "id" | "max" | "attempts" | "scoredRate" | "fullRate" | "avg" | "best" | "efficiency" | "lost" | "std" | "share" | "avgFirstMark";

const COLS: { key: SortKey; label: string; title?: string }[] = [
  { key: "max", label: "Máx", title: "Pontuação máxima possível da missão" },
  { key: "attempts", label: "Tentativas" },
  { key: "scoredRate", label: "Pontuou", title: "% das execuções em que fez algum ponto" },
  { key: "fullRate", label: "No máximo", title: "% das execuções em que fez a missão completa" },
  { key: "avg", label: "Média" },
  { key: "best", label: "Melhor" },
  { key: "efficiency", label: "Aproveit.", title: "Média ÷ máximo" },
  { key: "lost", label: "Perdido", title: "Pontos que ficam na mesa em média (máx − média)" },
  { key: "std", label: "Oscilação", title: "Desvio padrão dos pontos (menor = mais consistente)" },
  { key: "share", label: "% do placar", title: "Fatia dos pontos totais que veio desta missão" },
  { key: "avgFirstMark", label: "1ª marcação", title: "Tempo médio até marcar a missão (Round 2:30)" },
];

function sortValue(s: FllMissionStat, k: SortKey, index: number): number | string {
  switch (k) {
    case "test":
      return index;
    case "id":
      return s.id;
    case "scoredRate":
      return s.attempts ? s.scored / s.attempts : -1;
    case "fullRate":
      return s.attempts ? s.full / s.attempts : -1;
    case "efficiency":
      return s.efficiency ?? -1;
    case "avgFirstMark":
      return s.avgFirstMark ?? Number.MAX_SAFE_INTEGER;
    default:
      return s[k];
  }
}

export function FllMissionTable({
  missions,
  entries,
  fileName,
  maxHeight,
}: {
  missions: FllMissionDefinition[];
  entries: TestEntry[];
  fileName: string;
  maxHeight?: number;
}) {
  const stats = useMemo(() => fllMissionStats(missions, entries), [missions, entries]);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "test", dir: 1 });
  const [open, setOpen] = useState<Set<string>>(new Set());
  if (!stats.length) return <Empty>Nenhuma missão neste teste.</Empty>;

  const hasMarks = stats.some((s) => s.avgFirstMark !== null);
  const cols = COLS.filter((c) => c.key !== "avgFirstMark" || hasMarks);
  const indexed = stats.map((s, i) => ({ s, i }));
  indexed.sort((a, b) => {
    const va = sortValue(a.s, sort.key, a.i);
    const vb = sortValue(b.s, sort.key, b.i);
    return (typeof va === "string" ? va.localeCompare(String(vb)) : va - (vb as number)) * sort.dir;
  });
  const toggleSort = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : key === "test" || key === "id" ? 1 : -1 }));
  const totals = stats.reduce(
    (acc, s) => ({ max: acc.max + s.max, avg: acc.avg + s.avg, best: acc.best + s.best }),
    { max: 0, avg: 0, best: 0 },
  );

  const th = (key: SortKey, label: string, title?: string, right = true) => (
    <th key={key} className={right ? "text-right" : ""} title={title}>
      <button type="button" className="inline-flex items-center gap-0.5 whitespace-nowrap hover:text-base-content" onClick={() => toggleSort(key)}>
        {label}
        {sort.key === key && (sort.dir === 1 ? <ArrowUp size={10} /> : <ArrowDown size={10} />)}
      </button>
    </th>
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-base-content/50">
        <span>
          {entries.length} execuções · clique na missão para ver as submissões · <span className="text-success">verde</span> ≥ 80% de aproveitamento,{" "}
          <span className="text-error">vermelho</span> &lt; 50%
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-xs border-base-300"
          onClick={() =>
            downloadCsv(
              `${fileName}-missoes.csv`,
              toCsv(
                ["missao", "nome", "max", "tentativas", "pontuou", "no_maximo", "media", "melhor", "aproveitamento", "perdido", "oscilacao", "fatia_placar", "primeira_marcacao_s"],
                stats.map((s) => [s.id, s.name, s.max, s.attempts, s.scored, s.full, +s.avg.toFixed(2), s.best, s.efficiency === null ? null : +s.efficiency.toFixed(3), +s.lost.toFixed(2), +s.std.toFixed(2), +s.share.toFixed(3), s.avgFirstMark === null ? null : +s.avgFirstMark.toFixed(1)]),
              ),
            )
          }
        >
          <Download size={12} /> CSV
        </button>
      </div>
      <div className="overflow-auto" style={maxHeight ? { maxHeight } : undefined}>
        <table className="table table-pin-rows table-sm">
          <thead>
            <tr>
              {th("test", "Missão", "Ordem do teste", false)}
              {cols.map((c) => th(c.key, c.label, c.title))}
            </tr>
          </thead>
          <tbody>
            {indexed.map(({ s }) => {
              const isOpen = open.has(s.id);
              const canOpen = s.subs.length > 0;
              return (
                <Fragment key={s.id}>
                  <tr className={canOpen ? "cursor-pointer hover:bg-base-200/50" : ""} onClick={() => canOpen && setOpen((o) => {
                    const n = new Set(o);
                    if (n.has(s.id)) n.delete(s.id);
                    else n.add(s.id);
                    return n;
                  })}>
                    <td className="min-w-48">
                      <div className="flex items-center gap-1.5">
                        {canOpen ? (isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />) : <span className="inline-block w-[13px] shrink-0" />}
                        <span className="badge badge-primary badge-soft badge-sm font-mono">{s.id}</span>
                        <span className="truncate text-sm font-semibold" title={s.name}>{s.name}</span>
                      </div>
                    </td>
                    {cols.map((c) => (
                      <td key={c.key} className={`text-right font-mono ${c.key === "efficiency" ? `font-bold ${effClass(s.efficiency)}` : ""}`}>
                        {s.attempts === 0 && c.key !== "max" && c.key !== "attempts"
                          ? "—"
                          : c.key === "scoredRate"
                            ? pct(s.attempts ? s.scored / s.attempts : null)
                            : c.key === "fullRate"
                              ? pct(s.attempts ? s.full / s.attempts : null)
                              : c.key === "efficiency" || c.key === "share"
                                ? pct(s[c.key])
                                : c.key === "avgFirstMark"
                                  ? `${secs(s.avgFirstMark)}${s.afterTime ? ` (+${s.afterTime} pós)` : ""}`
                                  : pts(sortValue(s, c.key, 0) as number)}
                      </td>
                    ))}
                  </tr>
                  {isOpen &&
                    s.subs.map((sub) => (
                      <tr key={sub.key} className="bg-base-200/40 text-xs">
                        <td className="pl-10 text-base-content/70" title={sub.label}>
                          <span className="line-clamp-2">↳ {sub.label}</span>
                        </td>
                        {cols.map((c) => (
                          <td key={c.key} className="text-right font-mono text-base-content/70">
                            {c.key === "max" ? pts(sub.max) : c.key === "avg" ? pts(sub.avg) : c.key === "scoredRate" ? pct(sub.scoredRate) : c.key === "efficiency" ? pct(sub.max > 0 ? sub.avg / sub.max : null) : c.key === "lost" ? pts(Math.max(0, sub.max - sub.avg)) : ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                </Fragment>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="text-xs">
              <td className="font-bold">Total das missões</td>
              {cols.map((c) => (
                <td key={c.key} className="text-right font-mono font-bold">
                  {c.key === "max" ? pts(totals.max) : c.key === "avg" ? pts(totals.avg) : c.key === "best" ? pts(totals.best) : c.key === "efficiency" ? pct(totals.max ? totals.avg / totals.max : null) : c.key === "lost" ? pts(Math.max(0, totals.max - totals.avg)) : ""}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-[11px] text-base-content/45">
        Totais sem inspeção, discos de precisão e bônus do Round 2:30 — esses entram no placar da execução.
      </p>
    </div>
  );
}

// ---- Missão × execução ----------------------------------------------------

export function FllMissionGrid({
  missions,
  entries,
  theme,
  fileName,
}: {
  missions: FllMissionDefinition[];
  entries: TestEntry[];
  theme: ChartTheme;
  fileName: string;
}) {
  const grid = useMemo(() => fllMissionGrid(missions, entries), [missions, entries]);
  if (!grid.executions.length) return <Empty>Nenhuma execução com os filtros atuais.</Empty>;
  const bg = (r: number | null) =>
    r === null ? "transparent" : `color-mix(in oklab, ${r >= 1 ? theme.series[4] : r > 0 ? theme.series[2] : theme.series[0]} ${r >= 1 ? 70 : r > 0 ? Math.round(25 + r * 45) : 22}%, ${theme.surface})`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-base-content/55">
        <span className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm" style={{ background: bg(1) }} /> máximo</span>
          <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm" style={{ background: bg(0.5) }} /> parcial</span>
          <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm" style={{ background: bg(0) }} /> zerou</span>
          <span>— = missão fora da execução</span>
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-xs border-base-300"
          onClick={() =>
            downloadCsv(
              `${fileName}-missoes-por-execucao.csv`,
              toCsv(
                ["missao", "max", ...grid.executions.map((e) => `#${e.n}`)],
                [
                  ...grid.rows.map((r) => [r.id, r.max, ...r.cells.map((c) => c.points)]),
                  ["placar", null, ...grid.executions.map((e) => e.total)],
                ],
              ),
            )
          }
        >
          <Download size={12} /> CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="table table-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-base-100">Missão</th>
              <th className="text-right">Máx</th>
              {grid.executions.map((e) => (
                <th key={e.id} className="text-center font-mono">#{e.n}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.rows.map((r) => (
              <tr key={r.id}>
                <th className="sticky left-0 z-10 max-w-44 truncate bg-base-100" title={`${r.id} · ${r.name}`}>
                  <span className="font-mono">{r.id}</span> <span className="font-normal text-base-content/60">{r.name}</span>
                </th>
                <td className="text-right font-mono text-base-content/50">{r.max}</td>
                {r.cells.map((c, i) => (
                  <td
                    key={i}
                    className="text-center font-mono"
                    style={{ background: bg(c.ratio) }}
                    title={c.points === null ? "fora da execução" : `${c.points} de ${r.max} pts`}
                  >
                    {c.points === null ? "—" : c.points}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th className="sticky left-0 z-10 bg-base-100">Placar</th>
              <td />
              {grid.executions.map((e) => (
                <td key={e.id} className="text-center font-mono font-bold">{e.total ?? "—"}</td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
