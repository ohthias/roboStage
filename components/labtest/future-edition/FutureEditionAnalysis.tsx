"use client";

// ---------------------------------------------------------------------------
// Análise das partidas da FLL Future Edition: resumo, evolução entre partidas,
// composição da pontuação, ritmo ao longo do tempo e desempenho por missão.
// ---------------------------------------------------------------------------

import { useMemo, useState } from "react";
import { Award, BarChart3, Gauge, Layers, Target, TimerReset, TrendingUp } from "lucide-react";

import type { TestEntry } from "@/types/labtest.types";
import { useFutureEditionData } from "@/hooks/useFutureEditionData";
import {
  buildTimeline,
  formatClock,
  maxMissionScore,
} from "@/utils/labtest/future-edition";
import {
  average,
  buildExecutionRows,
  formatNumber,
  type ChartSeries,
  type SeriesDatum,
} from "@/utils/labtest/chart-data";
import { EmptyState, SectionHeader, StatCard } from "../shared";
import { SeriesChartPanel } from "../charts/SeriesChart";
import { CategoryChartPanel, type CategoryDatum } from "../charts/CategoryChart";

const MAX_COMPARED = 5;

export default function FutureEditionAnalysis({ entries }: { entries: TestEntry[] }) {
  const { data, error, loading } = useFutureEditionData();

  const matches = useMemo(
    () => entries.filter((entry) => entry.futureEdition),
    [entries],
  );

  const [selected, setSelected] = useState<number[] | null>(null);
  const chosen = useMemo(
    () =>
      selected ??
      matches.slice(-3).map((entry) => entry.executionNumber),
    [selected, matches],
  );
  const chosenMatches = matches.filter((entry) => chosen.includes(entry.executionNumber));

  const totals = matches.map((entry) => entry.futureEdition!.scores.total);

  const scoreSeries = useMemo<ChartSeries[]>(
    () => [{ key: "total", label: "Pontuação", unit: "pts" }],
    [],
  );

  const maxPossible = useMemo(() => {
    if (!data) return undefined;
    const parts = data.missions.map(maxMissionScore);
    return parts.every((part) => part !== null)
      ? (parts as number[]).reduce((sum, part) => sum + part, 0)
      : undefined;
  }, [data]);

  const scoreRows = useMemo(
    () =>
      buildExecutionRows(
        matches,
        scoreSeries,
        (entry) => entry.futureEdition!.scores.total,
        (entry) => {
          const fe = entry.futureEdition!;
          return [
            { label: "Missões", text: `${formatNumber(fe.scores.missionsTotal)} pts` },
            {
              label: "Penalidades",
              text: fe.scores.zeroed
                ? `${fe.scores.penaltyCount} — zerou o total`
                : `${fe.scores.penaltyCount} (${fe.scores.penaltyPoints} pts)`,
            },
            { label: "Tempo jogado", text: formatClock(fe.elapsedSec) },
          ];
        },
      ),
    [matches, scoreSeries],
  );

  const missionSeries = useMemo<ChartSeries[]>(
    () =>
      (data?.missions ?? []).map((mission) => ({
        key: mission.id,
        label: `${mission.code} · ${mission.title}`,
        unit: "pts",
      })),
    [data],
  );

  const compositionRows = useMemo(
    () =>
      buildExecutionRows(
        matches,
        missionSeries,
        (entry, series) => entry.futureEdition!.scores.byMission[series.key] ?? 0,
        (entry) => {
          const fe = entry.futureEdition!;
          return [
            {
              label: "Penalidades",
              text: fe.scores.zeroed ? "zerou o total" : `${fe.scores.penaltyPoints} pts`,
            },
            { label: "Total da partida", text: `${formatNumber(fe.scores.total)} pts` },
          ];
        },
      ),
    [matches, missionSeries],
  );

  const pacing = useMemo(() => {
    if (!data || chosenMatches.length === 0) return null;

    const series: ChartSeries[] = chosenMatches.map((entry) => ({
      key: `m${entry.executionNumber}`,
      label: `Partida #${entry.executionNumber}`,
      unit: "pts",
    }));

    const cumulative = new Map<number, Map<number, number>>();
    const gains = new Map<number, Map<number, number>>();
    let longest = 0;

    for (const entry of chosenMatches) {
      const fe = entry.futureEdition!;
      longest = Math.max(longest, fe.durationSec);

      const byTime = new Map<number, number>();
      buildTimeline(data, fe.events, fe.durationSec, 10).forEach((point) =>
        byTime.set(point.t, point.total),
      );
      cumulative.set(entry.executionNumber, byTime);

      const coarse = buildTimeline(data, fe.events, fe.durationSec, 30);
      const gainMap = new Map<number, number>();
      for (let i = 0; i < coarse.length - 1; i++) {
        gainMap.set(coarse[i].t, coarse[i + 1].total - coarse[i].total);
      }
      gains.set(entry.executionNumber, gainMap);
    }

    const cumulativeRows: SeriesDatum[] = [];
    for (let t = 0; t <= longest; t += 10) {
      const row: SeriesDatum = {
        __name: formatClock(t),
        __title: `Aos ${formatClock(t)}`,
        __x: t,
      };
      for (const entry of chosenMatches) {
        row[`m${entry.executionNumber}`] = cumulative.get(entry.executionNumber)?.get(t) ?? null;
      }
      cumulativeRows.push(row);
    }

    const gainRows: SeriesDatum[] = [];
    for (let t = 0; t < longest; t += 30) {
      const end = Math.min(t + 30, longest);
      const row: SeriesDatum = {
        __name: `${formatClock(t)}–${formatClock(end)}`,
        __title: `De ${formatClock(t)} a ${formatClock(end)}`,
        __x: t,
      };
      for (const entry of chosenMatches) {
        row[`m${entry.executionNumber}`] = gains.get(entry.executionNumber)?.get(t) ?? null;
      }
      gainRows.push(row);
    }

    return { series, cumulativeRows, gainRows };
  }, [data, chosenMatches]);

  const missionAverages = useMemo<CategoryDatum[]>(() => {
    if (!data) return [];
    return data.missions.map((mission) => {
      const values = matches.map((entry) => entry.futureEdition!.scores.byMission[mission.id] ?? 0);
      const mean = average(values) ?? 0;
      const max = maxMissionScore(mission);
      return {
        name: mission.code,
        value: Math.round(mean * 100) / 100,
        extras: [
          { label: "Missão", text: mission.title },
          ...(max !== null
            ? [
                { label: "Máximo", text: `${formatNumber(max)} pts` },
                { label: "Aproveitamento", text: `${formatNumber(max > 0 ? (mean / max) * 100 : 0)}%` },
              ]
            : []),
          { label: "Partidas", text: String(matches.length) },
        ],
      };
    });
  }, [data, matches]);

  if (matches.length === 0) {
    return (
      <EmptyState>
        <TimerReset className="mx-auto mb-3 size-8 text-base-content/30" />
        Nenhuma partida registrada ainda. Use <strong>Nova partida</strong> para jogar a primeira e ver a análise aqui.
      </EmptyState>
    );
  }

  const best = Math.max(...totals);
  const bestMatch = matches.find((entry) => entry.futureEdition!.scores.total === best)!;
  const mean = average(totals) ?? 0;
  const last = matches[matches.length - 1].futureEdition!.scores.total;
  const previous = matches.length > 1 ? matches[matches.length - 2].futureEdition!.scores.total : null;
  const delta = previous === null ? null : last - previous;
  const penaltyMean = average(matches.map((entry) => entry.futureEdition!.scores.penaltyCount)) ?? 0;
  const zeroedCount = matches.filter((entry) => entry.futureEdition!.scores.zeroed).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Melhor partida"
          value={`${formatNumber(best)} pts`}
          sub={`Partida #${bestMatch.executionNumber}`}
          icon={Award}
          accent="primary"
        />
        <StatCard
          label="Média"
          value={`${formatNumber(mean)} pts`}
          sub={`${matches.length} ${matches.length === 1 ? "partida" : "partidas"}`}
          icon={BarChart3}
          accent="secondary"
        />
        <StatCard
          label="Última partida"
          value={`${formatNumber(last)} pts`}
          sub={delta === null ? "primeira partida" : `${delta >= 0 ? "+" : ""}${formatNumber(delta)} vs. anterior`}
          icon={TrendingUp}
          accent="info"
        />
        <StatCard
          label="Penalidades"
          value={formatNumber(penaltyMean)}
          sub={zeroedCount > 0 ? `${zeroedCount} partida(s) zerada(s)` : "média por partida"}
          icon={Target}
          accent="accent"
        />
      </div>

      <SeriesChartPanel
        icon={TrendingUp}
        title="Pontuação por partida"
        subtitle="Evolução entre as partidas (passe o mouse para ver missões, penalidades e tempo)"
        series={scoreSeries}
        rows={scoreRows}
        defaultType="bar"
        types={["bar", "line", "area", "step", "scatter"]}
        referenceMax={maxPossible}
        height={260}
      />

      <SeriesChartPanel
        icon={Layers}
        title="Composição da pontuação"
        subtitle="Quanto cada missão rendeu em cada partida"
        series={missionSeries}
        rows={compositionRows}
        defaultType="stacked"
        types={["stacked", "bar", "line", "area", "radar"]}
        height={300}
      />

      <div>
        <SectionHeader label="Ritmo da partida" />
        <div className="card mb-4 border border-base-300/70 bg-base-100 shadow-sm">
          <div className="card-body gap-2 p-4">
            <p className="text-xs font-semibold text-base-content/60">
              Escolha até {MAX_COMPARED} partidas para comparar o ritmo
            </p>
            <div className="flex flex-wrap gap-1.5">
              {matches.map((entry) => {
                const on = chosen.includes(entry.executionNumber);
                return (
                  <button
                    key={entry.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setSelected(() => {
                        const base = chosen;
                        if (base.includes(entry.executionNumber)) {
                          return base.length > 1 ? base.filter((n) => n !== entry.executionNumber) : base;
                        }
                        return [...base, entry.executionNumber].slice(-MAX_COMPARED);
                      })
                    }
                    className={`btn btn-sm rounded-full ${on ? "btn-primary" : "btn-ghost border-base-300"}`}
                  >
                    #{entry.executionNumber} · {formatNumber(entry.futureEdition!.scores.total)} pts
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {pacing && (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <SeriesChartPanel
              icon={Gauge}
              title="Pontuação acumulada no tempo"
              subtitle="Quando os pontos foram conquistados"
              series={pacing.series}
              rows={pacing.cumulativeRows}
              defaultType="step"
              types={["step", "line", "area", "bar", "scatter"]}
              height={280}
            />
            <SeriesChartPanel
              icon={TimerReset}
              title="Pontos ganhos a cada 30 s"
              subtitle="Em que fase da partida o robô rende mais"
              series={pacing.series}
              rows={pacing.gainRows}
              defaultType="bar"
              types={["bar", "line", "area", "stacked", "radar"]}
              height={280}
            />
          </div>
        )}
      </div>

      {data && (
        <CategoryChartPanel
          icon={Target}
          title="Desempenho por missão"
          subtitle="Média de pontos de cada missão em todas as partidas"
          measure={{ key: "value", label: "Média", unit: "pts" }}
          data={missionAverages}
          defaultType="bar"
          types={["bar", "hbar", "radar", "donut", "pie", "line", "area"]}
        />
      )}

      {loading && !error && (
        <p className="text-xs text-base-content/40">Carregando dados da temporada…</p>
      )}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
