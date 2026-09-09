import type { MissionGuideMission } from "@/utils/competitions/fll/mission-guide/types";
import { MissionCard } from "./MissionCard";

interface MissionGridProps {
  missions: MissionGuideMission[];
  onSelect: (missionId: string) => void;
  onClearSearch: () => void;
}

export function MissionGrid({ missions, onSelect, onClearSearch }: MissionGridProps) {
  if (missions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-base-300 py-16 text-center">
        <p className="text-lg font-semibold">Nenhuma missão encontrada.</p>
        <p className="text-sm text-base-content/60">Tente outro nome ou ID.</p>
        <button type="button" className="btn btn-sm" onClick={onClearSearch}>
          Limpar busca
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {missions.map((mission) => (
        <MissionCard key={mission.id} mission={mission} onSelect={onSelect} />
      ))}
    </div>
  );
}
