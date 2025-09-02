"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import ModalLabTest from "./ui/Modal/ModalLabTest";
import ModalResultForm from "./ResultForm";
import TestResultsCharts from "./ResultsSection";
import { Pencil, Trash2 } from "lucide-react"; // Ícones

export default function LabTestPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [missionsJson, setMissionsJson] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tests" | "results">("tests");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // 1) Carregar missions.json
        const res = await fetch("/data/missions.json");
        const missionsData = await res.json();
        setMissionsJson(missionsData);

        // 2) Buscar testes + tipo + missões relacionadas
        const { data, error } = await supabase.from("tests").select(`
            id,
            name_test,
            created_at,
            type_id,
            test_types ( name ),
            test_missions ( mission_key )
          `);

        if (error) {
          console.error("Erro ao buscar testes:", error);
          setTests([]);
        } else {
          // Adicionar o nome do tipo no objeto
          const enrichedTests = data.map((test: any) => ({
            ...test,
            typeName: test.test_types?.name || "Desconhecido",
          }));
          setTests(enrichedTests);
        }
      } catch (err) {
        console.error("Erro geral:", err);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen overflow-y-auto">
      <section className="bg-base-200 p-4 rounded-box flex justify-between items-start shadow-md border border-base-300 mb-4">
        <div>
          <h2 className="text-base-content font-bold mb-2 text-3xl">
            Lab<span className="text-primary">Test</span>
          </h2>
          <p className="text-sm text-base-content">
            Crie e gerencie seus testes personalizados para avaliar o desempenho
            do robô.
          </p>
        </div>
        <ModalLabTest />
      </section>

      {/* Abas */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div role="tablist" className="tabs tabs-border my-2">
          <button
            role="tab"
            className={`tab ${activeTab === "tests" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("tests")}
          >
            Testes
          </button>
          <button
            role="tab"
            className={`tab ${activeTab === "results" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("results")}
          >
            Resultados
          </button>
        </div>
        <ModalResultForm />
      </div>

      {/* Conteúdo da aba "Testes" */}
      {activeTab === "tests" && (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading && <p>Carregando testes...</p>}

          {!loading && tests.length === 0 && (
            <h2 className="text-center text-primary text-lg font-bold mt-4 col-span-full">
              Nenhum teste criado ainda!
            </h2>
          )}

          {!loading &&
            tests.map((test) => {
              let missionImages: string[] = [];
              let missionSeason: string | null = "Personalizado";
              const seasonKeys = Object.keys(missionsJson);

              if (
                test.typeName.toLowerCase() === "missao_individual" &&
                test.test_missions?.length > 0
              ) {
                const missionKey = test.test_missions[0].mission_key;
                let foundMission: any = null;

                for (const season of seasonKeys) {
                  foundMission = missionsJson[season].find(
                    (m: any) => m.id === missionKey
                  );
                  if (foundMission) {
                    missionSeason = season;
                    break;
                  }
                }

                missionImages = [
                  foundMission?.image || "/images/missions/default.png",
                ];
              } else if (
                test.typeName.toLowerCase() === "grupo" &&
                test.test_missions?.length > 0
              ) {
                let foundSeason: string | null = null;
                const imgs: string[] = [];

                test.test_missions.forEach((tm: any) => {
                  for (const season of seasonKeys) {
                    const foundMission = missionsJson[season].find(
                      (m: any) => m.id === tm.mission_key
                    );
                    if (foundMission) {
                      if (!foundSeason) foundSeason = season;
                      imgs.push(foundMission.image || "/images/missions/default.png");
                      break;
                    }
                  }
                });

                missionSeason = foundSeason || "Personalizado";
                missionImages = imgs.slice(0, 4);
              } else if (test.typeName.toLowerCase() === "personalizado") {
                missionImages = ["/images/missions/custom.png"];
              }

              return (
                <div
                  key={test.id}
                  className="card bg-base-100 shadow-md border border-base-300 overflow-hidden"
                >
                  <div className="flex h-40">
                    {/* Lado esquerdo - Imagem(s) */}
                    <div className="w-2/5 bg-base-200 flex items-center justify-center">
                      {missionImages.length === 1 ? (
                        <img
                          src={missionImages[0]}
                          alt={test.name_test || "Missão"}
                          className="object-contain h-full w-full"
                        />
                      ) : (
                        <div className="grid grid-cols-2 gap-1 p-1 w-full h-full">
                          {missionImages.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`mission-${idx}`}
                              className="object-cover w-full h-full rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Lado direito - Informações */}
                    <div className="w-3/5 p-3 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg">
                          {test.name_test || "Teste sem nome"}
                        </h3>
                        <p className="text-sm">Tipo: {test.typeName}</p>
                        <p className="text-xs text-base-content">
                          Temporada: {missionSeason}
                        </p>
                        <p className="text-xs text-base-content">
                          Criado em:{" "}
                          {new Date(test.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      {/* Botões */}
                      <div className="flex gap-2 mt-2">
                        <button className="btn btn-xs btn-outline btn-primary flex items-center gap-1">
                          <Pencil className="w-4 h-4" /> Editar
                        </button>
                        <button className="btn btn-xs btn-outline btn-error flex items-center gap-1">
                          <Trash2 className="w-4 h-4" /> Deletar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </section>
      )}

      {/* Conteúdo da aba "Resultados" */}
      {activeTab === "results" && (
        <section className="grid grid-cols-1 gap-6">
          {tests.map((test) => (
            <div
              key={test.id}
              className="card bg-base-100 shadow-md border border-base-300 p-4"
            >
              <h2 className="text-xl font-bold mb-2">
                {test.name_test || "Teste sem nome"}
              </h2>
              <p className="text-sm text-base-content mb-4">
                Tipo: {test.typeName} | Criado em:{" "}
                {new Date(test.created_at).toLocaleDateString()}
              </p>

              {/* Gráficos/tabelas */}
              <TestResultsCharts
                testId={test.id}
                testType={test.typeName || "personalizado"}
              />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
