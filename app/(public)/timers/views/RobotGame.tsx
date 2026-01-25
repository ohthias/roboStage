import React, { useState, useEffect, useRef, useMemo } from "react";
import { AppMode, ROBOT_GAME_DURATION } from "@/types/TimersType";
import { CompletionModal } from "@/components/Timers/CompletionModal";
import { ConfirmModal } from "@/components/Timers/ConfirmModal";
import {
  ArrowLeft,
  ArrowUpRightFromSquare,
  Pause,
  Play,
  Timer,
} from "lucide-react";

/* ================= SEASON THEMES ================= */

type SeasonTheme = {
  name: string;
  accent: string;
  glow: string;
  gradient: string;
};

const SEASON_THEMES: Record<string, SeasonTheme> = {
  unearthed: {
    name: "UNEARTHED",
    accent: "text-yellow-800",
    glow: "bg-yellow-800/20",
    gradient: "from-yellow-900/25 via-red-800/10 to-yellow-800/70",
  },
  submerged: {
    name: "SUBMERGED",
    accent: "text-cyan-400",
    glow: "bg-cyan-400/20",
    gradient: "from-cyan-500/25 via-blue-500/10 to-black/70",
  },
  superpowered: {
    name: "SUPERPOWERED",
    accent: "text-fuchsia-400",
    glow: "bg-fuchsia-500/20",
    gradient: "from-fuchsia-500/25 via-purple-500/10 to-fuchsia-500/70",
  },
  masterpiece: {
    name: "MASTERPIECE",
    accent: "text-amber-400",
    glow: "bg-amber-400/20",
    gradient: "from-amber-500/25 via-orange-500/10 to-black/70",
  },
};

interface Props {
  setMode: (mode: AppMode) => void;
}

export const RobotGame: React.FC<Props> = ({ setMode }) => {
  const [timeLeft, setTimeLeft] = useState(ROBOT_GAME_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isArmed, setIsArmed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  /* ================= TEMPORADA ATUAL ================= */
  const [currentSeasonKey, setCurrentSeasonKey] = useState<string>(
    Object.keys(SEASON_THEMES)[0]
  );
  const season = useMemo(
    () => SEASON_THEMES[currentSeasonKey],
    [currentSeasonKey]
  );

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!isRunning || !isArmed || timeLeft <= 0) return;

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCompleted(true);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isArmed]);

  const handleToggle = () => {
    if (completed) return handleReset();

    if (!isRunning && timeLeft === ROBOT_GAME_DURATION) {
      setIsArmed(false);
      setTimeout(() => {
        setIsArmed(true);
        setIsRunning(true);
      }, 1200);
      return;
    }

    setIsRunning((v) => !v);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsArmed(false);
    setCompleted(false);
    setTimeLeft(ROBOT_GAME_DURATION);
  };

  const handleBack = () => {
    if (isRunning) setShowExitModal(true);
    else setMode(AppMode.MENU);
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const timerColor =
    timeLeft <= 10
      ? "text-error"
      : timeLeft <= 30
      ? "text-warning"
      : season.accent;

  return (
    <div
      ref={containerRef}
      className="relative min-h-[100dvh] w-full overflow-hidden bg-black"
    >
      {/* Imagem base */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 animate-slow-zoom"
        style={{ backgroundImage: "url(/images/robot-arena.jpg)" }}
      />
      {/* Profundidade */}
      <div className="absolute inset-0 backdrop-blur-[2px]" />
      {/* Gradiente da temporada */}
      <div
        key={currentSeasonKey}
        className={`absolute inset-0 bg-gradient-to-br ${season.gradient}
  transition-opacity duration-700 ease-in-out`}
      />
      {/* Grid técnico contextual */}
      <div
        className="
          absolute inset-0 opacity-[0.045]
          bg-[linear-gradient(to_right,rgba(255,255,255,0.4)_1px,transparent_1px),
              linear-gradient(to_bottom,rgba(255,255,255,0.4)_1px,transparent_1px)]
          bg-[size:48px_48px]
          animate-grid-drift
        "
      />
      {/* Glow central por temporada */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          key={`glow-${currentSeasonKey}`}
          className={`
      w-[60vw] h-[60vw] max-w-[700px] max-h-[700px]
      rounded-full blur-[160px]
      animate-pulse-slow
      transition-all duration-700 ease-out
      ${season.glow}
    `}
        />
      </div>
      {/* Vinheta */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/85" />

      {/* ================= MODAIS ================= */}
      <ConfirmModal
        isOpen={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => setMode(AppMode.MENU)}
      />

      <CompletionModal
        isOpen={completed}
        title="Fim de Round"
        subTitle={`Temporada ${season.name}`}
        onReset={handleReset}
        onMenu={() => setMode(AppMode.MENU)}
      />

      {/* ================= TIMER ================= */}
      <main className="relative z-10 flex items-center justify-center min-h-[100dvh]">
        <div className="text-center">
          <div
            className={`font-mono font-extrabold tracking-tight tabular-nums
            drop-shadow-[0_0_90px_rgba(0,0,0,0.95)]
            text-[5.5rem] sm:text-[7.5rem] md:text-[9.5rem]
            transition-colors duration-300 ${timerColor}`}
          >
            {formatTime(timeLeft)}
          </div>
        </div>
      </main>

      {/* CONTROLES */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-black/60 backdrop-blur border-t border-white/10 md:opacity-0 md:hover:opacity-100 transition-all">
        <div className="flex items-center justify-center gap-6 py-4 md:py-6 max-w-md mx-auto">
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
            aria-label={isRunning ? "Pausar timer" : "Iniciar timer"}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            onClick={handleReset}
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
          onChange={(e) => setCurrentSeasonKey(e.target.value)}
          className="
    absolute top-2 right-2 z-30
    bg-black/60 backdrop-blur
    text-sm text-white/80
    rounded-lg px-3 py-1.5
    border border-white/20
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
