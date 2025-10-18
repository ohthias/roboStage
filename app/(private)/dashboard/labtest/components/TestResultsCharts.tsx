"use client";

import { useEffect, useState, useRef, RefObject } from "react";
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
} from "recharts";

import ExportResultsPDF from "./ExportButton";
import Loader from "@/components/loader";

type ResultRow = {
  id: number;
  test_id: string;
  value: Record<string, any>;
  description: string | null;
  created_at: string;
  season: string;
};

const COLORS = ["#e7000b", "#162455"];

export default function TestResultsCharts({ testId }: { testId: string }) {
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
    )
  };
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

  const showLabTestFeatures = pathname?.includes("/labtest/");

  return (
    <div ref={chartRef} className="space-y-8">
      {/* --- Estatísticas gerais --- */}
      <div className="card bg-info/25 shadow p-4 text-center">
        <h2 className="text-xl font-bold mb-2 text-info-content">
          Aproveitamento Geral
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

      {/* --- Listagem e botão export somente em /labtest/[id] --- */}
      {showLabTestFeatures && (
        <>
          <div className="card bg-base-100 shadow p-4">
            <h3 className="font-semibold mb-2 text-center">
              Descrições dos Resultados
            </h3>
            <ul className="list-disc list-inside space-y-1 max-h-64 overflow-y-auto">
              {results.map((r) => (
                <li key={r.id}>
                  {r.description || "Sem descrição disponível"} (
                  {new Date(r.created_at).toLocaleDateString("pt-BR")})
                </li>
              ))}
            </ul>
          </div>

          <ExportResultsPDF
            chartRef={chartRef as RefObject<HTMLDivElement>}
            testId={testId}
          />
        </>
      )}
    </div>
  );
}