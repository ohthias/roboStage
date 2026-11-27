import { Search } from "lucide-react";
import { Input } from "@/components/stage";

interface MissionSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function MissionSearch({ value, onChange }: MissionSearchProps) {
  return (
    <Input
      type="search"
      icon={<Search size={16} />}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Buscar missão..."
      aria-label="Buscar missão por ID, nome ou descrição"
      className="rounded-tl-xl rounded-br-xl sm:max-w-sm"
    />
  );
}
