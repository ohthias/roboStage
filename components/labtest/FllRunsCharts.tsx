"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TestEntry } from "@/types/labtest.types";
import {
  FllSubMissionDefinition,
  getSubMissionKey,
  scoreFllExecution,
  scoreFllMission,
  type FllMissionDefinition,
} from "@/utils/labtest/fll";
import { ACCENT_STYLES, type AccentColor } from "@/utils/labtest/modes";
import { CustomTooltip, SectionHeader, StatCard } from "./shared";

interface FllRunsChartsProps {
  season: string;
  entries: TestEntry[];
  accent: AccentColor;
}

interface MissionsResponse {
  [season: string]: FllMissionDefinition[];
}

function MissionChart({
  mission,
  entries,
  chartColor,
}: {
  mission: FllMissionDefinition;
  entries: TestEntry[];
  chartColor: string;
}) {
  type ChartValue = {
    name: string;
    value: number;
    rawValue?: number;
  };

  const getSwitchLabel = (
    chartMission: FllMissionDefinition | FllSubMissionDefinition,
    value: number,
  ) => {
    const options = chartMission.type?.slice(1) ?? [];

    // Quando a definição possui opções explícitas:
    // ["switch", "Não", "Parcialmente", "Completamente"]
    if (options.length > 0 && options[value] != null) {
      return String(options[value]);
    }

    // Switch binário sem opções explícitas.
    if (options.length === 0 || options.every((option) => option == null)) {
      return value === 0 ? "Não" : "Sim";
    }

    return String(value);
  };

  const data: ChartValue[] = entries.map((entry) => {
    const answer = entry.fllAnswers?.[mission.id];

    return {
      name: `#${entry.executionNumber}`,
      value: scoreFllMission(mission, answer),
      rawValue: answer?.value,
    };
  });

  const renderChart = (
    chartMission: FllMissionDefinition | FllSubMissionDefinition,
    values: ChartValue[],
  ) => {
    const chartType = chartMission.type?.[0];

    // ---------------------------------------------------------------
    // SWITCH → Pizza
    // ---------------------------------------------------------------

    if (chartType === "switch") {
      const distribution = new Map<string, number>();

      for (const item of values) {
        if (item.rawValue === undefined || item.rawValue === null) {
          continue;
        }

        const label = getSwitchLabel(chartMission, item.rawValue);

        distribution.set(label, (distribution.get(label) ?? 0) + 1);
      }

      const pieData = [...distribution.entries()].map(([name, value]) => ({
        name,
        value,
      }));

      if (pieData.length === 0) {
        return (
          <div className="flex h-[180px] items-center justify-center text-sm text-base-content/40">
            Nenhuma resposta registrada.
          </div>
        );
      }

      return (
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Tooltip content={<CustomTooltip />} />

            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={65}
              innerRadius={35}
              paddingAngle={2}
            >
              {pieData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    index === 0
                      ? chartColor
                      : index === 1
                        ? `#1e459f`
                        : index > 2
                          ? `#466421`
                          : `#de5017`
                  }
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
    }

    // ---------------------------------------------------------------
    // RANGE → Linha
    // ---------------------------------------------------------------

    if (chartType === "range") {
      return (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={values}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#12121276"
              vertical={false}
            />

            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#12121276" />

            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11 }}
              stroke="#12121276"
            />

            <Tooltip content={<CustomTooltip />} />

            <Line
              type="monotone"
              dataKey="rawValue"
              name={chartMission.name ?? "Valor"}
              stroke={chartColor}
              strokeWidth={2.5}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              unit={chartMission.points !== undefined ? " pts" : ""}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  const mainChart = renderChart(mission, data);

  const subMissions = mission["sub-mission"] ?? [];

  return (
    <div className="flex flex-col gap-5">
      {mainChart}

      {subMissions.length > 0 && (
        <div className="border-t border-base-content/10 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-base-content/50">
            Submissões
          </p>
          <p className="mb-4 text-sm text-base-content/70">
            Cada submissão é uma parte da missão principal que pode ter
            pontuação separada. Abaixo estão os gráficos de pontuação para cada
            submissão.
          </p>

          <div className="flex flex-col gap-4">
            {subMissions.map((subMission, index) => {
              const subMissionKey = getSubMissionKey(
                mission,
                subMission,
                index,
              );

              const subData: ChartValue[] = entries
                .map((entry): ChartValue | null => {
                  const missionAnswer = entry.fllAnswers?.[mission.id];

                  if (!missionAnswer) {
                    return null;
                  }

                  const subAnswer = missionAnswer.subAnswers?.[subMissionKey];

                  if (subAnswer === undefined || subAnswer === null) {
                    return null;
                  }

                  return {
                    name: `#${entry.executionNumber}`,
                    value: scoreFllMission(
                      {
                        id: subMissionKey,
                        name: subMission.submission ?? `Submissão ${index + 1}`,
                        points: subMission.points,
                        type: subMission.type,
                      },
                      {
                        value: subAnswer,
                        subAnswers: {},
                      },
                    ),
                    rawValue: subAnswer,
                  };
                })
                .filter((item): item is ChartValue => item !== null);

              return (
                <div
                  key={subMissionKey}
                  className="rounded-xl bg-base-200/40 p-3"
                >
                  <p className="mb-3 text-sm font-medium">
                    {subMission.submission ?? `Submissão ${index + 1}`}
                  </p>

                  {subData.length > 0 ? (
                    renderChart(subMission, subData)
                  ) : (
                    <div className="flex h-[180px] items-center justify-center">
                      <p className="text-sm text-base-content/40">
                        Nenhum dado registrado
                      </p>
                    </div>
                  )}
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

  const chartColor =
    accent === "primary"
      ? "#cf2a2a"
      : accent === "secondary"
        ? "#1e459f)"
        : accent === "accent"
          ? "#fabd32"
          : "#de5017";

  // Apenas os IDs de missão que realmente possuem respostas nos lançamentos.
  const requiredMissionIds = useMemo(() => {
    const ids = new Set<string>();

    for (const entry of entries) {
      if (!entry.fllAnswers) continue;

      for (const missionId of Object.keys(entry.fllAnswers)) {
        ids.add(missionId);
      }
    }

    return [...ids];
  }, [entries]);

  useEffect(() => {
    let active = true;

    fetch("/api/data/missions")
      .then((response) => response.json() as Promise<MissionsResponse>)
      .then((data) => {
        if (!active) return;

        const seasonMissions = Array.isArray(data[season]) ? data[season] : [];

        const requiredIds = new Set(requiredMissionIds);

        setMissions(
          seasonMissions.filter((mission) => requiredIds.has(mission.id)),
        );
      })
      .catch(() => {
        if (active) setMissions([]);
      });

    return () => {
      active = false;
    };
  }, [season, requiredMissionIds]);

  const scoredEntries = useMemo(
    () =>
      entries.map((entry) => ({
        ...entry,
        score: scoreFllExecution(missions, entry.fllAnswers),
      })),
    [entries, missions],
  );

  if (missions.length === 0) return null;

  const scoreData = scoredEntries.map((entry) => ({
    name: `#${entry.executionNumber}`,
    score: entry.score,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Melhor execução"
          value={`${Math.max(
            0,
            ...scoredEntries.map((entry) => entry.score),
          )} pts`}
          icon={Award}
          accent={accent}
        />

        <StatCard
          label="Menor execução"
          value={`${
            scoredEntries.length
              ? Math.min(...scoredEntries.map((entry) => entry.score))
              : 0
          } pts`}
          icon={BarChart3}
          accent={accent}
        />
      </div>

      <div className="rounded-2xl border border-base-content/10 bg-base-100 p-5">
        <SectionHeader label="Pontuação por execução" />

        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={scoreData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#12121276"
              vertical={false}
            />

            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#12121276" />

            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11 }}
              stroke="#12121276"
            />

            <Tooltip content={<CustomTooltip />} />

            <Bar
              dataKey="score"
              name="Pontuação"
              fill={chartColor}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <SectionHeader label="Pontuação por missão" />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {missions.map((mission) => {
            return (
              <div
                key={mission.id}
                className="rounded-2xl border border-base-content/10 bg-base-100 p-5"
              >
                <h3 className="mb-3 text-sm font-semibold">
                  <span className={`mr-2 ${style.text}`}>{mission.id}</span>

                  {mission.name}
                </h3>

                <p className="mb-4 text-sm text-base-content/70">
                  {mission.mission ??
                    "Nenhuma descrição fornecida para esta missão."}
                </p>

                <MissionChart
                  mission={mission}
                  entries={entries}
                  chartColor={chartColor}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
