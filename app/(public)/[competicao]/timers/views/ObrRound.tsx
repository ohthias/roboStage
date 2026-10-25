"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  ArrowLeftCircleIcon,
  Bell,
  BellOff,
  Flag,
  MinusCircle,
  SkipForward,
  Undo2,
  Wrench,
} from "lucide-react";

import { playSound } from "@/utils/audio";
import { CompletionModal } from "@/components/Timers/CompletionModal";
import { ConfirmModal } from "@/components/Timers/ConfirmModal";
import { ControlBar } from "@/components/Timers/ControlBar";
import { TimerCircle } from "@/components/Timers/TimerCircle";

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
    <div
      ref={containerRef}
      className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-base-200/60"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:28px_28px] opacity-[0.04]" />

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
        onReset={() => dispatch({ type: "RESET" })}
        onMenu={goBack}
      />

      {/* ===== BARRA SUPERIOR ===== */}
      <header className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6">
        <button onClick={handleBack} className="btn btn-ghost btn-circle btn-sm" aria-label="Voltar">
          <ArrowLeftCircleIcon size={20} />
        </button>

        <div className="flex items-center gap-2 rounded-full border border-base-300 bg-base-100/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-base-content/70 backdrop-blur">
          <span
            className={`h-2 w-2 rounded-full ${
              isRunning ? "animate-pulse bg-success" : phase === "finished" ? "bg-error" : "bg-warning"
            }`}
          />
          OBR · {PHASE_LABEL[phase]}
          {!isRunning && phase !== "idle" && phase !== "finished" && " (pausado)"}
        </div>

        <button
          onClick={() => dispatch({ type: "TOGGLE_MUTE" })}
          className="btn btn-ghost btn-circle btn-sm"
          aria-label={muted ? "Ativar som" : "Silenciar"}
        >
          {muted ? <BellOff size={18} /> : <Bell size={18} />}
        </button>
      </header>

      <main className="relative z-10 flex flex-1 flex-col gap-6 px-4 pb-8 sm:px-6 lg:flex-row lg:items-stretch lg:gap-8 lg:px-10">
        {/* ===== CRONÔMETRO ===== */}
        <section className="flex flex-1 flex-col items-center justify-center py-4">
          {/* etapas */}
          <ol className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
            <li
              className={`flex items-center gap-1 rounded-full px-3 py-1 ${
                phase === "calibration" ? "bg-info text-info-content" : "bg-base-100 text-base-content/50"
              }`}
            >
              <Wrench size={12} /> Calibração · 2min
            </li>
            <li className="text-base-content/30">→</li>
            <li
              className={`flex items-center gap-1 rounded-full px-3 py-1 ${
                phase === "round" ? "bg-success text-success-content" : "bg-base-100 text-base-content/50"
              }`}
            >
              <Flag size={12} /> Round · 5min
            </li>
          </ol>

          <TimerCircle totalTime={total} currentTime={timeLeft} colorClass={circleColor}>
            <div className="flex flex-col items-center">
              <span className="font-mono text-6xl font-bold tabular-nums text-base-content sm:text-7xl">
                {formatTime(timeLeft)}
              </span>
              <span className="mt-1 text-xs uppercase tracking-widest text-base-content/50">
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
            <button
              onClick={() => dispatch({ type: "SKIP_CALIBRATION" })}
              className="btn btn-ghost btn-sm mt-4 gap-2"
            >
              <SkipForward size={16} />
              {phase === "idle" ? "Ir direto para o round" : "Encerrar calibração e iniciar round"}
            </button>
          )}
        </section>

        {/* ===== PAINEL DE CHECKPOINTS ===== */}
        <aside className="w-full shrink-0 lg:w-[340px]">
          <div className="rounded-3xl border border-base-300 bg-base-100/80 p-6 shadow-xl backdrop-blur-xl">
            <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-widest text-base-content/50">
              Desistência de checkpoint
            </p>

            <button
              onClick={() => dispatch({ type: "GIVE_UP" })}
              disabled={!canGiveUp}
              className="btn btn-error btn-lg w-full gap-2"
            >
              <MinusCircle size={22} />
              Marcar desistência (-1min)
            </button>

            <button
              onClick={() => dispatch({ type: "UNDO_GIVE_UP" })}
              disabled={!canUndo}
              className="btn btn-ghost btn-sm mt-3 w-full gap-2"
            >
              <Undo2 size={16} />
              Desfazer última (+1min)
            </button>

            {!canGiveUp && phase !== "finished" && (
              <p className="mt-3 text-center text-xs text-base-content/50">
                Disponível durante o round.
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-neutral px-4 py-3 text-neutral-content">
                <p className="text-[10px] uppercase tracking-widest opacity-60">Desistências</p>
                <p className="font-mono text-3xl font-bold tabular-nums">{giveUps.length}</p>
              </div>
              <div className="rounded-2xl bg-neutral px-4 py-3 text-neutral-content">
                <p className="text-[10px] uppercase tracking-widest opacity-60">Tempo retirado</p>
                <p className="font-mono text-3xl font-bold tabular-nums">-{formatTime(penalty)}</p>
              </div>
            </div>

            {giveUps.length > 0 && (
              <ul className="mt-4 max-h-40 space-y-1 overflow-y-auto text-sm">
                {giveUps.map((at, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-base-200 px-3 py-1.5"
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
              <button
                onClick={() => dispatch({ type: "FINISH" })}
                className="btn btn-outline btn-sm mt-5 w-full"
              >
                Encerrar round agora
              </button>
            )}

            <p className="mt-5 text-[11px] leading-relaxed text-base-content/40">
              Atalhos: <kbd className="kbd kbd-xs">Espaço</kbd> iniciar/pausar ·{" "}
              <kbd className="kbd kbd-xs">D</kbd> desistência · <kbd className="kbd kbd-xs">Z</kbd> desfazer
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
