"use client";

import { Check, Info } from "lucide-react";
import { useState } from "react";
import { IconButton, InlineAlert, ToolBadge, ToolButton, ToolDialog, cn } from "@/components/stage";
import type { Mission } from "@/features/leagues/fll/partiu-mesa/lib/types";

interface MissionSelectorProps {
  missions: Mission[];
  selectedIds: string[];
  onToggle: (missionId: string) => void;
}

export default function MissionSelector({ missions, selectedIds, onToggle }: MissionSelectorProps) {
  const [openDetailsId, setOpenDetailsId] = useState<string | null>(null);

  if (missions.length === 0) {
    return <InlineAlert type="warning">Nenhuma missão encontrada para esta temporada.</InlineAlert>;
  }

  const openMission = missions.find((m) => m.id === openDetailsId) ?? null;

  return (
    <div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {missions.map((mission) => {
          const checked = selectedIds.includes(mission.id);
          const order = checked ? selectedIds.indexOf(mission.id) + 1 : null;
          return (
            <li key={mission.id}>
              <label
                className={cn(
                  "group flex cursor-pointer items-center gap-3 rounded-lg border bg-base-100 px-3 py-2.5 transition-[border-color,background-color] duration-150 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-primary/30",
                  checked ? "border-primary bg-primary/[0.06]" : "border-base-300 hover:border-base-content/25",
                )}
              >
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={checked}
                  onChange={() => onToggle(mission.id)}
                  aria-label={`Selecionar missão ${mission.id} — ${mission.name}`}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-tl-md rounded-br-md border font-mono text-[11px] font-bold transition-colors",
                    checked ? "border-primary bg-primary text-primary-content" : "border-base-300 text-transparent",
                  )}
                >
                  {order ?? <Check size={12} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <ToolBadge className="font-mono">{mission.id}</ToolBadge>
                    <span className="truncate text-[13px] font-semibold">{mission.name}</span>
                  </div>
                  {mission.points !== undefined && (
                    <span className="text-[11px] font-semibold text-success">+ {mission.points} pts</span>
                  )}
                </div>
                {mission.description && (
                  <IconButton
                    label={`Ver detalhes de ${mission.id}`}
                    icon={<Info />}
                    size="xs"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenDetailsId(mission.id);
                    }}
                  />
                )}
              </label>
            </li>
          );
        })}
      </ul>

      <ToolDialog
        open={!!openMission}
        onClose={() => setOpenDetailsId(null)}
        title={openMission ? `${openMission.id} — ${openMission.name}` : ""}
        description={openMission?.points !== undefined ? `+ ${openMission.points} pts` : undefined}
        size="md"
        footer={
          <ToolButton onClick={() => setOpenDetailsId(null)} variant="outline">
            Fechar
          </ToolButton>
        }
      >
        <p className="leading-6 text-base-content/80">{openMission?.description}</p>
      </ToolDialog>
    </div>
  );
}
