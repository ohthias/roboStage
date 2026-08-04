"use client";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import missionsData from "@/public/data/fll/future-edition.json";
import { MissionsData } from "@/app/(public)/[competicao]/(fll)/future-edition/score/scoring.type";
import ScoreCalculator from "@/components/competicoes/FLL/Components/Future-Edition/ScoreCalculator";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, TimerReset, Trash } from "lucide-react";

const data = missionsData as MissionsData;

export default function FutureEditionScorePage() {
  // Timer states
  const totalTime = 150; // 2 min 30 seg
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [timerRunning, setTimerRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sons
  const startSound = useRef<HTMLAudioElement | null>(null);
  const endSound = useRef<HTMLAudioElement | null>(null);

  const progress = (timeLeft / totalTime) * 100;
  const progressColor =
    timeLeft <= 10
      ? "bg-red-500"
      : timeLeft <= 30
        ? "bg-yellow-500"
        : "bg-primary";

  const startTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(totalTime);
      setHasStarted(false);
    }

    if (!timerRunning) {
      setTimerRunning(true);

      if (!hasStarted) {
        if (startSound.current) startSound.current.play();
        setHasStarted(true);
      }
    }
  };

  const pauseTimer = () => {
    setTimerRunning(false);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(totalTime);
    setHasStarted(false);
  };
  const resetScores = () => {};

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
      if (endSound.current) endSound.current.play();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col min-h-screen space-y-8">
      {/* Barra de progresso */}
      <div className="h-3 w-full bg-neutral sticky top-0 z-30">
        <div
          className={`h-full transition-all duration-300 ${progressColor}`}
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>

      <header className="max-w-6xl mx-auto w-full px-6">
        <Breadcrumbs start="fll" />
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h1 className="inline-block bg-secondary text-secondary-content px-3 py-1 italic font-black text-5xl">
              Future Edition
            </h1>
            <p className="uppercase tracking-widest text-secondary mt-3 font-semibold">
              Baseado nos kits LEGO® Education Computer Science & AI
            </p>
          </div>
        </div>
      </header>

      <nav className="animate-fade-in-down w-full max-w-6xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 px-4 py-3 mx-auto">
        {/* TIMER */}
        <div className="flex items-center gap-3">
          <span
            id="timer"
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

        {/* CONTROLES */}
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <button
            className="btn btn-success btn-sm sm:btn-md gap-2"
            onClick={startTimer}
            disabled={timerRunning}
            title="Iniciar o timer"
          >
            <Play size={18} />
            <span className="hidden sm:inline">Iniciar</span>
          </button>

          <button
            className="btn btn-warning btn-sm sm:btn-md gap-2"
            onClick={pauseTimer}
            disabled={!timerRunning}
            title="Pausar o timer"
          >
            <Pause size={18} />
            <span className="hidden sm:inline">Pausar</span>
          </button>

          <button
            className="btn btn-outline btn-sm sm:btn-md gap-2"
            onClick={resetTimer}
            title="Resetar o tempo"
          >
            <TimerReset size={18} />
            <span className="hidden sm:inline">Tempo</span>
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto w-full px-6">
        <ScoreCalculator data={data} />
      </main>
    </div>
  );
}
