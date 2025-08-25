"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/utils/supabase/client";

export default function TestResults({ testId }: { testId: string }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: results } = await supabase
        .from("results")
        .select("mission_key, metric, value")
        .eq("test_id", testId);

      // Agrupar por missão
      const grouped: Record<string, { mission: string; tentativas: number; acertos: number }> = {};
      results?.forEach((r) => {
        if (!grouped[r.mission_key]) {
          grouped[r.mission_key] = { mission: r.mission_key, tentativas: 0, acertos: 0 };
        }
        grouped[r.mission_key].tentativas++;
        if (r.metric === "sucesso" && r.value === 1) grouped[r.mission_key].acertos++;
      });

      setData(Object.values(grouped));
    };

    fetchData();
  }, [testId]);

  return (
    <div className="w-full h-80">
      <h2 className="text-xl font-bold mb-4">Desempenho por Missão</h2>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="mission" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="tentativas" fill="#8884d8" />
          <Bar dataKey="acertos" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
