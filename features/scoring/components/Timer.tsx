"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, TimerReset, Trash } from "lucide-react";
import { IconButton, ToolButton, cn } from "@/components/stage";

interface TimerProps {
  duration?: number;
  showResetScore?: boolean;
  className?: string;
  startSound?: string;
  endSound?: string;
  onStart?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  onFinish?: () => void;
  onResetScore?: () => void;
  /** Conteúdo extra à direita do relógio (ex.: placar). */
  aside?: React.ReactNode;
}

export default function Timer({
  duration = 150,
  showResetScore = false,
  className = "",
  startSound,
  endSound,
  onStart,
  onPause,
  onReset,
  onFinish,
  onResetScore,
  aside,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [timerRunning, setTimerRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startAudio = useRef<HTMLAudioElement | null>(null);
  const endAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (startSound) {
      startAudio.current = new Audio(startSound);
    }
    if (endSound) {
      endAudio.current = new Audio(endSound);
    }
  }, [startSound, endSound]);

  useEffect(() => {
    setTimeLeft(duration);
    setTimerRunning(false);
    setHasStarted(false);
  }, [duration]);

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
      endAudio.current?.play();
      onFinish?.();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerRunning, timeLeft, onFinish]);

  const startTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(duration);
      setHasStarted(false);
    }

    if (!timerRunning) {
      setTimerRunning(true);

      if (!hasStarted) {
        startAudio.current?.play();
        setHasStarted(true);
      }

      onStart?.();
    }
  };

  const pauseTimer = () => {
    setTimerRunning(false);
    onPause?.();
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(duration);
    setHasStarted(false);
    onReset?.();
  };

  const progress = (timeLeft / duration) * 100;
  const tone = timeLeft <= 10 ? "error" : timeLeft <= 30 ? "warning" : "primary";

  const formatTime = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <section
      aria-label="Cronômetro da partida"
      className={cn(
        "stage-paper sticky top-[1rem] z-20 mx-auto w-full overflow-hidden rounded-tl-[1.25rem] rounded-br-[1.25rem] border border-base-300 bg-base-100/95 backdrop-blur",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:flex-nowrap sm:px-5">
        <div className="flex items-baseline gap-3">
          <span
            role="timer"
            aria-live="off"
            className={cn(
              "stage-display text-4xl tabular-nums sm:text-5xl",
              tone === "error" && "text-error",
              tone === "warning" && "text-[color-mix(in_oklab,var(--color-warning)_70%,var(--color-base-content))]",
            )}
          >
            {formatTime(timeLeft)}
          </span>
          <span className="stage-kicker hidden text-base-content/45 sm:inline">
            / {timerRunning ? "EM JOGO" : timeLeft === 0 ? "FIM" : hasStarted ? "PAUSADO" : "PRONTO"}
          </span>
        </div>

        {aside && <div className="order-last flex w-full justify-center sm:order-none sm:ml-auto sm:w-auto">{aside}</div>}

        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          {timerRunning ? (
            <ToolButton size="md" variant="secondary" icon={<Pause />} onClick={pauseTimer}>
              Pausar
            </ToolButton>
          ) : (
            <ToolButton size="md" variant="primary" icon={<Play />} onClick={startTimer}>
              {hasStarted && timeLeft > 0 ? "Continuar" : "Iniciar"}
            </ToolButton>
          )}
          <IconButton label="Reiniciar tempo" icon={<TimerReset />} size="md" variant="outline" onClick={resetTimer} />
          {showResetScore && (
            <>
              <span aria-hidden className="mx-1 hidden h-6 w-px bg-base-300 sm:block" />
              <ToolButton size="md" variant="danger" icon={<Trash />} onClick={onResetScore}>
                <span className="hidden sm:inline">Zerar pontos</span>
              </ToolButton>
            </>
          )}
        </div>
      </div>

      <div className="h-1.5 bg-base-200">
        <div
          className={cn(
            "h-full transition-[width] duration-1000 ease-linear",
            tone === "error" ? "bg-error" : tone === "warning" ? "bg-warning" : "bg-primary",
          )}
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-label="Tempo restante"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </section>
  );
}
