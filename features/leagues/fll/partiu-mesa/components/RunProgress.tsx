"use client";

import { ArrowRight, Check, Circle, X } from "lucide-react";
import { cn } from "@/components/stage";
import type { MissionAttempt } from "@/features/leagues/fll/partiu-mesa/lib/types";

interface RunProgressProps {
  sequence: string[];
  currentIndex: number;
  attempts: MissionAttempt[];
}

export default function RunProgress({ sequence, currentIndex, attempts }: RunProgressProps) {
  const attemptByMission = new Map(attempts.map((a) => [a.missionId, a]));

  return (
    <ol className="flex flex-wrap justify-center gap-1.5" aria-label="Progresso da sequência">
      {sequence.map((missionId, index) => {
        const attempt = attemptByMission.get(missionId);
        const isCurrent = index === currentIndex && !attempt;

        let icon = <Circle className="size-3" aria-hidden="true" />;
        let cls = "border-base-300 text-base-content/45";
        let statusLabel = "pendente";

        if (attempt?.result === "success") {
          icon = <Check className="size-3" aria-hidden="true" />;
          cls = "border-success/30 bg-success/10 text-success";
          statusLabel = "sucesso";
        } else if (attempt?.result === "failure") {
          icon = <X className="size-3" aria-hidden="true" />;
          cls = "border-error/30 bg-error/10 text-error";
          statusLabel = "falha";
        } else if (attempt?.result === "skipped") {
          cls = "border-dashed border-base-300 text-base-content/30";
          statusLabel = "não executada";
        } else if (isCurrent) {
          icon = <ArrowRight className="size-3" aria-hidden="true" />;
          cls = "border-primary bg-primary text-primary-content";
          statusLabel = "atual";
        }

        return (
          <li
            key={`${missionId}-${index}`}
            className={cn("inline-flex h-6 items-center gap-1 rounded-md border px-1.5 font-mono text-[11px] font-semibold", cls)}
            title={`${missionId}: ${statusLabel}`}
          >
            {missionId}
            {icon}
            <span className="sr-only">{statusLabel}</span>
          </li>
        );
      })}
    </ol>
  );
}
