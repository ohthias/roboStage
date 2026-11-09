"use client";

import { useEffect, useMemo, useState } from "react";
import { loadSeasonMissions } from "@/utils/data/missions-client";
import { useChartTheme } from "./charts/chart-theme";
import Image from "next/image";
import Link from "next/link";
import { Award, BarChart3, Disc3, Grid3x3, Hash, ListChecks, Target, TrendingUp, Trophy } from "lucide-react";
import type { ChartTheme } from "./charts/chart-theme";
import { ChartPanel } from "./charts/chart-panel";
import { FllMissionGrid, FllMissionRanking, FllMissionTable } from "./fll/FllMissionViews";
import { fllEntryScore, fllMissionStats, missionsForTest } from "@/utils/labtest/fll-analysis";

import type { TestEntry } from "@/types/labtest.types";
import {
  getSubMissionKey,
  scoreFllMission,
  scoreFllSubMission,
  type FllMissionDefinition,
  type FllSubMissionDefinition,
} from "@/utils/labtest/fll";
import { ACCENT_STYLES, type AccentColor } from "@/utils/labtest/modes";
import {
  buildExecutionRows,
  formatNumber,
  type ChartSeries,
} from "@/utils/labtest/chart-data";
import { SectionHeader, StatCard } from "./shared";
import { SeriesChartPanel } from "./charts/SeriesChart";
import { CategoryChartPanel, type CategoryDatum } from "./charts/CategoryChart";

interface FllRunsAnalysisProps {
  entries: TestEntry[];
  accent: AccentColor;
  /** Missões do teste (null = carregando). */
  missions: FllMissionDefinition[] | null;
  loadFailed?: boolean;
  theme: ChartTheme;
  fileName: string;
  executeHref?: string;
}

type FllRunsChartsProps =
  | FllRunsAnalysisProps
  /** Uso antigo (relatório/embeds): carrega as missões da temporada sozinho. */
  | { season: string; entries: TestEntry[]; accent: AccentColor; missionIds?: unknown; fileName?: string };

type Definition = FllMissionDefinition | FllSubMissionDefinition;

/** Rótulo da opção marcada. As respostas guardam o ÍNDICE da opção. */
function optionLabel(definition: Definition, index: number): string {
  const options = definition.type?.slice(1) ?? [];
  const label = options[index];

  if (label !== null && label !== undefined) return String(label);
  if (options.every((option) => option === null || option === undefined)) {
    return index === 0 ? "Não" : "Sim";
  }
  return `Opção ${index + 1}`;
}

/**
 * Um gráfico para a missão (ou sub-missão): "switch" vira distribuição das
 * respostas (pizza/rosca/barras); "range" vira evolução da quantidade marcada
 * por execução. O tooltip mostra a resposta E os pontos que ela valeu.
 */
function DefinitionChart({
  name,
  definition,
  entries,
  answerOf,
  pointsOf,
}: {
  name: string;
  definition: Definition;
  entries: TestEntry[];
  answerOf: (entry: TestEntry) => number | undefined;
  pointsOf: (entry: TestEntry) => number;
}) {
  const kind = definition.type?.[0];

  const series = useMemo<ChartSeries[]>(
    () => [{ key: "value", label: "Marcado", unit: null }],
    [],
  );

  const rows = useMemo(
    () =>
      buildExecutionRows(
        entries,
        series,
        (entry) => answerOf(entry) ?? null,
        (entry) => {
          const answer = answerOf(entry);
          if (answer === undefined) return undefined;
          const max = definition.type?.[2];
          return [
            ...(typeof max === "number"
              ? [{ label: "Máximo", text: String(max) }]
              : []),
            { label: "Pontos", text: `${formatNumber(pointsOf(entry))} pts` },
          ];
        },
      ),
    [entries, series, answerOf, pointsOf, definition],
  );

  const distribution = useMemo<CategoryDatum[]>(() => {
    if (kind !== "switch") return [];
    const counts = new Map<string, number>();
    for (const entry of entries) {
      const answer = answerOf(entry);
      if (answer === undefined) continue;
      const label = optionLabel(definition, answer);
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return [...counts.entries()].map(([label, value]) => ({
      name: label,
      value,
    }));
  }, [kind, entries, answerOf, definition]);

  if (kind === "switch") {
    if (distribution.length === 0) {
      return (
        <div className="flex h-32 items-center justify-center text-sm text-base-content/40">
          Nenhuma resposta registrada.
        </div>
      );
    }
    return (
      <CategoryChartPanel
        compact
        title={name}
        measure={{ key: "value", label: "Respostas", unit: "exec." }}
        data={distribution}
        defaultType="donut"
        types={["donut", "pie", "bar", "hbar"]}
        height={200}
      />
    );
  }

  const hasAnswers = rows.some((row) => typeof row.value === "number");
  if (!hasAnswers) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-base-content/40">
        Nenhuma resposta registrada.
      </div>
    );
  }

  return (
    <SeriesChartPanel
      compact
      title={name}
      series={series}
      rows={rows}
      defaultType="line"
      types={["line", "area", "bar", "step", "scatter"]}
      height={200}
    />
  );
}

function MissionChart({
  mission,
  entries,
}: {
  mission: FllMissionDefinition;
  entries: TestEntry[];
}) {
  const subMissions = mission["sub-mission"] ?? [];

  return (
    <div className="flex flex-col gap-5">
      <DefinitionChart
        name={mission.name}
        definition={mission}
        entries={entries}
        answerOf={(entry) => entry.fllAnswers?.[mission.id]?.value}
        pointsOf={(entry) => scoreFllMission(mission, entry.fllAnswers?.[mission.id])}
      />

      {subMissions.length > 0 && (
        <div className="border-t border-base-200 pt-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-base-content/50">
            Submissões
          </p>

          <div className="flex flex-col gap-4">
            {subMissions.map((subMission, index) => {
              const key = getSubMissionKey(mission, subMission, index);
              const title = subMission.submission ?? subMission.name ?? `Submissão ${index + 1}`;

              return (
                <div key={key} className="rounded-2xl bg-base-200/50 p-3">
                  <p className="mb-3 text-sm font-medium">{title}</p>
                  <DefinitionChart
                    name={title}
                    definition={subMission}
                    entries={entries}
                    answerOf={(entry) => {
                      const answer = entry.fllAnswers?.[mission.id];
                      return answer ? (answer.subAnswers?.[key] ?? 0) : undefined;
                    }}
                    pointsOf={(entry) =>
                      scoreFllSubMission(mission, entry.fllAnswers?.[mission.id], index)
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function FllRunsCharts(props: FllRunsChartsProps) {
  return "season" in props ? <FllRunsChartsLoader {...props} /> : <FllRunsAnalysis {...props} />;
}

function FllRunsChartsLoader({
  season,
  entries,
  accent,
  missionIds,
  fileName = "teste-fll",
}: Extract<FllRunsChartsProps, { season: string }>) {
  const { ref, theme } = useChartTheme();
  const [loaded, setLoaded] = useState<{ season: string; list: FllMissionDefinition[] } | null>(null);
  useEffect(() => {
    let active = true;
    loadSeasonMissions<FllMissionDefinition>(season)
      .then((list) => active && setLoaded({ season, list }))
      .catch(() => active && setLoaded({ season, list: [] }));
    return () => {
      active = false;
    };
  }, [season]);
  const missions = useMemo(
    () => (loaded?.season === season ? missionsForTest(loaded.list, missionIds, entries) : null),
    [loaded, season, missionIds, entries],
  );
  return (
    <div ref={ref}>
      <FllRunsAnalysis
        entries={entries}
        accent={accent}
        missions={missions}
        loadFailed={loaded?.season === season && loaded.list.length === 0}
        theme={theme}
        fileName={fileName}
      />
    </div>
  );
}

function FllRunsAnalysis({
  entries,
  accent,
  missions: testMissions,
  loadFailed,
  theme,
  fileName,
  executeHref,
}: FllRunsAnalysisProps) {
  const style = ACCENT_STYLES[accent];
  const missions = useMemo(() => testMissions ?? [], [testMissions]);
  const [cardsFilter, setCardsFilter] = useState<"all" | "weak">("all");

  const scores = useMemo(
    // Round 2:30 já guarda o placar completo (com inspeção e tokens).
    () => entries.map((entry) => fllEntryScore(missions, entry) ?? 0),
    [entries, missions],
  );

  const scoreSeries = useMemo<ChartSeries[]>(
    () => [{ key: "score", label: "Pontuação", unit: "pts" }],
    [],
  );
  const scoreRows = useMemo(
    () =>
      buildExecutionRows(entries, scoreSeries, (entry) => {
        const index = entries.indexOf(entry);
        return scores[index] ?? null;
      }),
    [entries, scoreSeries, scores],
  );
  const stats = useMemo(() => fllMissionStats(missions, entries), [missions, entries]);

  if (testMissions === null) {
    return loadFailed ? (
      <div role="alert" className="alert alert-warning alert-soft text-sm">
        Não foi possível carregar as missões da temporada. Recarregue a página para tentar de novo.
      </div>
    ) : (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-base-300/70 bg-base-100">
        <span className="loading loading-spinner text-primary" />
      </div>
    );
  }
  if (missions.length === 0) {
    return (
      <div role="alert" className="alert alert-warning alert-soft text-sm">
        As missões desta temporada não foram encontradas. Confira a temporada do teste em Editar.
      </div>
    );
  }
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-base-300 bg-base-100 px-6 py-10 text-center text-sm text-base-content/55">
        Nenhuma execução com os filtros atuais. Registre um round para começar a análise das {missions.length} missões.
        {executeHref && <Link href={executeHref} className="btn btn-primary btn-sm rounded-full">Nova execução</Link>}
      </div>
    );
  }

  const best = scores.length ? Math.max(...scores) : 0;
  const worst = scores.length ? Math.min(...scores) : 0;
  const mean = scores.length
    ? scores.reduce((sum, value) => sum + value, 0) / scores.length
    : 0;
  const weakest = [...stats].filter((s) => s.attempts > 0).sort((a, b) => b.lost - a.lost)[0];
  const weakIds = new Set(
    stats.filter((s) => s.attempts > 0 && (s.efficiency ?? 0) < 0.8).map((s) => s.id),
  );
  const cardMissions = cardsFilter === "weak" ? missions.filter((m) => weakIds.has(m.id)) : missions;

  const discFrequency = new Map<number, number>();
  for (const entry of entries) {
    const remaining = entry.precisionDiscs?.remaining;
    if (typeof remaining === "number") {
      discFrequency.set(remaining, (discFrequency.get(remaining) ?? 0) + 1);
    }
  }
  const discMode = discFrequency.size
    ? [...discFrequency.entries()].reduce((a, b) => (b[1] > a[1] ? b : a))[0]
    : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Melhor execução" value={`${formatNumber(best)} pts`} icon={Award} accent="primary" />
        <StatCard label="Menor execução" value={`${formatNumber(worst)} pts`} icon={BarChart3} accent="secondary" />
        <StatCard label="Média" value={`${formatNumber(mean)} pts`} sub={`${entries.length} execuções`} icon={Hash} accent="accent" />
        {weakest ? (
          <StatCard
            label="Missão que mais perde pontos"
            value={weakest.id}
            sub={`${formatNumber(weakest.lost)} pts/execução · ${weakest.name}`}
            icon={Target}
            accent="info"
          />
        ) : (
          <StatCard label="Moda dos discos" value={discMode === null ? "—" : `${discMode} restantes`} icon={Disc3} accent="info" />
        )}
      </div>

      <SeriesChartPanel
        icon={TrendingUp}
        title="Pontuação por execução"
        subtitle="Evolução do total de pontos"
        series={scoreSeries}
        rows={scoreRows}
        defaultType="bar"
        types={["bar", "line", "area", "step", "scatter"]}
        height={260}
      />

      <ChartPanel icon={Trophy} title="Ranking das missões" subtitle="Média feita × máximo possível de cada missão">
        <FllMissionRanking missions={missions} entries={entries} theme={theme} />
      </ChartPanel>

      <ChartPanel icon={ListChecks} title="Desempenho por missão" subtitle="Tentativas, acertos, aproveitamento e pontos perdidos — clique para ver as submissões">
        <FllMissionTable missions={missions} entries={entries} fileName={fileName} />
      </ChartPanel>

      <ChartPanel icon={Grid3x3} title="Missões × execuções" subtitle="Pontos de cada missão em cada round">
        <FllMissionGrid missions={missions} entries={entries} theme={theme} fileName={fileName} />
      </ChartPanel>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <SectionHeader label="Respostas por missão" />
          <div className="join">
            <button type="button" className={`btn join-item btn-xs ${cardsFilter === "all" ? "btn-neutral" : "btn-ghost border-base-300 bg-base-100"}`} onClick={() => setCardsFilter("all")}>
              Todas ({missions.length})
            </button>
            <button type="button" className={`btn join-item btn-xs ${cardsFilter === "weak" ? "btn-neutral" : "btn-ghost border-base-300 bg-base-100"}`} onClick={() => setCardsFilter("weak")}>
              Abaixo de 80% ({weakIds.size})
            </button>
          </div>
        </div>

        {cardMissions.length === 0 && (
          <p className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-6 text-center text-sm text-base-content/55">
            Todas as missões estão com 80% ou mais de aproveitamento.
          </p>
        )}
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {cardMissions.map((mission) => (
            <div
              key={mission.id}
              className="card border border-base-300/70 bg-base-100 shadow-sm"
            >
              <div className="card-body gap-3 p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold">
                  <span className="badge badge-primary badge-soft font-mono">{mission.id}</span>
                  <span className="min-w-0 flex-1">{mission.name}</span>
                  {(() => {
                    const st = stats.find((x) => x.id === mission.id);
                    if (!st || !st.attempts) return <span className="badge badge-ghost badge-sm">sem tentativas</span>;
                    return (
                      <span className={`badge badge-sm badge-soft ${st.efficiency === null ? "badge-ghost" : st.efficiency >= 0.8 ? "badge-success" : st.efficiency >= 0.5 ? "badge-warning" : "badge-error"}`}>
                        {formatNumber(st.avg)}/{st.max} pts
                      </span>
                    );
                  })()}
                </h3>

                <p className="text-sm text-base-content/65">
                  {mission.mission ?? "Nenhuma descrição fornecida para esta missão."}
                </p>

                <MissionChart mission={mission} entries={entries} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {discMode !== null && (
      <div className="card border border-base-300/70 bg-base-100 shadow-sm">
        <div className="card-body gap-4 p-5">
          <SectionHeader label="Discos de Precisão por execução" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {entries.filter((entry) => entry.precisionDiscs).map((entry) => {
              const discs = entry.precisionDiscs;
              const total = discs?.total ?? 6;
              const remaining = discs?.remaining ?? 0;
              const used = discs?.used ?? total - remaining;

              return (
                <div
                  key={entry.executionNumber}
                  className="rounded-2xl border border-base-300/70 bg-base-200/40 p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`flex size-8 items-center justify-center rounded-xl ${style.bgSoft}`}>
                      <Disc3 className={`size-4 ${style.text}`} />
                    </span>
                    <span className="text-sm font-semibold">
                      Execução #{entry.executionNumber}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: total }, (_, index) => {
                      const isRemaining = index < remaining;
                      return (
                        <div
                          key={index}
                          className={`relative size-10 overflow-hidden rounded-lg bg-base-100 transition-opacity ${isRemaining ? "opacity-100" : "opacity-30"}`}
                        >
                          <Image
                            src={
                              isRemaining
                                ? "/images/labTest/fll_pt_active.png"
                                : "/images/labTest/fll_pt_disable.png"
                            }
                            alt=""
                            fill
                            sizes="40px"
                            className="object-contain"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-base-content/50">
                    <span>{remaining} restantes</span>
                    <span>{used} utilizadas</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
