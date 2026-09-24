"use client";

// ---------------------------------------------------------------------------
// /dashboard/labtest/[id]/execute
// Página dedicada (não modal) para registrar uma execução do teste e enviar
// ao banco via createTestExecution. Carrega o mesmo pacote de dados que a
// tela de visualização (getLabTestViewData) para saber quais campos exibir —
// no CalibraBot · Motores isso já inclui rotação/tempo por motor; no
// Personalizado, os parâmetros definidos na criação do teste.
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { FieldDefinition } from "@/types/labtest.types";
import ExecuteTestForm from "@/components/labtest/ExecuteTestForm";
import { getLabTestViewData } from "../../actions";

export default function ExecuteTestPage() {
  const params = useParams();
  const testId = String(params.id ?? "");

  const [test, setTest] = useState<any>(null);
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [nextExecutionNumber, setNextExecutionNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!testId) return;

    let active = true;
    setLoading(true);
    setError(null);

    getLabTestViewData(testId)
      .then((data) => {
        if (!active) return;
        setTest(data.test);
        setFields(data.fields);
        setNextExecutionNumber(data.nextExecutionNumber);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Erro ao carregar o teste.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [testId]);

  return (
    <div className="min-h-screen bg-base-200/40 px-4 py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Link
          href={`/dashboard/labtest/${testId}`}
          className="flex w-fit items-center gap-1.5 text-sm text-base-content/50 hover:text-base-content"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para o teste
        </Link>

        {loading ? (
          <div className="flex items-center justify-center rounded-3xl border border-base-content/10 bg-base-100 p-10">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : error || !test ? (
          <div className="rounded-3xl border border-error/20 bg-base-100 p-6">
            <p className="font-semibold text-error">Não foi possível carregar o teste.</p>
            <p className="mt-2 text-sm text-base-content/60">{error ?? "Teste não encontrado."}</p>
          </div>
        ) : (
          <ExecuteTestForm
            testId={test.id}
            mode={test.mode}
            testName={test.name}
            fields={fields}
            nextExecutionNumber={nextExecutionNumber}
          />
        )}
      </div>
    </div>
  );
}
