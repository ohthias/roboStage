"use client";

import { Check, X } from "lucide-react";
import type { Mission } from "@/utils/competitions/fll/partiu-mesa/types";

interface RunMissionProps {
  mission: Mission | undefined;
  missionId: string;
  onSuccess: () => void;
  onFailure: () => void;
}

export default function RunMission({ mission, missionId, onSuccess, onFailure }: RunMissionProps) {
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="text-center">
        <div className="badge badge-lg badge-neutral font-mono">{missionId}</div>
        <h2 className="text-2xl sm:text-3xl font-bold mt-2">{mission?.name ?? "Missão"}</h2>
        {mission?.points !== undefined && (
          <p className="text-success font-semibold mt-1">+ {mission.points} pontos</p>
        )}
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3 mt-2">
        <button
          type="button"
          onClick={onSuccess}
          className="btn btn-success btn-lg h-16 text-lg gap-2"
          aria-label={`Registrar sucesso na missão ${missionId}`}
        >
          <Check className="w-6 h-6" aria-hidden="true" />
          SUCESSO
        </button>
        <button
          type="button"
          onClick={onFailure}
          className="btn btn-error btn-lg h-16 text-lg gap-2"
          aria-label={`Registrar falha na missão ${missionId}`}
        >
          <X className="w-6 h-6" aria-hidden="true" />
          FALHA
        </button>
      </div>
    </div>
  );
}
