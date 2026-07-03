"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, BookOpen } from "lucide-react";

import { DEFAULT_JUDGING_FLOW } from "@/types/TimersType";
import { CompletionModal } from "@/components/Timers/CompletionModal";
import { ConfirmModal } from "@/components/Timers/ConfirmModal";
import { ControlBar } from "@/components/Timers/ControlBar";

type JudgingState = {
  currentStepIndex: number;
  timeLeft: number;
  isRunning: boolean;
  isFinished: boolean;
  showExitModal: boolean;
};

type JudgingAction =
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESET" }
  | { type: "TICK" }
  | { type: "SELECT_STEP"; index: number }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "OPEN_EXIT_MODAL" }
  | { type: "CLOSE_EXIT_MODAL" }
  | { type: "FINISH" };

const createInitialState = (): JudgingState => ({
  currentStepIndex: 0,
  timeLeft: DEFAULT_JUDGING_FLOW[0].duration,
  isRunning: false,
  isFinished: false,
  showExitModal: false,
});

function judgingReducer(
  state: JudgingState,
  action: JudgingAction,
): JudgingState {
  switch (action.type) {
    case "START":
      return {
        ...state,
        isRunning: true,
        showExitModal: false,
      };

    case "PAUSE":
      return {
        ...state,
        isRunning: false,
      };

    case "RESET":
      return createInitialState();

    case "SELECT_STEP": {
      const step = DEFAULT_JUDGING_FLOW[action.index];
      if (!step) return state;

      return {
        ...state,
        currentStepIndex: action.index,
        timeLeft: step.duration,
        isRunning: false,
      };
    }

    case "NEXT_STEP": {
      const nextIndex = state.currentStepIndex + 1;
      const nextStep = DEFAULT_JUDGING_FLOW[nextIndex];

      if (!nextStep) return state;

      return {
        ...state,
        currentStepIndex: nextIndex,
        timeLeft: nextStep.duration,
        isRunning: false,
      };
    }

    case "PREV_STEP": {
      const prevIndex = state.currentStepIndex - 1;
      const prevStep = DEFAULT_JUDGING_FLOW[prevIndex];

      if (!prevStep) return state;

      return {
        ...state,
        currentStepIndex: prevIndex,
        timeLeft: prevStep.duration,
        isRunning: false,
      };
    }

    case "TICK": {
      if (!state.isRunning) return state;

      if (state.timeLeft > 1) {
        return {
          ...state,
          timeLeft: state.timeLeft - 1,
        };
      }

      const nextIndex = state.currentStepIndex + 1;
      const nextStep = DEFAULT_JUDGING_FLOW[nextIndex];

      if (nextStep) {
        return {
          ...state,
          currentStepIndex: nextIndex,
          timeLeft: nextStep.duration,
          isRunning: true,
        };
      }

      return {
        ...state,
        timeLeft: 0,
        isRunning: false,
        isFinished: true,
      };
    }

    case "OPEN_EXIT_MODAL":
      return {
        ...state,
        showExitModal: true,
      };

    case "CLOSE_EXIT_MODAL":
      return {
        ...state,
        showExitModal: false,
      };

    case "FINISH":
      return {
        ...state,
        isRunning: false,
        isFinished: true,
      };

    default:
      return state;
  }
}

interface Props {
  onBack?: () => void;
}

export function JudgingRoom({ onBack }: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [state, dispatch] = useReducer(
    judgingReducer,
    undefined,
    createInitialState,
  );

  const currentStep = useMemo(
    () => DEFAULT_JUDGING_FLOW[state.currentStepIndex],
    [state.currentStepIndex],
  );

  const totalDuration = useMemo(
    () => DEFAULT_JUDGING_FLOW.reduce((acc, step) => acc + step.duration, 0),
    [],
  );

  const elapsed = useMemo(() => {
    const spentBeforeCurrent = DEFAULT_JUDGING_FLOW.slice(
      0,
      state.currentStepIndex,
    ).reduce((acc, step) => acc + step.duration, 0);

    return spentBeforeCurrent + (currentStep.duration - state.timeLeft);
  }, [currentStep.duration, state.currentStepIndex, state.timeLeft]);

  const progress = useMemo(() => {
    if (totalDuration === 0) return 0;
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  }, [elapsed, totalDuration]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  const handleBack = useCallback(() => {
    if (state.isRunning) {
      dispatch({ type: "OPEN_EXIT_MODAL" });
      return;
    }

    if (onBack) {
      onBack();
      return;
    }

    router.back();
  }, [onBack, router, state.isRunning]);

  const handleConfirmExit = useCallback(() => {
    dispatch({ type: "CLOSE_EXIT_MODAL" });

    if (onBack) {
      onBack();
      return;
    }

    router.back();
  }, [onBack, router]);

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const handleToggle = useCallback(() => {
    if (state.isFinished) {
      dispatch({ type: "RESET" });
      return;
    }

    dispatch({ type: state.isRunning ? "PAUSE" : "START" });
  }, [state.isFinished, state.isRunning]);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      void containerRef.current?.requestFullscreen();
      return;
    }

    void document.exitFullscreen();
  }, []);

  useEffect(() => {
    if (!state.isRunning || state.isFinished) return;

    const intervalId = window.setInterval(() => {
      dispatch({ type: "TICK" });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [state.isFinished, state.isRunning]);

  useEffect(() => {
    if (!state.isFinished) return;

    dispatch({ type: "PAUSE" });
  }, [state.isFinished]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-[100dvh] w-full overflow-hidden bg-base-200/60"
    >
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-base-100/40 via-transparent to-base-200/60" />
      <ConfirmModal
        isOpen={state.showExitModal}
        onCancel={() => dispatch({ type: "CLOSE_EXIT_MODAL" })}
        onConfirm={handleConfirmExit}
      />
      <CompletionModal
        isOpen={state.isFinished}
        title="Avaliação concluída"
        subTitle="Todas as etapas foram finalizadas."
        onReset={handleReset}
        onMenu={handleBack}
      />
      <header className="relative z-10 border-b border-base-300/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex flex-1 items-center gap-4">
            <button onClick={handleBack} className="btn btn-ghost btn-sm">
              Voltar
            </button>

            <div className="flex items-center gap-2 text-sm font-medium text-base-content">
              <BookOpen className="h-4 w-4" />
              Sala de Avaliação
            </div>
          </div>

          <span className="font-mono text-xs text-base-content/50">
            {state.currentStepIndex + 1} / {DEFAULT_JUDGING_FLOW.length}
          </span>
        </div>

        <div className="h-1 bg-base-300/40">
          <div
            className="h-full bg-base-content/80 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>
      <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 py-10 md:flex-row">
        <aside className="hidden w-72 flex-col gap-3 md:flex">
          {DEFAULT_JUDGING_FLOW.map((step, idx) => {
            const isActive = idx === state.currentStepIndex;
            const isDone = idx < state.currentStepIndex;

            return (
              <button
                key={step.id}
                onClick={() => dispatch({ type: "SELECT_STEP", index: idx })}
                className={[
                  "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all",
                  isActive
                    ? "scale-[1.02] border-base-300 bg-base-100 shadow-sm"
                    : "border-transparent",
                  isDone ? "text-base-content/70" : "text-base-content/50",
                  !isActive && !isDone ? "hover:bg-base-100/70" : "",
                ].join(" ")}
              >
                <span>{step.label}</span>
                {isDone && <CheckCircle2 size={16} className="text-success" />}
              </button>
            );
          })}
        </aside>

        <section className="flex flex-1 flex-col items-center text-center">
          <h2 className="text-lg font-semibold text-base-content sm:text-xl">
            {currentStep.label}
          </h2>

          <p className="mt-1 mb-10 max-w-md text-sm text-base-content/60">
            {currentStep.description}
          </p>

          <div
            className={`font-mono text-[5rem] font-bold leading-none tracking-tight tabular-nums transition-colors sm:text-8xl md:text-9xl ${
              state.timeLeft <= 10 ? "text-error" : "text-base-content"
            }`}
          >
            {formatTime(state.timeLeft)}
          </div>

          <div className="mt-10 w-full max-w-sm">
            <ControlBar
              isRunning={state.isRunning}
              onToggle={handleToggle}
              onReset={handleReset}
              onBack={handleBack}
              onFullscreen={handleFullscreen}
            />
          </div>

          <div className="mt-6 flex gap-4 text-sm">
            <button
              onClick={() => dispatch({ type: "PREV_STEP" })}
              disabled={state.currentStepIndex === 0}
              className="rounded-lg px-4 py-2 text-base-content/60 transition hover:bg-base-100/60 hover:text-base-content disabled:opacity-30"
            >
              Etapa anterior
            </button>

            <button
              onClick={() => dispatch({ type: "NEXT_STEP" })}
              disabled={
                state.currentStepIndex === DEFAULT_JUDGING_FLOW.length - 1
              }
              className="rounded-lg bg-base-content px-4 py-2 text-base-100 transition hover:bg-base-content/90 disabled:opacity-40"
            >
              Próxima etapa
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}