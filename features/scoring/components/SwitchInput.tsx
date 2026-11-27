import { Check, X } from "lucide-react";
import { cn } from "@/components/stage";
import { ScoreOption } from "./RangeInput";

const yesNo =
  "inline-flex h-9 items-center gap-1 rounded-tl-lg rounded-br-lg border px-3.5 text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function SwitchInput({ missionId, index, options, value, onSelect }: SwitchInputProps) {
  // Sem rótulos próprios: Sim/Não (índice 1 = Sim, 0 = Não), como no MissionScorer da Stage UI.
  if (!options?.length) {
    return (
      <div className="flex flex-wrap gap-2" role="radiogroup">
        <button
          type="button"
          role="radio"
          aria-checked={value === 0}
          onClick={() => onSelect(missionId, index, 0)}
          className={cn(
            yesNo,
            value === 0
              ? "stage-shadow-sm -translate-y-px border-transparent bg-base-content text-base-100"
              : "border-base-300 bg-base-100 hover:border-base-content/40",
          )}
        >
          <X size={14} strokeWidth={2.5} /> Não
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={value === 1}
          onClick={() => onSelect(missionId, index, 1)}
          className={cn(
            yesNo,
            value === 1
              ? "stage-shadow-sm -translate-y-px border-transparent bg-success text-success-content"
              : "border-base-300 bg-base-100 hover:border-success/50 hover:text-success",
          )}
        >
          <Check size={14} strokeWidth={2.5} /> Sim
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((label, idx) => (
        <ScoreOption key={`${missionId}-switch-${index}-${idx}`} active={value === idx} onClick={() => onSelect(missionId, index, idx)}>
          {label}
        </ScoreOption>
      ))}
    </div>
  );
}
