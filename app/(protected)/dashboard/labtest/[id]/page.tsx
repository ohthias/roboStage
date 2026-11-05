"use client";

// ---------------------------------------------------------------------------
// Visualização do teste em modo de leitura.
// A página usa a Server Action diretamente no cliente, sem depender do hook
// customizado de carregamento.
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  History,
  LayoutDashboard,
  RotateCcw,
  Rows3,
  SlidersHorizontal,
  Table2,
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
import ObrRoundAnalysis from "@/components/labtest/obr/ObrRoundAnalysis";
import ObrEntryDetails from "@/components/labtest/obr/ObrEntryDetails";
import { getObrArena, isObrConfig } from "@/utils/labtest/obr";
import { missionsForTest } from "@/utils/labtest/fll-analysis";
import { formatClock, isFutureEditionConfig } from "@/utils/labtest/future-edition";
import { normalizeStatus } from "@/utils/labtest/catalog";
import { loadSeasonMissions } from "@/utils/data/missions-client";
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
import { PinToggle } from "@/components/stagebook/pin-toggle";

import { unwrapAction } from "@/utils/stagebook/action-result";
import { useChartTheme } from "@/components/labtest/charts/chart-theme";
import { ViewFilterBar } from "@/components/labtest/view/ViewFilterBar";
import { ViewDashboard } from "@/components/labtest/view/ViewDashboard";
import { ViewWidgetBody, type ViewContext } from "@/components/labtest/view/ViewWidgets";
import {
  DEFAULT_VIEW_STATE,
  VIEW_PRESETS,
  applyFilters,
  defaultWidgets,
  buildViewMetrics,
  normalizeViewState,
  type ViewState,
  type ViewTab,
} from "@/utils/labtest/view-dashboard";

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
  obr = false,
}: {
  fields: FieldDefinition[];
  entries: TestEntry[];
  accent: "primary" | "secondary" | "accent" | "info";
  mode: ModeId;
  season?: string;
  futureEdition?: boolean;
  /** Rodada da OBR Resgate: placar vem de `entry.obrRound`, não dos campos. */
  obr?: boolean;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [missions, setMissions] = useState<FllMissionDefinition[]>([]);

  const style = ACCENT_STYLES[accent];

  const isFll = mode === "runs" && Boolean(season) && !futureEdition && !obr;

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

    loadSeasonMissions<FllMissionDefinition>(season)
      .then((seasonMissions) => {
        if (active) setMissions(seasonMissions);
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
          Nenhum lançamento para mostrar. Registre uma execução ou ajuste os filtros.
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
              ? (entry.obrRound?.scores.total ??
                entry.futureEdition?.scores.total ??
                entryTotal(entry, fields))
              : null;

          const pct =
            showScore && !isFll && !obr && maxTotal > 0 && total !== null
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
          // Número real da execução (a lista pode estar filtrada).
          const num = entry.executionNumber ?? entries.length - ri;

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

                {obr && entry.obrRound && (
                  <div className="flex shrink-0 flex-col items-end">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-base-content/40">
                      Pontuação OBR
                    </span>

                    <span className={`text-lg font-black leading-tight ${style.text}`}>
                      {entry.obrRound.scores.total}
                      <span className="ml-1 text-xs font-bold">pts</span>
                    </span>

                    <span className="text-xs text-base-content/40">
                      ×{entry.obrRound.scores.multiplier.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} · {entry.obrRound.round.falhas} falha(s)
                    </span>
                  </div>
                )}

                {!isFll && !obr && showScore && hasNumericFields && total !== null && (
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
                    {entry.obrRound ? (
                      <ObrEntryDetails result={entry.obrRound} accentText={style.text} />
                    ) : (
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
                    )}

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

// ---------------------------------------------------------------------------
// Estado da visão (aba, filtros, painel) — salvo por teste neste navegador.
// ---------------------------------------------------------------------------

const VIEW_STORAGE_PREFIX = "robostage:labtest-view:";

function readViewState(testId: string): ViewState {
  if (typeof window === "undefined" || !testId) return DEFAULT_VIEW_STATE;
  try {
    const raw = window.localStorage.getItem(VIEW_STORAGE_PREFIX + testId);
    return raw ? normalizeViewState(JSON.parse(raw)) : DEFAULT_VIEW_STATE;
  } catch {
    return DEFAULT_VIEW_STATE;
  }
}

const TABS: { key: ViewTab; label: string; icon: typeof BarChart3 }[] = [
  { key: "analysis", label: "Análise", icon: BarChart3 },
  { key: "dashboard", label: "Meu painel", icon: LayoutDashboard },
  { key: "history", label: "Execuções", icon: History },
];

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
  const presetsButtonRef = useRef<HTMLButtonElement>(null);

  // Enquanto carrega, a página mostra só o spinner (igual no servidor e no
  // navegador), então dá para ler o localStorage já na inicialização.
  const [view, setView] = useState<ViewState>(() => readViewState(testId));

  useEffect(() => {
    if (!testId) return;
    try {
      window.localStorage.setItem(VIEW_STORAGE_PREFIX + testId, JSON.stringify(view));
    } catch {
      /* navegador sem armazenamento: a visão só não fica salva */
    }
  }, [testId, view]);

  const patchView = (patch: Partial<ViewState>) => setView((v) => ({ ...v, ...patch }));

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

  // FLL "runs": missões da temporada para a análise por missão (painel e tabelas).
  const fllSeason: string | null =
    test && test.mode === "runs" && test.season && !isFutureEditionConfig(test.config) && !isObrConfig(test.config)
      ? String(test.season)
      : null;
  const [seasonMissions, setSeasonMissions] = useState<{ season: string; list: FllMissionDefinition[] } | null>(null);
  useEffect(() => {
    if (!fllSeason) return;
    let active = true;
    loadSeasonMissions<FllMissionDefinition>(fllSeason)
      .then((list) => active && setSeasonMissions({ season: fllSeason, list }))
      .catch(() => active && setSeasonMissions({ season: fllSeason, list: [] }));
    return () => {
      active = false;
    };
  }, [fllSeason]);
  const fll = useMemo(() => {
    if (!fllSeason || seasonMissions?.season !== fllSeason) return null;
    return { missions: missionsForTest(seasonMissions.list, test?.config?.missions, entries) };
  }, [fllSeason, seasonMissions, test, entries]);
  const { chartTheme, chartRef } = useThemeForView();

  // Métricas derivadas + execuções filtradas (valem para todas as abas).
  const derived = useMemo(
    () => (test ? buildViewMetrics(test.mode, fields, entries, fll) : { metrics: [], rows: [] }),
    [test, fields, entries, fll],
  );
  const filteredEntries = useMemo(() => applyFilters(entries, view.filters), [entries, view.filters]);
  const filteredRows = useMemo(() => {
    const ids = new Set(filteredEntries.map((e) => e.id));
    return derived.rows
      .filter((r) => ids.has(r.entry.id))
      .sort((a, b) => a.entry.executionNumber - b.entry.executionNumber);
  }, [derived.rows, filteredEntries]);
  const visibleMetrics = useMemo(() => {
    const hidden = new Set(view.filters.hiddenMetrics ?? []);
    const list = derived.metrics.filter((m) => !hidden.has(m.key));
    return list.length ? list : derived.metrics;
  }, [derived.metrics, view.filters.hiddenMetrics]);
  const widgets = useMemo(
    () => view.widgets ?? defaultWidgets(derived.metrics, Boolean(fllSeason)),
    [view.widgets, derived.metrics, fllSeason],
  );

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
  const isObr = test.mode === "runs" && isObrConfig(test.config);
  const isFllRuns = test.mode === "runs" && Boolean(test.season) && !isFE && !isObr;
  const fileName = `teste-${String(test.name).replace(/\W+/g, "_").slice(0, 40)}`;
  const ctx: ViewContext = { rows: filteredRows, metrics: visibleMetrics, theme: chartTheme, fileName, fll };
  const withAside = view.showAside && view.tab !== "dashboard";

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este teste?")) return;
    unwrapAction(await deleteTest(test.id));
    router.push("/dashboard/labtest");
  };

  const applyPreset = (key: string) => {
    const preset = VIEW_PRESETS.find((p) => p.key === key);
    if (!preset) return;
    if (view.widgets?.length && !confirm(`Trocar o painel atual pelo modo "${preset.label}"?`)) return;
    setView((v) => ({
      ...v,
      tab: "dashboard",
      widgets: preset.build(derived.metrics),
      filters: { ...v.filters, ...(preset.filters ?? {}) },
    }));
  };

  const newExecutionLabel = isFE ? "Nova partida" : isObr ? "Nova rodada" : "Nova execução";

  return (
    <div ref={chartRef} className="min-h-screen bg-base-200/40">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <Link
          href="/dashboard/labtest"
          className="group flex w-fit items-center gap-2 text-sm text-base-content/50 transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Voltar para os testes
        </Link>

        {/* Cabeçalho */}
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
                Criado em {test.createdAt ? fmtDate(test.createdAt) : "—"} · {entries.length}{" "}
                {entries.length === 1 ? "execução" : "execuções"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/dashboard/labtest/${test.id}/execute`} className="btn btn-sm btn-primary gap-2 rounded-full">
              {isFE || isObr ? <Play className="size-4" /> : <Plus className="size-4" />}
              {newExecutionLabel}
            </Link>
            <Link href={`/dashboard/labtest/${test.id}/export`} className="btn btn-sm btn-outline gap-2 rounded-full">
              <FileDown className="size-4" />
              Exportar
            </Link>
            <PinToggle kind="labtest" resourceId={test.id} />
            <Link href={`/dashboard/labtest/${test.id}/edit`} className="btn btn-sm btn-outline gap-2 rounded-full">
              <Settings2 className="size-4" />
              Editar
            </Link>
            <button
              type="button"
              className="btn btn-sm btn-ghost btn-square rounded-full text-error hover:bg-error/10"
              onClick={handleDelete}
              aria-label="Excluir teste"
              title="Excluir teste"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </header>

        {/* Abas + exibição */}
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" className="tabs tabs-box bg-base-100 shadow-sm">
            {TABS.map(({ key, label, icon: TabIcon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={view.tab === key}
                onClick={() => patchView({ tab: key })}
                className={`tab gap-1.5 ${view.tab === key ? "tab-active" : ""}`}
              >
                <TabIcon className="size-4" />
                {label}
                {key === "history" && (
                  <span className="badge badge-xs badge-ghost">{filteredEntries.length}</span>
                )}
              </button>
            ))}
          </div>

          <div className="dropdown dropdown-end">
            <button type="button" tabIndex={0} className="btn btn-sm btn-ghost rounded-full border-base-300 bg-base-100">
              <SlidersHorizontal className="size-4" /> Exibir
            </button>
            <div tabIndex={0} className="dropdown-content z-30 mt-1 w-60 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg">
              <div className="flex flex-col gap-1">
              {(
                [
                  ["showSummary", "Cards de resumo"],
                  ["showAside", "Coluna lateral (registrar, sobre o teste)"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-base-200">
                  <input
                    type="checkbox"
                    className="toggle toggle-xs toggle-primary"
                    checked={view[key]}
                    onChange={(e) => patchView({ [key]: e.target.checked })}
                  />
                  {label}
                </label>
              ))}
              <button
                type="button"
                className="btn btn-ghost btn-xs mt-1 justify-start text-base-content/60"
                onClick={() => setView({ ...DEFAULT_VIEW_STATE })}
              >
                <RotateCcw className="size-3.5" /> Restaurar visão padrão
              </button>
              </div>
            </div>
          </div>
        </nav>

        <ViewFilterBar
          filters={view.filters}
          onChange={(filters) => patchView({ filters })}
          metrics={derived.metrics}
          total={entries.length}
          shown={filteredEntries.length}
          onPreset={applyPreset}
          presetsOpenRef={presetsButtonRef}
          isFll={isFllRuns}
        />

        {/* Resumo (FLL/OBR/FE já trazem os próprios cards na análise) */}
        {view.showSummary && !isFllRuns && !isFE && !isObr && (
          <OverviewStats mode={test.mode} fields={fields} entries={filteredEntries} />
        )}

        <div className={`grid grid-cols-1 items-start gap-6 ${withAside ? "xl:grid-cols-[minmax(0,1fr)_320px]" : ""}`}>
          <main className="flex min-w-0 flex-col gap-6">
            {view.tab === "analysis" && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Análise dos dados</h2>
                  <p className="mt-1 text-sm text-base-content/50">
                    Gráficos padrão deste modo, com os filtros aplicados. Quer montar do seu jeito? Use{" "}
                    <button type="button" className="link link-primary" onClick={() => patchView({ tab: "dashboard" })}>
                      Meu painel
                    </button>
                    .
                  </p>
                </div>

                {isFE ? (
                  <FutureEditionAnalysis entries={filteredEntries} />
                ) : isObr ? (
                  <ObrRoundAnalysis entries={filteredEntries} arena={getObrArena(test.config)} />
                ) : isFllRuns ? (
                  <FllRunsCharts
                    entries={filteredEntries}
                    accent={modeDef.accent}
                    missions={fll?.missions ?? null}
                    loadFailed={Boolean(seasonMissions && seasonMissions.list.length === 0)}
                    theme={chartTheme}
                    fileName={fileName}
                    executeHref={`/dashboard/labtest/${test.id}/execute`}
                  />
                ) : test.mode === "runs" ? (
                  hasNumericFields ? (
                    <div className="flex flex-col gap-4">
                      <TotalEvolutionChart fields={fields} entries={filteredEntries} />
                      {numericFieldCount > 1 && <FieldComparisonChart fields={fields} entries={filteredEntries} />}
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
                    entries={filteredEntries}
                    accent={modeDef.accent}
                  />
                )}
              </section>
            )}

            {view.tab === "dashboard" && (
              <ViewDashboard
                widgets={widgets}
                onChange={(next) => patchView({ widgets: next })}
                ctx={ctx}
                onOpenPresets={() => presetsButtonRef.current?.focus()}
              />
            )}

            {view.tab === "history" && (
              <section className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">Histórico de execuções</h2>
                    <p className="mt-1 text-sm text-base-content/50">
                      Abra um cartão para ver o detalhe ou troque para a tabela para comparar tudo de uma vez.
                    </p>
                  </div>
                  <div className="join">
                    <button
                      type="button"
                      className={`btn join-item btn-sm ${view.historyLayout === "cards" ? "btn-neutral" : "btn-ghost border-base-300 bg-base-100"}`}
                      onClick={() => patchView({ historyLayout: "cards" })}
                    >
                      <Rows3 className="size-4" /> Cartões
                    </button>
                    <button
                      type="button"
                      className={`btn join-item btn-sm ${view.historyLayout === "table" ? "btn-neutral" : "btn-ghost border-base-300 bg-base-100"}`}
                      onClick={() => patchView({ historyLayout: "table" })}
                    >
                      <Table2 className="size-4" /> Tabela
                    </button>
                  </div>
                </div>

                {view.historyLayout === "table" ? (
                  <div className="rounded-2xl border border-base-300/70 bg-base-100 p-4 shadow-sm sm:p-5">
                    <ViewWidgetBody
                      widget={{ id: "history", type: "table-entries", title: "Execuções", metrics: visibleMetrics.map((m) => m.key), size: "full", options: {} }}
                      ctx={ctx}
                      height={420}
                    />
                  </div>
                ) : (
                  <EntryHistory
                    fields={fields}
                    entries={filteredEntries}
                    accent={modeDef.accent}
                    mode={test.mode}
                    season={test.season}
                    futureEdition={isFE}
                    obr={isObr}
                  />
                )}
              </section>
            )}
          </main>

          {withAside && (
            <aside className="flex flex-col gap-4 xl:sticky xl:top-20">
              <div className="rounded-tl-3xl rounded-tr-lg rounded-br-3xl rounded-bl-lg bg-primary p-6 text-primary-content shadow-md">
                {isFE || isObr ? <Play className="mb-4 size-8 opacity-80" /> : <ClipboardList className="mb-4 size-8 opacity-80" />}
                <h3 className="text-xl font-black leading-tight">
                  {isFE ? "Jogar uma nova partida" : isObr ? "Jogar uma nova rodada" : "Registrar nova execução"}
                </h3>
                <p className="mt-2 text-sm opacity-80">
                  {isFE
                    ? "Cronômetro, pontuação ao vivo e análise em gráficos ao fim de cada partida."
                    : isObr
                      ? "Cronômetro, perigos, falhas e sala de resgate: cada rodada alimenta a análise."
                      : "Cada execução alimenta os gráficos e o histórico deste teste."}
                </p>
                <Link
                  href={`/dashboard/labtest/${test.id}/execute`}
                  className="btn mt-5 w-full rounded-full border-0 bg-base-100 text-base-content hover:bg-base-200"
                >
                  {isFE || isObr ? <Play className="size-4" /> : <Plus className="size-4" />}
                  {newExecutionLabel}
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
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() =>
                          setView((v) => ({
                            ...v,
                            tab: "history",
                            filters: { ...v.filters, range: "all", search: `#${entry.executionNumber}` },
                          }))
                        }
                        className="flex items-center justify-between rounded-xl bg-base-200/60 px-3 py-2 text-left text-sm transition hover:bg-base-200"
                        title="Ver no histórico"
                      >
                        <span className="font-semibold">#{entry.executionNumber}</span>
                        <span className="text-xs text-base-content/50">{fmtDate(entry.createdAt)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

/** Tema dos gráficos lido do daisyUI ativo, para os blocos do painel. */
function useThemeForView() {
  const { ref, theme } = useChartTheme();
  return { chartRef: ref, chartTheme: theme };
}
