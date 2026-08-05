"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, TimerReset, Trash } from "lucide-react";

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

  const progressColor =
    timeLeft <= 10
      ? "bg-red-500"
      : timeLeft <= 30
        ? "bg-yellow-500"
        : "bg-primary";

  const formatTime = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <>
      {/* Controles */}
      <nav
        className={`animate-fade-in-down w-full mx-auto flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 px-4 py-3 ${className}`}
      >
        <div className="flex items-center gap-3">
          <span
            className="
              font-mono text-2xl sm:text-3xl
              px-4 py-2
              bg-base-100
              text-base-content
              shadow-[4px_4px_0_theme(colors.base-content)]
            "
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <button
            className="btn btn-success btn-sm sm:btn-md gap-2"
            onClick={startTimer}
            disabled={timerRunning}
          >
            <Play size={18} />
            <span className="hidden sm:inline">Iniciar</span>
          </button>

          <button
            className="btn btn-warning btn-sm sm:btn-md gap-2"
            onClick={pauseTimer}
            disabled={!timerRunning}
          >
            <Pause size={18} />
            <span className="hidden sm:inline">Pausar</span>
          </button>

          <button
            className="btn btn-outline btn-sm sm:btn-md gap-2"
            onClick={resetTimer}
          >
            <TimerReset size={18} />
            <span className="hidden sm:inline">Tempo</span>
          </button>

          {showResetScore && (
            <>
              <div className="divider divider-horizontal hidden sm:flex" />

              <button
                className="btn btn-error btn-outline btn-sm sm:btn-md gap-2"
                onClick={onResetScore}
              >
                <Trash size={18} />
                <span className="hidden sm:inline">Pontos</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Barra de progresso fixa */}
      <div className={`sticky inset-x-0 top-0 z-10 h-2 bg-neutral mx-auto rounded-full ${className}`}>
        <div
          className={`h-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </>
  );
}
