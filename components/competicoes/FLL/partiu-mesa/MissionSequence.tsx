"use client";

import { ArrowUp, ArrowDown, X } from "lucide-react";
import type { Mission } from "@/utils/competitions/fll/partiu-mesa/types";

interface MissionSequenceProps {
  sequence: string[];
  missionsById: Map<string, Mission>;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRemove: (index: number) => void;
}

export default function MissionSequence({
  sequence,
  missionsById,
  onMoveUp,
  onMoveDown,
  onRemove,
}: MissionSequenceProps) {
  if (sequence.length === 0) {
    return (
      <div className="text-sm text-base-content/60">
        Selecione ao menos uma missão para montar sua sequência.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Sua sequência</h2>
      <ol className="space-y-2">
        {sequence.map((missionId, index) => {
          const mission = missionsById.get(missionId);
          return (
            <li
              key={`${missionId}-${index}`}
              className="flex items-center gap-3 card card-compact border border-base-300 px-3 py-2 bg-base-200/20 hover:bg-base-200 transition-colors"
            >
              <span className="font-mono text-sm text-base-content/60 w-6">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="badge badge-neutral badge-sm">{missionId}</span>
              <span className="flex-1 truncate text-sm">{mission?.name ?? "Missão"}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-circle"
                  title={`Mover ${missionId} para cima`}
                  aria-label={`Mover ${missionId} para cima`}
                  disabled={index === 0}
                  onClick={() => onMoveUp(index)}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-circle"
                  title={`Mover ${missionId} para baixo`}
                  aria-label={`Mover ${missionId} para baixo`}
                  disabled={index === sequence.length - 1}
                  onClick={() => onMoveDown(index)}
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-circle text-error"
                  title={`Remover ${missionId} da sequência`}
                  aria-label={`Remover ${missionId} da sequência`}
                  onClick={() => onRemove(index)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
