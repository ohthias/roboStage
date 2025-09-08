"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import missionsData from "@/public/data/missions.json";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  ResponsiveContainer,
} from "recharts";

type ResultRow = {
  id: number;
  test_id: string;
  value: Record<string, any>;
  created_at: string;
  season: string;
};

const COLORS = ["#e7000b", "#162455"];

export default function TestResultsCharts({ testId }: { testId: string }) {
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Carregando resultados...</p>;
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

  // --- Dados gerais ---
  const generalData: { mission: string; acertos: number; erros: number }[] = [];
  let totalAcertos = 0;
  let totalTentativas = 0;
  let missionMenosFeita = "";

  Object.entries(missionsGrouped).forEach(([missionKey, { allValues }]) => {
    const missionData = getMissionByKey(
      missionKey,
      missionsGrouped[missionKey].season
    );
    if (!missionData) return;

    let acertos = 0;
    let erros = 0;

    if (missionData.type?.[0] === "switch") {
      acertos = allValues.filter((v) => v.value === 1).length;
      erros = allValues.filter((v) => v.value === 0).length;
    } else if (missionData.type?.[0] === "range") {
      acertos = allValues.filter(
        (v) => v.value !== null && v.value !== undefined && v.value > 0
      ).length;
      erros = allValues.filter(
        (v) => v.value === null || v.value === undefined || v.value <= 0
      ).length;
    }

    generalData.push({ mission: missionKey, acertos, erros });
    totalAcertos += acertos;
    totalTentativas += acertos + erros;

    if (
      !missionMenosFeita ||
      allValues.length <
        (missionsGrouped[missionMenosFeita]?.allValues.length || Infinity)
    ) {
      missionMenosFeita = missionKey;
    }
  });

  const aproveitamentoGeral =
    totalTentativas > 0 ? (totalAcertos / totalTentativas) * 100 : 0;

  const missaoMenosFeitaData = getMissionByKey(
    missionMenosFeita,
    missionsGrouped[missionMenosFeita].season
  );
  const submissionMenosFeita =
    missaoMenosFeitaData?.submission || missionMenosFeita;

  return (
    <div className="space-y-8">
      {/* --- Card Geral --- */}
      <div className="card bg-info/25 shadow p-4 text-center">
        <h2 className="text-xl font-bold mb-2 text-info-content">
          Aproveitamento Geral da Saída
        </h2>
        <p className="mb-1">
          Aproveitamento:{" "}
          <span className="font-bold text-info-content">
            {aproveitamentoGeral.toFixed(1)}%
          </span>
        </p>
        <p>
          Missão menos realizada:{" "}
          <span className="font-bold text-info-content">
            {submissionMenosFeita}
          </span>
        </p>
      </div>

      {/* --- Gráfico geral --- */}
      <div className="card bg-base-200 border border-base-300 shadow p-4">
        <h3 className="font-semibold mb-4 text-center">
          Desempenho Geral das Missões
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={generalData}>
            <XAxis dataKey="mission" />
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
      </div>

      <div className="divider text-base-content/75">Resultados Individuais</div>

      {/* --- Gráficos individuais em masonry layout --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-min">
        {Object.entries(missionsGrouped).map(
          ([missionKey, { season, allValues }]) => {
            const missionData = getMissionByKey(missionKey, season);
            if (!missionData)
              return (
                <div key={missionKey} className="card bg-base-100 shadow p-4">
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
                className="card bg-base-100 border border-base-300 shadow p-4 flex flex-col items-center"
              >
                <div className="text-lg font-medium mb-2 text-center">
                  {missionData.submission || missionData.name || "Sem nome"} -{" "}
                  {missionKey}
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
                            value: "Valor",
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <Tooltip
                          formatter={(value) => [value, "Valor"]}
                          labelFormatter={(label) => {
                            const item = allValues[label.split(" ")[1] - 1];
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
                        />
                      </LineChart>
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
    </div>
  );
}
