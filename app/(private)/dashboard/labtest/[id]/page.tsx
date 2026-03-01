"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useLabTests } from "@/hooks/useLabTests";
import TestResultsCharts from "../components/TestResultsCharts";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";

export default function LabTestResultsExtended() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { tests } = useLabTests();
  const test = tests.find((t) => t.id === id);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    const updateLastAccess = async () => {
      await supabase
        .from("tests")
        .update({ last_acess: new Date().toISOString() })
        .eq("id", id);
    };

    updateLastAccess();
  }, [id]);

  if (!id) {
    router.push("/dashboard/labtest");
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200">
      <header className="relative overflow-hidden bg-gradient-to-br from-base-100 to-base-300 text-base-content rounded-3xl mb-8">
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <nav className="mb-4 text-sm flex items-center gap-2 opacity-85">
            <span>Dashboard</span>
            <span className="opacity-50">/</span>
            <Link
              href="/dashboard/labtest"
              className="hover:underline hover:opacity-100 transition"
            >
              LabTest
            </Link>
            <span className="opacity-50">/</span>
            <span className="font-medium">Resultados</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {test?.name_test}
          </h1>
          <p className="mt-3 max-w-2xl text-base md:text-lg opacity-90">
            Análise detalhada de desempenho, consistência e confiabilidade do
            robô
          </p>
        </div>
      </header>

      {/* Conteúdo */}
      <main>
        <div ref={chartRef} className="bg-base-100 rounded-2xl shadow-xl p-6">
          <TestResultsCharts testId={id} typeTest={test?.type_id || ""} />
        </div>
      </main>
    </div>
  );
}
