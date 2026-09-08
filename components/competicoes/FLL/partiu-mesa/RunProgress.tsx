"use client";

import { Check, X, ArrowRight, Circle } from "lucide-react";
import type { MissionAttempt } from "@/utils/competitions/fll/partiu-mesa/types";

interface RunProgressProps {
  sequence: string[];
  currentIndex: number;
  attempts: MissionAttempt[];
}

export default function RunProgress({ sequence, currentIndex, attempts }: RunProgressProps) {
  const attemptByMission = new Map(attempts.map((a) => [a.missionId, a]));

  return (
    <div className="flex flex-wrap justify-center gap-2" aria-label="Progresso da sequência">
      {sequence.map((missionId, index) => {
        const attempt = attemptByMission.get(missionId);
        const isCurrent = index === currentIndex && !attempt;

        let icon = <Circle className="w-3.5 h-3.5" aria-hidden="true" />;
        let colorClass = "text-base-content/40";
        let statusLabel = "pendente";

        if (attempt?.result === "success") {
          icon = <Check className="w-3.5 h-3.5" aria-hidden="true" />;
          colorClass = "text-success";
          statusLabel = "sucesso";
        } else if (attempt?.result === "failure") {
          icon = <X className="w-3.5 h-3.5" aria-hidden="true" />;
          colorClass = "text-error";
          statusLabel = "falha";
        } else if (attempt?.result === "skipped") {
          icon = <Circle className="w-3.5 h-3.5" aria-hidden="true" />;
          colorClass = "text-base-content/30";
          statusLabel = "não executada";
        } else if (isCurrent) {
          icon = <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />;
          colorClass = "text-primary";
          statusLabel = "atual";
        }

        return (
          <span
            key={`${missionId}-${index}`}
            className={`inline-flex items-center gap-1 text-xs font-mono ${colorClass}`}
            title={`${missionId}: ${statusLabel}`}
          >
            {missionId}
            {icon}
          </span>
        );
      })}
    </div>
  );
}
