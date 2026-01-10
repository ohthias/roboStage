"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import missionsData from "@/public/data/missions.json";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Cell,
  Pie,
} from "recharts";

import Loader from "@/components/Loader";

type ResultRow = {
  id: number;
  test_id: string;
  value: Record<string, any>;
  description: string | null;
  created_at: string;
  season: string;
  precision_tokens: number | null;
};

interface MissionStats {
  missionKey: string;
  missionName: string;
  acertos: number;
  erros: number;
  total: number;
}

const COLORS = ["#e7000b", "#162455"];

export default function TestResultsCharts({
  testId,
  typeTest,
}: {
  testId: string;
  typeTest: string;
}) {
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("results")
        .select("*")
        .eq("test_id", testId);

      if (!error) setResults(data || []);
      setLoading(false);
    };

    fetchResults();
  }, [testId]);

  const getMissionByKey = (key: string, season: string) => {
    const seasonMissions = (missionsData as any)[season] || [];
    const mainKey = key.split("-sub-")[0];
    const mission = seasonMissions.find((m: any) => m.id === mainKey);
    if (!mission) return null;

    if (key.includes("-sub-")) {
      const subIndex = Number(key.split("-sub-")[1]);
      return mission["sub-mission"]?.[subIndex] || null;
    }
    return mission;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader />
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="text-center py-10 opacity-70">
        Nenhum resultado encontrado para este teste.
      </div>
    );
  }

  /* ===================== AGRUPAMENTO ===================== */
  const missionsGrouped: Record<
    string,
    { season: string; allValues: { value: number; created_at: string }[] }
  > = {};

  results.forEach((res) => {
    Object.entries(res.value).forEach(([missionKey, values]) => {
      if (!missionsGrouped[missionKey]) {
        missionsGrouped[missionKey] = {
          season: res.season,
          allValues: [],
        };
      }

      Object.values(values as Record<string, number>).forEach((v) =>
        missionsGrouped[missionKey].allValues.push({
          value: v,
          created_at: res.created_at,
        })
      );
    });
  });

  /* ===================== ESTATÍSTICAS ===================== */
  const generalData: MissionStats[] = [];
  let totalAcertos = 0;
  let totalTentativas = 0;

  let missionMenosFeita = "";
  let missionMenosFeitaTotal = Infinity;

  Object.entries(missionsGrouped).forEach(
    ([missionKey, { season, allValues }]) => {
      const missionData = getMissionByKey(missionKey, season);
      if (!missionData) return;

      let acertos = 0;
      let erros = 0;
      const type = missionData.type?.[0];

      allValues.forEach(({ value }) => {
        if (type === "switch" || type === "missao_individual") {
          value === 1 ? acertos++ : erros++;
        } else if (type === "range") {
          value > 0 ? acertos++ : erros++;
        } else {
          value ? acertos++ : erros++;
        }
      });

      const total = acertos + erros;

      generalData.push({
        missionKey,
        missionName: missionData.submission || missionData.name,
        acertos,
        erros,
        total,
      });

      totalAcertos += acertos;
      totalTentativas += total;

      if (total < missionMenosFeitaTotal) {
        missionMenosFeita = missionData.name;
        missionMenosFeitaTotal = total;
      }
    }
  );

  const aproveitamento =
    totalTentativas > 0 ? (totalAcertos / totalTentativas) * 100 : 0;

  /* ===================== DISCOS DE PRECISÃO ===================== */
  const DISK_COLORS = [
    "#15803d", // Disco 1 (melhor)
    "#22c55e",
    "#86efac",
    "#fde047",
    "#fdba74",
    "#f87171", // Disco 6 (pior)
  ];

  const precisionValues = results
    .map((r) => r.precision_tokens)
    .filter((v): v is number => typeof v === "number");

  const precisionCount = precisionValues.length;

  const precisionAvg =
    precisionCount > 0
      ? precisionValues.reduce((a, b) => a + b, 0) / precisionCount
      : 0;

  const precisionMax = precisionCount > 0 ? Math.max(...precisionValues) : 0;
  const precisionMin = precisionCount > 0 ? Math.min(...precisionValues) : 0;

  const TOTAL_DISKS = 6;

  // Normaliza a média para o range 0–6
  const normalizedAvg = Math.min(Math.max(precisionAvg, 0), TOTAL_DISKS);

  // Para cada disco, calcula quanto ele deve ser preenchido
  const disksFill = Array.from({ length: TOTAL_DISKS }, (_, i) => {
    const diskIndex = i + 1;
    const fill =
      normalizedAvg >= diskIndex
        ? 1
        : normalizedAvg > diskIndex - 1
        ? normalizedAvg - (diskIndex - 1)
        : 0;

    return {
      index: i,
      fill,
      color: DISK_COLORS[i],
    };
  });

  const showExtended = pathname?.includes("/labtest/");

  return (
    <div ref={chartRef} className="space-y-12">
      {/* ===================== KPIs ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stat bg-base-100 rounded-xl shadow">
          <div className="stat-title">Tentativas</div>
          <div className="stat-value text-primary">{results.length}</div>
        </div>

        <div className="stat bg-base-100 rounded-xl shadow">
          <div className="stat-title">Aproveitamento</div>
          <div className={`stat-value ${aproveitamento > 75 ? 'text-success' : aproveitamento > 50 ? 'text-warning' : 'text-error'}`}>{aproveitamento.toFixed(1)}%</div>
        </div>

        <div className="stat bg-primary/20 rounded-xl shadow">
          <div className="stat-title text-primary/80">Missão crítica</div>
          <div className="font-semibold text-primary text-center text-sm">
            {missionMenosFeita || "—"}
            <br />
            {missionMenosFeitaTotal} tentativas
          </div>
        </div>
      </div>

      {/* ===================== GRÁFICO GERAL ===================== */}
      <div className="">
        <h3 className="text-xl font-semibold mb-4">
          Visão Geral de Desempenho
        </h3>

        <div className="w-full h-[360px]">
          {typeTest === "missao_individual" ? (
            <PieChart width={360} height={360} className="mx-auto">
              <Pie
                data={[
                  { name: "Acertos", value: totalAcertos },
                  { name: "Erros", value: totalTentativas - totalAcertos },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                <Cell fill={COLORS[0]} />
                <Cell fill={COLORS[1]} />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={generalData}>
                <XAxis dataKey="missionName" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="acertos" fill={COLORS[0]} />
                <Bar dataKey="erros" fill={COLORS[1]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ===================== MISSÕES ===================== */}
      {showExtended && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(missionsGrouped).map(
            ([missionKey, { season, allValues }]) => {
              const missionData = getMissionByKey(missionKey, season);
              if (!missionData) return null;

              return (
                <div
                  key={missionKey}
                  className="border border-base-300 p-6 rounded-2xl"
                >
                  <h4 className="text-lg font-semibold mb-1">
                    {missionData.name}
                  </h4>
                  <p className="text-sm opacity-70 mb-4">{missionKey}</p>

                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      {(() => {
                        const type = missionData.type?.[0];

                        /* ========= SWITCH ========= */
                        if (type === "switch") {
                          const acertos = allValues.filter(
                            (v) => v.value === 1
                          ).length;
                          const erros = allValues.filter(
                            (v) => v.value === 0
                          ).length;

                          return (
                            <PieChart>
                              <Pie
                                data={[
                                  { name: "Acertos", value: acertos },
                                  { name: "Erros", value: erros },
                                ]}
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                dataKey="value"
                                label
                              >
                                <Cell fill={COLORS[0]} />
                                <Cell fill={COLORS[1]} />
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          );
                        }

                        /* ========= RANGE ========= */
                        if (type === "range") {
                          return (
                            <LineChart
                              data={allValues.map((v, i) => ({
                                tentativa: i + 1,
                                valor: v.value,
                                data: v.created_at,
                              }))}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="tentativa" />
                              <YAxis allowDecimals={false}/>
                              <Tooltip
                                formatter={(value) => [value, "Valor"]}
                                labelFormatter={(label, payload) => {
                                  const idx = Number(label) - 1;
                                  const item = allValues[idx];
                                  return item?.created_at
                                    ? new Date(item.created_at).toLocaleString(
                                        "pt-BR"
                                      )
                                    : "";
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="valor"
                                stroke={COLORS[0]}
                                strokeWidth={3}
                              />
                            </LineChart>
                          );
                        }

                        /* ========= GRUPO ========= */
                        if (type === "grupo") {
                          let acertos = 0;
                          let erros = 0;

                          missionData["sub-mission"]?.forEach(
                            (sub: any, idx: number) => {
                              const subKey = `${missionKey}-sub-${idx}`;
                              const subValues =
                                missionsGrouped[subKey]?.allValues || [];

                              subValues.forEach(({ value }) => {
                                if (sub.type?.[0] === "switch") {
                                  value === 1 ? acertos++ : erros++;
                                } else if (sub.type?.[0] === "range") {
                                  value > 0 ? acertos++ : erros++;
                                } else {
                                  value ? acertos++ : erros++;
                                }
                              });
                            }
                          );

                          return (
                            <PieChart>
                              <Pie
                                data={[
                                  { name: "Acertos", value: acertos },
                                  { name: "Erros", value: erros },
                                ]}
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                dataKey="value"
                                label
                              >
                                <Cell fill={COLORS[0]} />
                                <Cell fill={COLORS[1]} />
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          );
                        }

                        /* ========= FALLBACK ========= */
                        return (
                          <div className="flex items-center justify-center h-full text-sm opacity-60">
                            Tipo de missão não suportado
                          </div>
                        );
                      })()}
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* ===================== Discos de Precisão ===================== */}
      {showExtended && (
        <>
          <div className="divider" />
          <div className="rounded-2xl space-y-6">
            {/* Título */}
            <div>
              <h3 className="text-xl font-semibold">
                Índice de Precisão por Discos
              </h3>
              <p className="text-sm opacity-70 max-w-md">
                Cada disco representa uma tentativa de correção do robô. Quanto
                menos discos preenchidos, melhor o desempenho geral.
              </p>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="stat bg-base-200 rounded-xl">
                <div className="stat-title">Precisão Média</div>
                <div className="stat-value text-primary">
                  {precisionAvg.toFixed(2)}
                </div>
                <div className="stat-desc">Resultado geral dos testes</div>
              </div>

              <div className="stat bg-base-200 rounded-xl">
                <div className="stat-title">Pior Caso</div>
                <div className="stat-value text-error">{precisionMax}</div>
                <div className="stat-desc">Mais discos utilizados</div>
              </div>

              <div className="stat bg-base-200 rounded-xl">
                <div className="stat-title">Melhor Caso</div>
                <div className="stat-value text-success">{precisionMin}</div>
                <div className="stat-desc">Menos correções</div>
              </div>
            </div>

            {/* Gráfico */}
            <div className="flex flex-col items-center">
              <div className="relative w-[320px] h-[320px]">
                <svg width="320" height="320" viewBox="0 0 320 320">
                  {disksFill.map((disk) => {
                    const outerRadius = 150 - disk.index * 18;
                    const circumference = 2 * Math.PI * outerRadius;

                    return (
                      <circle
                        key={disk.index}
                        cx="160"
                        cy="160"
                        r={outerRadius}
                        fill="none"
                        stroke={disk.color}
                        strokeWidth={14}
                        strokeDasharray={`${
                          circumference * disk.fill
                        } ${circumference}`}
                        strokeLinecap="round"
                        opacity={disk.fill > 0 ? 1 : 0.1}
                        transform="rotate(-90 160 160)"
                      />
                    );
                  })}
                </svg>

                {/* Indicador central */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-sm opacity-70">Status Geral</span>
                  <span className="text-3xl font-bold text-primary">
                    {precisionAvg.toFixed(1)}
                  </span>
                  <span className="text-xs opacity-60">
                    quanto menor, melhor
                  </span>
                </div>
              </div>

              {/* Legenda */}
              <div className="mt-6 text-sm opacity-70 space-y-1 text-center max-w-sm">
                <p>• Discos externos indicam maior erro acumulado</p>
                <p>• Menos discos ativos = maior precisão</p>
                <p>• Ideal: apenas discos internos parcialmente preenchidos</p>
              </div>
            </div>
          </div>
          <div className="divider" />
        </>
      )}

      {/* ===================== HISTÓRICO ===================== */}
      {showExtended && (
        <div className="rounded-2xl p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <h3 className="text-xl font-semibold">
                Histórico de Lançamentos
              </h3>
              <p className="text-sm opacity-70">
                Registro cronológico de cada tentativa realizada
              </p>
            </div>

            <span className="badge badge-outline">
              {results.length} lançamentos
            </span>
          </div>

          {/* Lista */}
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
            {results.map((r, i) => {
              const date = new Date(r.created_at);

              return (
                <div
                  key={r.id}
                  className="flex gap-4 items-start bg-base-200/60 rounded-xl p-4 hover:bg-base-200 transition"
                >
                  {/* Índice */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center font-semibold">
                    {i + 1}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1">
                    <p className="text-base">
                      {r.description || (
                        <span className="italic opacity-60">
                          Sem comentário registrado
                        </span>
                      )}
                    </p>

                    <p className="text-xs opacity-60 mt-1">
                      {date.toLocaleDateString("pt-BR")} •{" "}
                      {date.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
