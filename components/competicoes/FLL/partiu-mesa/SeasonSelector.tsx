"use client";

import type { Season } from "@/utils/competitions/fll/partiu-mesa/types";

interface SeasonSelectorProps {
  seasons: Season[];
  selectedSeasonId: string | null;
  onSelect: (seasonId: string) => void;
}

export default function SeasonSelector({ seasons, selectedSeasonId, onSelect }: SeasonSelectorProps) {
  return (
    <div className="form-control w-full max-w-sm">
      <label className="label" htmlFor="mission-timer-season">
        <span className="label-text font-medium">Escolha uma temporada</span>
      </label>
      <select
        id="mission-timer-season"
        className="select select-bordered w-full"
        value={selectedSeasonId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        aria-label="Temporada da FIRST LEGO League"
      >
        <option value="" disabled>
          Selecione...
        </option>
        {seasons.map((season) => (
          <option key={season.id} value={season.id}>
            {season.name.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
