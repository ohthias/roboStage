import type { ReactNode } from "react";
import { Stepper, cn } from "@/components/stage";

/** Opção de resposta do pontuador (Stage UI: canto recortado, ativo com sombra dura). */
export function ScoreOption({ active, onClick, children, square }: { active: boolean; onClick: () => void; children: ReactNode; square?: boolean }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 select-none items-center justify-center rounded-tl-lg rounded-br-lg border text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        square ? "min-w-9 px-2 font-mono tabular-nums" : "px-3.5",
        active
          ? "stage-shadow-sm -translate-y-px border-transparent bg-secondary text-secondary-content"
          : "border-base-300 bg-base-100 hover:border-secondary/40 hover:text-secondary",
      )}
    >
      {children}
    </button>
  );
}

/** Até 6 valores: botões (um toque e a resposta fica explícita). Mais que isso: contador − n +. */
export function RangeInput({ missionId, index, start = 0, end = 10, value, onSelect }: RangeInputProps) {
  const count = end - start + 1;
  const isCountdown = missionId === "PT";

  if (count > 6 && !isCountdown) {
    return (
      <Stepper
        value={start + (value ?? 0)}
        min={start}
        max={end}
        onChange={(v) => onSelect(missionId, index, v - start)}
        label="Quantidade"
      />
    );
  }

  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {Array.from({ length: count }, (_, valueIndex) => {
        return (
          <ScoreOption
            key={`${missionId}-range-${index}-${valueIndex}`}
            square
            active={value !== undefined && value === valueIndex}
            onClick={() => onSelect(missionId, index, valueIndex)}
          >
            {start + valueIndex}
          </ScoreOption>
        );
      })}
    </div>
  );
}
