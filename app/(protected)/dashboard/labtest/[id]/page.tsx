"use client";

// ---------------------------------------------------------------------------
// Visualização do teste em modo de leitura.
// A página usa a Server Action diretamente no cliente, sem depender do hook
// customizado de carregamento.
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Award,
  Activity,
  BarChart2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FlaskConical,
  ListOrdered,
  XCircle,
  ArrowLeft,
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
} from "recharts";

import { getModeDefinition, ACCENT_STYLES } from "@/utils/labtest/modes";
import {
  computeFieldStats,
  entryTotal,
  maxPossibleTotal,
} from "@/utils/labtest/stats";
import { getFieldValue } from "@/types/labtest.types";
import {
  StatCard,
  SectionHeader,
  CustomTooltip,
  fmtDate,
} from "@/components/labtest/shared";
import { LabTestModeCharts } from "@/components/labtest/LabTestModeCharts";
import { FllRunsCharts } from "@/components/labtest/FllRunsCharts";
import type { FieldDefinition, ModeId, TestEntry } from "@/types/labtest.types";
import { getLabTestViewData } from "../actions";
import {
  FllMissionDefinition,
  FllSubMissionDefinition,
  getSubMissionKey,
  scoreFllExecution,
  scoreFllMission,
} from "@/utils/labtest/fll";

// ---------------------------------------------------------------------------
// Bloco de estatísticas gerais — funciona para qualquer modo
// ---------------------------------------------------------------------------

function OverviewStats({
  fields,
  entries,
  accent,
}: {
  fields: FieldDefinition[];
  entries: TestEntry[];
  accent: "primary" | "secondary" | "accent" | "info";
}) {
  const numericFields = fields.filter((f) => f.type === "number");
  const booleanFields = fields.filter((f) => f.type === "boolean");

  const totals = entries.map((e) => entryTotal(e, fields));
  const maxTotal = maxPossibleTotal(fields);
  const best = totals.length ? Math.max(...totals) : 0;
  const avg = totals.length
    ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length)
    : 0;

  const overallCompletion = booleanFields.length
    ? Math.round(
        booleanFields.reduce(
          (sum, f) => sum + (computeFieldStats(f, entries).completionRate ?? 0),
          0,
        ) / booleanFields.length,
      )
    : null;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Lançamentos"
        value={entries.length}
        icon={ListOrdered}
        accent={accent}
      />
      {numericFields.length > 0 && (
        <>
          <StatCard
            label="Melhor total"
            value={`${best} pts`}
            sub={maxTotal ? `máx ${maxTotal} pts` : undefined}
            icon={Award}
            accent={accent}
          />
          <StatCard
            label="Média"
            value={`${avg} pts`}
            sub="por lançamento"
            icon={BarChart2}
            accent={accent}
          />
        </>
      )}
      {overallCompletion !== null && (
        <StatCard
          label="Taxa de conclusão"
          value={`${overallCompletion}%`}
          sub="campos sim/não"
          icon={Activity}
          accent={accent}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gráfico: evolução do total (para modos com campos numéricos, ex. runs)
// ---------------------------------------------------------------------------

function TotalEvolutionChart({
  fields,
  entries,
}: {
  fields: FieldDefinition[];
  entries: TestEntry[];
}) {
  const maxTotal = maxPossibleTotal(fields);
  const data = entries.map((e, i) => ({
    name: `#${i + 1}`,
    total: entryTotal(e, fields),
  }));

  return (
    <div className="rounded-2xl border border-base-content/10 bg-base-100 p-5 lg:col-span-2">
      <SectionHeader label="Evolução da pontuação" />
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--bc)/0.07)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            stroke="oklch(var(--bc)/0.2)"
          />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="oklch(var(--bc)/0.2)"
            domain={[0, (maxTotal || 10) + 10]}
          />
          <Tooltip content={<CustomTooltip />} />
          {maxTotal > 0 && (
            <ReferenceLine
              y={maxTotal}
              stroke="oklch(var(--bc)/0.15)"
              strokeDasharray="4 4"
              label={{
                value: "máx",
                fontSize: 10,
                fill: "oklch(var(--bc)/0.3)",
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="total"
            stroke="oklch(var(--p))"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "oklch(var(--p))" }}
            activeDot={{ r: 6 }}
            name="Pontuação"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gráfico: comparação por campo selecionado
// ---------------------------------------------------------------------------

function FieldComparisonChart({
  fields,
  entries,
}: {
  fields: FieldDefinition[];
  entries: TestEntry[];
}) {
  const numericFields = fields.filter((f) => f.type === "number");
  const [activeKey, setActiveKey] = useState(numericFields[0]?.fieldKey ?? "");
  const activeField = numericFields.find((f) => f.fieldKey === activeKey);

  if (!activeField) return null;

  const data = entries.map((e, i) => ({
    name: `#${i + 1}`,
    value: getFieldValue(e.values, activeField.fieldKey) ?? 0,
  }));

  return (
    <div className="rounded-2xl border border-base-content/10 bg-base-100 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-base-content/60">
          Comparativo por parâmetro
        </h3>
        <div className="flex flex-wrap gap-1">
          {numericFields.map((f) => (
            <button
              key={f.fieldKey}
              type="button"
              onClick={() => setActiveKey(f.fieldKey)}
              className={`btn btn-xs rounded-lg ${
                activeKey === f.fieldKey
                  ? "btn-secondary"
                  : "btn-ghost text-base-content/50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
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
            dataKey="value"
            radius={[6, 6, 0, 0]}
            fill="oklch(var(--s))"
            name={activeField.label}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Histórico de lançamentos
// ---------------------------------------------------------------------------

function formatFieldValue(field: FieldDefinition, raw: unknown) {
  if (raw === null || raw === undefined || raw === "") return "—";

  if (field.type === "boolean") {
    return raw ? "Sim" : "Não";
  }

  if (field.type === "number" || field.type === "duration") {
    return field.unit ? `${raw} ${field.unit}` : String(raw);
  }

  return String(raw);
}

function getFllAnswerLabel(mission: FllMissionDefinition, value: number) {
  const options = mission.type?.slice(1) ?? [];

  if (options.length > 0 && options[value] != null) {
    return String(options[value]);
  }

  if (options.length === 0) {
    return value === 0 ? "Não" : "Sim";
  }

  return String(value);
}

function getFllSubAnswerLabel(
  subMission: FllSubMissionDefinition,
  value: number,
) {
  const options = subMission.type?.slice(1) ?? [];

  if (options.length > 0 && options[value] != null) {
    return String(options[value]);
  }

  if (options.length === 0) {
    return value === 0 ? "Não" : "Sim";
  }

  return String(value);
}

function EntryHistory({
  fields,
  entries,
  accent,
  mode,
  season,
}: {
  fields: FieldDefinition[];
  entries: TestEntry[];
  accent: "primary" | "secondary" | "accent" | "info";
  mode: ModeId;
  season?: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [missions, setMissions] = useState<FllMissionDefinition[]>([]);

  const style = ACCENT_STYLES[accent];

  const isFll = mode === "runs" && Boolean(season);

  const showScore = mode === "runs" || mode === "individual";

  const maxTotal = showScore ? maxPossibleTotal(fields) : 0;
  const hasNumericFields = fields.some((field) => field.type === "number");

  // -------------------------------------------------------------------------
  // Missões FLL
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!isFll || !season) {
      setMissions([]);
      return;
    }

    let active = true;

    fetch("/api/data/missions")
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;

        const seasonMissions = Array.isArray(data[season]) ? data[season] : [];

        setMissions(seasonMissions);
      })
      .catch(() => {
        if (active) {
          setMissions([]);
        }
      });

    return () => {
      active = false;
    };
  }, [isFll, season]);

  // -------------------------------------------------------------------------
  // Estado vazio
  // -------------------------------------------------------------------------

  if (entries.length === 0) {
    return (
      <div>
        <SectionHeader label="Histórico de lançamentos" />

        <div className="rounded-2xl border border-dashed border-base-content/15 bg-base-100 py-10 text-center text-sm text-base-content/45">
          Nenhum lançamento ainda. Use "Registrar resultado" para começar.
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader label="Histórico de lançamentos" />

      <div className="flex flex-col gap-2">
        {[...entries].reverse().map((entry, ri) => {
          const total = showScore && !isFll ? entryTotal(entry, fields) : null;

          const pct =
            showScore && !isFll && maxTotal > 0 && total !== null
              ? Math.round((total / maxTotal) * 100)
              : null;

          const hasFllAnswers =
            isFll &&
            entry.fllAnswers &&
            Object.keys(entry.fllAnswers).length > 0;

          const fllScore =
            hasFllAnswers && missions.length > 0
              ? scoreFllExecution(missions, entry.fllAnswers)
              : null;

          const isOpen = expanded === entry.id;
          const num = entries.length - ri;

          return (
            <div
              key={entry.id}
              className="overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 shadow-sm"
            >
              {/* -----------------------------------------------------------------
                  Cabeçalho
                  ----------------------------------------------------------------- */}

              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : entry.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-base-200/40"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${style.bgSoft} ${style.text}`}
                >
                  {num}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Lançamento #{num}</p>

                  <p className="mt-1 flex items-center gap-1.5 text-xs text-base-content/40">
                    <Calendar className="h-3 w-3" />
                    {fmtDate(entry.createdAt)}
                  </p>
                </div>

                {/* -----------------------------------------------------------------
                    Pontuação FLL
                    ----------------------------------------------------------------- */}

                {isFll && fllScore !== null && (
                  <div className="flex shrink-0 flex-col items-end">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-base-content/40">
                      Pontuação FLL
                    </span>

                    <span
                      className={`text-lg font-black leading-tight ${style.text}`}
                    >
                      {fllScore}
                      <span className="ml-1 text-xs font-bold">pts</span>
                    </span>
                  </div>
                )}

                {/* -----------------------------------------------------------------
                    Pontuação normal
                    ----------------------------------------------------------------- */}

                {!isFll && showScore && hasNumericFields && total !== null && (
                  <div className="flex shrink-0 flex-col items-end">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-base-content/40">
                      Resultado
                    </span>

                    <span className={`text-base font-bold ${style.text}`}>
                      {total} pts
                    </span>

                    {maxTotal > 0 && (
                      <span className="text-xs text-base-content/40">
                        {pct}% do máx.
                      </span>
                    )}
                  </div>
                )}

                {/* -----------------------------------------------------------------
                    Modos sem pontuação
                    ----------------------------------------------------------------- */}

                {!showScore && (
                  <span className="badge badge-ghost shrink-0 text-xs">
                    Resultado
                  </span>
                )}

                {isOpen ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-base-content/30" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-base-content/30" />
                )}
              </button>

              {/* =================================================================
                  CONTEÚDO EXPANDIDO — FLL
                  ================================================================= */}

              {isOpen && isFll ? (
                <div className="border-t border-base-content/8 bg-base-200/20 px-5 py-5">
                  {missions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-base-content/10 bg-base-100 p-6 text-center text-sm text-base-content/40">
                      Não foi possível carregar as missões desta temporada.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {missions
                        .filter((mission) => entry.fllAnswers?.[mission.id])
                        .map((mission) => {
                          const answer = entry.fllAnswers?.[mission.id];

                          if (!answer) return null;

                          const mainLabel = getFllAnswerLabel(
                            mission,
                            answer.value,
                          );

                          const missionScore = scoreFllMission(mission, answer);

                          const subMissions = mission["sub-mission"] ?? [];

                          return (
                            <div
                              key={mission.id}
                              className="overflow-hidden rounded-xl border border-base-content/10 bg-base-100"
                            >
                              {/* Missão */}
                              <div className="flex items-start gap-3 p-4">
                                <div
                                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.bgSoft} ${style.text}`}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p
                                        className={`text-xs font-bold uppercase tracking-wider ${style.text}`}
                                      >
                                        {mission.id}
                                      </p>

                                      <p className="mt-0.5 text-sm font-semibold">
                                        {mission.name}
                                      </p>
                                    </div>

                                    <span
                                      className={`shrink-0 rounded-lg px-2.5 py-1 text-sm font-bold ${style.bgSoft} ${style.text}`}
                                    >
                                      {missionScore} pts
                                    </span>
                                  </div>

                                  <div className="mt-3 flex items-center justify-between gap-3">
                                    <span className="text-xs text-base-content/45">
                                      Resultado
                                    </span>

                                    <span className="rounded-lg bg-base-200 px-2.5 py-1 text-sm font-semibold">
                                      {mainLabel}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Submissões */}
                              {subMissions.length > 0 && (
                                <div className="border-t border-base-content/8 bg-base-200/30 px-4 py-3">
                                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-base-content/40">
                                    Submissões
                                  </p>

                                  <div className="flex flex-col gap-2">
                                    {subMissions.map((subMission, index) => {
                                      const subKey = getSubMissionKey(
                                        mission,
                                        subMission,
                                        index,
                                      );

                                      const subValue =
                                        answer.subAnswers?.[subKey];

                                      if (
                                        subValue === undefined ||
                                        subValue === null
                                      ) {
                                        return null;
                                      }

                                      const subLabel = getFllSubAnswerLabel(
                                        subMission,
                                        subValue,
                                      );

                                      return (
                                        <div
                                          key={subKey}
                                          className="flex items-center justify-between gap-3 rounded-lg border border-base-content/8 bg-base-100 px-3 py-2.5"
                                        >
                                          <div className="min-w-0">
                                            <p className="text-xs font-medium">
                                              {subMission.submission ??
                                                subMission.name ??
                                                `Submissão ${index + 1}`}
                                            </p>
                                          </div>

                                          <span
                                            className={`shrink-0 text-xs font-bold ${style.text}`}
                                          >
                                            {subLabel}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {entry.notes && (
                    <div className="mt-4 rounded-xl border border-base-content/8 bg-base-100 p-4">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-base-content/40">
                        Observações
                      </p>

                      <p className="text-sm leading-relaxed text-base-content/65">
                        {entry.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* =================================================================
                   CONTEÚDO EXPANDIDO — LABTEST / INDIVIDUAL / CUSTOM
                   ================================================================= */

                isOpen && (
                  <div className="border-t border-base-content/8 bg-base-200/20 px-5 py-5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {fields.map((field) => {
                        const raw = getFieldValue(entry.values, field.fieldKey);

                        const completed =
                          field.type === "boolean"
                            ? raw === true
                            : raw !== null && raw !== undefined && raw !== "";

                        const formattedValue = formatFieldValue(field, raw);

                        return (
                          <div
                            key={field.fieldKey}
                            className={`relative overflow-hidden rounded-xl border p-4 ${
                              completed
                                ? "border-success/20 bg-success/[0.04]"
                                : "border-base-content/8 bg-base-100"
                            }`}
                          >
                            <span
                              className={`absolute inset-y-0 left-0 w-1 ${
                                completed ? "bg-success" : "bg-base-content/10"
                              }`}
                            />

                            <div className="flex items-start gap-3 pl-2">
                              <div
                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                  completed
                                    ? "bg-success/10 text-success"
                                    : "bg-base-200 text-base-content/30"
                                }`}
                              >
                                {field.type === "boolean" ? (
                                  raw === true ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : (
                                    <XCircle className="h-4 w-4" />
                                  )
                                ) : completed ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  <span className="h-2 w-2 rounded-full bg-current" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold">
                                      {field.label}
                                    </p>

                                    {field.description && (
                                      <p className="mt-1 text-xs leading-relaxed text-base-content/45">
                                        {field.description}
                                      </p>
                                    )}
                                  </div>

                                  <span
                                    className={`shrink-0 rounded-lg px-2.5 py-1 text-sm font-bold ${
                                      completed
                                        ? `${style.bgSoft} ${style.text}`
                                        : "bg-base-200 text-base-content/35"
                                    }`}
                                  >
                                    {formattedValue}
                                  </span>
                                </div>

                                <p
                                  className={`mt-2 text-[10px] font-semibold uppercase tracking-wider ${
                                    completed
                                      ? "text-success/70"
                                      : "text-base-content/30"
                                  }`}
                                >
                                  {completed ? "Preenchido" : "Não preenchido"}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {entry.notes && (
                      <div className="mt-4 rounded-xl border border-base-content/8 bg-base-100 p-4">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-base-content/40">
                          Observações
                        </p>

                        <p className="text-sm leading-relaxed text-base-content/65">
                          {entry.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LabTestView() {
  const params = useParams();
  const testId = String(params.id ?? "");
  const [test, setTest] = useState<any>(null);
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [entries, setEntries] = useState<TestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!testId) return;

    let active = true;
    setLoading(true);
    setError(null);

    getLabTestViewData(testId)
      .then((data) => {
        if (!active) return;
        setTest(data.test);
        setFields(data.fields);
        setEntries(data.entries);
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Erro ao carregar o teste.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [testId]);

  const modeDef = useMemo(
    () => (test ? getModeDefinition(test.mode) : null),
    [test],
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

  if (error || !test || !modeDef) {
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

  const Icon = modeDef.icon;
  const style = ACCENT_STYLES[modeDef.accent];
  const hasNumericFields = fields.some((f) => f.type === "number");
  const numericFieldCount = fields.filter((f) => f.type === "number").length;

  return (
    <div className="min-h-screen bg-base-200/40 px-4 py-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-8 p-4 sm:p-6 lg:gap-10 lg:p-8">
        <Link
          href="/dashboard/labtest"
          className="flex w-fit items-center gap-1.5 text-sm text-base-content/50 hover:text-base-content"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para a lista de testes
        </Link>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-base-content/10 bg-base-100 shadow-sm">
              <FlaskConical className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span
                  className={`badge badge-sm badge-outline gap-1.5 py-2.5 ${style.text} ${style.badgeBorder}`}
                >
                  <Icon className="h-3 w-3" />
                  {modeDef.label}
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
                Criado em {test.createdAt ? fmtDate(test.createdAt) : "—"}
              </p>
              {test.description && (
                <p className="mt-2 max-w-3xl text-sm text-base-content/60">
                  {test.description}
                </p>
              )}
            </div>
          </div>

          <Link
            href={`/dashboard/labtest/${test.id}/execute`}
            className={`btn btn-sm gap-2 rounded-lg ${style.text}`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            Registrar execução
          </Link>
        </div>

        {test.mode === "runs" && test.season ? (
          <FllRunsCharts
            season={test.season}
            entries={entries}
            accent={modeDef.accent}
          />
        ) : test.mode === "runs" ? (
          (hasNumericFields || numericFieldCount > 1) && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {hasNumericFields && (
                <TotalEvolutionChart fields={fields} entries={entries} />
              )}
              {numericFieldCount > 1 && (
                <FieldComparisonChart fields={fields} entries={entries} />
              )}
            </div>
          )
        ) : (
          <LabTestModeCharts
            mode={test.mode}
            config={test.config}
            fields={fields}
            entries={entries}
            accent={modeDef.accent}
          />
        )}

        <EntryHistory
          fields={fields}
          entries={entries}
          accent={modeDef.accent}
          mode={test.mode}
          season={test.season}
        />
      </div>
    </div>
  );
}
