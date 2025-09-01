"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from "recharts";
import { supabase } from "@/utils/supabase/client";

interface TestResultsChartsProps {
  testId: string;
  testType: string; // "missao_individual" | "grupo" | "personalizado"
}

export default function TestResultsCharts({
  testId,
  testType,
}: TestResultsChartsProps) {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      const { data, error } = await supabase
        .from("results")
        .select("*")
        .eq("test_id", testId);

      if (error) {
        console.error("Erro ao carregar resultados:", error);
      } else {
        setResults(data || []);
      }
      setLoading(false);
    }

    async function fetchName() {
      const { data, error } = await supabase
        .from("tests")
        .select("name_test")
        .eq("id", testId)
        .single();
      if (error) {
        console.error("Erro ao buscar nome do teste:", error);
      } else {
        setName(data.name_test);
      }
    }

    fetchResults();
    fetchName();
  }, [testId]);

  if (loading) return <p>Carregando resultados...</p>;
  if (!results.length) return <p>Nenhum resultado encontrado.</p>;

  // =========================
  // MISSÃO INDIVIDUAL
  // =========================
  const missaoIndResults = results.filter(
    (r) => r.metric === "missao_individual"
  );
  const acertos = missaoIndResults.filter((r) => r.value === 1).length;
  const erros = missaoIndResults.filter((r) => r.value === 0).length;
  const pieData = [
    { name: "Acertos", value: acertos },
    { name: "Erros", value: erros },
  ];

  // =========================
  // GRUPO (todos os lançamentos agregados)
  // =========================
  const grupoResults = results.filter((r) => r.metric === "grupo");
  const grupoAggregated: Record<
    string,
    { realizadas: number; naoRealizadas: number }
  > = {};

  grupoResults.forEach((r) => {
    Object.entries(r.value).forEach(([mission, val]) => {
      if (!grupoAggregated[mission])
        grupoAggregated[mission] = { realizadas: 0, naoRealizadas: 0 };
      if (Number(val) === 1) grupoAggregated[mission].realizadas += 1;
      else grupoAggregated[mission].naoRealizadas += 1;
    });
  });

  const missaoStats = Object.entries(grupoAggregated).map(
    ([mission, vals]) => ({
      mission,
      ...vals,
    })
  );

  // Missão mais negligenciada
  const naoFeitas = missaoStats.filter((m) => m.naoRealizadas > 0);
  const missaoMaisNegligenciada = naoFeitas.length
    ? naoFeitas.reduce((a, b) => (b.naoRealizadas > a.naoRealizadas ? b : a))
        .mission
    : "-";

  // Calculando acertos e erros agregados para grupo
  let totalAcertos = 0;
  let totalErros = 0;

  grupoResults.forEach((r) => {
    Object.values(r.value).forEach((val) => {
      if (Number(val) === 1) totalAcertos += 1;
      else totalErros += 1;
    });
  });

  // Aproveitamento geral do grupo
  const aproveitamentoGrupo = (
    (totalAcertos / (totalAcertos + totalErros || 1)) *
    100
  ).toFixed(1);

  // =========================
  // PERSONALIZADO
  // =========================
  const personalizadoResults = results.filter(
    (r) => r.metric === "personalizado"
  );
  const personalizadoData: {
    nome: string;
    parametros: Record<string, number>;
  }[] = [];
  personalizadoResults.forEach((r) => {
    r.value.forEach((v: any) => {
      personalizadoData.push({
        nome: v.nome,
        parametros: v.parametros,
      });
    });
  });

  // Preparar dados para gráfico de linhas (evolução dos parâmetros)
  const paramKeys = parametersColumns(personalizadoData);
  const lineChartData = personalizadoData.map((v, index) => {
    const obj: any = { variavel: v.nome };
    paramKeys.forEach((key) => {
      obj[key] = Number(v.parametros[key] || 0);
    });
    obj.lancamento = index + 1;
    return obj;
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Card Informativo */}
      <div className="card bg-base-200 shadow-md p-4">
        <h2 className="text-lg font-bold">Resumo do Teste - {name} </h2>
        <p>Total de lançamentos: {results.length}</p>
        {testType === "missao_individual" && (
          <p>
            Aproveitamento:{" "}
            {((acertos / (acertos + erros || 1)) * 100).toFixed(1)}%
          </p>
        )}
        {testType === "grupo" && (
          <div>
            <p>Total de lançamentos: {results.length}</p>
            <p>Total de missões: {missaoStats.length}</p>
            <p>Missão mais negligenciada: {missaoMaisNegligenciada}</p>
            <p>Aproveitamento: {aproveitamentoGrupo}%</p>
          </div>
        )}
        {testType === "personalizado" && (
          <p>Total de variáveis: {personalizadoData.length}</p>
        )}
      </div>

      {/* MISSÃO INDIVIDUAL */}
      {testType === "missao_individual" && (
        <div className="card bg-base-200 shadow-md p-4">
          <h2 className="text-lg font-bold mb-2">Missão Individual</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label
                >
                  <Cell fill="#4ade80" />
                  <Cell fill="#f87171" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* GRUPO */}
      {testType === "grupo" && (
        <div className="card bg-base-200 shadow-md p-4 md:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={missaoStats}>
                <XAxis dataKey="mission" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="realizadas"
                  fill="#60a5fa"
                  name="Totalmente feitas"
                />
                <Bar
                  dataKey="naoRealizadas"
                  fill="#fbbf24"
                  name="Não realizadas totalmente"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* PERSONALIZADO */}
      {testType === "personalizado" && (
        <>
          {/* Tabela */}
          <div className="card bg-base-200 shadow-md p-4 md:col-span-2">
            <h2 className="text-lg font-bold mb-2">
              Personalizado - Parâmetros
            </h2>
            <div className="overflow-x-auto">
              <table className="table table-compact w-full">
                <thead>
                  <tr>
                    <th>Variável</th>
                    {paramKeys.map((param) => (
                      <th key={param}>{param}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {personalizadoData.map((v, idx) => (
                    <tr key={idx}>
                      <td>{v.nome}</td>
                      {paramKeys.map((param) => (
                        <td key={param}>{v.parametros[param] || "-"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gráfico de Linhas */}
          <div className="card bg-base-200 shadow-md p-4 md:col-span-2">
            <h2 className="text-lg font-bold mb-2">Evolução dos Parâmetros</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
                  {/* Eixo X: lançamento */}
                  <XAxis
                    dataKey="lancamento"
                    label={{
                      value: "Lançamento",
                      position: "insideBottom",
                      offset: -5,
                    }}
                    tickFormatter={(value) => `#${value}`} // mostra #1, #2, etc.
                  />

                  {/* Eixo Y: valores das variáveis */}
                  <YAxis />

                  {/* Tooltip para mostrar todas as variáveis do lançamento */}
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(label) => `Lançamento #${label}`}
                  />

                  <Legend verticalAlign="top" height={36} />

                  {/* Cada variável como uma linha */}
                  {paramKeys.map((param, idx) => (
                    <Line
                      key={param}
                      type="monotone"
                      dataKey={param}
                      name={param} // exibe nome da variável na legenda
                      stroke={colors[idx % colors.length]}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const colors = [
  "#60a5fa",
  "#fbbf24",
  "#4ade80",
  "#f472b6",
  "#a78bfa",
  "#f87171",
];

// Função auxiliar para pegar todos os parâmetros de todos os resultados
function parametersColumns(
  data: { nome: string; parametros: Record<string, any> }[]
) {
  const allParams = new Set<string>();
  data.forEach((v) =>
    Object.keys(v.parametros).forEach((k) => allParams.add(k))
  );
  return Array.from(allParams);
}
