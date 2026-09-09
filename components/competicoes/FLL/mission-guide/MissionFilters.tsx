import type { MissionFilterKey } from "@/utils/competitions/fll/mission-guide/types";

const FILTER_OPTIONS: { key: MissionFilterKey; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "equipment", label: "Com equipamento" },
  { key: "no-equipment", label: "Sem equipamento" },
  { key: "bonus", label: "Com bônus" },
];

interface MissionFiltersProps {
  value: MissionFilterKey;
  onChange: (value: MissionFilterKey) => void;
}

export function MissionFilters({ value, onChange }: MissionFiltersProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as MissionFilterKey)}
      aria-label="Filtrar missões"
      className="select select-bordered w-full sm:max-w-sm"
    >
      {FILTER_OPTIONS.map((option) => (
        <option key={option.key} value={option.key}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
