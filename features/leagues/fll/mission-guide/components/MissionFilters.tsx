import { PillChoice } from "@/components/stage";
import type { MissionFilterKey } from "@/features/leagues/fll/mission-guide/lib/types";

const FILTER_OPTIONS: { value: MissionFilterKey; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "equipment", label: "Com equipamento" },
  { value: "no-equipment", label: "Sem equipamento" },
  { value: "bonus", label: "Com bônus" },
];

interface MissionFiltersProps {
  value: MissionFilterKey;
  onChange: (value: MissionFilterKey) => void;
}

export function MissionFilters({ value, onChange }: MissionFiltersProps) {
  return <PillChoice options={FILTER_OPTIONS} value={value} onChange={onChange} size="sm" label="Filtrar missões" />;
}
