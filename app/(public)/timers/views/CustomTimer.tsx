import React, { useState, useEffect, useRef } from "react";
import { AppMode } from "@/types/TimersType";
import { Mic, Plus, Minus, ArrowLeftCircleIcon } from "lucide-react";
import { playSound } from "@/lib/audio";
import { CompletionModal } from "@/components/Timers/CompletionModal";
import { ConfirmModal } from "@/components/Timers/ConfirmModal";
import { ControlBar } from "@/components/Timers/ControlBar";
import { TimerCircle } from "@/components/Timers/TimerCircle";

interface Props {
  setMode: (mode: AppMode) => void;
}

export const CustomTimer: React.FC<Props> = ({ setMode }) => {
  const [initialTime, setInitialTime] = useState(300);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            playSound("end");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const adjustTime = (delta: number) => {
    if (isRunning) return;
    const newTime = Math.max(60, Math.min(3600, initialTime + delta));
    setInitialTime(newTime);
    setTimeLeft(newTime);
  };

  const handleReset = () => {
    setIsFinished(false);
    setIsRunning(false);
    setTimeLeft(initialTime);
  };

  const handleBack = () => {
    if (isRunning) setShowExitModal(true);
    else setMode(AppMode.MENU);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-base-200/60">
      {/* Decorative grid */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:28px_28px]" />

      {/* Soft overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-base-100/40 via-transparent to-base-200/60" />

      <ConfirmModal
        isOpen={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => setMode(AppMode.MENU)}
      />

      <CompletionModal
        isOpen={isFinished}
        title="Tempo encerrado"
        subTitle="Apresentação finalizada."
        onReset={handleReset}
        onMenu={() => setMode(AppMode.MENU)}
      />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md mx-auto rounded-3xl bg-base-100/80 backdrop-blur-xl border border-base-300 shadow-2xl p-8 sm:p-10 animate-in zoom-in-95 duration-300">
        <button 
          onClick={handleBack}
          className="absolute top-4 left-4 btn btn-ghost btn-circle btn-sm"
          aria-label="Voltar ao menu"
        >
          <ArrowLeftCircleIcon size={20} />
        </button>
        {/* Timer */}
        <TimerCircle
          totalTime={initialTime}
          currentTime={timeLeft}
          colorClass="text-success"
        >
          <div className="text-6xl sm:text-7xl font-mono font-bold text-base-content tabular-nums">
            {formatTime(timeLeft)}
          </div>

          {!isRunning && timeLeft === initialTime && (
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={() => adjustTime(-60)}
                className="btn btn-circle btn-sm bg-base-200 hover:bg-error/20 hover:text-error border border-base-300"
              >
                <Minus size={18} />
              </button>

              <span className="text-xs font-mono font-semibold text-base-content/60">
                AJUSTAR TEMPO
              </span>

              <button
                onClick={() => adjustTime(60)}
                className="btn btn-circle btn-sm bg-base-200 hover:bg-success/20 hover:text-success border border-base-300"
              >
                <Plus size={18} />
              </button>
            </div>
          )}
        </TimerCircle>

        {/* Controls */}
        <div className="mt-8">
          <ControlBar
            isRunning={isRunning}
            onToggle={() => setIsRunning(!isRunning)}
            onReset={handleReset}
            onBack={handleBack}
            onFullscreen={() => {}}
          />
        </div>
      </div>
    </div>
  );
};