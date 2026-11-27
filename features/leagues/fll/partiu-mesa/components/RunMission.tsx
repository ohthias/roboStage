"use client";

import { Check, X } from "lucide-react";
import type { Mission } from "@/features/leagues/fll/partiu-mesa/lib/types";

interface RunMissionProps {
  mission: Mission | undefined;
  missionId: string;
  onSuccess: () => void;
  onFailure: () => void;
}

const bigBtn =
  "inline-flex h-16 w-full items-center justify-center gap-2 rounded-tl-xl rounded-br-xl border-2 border-base-content text-lg font-black tracking-tight shadow-[4px_4px_0_0_var(--stage-shadow)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--stage-shadow)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:hover:translate-y-0";

export default function RunMission({ mission, missionId, onSuccess, onFailure }: RunMissionProps) {
  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="text-center">
        <span className="inline-block -rotate-2 rounded-tl-lg rounded-br-lg bg-base-content px-3 py-1 font-mono text-sm font-bold text-base-100">
          {missionId}
        </span>
        <h2 className="stage-display mt-3 text-3xl sm:text-4xl">{mission?.name ?? "Missão"}</h2>
        {mission?.points !== undefined && (
          <p className="mt-1 font-semibold text-success">+ {mission.points} pontos</p>
        )}
      </div>

      <div className="mt-2 grid w-full max-w-sm gap-3">
        <button
          type="button"
          onClick={onSuccess}
          className={`${bigBtn} bg-success text-success-content`}
          aria-label={`Registrar sucesso na missão ${missionId}`}
        >
          <Check className="size-6" aria-hidden="true" />
          SUCESSO
        </button>
        <button
          type="button"
          onClick={onFailure}
          className={`${bigBtn} bg-error text-error-content`}
          aria-label={`Registrar falha na missão ${missionId}`}
        >
          <X className="size-6" aria-hidden="true" />
          FALHA
        </button>
      </div>
    </div>
  );
}
