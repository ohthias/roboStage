"use client";
import React, { useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import TestResultsCharts from "../components/TestResultsCharts";
import { useResults } from "@/hooks/useResults";
import { useLabTests } from "@/hooks/useLabTests";
import ExportResultsPDF from "../components/ExportButton";

export default function LabTestResultsExtended() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const { results } = useResults(id);
  const { tests } = useLabTests();
  const test = tests.find((t) => t.id === id);

  const chartRef = useRef<HTMLDivElement>(null);

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
    <div className="px-6 py-4">
      <button
        onClick={() => router.push("/dashboard#labtest")}
        className="btn btn-accent btn-outline btn-sm mb-4"
      >
        Voltar
      </button>

      <div className="grid grid-cols-1 gap-6">
        <h1 className="text-4xl font-bold mb-4 text-center">
          Resultados do Teste: {test?.name_test}
        </h1>

        {/* 👇 tudo que será exportado precisa estar dentro desse div com ref */}
        <div ref={chartRef} className="card p-4">
          <h2 className="font-semibold mb-2">Visão Completa</h2>
          <p className="text-sm text-base-content/70 mb-4">
            Detalhamento dos resultados registrados para esse teste, com
            descrições e histórico de envios.
          </p>
          <TestResultsCharts testId={id} />
        </div>
      </div>

      <ExportResultsPDF
        testId={id}
        chartRef={chartRef as React.RefObject<HTMLDivElement>}
        testTitle={test?.name_test}
        logoSrc="/images/logos/Icone.png"
      />
    </div>
  );
}
