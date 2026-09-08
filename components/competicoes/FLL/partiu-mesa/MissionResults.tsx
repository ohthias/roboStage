"use client";

import { Check, X, AlertTriangle } from "lucide-react";
import type { Mission, MissionTimerResult } from "@/utils/competitions/fll/partiu-mesa/types";

interface MissionResultsProps {
  result: MissionTimerResult;
  missionsById: Map<string, Mission>;
}

export default function MissionResults({ result, missionsById }: MissionResultsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold mb-3">Análise por missão</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.missionStats.map((stat) => {
            const mission = missionsById.get(stat.missionId);
            return (
              <div key={stat.missionId} className="card bg-base-200">
                <div className="card-body py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-neutral badge-sm">{stat.missionId}</span>
                      <span className="text-sm font-medium truncate">{mission?.name}</span>
                    </div>
                    {stat.isFirstFailure && (
                      <span className="badge badge-error badge-outline badge-sm gap-1">
                        <AlertTriangle className="w-3 h-3" /> 1ª falha
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-base-content/60 mt-1">
                    {stat.attempts} tentativa{stat.attempts !== 1 ? "s" : ""} · {stat.successRate}% sucesso
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Sequência</h3>
        <div className="flex flex-wrap items-center gap-2">
          {result.attempts.map((attempt, index) => (
            <span key={attempt.id} className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 badge ${
                  attempt.result === "success"
                    ? "badge-success"
                    : attempt.result === "failure"
                      ? "badge-error"
                      : "badge-ghost"
                }`}
              >
                {attempt.missionId}
                {attempt.result === "success" && <Check className="w-3 h-3" />}
                {attempt.result === "failure" && <X className="w-3 h-3" />}
              </span>
              {index < result.attempts.length - 1 && <span className="text-base-content/40">→</span>}
            </span>
          ))}
        </div>

        <div className="mt-3 space-y-1 text-sm">
          {result.firstFailureMissionId && (
            <p>
              <span className="text-base-content/60">Primeira falha:</span>{" "}
              <span className="font-medium">{result.firstFailureMissionId}</span>
            </p>
          )}
          {result.mostInconsistentMissionIds.length > 0 && (
            <p>
              <span className="text-base-content/60">
                Missão{result.mostInconsistentMissionIds.length > 1 ? "ões" : ""} mais inconsistente
                {result.mostInconsistentMissionIds.length > 1 ? "s" : ""}:
              </span>{" "}
              <span className="font-medium">{result.mostInconsistentMissionIds.join(", ")}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
