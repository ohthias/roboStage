"use client";
import React, { useState, useMemo, useRef } from "react";
import ModalLabTest from "@/components/ui/Modal/ModalLabTest";
import ModalConfirm, {
  ModalConfirmRef,
} from "@/components/ui/Modal/ModalConfirm";
import ModalInput, { ModalInputRef } from "@/components/ui/Modal/ModalInput";
import ModalResultForm, {
  ModalResultFormRef,
} from "@/components/LabTest/ResultForm";
import Loader from "@/components/loader";
import { useToast } from "@/app/context/ToastContext";
import { PresentationChartBarIcon } from "@heroicons/react/24/outline";
import { useLabTests } from "@/hooks/useLabTests";
import TestTabs from "../labtest/components/TestTabs";
import TestList from "../labtest/components/TestList";
import ResultsList from "../labtest/components/ResultsList";
import { supabase } from "@/utils/supabase/client";

/* --------------------------
  HOOK DE FILTRAGEM OTIMIZADO
--------------------------- */
function useFilters(defaultOrder: "asc" | "desc" = "desc") {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [order, setOrder] = useState<"asc" | "desc">(defaultOrder);

  return {
    search,
    type,
    order,
    setSearch,
    setType,
    setOrder,
  };
}

export default function LabTestPage() {
  const { tests, setTests, testTypes, loading } = useLabTests();

  const {
    search: searchTests,
    type: typeTests,
    order: orderTests,
    setSearch: setSearchTests,
    setType: setTypeTests,
    setOrder: setOrderTests,
  } = useFilters();

  const {
    search: searchResults,
    type: typeResults,
    order: orderResults,
    setSearch: setSearchResults,
    setType: setTypeResults,
    setOrder: setOrderResults,
  } = useFilters();

  const [activeTab, setActiveTab] = useState<"tests" | "results">("tests");

  const modalConfirmRef = useRef<ModalConfirmRef>(null);
  const modalInputRef = useRef<ModalInputRef>(null);
  const modalResultFormRef = useRef<ModalResultFormRef>(null);
  const { addToast } = useToast();

  const [missionsData, setMissionsData] = useState<Record<string, any[]>>({});

  React.useEffect(() => {
    fetch("/data/missions.json")
      .then((r) => r.json())
      .then((d) => setMissionsData(d))
      .catch((e) => console.error("missions.json", e));
  }, []);

  /* --------------------------
      NORMALIZADOR DE TEXTO
  --------------------------- */
  const normalize = (s: string) =>
    s
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") ?? "";

  const normalizedTests = useMemo(() => {
    return tests.map((t: any) => ({
      ...t,
      _normalizedName: normalize(t.name_test),
    }));
  }, [tests]);

  /* --------------------------
         FILTRAGEM OTIMIZADA
  --------------------------- */
  const filteredTests = useMemo(() => {
    return normalizedTests
      .filter((test: any) => {
        const matchesSearch = test._normalizedName.includes(
          normalize(searchTests)
        );
        const matchesType =
          typeTests === "all" || test.type_id?.toString() === typeTests;
        return matchesSearch && matchesType;
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(a.updated_at || a.created_at).getTime();
        const dateB = new Date(b.updated_at || b.created_at).getTime();
        return orderTests === "asc" ? dateA - dateB : dateB - dateA;
      });
  }, [normalizedTests, searchTests, typeTests, orderTests]);

  const filteredResults = useMemo(() => {
    return normalizedTests
      .filter((test: any) => {
        const matchesSearch = test._normalizedName.includes(
          normalize(searchResults)
        );
        const matchesType =
          typeResults === "all" || test.type_id?.toString() === typeResults;
        return matchesSearch && matchesType;
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(a.updated_at || a.created_at).getTime();
        const dateB = new Date(b.updated_at || b.created_at).getTime();
        return orderResults === "asc" ? dateA - dateB : dateB - dateA;
      });
  }, [normalizedTests, searchResults, typeResults, orderResults]);

  /* --------------------------
           AÇÕES CRUD
  --------------------------- */
  const handleDelete = (testId: string) => {
    modalConfirmRef.current?.open(
      "Tem certeza que deseja excluir este teste?",
      async () => {
        try {
          const { error } = await supabase
            .from("tests")
            .delete()
            .eq("id", testId);
          if (error) throw error;
          setTests((prev: any[]) => prev.filter((t) => t.id !== testId));
          addToast("Teste excluído com sucesso!", "success");
        } catch (err) {
          console.error(err);
          addToast("Erro ao excluir teste", "error");
        }
      }
    );
  };

  const handleRename = (testId: string, oldName: string) => {
    modalInputRef.current?.open(oldName, async (newName) => {
      if (!newName || !newName.trim() || newName === oldName) return;

      try {
        const { error } = await supabase
          .from("tests")
          .update({ name_test: newName })
          .eq("id", testId);
        if (error) throw error;

        setTests((prev: any[]) =>
          prev.map((t) => (t.id === testId ? { ...t, name_test: newName } : t))
        );

        addToast("Nome atualizado com sucesso!", "success");
      } catch (err) {
        console.error(err);
        addToast("Erro ao renomear teste", "error");
      }
    });
  };

  /* --------------------------
             UI
  --------------------------- */
  return (
    <div className="pb-8 flex flex-col">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-base-100 p-6 rounded-xl shadow-md border border-base-300">
        <div className="flex items-center gap-4">
          <PresentationChartBarIcon className="hidden sm:block w-10 h-10 text-primary/75" />
          <div>
            <h2 className="text-base-content font-bold mb-2 text-3xl">
              Lab<span className="text-primary">Test</span>
            </h2>
            <p className="text-sm text-base-content">
              Crie, filtre e gerencie seus testes personalizados com mais
              agilidade.
            </p>
          </div>
        </div>
        <ModalLabTest />
      </section>

      <section className="my-4 flex flex-row justify-between items-center">
        <TestTabs active={activeTab} onChange={setActiveTab} />

        <ModalResultForm ref={modalResultFormRef} />
      </section>

      {/* Aba: TESTES */}
      {activeTab === "tests" && (
        <>
          <FiltersSection
            search={searchTests}
            setSearch={setSearchTests}
            type={typeTests}
            setType={setTypeTests}
            order={orderTests}
            setOrder={setOrderTests}
            testTypes={testTypes}
            placeholder="Buscar teste..."
          />

          {loading ? (
            <Loader />
          ) : (
            <TestList
              tests={filteredTests}
              testTypes={testTypes}
              missionsData={missionsData}
              loading={loading}
              onAddResult={(id) => modalResultFormRef.current?.openWithTest(id)}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          )}
        </>
      )}

      {/* Aba: RESULTADOS */}
      {activeTab === "results" && (
        <>
          <FiltersSection
            search={searchResults}
            setSearch={setSearchResults}
            type={typeResults}
            setType={setTypeResults}
            order={orderResults}
            setOrder={setOrderResults}
            testTypes={testTypes}
            placeholder="Buscar resultado..."
          />

          <ResultsList tests={filteredResults} testTypes={testTypes} />
        </>
      )}

      {/* Modais */}
      <ModalConfirm ref={modalConfirmRef} title="Confirmação" />
      <ModalInput
        ref={modalInputRef}
        title="Renomear Teste"
        placeholder="Digite o novo nome..."
      />
    </div>
  );
}

/* --------------------------
    COMPONENTE DE FILTROS
--------------------------- */
function FiltersSection({
  search,
  setSearch,
  type,
  setType,
  order,
  setOrder,
  testTypes,
  placeholder,
}: any) {
  return (
    <section className="w-full mb-4">
      <div className="flex flex-col sm:flex-row items-center gap-3">

        <input
          type="text"
          className="input input-bordered w-full sm:flex-1 py-2"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-3 w-full sm:w-auto">
          <select
            className="select select-bordered w-40"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="all">Tipos</option>
            {Object.entries(testTypes).map(([id, name]) => (
              <option key={id} value={id}>
                {name as string}
              </option>
            ))}
          </select>
          <select
            className="select select-bordered w-40"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          >
            <option value="desc">Mais recentes</option>
            <option value="asc">Mais antigos</option>
          </select>
        </div>
      </div>
    </section>
  );
}