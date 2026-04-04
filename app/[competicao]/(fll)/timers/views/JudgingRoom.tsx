import React, { useState, useEffect, useRef } from "react";
import { AppMode, DEFAULT_JUDGING_FLOW } from "@/types/TimersType";
import { playSound } from "@/lib/audio";
import { CompletionModal } from "@/components/Timers/CompletionModal";
import { ConfirmModal } from "@/components/Timers/ConfirmModal";
import { ControlBar } from "@/components/Timers/ControlBar";
import { CheckCircle2, BookOpen } from "lucide-react";

interface Props {
  setMode: (mode: AppMode) => void;
}

export const JudgingRoom: React.FC<Props> = ({ setMode }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_JUDGING_FLOW[0].duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const currentStep = DEFAULT_JUDGING_FLOW[currentStepIndex];

  useEffect(() => {
    setTimeLeft(currentStep.duration);
  }, [currentStepIndex]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            playSound("end");

            if (currentStepIndex < DEFAULT_JUDGING_FLOW.length - 1) {
              setCurrentStepIndex((i) => i + 1);
              return DEFAULT_JUDGING_FLOW[currentStepIndex + 1].duration;
            }

            setIsRunning(false);
            setIsFinished(true);
            return 0;
          }

          if (prev <= 5) playSound("tick");
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, currentStepIndex]);

  const handleNextStep = () => {
    if (currentStepIndex < DEFAULT_JUDGING_FLOW.length - 1) {
      setIsRunning(false);
      setCurrentStepIndex((i) => i + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setIsRunning(false);
      setCurrentStepIndex((i) => i - 1);
    }
  };

  const handleBack = () => {
    if (isRunning) setShowExitModal(true);
    else setMode(AppMode.MENU);
  };

  const handleReset = () => {
    setIsFinished(false);
    setIsRunning(false);
    setCurrentStepIndex(0);
    setTimeLeft(DEFAULT_JUDGING_FLOW[0].duration);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const totalDuration = DEFAULT_JUDGING_FLOW.reduce(
    (a, s) => a + s.duration,
    0
  );
  const elapsed =
    DEFAULT_JUDGING_FLOW.slice(0, currentStepIndex).reduce(
      (a, s) => a + s.duration,
      0
    ) +
    (currentStep.duration - timeLeft);

  const progress = Math.min(100, (elapsed / totalDuration) * 100);

  return (
    <div className="relative min-h-[100dvh] w-full bg-base-200/60 overflow-hidden">
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-base-100/40 via-transparent to-base-200/60" />

      <ConfirmModal
        isOpen={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => setMode(AppMode.MENU)}
      />

      <CompletionModal
        isOpen={isFinished}
        title="Avaliação concluída"
        subTitle="Todas as etapas foram finalizadas."
        onReset={handleReset}
        onMenu={() => setMode(AppMode.MENU)}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-base-300/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={handleBack} className="btn btn-ghost btn-sm">
              Voltar ao menu
            </button>
            <div className="flex items-center gap-2 font-medium text-sm text-base-content">
              <BookOpen className="w-4 h-4" />
              Sala de Avaliação
            </div>
          </div>

          <span className="text-xs font-mono text-base-content/50">
            {currentStepIndex + 1} / {DEFAULT_JUDGING_FLOW.length}
          </span>
        </div>

        <div className="h-1 bg-base-300/40">
          <div
            className="h-full bg-base-content/80 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-12 items-center">
        {/* Steps */}
        <aside className="hidden md:flex flex-col gap-3 w-72">
          {DEFAULT_JUDGING_FLOW.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            const isDone = idx < currentStepIndex;

            return (
              <button
                key={step.id}
                onClick={() => {
                  setIsRunning(false);
                  setCurrentStepIndex(idx);
                }}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-xl border text-sm text-left transition-all
                  ${
                    isActive &&
                    "bg-base-100 border-base-300 shadow-sm scale-[1.02]"
                  }
                  ${isDone && "text-base-content/70"}
                  ${
                    !isActive &&
                    !isDone &&
                    "text-base-content/50 border-transparent"
                  }
                  hover:bg-base-100/70
                `}
              >
                <span>{step.label}</span>
                {isDone && <CheckCircle2 size={16} className="text-success" />}
              </button>
            );
          })}
        </aside>

        {/* Timer */}
        <section className="flex-1 flex flex-col items-center text-center">
          <h2 className="text-lg sm:text-xl font-semibold text-base-content">
            {currentStep.label}
          </h2>

          <p className="text-sm text-base-content/60 max-w-md mt-1 mb-10">
            {currentStep.description}
          </p>

          <div
            className={`font-mono font-bold tracking-tight tabular-nums leading-none
              text-[5rem] sm:text-8xl md:text-9xl transition-colors
              ${timeLeft <= 10 ? "text-error" : "text-base-content"}
            `}
          >
            {formatTime(timeLeft)}
          </div>

          <div className="mt-10 w-full max-w-sm">
            <ControlBar
              isRunning={isRunning}
              onToggle={() => {
                if (!isRunning && timeLeft === currentStep.duration)
                  playSound("start");
                setIsRunning(!isRunning);
              }}
              onReset={() => {
                setIsRunning(false);
                setTimeLeft(currentStep.duration);
              }}
              onBack={handleBack}
              onFullscreen={() => {}}
            />
          </div>

          {/* Manual navigation */}
          <div className="flex gap-4 mt-6 text-sm">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="px-4 py-2 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-100/60 disabled:opacity-30 transition"
            >
              Etapa anterior
            </button>

            <button
              onClick={handleNextStep}
              disabled={currentStepIndex === DEFAULT_JUDGING_FLOW.length - 1}
              className="px-4 py-2 rounded-lg bg-base-content text-base-100 hover:bg-base-content/90 disabled:opacity-40 transition"
            >
              Próxima etapa
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
