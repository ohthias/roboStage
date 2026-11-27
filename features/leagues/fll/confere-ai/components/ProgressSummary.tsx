"use client";

import { CheckCircle2 } from "lucide-react";
import { ChunkyProgress } from "@/components/stage";

interface ProgressSummaryProps {
  done: number;
  total: number;
  percent: number;
}

export default function ProgressSummary({ done, total, percent }: ProgressSummaryProps) {
  const complete = total > 0 && done === total;

  return (
    <div className="flex flex-col gap-1.5">
      <ChunkyProgress
        value={percent}
        tone={complete ? "success" : "primary"}
        showValue={false}
        label={<span className="sr-only">Progresso: {done} de {total} concluídos</span>}
      />
      <div className="flex items-center justify-between text-[11px] text-base-content/60">
        <span className="font-mono">
          {done}/{total} concluídos
        </span>
        {complete && (
          <span className="inline-flex items-center gap-1 font-semibold text-success">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Tudo certo!
          </span>
        )}
      </div>
    </div>
  );
}
