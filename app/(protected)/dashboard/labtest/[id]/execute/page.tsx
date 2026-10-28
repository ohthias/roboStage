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
import FllRoundExecution from "@/components/labtest/FllRoundExecution";
import FutureEditionMatch from "@/components/labtest/future-edition/FutureEditionMatch";
import { getMatchDuration, isFutureEditionConfig } from "@/utils/labtest/future-edition";
import ObrRoundExecution from "@/components/labtest/obr/ObrRoundExecution";
import { getObrArena, isObrConfig } from "@/utils/labtest/obr";
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
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 md:px-8">
      <Link
        href={`/dashboard/labtest/${testId}`}
        className="group mb-4 inline-flex items-center gap-1.5 text-sm text-base-content/55 hover:text-base-content"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        {test?.name ?? "Voltar ao teste"}
      </Link>

      {loading ? (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Carregando teste">
          <div className="h-4 w-40 animate-pulse rounded bg-base-300/70" />
          <div className="h-8 w-72 animate-pulse rounded bg-base-300/70" />
          <div className="mt-4 h-64 animate-pulse rounded-tl-3xl rounded-br-3xl bg-base-300/50" />
        </div>
      ) : error || !test ? (
        <div className="rounded-tl-3xl rounded-br-3xl border border-error/40 bg-base-100 p-6">
          <p className="font-semibold text-error">Não foi possível carregar o teste.</p>
          <p className="mt-2 text-sm text-base-content/60">{error ?? "Teste não encontrado."}</p>
        </div>
      ) : isObrConfig(test.config) ? (
        <ObrRoundExecution
          testId={test.id}
          testName={test.name}
          nextExecutionNumber={nextExecutionNumber}
          arena={getObrArena(test.config)}
        />
      ) : isFutureEditionConfig(test.config) ? (
        <FutureEditionMatch
          testId={test.id}
          testName={test.name}
          nextExecutionNumber={nextExecutionNumber}
          durationSec={getMatchDuration(test.config)}
        />
      ) : test.mode === "runs" &&
        test.config?.runMode === "round" &&
        test.season ? (
        <FllRoundExecution
          testId={test.id}
          testName={test.name}
          season={test.season}
          missionIds={
            Array.isArray(test.config?.missions)
              ? test.config.missions.filter(
                  (m: unknown): m is string => typeof m === "string",
                )
              : []
          }
          nextExecutionNumber={nextExecutionNumber}
        />
      ) : (
        <ExecuteTestForm
          testId={test.id}
          mode={test.mode}
          season={test.season}
          testName={test.name}
          fields={fields}
          nextExecutionNumber={nextExecutionNumber}
          isMotorPairs={test.config?.modo === "duplas"}
          config={test.config}
        />
      )}
    </div>
  );
}
