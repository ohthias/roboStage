"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/utils/supabase/client";
import ModalLabTest from "../../../components/ui/Modal/ModalLabTest";
import ModalResultForm from "../../../components/LabTest/ResultForm";
import TestResultsCharts from "../../../components/LabTest/ResultsSection";
import { BeakerIcon } from "@heroicons/react/24/outline";
import missionsDataJson from "@/public/data/missions.json";

export default function LabTestPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [testTypes, setTestTypes] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tests" | "results">("tests");

  // Filtros
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [order, setOrder] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    const fetchTypesTestsAndMissions = async () => {
      setLoading(true);

      // Buscar tipos de teste
      const { data: typesData } = await supabase.from("test_types").select("*");
      const typesMap: Record<string, string> = {};
      typesData?.forEach((t: any) => (typesMap[t.id] = t.name));
      setTestTypes(typesMap);

      // Buscar testes
      const { data: testsData } = await supabase.from("tests").select("*");

      // Definir tipo para missão com propriedade opcional 'image'
      type MissionWithImage = {
        id: string;
        name: string;
        mission: string;
        points: number | number[];
        equipaments: boolean;
        type: (string | number | null)[] | string[];
        "sub-mission"?: any[];
        image?: string;
        [key: string]: any;
      };

      // Criar array único com todas as missões
      const missionsData: MissionWithImage[] = [
        ...missionsDataJson.masterpiece,
        ...missionsDataJson.submerged,
        ...missionsDataJson.unearthed,
      ].map((mission: any) => ({
        ...mission,
        equipaments: typeof mission.equipaments === "boolean" ? mission.equipaments : false,
      }));

      // Adicionar imagem da missão ao teste
      const testsWithMissions = (testsData || []).map((test: any) => {
        const mission = missionsData.find((m) => m.id === test.missionId);
        return { ...test, missionImage: mission?.image || "/images/default.png" };
      });

      setTests(testsWithMissions);
      setLoading(false);
    };

    fetchTypesTestsAndMissions();
  }, []);

  // Filtragem e ordenação local
  const filteredTests = useMemo(() => {
    return tests
      .filter((test) => {
        const matchesSearch =
          test.name_test.toLowerCase().includes(searchText.toLowerCase());
        const matchesType =
          selectedType === "all" || test.type_id.toString() === selectedType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return order === "asc" ? dateA - dateB : dateB - dateA;
      });
  }, [tests, searchText, selectedType, order]);

  return (
    <div className="min-h-screen overflow-y-auto">
      {/* Header */}
      <section className="bg-base-200 p-4 rounded-lg flex justify-between items-start shadow-md border border-base-300 mb-4">
        <div>
          <h2 className="text-base-content font-bold mb-2 text-3xl">
            Lab<span className="text-primary">Test</span>
          </h2>
          <p className="text-sm text-base-content">
            Crie e gerencie seus testes personalizados para avaliar o desempenho do robô.
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

      {/* Filtros aba "Testes" */}
      {activeTab === "tests" && (
        <section className="flex flex-col sm:flex-row gap-4 mb-4 items-start sm:items-center">
          <input
            type="text"
            className="input input-bordered w-full sm:w-64 flex-1"
            placeholder="Buscar teste por nome..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <select
            className="select select-bordered w-full sm:w-52"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">Todos os tipos</option>
            {Object.entries(testTypes).map(([id, name]) => (
              <option key={id} value={id}>
                {name as string}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered w-full sm:w-52"
            value={order}
            onChange={(e) => setOrder(e.target.value as "desc" | "asc")}
          >
            <option value="desc">Mais recentes primeiro</option>
            <option value="asc">Mais antigos primeiro</option>
          </select>
        </section>
      )}

      {/* Conteúdo aba "Testes" */}
      {activeTab === "tests" && (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading && <p>Carregando testes...</p>}

          {!loading && filteredTests.length === 0 && (
            <div className="col-span-full flex flex-col justify-center items-center p-6 border border-base-300 rounded-lg bg-base-100 shadow-md">
              <BeakerIcon className="w-12 h-12 text-gray-400 mb-2" />
              <h2 className="text-center text-lg font-bold text-gray-500">
                Nenhum teste encontrado!
              </h2>
              <p className="text-center text-sm text-gray-400 mt-1">
                Ajuste os filtros ou crie um novo teste.
              </p>
            </div>
          )}

          {!loading &&
            filteredTests.map((test) => (
              <div
                key={test.id}
                className="card bg-base-100 shadow-md border border-base-300 flex flex-col sm:flex-row"
              >
                {/* Imagem da missão */}
                <div className="sm:w-32 sm:h-32 flex-shrink-0">
                  <img
                    src={test.missionImage}
                    alt={test.name_test}
                    className="w-full h-full object-cover rounded-l-lg"
                  />
                </div>

                {/* Conteúdo do card */}
                <div className="card-body flex-1">
                  <h3 className="card-title text-lg font-bold">{test.name_test}</h3>
                  <p className="text-sm text-base-content">
                    Tipo: {testTypes[test.type_id] || "Desconhecido"}
                  </p>
                  <p className="text-xs text-base-content mt-1">
                    Criado em: {new Date(test.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
        </section>
      )}

      {/* Conteúdo aba "Resultados" */}
      {activeTab === "results" && (
        <section className="grid grid-cols-1 gap-6">
          {tests.map((test) => (
            <div
              key={test.id}
              className="card bg-base-100 shadow-md border border-base-300 p-4"
            >
              <h2 className="text-xl font-bold mb-2">{test.name_test}</h2>
              <p className="text-sm text-base-content mb-4">
                Tipo: {testTypes[test.type_id] || "Desconhecido"} | Criado em:{" "}
                {new Date(test.created_at).toLocaleDateString("pt-BR")}
              </p>

              <TestResultsCharts
                testId={test.id}
                testType={testTypes[test.type_id] || "personalizado"}
              />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}