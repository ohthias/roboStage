"use client";

import { ArrowDown, ArrowUp, ListOrdered, X } from "lucide-react";
import { IconButton, ToolBadge, ToolEmpty } from "@/components/stage";
import type { Mission } from "@/features/leagues/fll/partiu-mesa/lib/types";

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
      <ToolEmpty
        icon={<ListOrdered />}
        title="Sequência vazia"
        description="Selecione ao menos uma missão para montar sua sequência."
      />
    );
  }

  return (
    <ol className="divide-y divide-base-300 overflow-hidden rounded-lg border border-base-300 bg-base-100">
      {sequence.map((missionId, index) => {
        const mission = missionsById.get(missionId);
        return (
          <li
            key={`${missionId}-${index}`}
            className="flex items-center gap-3 px-3 py-1.5 transition-colors hover:bg-base-200/60"
          >
            <span className="w-6 font-mono text-[11px] text-base-content/45">
              {String(index + 1).padStart(2, "0")}
            </span>
            <ToolBadge className="font-mono">{missionId}</ToolBadge>
            <span className="flex-1 truncate text-[13px]">{mission?.name ?? "Missão"}</span>
            <div className="flex items-center gap-0.5">
              <IconButton
                label={`Mover ${missionId} para cima`}
                icon={<ArrowUp />}
                size="xs"
                disabled={index === 0}
                onClick={() => onMoveUp(index)}
              />
              <IconButton
                label={`Mover ${missionId} para baixo`}
                icon={<ArrowDown />}
                size="xs"
                disabled={index === sequence.length - 1}
                onClick={() => onMoveDown(index)}
              />
              <IconButton
                label={`Remover ${missionId} da sequência`}
                icon={<X />}
                size="xs"
                className="text-error"
                onClick={() => onRemove(index)}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
