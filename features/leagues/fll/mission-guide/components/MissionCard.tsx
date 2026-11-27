import Image from "next/image";
import { memo } from "react";
import { ArrowUpRight } from "lucide-react";
import { StickerTag } from "@/components/stage";
import type { MissionGuideMission } from "@/features/leagues/fll/mission-guide/lib/types";
import { countObjectives, formatPoints } from "@/features/leagues/fll/mission-guide/lib/utils";

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
      aria-haspopup="dialog"
      className="stage-paper group relative flex h-full flex-col overflow-hidden rounded-tl-[24px] rounded-br-[24px] border border-base-300 bg-base-100 text-left transition-[transform,box-shadow,border-color] duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:border-primary hover:shadow-[6px_6px_0_var(--color-primary)] focus-visible:-translate-y-1 focus-visible:border-primary focus-visible:shadow-[6px_6px_0_var(--color-primary)] focus-visible:outline-none motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0"
    >
      <div className="stage-dots relative aspect-square w-full overflow-hidden border-b border-base-300 bg-base-200/60 [background-size:16px_16px]">
        {mission.image ? (
          <Image
            src={mission.image}
            alt={mission.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="stage-display flex h-full w-full items-center justify-center text-4xl text-base-content/20">
            {mission.id}
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-tl-md rounded-br-md bg-base-content px-2 py-0.5 font-mono text-[11px] font-bold text-base-100">
          {mission.id}
        </span>
        {mission.hasBonus && (
          <StickerTag tone="accent" rotate={6} className="absolute right-2 top-2 text-[10px]">
            + bônus
          </StickerTag>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-black leading-snug tracking-tight">{mission.name}</h3>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-dashed border-base-300 pt-2">
          <span className="font-mono text-xs font-bold text-primary">{formatPoints(mission.points)}</span>
          <span className="flex items-center gap-1 text-[11px] text-base-content/50">
            {objectives > 0 && `${objectives} ${objectives === 1 ? "objetivo" : "objetivos"}`}
            <ArrowUpRight size={14} className="transition-transform duration-200 group-hover:rotate-45 group-hover:text-primary" />
          </span>
        </div>
      </div>
    </button>
  );
}

export const MissionCard = memo(MissionCardImpl);
