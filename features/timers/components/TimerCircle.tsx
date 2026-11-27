import React from "react";

// Arredonda as coordenadas: o servidor (Node) e o navegador podem divergir na
// última casa do float e quebrar a hidratação.
const round2 = (n: number) => Math.round(n * 100) / 100;

interface TimerCircleProps {
  totalTime: number;
  currentTime: number;
  colorClass: string; // e.g., "text-error"
  children?: React.ReactNode;
}

// Mostrador no estilo do TimerDial da Stage UI: disco com sombra dura,
// anel grosso e marcações de 5 em 5 segundos. A cor do anel vem de `colorClass`.
export const TimerCircle: React.FC<TimerCircleProps> = ({ totalTime, currentTime, colorClass, children }) => {
  const r = 108;
  const c = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(1, currentTime / totalTime));
  const ticks = Math.max(12, Math.min(60, Math.round(totalTime / 5)));

  return (
    <div className="relative grid size-72 place-items-center sm:size-80 md:size-96">
      <svg viewBox="0 0 260 260" className="absolute inset-0 size-full -rotate-90 overflow-visible" aria-hidden="true">
        <circle cx="135" cy="135" r="126" fill="var(--stage-shadow)" />
        <circle cx="130" cy="130" r="126" fill="var(--color-base-100)" stroke="var(--stage-line)" strokeWidth="1.5" />
        <circle cx="130" cy="130" r={r} fill="none" stroke="var(--color-base-200)" strokeWidth="18" />
        <circle
          cx="130"
          cy="130"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - progress * c}
          className={`transition-[stroke-dashoffset] duration-1000 ease-linear ${colorClass}`}
        />
        {Array.from({ length: ticks }, (_, i) => {
          const a = (i / ticks) * Math.PI * 2;
          const r1 = r - 18;
          const r2 = i % 6 === 0 ? r - 30 : r - 24;
          return (
            <line
              key={i}
              x1={round2(130 + r1 * Math.cos(a))}
              y1={round2(130 + r1 * Math.sin(a))}
              x2={round2(130 + r2 * Math.cos(a))}
              y2={round2(130 + r2 * Math.sin(a))}
              stroke="var(--color-base-content)"
              strokeWidth={i % 6 === 0 ? 3 : 1.5}
              strokeLinecap="round"
              opacity={0.35}
            />
          );
        })}
      </svg>
      <div className="relative flex flex-col items-center justify-center text-base-content">{children}</div>
    </div>
  );
};
