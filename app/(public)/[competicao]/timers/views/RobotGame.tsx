"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRightFromSquare,
  Pause,
  Play,
  Timer,
} from "lucide-react";

import { ROBOT_GAME_DURATION } from "@/types/TimersType";
import { CompletionModal } from "@/components/Timers/CompletionModal";
import { ConfirmModal } from "@/components/Timers/ConfirmModal";

type SeasonTheme = {
  name: string;
  accent: string;
  glow: string;
  gradient: string;
  image: string;
};

const SEASON_THEMES = {
  unearthed: {
    name: "UNEARTHED",
    accent: "text-yellow-600",
    glow: "bg-yellow-800/20",
    gradient: "from-yellow-900/25 via-red-800/10 to-yellow-800/70",
    image: "/images/showLive/backgrounds/background_unearthed.png",
  },
  submerged: {
    name: "SUBMERGED",
    accent: "text-cyan-400",
    glow: "bg-cyan-400/20",
    gradient: "from-cyan-500/25 via-blue-500/10 to-black/70",
    image: "/images/showLive/backgrounds/background_submerged.png",
  },
  masterpiece: {
    name: "MASTERPIECE",
    accent: "text-amber-400",
    glow: "bg-amber-400/20",
    gradient: "from-amber-500/25 via-orange-500/10 to-black/70",
    image: "/images/showLive/backgrounds/background_masterpiece.png",
  },
} satisfies Record<string, SeasonTheme>;

type SeasonKey = keyof typeof SEASON_THEMES;
type TimerPhase = "idle" | "countdown" | "running" | "paused" | "completed";
type CountdownValue = number | "LEGO!";

const COUNTDOWN_SEQUENCE: CountdownValue[] = [3, 2, 1, "LEGO!"];

export const RobotGame = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [timeLeft, setTimeLeft] = useState(ROBOT_GAME_DURATION);
  const [phase, setPhase] = useState<TimerPhase>("idle");
  const [showExitModal, setShowExitModal] = useState(false);
  const [countdownValue, setCountdownValue] = useState<CountdownValue | null>(null);
  const [currentSeasonKey, setCurrentSeasonKey] = useState<SeasonKey>("unearthed");

  const season = SEASON_THEMES[currentSeasonKey];

  const clearMainTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const clearCountdownTimer = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (countdownTimeoutRef.current) {
      clearTimeout(countdownTimeoutRef.current);
      countdownTimeoutRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    clearMainTimer();
    clearCountdownTimer();
    setTimeLeft(ROBOT_GAME_DURATION);
    setPhase("idle");
    setCountdownValue(null);
    setShowExitModal(false);
  }, [clearCountdownTimer, clearMainTimer]);

  const goToMenu = useCallback(() => {
    resetTimer();
    window.location.href = "/fll/timers";
  }, [resetTimer]);

  const startCountdown = useCallback(() => {
    clearMainTimer();
    clearCountdownTimer();
    setCountdownValue(COUNTDOWN_SEQUENCE[0]);
    setPhase("countdown");
    let index = 0;
    countdownIntervalRef.current = setInterval(() => {
      index += 1;
      if (index < COUNTDOWN_SEQUENCE.length) {
        setCountdownValue(COUNTDOWN_SEQUENCE[index]);
        return;
      }
      clearCountdownTimer();
      countdownTimeoutRef.current = setTimeout(() => {
        setCountdownValue(null);
        setPhase("running");
      }, 450);
    }, 1000);
  }, [clearCountdownTimer, clearMainTimer]);

  const handleToggle = useCallback(() => {
    switch (phase) {
      case "completed":
        resetTimer();
        break;
      case "idle":
        startCountdown();
        break;
      case "paused":
        setPhase("running");
        break;
      case "running":
        clearMainTimer();
        setPhase("paused");
        break;
    }
  }, [clearMainTimer, phase, resetTimer, startCountdown]);

  const handleBack = useCallback(() => {
    if (phase === "running" || phase === "paused" || phase === "countdown") {
      setShowExitModal(true);
      return;
    }
    goToMenu();
  }, [goToMenu, phase]);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      void containerRef.current?.requestFullscreen();
      return;
    }
    void document.exitFullscreen();
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (phase !== "running") return;
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearMainTimer();
          setPhase("completed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearMainTimer();
    };
  }, [clearMainTimer, phase]);

  useEffect(() => {
    if (phase !== "countdown") return;
    return () => {
      clearCountdownTimer();
    };
  }, [clearCountdownTimer, phase]);

  useEffect(() => {
    return () => {
      clearMainTimer();
      clearCountdownTimer();
    };
  }, [clearCountdownTimer, clearMainTimer]);

  const timerColor =
    timeLeft <= 10
      ? "text-error"
      : timeLeft <= 30
      ? "text-warning"
      : season.accent;

  const isCountdown = phase === "countdown";
  const isTimerActive = phase === "running" || phase === "paused";

  return (
    <div
      ref={containerRef}
      className="relative min-h-[100dvh] w-full overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${season.image})` }}
    >
      <div className="absolute inset-0 backdrop-blur-[2px]" />
      <div
        key={currentSeasonKey}
        className={`absolute inset-0 bg-gradient-to-br ${season.gradient} transition-opacity duration-700 ease-in-out`}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          key={`glow-${currentSeasonKey}`}
          className={`
            h-[60vw] w-[60vw] max-h-[700px] max-w-[700px]
            rounded-full blur-[160px]
            animate-pulse-slow
            transition-all duration-700 ease-out
            ${season.glow}
          `}
        />
      </div>
      <div className="absolute inset-0 bg-black/75" />
      <ConfirmModal
        isOpen={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={goToMenu}
      />
      <CompletionModal
        isOpen={phase === "completed"}
        title="Fim de Round"
        subTitle={`Temporada ${season.name}`}
        onReset={resetTimer}
        onMenu={goToMenu}
      />
      <main className="relative z-10 flex min-h-[100dvh] items-center justify-center">
        <div className="relative text-center">
          <div
            className={`font-mono font-extrabold tracking-tight tabular-nums
            drop-shadow-[0_0_90px_rgba(0,0,0,0.95)]
            text-[5.5rem] sm:text-[7.5rem] md:text-[9.5rem]
            transition-all duration-300 ${timerColor}
            ${isCountdown ? "opacity-25 blur-[1px] scale-95" : ""}`}
            aria-live="polite"
          >
            {formatTime(timeLeft)}
          </div>
          {isCountdown && countdownValue !== null && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="
                  select-none font-black uppercase tracking-[0.22em]
                  text-6xl sm:text-8xl md:text-9xl
                  text-white drop-shadow-[0_0_30px_rgba(0,0,0,0.95)]
                  animate-pulse
                "
                aria-live="assertive"
              >
                {countdownValue}
              </div>
            </div>
          )}
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-black/60 backdrop-blur transition-all md:opacity-0 md:hover:opacity-100">
        <div className="mx-auto flex max-w-md items-center justify-center gap-6 py-4 md:py-6">
          <button
            onClick={handleBack}
            className="btn btn-soft btn-circle btn-sm"
            aria-label="Voltar ao menu"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={handleToggle}
            className="btn btn-primary btn-circle btn-lg"
            aria-label={
              phase === "running"
                ? "Pausar timer"
                : phase === "paused"
                ? "Retomar timer"
                : phase === "countdown"
                ? "Timer em contagem"
                : "Iniciar timer"
            }
            disabled={phase === "countdown"}
          >
            {isTimerActive ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            onClick={resetTimer}
            className="btn btn-soft btn-circle btn-sm"
            aria-label="Resetar timer"
          >
            <Timer size={20} />
          </button>
          <button
            onClick={handleFullscreen}
            className="btn btn-soft btn-circle btn-sm"
            aria-label="Alternar tela cheia"
          >
            <ArrowUpRightFromSquare size={20} />
          </button>
        </div>
        <select
          value={currentSeasonKey}
          onChange={(e) => setCurrentSeasonKey(e.target.value as SeasonKey)}
          className="
            absolute right-2 top-2 z-30
            rounded-lg border border-white/20 bg-black/60 px-3 py-1.5
            text-sm text-white/80 backdrop-blur
            focus:outline-none focus:ring-2 focus:ring-white/30
          "
        >
          {Object.entries(SEASON_THEMES).map(([key, theme]) => (
            <option key={key} value={key} className="bg-black">
              {theme.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};