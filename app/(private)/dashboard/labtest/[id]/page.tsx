"use client";
import React, { useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import TestResultsCharts from "../components/TestResultsCharts";
import { useLabTests } from "@/hooks/useLabTests";
import ExportResultsPDF from "../components/ExportButton";
import LabTestResultsNavbar from "../components/LabTestResultsNavbar";

export default function LabTestResultsExtended() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
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
      <LabTestResultsNavbar />

      <div className="grid grid-cols-1 gap-6">
        <h1 className="text-4xl font-bold mb-4 text-center">
          Resultados do Teste: {test?.name_test}
        </h1>

        <div ref={chartRef} className="card p-4">
          <h2 className="font-semibold mb-2">Visão Completa</h2>
          <p className="text-sm text-base-content/70 mb-4">
            Detalhamento dos resultados registrados para esse teste, com
            descrições e histórico de envios.
          </p>
          <TestResultsCharts testId={id} typeTest={test?.type_id || ""} />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
      </div>
    </div>
  );
}
