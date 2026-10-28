"use client";

// ---------------------------------------------------------------------------
// Visualização do teste em modo de leitura.
// A página usa a Server Action diretamente no cliente, sem depender do hook
// customizado de carregamento.
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileDown,
  FlaskConical,
  Layers,
  ListOrdered,
  Play,
  Plus,
  Settings2,
  Trash2,
  TrendingUp,
  Trophy,
  XCircle,
  Clock,
} from "lucide-react";

import { getModeDefinition, ACCENT_STYLES, type AccentColor } from "@/utils/labtest/modes";
import { computeFieldStats, entryTotal, maxPossibleTotal } from "@/utils/labtest/stats";
import { buildExecutionRows, toNumber, type ChartSeries } from "@/utils/labtest/chart-data";
import { getFieldValue } from "@/types/labtest.types";
import { EmptyState, SectionHeader, StatCard, fmtDate } from "@/components/labtest/shared";
import { LabTestModeCharts } from "@/components/labtest/LabTestModeCharts";
import { FllRunsCharts } from "@/components/labtest/FllRunsCharts";
import FutureEditionAnalysis from "@/components/labtest/future-edition/FutureEditionAnalysis";
import { formatClock, isFutureEditionConfig } from "@/utils/labtest/future-edition";
import { normalizeStatus } from "@/utils/labtest/catalog";
import { SeriesChartPanel } from "@/components/labtest/charts/SeriesChart";
import type { FieldDefinition, ModeId, TestEntry } from "@/types/labtest.types";
import { getLabTestViewData } from "../actions";
import { ResourceLabels } from "@/components/stagebook/labels/resource-labels";
import { getResourceTags } from "@/utils/stagebook/actions/tags";
import { getResourceMilestone } from "@/utils/stagebook/actions/milestones";
import type { MilestoneDTO, TagDTO } from "@/types/labels";
import {
  FllMissionDefinition,
  FllSubMissionDefinition,
  getSubMissionKey,
  scoreFllExecution,
  scoreFllMission,
} from "@/utils/labtest/fll";
import { deleteTest } from "../new/actions";

const STATUS_LABEL: Record<string, { label: string; badge: string }> = {
  planejamento: { label: "Planejamento", badge: "badge-ghost" },
  em_andamento: { label: "Em andamento", badge: "badge-warning" },
  concluido: { label: "Concluído", badge: "badge-success" },
  cancelado: { label: "Cancelado", badge: "badge-error" },
};

// ---------------------------------------------------------------------------
// Cards de resumo — funciona para qualquer modo
// ---------------------------------------------------------------------------

function OverviewStats({
  mode,
  fields,
  entries,
}: {
  mode: ModeId;
  fields: FieldDefinition[];
  entries: TestEntry[];
}) {
  const last = entries[entries.length - 1];
  const booleanFields = fields.filter((f) => f.type === "boolean");
  const maxTotal = maxPossibleTotal(fields);

  const fourth = (() => {
    if (mode === "runs" && fields.some((f) => f.type === "number")) {
      const totals = entries.map((e) => entryTotal(e, fields));
      return (
        <StatCard
          label="Melhor total"
          value={`${totals.length ? Math.max(...totals) : 0} pts`}
          sub={maxTotal ? `máximo ${maxTotal} pts` : undefined}
          icon={Trophy}
          accent="accent"
        />
      );
    }
    if (booleanFields.length > 0) {
      const rate = Math.round(
        booleanFields.reduce(
          (sum, f) => sum + (computeFieldStats(f, entries).completionRate ?? 0),
          0,
        ) / booleanFields.length,
      );
      return (
        <StatCard label="Taxa de conclusão" value={`${rate}%`} sub="campos sim/não" icon={Activity} accent="accent" />
      );
    }
    return (
      <StatCard
        label="Primeira execução"
        value={entries[0] ? fmtDate(entries[0].createdAt) : "—"}
        icon={Calendar}
        accent="accent"
      />
    );
  })();

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Execuções" value={entries.length} sub="registradas neste teste" icon={ListOrdered} accent="primary" />
      <StatCard label="Campos monitorados" value={fields.length} sub="parâmetros do teste" icon={Layers} accent="secondary" />
      <StatCard
        label="Última execução"
        value={last ? fmtDate(last.createdAt) : "—"}
        sub={last ? `Execução #${last.executionNumber}` : "Nenhuma ainda"}
        icon={Clock}
        accent="info"
      />
      {fourth}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gráfico: evolução do total (modo runs sem temporada)
// ---------------------------------------------------------------------------

function TotalEvolutionChart({
  fields,
  entries,
}: {
  fields: FieldDefinition[];
  entries: TestEntry[];
}) {
  const maxTotal = maxPossibleTotal(fields);
  const series = useMemo<ChartSeries[]>(
    () => [{ key: "total", label: "Pontuação", unit: "pts" }],
    [],
  );
  const rows = useMemo(
    () => buildExecutionRows(entries, series, (entry) => entryTotal(entry, fields)),
    [entries, series, fields],
  );

  return (
    <SeriesChartPanel
      icon={TrendingUp}
      title="Evolução da pontuação"
      subtitle="Total de pontos por execução"
      series={series}
      rows={rows}
      defaultType="area"
      types={["area", "line", "bar", "step", "scatter"]}
      referenceMax={maxTotal || undefined}
      height={260}
    />
  );
}

// ---------------------------------------------------------------------------
// Gráfico: comparação entre os campos numéricos
// ---------------------------------------------------------------------------

function FieldComparisonChart({
  fields,
  entries,
}: {
  fields: FieldDefinition[];
  entries: TestEntry[];
}) {
  const numericFields = useMemo(() => fields.filter((f) => f.type === "number"), [fields]);
  const series = useMemo<ChartSeries[]>(
    () => numericFields.map((f) => ({ key: f.fieldKey, label: f.label, unit: f.unit })),
    [numericFields],
  );
  const rows = useMemo(
    () =>
      buildExecutionRows(entries, series, (entry, item) =>
        toNumber(getFieldValue(entry.values, item.key)),
      ),
    [entries, series],
  );

  if (numericFields.length === 0) return null;

  return (
    <SeriesChartPanel
      icon={Layers}
      title="Comparativo por parâmetro"
      subtitle="Clique nas legendas para ocultar parâmetros"
      series={series}
      rows={rows}
      defaultType="bar"
      height={260}
    />
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
  futureEdition = false,
}: {
  fields: FieldDefinition[];
  entries: TestEntry[];
  accent: "primary" | "secondary" | "accent" | "info";
  mode: ModeId;
  season?: string;
  futureEdition?: boolean;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [missions, setMissions] = useState<FllMissionDefinition[]>([]);

  const style = ACCENT_STYLES[accent];

  const isFll = mode === "runs" && Boolean(season) && !futureEdition;

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
          const total =
            showScore && !isFll
              ? (entry.futureEdition?.scores.total ?? entryTotal(entry, fields))
              : null;

          const pct =
            showScore && !isFll && maxTotal > 0 && total !== null
              ? Math.round((total / maxTotal) * 100)
              : null;

          const hasFllAnswers =
            isFll &&
            entry.fllAnswers &&
            Object.keys(entry.fllAnswers).length > 0;

          // Round 2:30 já guarda o placar completo (com inspeção e tokens).
          const fllScore =
            typeof entry.roundTotal === "number"
              ? entry.roundTotal
              : hasFllAnswers && missions.length > 0
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

                    {entry.futureEdition && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="badge badge-outline gap-1.5 py-3">
                          Subtotal das missões <b>{entry.futureEdition.scores.missionsTotal}</b>
                        </span>
                        <span className="badge badge-outline badge-error gap-1.5 py-3">
                          Penalidades <b>{entry.futureEdition.scores.penaltyCount}</b>
                          {entry.futureEdition.scores.zeroed
                            ? " · zerou o total"
                            : ` · ${entry.futureEdition.scores.penaltyPoints} pts`}
                        </span>
                        <span className="badge badge-outline gap-1.5 py-3">
                          Tempo jogado <b>{formatClock(entry.futureEdition.elapsedSec)}</b>
                        </span>
                        <span className="badge badge-outline gap-1.5 py-3">
                          Registros <b>{entry.futureEdition.events.length}</b>
                        </span>
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
  const [labels, setLabels] = useState<{
    tags: TagDTO[];
    milestone: MilestoneDTO | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
        // Tags e milestone universais (falha aqui não bloqueia a página).
        Promise.all([
          getResourceTags("labtest", testId),
          getResourceMilestone("labtest", testId),
        ])
          .then(([tags, milestone]) => active && setLabels({ tags, milestone }))
          .catch(() => active && setLabels({ tags: [], milestone: null }));
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Erro ao carregar o teste.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [testId]);

  const modeDef = useMemo(() => (test ? getModeDefinition(test.mode) : null), [test]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200/40 px-4 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-center rounded-3xl border border-base-300 bg-base-100 p-10">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      </div>
    );
  }

  if (error || !test || !modeDef) {
    return (
      <div className="min-h-screen bg-base-200/40 px-4 py-8">
        <div role="alert" className="alert alert-error alert-soft mx-auto max-w-5xl">
          <div>
            <p className="font-semibold">Não foi possível carregar o teste.</p>
            <p className="mt-1 text-sm opacity-80">{error ?? "Teste não encontrado."}</p>
          </div>
        </div>
      </div>
    );
  }

  const Icon = modeDef.icon;
  const style = ACCENT_STYLES[modeDef.accent as AccentColor];
  const status = STATUS_LABEL[normalizeStatus(test.status) ?? ""] ?? { label: test.status, badge: "badge-ghost" };
  const isFE = isFutureEditionConfig(test.config);
  const hasNumericFields = fields.some((f) => f.type === "number");
  const numericFieldCount = fields.filter((f) => f.type === "number").length;
  const isFllRuns = test.mode === "runs" && Boolean(test.season) && !isFE;

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este teste?")) return;
    await deleteTest(test.id);
    router.push("/dashboard/labtest");
  };

  return (
    <div className="min-h-screen bg-base-200/40">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <Link
          href="/dashboard/labtest"
          className="group flex w-fit items-center gap-2 text-sm text-base-content/50 transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Voltar para os testes
        </Link>

        {/* Cabeçalho */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-tl-2xl rounded-br-2xl bg-primary text-primary-content shadow-sm">
              <FlaskConical className="size-7" />
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className={`badge badge-outline badge-sm gap-1.5 py-3 ${style.text} ${style.badgeBorder}`}>
                  <Icon className="size-3.5" />
                  {modeDef.label}
                </span>
                {test.season && <span className="badge badge-ghost badge-sm py-3">Temporada {test.season}</span>}
                <span className={`badge badge-sm badge-soft py-3 ${status.badge}`}>{status.label}</span>
              </div>

              <h1 className="break-words text-2xl font-black tracking-tight sm:text-3xl">{test.name}</h1>
              <p className="mt-1 text-sm text-base-content/50">
                Criado em {test.createdAt ? fmtDate(test.createdAt) : "—"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/dashboard/labtest/${test.id}/export`} className="btn btn-sm btn-outline gap-2 rounded-full">
              <FileDown className="size-4" />
              Exportar
            </Link>
            <Link href={`/dashboard/labtest/${test.id}/edit`} className="btn btn-sm btn-outline gap-2 rounded-full">
              <Settings2 className="size-4" />
              Editar
            </Link>
            <button
              type="button"
              className="btn btn-sm btn-ghost gap-2 rounded-full text-error hover:bg-error/10"
              onClick={handleDelete}
              aria-label="Excluir teste"
            >
              <Trash2 className="size-4" />
              <span className="hidden sm:inline">Excluir</span>
            </button>
          </div>
        </header>

        {/* Resumo (FLL já traz os próprios cards dentro dos gráficos) */}
        {!isFllRuns && !isFE && <OverviewStats mode={test.mode} fields={fields} entries={entries} />}

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* Coluna principal */}
          <div className="flex min-w-0 flex-col gap-8">
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Análise dos dados</h2>
                <p className="mt-1 text-sm text-base-content/50">
                  Escolha o tipo de gráfico e passe o mouse nos pontos para ver o valor real de cada execução.
                </p>
              </div>

              {isFE ? (
                <FutureEditionAnalysis entries={entries} />
              ) : isFllRuns ? (
                <FllRunsCharts season={test.season} entries={entries} accent={modeDef.accent} />
              ) : test.mode === "runs" ? (
                hasNumericFields ? (
                  <div className="flex flex-col gap-4">
                    <TotalEvolutionChart fields={fields} entries={entries} />
                    {numericFieldCount > 1 && <FieldComparisonChart fields={fields} entries={entries} />}
                  </div>
                ) : (
                  <EmptyState>
                    <FlaskConical className="mx-auto mb-3 size-8 text-base-content/30" />
                    Ainda não há dados numéricos para analisar. Registre execuções com campos numéricos.
                  </EmptyState>
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
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Histórico de execuções</h2>
                <p className="mt-1 text-sm text-base-content/50">
                  Consulte os registros e acompanhe os resultados de cada execução.
                </p>
              </div>

              <EntryHistory
                fields={fields}
                entries={entries}
                accent={modeDef.accent}
                mode={test.mode}
                season={test.season}
                futureEdition={isFE}
              />
            </section>
          </div>

          {/* Coluna lateral */}
          <aside className="flex flex-col gap-4 xl:sticky xl:top-20">
            <div className="rounded-tl-3xl rounded-tr-lg rounded-br-3xl rounded-bl-lg bg-primary p-6 text-primary-content shadow-md">
              {isFE ? <Play className="mb-4 size-8 opacity-80" /> : <ClipboardList className="mb-4 size-8 opacity-80" />}
              <h3 className="text-xl font-black leading-tight">
                {isFE ? "Jogar uma nova partida" : "Registrar nova execução"}
              </h3>
              <p className="mt-2 text-sm opacity-80">
                {isFE
                  ? "Cronômetro, pontuação ao vivo e análise em gráficos ao fim de cada partida."
                  : "Cada execução alimenta os gráficos e o histórico deste teste."}
              </p>
              <Link
                href={`/dashboard/labtest/${test.id}/execute`}
                className="btn mt-5 w-full rounded-full border-0 bg-base-100 text-base-content hover:bg-base-200"
              >
                {isFE ? <Play className="size-4" /> : <Plus className="size-4" />}
                {isFE ? "Nova partida" : "Nova execução"}
              </Link>
            </div>

            <div className="card border border-base-300/70 bg-base-100 shadow-sm">
              <div className="card-body gap-3 p-5">
                <h3 className="text-sm font-bold">Sobre o teste</h3>
                {test.description ? (
                  <p className="whitespace-pre-wrap text-sm leading-6 text-base-content/65">{test.description}</p>
                ) : (
                  <p className="text-sm italic text-base-content/40">Nenhuma descrição adicionada.</p>
                )}

                {labels && (
                  <div className="border-t border-base-200 pt-3">
                    <ResourceLabels
                      kind="labtest"
                      resourceId={test.id}
                      initialTags={labels.tags}
                      initialMilestone={labels.milestone}
                    />
                  </div>
                )}
              </div>
            </div>

            {entries.length > 0 && (
              <div className="card border border-base-300/70 bg-base-100 shadow-sm">
                <div className="card-body gap-2 p-5">
                  <h3 className="mb-1 text-sm font-bold">Últimas execuções</h3>
                  {[...entries].slice(-4).reverse().map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-xl bg-base-200/60 px-3 py-2 text-sm"
                    >
                      <span className="font-semibold">#{entry.executionNumber}</span>
                      <span className="text-xs text-base-content/50">{fmtDate(entry.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
