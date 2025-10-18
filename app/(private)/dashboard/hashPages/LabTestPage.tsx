"use client";
import React, { useState, useMemo, useRef } from "react";
import ModalLabTest from "@/components/ui/Modal/ModalLabTest";
import ModalConfirm, { ModalConfirmRef } from "@/components/ui/Modal/ModalConfirm";
import ModalInput, { ModalInputRef } from "@/components/ui/Modal/ModalInput";
import ModalResultForm, { ModalResultFormRef } from "@/components/LabTest/ResultForm";
import Loader from "@/components/loader";
import { useToast } from "@/app/context/ToastContext";
import { BeakerIcon, PresentationChartBarIcon } from "@heroicons/react/24/outline";
import { useLabTests } from "@/hooks/useLabTests";
import TestTabs from "../labtest/components/TestTabs";
import TestList from "../labtest/components/TestList";
import ResultsList from "../labtest/components/ResultsList";

export default function LabTestPage() {
  const { tests, setTests, testTypes, loading, refetch } = useLabTests();
  const [activeTab, setActiveTab] = useState<"tests" | "results">("tests");

  // Filters
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [order, setOrder] = useState<"desc" | "asc">("desc");

  const [searchResultText, setSearchResultText] = useState("");
  const [selectedResultType, setSelectedResultType] = useState<string>("all");
  const [resultOrder, setResultOrder] = useState<"desc" | "asc">("desc");

  const modalConfirmRef = useRef<ModalConfirmRef>(null);
  const modalInputRef = useRef<ModalInputRef>(null);
  const modalResultFormRef = useRef<ModalResultFormRef>(null);
  const { addToast } = useToast();

  // missions.json is fetched client-side in old code; keep the same pattern (optional improvement: import statically)
  const [missionsData, setMissionsData] = useState<Record<string, any[]>>({});
  React.useEffect(() => {
    fetch("/data/missions.json")
      .then((r) => r.json())
      .then((d) => setMissionsData(d))
      .catch((e) => console.error("missions.json", e));
  }, []);

  const filteredTests = useMemo(() => {
    return tests
      .filter((test: any) => {
        const matchesSearch = test.name_test?.toLowerCase().includes(searchText.toLowerCase());
        const matchesType = selectedType === "all" || test.type_id?.toString() === selectedType;
        return matchesSearch && matchesType;
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return order === "asc" ? dateA - dateB : dateB - dateA;
      });
  }, [tests, searchText, selectedType, order]);

  const filteredResults = useMemo(() => {
    return tests
      .filter((test: any) => {
        const matchesSearch = test.name_test?.toLowerCase().includes(searchResultText.toLowerCase());
        const matchesType = selectedResultType === "all" || test.type_id?.toString() === selectedResultType;
        return matchesSearch && matchesType;
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return resultOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
  }, [tests, searchResultText, selectedResultType, resultOrder]);

  const handleDelete = (testId: string) => {
    modalConfirmRef.current?.open("Tem certeza que deseja excluir este teste?", async () => {
      try {
        await fetch("/api/delete-test", { method: "POST", body: JSON.stringify({ id: testId }) }); // keep your Supabase delete or call supabase directly
        setTests((prev: any[]) => prev.filter((t) => t.id !== testId));
        addToast("Teste excluído com sucesso!", "success");
      } catch (err) {
        console.error(err);
        addToast("Erro ao excluir teste", "error");
      }
    });
  };

  const handleRename = (testId: string, oldName: string) => {
    modalInputRef.current?.open(oldName, async (newName) => {
      if (newName && newName.trim() && newName !== oldName) {
        try {
          // update via supabase
          // await supabase.from("tests").update({ name_test: newName }).eq("id", testId);
          setTests((prev: any[]) => prev.map((t) => (t.id === testId ? { ...t, name_test: newName } : t)));
          addToast("Nome do teste atualizado com sucesso!", "success");
        } catch (err) {
          console.error(err);
          addToast("Erro ao atualizar nome", "error");
        }
      }
    });
  };

  return (
    <div className="pb-8 flex flex-col">
      <section className="bg-base-100 p-4 rounded-lg flex justify-between items-start shadow-md border border-base-300 mb-4">
        <div className="flex items-center gap-4">
          <PresentationChartBarIcon className="w-10 h-10 text-primary/75" />
          <div>
            <h2 className="text-base-content font-bold mb-2 text-3xl">
              Lab<span className="text-primary">Test</span>
            </h2>
            <p className="text-sm text-base-content">Crie e gerencie seus testes personalizados para avaliar o desempenho do robô.</p>
          </div>
        </div>
        <ModalLabTest />
      </section>

      <TestTabs active={activeTab} onChange={setActiveTab} />
      <div className="flex justify-end mb-4">
        <ModalResultForm ref={modalResultFormRef} />
      </div>

      {activeTab === "tests" && (
        <>
          <section className="flex flex-col sm:flex-row gap-4 mb-4 items-start sm:items-center">
            <input type="text" className="input input-bordered w-full sm:w-64 flex-1 py-2" placeholder="Buscar teste por nome..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <select className="select select-bordered w-full sm:w-52" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="all">Todos os tipos</option>
              {Object.entries(testTypes).map(([id, name]) => (
                <option key={id} value={id}>
                  {name as string}
                </option>
              ))}
            </select>
            <select className="select select-bordered w-full sm:w-52" value={order} onChange={(e) => setOrder(e.target.value as "desc" | "asc")}>
              <option value="desc">Mais recentes primeiro</option>
              <option value="asc">Mais antigos primeiro</option>
            </select>
          </section>

          {loading ? <Loader /> : <TestList tests={filteredTests} testTypes={testTypes} missionsData={missionsData} loading={loading} onAddResult={(id) => modalResultFormRef.current?.openWithTest(id)} onRename={handleRename} onDelete={handleDelete} />}
        </>
      )}

      {activeTab === "results" && (
        <>
          <section className="flex flex-col sm:flex-row gap-4 mb-4 items-start sm:items-center">
            <input type="text" className="input input-bordered w-full sm:w-64 flex-1" placeholder="Buscar resultado por nome..." value={searchResultText} onChange={(e) => setSearchResultText(e.target.value)} />
            <select className="select select-bordered w-full sm:w-52" value={selectedResultType} onChange={(e) => setSelectedResultType(e.target.value)}>
              <option value="all">Todos os tipos</option>
              {Object.entries(testTypes).map(([id, name]) => (
                <option key={id} value={id}>
                  {name as string}
                </option>
              ))}
            </select>

            <select className="select select-bordered w-full sm:w-52" value={resultOrder} onChange={(e) => setResultOrder(e.target.value as "desc" | "asc")}>
              <option value="desc">Mais recentes primeiro</option>
              <option value="asc">Mais antigos primeiro</option>
            </select>
          </section>

          <ResultsList tests={filteredResults} testTypes={testTypes} />
        </>
      )}

      <ModalConfirm ref={modalConfirmRef} title="Confirmação" />
      <ModalInput ref={modalInputRef} title="Renomear Teste" placeholder="Digite o novo nome..." />
    </div>
  );
}
