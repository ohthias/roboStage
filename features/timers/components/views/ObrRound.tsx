"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  Flag,
  MinusCircle,
  SkipForward,
  Undo2,
  Wrench,
} from "lucide-react";

import { playSound } from "@/lib/audio";
import { CompletionModal } from "@/features/timers/components/CompletionModal";
import { ConfirmModal } from "@/features/timers/components/ConfirmModal";
import { ControlBar } from "@/features/timers/components/ControlBar";
import { TimerCircle } from "@/features/timers/components/TimerCircle";
import { TimerShell } from "@/features/timers/components/TimerShell";
import { Button, Kbd, cn } from "@/components/stage";

/* ================= REGRAS OBR ================= */
export const OBR_CALIBRATION_SECONDS = 2 * 60; // 2min de calibração
export const OBR_ROUND_SECONDS = 5 * 60; // 5min de round
export const OBR_CHECKPOINT_PENALTY = 60; // -1min por desistência de checkpoint

type Phase = "idle" | "calibration" | "round" | "finished";

type State = {
  phase: Phase;
  timeLeft: number;
  isRunning: boolean;
  giveUps: number[]; // instante (tempo restante) em que cada desistência foi marcada
  showExitModal: boolean;
  muted: boolean;
};

type Action =
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "TICK" }
  | { type: "SKIP_CALIBRATION" }
  | { type: "GIVE_UP" }
  | { type: "UNDO_GIVE_UP" }
  | { type: "FINISH" }
  | { type: "RESET" }
  | { type: "TOGGLE_MUTE" }
  | { type: "OPEN_EXIT" }
  | { type: "CLOSE_EXIT" };

const initialState = (muted = false): State => ({
  phase: "idle",
  timeLeft: OBR_CALIBRATION_SECONDS,
  isRunning: false,
  giveUps: [],
  showExitModal: false,
  muted,
});

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      if (state.phase !== "idle") return state;
      return { ...state, phase: "calibration", timeLeft: OBR_CALIBRATION_SECONDS, isRunning: true };

    case "PAUSE":
      return { ...state, isRunning: false };

    case "RESUME":
      if (state.phase === "idle" || state.phase === "finished") return state;
      return { ...state, isRunning: true };

    case "TICK": {
      if (!state.isRunning) return state;
      if (state.timeLeft > 1) return { ...state, timeLeft: state.timeLeft - 1 };

      // fim da calibração -> round começa automaticamente
      if (state.phase === "calibration") {
        return { ...state, phase: "round", timeLeft: OBR_ROUND_SECONDS, isRunning: true };
      }
      return { ...state, phase: "finished", timeLeft: 0, isRunning: false };
    }

    case "SKIP_CALIBRATION":
      if (state.phase !== "idle" && state.phase !== "calibration") return state;
      return { ...state, phase: "round", timeLeft: OBR_ROUND_SECONDS, isRunning: true };

    case "GIVE_UP": {
      if (state.phase !== "round") return state;
      const giveUps = [...state.giveUps, state.timeLeft];
      const timeLeft = state.timeLeft - OBR_CHECKPOINT_PENALTY;
      if (timeLeft <= 0) {
        return { ...state, giveUps, phase: "finished", timeLeft: 0, isRunning: false };
      }
      return { ...state, giveUps, timeLeft };
    }

    case "UNDO_GIVE_UP": {
      if (state.giveUps.length === 0) return state;
      if (state.phase !== "round" && state.phase !== "finished") return state;
      const giveUps = state.giveUps.slice(0, -1);
      const timeLeft = Math.min(OBR_ROUND_SECONDS, state.timeLeft + OBR_CHECKPOINT_PENALTY);
      // desfazer uma desistência que encerrou o round reabre o round pausado
      return { ...state, giveUps, timeLeft, phase: "round", isRunning: state.phase === "round" && state.isRunning };
    }

    case "FINISH":
      if (state.phase !== "round") return state;
      return { ...state, phase: "finished", isRunning: false };

    case "RESET":
      return initialState(state.muted);

    case "TOGGLE_MUTE":
      return { ...state, muted: !state.muted };

    case "OPEN_EXIT":
      return { ...state, showExitModal: true };

    case "CLOSE_EXIT":
      return { ...state, showExitModal: false };

    default:
      return state;
  }
}

const PHASE_LABEL: Record<Phase, string> = {
  idle: "Pronto",
  calibration: "Calibração",
  round: "Round",
  finished: "Encerrado",
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

interface Props {
  backHref?: string;
}

export function ObrRound({ backHref = "/obr/timers" }: Props) {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevPhase = useRef<Phase>(state.phase);

  const { phase, timeLeft, isRunning, giveUps, muted } = state;
  const total = phase === "round" || phase === "finished" ? OBR_ROUND_SECONDS : OBR_CALIBRATION_SECONDS;
  const penalty = giveUps.length * OBR_CHECKPOINT_PENALTY;

  /* ================= MOTOR ================= */
  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  /* ================= SONS ================= */
  useEffect(() => {
    const before = prevPhase.current;
    prevPhase.current = phase;
    if (muted || before === phase) return;
    if (phase === "round") playSound("start");
    if (phase === "finished") playSound("end");
  }, [phase, muted]);

  useEffect(() => {
    if (muted || !isRunning) return;
    if (phase === "round" && (timeLeft === 60 || timeLeft === 30)) playSound("warning");
    if (timeLeft <= 5 && timeLeft > 0) playSound("tick");
  }, [timeLeft, phase, isRunning, muted]);

  /* ================= AÇÕES ================= */
  const goBack = useCallback(() => {
    window.location.href = backHref;
  }, [backHref]);

  const handleBack = useCallback(() => {
    if (isRunning) {
      dispatch({ type: "OPEN_EXIT" });
      return;
    }
    goBack();
  }, [isRunning, goBack]);

  const handleToggle = useCallback(() => {
    if (phase === "idle") return dispatch({ type: "START" });
    if (phase === "finished") return dispatch({ type: "RESET" });
    dispatch({ type: isRunning ? "PAUSE" : "RESUME" });
  }, [phase, isRunning]);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      void containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      void document.exitFullscreen().catch(() => {});
    }
  }, []);

  // atalhos: espaço = iniciar/pausar, D = desistência, Z = desfazer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.code === "Space") {
        e.preventDefault();
        handleToggle();
      } else if (e.key.toLowerCase() === "d") {
        dispatch({ type: "GIVE_UP" });
      } else if (e.key.toLowerCase() === "z") {
        dispatch({ type: "UNDO_GIVE_UP" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleToggle]);

  const ratio = total > 0 ? timeLeft / total : 0;
  const circleColor =
    phase === "calibration"
      ? "text-info"
      : phase === "finished"
        ? "text-error"
        : ratio > 0.5
          ? "text-success"
          : ratio > 0.2
            ? "text-warning"
            : "text-error";

  const canGiveUp = phase === "round";
  const canUndo = giveUps.length > 0 && (phase === "round" || phase === "finished");

  return (
    <TimerShell
      containerRef={containerRef}
      kicker="Round OBR"
      status={{
        tone: isRunning ? "running" : phase === "finished" ? "finished" : phase === "idle" ? "idle" : "paused",
        label: `OBR · ${PHASE_LABEL[phase]}${!isRunning && phase !== "idle" && phase !== "finished" ? " · pausado" : ""}`,
      }}
      onBack={handleBack}
      muted={muted}
      onToggleMute={() => dispatch({ type: "TOGGLE_MUTE" })}
      onFullscreen={handleFullscreen}
    >
      <ConfirmModal
        isOpen={state.showExitModal}
        onCancel={() => dispatch({ type: "CLOSE_EXIT" })}
        onConfirm={() => {
          dispatch({ type: "CLOSE_EXIT" });
          goBack();
        }}
      />
      <CompletionModal
        isOpen={phase === "finished"}
        title="Round encerrado"
        subTitle={
          giveUps.length > 0
            ? `${giveUps.length} desistência(s) de checkpoint · -${formatTime(penalty)}`
            : "Nenhuma desistência de checkpoint."
        }
        details={[
          { label: "Desistências", value: giveUps.length },
          { label: "Tempo retirado", value: `-${formatTime(penalty)}` },
        ]}
        onReset={() => dispatch({ type: "RESET" })}
        onMenu={goBack}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pb-10 sm:px-6 lg:flex-row lg:items-center lg:gap-12">
        {/* ===== CRONÔMETRO ===== */}
        <section className="flex flex-1 flex-col items-center justify-center py-4">
          {/* etapas */}
          <ol className="mb-8 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em]">
            <li
              className={cn(
                "flex items-center gap-1.5 rounded-tl-md rounded-br-md border px-3 py-1",
                phase === "calibration" ? "stage-shadow-sm border-base-content bg-info text-info-content" : "border-base-300 bg-base-100 text-base-content/50",
              )}
            >
              <Wrench size={12} /> Calibração · 2min
            </li>
            <li className="text-base-content/30">→</li>
            <li
              className={cn(
                "flex items-center gap-1.5 rounded-tl-md rounded-br-md border px-3 py-1",
                phase === "round" ? "stage-shadow-sm border-base-content bg-success text-success-content" : "border-base-300 bg-base-100 text-base-content/50",
              )}
            >
              <Flag size={12} /> Round · 5min
            </li>
          </ol>

          <TimerCircle totalTime={total} currentTime={timeLeft} colorClass={circleColor}>
            <div className="flex flex-col items-center">
              <span className="stage-display text-6xl leading-none tabular-nums text-base-content sm:text-7xl">
                {formatTime(timeLeft)}
              </span>
              <span className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-base-content/45">
                {phase === "idle" ? "toque ▶ para calibrar" : PHASE_LABEL[phase]}
              </span>
            </div>
          </TimerCircle>

          <div className="w-full max-w-md">
            <ControlBar
              isRunning={isRunning}
              onToggle={handleToggle}
              onReset={() => dispatch({ type: "RESET" })}
              onBack={handleBack}
              onFullscreen={handleFullscreen}
              isFullscreen
            />
          </div>

          {(phase === "idle" || phase === "calibration") && (
            <Button tone="ghost" size="sm" className="mt-4" iconLeft={<SkipForward size={16} />} onClick={() => dispatch({ type: "SKIP_CALIBRATION" })}>
              {phase === "idle" ? "Ir direto para o round" : "Encerrar calibração e iniciar round"}
            </Button>
          )}
        </section>

        {/* ===== PAINEL DE CHECKPOINTS ===== */}
        <aside className="w-full shrink-0 lg:w-[340px]">
          <div className="stage-ink stage-shadow rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-lg rounded-bl-lg bg-base-100 p-5">
            <p className="stage-kicker mb-4 text-base-content/50">/ Desistência de checkpoint</p>

            <Button tone="primary" size="lg" className="w-full" iconLeft={<MinusCircle size={22} />} onClick={() => dispatch({ type: "GIVE_UP" })} disabled={!canGiveUp}>
              Marcar desistência (-1min)
            </Button>

            <Button tone="ghost" size="sm" className="mt-3 w-full" iconLeft={<Undo2 size={16} />} onClick={() => dispatch({ type: "UNDO_GIVE_UP" })} disabled={!canUndo}>
              Desfazer última (+1min)
            </Button>

            {!canGiveUp && phase !== "finished" && (
              <p className="mt-3 text-center text-xs text-base-content/50">
                Disponível durante o round.
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="stage-night rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm px-4 py-3 text-white">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] opacity-60">Desistências</p>
                <p className="stage-display text-3xl leading-tight tabular-nums">{giveUps.length}</p>
              </div>
              <div className="stage-night rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm px-4 py-3 text-white">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] opacity-60">Tempo retirado</p>
                <p className="stage-display text-3xl leading-tight tabular-nums">-{formatTime(penalty)}</p>
              </div>
            </div>

            {giveUps.length > 0 && (
              <ul className="mt-4 max-h-40 space-y-1 overflow-y-auto text-sm">
                {giveUps.map((at, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-md border border-base-300 bg-base-200/60 px-3 py-1.5"
                  >
                    <span>#{i + 1}</span>
                    <span className="font-mono tabular-nums text-base-content/60">
                      em {formatTime(at)} → {formatTime(Math.max(0, at - OBR_CHECKPOINT_PENALTY))}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {phase === "round" && (
              <Button tone="outline" size="sm" className="mt-5 w-full" onClick={() => dispatch({ type: "FINISH" })}>
                Encerrar round agora
              </Button>
            )}

            <p className="mt-5 text-[11px] leading-relaxed text-base-content/40">
              Atalhos: <Kbd>Espaço</Kbd> iniciar/pausar · <Kbd>D</Kbd> desistência · <Kbd>Z</Kbd> desfazer
            </p>
          </div>
        </aside>
      </div>
    </TimerShell>
  );
}
