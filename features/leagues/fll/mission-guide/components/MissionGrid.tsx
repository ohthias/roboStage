import { Button, EmptyState } from "@/components/stage";
import type { MissionGuideMission } from "@/features/leagues/fll/mission-guide/lib/types";
import { MissionCard } from "./MissionCard";

interface MissionGridProps {
  missions: MissionGuideMission[];
  onSelect: (missionId: string) => void;
  onClearSearch: () => void;
}

export function MissionGrid({ missions, onSelect, onClearSearch }: MissionGridProps) {
  if (missions.length === 0) {
    return (
      <EmptyState
        title="Nenhuma missão encontrada."
        description="Tente outro nome ou ID."
        action={
          <Button tone="outline" size="sm" onClick={onClearSearch}>
            Limpar busca
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {missions.map((mission) => (
        <MissionCard key={mission.id} mission={mission} onSelect={onSelect} />
      ))}
    </div>
  );
}
