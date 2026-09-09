"use client";

import type { MissionTimerResult } from "@/utils/competitions/fll/partiu-mesa/types";
import { formatDurationMs } from "@/utils/competitions/fll/partiu-mesa/calculations";

interface ResultsSummaryProps {
  result: MissionTimerResult;
}

export default function ResultsSummary({ result }: ResultsSummaryProps) {
  const consistencyBlocks = Math.round(result.consistency / 10);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Resultado do treino</h2>

      <div className="stats stats-vertical sm:stats-horizontal shadow w-full mb-6">
        <div className="stat">
          <div className="stat-title">Tempo total</div>
          <div className="stat-value text-lg">{formatDurationMs(result.effectiveDurationMs)}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Missões</div>
          <div className="stat-value text-lg">{result.totalMissions}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Sucessos</div>
          <div className="stat-value text-lg text-success">{result.successes}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Falhas</div>
          <div className="stat-value text-lg text-error">{result.failures}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Não executadas</div>
          <div className="stat-value text-lg">{result.skipped}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card bg-base-200">
          <div className="card-body py-4">
            <span className="text-sm text-base-content/60">Taxa de sucesso</span>
            <span className="text-3xl font-bold text-success">{result.successRate}%</span>
          </div>
        </div>
        <div className="card bg-base-200">
          <div className="card-body py-4">
            <span className="text-sm text-base-content/60">Taxa de falha</span>
            <span className="text-3xl font-bold text-error">{result.failureRate}%</span>
          </div>
        </div>
        <div className="card bg-base-200">
          <div className="card-body py-4">
            <span className="text-sm text-base-content/60">Pontuação obtida</span>
            <span className="text-3xl font-bold text-primary">
              {result.score !== undefined ? `${result.score} pts` : "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Consistência</h3>
        <div className="flex items-center gap-3">
          <progress
            className="progress progress-primary w-full"
            value={result.consistency}
            max={100}
            aria-label={`Consistência: ${result.consistency}%`}
          />
          <span className="font-mono text-sm w-12 text-right">{result.consistency}%</span>
        </div>
        <p className="text-sm text-base-content/60 mt-1">
          {result.successes} de {result.executed} lançamentos concluídos com sucesso.
        </p>
        <span className="sr-only">{consistencyBlocks} de 10 blocos preenchidos</span>
      </div>

      <div className="alert bg-base-200 mb-2">
        <span className="text-sm">{result.summaryText}</span>
      </div>
    </div>
  );
}
