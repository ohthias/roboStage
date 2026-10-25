"use client";

import {
  Bell,
  BellOff,
  MinusCircle,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Square,
  TimerReset,
  Trash,
  TriangleAlert,
  Undo2,
} from "lucide-react";
import {
  ROUND_PHASE_LABEL,
  formatClock,
  useObrRoundTimer,
} from "@/utils/competitions/obr/roundTimer";

type Timer = ReturnType<typeof useObrRoundTimer>;

interface RoundTimerProps {
  timer: Timer;
  falhas: number;
  onFalha: () => void;
  onResetScore: () => void;
}

/**
 * Barra fixa do cronômetro de round dentro do Pontuador OBR.
 * Inspirada no Timer do Pontuador FLL: tempo grande + controles + barra de progresso.
 */
export default function RoundTimer({ timer, falhas, onFalha, onResetScore }: RoundTimerProps) {
  const { state, dispatch, total, penalty, toggle } = timer;
  const { phase, timeLeft, isRunning, giveUps, muted, elapsed } = state;

  const ratio = total > 0 ? timeLeft / total : 0;
  const inRound = phase === "round";
  const low = inRound && timeLeft <= 30;

  const barColor =
    phase === "calibration"
      ? "bg-info"
      : phase === "finished"
        ? "bg-error"
        : timeLeft <= 10
          ? "bg-error"
          : timeLeft <= 30
            ? "bg-warning"
            : "bg-primary";

  const chipColor =
    phase === "calibration"
      ? "bg-info text-info-content"
      : phase === "round"
        ? "bg-primary text-primary-content"
        : phase === "finished"
          ? "bg-error text-error-content"
          : "bg-base-200 text-base-content/60";

  return (
    <section
      aria-label="Cronômetro do round"
      className="sticky top-2 z-30 -mx-3 border-y border-base-300 bg-base-100/90 backdrop-blur sm:mx-0 sm:rounded-tl-2xl sm:rounded-br-2xl sm:border overflow-hidden"
    >
      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        {/* ===== TEMPO ===== */}
        <div className="flex items-center gap-4">
          <span
            className={`rounded-tl-lg rounded-br-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${chipColor}`}
          >
            {ROUND_PHASE_LABEL[phase]}
            {!isRunning && (phase === "calibration" || phase === "round") && " · pausa"}
          </span>

          <span
            className={`font-mono text-3xl font-bold tabular-nums tracking-tight sm:text-4xl ${
              low ? "text-error" : ""
            }`}
            aria-live="polite"
          >
            {formatClock(timeLeft)}
          </span>

          <div className="hidden flex-col text-[11px] leading-tight text-base-content/50 sm:flex">
            <span>
              Corrido: <span className="font-mono">{formatClock(elapsed)}</span>
            </span>
            {giveUps.length > 0 && (
              <span className="text-error">
                {giveUps.length} desist. · -{formatClock(penalty)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => dispatch({ type: "TOGGLE_MUTE" })}
            className="btn btn-ghost btn-circle btn-sm ml-auto lg:ml-0"
            aria-label={muted ? "Ativar som" : "Silenciar"}
          >
            {muted ? <BellOff size={16} /> : <Bell size={16} />}
          </button>
        </div>

        {/* ===== CONTROLES ===== */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className={`btn btn-sm gap-1.5 ${isRunning ? "btn-warning" : "btn-primary"}`}
          >
            {isRunning ? <Pause size={16} /> : phase === "finished" ? <RotateCcw size={16} /> : <Play size={16} />}
            {phase === "idle"
              ? "Calibrar"
              : phase === "finished"
                ? "Novo"
                : isRunning
                  ? "Pausar"
                  : "Retomar"}
          </button>

          {(phase === "idle" || phase === "calibration") && (
            <button
              type="button"
              onClick={() => dispatch({ type: "SKIP_CALIBRATION" })}
              className="btn btn-outline btn-sm gap-1.5"
            >
              <SkipForward size={16} />
              {phase === "idle" ? "Round direto" : "Iniciar round"}
            </button>
          )}

          {(inRound || phase === "finished") && (
            <>
              <button
                type="button"
                onClick={() => dispatch({ type: "GIVE_UP" })}
                disabled={!inRound}
                className="btn btn-error btn-sm gap-1.5"
                title="Desistência de checkpoint: retira 1min do round"
              >
                <MinusCircle size={16} />
                Desistência <span className="font-mono">-1:00</span>
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "UNDO_GIVE_UP" })}
                disabled={giveUps.length === 0}
                className="btn btn-ghost btn-sm btn-square"
                aria-label="Desfazer última desistência"
                title="Desfazer última desistência (+1min)"
              >
                <Undo2 size={16} />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onFalha}
            disabled={!inRound}
            className="btn btn-outline btn-warning btn-sm gap-1.5"
            title="Soma 1 falha de progresso na pontuação"
          >
            <TriangleAlert size={16} />
            Falha <span className="font-mono">{falhas}</span>
          </button>

          {inRound && (
            <button
              type="button"
              onClick={() => dispatch({ type: "FINISH" })}
              className="btn btn-ghost btn-sm gap-1.5"
              title="Encerrar o round agora (ex.: robô chegou)"
            >
              <Square size={14} />
              Encerrar
            </button>
          )}

          <div className="divider divider-horizontal mx-0 hidden sm:flex" />

          <button
            type="button"
            onClick={() => dispatch({ type: "RESET" })}
            className="btn btn-ghost btn-sm btn-square"
            aria-label="Zerar cronômetro"
            title="Zerar cronômetro"
          >
            <TimerReset size={16} />
          </button>
          <button
            type="button"
            onClick={onResetScore}
            className="btn btn-ghost btn-sm btn-square text-error"
            aria-label="Zerar pontuação"
            title="Zerar pontuação"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>

      {/* barra de progresso */}
      <div className="h-1 w-full bg-base-300/60">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${barColor}`}
          style={{ width: `${(phase === "idle" ? 1 : ratio) * 100}%` }}
          role="progressbar"
          aria-valuenow={Math.round(ratio * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </section>
  );
}
