"use client";

import { Check, X, Minus } from "lucide-react";
import type { MissionAttempt } from "@/utils/competitions/fll/partiu-mesa/types";

interface LaunchHistoryProps {
  attempts: MissionAttempt[];
}

function resultBadge(result: MissionAttempt["result"]) {
  if (result === "success") {
    return (
      <span className="badge badge-success gap-1">
        <Check className="w-3 h-3" /> Sucesso
      </span>
    );
  }
  if (result === "failure") {
    return (
      <span className="badge badge-error gap-1">
        <X className="w-3 h-3" /> Falha
      </span>
    );
  }
  return (
    <span className="badge badge-ghost gap-1">
      <Minus className="w-3 h-3" /> Não executada
    </span>
  );
}

function durationLabel(attempt: MissionAttempt): string {
  return attempt.durationMs !== undefined ? `${Math.round(attempt.durationMs / 1000)}s` : "—";
}

export default function LaunchHistory({ attempts }: LaunchHistoryProps) {
  if (attempts.length === 0) {
    return <p className="text-sm text-base-content/60">Nenhum lançamento registrado.</p>;
  }

  return (
    <div>
      <h3 className="font-semibold mb-3">Lançamentos</h3>

      {/* Desktop / tablet: tabela */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>#</th>
              <th>Missão</th>
              <th>Resultado</th>
              <th>Tempo</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((attempt, index) => (
              <tr key={attempt.id}>
                <td>{index + 1}</td>
                <td className="font-mono">{attempt.missionId}</td>
                <td>{resultBadge(attempt.result)}</td>
                <td>{durationLabel(attempt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards compactos */}
      <ul className="sm:hidden space-y-2">
        {attempts.map((attempt, index) => (
          <li key={attempt.id} className="card bg-base-200">
            <div className="card-body py-3 flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-base-content/50">#{index + 1}</span>
                <span className="font-mono font-medium">{attempt.missionId}</span>
              </div>
              <div className="flex items-center gap-2">
                {resultBadge(attempt.result)}
                <span className="text-xs text-base-content/60">{durationLabel(attempt)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
