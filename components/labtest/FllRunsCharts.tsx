"use client";

import { loadSeasonMissions } from "@/utils/data/missions-client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Award, BarChart3, Disc3, Hash, TrendingUp } from "lucide-react";

import type { TestEntry } from "@/types/labtest.types";
import {
  getSubMissionKey,
  scoreFllExecution,
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

interface FllRunsChartsProps {
  season: string;
  entries: TestEntry[];
  accent: AccentColor;
}

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

export function FllRunsCharts({ season, entries, accent }: FllRunsChartsProps) {
  const [missions, setMissions] = useState<FllMissionDefinition[]>([]);
  const style = ACCENT_STYLES[accent];

  const requiredMissionIds = useMemo(() => {
    const ids = new Set<string>();
    for (const entry of entries) {
      for (const missionId of Object.keys(entry.fllAnswers ?? {})) ids.add(missionId);
    }
    return [...ids];
  }, [entries]);

  useEffect(() => {
    let active = true;

    loadSeasonMissions<FllMissionDefinition>(season)
      .then((seasonMissions) => {
        if (!active) return;
        const required = new Set(requiredMissionIds);
        setMissions(seasonMissions.filter((mission) => required.has(mission.id)));
      })
      .catch(() => {
        if (active) setMissions([]);
      });

    return () => {
      active = false;
    };
  }, [season, requiredMissionIds]);

  const scores = useMemo(
    // Round 2:30 já guarda o placar completo (com inspeção e tokens).
    () =>
      entries.map(
        (entry) => entry.roundTotal ?? scoreFllExecution(missions, entry.fllAnswers),
      ),
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

  if (missions.length === 0) return null;

  const best = scores.length ? Math.max(...scores) : 0;
  const worst = scores.length ? Math.min(...scores) : 0;
  const mean = scores.length
    ? scores.reduce((sum, value) => sum + value, 0) / scores.length
    : 0;

  const discFrequency = new Map<number, number>();
  for (const entry of entries) {
    const remaining = entry.precisionDiscs?.remaining;
    if (typeof remaining === "number") {
      discFrequency.set(remaining, (discFrequency.get(remaining) ?? 0) + 1);
    }
  }
  const discMode = discFrequency.size
    ? [...discFrequency.entries()].reduce((a, b) => (b[1] > a[1] ? b : a))[0]
    : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Melhor execução" value={`${formatNumber(best)} pts`} icon={Award} accent="primary" />
        <StatCard label="Menor execução" value={`${formatNumber(worst)} pts`} icon={BarChart3} accent="secondary" />
        <StatCard label="Média" value={`${formatNumber(mean)} pts`} sub={`${entries.length} execuções`} icon={Hash} accent="accent" />
        <StatCard label="Moda dos discos" value={`${discMode} restantes`} icon={Disc3} accent="info" />
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

      <div>
        <SectionHeader label="Pontuação por missão" />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {missions.map((mission) => (
            <div
              key={mission.id}
              className="card border border-base-300/70 bg-base-100 shadow-sm"
            >
              <div className="card-body gap-3 p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold">
                  <span className="badge badge-primary badge-soft font-mono">{mission.id}</span>
                  {mission.name}
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

      <div className="card border border-base-300/70 bg-base-100 shadow-sm">
        <div className="card-body gap-4 p-5">
          <SectionHeader label="Discos de Precisão por execução" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => {
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
    </div>
  );
}
