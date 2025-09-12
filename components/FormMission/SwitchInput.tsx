"use client";

interface SwitchInputProps {
  missionId: string;
  index: number;
  points: number | number[];
  options?: string[];
  value?: string | number;
  onSelect: (missionId: string, index: number, value: number) => void;
}

export function SwitchInput({
  missionId,
  index,
  points,
  options,
  value,
  onSelect,
}: SwitchInputProps) {
  const buttons = Array.isArray(points)
    ? options?.length
      ? options
      : points.map(String)
    : options?.length
    ? options
    : ["Não", "Sim"];

  const values = Array.isArray(points)
    ? points.map(Number)
    : buttons.map((opt, idx) => (opt === "Sim" || idx === 1 ? Number(points) : 0));

  return (
    <div className="flex flex-wrap mt-2 gap-2" role="radiogroup">
      {buttons.map((label, idx) => (
        <button
          key={`${missionId}-switch-${index}-${idx}`}
          className={`btn btn-md rounded-lg ${value === values[idx] ? "btn-primary" : "btn-default"}`}
          onClick={() => onSelect(missionId, index, values[idx])}
          aria-pressed={value === values[idx]}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
