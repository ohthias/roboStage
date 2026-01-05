"use client";
import React, { useState } from "react";
import { ArrowDown, ArrowUp, Beaker, Clock, Expand } from "lucide-react";
import { useRouter } from "next/navigation";
import TestResultsCharts from "./TestResultsCharts";

export default function ResultsList({
  tests,
  testTypes,
}: {
  tests: any[];
  testTypes: Record<string, string>;
}) {
  const router = useRouter();

  // Estado centralizado (CORRETO)
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!tests || tests.length === 0) {
    return (
      <div className="col-span-full flex flex-col justify-center items-center p-8 border border-base-300 rounded-2xl bg-base-100 shadow-sm">
        <Beaker className="w-14 h-14 text-base-300 mb-3" />
        <h2 className="text-lg font-semibold text-base-content/60">
          Nenhum resultado disponível
        </h2>
        <p className="text-sm text-base-content/40 text-center mt-1 max-w-sm">
          Execute novos testes ou ajuste os filtros para visualizar os
          resultados.
        </p>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-5">
      {tests.map((test) => {
        const isExpanded = expandedId === test.id;
        const testTypeLabel = testTypes[test.type_id] || "Desconhecido";

        return (
          <div
            key={test.id}
            className="bg-base-100 border border-base-300 rounded-2xl shadow-sm overflow-hidden"
          >
            {/* Header clicável */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : test.id)}
              className="w-full px-5 py-4 flex items-start justify-between text-left hover:bg-base-200/40 transition-colors"
            >
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">{test.name_test}</h3>
                <span className="badge badge-outline badge-sm w-fit">
                  {testTypeLabel.toUpperCase()}
                </span>
              </div>

              <div>
                {isExpanded ? (
                  <ArrowUp className="w-5 h-5 opacity-70" />
                ) : (
                  <ArrowDown className="w-5 h-5 opacity-70" />
                )}
              </div>
            </button>

            {/* Conteúdo */}
            {isExpanded && (
              <div className="px-5 py-4 transition-all duration-300 ease-in-out">
                <div className="rounded-xl border border-base-200 bg-base-200/40 p-4">
                  <TestResultsCharts
                    testId={test.id}
                    typeTest={testTypeLabel}
                  />
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center px-5 py-3 border-t border-base-300">
              <div className="flex items-center gap-2 text-xs opacity-60">
                <Clock className="w-4 h-4" />
                {new Date(test.created_at).toLocaleDateString("pt-BR")}
              </div>

              <button
                className="btn btn-primary btn-outline btn-sm gap-2"
                onClick={() => router.push(`/dashboard/labtest/${test.id}`)}
              >
                <Expand className="w-4 h-4" />
                Ampliar análise
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}
