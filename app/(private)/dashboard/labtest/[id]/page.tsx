"use client";
import React from "react";
import { useRouter, useParams } from "next/navigation";
import TestResultsCharts from "../components/TestResultsCharts";
import { useResults } from "@/hooks/useResults";
import { useLabTests } from "@/hooks/useLabTests";

export default function LabTestResultsExtended() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const { results } = useResults(id);
  const { tests } = useLabTests();
  const test = tests.find((t) => t.id === id);

  if (!id) {
    return (
      <div>
        <button
          onClick={() => router.push("/dashboard#labtest")}
          className="btn btn-accent btn-outline btn-sm mb-4"
        >
          Voltar
        </button>
        <h1>ID do teste não informado</h1>
      </div>
    );
  }

  return (
    <div className="p-4">
      <button
        onClick={() => router.push("/dashboard#labtest")}
        className="btn btn-accent btn-outline btn-sm mb-4"
      >
        Voltar
      </button>
      <h1 className="text-2xl font-bold mb-4">
        Resultados do Teste: {test?.title}
      </h1>

      <div className="grid grid-cols-1 gap-6">
        <div className="card p-4 shadow rounded-lg">
          <h2 className="font-semibold mb-2">Visão Completa</h2>
          <p className="text-sm text-base-content/70 mb-4">
            Detalhamento dos resultados registrados para esse teste, com
            descrições e histórico de envios.
          </p>
          <TestResultsCharts testId={id} />
        </div>
      </div>
    </div>
  );
}
