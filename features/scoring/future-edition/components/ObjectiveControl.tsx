"use client";
import { Check, X } from "lucide-react";
import { Stepper, cn } from "@/components/stage";
import { MissionObjective, MissionValue } from "@/features/scoring/future-edition/types";

interface ObjectiveControlProps {
  objective: MissionObjective;
  value: MissionValue | undefined;
  score: number;
  onChange: (value: MissionValue) => void;
}

const choice =
  "inline-flex h-9 items-center gap-1 rounded-tl-lg rounded-br-lg border px-3.5 text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

// Controles no padrão do MissionScorer da Stage UI: Sim/Não, contador e escolha.
export default function ObjectiveControl({ objective, value, score, onChange }: ObjectiveControlProps) {
  const counterValue = typeof value === "number" ? value : objective.min ?? 0;

  return (
    <div className="space-y-2 border-t border-dashed border-base-300 pt-3 first:border-t-0 first:pt-0">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-snug text-base-content/80">{objective.label}</p>
        <span className={cn("shrink-0 font-mono text-[11px] font-bold", score > 0 ? "text-primary" : "text-base-content/40")}>+{score}</span>
      </div>

      {objective.type === "toggle" && (
        <div className="flex flex-wrap items-center gap-2" role="radiogroup">
          <button
            type="button"
            role="radio"
            aria-checked={value === true}
            onClick={() => onChange(true)}
            className={cn(
              choice,
              value === true
                ? "stage-shadow-sm -translate-y-px border-transparent bg-success text-success-content"
                : "border-base-300 bg-base-100 hover:border-success/50 hover:text-success",
            )}
          >
            <Check size={14} strokeWidth={2.5} /> Sim
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={value === false}
            onClick={() => onChange(false)}
            className={cn(
              choice,
              value === false
                ? "stage-shadow-sm -translate-y-px border-transparent bg-base-content text-base-100"
                : "border-base-300 bg-base-100 hover:border-base-content/40",
            )}
          >
            <X size={14} strokeWidth={2.5} /> Não
          </button>
          <span className="stage-label text-base-content/45">{objective.points} pts</span>
        </div>
      )}

      {objective.type === "counter" && (
        <div className="flex flex-wrap items-center gap-3">
          <Stepper
            value={counterValue}
            min={objective.min ?? 0}
            max={objective.max ?? 99}
            onChange={onChange}
            label={objective.label}
          />
          <span className="stage-label text-base-content/45">
            × {objective.pointsPerUnit} pts{objective.max !== undefined ? ` · máx. ${objective.max}` : ""}
          </span>
        </div>
      )}

      {objective.type === "select" && (
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {objective.options?.map((opt) => {
            const active = value === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange(opt.id)}
                className={cn(
                  choice,
                  active
                    ? "stage-shadow-sm -translate-y-px border-transparent bg-secondary text-secondary-content"
                    : "border-base-300 bg-base-100 hover:border-secondary/40 hover:text-secondary",
                )}
              >
                {opt.label}
                <span className={cn("font-mono text-[11px]", active ? "opacity-80" : "text-base-content/45")}>{opt.points}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
