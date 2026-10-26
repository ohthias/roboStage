"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { playSound } from "@/utils/audio";
import { ROUND_MAX_SECONDS } from "./scoring";

/* ================= REGRAS ================= */
export const OBR_CALIBRATION_SECONDS = 2 * 60; // 2min de calibração
export const OBR_ROUND_SECONDS = ROUND_MAX_SECONDS; // 5min de round
export const OBR_CHECKPOINT_PENALTY = 60; // -1min por desistência de checkpoint

export type RoundPhase = "idle" | "calibration" | "round" | "finished";

export type RoundTimerState = {
  phase: RoundPhase;
  /** tempo restante da fase atual (s) */
  timeLeft: number;
  /** segundos reais corridos no round (sem contar penalidades) */
  elapsed: number;
  isRunning: boolean;
  /** tempo restante no instante de cada desistência */
  giveUps: number[];
  muted: boolean;
};

export type RoundTimerAction =
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "TICK" }
  | { type: "SKIP_CALIBRATION" }
  | { type: "GIVE_UP" }
  | { type: "UNDO_GIVE_UP" }
  | { type: "FINISH" }
  | { type: "RESET" }
  | { type: "TOGGLE_MUTE" };

export const initialRoundTimer = (muted = false): RoundTimerState => ({
  phase: "idle",
  timeLeft: OBR_CALIBRATION_SECONDS,
  elapsed: 0,
  isRunning: false,
  giveUps: [],
  muted,
});

const startRound = (s: RoundTimerState): RoundTimerState => ({
  ...s,
  phase: "round",
  timeLeft: OBR_ROUND_SECONDS,
  elapsed: 0,
  isRunning: true,
});

export function roundTimerReducer(
  state: RoundTimerState,
  action: RoundTimerAction,
): RoundTimerState {
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
      const elapsed = state.phase === "round" ? state.elapsed + 1 : state.elapsed;
      if (state.timeLeft > 1) return { ...state, timeLeft: state.timeLeft - 1, elapsed };
      // fim da calibração -> round começa sozinho
      if (state.phase === "calibration") return startRound(state);
      return { ...state, phase: "finished", timeLeft: 0, elapsed, isRunning: false };
    }

    case "SKIP_CALIBRATION":
      if (state.phase !== "idle" && state.phase !== "calibration") return state;
      return startRound(state);

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
      return {
        ...state,
        giveUps: state.giveUps.slice(0, -1),
        timeLeft: Math.min(OBR_ROUND_SECONDS, state.timeLeft + OBR_CHECKPOINT_PENALTY),
        phase: "round",
        // desfazer a desistência que encerrou o round reabre pausado
        isRunning: state.phase === "round" && state.isRunning,
      };
    }

    case "FINISH":
      if (state.phase !== "round") return state;
      return { ...state, phase: "finished", isRunning: false };

    case "RESET":
      return initialRoundTimer(state.muted);

    case "TOGGLE_MUTE":
      return { ...state, muted: !state.muted };

    default:
      return state;
  }
}

/** Cronômetro de round da OBR: calibração (2min) → round (5min), com desistências. */
export function useObrRoundTimer() {
  const [state, dispatch] = useReducer(roundTimerReducer, undefined, () => initialRoundTimer());
  const prevPhase = useRef<RoundPhase>(state.phase);
  const { phase, timeLeft, isRunning, muted } = state;

  // motor
  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  // sons de troca de fase
  useEffect(() => {
    const before = prevPhase.current;
    prevPhase.current = phase;
    if (muted || before === phase) return;
    if (phase === "round") playSound("start");
    if (phase === "finished") playSound("end");
  }, [phase, muted]);

  // avisos de tempo
  useEffect(() => {
    if (muted || !isRunning) return;
    if (phase === "round" && (timeLeft === 60 || timeLeft === 30)) playSound("warning");
    if (timeLeft <= 5 && timeLeft > 0) playSound("tick");
  }, [timeLeft, phase, isRunning, muted]);

  const total =
    phase === "round" || phase === "finished" ? OBR_ROUND_SECONDS : OBR_CALIBRATION_SECONDS;

  /** liga/desliga conforme a fase: inicia, pausa, retoma ou reinicia */
  const toggle = useCallback(() => {
    if (phase === "idle") return dispatch({ type: "START" });
    if (phase === "finished") return dispatch({ type: "RESET" });
    dispatch({ type: isRunning ? "PAUSE" : "RESUME" });
  }, [phase, isRunning]);

  return {
    state,
    dispatch,
    total,
    penalty: state.giveUps.length * OBR_CHECKPOINT_PENALTY,
    toggle,
  };
}

export const ROUND_PHASE_LABEL: Record<RoundPhase, string> = {
  idle: "Pronto",
  calibration: "Calibração",
  round: "Round",
  finished: "Encerrado",
};

export function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
