import React, { useState, useEffect, useRef } from "react";
import { AppMode, ROBOT_GAME_DURATION } from "@/types/TimersType";
import { playSound } from "@/lib/audio";
import { CompletionModal } from "@/components/Timers/CompletionModal";
import { ConfirmModal } from "@/components/Timers/ConfirmModal";
import { ControlBar } from "@/components/Timers/ControlBar";
import { TimerCircle } from "@/components/Timers/TimerCircle";
import { Trophy, AlertTriangle } from "lucide-react";

interface Props {
  setMode: (mode: AppMode) => void;
}

export const RobotGame: React.FC<Props> = ({ setMode }) => {
  const [timeLeft, setTimeLeft] = useState(ROBOT_GAME_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setCompleted(true);
            playSound("end");
            return 0;
          }
          // Warning sound at 30s (End game)
          if (prev === 31) playSound("warning");
          return prev - 1;
        });
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleToggle = () => {
    if (completed) {
      // If clicked when completed, reset
      handleReset();
      return;
    }

    if (!isRunning && timeLeft === ROBOT_GAME_DURATION) {
      playSound("start");
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(ROBOT_GAME_DURATION);
    setCompleted(false);
  };

  const handleBack = () => {
    if (isRunning) {
      setShowExitModal(true);
    } else {
      setMode(AppMode.MENU);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Determine color based on game phase
  let timerColor = "text-green-500"; // Normal
  if (timeLeft <= 30) timerColor = "text-fll-yellow"; // End game
  if (timeLeft <= 10) timerColor = "text-fll-red"; // Final countdown

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full animate-in fade-in duration-500 bg-transparent p-4">
      <ConfirmModal
        isOpen={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => setMode(AppMode.MENU)}
      />

      <CompletionModal
        isOpen={completed}
        title="Fim de Jogo!"
        subTitle="Round finalizado com sucesso"
        onReset={handleReset}
        onMenu={() => setMode(AppMode.MENU)}
      />

      <TimerCircle
        totalTime={ROBOT_GAME_DURATION}
        currentTime={timeLeft}
        colorClass={timerColor}
      >
        <div className="text-6xl sm:text-9xl font-mono font-bold tracking-tighter text-base-content tabular-nums drop-shadow-2xl">
          {formatTime(timeLeft)}
        </div>
        <div
          className={`mt-2 text-lg sm:text-xl font-bold uppercase tracking-widest ${
            timeLeft <= 30 ? "text-warning animate-pulse" : "text-neutral"
          }`}
        >
          {timeLeft > 30 ? "Tempo Regular" : "End Game"}
        </div>
      </TimerCircle>

      <ControlBar
        isRunning={isRunning}
        onToggle={handleToggle}
        onReset={handleReset}
        onBack={handleBack}
      />

      {timeLeft <= 30 && timeLeft > 0 && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-warning/20 border border-warning text-warning px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-2 animate-pulse-fast shadow-[0_0_20px_rgba(253,185,19,0.3)] z-10">
          <AlertTriangle size={16} className="sm:w-5 sm:h-5" />
          <span className="font-bold uppercase text-xs sm:text-base">
            End Game
          </span>
        </div>
      )}
    </div>
  );
};
