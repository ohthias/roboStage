"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import type { Mission } from "@/utils/competitions/fll/partiu-mesa/types";

interface MissionSelectorProps {
  missions: Mission[];
  selectedIds: string[];
  onToggle: (missionId: string) => void;
}

export default function MissionSelector({ missions, selectedIds, onToggle }: MissionSelectorProps) {
  const [openDetailsId, setOpenDetailsId] = useState<string | null>(null);

  if (missions.length === 0) {
    return (
      <div className="alert alert-warning">
        <span>Nenhuma missão encontrada para esta temporada.</span>
      </div>
    );
  }

  const openMission = missions.find((m) => m.id === openDetailsId) ?? null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Missões disponíveis</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {missions.map((mission) => {
          const checked = selectedIds.includes(mission.id);
          return (
            <li key={mission.id}>
              <label
                className={`card card-compact border cursor-pointer transition-colors ${
                  checked ? "border-primary bg-primary/5" : "border-base-300 bg-base-200/20"
                }`}
              >
                <div className="card-body flex-row items-center gap-3 py-3">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={checked}
                    onChange={() => onToggle(mission.id)}
                    aria-label={`Selecionar missão ${mission.id} — ${mission.name}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-neutral badge-sm">{mission.id}</span>
                      <span className="font-medium truncate">{mission.name}</span>
                    </div>
                    {mission.points !== undefined && (
                      <span className="text-xs text-success font-medium">+ {mission.points} pts</span>
                    )}
                  </div>
                  {mission.description && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs btn-circle"
                      aria-label={`Ver detalhes de ${mission.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenDetailsId(mission.id);
                      }}
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </label>
            </li>
          );
        })}
      </ul>

      {openMission && (
        <dialog className="modal modal-open" onClose={() => setOpenDetailsId(null)}>
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              {openMission.id} — {openMission.name}
            </h3>
            {openMission.points !== undefined && (
              <p className="text-success font-medium mt-1">+ {openMission.points} pts</p>
            )}
            <p className="py-4 text-sm">{openMission.description}</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setOpenDetailsId(null)}>
                Fechar
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setOpenDetailsId(null)} aria-label="Fechar detalhes">
              close
            </button>
          </form>
        </dialog>
      )}
    </div>
  );
}
