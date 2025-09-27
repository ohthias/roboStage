"use client";

export function RangeInput({
  missionId,
  index,
  points,
  start = 0,
  end = 10,
  value,
  onSelect,
}: RangeInputProps) {
  const count = end - start + 1;
  const pointOptions = Array.isArray(points)
    ? points
    : Array.from({ length: count }, (_, i) => Number(points) * i);

  // tenta decodificar o que veio em `value` para um índice
  const decodeToIdx = (): number | undefined => {
    if (typeof value === "number") {
      // se já for um índice válido
      if (Number.isInteger(value) && value >= 0 && value < count) return value;

      // se for um valor de pontos (compat):
      if (Array.isArray(points)) {
        const found = pointOptions.findIndex((p) => p === value);
        if (found !== -1) return found; 
      } else {
        const step = Number(points) || 0;
        if (step > 0) {
          const idx = Math.round(value / step);
          if (idx >= 0 && idx < count && step * idx === value) return idx;
        }
      }
    }

    if (typeof value === "string") {
      // aceita formatos antigos "50-6" / "i:6"
      const m = value.match(/(?:^i:|^-?\d+(?:\.\d+)?-)(\d+)$/);
      if (m) {
        const idx = Number(m[1]);
        if (idx >= 0 && idx < count) return idx;
      }
    }
    return undefined;
  };

  const selectedIdx = decodeToIdx();

  return (
    <div className="flex flex-wrap gap-2 mt-2" role="radiogroup">
      {pointOptions.map((val, idx) => {
        const isActive = selectedIdx === idx;

        return (
          <button
            key={`${missionId}-range-${index}-${idx}`}
            className={
              `btn btn-md rounded-lg ${isActive ? "btn-primary" : "btn-default"}`
            }
            onClick={() => onSelect(missionId, index, idx)}
            aria-pressed={isActive}
            type="button"
          >
            {start + idx}
          </button>
        );
      })}
    </div>
  );
}