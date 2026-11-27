"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, cn } from "@/components/stage";
import { TimerShell, formatTimer, toggleFullscreen } from "@/features/timers/components/TimerShell";

import { DEFAULT_JUDGING_FLOW } from "@/features/timers/types";
import { CompletionModal } from "@/features/timers/components/CompletionModal";
import { ConfirmModal } from "@/features/timers/components/ConfirmModal";
import { ControlBar } from "@/features/timers/components/ControlBar";

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

  const formatTime = formatTimer;

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

  const handleFullscreen = useCallback(() => toggleFullscreen(containerRef.current), []);

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

  const isLast = state.currentStepIndex === DEFAULT_JUDGING_FLOW.length - 1;
  const stepProgress = currentStep.duration > 0 ? 1 - state.timeLeft / currentStep.duration : 0;
  const statusTone = state.isFinished ? "finished" : state.isRunning ? "running" : elapsed > 0 ? "paused" : "idle";
  const statusLabel = state.isFinished
    ? "Concluída"
    : `Etapa ${state.currentStepIndex + 1}/${DEFAULT_JUDGING_FLOW.length}${!state.isRunning && elapsed > 0 ? " · pausado" : ""}`;

  return (
    <TimerShell
      containerRef={containerRef}
      kicker="Sala de avaliação"
      status={{ tone: statusTone, label: statusLabel }}
      onBack={handleBack}
      onFullscreen={handleFullscreen}
      below={
        <div className="relative h-1.5 bg-base-300/70" role="progressbar" aria-label="Progresso da avaliação" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-primary transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>
      }
    >
      <ConfirmModal
        isOpen={state.showExitModal}
        onCancel={() => dispatch({ type: "CLOSE_EXIT_MODAL" })}
        onConfirm={handleConfirmExit}
        message="A avaliação está em andamento. Se você sair agora, o tempo das etapas será perdido."
      />
      <CompletionModal
        isOpen={state.isFinished}
        title="Avaliação concluída"
        subTitle="Todas as etapas foram finalizadas."
        details={[
          { label: "Etapas", value: DEFAULT_JUDGING_FLOW.length },
          { label: "Tempo total", value: formatTime(totalDuration) },
        ]}
        onReset={handleReset}
        onMenu={handleBack}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-8 sm:px-6 md:flex-row md:items-center md:gap-14">
        {/* ===== ETAPAS ===== */}
        <aside className="order-2 w-full md:order-1 md:w-80 md:shrink-0">
          <p className="stage-kicker mb-3 text-base-content/50">/ Roteiro · {formatTime(totalDuration)}</p>
          <ol className="relative space-y-2">
            {DEFAULT_JUDGING_FLOW.map((step, idx) => {
              const isActive = idx === state.currentStepIndex;
              const isDone = idx < state.currentStepIndex || state.isFinished;
              return (
                <li key={`${step.id}-${idx}`}>
                  <button
                    onClick={() => dispatch({ type: "SELECT_STEP", index: idx })}
                    aria-current={isActive ? "step" : undefined}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm border px-3 py-2.5 text-left transition-[transform,background-color,border-color,box-shadow]",
                      isActive
                        ? "stage-shadow -translate-x-0.5 -translate-y-0.5 border-base-content bg-base-100"
                        : "border-transparent hover:border-base-300 hover:bg-base-100/70",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-tl-md rounded-br-md font-mono text-xs font-bold",
                        isDone ? "bg-success text-success-content" : isActive ? "bg-primary text-primary-content" : "bg-base-300/70 text-base-content/60",
                      )}
                    >
                      {isDone ? <Check size={15} strokeWidth={3} /> : idx + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate text-sm font-bold", !isActive && !isDone && "text-base-content/60")}>{step.label}</span>
                      <span className="block truncate text-[11px] text-base-content/50">{step.description}</span>
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-base-content/50">{formatTime(step.duration)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        {/* ===== ETAPA ATUAL ===== */}
        <section className="order-1 flex flex-1 flex-col items-center text-center md:order-2">
          <p className="stage-kicker text-primary">/ Etapa {state.currentStepIndex + 1}</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{currentStep.label}</h2>
          <p className="mt-1 max-w-md text-sm text-base-content/60">{currentStep.description}</p>

          <div className="stage-ink stage-shadow-lg mt-8 w-full max-w-lg rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-lg rounded-bl-lg bg-base-100 px-6 pb-6 pt-8">
            <div
              className={cn(
                "stage-display text-[5.5rem] leading-none tabular-nums transition-colors sm:text-9xl",
                state.timeLeft <= 10 && !state.isFinished ? "text-primary" : state.timeLeft <= 60 ? "text-warning" : "text-base-content",
              )}
              aria-live="off"
            >
              {formatTime(state.timeLeft)}
            </div>
            {/* progresso da etapa */}
            <div className="mt-6 h-2.5 overflow-hidden rounded-full border border-base-content/15 bg-base-200">
              <div
                className={cn("h-full rounded-full transition-[width] duration-1000 ease-linear", state.timeLeft <= 10 ? "bg-primary" : "bg-base-content")}
                style={{ width: `${Math.min(100, stepProgress * 100)}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[11px] text-base-content/45">
              <span>{formatTime(currentStep.duration - state.timeLeft)} usados</span>
              <span>{isLast ? "última etapa" : `depois: ${DEFAULT_JUDGING_FLOW[state.currentStepIndex + 1].label}`}</span>
            </div>
          </div>

          <ControlBar isRunning={state.isRunning} onToggle={handleToggle} onReset={handleReset} onBack={handleBack} onFullscreen={handleFullscreen} />

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button tone="outline" size="sm" iconLeft={<ChevronLeft size={16} />} onClick={() => dispatch({ type: "PREV_STEP" })} disabled={state.currentStepIndex === 0}>
              Etapa anterior
            </Button>
            <Button tone="ink" size="sm" iconRight={<ChevronRight size={16} />} onClick={() => dispatch({ type: "NEXT_STEP" })} disabled={isLast}>
              Próxima etapa
            </Button>
          </div>
        </section>
      </div>
    </TimerShell>
  );
}
