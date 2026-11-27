"use client";

export default function Counter({
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="join">
      <button
        type="button"
        className="btn btn-sm btn-square join-item"
        aria-label="diminuir"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </button>
      <span className="join-item flex w-12 items-center justify-center border border-base-300 bg-base-100 font-mono text-lg tabular-nums">
        {value}
      </span>
      <button
        type="button"
        className="btn btn-sm btn-square btn-primary join-item"
        aria-label="aumentar"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        +
      </button>
    </div>
  );
}
