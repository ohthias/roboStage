"use client";
import React, { useState, useMemo, useRef } from "react";
import ModalLabTest from "@/components/Dashboard/LabTest/ModalLabTest";
import ModalConfirm, {
  ModalConfirmRef,
} from "@/components/UI/Modal/ModalConfirm";
import ModalInput, { ModalInputRef } from "@/components/UI/Modal/ModalInput";
import ModalResultForm, {
  ModalResultFormRef,
} from "@/components/Dashboard/LabTest/ResultForm";
import { useToast } from "@/app/context/ToastContext";
import { PresentationChartBarIcon } from "@heroicons/react/24/outline";
import { useLabTests } from "@/hooks/useLabTests";
import TestTabs from "./components/TestTabs";
import TestList from "./components/TestList";
import ResultsList from "./components/ResultsList";
import { supabase } from "@/utils/supabase/client";
import TestCardSkeleton from "./components/TestCardSkeleton";

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
    (s ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

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
    <div className="px-6 pt-4 space-y-4 flex flex-col h-full">
      {/* Header */}
      <div className="rounded-2xl border border-base-300 bg-gradient-to-br from-primary/10 via-base-100 to-base-300/10 p-6 flex flex-col sm:flex-row  items-start sm:items-center justify-between gap-4">
        {/* Info */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <PresentationChartBarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight">LabTest</h1>
            <p className="text-sm text-base-content/70 max-w-lg">
              Gerencie seus testes de missões e visualize os resultados de forma
              eficiente.
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="shrink-0">
          <ModalLabTest />
        </div>
      </div>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <TestCardSkeleton key={i} />
              ))}
            </div>
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
interface FiltersSectionProps {
  search: string;
  setSearch: (value: string) => void;
  type: string;
  setType: (value: string) => void;
  order: "asc" | "desc";
  setOrder: (value: "asc" | "desc") => void;
  testTypes: Record<string, string>;
  placeholder?: string;
}

function FiltersSection({
  search,
  setSearch,
  type,
  setType,
  order,
  setOrder,
  testTypes,
  placeholder = "Buscar...",
}: FiltersSectionProps) {
  return (
    <section className="w-full mb-4">
      <div className="flex flex-col sm:flex-row justify-between gap-3 bg-base-100/60 border border-base-300 rounded-xl p-3">
        {/* Search */}
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-sm input-bordered w-full flex-1"
        />

        {/* Type */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="select select-sm select-bordered w-full sm:max-w-xs rounded-box px-2 flex-1"
        >
          <option value="all">Todos os tipos</option>
          {Object.entries(testTypes).map(([id, name]) => (
            <option key={id} value={id}>
              {name.toLocaleUpperCase()}
            </option>
          ))}
        </select>

        {/* Order */}
        <select
          value={order}
          onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
          className="select select-sm select-bordered w-full sm:max-w-xs rounded-box px-2 flex-1"
        >
          <option value="desc">Mais recentes</option>
          <option value="asc">Mais antigos</option>
        </select>
      </div>
    </section>
  );
}
