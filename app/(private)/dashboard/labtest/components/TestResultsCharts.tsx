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
  const chartRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("results")
        .select("*")
        .eq("test_id", testId);
      if (error) console.error(error);
      else setResults(data || []);
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
      const subIndex = parseInt(key.split("-sub-")[1], 10);
      return mission["sub-mission"]?.[subIndex] || null;
    }
    return mission;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Loader />
      </div>
    );
  }
  if (results.length === 0)
    return <p>Nenhum resultado encontrado para este teste.</p>;

  // --- Agrupa todos os valores por missão ---
  const missionsGrouped: Record<
    string,
    { season: string; allValues: { value: number; created_at: string }[] }
  > = {};

  results.forEach((res) => {
    Object.keys(res.value).forEach((missionKey) => {
      if (!missionsGrouped[missionKey]) {
        missionsGrouped[missionKey] = { season: res.season, allValues: [] };
      }
      const values = Object.entries(res.value[missionKey]).map(([_, v]) => ({
        value: v as number,
        created_at: res.created_at,
      }));
      missionsGrouped[missionKey].allValues.push(...values);
    });
  });

  // --- Construindo dados gerais para o gráfico ---
  const generalData: MissionStats[] = [];
  let totalAcertos = 0;
  let totalTentativas = 0;

  let missionMenosFeitaKey = "";
  let missionMenosFeitaSub: number | null = null;
  let minLancamentos = Infinity;

  Object.entries(missionsGrouped).forEach(
    ([missionKey, { season, allValues }]) => {
      const missionData = getMissionByKey(missionKey, season);
      if (!missionData) return;

      let acertos = 0;
      let erros = 0;

      const type = missionData.type?.[0];

      // Se for tipo GRUPO, acumula os valores das sub-missões
      if (type === "grupo" && missionData["sub-mission"]?.length) {
        missionData["sub-mission"].forEach((sub: any, idx: number) => {
          const subKey = `${missionKey}-sub-${idx}`;
          const subValues = missionsGrouped[subKey]?.allValues || [];
          subValues.forEach(({ value }) => {
            if (sub.type?.[0] === "switch") {
              if (value === 1) acertos++;
              else erros++;
            } else if (sub.type?.[0] === "range") {
              if (value > 0) acertos++;
              else erros++;
            } else {
              if (value) acertos++;
              else erros++;
            }
          });
        });
      } else {
        // Missão individual ou outro tipo
        allValues.forEach(({ value }) => {
          if (type === "switch" || type === "missao_individual") {
            if (value === 1) acertos++;
            else if (value === 0) erros++;
          } else if (type === "range") {
            if (value > 0) acertos++;
            else erros++;
          } else {
            if (value) acertos++;
            else erros++;
          }
        });
      }

      const total = acertos + erros;

      generalData.push({
        missionKey,
        missionName: missionData.submission || missionData.name || missionKey,
        acertos,
        erros,
        total,
      });

      totalAcertos += acertos;
      totalTentativas += total;

      // --- MISSÃO MENOS REALIZADA (considerando sub-missões) ---
      if (total < minLancamentos) {
        missionMenosFeitaKey = missionKey;
        missionMenosFeitaSub = null;
        minLancamentos = total;
      }

      if (type === "grupo" && missionData["sub-mission"]?.length) {
        missionData["sub-mission"].forEach((sub: any, idx: number) => {
          const subKey = `${missionKey}-sub-${idx}`;
          const subTotal = missionsGrouped[subKey]?.allValues.length || 0;
          if (subTotal < minLancamentos) {
            missionMenosFeitaKey = missionKey;
            missionMenosFeitaSub = idx;
            minLancamentos = subTotal;
          }
        });
      }
    }
  );

  // --- Cálculo de aproveitamento geral ---
  const aproveitamentoGeral =
    totalTentativas > 0 ? (totalAcertos / totalTentativas) * 100 : 0;

  // --- Nome da missão/sub-missão menos realizada ---
  let missaoMenosFeitaNome = "";
  let missaoMenosFeitaTotal = 0;

  if (missionMenosFeitaSub != null) {
    const subData = getMissionByKey(
      `${missionMenosFeitaKey}-sub-${missionMenosFeitaSub}`,
      missionsGrouped[missionMenosFeitaKey]?.season
    );
    missaoMenosFeitaNome =
      subData?.name ||
      subData?.submission ||
      `Sub-missão ${missionMenosFeitaSub + 1}`;
    missaoMenosFeitaTotal =
      missionsGrouped[`${missionMenosFeitaKey}-sub-${missionMenosFeitaSub}`]
        ?.allValues.length || 0;
  } else {
    const missaoData = getMissionByKey(
      missionMenosFeitaKey,
      missionsGrouped[missionMenosFeitaKey]?.season
    );
    missaoMenosFeitaNome =
      missaoData?.name || missaoData?.submission || missionMenosFeitaKey;
    missaoMenosFeitaTotal =
      missionsGrouped[missionMenosFeitaKey]?.allValues.length || 0;
  }

  const showLabTestFeatures = pathname?.includes("/labtest/");

  return (
    <div ref={chartRef} className="flex flex-col gap-10 py-6">
      {/* --- Estatísticas gerais --- */}
      <div className="card bg-info/25 shadow p-4 text-center">
        {typeTest === "missao_individual" ? (
          <>
            <h2 className="text-xl font-bold mb-2 text-info-content">
              Estatísticas Gerais do Teste
            </h2>
            <p className="text-base-content mb-1">
              Total de lançamentos:{" "}
              <span className="font-bold text-info-content">
                {totalTentativas}
              </span>
            </p>
            <p className="text-base-content">
              Total de acertos:{" "}
              <span className="font-bold text-info-content">
                {totalAcertos}
              </span>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-2 text-info-content">
              Aproveitamento Geral
            </h2>
            <p className="text-base-content mb-1">
              Aproveitamento:{" "}
              <span className="font-bold text-info-content">
                {aproveitamentoGeral.toFixed(1)}%
              </span>
            </p>
            <p className="text-base-content">
              Missão menos realizada:{" "}
              <span className="font-bold text-info-content">
                {missaoMenosFeitaNome} ({missaoMenosFeitaTotal} lançamento
                {missaoMenosFeitaTotal === 1 ? "" : "s"}
                {missaoMenosFeitaTotal === 0 ? " - Ainda não realizada" : ""})
              </span>
            </p>
          </>
        )}
      </div>

      {/* --- Gráfico geral --- */}
      <div className="card bg-base-200 border border-base-300 shadow p-4">
        <h3 className="font-semibold mb-4 text-center">
          Desempenho Geral das Missões
        </h3>
        {(typeTest === "missao_individual" && (
          <PieChart width={400} height={300} className="mx-auto mb-4">
            <Pie
              data={[
                { name: "Acertos", value: totalAcertos },
                { name: "Erros", value: totalTentativas - totalAcertos },
              ]}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
              dataKey="value"
            >
              <Cell key="acertos" fill={COLORS[0]} />
              <Cell key="erros" fill={COLORS[1]} />
            </Pie>
            <Tooltip
              formatter={(value: any, name: any) => [`${value}`, name]}
            />
            <Legend />
          </PieChart>
        )) || (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={generalData}>
              <XAxis dataKey="missionName" />
              <YAxis
                allowDecimals={false}
                label={{
                  value: "Lançamentos",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={(value: any, name: any) => [
                  value,
                  name === "acertos" ? "Acertos" : "Erros",
                ]}
              />
              <Legend />
              <Bar dataKey="acertos" fill={COLORS[0]} />
              <Bar dataKey="erros" fill={COLORS[1]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* --- Listagem e gráficos individuais em /labtest/[id] --- */}
      {showLabTestFeatures && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(missionsGrouped).map(
              ([missionKey, { season, allValues }]) => {
                const missionData = getMissionByKey(missionKey, season);
                if (!missionData)
                  return (
                    <div
                      key={missionKey}
                      className="card bg-base-100 shadow p-4"
                    >
                      <p className="text-sm text-center text-gray-500">
                        Missão não encontrada para a chave: {missionKey} na
                        temporada: {season}
                      </p>
                    </div>
                  );

                const type = missionData.type?.[0];

                return (
                  <div
                    key={missionKey}
                    className="card bg-base-100 border border-base-300 shadow p-6 flex flex-col items-center"
                  >
                    <div className="text-lg font-medium mb-2 text-center">
                      {missionData.submission || missionData.name || "Sem nome"}{" "}
                      - {missionKey}
                    </div>
                    <div className="w-full h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        {type === "switch" ? (
                          <PieChart>
                            <Pie
                              data={[
                                {
                                  name: "Deu certo",
                                  value: allValues.filter((v) => v.value === 1)
                                    .length,
                                },
                                {
                                  name: "Não deu certo",
                                  value: allValues.filter((v) => v.value === 0)
                                    .length,
                                },
                              ]}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label
                              dataKey="value"
                            >
                              <Cell key="acertos" fill={COLORS[0]} />
                              <Cell key="erros" fill={COLORS[1]} />
                            </Pie>
                            <Tooltip
                              formatter={(value: any, name: any) => [
                                `${value}`,
                                name,
                              ]}
                            />
                            <Legend />
                          </PieChart>
                        ) : type === "range" ? (
                          <LineChart
                            data={allValues.map((v, idx) => ({
                              tentativa: `Lançamento ${idx + 1}`,
                              valor: v.value,
                              hora: v.created_at,
                            }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="tentativa" />
                            <YAxis
                              allowDecimals={false}
                              domain={["dataMin", "dataMax"]}
                              label={{
                                value: "Itens feitos",
                                angle: -90,
                                position: "insideLeft",
                              }}
                            />
                            <Tooltip
                              formatter={(value) => [value, "Valor"]}
                              labelFormatter={(label) => {
                                const idx =
                                  parseInt(label.split(" ")[1], 10) - 1;
                                const item = allValues[idx];
                                if (!item?.created_at) return "";
                                const date = new Date(item.created_at);
                                return `Feito em: ${date.toLocaleDateString(
                                  "pt-BR"
                                )} às ${date.toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}`;
                              }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="valor"
                              stroke="#e7000b"
                              strokeWidth={4}
                              name="Itens Feitos"
                            />
                          </LineChart>
                        ) : type === "grupo" ? (
                          <PieChart>
                            {(() => {
                              let acertos = 0;
                              let erros = 0;
                              missionData["sub-mission"]?.forEach(
                                (sub: any, idx: number) => {
                                  const subKey = `${missionKey}-sub-${idx}`;
                                  const subValues =
                                    missionsGrouped[subKey]?.allValues || [];
                                  subValues.forEach(({ value }) => {
                                    if (sub.type?.[0] === "switch") {
                                      if (value === 1) acertos++;
                                      else erros++;
                                    } else if (sub.type?.[0] === "range") {
                                      if (value > 0) acertos++;
                                      else erros++;
                                    } else {
                                      if (value) acertos++;
                                      else erros++;
                                    }
                                  });
                                }
                              );
                              return (
                                <Pie
                                  data={[
                                    { name: "Acertos", value: acertos },
                                    { name: "Erros", value: erros },
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  label
                                  dataKey="value"
                                >
                                  <Cell key="acertos" fill={COLORS[0]} />
                                  <Cell key="erros" fill={COLORS[1]} />
                                </Pie>
                              );
                            })()}
                            <Tooltip
                              formatter={(value: any, name: any) => [
                                `${value}`,
                                name,
                              ]}
                            />
                            <Legend />
                          </PieChart>
                        ) : (
                          <p>Tipo de missão desconhecido.</p>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* --- Descrições dos resultados --- */}
          <div className="card bg-base-100 shadow p-4">
            <h3 className="font-semibold mb-2 text-center">
              Comentário de cada lançamento
            </h3>
            <div className="overflow-y-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Comentário</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, idx) => (
                    <tr key={r.id}>
                      <th>{idx + 1}</th>
                      <td>{r.description || "Sem descrição disponível"}</td>
                      <td>
                        {new Date(r.created_at).toLocaleDateString("pt-BR")}{" "}
                        {new Date(r.created_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
