"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import missionsData from "@/public/data/missions.json";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

type ResultRow = {
  id: number;
  test_id: string;
  mission_key: string | null;
  value: any;
  created_at: string;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function TestResultsCharts({
  testId,
  season,
}: {
  testId: string;
  season: string;
}) {
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

  const getMissionByKey = (key: string | null) => {
    if (!key) return null;

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
  if (results.length === 0) return <p>Nenhum resultado encontrado para este teste.</p>;

  return (
    <div className="space-y-8">
      {results.map((res) => {
        const mission = getMissionByKey(res.mission_key);

        if (!mission)
          return (
            <div
              key={res.id}
              className="p-4 border rounded-lg bg-base-100 shadow"
            >
              <p className="text-sm text-center text-gray-500">
                Missão não encontrada para a chave: {res.mission_key || "null"}
              </p>
            </div>
          );

        const type = mission.type?.[0];
        const valueObj = res.value || {};
        const values = Object.values(valueObj) as number[];

        // ---- switch -> pizza ----
        if (type === "switch") {
          const yesCount = values.filter((v) => v === 1).length;
          const noCount = values.filter((v) => v === 0).length;

          const data = [
            { option: "Sim", count: yesCount },
            { option: "Não", count: noCount },
          ];

          return (
            <div
              key={res.id}
              className="p-4 border rounded-lg bg-base-100 shadow"
            >
              <h3 className="font-semibold mb-2">
                {mission.name || mission.submission || "Sem nome"}
              </h3>
              <PieChart width={400} height={250}>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="option"
                  outerRadius={80}
                  label
                >
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          );
        }

        // ---- range -> linha ----
        if (type === "range") {
          const data = values.map((v, idx) => ({
            tentativa: `T${idx + 1}`,
            valor: v,
          }));

          return (
            <div
              key={res.id}
              className="p-4 border rounded-lg bg-base-100 shadow"
            >
              <h3 className="font-semibold mb-2">
                {mission.name || mission.submission || "Sem nome"}
              </h3>
              <LineChart width={400} height={250} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tentativa" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="valor" stroke="#82ca9d" />
              </LineChart>
            </div>
          );
        }

        return (
          <div
            key={res.id}
            className="p-4 border rounded-lg bg-base-100 shadow"
          >
            <p>Tipo de missão desconhecido.</p>
          </div>
        );
      })}
    </div>
  );
}