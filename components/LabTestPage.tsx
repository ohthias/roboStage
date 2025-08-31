"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import ModalLabTest from "./ui/Modal/ModalLabTest";
import ModalResultForm from "./ResultForm";

export default function LabTestPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [testTypes, setTestTypes] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTypesAndTests = async () => {
      setLoading(true);

      // Buscar tipos de teste
      const { data: typesData, error: typesError } = await supabase
        .from("test_types")
        .select("*");
      if (typesError) {
        console.error("Erro ao buscar tipos de teste:", typesError);
      } else {
        const typesMap: Record<string, string> = {};
        typesData?.forEach((t: any) => (typesMap[t.id] = t.name));
        setTestTypes(typesMap);
      }

      // Buscar testes
      const { data: testsData, error: testsError } = await supabase
        .from("tests")
        .select("*");
      if (testsError) {
        console.error("Erro ao buscar testes:", testsError);
      } else {
        setTests(testsData || []);
      }

      setLoading(false);
    };

    fetchTypesAndTests();
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

      <div className="flex items-center justify-between gap-2 mb-4">
        <div role="tablist" className="tabs tabs-border my-2">
          <button role="tab" className="tab tab-active">
            Testes
          </button>
          <button role="tab" className="tab">
            Resultados
          </button>
        </div>
        <ModalResultForm />
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading && <p>Carregando testes...</p>}

        {!loading && tests.length === 0 && (
          <h2 className="text-center text-primary text-lg font-bold mt-4 col-span-full">
            Nenhum teste criado ainda!
          </h2>
        )}

        {!loading &&
          tests.map((test) => (
            <div
              key={test.id}
              className="card bg-base-100 shadow-md border border-base-300"
            >
              <div className="card-body">
                <h3 className="card-title text-lg font-bold">
                  {test.name_test}
                </h3>
                <p className="text-sm text-base-content">
                  Tipo: {testTypes[test.type_id] || "Desconhecido"}
                </p>
                <p className="text-xs text-base-content mt-1">
                  Criado em: {new Date(test.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
      </section>
    </div>
  );
}
