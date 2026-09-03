"use client";
import { MissionObjective, MissionValue } from "@/app/(public)/[competicao]/(fll)/future-edition/score/scoring.type";

interface ObjectiveControlProps {
  objective: MissionObjective;
  value: MissionValue | undefined;
  score: number;
  onChange: (value: MissionValue) => void;
}

export default function ObjectiveControl({ objective, value, score, onChange }: ObjectiveControlProps) {
  const counterValue = typeof value === "number" ? value : objective.min ?? 0;

  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-base-300 last:border-b-0">
      <div className="flex-1">
        <p className="text-sm font-medium">{objective.label}</p>

        {objective.type === "toggle" && (
          <label className="flex items-center gap-2 mt-1 cursor-pointer w-fit">
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={value === true}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span className="text-xs text-base-content/60">{objective.points} pts</span>
          </label>
        )}

        {objective.type === "counter" && (
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              className="btn btn-xs btn-circle btn-outline rounded-full"
              onClick={() => onChange(Math.max(counterValue - 1, objective.min ?? 0))}
            >
              -
            </button>
            <span className="w-8 text-center font-bold">{counterValue}</span>
            <button
              type="button"
              className="btn btn-xs btn-circle btn-outline rounded-full"
              onClick={() => onChange(Math.min(counterValue + 1, objective.max ?? Infinity))}
            >
              +
            </button>
            <span className="text-xs text-base-content/60">
              x {objective.pointsPerUnit} pts
              {objective.max !== undefined ? ` (máx. ${objective.max})` : ""}
            </span>
          </div>
        )}

        {objective.type === "select" && (
          <div className="flex flex-wrap gap-2 mt-1">
            {objective.options?.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange(opt.id)}
                className={`px-2 py-1 rounded-md border text-xs font-semibold transition ${
                  value === opt.id
                    ? "bg-primary text-primary-content border-primary"
                    : "border-base-300 hover:border-primary"
                }`}
              >
                {opt.label} · {opt.points} pts
              </button>
            ))}
          </div>
        )}
      </div>

      <span className="text-lg font-black text-primary/70 shrink-0">{score}</span>
    </div>
  );
}