/**
 * Máquina de estados do cronômetro de partida BIOBUZZ. Pura (sem React) para
 * poder ser testada; o componente só despacha ações e toca os sons.
 */
import { MATCH_TIMING, nectarAllowed } from "./biobuzz";

export type MatchMode = "full" | "auto" | "teleop";
export type MatchPhase = "idle" | "countdown" | "auto" | "transition" | "teleop" | "finished";

export const COUNTDOWN_SECONDS = 3;

export const PHASE_SECONDS: Record<Exclude<MatchPhase, "idle" | "finished">, number> = {
  countdown: COUNTDOWN_SECONDS,
  auto: MATCH_TIMING.auto,
  transition: MATCH_TIMING.transition,
  teleop: MATCH_TIMING.teleop,
};

export type MatchTimerState = {
  mode: MatchMode;
  phase: MatchPhase;
  /** segundos restantes da fase atual */
  timeLeft: number;
  isRunning: boolean;
  tips: { red: number; blue: number };
  muted: boolean;
};

export type MatchTimerAction =
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "TICK" }
  | { type: "SKIP" }
  | { type: "RESET" }
  | { type: "SET_MODE"; mode: MatchMode }
  | { type: "TIP"; alliance: "red" | "blue"; delta: 1 | -1 }
  | { type: "TOGGLE_MUTE" };

export const initialMatchTimer = (mode: MatchMode = "full", muted = false): MatchTimerState => ({
  mode,
  phase: "idle",
  timeLeft: idleTime(mode),
  isRunning: false,
  tips: { red: 0, blue: 0 },
  muted,
});

function idleTime(mode: MatchMode) {
  return mode === "teleop" ? MATCH_TIMING.teleop : MATCH_TIMING.auto;
}

/** Próxima fase depois da atual, conforme o modo de treino. */
export function nextPhase(phase: MatchPhase, mode: MatchMode): MatchPhase {
  switch (phase) {
    case "idle":
      return "countdown";
    case "countdown":
      return mode === "teleop" ? "teleop" : "auto";
    case "auto":
      return mode === "auto" ? "finished" : "transition";
    case "transition":
      return "teleop";
    default:
      return "finished";
  }
}

function enter(state: MatchTimerState, phase: MatchPhase): MatchTimerState {
  if (phase === "finished") return { ...state, phase, timeLeft: 0, isRunning: false };
  if (phase === "idle") return { ...state, phase, timeLeft: idleTime(state.mode), isRunning: false };
  return { ...state, phase, timeLeft: PHASE_SECONDS[phase], isRunning: true };
}

export function matchTimerReducer(state: MatchTimerState, action: MatchTimerAction): MatchTimerState {
  switch (action.type) {
    case "START":
      if (state.phase !== "idle" && state.phase !== "finished") return state;
      return enter({ ...state, tips: { red: 0, blue: 0 } }, "countdown");

    case "PAUSE":
      return { ...state, isRunning: false };

    case "RESUME":
      if (state.phase === "idle" || state.phase === "finished") return state;
      return { ...state, isRunning: true };

    case "TICK":
      if (!state.isRunning) return state;
      if (state.timeLeft > 1) return { ...state, timeLeft: state.timeLeft - 1 };
      return enter(state, nextPhase(state.phase, state.mode));

    case "SKIP":
      if (state.phase === "idle" || state.phase === "finished") return state;
      return enter(state, nextPhase(state.phase, state.mode));

    case "RESET":
      return initialMatchTimer(state.mode, state.muted);

    case "SET_MODE":
      if (state.phase !== "idle" && state.phase !== "finished") return state;
      return initialMatchTimer(action.mode, state.muted);

    case "TIP": {
      const value = Math.max(0, state.tips[action.alliance] + action.delta);
      return { ...state, tips: { ...state.tips, [action.alliance]: value } };
    }

    case "TOGGLE_MUTE":
      return { ...state, muted: !state.muted };

    default:
      return state;
  }
}

/** Segundos restantes na partida inteira (usado para a janela de 1:00). */
export function matchSecondsLeft(state: Pick<MatchTimerState, "phase" | "timeLeft">) {
  switch (state.phase) {
    case "idle":
    case "countdown":
      return MATCH_TIMING.auto + MATCH_TIMING.teleop;
    case "auto":
      return state.timeLeft + MATCH_TIMING.teleop;
    case "transition":
      return MATCH_TIMING.teleop;
    case "teleop":
      return state.timeLeft;
    default:
      return 0;
  }
}

/** Fração já percorrida da linha do tempo (AUTO + transição + TELEOP). */
export function matchProgress(state: Pick<MatchTimerState, "phase" | "timeLeft">) {
  const { auto, transition, teleop } = MATCH_TIMING;
  const total = auto + transition + teleop;
  switch (state.phase) {
    case "auto":
      return (auto - state.timeLeft) / total;
    case "transition":
      return (auto + transition - state.timeLeft) / total;
    case "teleop":
      return (auto + transition + teleop - state.timeLeft) / total;
    case "finished":
      return 1;
    default:
      return 0;
  }
}

export function nectarStatus(state: MatchTimerState, alliance: "red" | "blue") {
  return nectarAllowed(state.tips[alliance], matchSecondsLeft(state));
}

export function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
