import Image from "next/image";
import { memo } from "react";
import type { MissionGuideMission } from "@/utils/competitions/fll/mission-guide/types";
import { countObjectives, formatPoints } from "@/utils/competitions/fll/mission-guide/utils";

interface MissionCardProps {
  mission: MissionGuideMission;
  onSelect: (missionId: string) => void;
}

function MissionCardImpl({ mission, onSelect }: MissionCardProps) {
  const objectives = countObjectives(mission);

  return (
    <button
      type="button"
      onClick={() => onSelect(mission.id)}
      className="card bg-base-100 border border-base-300 text-left transition-transform duration-150 hover:scale-[1.01] hover:border-primary/40 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      aria-haspopup="dialog"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-t-2xl bg-base-200">
        {mission.image ? (
          <Image
            src={mission.image}
            alt={mission.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-base-content/20">
            {mission.id}
          </div>
        )}

        {mission.hasBonus && (
          <span className="badge badge-secondary badge-sm absolute right-2 top-2">+ bônus</span>
        )}
      </div>

      <div className="card-body gap-1 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
          {mission.id}
        </span>
        <h3 className="line-clamp-2 text-sm font-bold leading-snug">{mission.name}</h3>

        <div className="mt-1 flex items-center justify-between">
          <span className="badge badge-primary badge-outline badge-sm">
            {formatPoints(mission.points)}
          </span>
          {objectives > 0 && (
            <span className="text-xs text-base-content/50">{objectives} objetivos</span>
          )}
        </div>
      </div>
    </button>
  );
}

export const MissionCard = memo(MissionCardImpl);
