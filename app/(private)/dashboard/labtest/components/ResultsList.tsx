"use client";
import React from "react";
import { BeakerIcon } from "@heroicons/react/24/outline";
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

  if (!tests || tests.length === 0) {
    return (
      <div className="col-span-full flex flex-col justify-center items-center p-6 border border-base-300 rounded-lg bg-base-100 shadow-md">
        <BeakerIcon className="w-12 h-12 text-gray-400 mb-2" />
        <h2 className="text-center text-lg font-bold text-gray-500">Nenhum resultado encontrado!</h2>
        <p className="text-center text-sm text-gray-400 mt-1">Ajuste os filtros ou aguarde novos resultados.</p>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-6">
      {tests.map((test) => (
        <div key={test.id} className="collapse collapse-arrow bg-base-100 shadow-md border border-base-300">
          <input type="checkbox" className="peer" />
          <div className="collapse-title text-xl font-bold flex flex-col gap-1">
            <span>{test.name_test}</span>
          </div>
          <div className="collapse-content">
            <TestResultsCharts testId={test.id} />
          </div>
          <div className="collapse-footer py-2 px-4 border-t border-base-300 flex justify-between items-center">
            <span className="text-sm font-normal text-base-content">
              Tipo: {(testTypes[test.type_id] || "Desconhecido").toUpperCase()} | Criado em:{" "}
              {new Date(test.created_at).toLocaleDateString("pt-BR")}
            </span>
            <button
              className="btn btn-primary btn-outline btn-sm"
              onClick={() => router.push(`/dashboard/labtest/${test.id}`)}
            >
              Ampliar Resultados
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}
