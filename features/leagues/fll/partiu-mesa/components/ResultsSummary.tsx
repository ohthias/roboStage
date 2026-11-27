"use client";

import { ChunkyProgress, InfoTile, InlineAlert, cn } from "@/components/stage";
import type { MissionTimerResult } from "@/features/leagues/fll/partiu-mesa/lib/types";
import { formatDurationMs } from "@/features/leagues/fll/partiu-mesa/lib/calculations";

interface ResultsSummaryProps {
  result: MissionTimerResult;
}

export default function ResultsSummary({ result }: ResultsSummaryProps) {
  const rates = [
    { label: "Taxa de sucesso", value: `${result.successRate}%`, cls: "text-success" },
    { label: "Taxa de falha", value: `${result.failureRate}%`, cls: "text-error" },
    { label: "Pontuação obtida", value: result.score !== undefined ? `${result.score} pts` : "—", cls: "text-primary" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="stage-kicker text-base-content/45">/ RESULTADO · {result.seasonName}</p>
        <h2 className="stage-display mt-2 text-3xl">
          Resultado do{" "}
          <span className="inline-block -rotate-1 bg-primary px-2 italic text-primary-content">treino</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <InfoTile label="Tempo total" value={formatDurationMs(result.effectiveDurationMs)} />
        <InfoTile label="Missões" value={result.totalMissions} />
        <InfoTile label="Sucessos" value={<span className="text-success">{result.successes}</span>} />
        <InfoTile label="Falhas" value={<span className="text-error">{result.failures}</span>} />
        <InfoTile label="Não executadas" value={result.skipped} className="col-span-2 sm:col-span-1" />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {rates.map(({ label, value, cls }) => (
          <div key={label} className="rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50">{label}</p>
            <p className={cn("stage-display mt-1 text-3xl tabular-nums", cls)}>{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-base-300 bg-base-100 px-4 py-3">
        <ChunkyProgress value={result.consistency} label="Consistência" />
        <p className="mt-2 text-xs text-base-content/60">
          {result.successes} de {result.executed} lançamentos concluídos com sucesso.
        </p>
      </div>

      <InlineAlert type="info">{result.summaryText}</InlineAlert>
    </div>
  );
}
