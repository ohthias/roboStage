"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/utils/supabase/client";
import ModalLabTest from "../../../components/ui/Modal/ModalLabTest";
import TestResultsCharts from "../../../components/LabTest/ResultsSection";
import { BeakerIcon } from "@heroicons/react/24/outline";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import ModalConfirm, {
  ModalConfirmRef,
} from "../../../components/ui/Modal/ModalConfirm";
import ModalInput, {
  ModalInputRef,
} from "../../../components/ui/Modal/ModalInput";
import { useRef } from "react";
import { useToast } from "@/app/context/ToastContext";
import ModalResultForm, {
  ModalResultFormRef,
} from "../../../components/LabTest/ResultForm";
import Loader from "@/components/loader";

type Mission = {
  id: string;
  name: string;
  mission: string;
  image?: string;
};

type MissionsData = Record<string, Mission[]>;

export default function LabTestPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [testTypes, setTestTypes] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [missionsData, setMissionsData] = useState<MissionsData>({});
  const [activeTab, setActiveTab] = useState<"tests" | "results">("tests");

  // Filtros
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [order, setOrder] = useState<"desc" | "asc">("desc");

  const modalConfirmRef = useRef<ModalConfirmRef>(null);
  const modalInputRef = useRef<ModalInputRef>(null);
  const modalResultFormRef = useRef<ModalResultFormRef>(null);
  const { addToast } = useToast();

  // Carregar missões
  useEffect(() => {
    fetch("/data/missions.json")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar as missões");
        return res.json();
      })
      .then((data: MissionsData) => setMissionsData(data))
      .catch((err) => console.error(err));
  }, []);

  // Carregar testes
  useEffect(() => {
    const fetchTypesTestsAndMissions = async () => {
      setLoading(true);

      const { data: typesData } = await supabase.from("test_types").select("*");
      const typesMap: Record<string, string> = {};
      typesData?.forEach((t: any) => (typesMap[t.id] = t.name));
      setTestTypes(typesMap);

      const { data: testsData } = await supabase
        .from("tests")
        .select(`*, test_parameters(*), test_missions(*)`);

      setTests(testsData || []);
      setLoading(false);
    };

    fetchTypesTestsAndMissions();
  }, []);

  // Função para pegar imagens da missão
  const getMissionImages = (season: string, missionKeys: string[] | string) => {
    if (!missionsData[season]) return [];
    const keys = Array.isArray(missionKeys)
      ? missionKeys.slice(0, 4)
      : [missionKeys];
    return keys.map(
      (key) => missionsData[season].find((m) => m.id === key)?.image || ""
    );
  };

  // Filtragem e ordenação local
  const filteredTests = useMemo(() => {
    return tests
      .filter((test) => {
        const matchesSearch = test.name_test
          .toLowerCase()
          .includes(searchText.toLowerCase());
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

  // Adicione esses estados junto com os outros estados de filtros
  const [searchResultText, setSearchResultText] = useState("");
  const [selectedResultType, setSelectedResultType] = useState<string>("all");
  const [resultOrder, setResultOrder] = useState<"desc" | "asc">("desc");

  // Filtragem e ordenação para resultados
  const filteredResults = useMemo(() => {
    return tests
      .filter((test) => {
        const matchesSearch = test.name_test
          .toLowerCase()
          .includes(searchResultText.toLowerCase());
        const matchesType =
          selectedResultType === "all" ||
          test.type_id.toString() === selectedResultType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return resultOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
  }, [tests, searchResultText, selectedResultType, resultOrder]);

  // Excluir
  const handleDelete = (testId: string) => {
    modalConfirmRef.current?.open(
      "Tem certeza que deseja excluir este teste?",
      async () => {
        await supabase.from("tests").delete().eq("id", testId);
        setTests((prev) => prev.filter((t) => t.id !== testId));
        addToast("Teste excluído com sucesso!", "success");
      }
    );
  };

  // Renomear
  const handleRename = (testId: string, oldName: string) => {
    modalInputRef.current?.open(oldName, async (newName) => {
      if (newName && newName.trim() && newName !== oldName) {
        await supabase
          .from("tests")
          .update({ name_test: newName })
          .eq("id", testId);
        setTests((prev) =>
          prev.map((t) => (t.id === testId ? { ...t, name_test: newName } : t))
        );
        addToast("Nome do teste atualizado com sucesso!", "success");
      }
    });
  };

  return (
    <div className="pb-8 flex flex-col">
      {/* Header */}
      <section className="bg-base-200 p-4 rounded-lg flex justify-between items-start shadow-md border border-base-300 mb-4">
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
        <ModalResultForm ref={modalResultFormRef} />
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
        <section className="flex gap-4 flex-wrap">
          {loading && <Loader />}

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
            filteredTests.map((test) => {
              const testTypeName = testTypes[test.type_id] || "Desconhecido";
              const temporada = test.test_missions?.[0]?.season;
              const missionKeys = test.test_missions?.map(
                (m: any) => m.mission_key
              );

              // Pegar imagens
              const images = temporada
                ? getMissionImages(temporada, missionKeys)
                : [];

              return (
                <div
                  key={test.id}
                  className="card bg-base-100 shadow-md border border-base-300 flex flex-row p-4 items-center gap-4 w-80 h-48 relative"
                >
                  {/* Imagens */}
                  <div className="flex-shrink-0">
                    {images.length > 1 ? (
                      // Grid 2x2 para grupos
                      <div className="grid grid-cols-2 grid-rows-2 gap-1 w-24 h-24">
                        {images
                          .slice(0, 4)
                          .map((img, idx) =>
                            img ? (
                              <img
                                key={idx}
                                src={img}
                                alt={`Missão ${missionKeys[idx]}`}
                                className="w-full h-full object-contain rounded"
                              />
                            ) : null
                          )}
                      </div>
                    ) : (
                      // Única imagem
                      images[0] && (
                        <img
                          src={images[0]}
                          alt={`Missão ${missionKeys?.[0]}`}
                          className="w-24 h-24 object-contain rounded"
                        />
                      )
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 flex flex-col gap-1 overflow-hidden items-start">
                    <h3 className="card-title text-lg font-bold truncate">
                      {test.name_test}
                    </h3>
                    <p className="text-sm text-base-content">
                      <span className="font-bold">Tipo:</span> {testTypeName}
                    </p>

                    {temporada && (
                      <p className="text-sm text-base-content">
                        <span className="font-bold">Temporada:</span>{" "}
                        {temporada.toUpperCase()}
                      </p>
                    )}

                    {missionKeys && missionKeys.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap max-h-6 overflow-hidden">
                        {missionKeys.map((key: string) => (
                          <span
                            key={key}
                            className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary/45 text-primary-content text-[10px] font-bold cursor-default"
                            title={key}
                          >
                            {key}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-base-content mt-1">
                      Criado em:{" "}
                      {new Date(test.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  {/* Botões de ação */}
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <button
                      onClick={() =>
                        modalResultFormRef.current?.openWithTest(test.id)
                      }
                      className="btn btn-default btn-xs p-1"
                      title="Adicionar resultado"
                    >
                      <PlusIcon className="size-4" />
                    </button>
                    <button
                      onClick={() => handleRename(test.id, test.name_test)}
                      className="btn btn-ghost btn-xs p-1 text-primary"
                      title="Renomear teste"
                    >
                      <PencilIcon className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(test.id)}
                      className="btn btn-ghost btn-xs p-1 text-error"
                      title="Excluir teste"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
        </section>
      )}

      {/* Conteúdo aba "Resultados" */}
      {activeTab === "results" && (
        <>
          {/* Filtros */}
          <section className="flex flex-col sm:flex-row gap-4 mb-4 items-start sm:items-center">
            <input
              type="text"
              className="input input-bordered w-full sm:w-64 flex-1"
              placeholder="Buscar resultado por nome..."
              value={searchResultText}
              onChange={(e) => setSearchResultText(e.target.value)}
            />
            <select
              className="select select-bordered w-full sm:w-52"
              value={selectedResultType}
              onChange={(e) => setSelectedResultType(e.target.value)}
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
              value={resultOrder}
              onChange={(e) => setResultOrder(e.target.value as "desc" | "asc")}
            >
              <option value="desc">Mais recentes primeiro</option>
              <option value="asc">Mais antigos primeiro</option>
            </select>
          </section>

          {/* Conteúdo aba "Resultados" */}
          <section className="grid grid-cols-1 gap-6">
            {filteredResults.map((test) => (
              <div
                key={test.id}
                className="collapse collapse-arrow bg-base-100 shadow-md border border-base-300"
              >
                <input type="checkbox" className="peer" />
                <div className="collapse-title text-xl font-bold flex flex-col gap-1">
                  <span>{test.name_test}</span>
                  <span className="text-sm font-normal text-base-content">
                    Tipo: {testTypes[test.type_id] || "Desconhecido"} | Criado
                    em: {new Date(test.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="collapse-content">
                  <TestResultsCharts testId={test.id} />
                </div>
              </div>
            ))}
            {filteredResults.length === 0 && (
              <div className="col-span-full flex flex-col justify-center items-center p-6 border border-base-300 rounded-lg bg-base-100 shadow-md">
                <BeakerIcon className="w-12 h-12 text-gray-400 mb-2" />
                <h2 className="text-center text-lg font-bold text-gray-500">
                  Nenhum resultado encontrado!
                </h2>
                <p className="text-center text-sm text-gray-400 mt-1">
                  Ajuste os filtros ou aguarde novos resultados.
                </p>
              </div>
            )}
          </section>
        </>
      )}
      {/* Modais globais */}
      <ModalConfirm ref={modalConfirmRef} title="Confirmação" />
      <ModalInput
        ref={modalInputRef}
        title="Renomear Teste"
        placeholder="Digite o novo nome..."
      />
    </div>
  );
}
