"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Maximize2, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "../lib";

// Arredonda as coordenadas: o servidor (Node) e o navegador podem divergir na
// última casa do float e quebrar a hidratação.
const round2 = (n: number) => Math.round(n * 100) / 100;

/* ------------------------------------------------------------------ */
/*  Timer — mostrador de partida (substitui TimerCircle + ControlBar). */
/* ------------------------------------------------------------------ */

export function formatClock(sec: number) {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Mostrador: anel grosso com marcações de 5 em 5 s, cor muda no fim. */
export function TimerDial({
  totalTime,
  currentTime,
  label,
  size = 300,
  children,
}: {
  totalTime: number;
  currentTime: number;
  label?: ReactNode;
  size?: number;
  children?: ReactNode;
}) {
  const r = 108;
  const c = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(1, currentTime / totalTime));
  const color =
    currentTime <= 10 ? "var(--color-primary)" : currentTime <= 30 ? "var(--color-warning)" : "var(--color-success)";
  const ticks = Math.min(60, Math.round(totalTime / 5));

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 260 260" className="absolute inset-0 size-full -rotate-90 overflow-visible">
        {/* sombra + disco */}
        <circle cx="135" cy="135" r="126" fill="var(--stage-shadow)" />
        <circle cx="130" cy="130" r="126" fill="var(--color-base-100)" stroke="var(--stage-line)" strokeWidth="1.5" />
        {/* trilho */}
        <circle cx="130" cy="130" r={r} fill="none" stroke="var(--color-base-200)" strokeWidth="18" />
        {/* progresso */}
        <circle
          cx="130"
          cy="130"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - progress * c}
          className="transition-[stroke-dashoffset,stroke] duration-1000 ease-linear"
        />
        {/* contornos do anel */}
        
        {/* marcações */}
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
      <div className="relative flex flex-col items-center">
        {label && <span className="stage-kicker mb-1 font-bold text-base-content/60">{label}</span>}
        <span className="stage-display tabular-nums leading-none" style={{ fontSize: size * 0.24 }}>
          {formatClock(currentTime)}
        </span>
        {children}
      </div>
    </div>
  );
}

/** Controles: voltar/reset, play-pause grande, tela cheia. */
export function TimerControls({
  isRunning,
  onToggle,
  onReset,
  onFullscreen,
  disabled,
}: {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onFullscreen?: () => void;
  disabled?: boolean;
}) {
  const small =
    "btn btn-circle btn-ghost size-12 rounded-full! text-base-content/70 disabled:opacity-40";
  return (
    <div className="flex items-center justify-center gap-5">
      <button type="button" onClick={onReset} className={small} aria-label="Resetar timer" disabled={disabled}>
        <RotateCcw size={20} />
      </button>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-label={isRunning ? "Pausar timer" : "Iniciar timer"}
        className={cn(
          "stage-shadow stage-press grid size-20 place-items-center rounded-tl-3xl rounded-br-3xl disabled:opacity-40",
          isRunning ? "bg-accent text-accent-content" : "bg-primary text-primary-content",
        )}
      >
        {isRunning ? <Pause size={32} strokeWidth={2.5} fill="currentColor" /> : <Play size={32} strokeWidth={2.5} fill="currentColor" className="translate-x-0.5" />}
      </button>
      {onFullscreen ? (
        <button type="button" onClick={onFullscreen} className={small} aria-label="Tela cheia" disabled={disabled}>
          <Maximize2 size={20} />
        </button>
      ) : (
        <span className="size-12" />
      )}
    </div>
  );
}

/** Timer completo e funcional (2:30 padrão FLL). */
export function MatchTimer({ seconds = 150, label = "Round FLL" }: { seconds?: number; label?: string }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          setRunning(false);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [running]);

  return (
    <div className="flex flex-col items-center gap-8">
      <TimerDial totalTime={seconds} currentTime={left} label={label}>
        <span className="stage-label mt-2 text-base-content/50">
          {left === 0 ? "Fim de partida!" : running ? "Valendo" : "Pronto"}
        </span>
      </TimerDial>
      <TimerControls
        isRunning={running}
        onToggle={() => (left === 0 ? (setLeft(seconds), setRunning(true)) : setRunning((v) => !v))}
        onReset={() => {
          setRunning(false);
          setLeft(seconds);
        }}
      />
    </div>
  );
}
