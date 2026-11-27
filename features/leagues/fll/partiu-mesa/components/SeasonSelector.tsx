"use client";

import { PropertyRow, ToolSelect } from "@/components/stage";
import type { Season } from "@/features/leagues/fll/partiu-mesa/lib/types";

interface SeasonSelectorProps {
  seasons: Season[];
  selectedSeasonId: string | null;
  onSelect: (seasonId: string) => void;
}

export default function SeasonSelector({ seasons, selectedSeasonId, onSelect }: SeasonSelectorProps) {
  return (
    <PropertyRow label="Temporada" className="w-full grid-cols-[5.5rem_1fr] sm:w-80">
      <ToolSelect
        id="mission-timer-season"
        value={selectedSeasonId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        aria-label="Temporada da FIRST LEGO League"
      >
        <option value="" disabled>
          Selecione...
        </option>
        {seasons.map((season) => (
          <option key={season.id} value={season.id}>
            {season.name}
          </option>
        ))}
      </ToolSelect>
    </PropertyRow>
  );
}
