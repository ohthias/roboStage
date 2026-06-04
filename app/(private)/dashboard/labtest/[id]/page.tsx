"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ListOrdered,
  SlidersHorizontal,
  Target,
  FlaskConical,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Plus,
  Star,
  BarChart2,
  Activity,
  Award,
  Clock,
  RotateCcw,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";

// ---------------------------------------------------------------------------
// Types from database
// ---------------------------------------------------------------------------

type Mode = "runs" | "calibrabot" | "individual";

interface TestRow {
  id: string;
  name: string;
  description?: string | null;
  mode: Mode;
  season?: string | null;
  status?: string | null;
  created_at: string;
  updated_at?: string | null;
  last_access_at?: string | null;
  config?: Record<string, unknown>;
}

interface TestMissionRow {
  id: number;
  test_id: string;
  mission_key: string;
  mission_name: string;
  mission_order: number;
  season?: string | null;
  max_value?: number | null;
  created_at: string;
}

interface TestVariableRow {
  id: number;
  test_id: string;
  variable_order: number;
  name: string;
  value?: unknown;
  unit?: string | null;
  created_at: string;
}

interface TestExecutionResultRow {
  id: number;
  execution_id: string;
  mission_key: string;
  mission_name?: string | null;
  score: number;
  max_score?: number | null;
  success?: boolean | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

interface TestExecutionRow {
  id: string;
  test_id: string;
  execution_number: number;
  score?: number | null;
  returned_to_base: boolean;
  notes?: string | null;
  metrics?: Record<string, unknown> | null;
  started_at?: string | null;
  finished_at?: string | null;
  created_at: string;
  test_execution_results?: TestExecutionResultRow[];
}

interface Mission {
  id: string;
  name: string;
  maxValue?: number;
}

interface MissionResult {
  missionId: string;
  completed: boolean;
  score: number;
}

interface RunEntry {
  id: number;
  createdAt: string;
  results: MissionResult[];
}

interface CalibVariable {
  id: number;
  name: string;
}

interface CalibCombo {
  index: number;
  components: string[];
}

interface CalibEntry {
  id: number;
  createdAt: string;
  combo: CalibCombo;
  variables: { varId: number; value: number }[];
  notes: string;
}

interface IndividualAttempt {
  id: number;
  createdAt: string;
  success: boolean;
  score: number;
  notes: string;
}

interface LabTestViewProps {
  testId: string;
  onAddResult?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function runTotal(run: RunEntry) {
  return run.results.reduce((s, r) => s + (r.completed ? r.score : 0), 0);
}

function trend(values: number[]): "up" | "down" | "flat" {
  if (values.length < 2) return "flat";
  const last = values[values.length - 1];
  const prev = values[values.length - 2];
  if (last > prev) return "up";
  if (last < prev) return "down";
  return "flat";
}

function getMetricValue(
  metrics: Record<string, unknown> | null | undefined,
  variableName: string,
  variableId: number,
) {
  const shortName = variableName.split(" ")[0];
  const candidateKeys = [variableName, shortName, String(variableId)];

  for (const key of candidateKeys) {
    const raw = metrics?.[key];
    if (typeof raw === "number") return raw;
    if (typeof raw === "string") {
      const n = Number(raw);
      if (!Number.isNaN(n)) return n;
    }
  }

  return 0;
}

function buildLabelFromMetrics(
  metrics: Record<string, unknown> | null | undefined,
  executionNumber: number,
) {
  const components = metrics?.components;
  if (Array.isArray(components) && components.length > 0) {
    return components
      .map((item) => (typeof item === "string" ? item : String(item)))
      .join(" + ");
  }

  return `Execução #${executionNumber}`;
}

const TREND_ICON = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

const TREND_COLOR = {
  up: "text-success",
  down: "text-error",
  flat: "text-base-content/40",
};

const MODE_META = {
  runs: {
    icon: ListOrdered,
    label: "Criação de Runs",
    accent: "primary" as const,
  },
  calibrabot: {
    icon: SlidersHorizontal,
    label: "CalibraBot",
    accent: "secondary" as const,
  },
  individual: {
    icon: Target,
    label: "Missão Individual",
    accent: "accent" as const,
  },
};

const ACCENT = {
  primary: {
    text: "text-primary",
    bgSoft: "bg-primary/12",
    borderSoft: "border-primary/25",
    btn: "btn-primary",
    badgeBorder: "border-primary/30",
  },
  secondary: {
    text: "text-secondary",
    bgSoft: "bg-secondary/12",
    borderSoft: "border-secondary/25",
    btn: "btn-secondary",
    badgeBorder: "border-secondary/30",
  },
  accent: {
    text: "text-accent",
    bgSoft: "bg-accent/12",
    borderSoft: "border-accent/25",
    btn: "btn-accent",
    badgeBorder: "border-accent/30",
  },
} as const;

type AccentKey = keyof typeof ACCENT;

// ---------------------------------------------------------------------------
// Shared UI atoms
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trendDir,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.FC<{ className?: string }>;
  trendDir?: "up" | "down" | "flat";
  accent?: AccentKey;
}) {
  const TIcon = trendDir ? TREND_ICON[trendDir] : null;
  const style = ACCENT[accent];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-base-content/10 bg-base-100 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-base-content/45">
          {label}
        </span>
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${style.bgSoft}`}
        >
          <Icon className={`h-3.5 w-3.5 ${style.text}`} />
        </div>
      </div>
      <div>
        <p className={`text-3xl font-bold tracking-tight ${style.text}`}>
          {value}
        </p>
        {sub && (
          <p className="mt-1 flex items-center gap-1 text-xs text-base-content/40">
            {TIcon && (
              <TIcon
                className={`h-3 w-3 ${trendDir ? TREND_COLOR[trendDir] : ""}`}
              />
            )}
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  label,
  action,
}: {
  label: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-base-content/60">
        {label}
      </h3>
      {action}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-base-content/15 bg-base-100 px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Runs view
// ---------------------------------------------------------------------------

function RunsView({
  missions,
  runs,
}: {
  missions: Mission[];
  runs: RunEntry[];
}) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const scores = runs.map(runTotal);
  const maxScore = missions.reduce((s, m) => s + (m.maxValue ?? 0), 0);
  const best = scores.length ? Math.max(...scores) : 0;
  const avg = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
  const lastTrend = trend(scores);

  const lineData = runs.map((r, i) => ({
    name: `Run ${i + 1}`,
    pontuação: runTotal(r),
    máximo: maxScore,
  }));

  const missionRates = missions.map((m) => ({
    mission: m.id,
    taxa: runs.length
      ? Math.round(
          (runs.filter((r) =>
            r.results.find((res) => res.missionId === m.id && res.completed),
          ).length /
            runs.length) *
            100,
        )
      : 0,
  }));

  const avgMissionRate = missionRates.length
    ? Math.round(
        missionRates.reduce((a, m) => a + m.taxa, 0) / missionRates.length,
      )
    : 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Runs"
          value={runs.length}
          icon={ListOrdered}
          accent="primary"
        />
        <StatCard
          label="Melhor run"
          value={`${best} pts`}
          sub={`máx ${maxScore} pts`}
          icon={Award}
          accent="primary"
          trendDir={lastTrend}
        />
        <StatCard
          label="Média"
          value={`${avg} pts`}
          sub="por run"
          icon={BarChart2}
          accent="primary"
        />
        <StatCard
          label="Taxa de missões"
          value={`${avgMissionRate}%`}
          sub="conclusão média"
          icon={Activity}
          accent="primary"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-base-content/10 bg-base-100 p-5 lg:col-span-2">
          <SectionHeader label="Evolução de pontuação" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(var(--bc)/0.07)"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                stroke="oklch(var(--bc)/0.2)"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="oklch(var(--bc)/0.2)"
                domain={[0, maxScore + 10]}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={maxScore}
                stroke="oklch(var(--bc)/0.15)"
                strokeDasharray="4 4"
                label={{
                  value: "máx",
                  fontSize: 10,
                  fill: "oklch(var(--bc)/0.3)",
                }}
              />
              <Line
                type="monotone"
                dataKey="pontuação"
                stroke="oklch(var(--p))"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "oklch(var(--p))" }}
                activeDot={{ r: 6 }}
                name="Pontuação"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-base-content/10 bg-base-100 p-5">
          <SectionHeader label="Taxa por missão" />
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={missionRates}>
              <PolarGrid stroke="oklch(var(--bc)/0.1)" />
              <PolarAngleAxis dataKey="mission" tick={{ fontSize: 11 }} />
              <Radar
                dataKey="taxa"
                stroke="oklch(var(--p))"
                fill="oklch(var(--p))"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <SectionHeader label="Histórico de runs" />
        <div className="flex flex-col gap-2">
          {[...runs].reverse().map((run, ri) => {
            const total = runTotal(run);
            const pct = maxScore > 0 ? Math.round((total / maxScore) * 100) : 0;
            const isOpen = expanded === run.id;
            return (
              <div
                key={run.id}
                className="overflow-hidden rounded-2xl border border-base-content/10 bg-base-100"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : run.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-base-200/40"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-xs font-bold text-primary">
                    {runs.length - ri}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      Run #{runs.length - ri}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-base-content/40">
                      <Calendar className="h-3 w-3" />
                      {fmtDate(run.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    <div className="text-right">
                      <p className="text-base font-bold text-primary">
                        {total} pts
                      </p>
                      <p className="text-xs text-base-content/40">
                        {pct}% do máx
                      </p>
                    </div>
                    <div className="w-16">
                      <progress
                        className="progress progress-primary h-1.5 w-full"
                        value={pct}
                        max={100}
                      />
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-base-content/30" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-base-content/30" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="grid grid-cols-1 gap-2 border-t border-base-content/8 px-5 py-4 sm:grid-cols-2">
                    {run.results.map((res) => {
                      const m = missions.find((x) => x.id === res.missionId);
                      return (
                        <div
                          key={res.missionId}
                          className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${
                            res.completed
                              ? "border-success/25 bg-success/5"
                              : "border-base-content/8 bg-base-200/40"
                          }`}
                        >
                          {res.completed ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                          ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-base-content/25" />
                          )}
                          <span className="flex-1 font-medium">
                            {m?.id} — {m?.name}
                          </span>
                          {res.completed && (
                            <span className="font-bold text-primary">
                              {res.score} pts
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CalibraBot view
// ---------------------------------------------------------------------------

function CalibrabotView({
  variables,
  entries,
}: {
  variables: CalibVariable[];
  entries: CalibEntry[];
}) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [activeVar, setActiveVar] = useState(variables[0]?.id ?? 0);

  const activeVarName = variables.find((v) => v.id === activeVar)?.name ?? "";
  const activeValues = entries.map(
    (e) => e.variables.find((v) => v.varId === activeVar)?.value ?? 0,
  );

  const bestEntry = entries.length
    ? entries.reduce((best, e) => {
        const val = e.variables.find((v) => v.varId === activeVar)?.value ?? 0;
        const bestVal =
          best.variables.find((v) => v.varId === activeVar)?.value ?? 0;
        return val > bestVal ? e : best;
      }, entries[0])
    : undefined;

  const barData = entries.map((e) => ({
    name: `C${e.combo.index}`,
    combo: e.combo.components.join(" + "),
    ...Object.fromEntries(
      e.variables.map((v) => {
        const vv = variables.find((x) => x.id === v.varId);
        return [vv?.name ?? `var${v.varId}`, v.value];
      }),
    ),
  }));

  const bestBarIndex = bestEntry
    ? barData.findIndex((d) => d.name === `C${bestEntry.combo.index}`)
    : -1;

  const avgValue = activeValues.length
    ? Math.round(activeValues.reduce((a, b) => a + b, 0) / activeValues.length)
    : 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Combinações"
          value={entries.length}
          icon={SlidersHorizontal}
          accent="secondary"
        />
        <StatCard
          label="Variáveis"
          value={variables.length}
          icon={Activity}
          accent="secondary"
        />
        <StatCard
          label={`Melhor (${activeVarName.split(" ")[0] || "valor"})`}
          value={activeValues.length ? Math.max(...activeValues) : 0}
          sub={bestEntry ? `combinação C${bestEntry.combo.index}` : undefined}
          icon={Award}
          accent="secondary"
        />
        <StatCard
          label="Média"
          value={avgValue}
          sub={activeVarName.split(" ")[0] || "valor"}
          icon={BarChart2}
          accent="secondary"
        />
      </div>

      <div className="rounded-2xl border border-base-content/10 bg-base-100 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-base-content/60">
            Comparativo por combinação
          </h3>
          <div className="flex gap-1">
            {variables.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setActiveVar(v.id)}
                className={`btn btn-xs rounded-lg ${
                  activeVar === v.id
                    ? "btn-secondary"
                    : "btn-ghost text-base-content/50"
                }`}
              >
                {v.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(var(--bc)/0.07)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              stroke="oklch(var(--bc)/0.2)"
            />
            <YAxis tick={{ fontSize: 11 }} stroke="oklch(var(--bc)/0.2)" />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey={activeVarName}
              radius={[6, 6, 0, 0]}
              name={activeVarName}
            >
              {barData.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    i === bestBarIndex
                      ? "oklch(var(--s))"
                      : "oklch(var(--s)/0.4)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <SectionHeader label="Resultados por combinação" />
        <div className="flex flex-col gap-2">
          {entries.map((entry) => {
            const isOpen = expanded === entry.id;
            return (
              <div
                key={entry.id}
                className="overflow-hidden rounded-2xl border border-base-content/10 bg-base-100"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : entry.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-base-200/40"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary/12 text-xs font-bold text-secondary">
                    C{entry.combo.index}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {entry.combo.components.join(" + ")}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-base-content/40">
                      <Calendar className="h-3 w-3" />
                      {fmtDate(entry.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    {entry.variables.slice(0, 2).map((v) => {
                      const vv = variables.find((x) => x.id === v.varId);
                      return (
                        <div
                          key={v.varId}
                          className="hidden text-right sm:block"
                        >
                          <p className="text-xs text-base-content/40">
                            {vv?.name.split(" ")[0]}
                          </p>
                          <p className="text-sm font-bold text-secondary">
                            {v.value}
                          </p>
                        </div>
                      );
                    })}
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-base-content/30" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-base-content/30" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="flex flex-col gap-4 border-t border-base-content/8 px-5 py-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {entry.variables.map((v) => {
                        const vv = variables.find((x) => x.id === v.varId);
                        return (
                          <div
                            key={v.varId}
                            className="rounded-xl border border-base-content/8 bg-base-200/50 px-4 py-3"
                          >
                            <p className="text-xs text-base-content/45">
                              {vv?.name}
                            </p>
                            <p className="mt-1 text-xl font-bold text-secondary">
                              {v.value}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {entry.notes && (
                      <div className="border-l-2 border-secondary/30 pl-3 text-sm leading-relaxed text-base-content/60">
                        {entry.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Individual view
// ---------------------------------------------------------------------------

function IndividualView({
  attempts,
  mission,
}: {
  attempts: IndividualAttempt[];
  mission?: Mission;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const scores = attempts.map((a) => a.score);
  const successCount = attempts.filter((a) => a.success).length;
  const successRate = attempts.length
    ? Math.round((successCount / attempts.length) * 100)
    : 0;
  const best = scores.length ? Math.max(...scores) : 0;
  const lastTrend = trend(
    attempts.filter((a) => a.success).map((a) => a.score),
  );

  const lineData = attempts.map((a, i) => ({
    name: `#${i + 1}`,
    pontuação: a.success ? a.score : null,
    tentativa: a.score,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Tentativas"
          value={attempts.length}
          icon={RotateCcw}
          accent="accent"
        />
        <StatCard
          label="Taxa de sucesso"
          value={`${successRate}%`}
          sub={`${successCount} de ${attempts.length}`}
          icon={CheckCircle2}
          accent="accent"
          trendDir={lastTrend}
        />
        <StatCard
          label="Melhor resultado"
          value={`${best} pts`}
          sub={mission?.maxValue ? `máx ${mission.maxValue} pts` : undefined}
          icon={Award}
          accent="accent"
        />
        <StatCard
          label="Última tentativa"
          value={attempts[attempts.length - 1]?.score ?? "—"}
          sub={attempts[attempts.length - 1]?.success ? "✓ sucesso" : "✗ falha"}
          icon={Clock}
          accent="accent"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-base-content/10 bg-base-100 p-5 lg:col-span-2">
          <SectionHeader label="Evolução da pontuação" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(var(--bc)/0.07)"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                stroke="oklch(var(--bc)/0.2)"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="oklch(var(--bc)/0.2)"
                domain={[0, (mission?.maxValue ?? best) + 5]}
              />
              <Tooltip content={<CustomTooltip />} />
              {mission?.maxValue ? (
                <ReferenceLine
                  y={mission.maxValue}
                  stroke="oklch(var(--bc)/0.15)"
                  strokeDasharray="4 4"
                  label={{
                    value: "máx",
                    fontSize: 10,
                    fill: "oklch(var(--bc)/0.3)",
                  }}
                />
              ) : null}
              <Line
                type="monotone"
                dataKey="tentativa"
                stroke="oklch(var(--a)/0.3)"
                strokeWidth={1.5}
                dot={false}
                name="Pontuação"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="pontuação"
                stroke="oklch(var(--a))"
                strokeWidth={2.5}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.pontuação == null) return <g key={props.key} />;
                  return (
                    <circle
                      key={props.key}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill="oklch(var(--a))"
                    />
                  );
                }}
                name="Sucessos"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col rounded-2xl border border-base-content/10 bg-base-100 p-5">
          <SectionHeader label="Resultado geral" />
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div
              className="radial-progress text-2xl font-bold text-accent"
              style={
                {
                  "--value": successRate,
                  "--size": "7rem",
                  "--thickness": "6px",
                } as React.CSSProperties
              }
            >
              {successRate}%
            </div>

            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-semibold">{successCount}</span>
                <span className="text-base-content/40">sucesso</span>
              </div>
              <div className="flex items-center gap-1.5 text-error">
                <XCircle className="h-4 w-4" />
                <span className="font-semibold">
                  {attempts.length - successCount}
                </span>
                <span className="text-base-content/40">falha</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionHeader label="Histórico de tentativas" />
        <div className="flex flex-col gap-2">
          {[...attempts].reverse().map((att, ri) => {
            const num = attempts.length - ri;
            const isOpen = expanded === att.id;
            return (
              <div
                key={att.id}
                className={`overflow-hidden rounded-2xl border bg-base-100 ${
                  att.success ? "border-success/20" : "border-base-content/10"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : att.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-base-200/40"
                >
                  {att.success ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0 text-base-content/25" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Tentativa #{num}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-base-content/40">
                      <Calendar className="h-3 w-3" />
                      {fmtDate(att.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <p
                        className={`text-base font-bold ${
                          att.success ? "text-accent" : "text-base-content/35"
                        }`}
                      >
                        {att.score} pts
                      </p>
                      {mission?.maxValue ? (
                        <p className="text-xs text-base-content/35">
                          {Math.round((att.score / mission.maxValue) * 100)}%
                        </p>
                      ) : null}
                    </div>

                    {att.score === best && att.success && (
                      <span className="badge badge-xs badge-accent gap-1">
                        <Star className="h-2.5 w-2.5" />
                        melhor
                      </span>
                    )}

                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-base-content/30" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-base-content/30" />
                    )}
                  </div>
                </button>

                {isOpen && att.notes && (
                  <div className="border-l-2 border-l-accent/30 border-t border-base-content/8 px-5 py-3">
                    <p className="text-sm leading-relaxed text-base-content/60">
                      {att.notes}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data mapping
// ---------------------------------------------------------------------------

function mapToMissions(rows: TestMissionRow[] = []): Mission[] {
  return rows
    .slice()
    .sort((a, b) => a.mission_order - b.mission_order)
    .map((row) => ({
      id: row.mission_key,
      name: row.mission_name,
      maxValue: row.max_value ?? undefined,
    }));
}

function mapToVariables(rows: TestVariableRow[] = []): CalibVariable[] {
  return rows
    .slice()
    .sort((a, b) => a.variable_order - b.variable_order)
    .map((row) => ({
      id: row.id,
      name: row.name,
    }));
}

function mapToRuns(executions: TestExecutionRow[] = []): RunEntry[] {
  return executions
    .slice()
    .sort((a, b) => a.execution_number - b.execution_number)
    .map((execution) => ({
      id: execution.execution_number,
      createdAt: execution.created_at,
      results: (execution.test_execution_results ?? []).map((result) => ({
        missionId: result.mission_key,
        completed: Boolean(result.success ?? result.score > 0),
        score: result.score ?? 0,
      })),
    }));
}

function mapToAttempts(
  executions: TestExecutionRow[] = [],
): IndividualAttempt[] {
  return executions
    .slice()
    .sort((a, b) => a.execution_number - b.execution_number)
    .map((execution) => ({
      id: execution.execution_number,
      createdAt: execution.created_at,
      success: execution.returned_to_base,
      score: execution.score ?? 0,
      notes: execution.notes ?? "",
    }));
}

function mapToCalibEntries(
  executions: TestExecutionRow[] = [],
  variables: TestVariableRow[] = [],
): CalibEntry[] {
  return executions
    .slice()
    .sort((a, b) => a.execution_number - b.execution_number)
    .map((execution) => ({
      id: execution.execution_number,
      createdAt: execution.created_at,
      combo: {
        index: execution.execution_number,
        components: [
          buildLabelFromMetrics(execution.metrics, execution.execution_number),
        ],
      },
      variables: variables.map((variable) => ({
        varId: variable.id,
        value: getMetricValue(execution.metrics, variable.name, variable.id),
      })),
      notes: execution.notes ?? "",
    }));
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function LabTestView({
  onAddResult,
}: LabTestViewProps) {
  const params = useParams();
  const testId = params.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [test, setTest] = useState<TestRow | null>(null);
  const [missionsRows, setMissionsRows] = useState<TestMissionRow[]>([]);
  const [variablesRows, setVariablesRows] = useState<TestVariableRow[]>([]);
  const [executionsRows, setExecutionsRows] = useState<TestExecutionRow[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const supabase = createClient();
      setLoading(true);
      setError(null);

      const [testRes, missionsRes, variablesRes, executionsRes] =
        await Promise.all([
          supabase.from("tests").select("*").eq("id", testId).single(),
          supabase
            .from("test_missions")
            .select("*")
            .eq("test_id", testId)
            .order("mission_order", { ascending: true }),
          supabase
            .from("test_variables")
            .select("*")
            .eq("test_id", testId)
            .order("variable_order", { ascending: true }),
          supabase
            .from("test_executions")
            .select(
              `
            *,
            test_execution_results (*)
          `,
            )
            .eq("test_id", testId)
            .order("execution_number", { ascending: true }),
        ]);

      if (!mounted) return;

      if (testRes.error) {
        setError(testRes.error.message);
        setLoading(false);
        return;
      }

      setTest((testRes.data as TestRow) ?? null);
      setMissionsRows((missionsRes.data as TestMissionRow[]) ?? []);
      setVariablesRows((variablesRes.data as TestVariableRow[]) ?? []);
      setExecutionsRows((executionsRes.data as TestExecutionRow[]) ?? []);
      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [testId]);

  const mode = (test?.mode ?? "runs") as Mode;
  const meta = MODE_META[mode];
  const Icon = meta.icon;
  const missions = useMemo(() => mapToMissions(missionsRows), [missionsRows]);
  const calibVariables = useMemo(
    () => mapToVariables(variablesRows),
    [variablesRows],
  );
  const runs = useMemo(() => mapToRuns(executionsRows), [executionsRows]);
  const attempts = useMemo(
    () => mapToAttempts(executionsRows),
    [executionsRows],
  );
  const calibEntries = useMemo(
    () => mapToCalibEntries(executionsRows, variablesRows),
    [executionsRows, variablesRows],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200/40 px-4 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-center rounded-3xl border border-base-content/10 bg-base-100 p-10">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-base-200/40 px-4 py-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-error/20 bg-base-100 p-6">
          <p className="font-semibold text-error">
            Não foi possível carregar o teste.
          </p>
          <p className="mt-2 text-sm text-base-content/60">
            {error ?? "Teste não encontrado."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200/40 px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-base-content/10 bg-base-100 shadow-sm">
              <FlaskConical className="h-6 w-6 text-primary" />
            </div>

            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span
                  className={`badge badge-sm badge-outline gap-1.5 py-2.5 ${
                    meta.accent === "primary"
                      ? "text-primary border-primary/30"
                      : meta.accent === "secondary"
                        ? "text-secondary border-secondary/30"
                        : "text-accent border-accent/30"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {meta.label}
                </span>

                {test.season && (
                  <span className="badge badge-sm badge-ghost text-base-content/40">
                    {test.season}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold tracking-tight">{test.name}</h1>

              <p className="mt-1 flex items-center gap-1.5 text-xs text-base-content/40">
                <Calendar className="h-3 w-3" />
                Criado em {test.created_at ? fmtDate(test.created_at) : "—"}
              </p>

              {test.description && (
                <p className="mt-2 max-w-3xl text-sm text-base-content/60">
                  {test.description}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onAddResult}
            className={`btn ${meta.accent === "primary" ? "btn-primary" : meta.accent === "secondary" ? "btn-secondary" : "btn-accent"} gap-2 shrink-0`}
          >
            <Plus className="h-4 w-4" />
            Registrar resultado
          </button>
        </div>

        {mode === "runs" && <RunsView missions={missions} runs={runs} />}
        {mode === "calibrabot" && (
          <CalibrabotView variables={calibVariables} entries={calibEntries} />
        )}
        {mode === "individual" && (
          <IndividualView attempts={attempts} mission={missions[0]} />
        )}
      </div>
    </div>
  );
}
