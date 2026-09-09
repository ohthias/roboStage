"use client";

import { CheckCircle2 } from "lucide-react";

interface ProgressSummaryProps {
  done: number;
  total: number;
  percent: number;
}

export default function ProgressSummary({ done, total, percent }: ProgressSummaryProps) {
  const complete = total > 0 && done === total;

  return (
    <div className="flex flex-col gap-1">
      <progress
        className={`progress w-full ${complete ? "progress-success" : "progress-primary"}`}
        value={percent}
        max={100}
        aria-label={`Progresso: ${done} de ${total} concluídos`}
      />
      <div className="flex items-center justify-between text-xs text-base-content/70">
        <span>
          {done} de {total} concluídos
        </span>
        {complete && (
          <span className="inline-flex items-center gap-1 font-medium text-success">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Tudo certo!
          </span>
        )}
      </div>
    </div>
  );
}
