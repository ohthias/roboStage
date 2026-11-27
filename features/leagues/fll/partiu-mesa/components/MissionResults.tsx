"use client";

import { AlertTriangle, Check, X } from "lucide-react";
import { KeyValue, Panel, ToolBadge, cn } from "@/components/stage";
import type { Mission, MissionTimerResult } from "@/features/leagues/fll/partiu-mesa/lib/types";

interface MissionResultsProps {
  result: MissionTimerResult;
  missionsById: Map<string, Mission>;
}

export default function MissionResults({ result, missionsById }: MissionResultsProps) {
  const notes = [
    result.firstFailureMissionId && { label: "Primeira falha", value: result.firstFailureMissionId },
    result.mostInconsistentMissionIds.length > 0 && {
      label: result.mostInconsistentMissionIds.length > 1 ? "Missões mais inconsistentes" : "Missão mais inconsistente",
      value: result.mostInconsistentMissionIds.join(", "),
    },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Panel title="Análise por missão">
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {result.missionStats.map((stat) => {
            const mission = missionsById.get(stat.missionId);
            return (
              <li key={stat.missionId} className="rounded-md border border-base-300 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <ToolBadge className="font-mono">{stat.missionId}</ToolBadge>
                    <span className="truncate text-[13px] font-semibold">{mission?.name}</span>
                  </div>
                  {stat.isFirstFailure && (
                    <ToolBadge tone="warning">
                      <AlertTriangle className="size-3" /> 1ª falha
                    </ToolBadge>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-base-content/55">
                  {stat.attempts} tentativa{stat.attempts !== 1 ? "s" : ""} · {stat.successRate}% sucesso
                </p>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel title="Sequência">
        <ol className="flex flex-wrap items-center gap-1.5">
          {result.attempts.map((attempt, index) => (
            <li key={attempt.id} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex h-6 items-center gap-1 rounded-md border px-1.5 font-mono text-[11px] font-semibold",
                  attempt.result === "success"
                    ? "border-success/30 bg-success/10 text-success"
                    : attempt.result === "failure"
                      ? "border-error/30 bg-error/10 text-error"
                      : "border-dashed border-base-300 text-base-content/40",
                )}
              >
                {attempt.missionId}
                {attempt.result === "success" && <Check className="size-3" />}
                {attempt.result === "failure" && <X className="size-3" />}
              </span>
              {index < result.attempts.length - 1 && (
                <span aria-hidden="true" className="text-base-content/30">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
        {notes.length > 0 && <KeyValue items={notes} className="mt-3 border-t border-base-300 pt-1" />}
      </Panel>
    </div>
  );
}
