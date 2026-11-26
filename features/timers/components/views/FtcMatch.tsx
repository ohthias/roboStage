"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  ArrowLeft,
  Bell,
  BellOff,
  Flower2,
  Maximize,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipForward,
} from "lucide-react";

import { playSound } from "@/lib/audio";
import { ConfirmModal } from "@/features/timers/components/ConfirmModal";
import { FIELD_COUNTS, MATCH_TIMING, MATCH_TOTAL_SECONDS, RANKING_POINTS } from "@/features/leagues/ftc/lib/biobuzz";
import {
  formatClock,
  initialMatchTimer,
  matchProgress,
  matchSecondsLeft,
  matchTimerReducer,
  nectarStatus,
  type MatchMode,
  type MatchPhase,
} from "@/features/leagues/ftc/lib/matchTimer";

const PHASE_LABEL: Record<MatchPhase, string> = {
  idle: "Pronto",
  countdown: "Preparar",
  auto: "AUTO",
  transition: "Transição",
  teleop: "TELEOP",
  finished: "Fim de partida",
};

const PHASE_HINT: Record<MatchPhase, string> = {
  idle: "Espaço ou ▶ para iniciar",
  countdown: "Mãos longe dos controles",
  auto: "Robôs sozinhos · nada de controle",
  transition: "Peguem os controles",
  teleop: "Pilotos no comando",
  finished: "Confira o placar e a posição dos robôs",
};

const MODES: { key: MatchMode; label: string; detail: string }[] = [
  { key: "full", label: "Partida completa", detail: "0:30 + 0:08 + 2:00" },
  { key: "auto", label: "Só AUTO", detail: "0:30" },
  { key: "teleop", label: "Só TELEOP", detail: "2:00" },
];

/** Marcos da linha do tempo, em segundos desde o início da partida. */
const MARKERS = [
  { at: MATCH_TIMING.auto, label: "TELEOP em 8s" },
  { at: MATCH_TOTAL_SECONDS - MATCH_TIMING.flowerWindow, label: "1:00 · FLOWERS" },
  { at: MATCH_TOTAL_SECONDS - MATCH_TIMING.finalWarning, label: "0:20" },
];

const HEX_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='98' viewBox='0 0 56 98'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zm0 32L0 82V66l28 16 28-16v16L28 98z' fill='none' stroke='%23f5b942' stroke-opacity='0.09' stroke-width='1.5'/%3E%3C/svg%3E\")";

function useFtcMatchSession(backHref: string) {
  const [state, dispatch] = useReducer(matchTimerReducer, undefined, () => initialMatchTimer());
  const { phase, timeLeft, isRunning, muted, mode } = state;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevPhase = useRef<MatchPhase>(phase);
  const [exitOpen, setExitOpen] = useState(false);

  const left = matchSecondsLeft(state);
  const progress = matchProgress(state);
  const flowerOpen = phase === "teleop" && timeLeft <= MATCH_TIMING.flowerWindow;
  const finalStretch = phase === "teleop" && timeLeft <= MATCH_TIMING.finalWarning;

  /* ------------------------------------------------------------ motor */
  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  /* ------------------------------------------------------------- sons */
  useEffect(() => {
    const before = prevPhase.current;
    prevPhase.current = phase;
    if (muted || before === phase) return;
    if (phase === "auto" || phase === "teleop") playSound("go");
    if (phase === "transition") playSound("end");
    if (phase === "finished") playSound("end");
  }, [phase, muted]);

  useEffect(() => {
    if (muted || !isRunning) return;
    if (phase === "countdown") playSound("tick");
    if (phase === "transition" && timeLeft <= 3) playSound("tick");
    if (phase === "teleop" && (timeLeft === MATCH_TIMING.flowerWindow || timeLeft === MATCH_TIMING.finalWarning)) {
      playSound("warning");
    }
    if ((phase === "teleop" || phase === "auto") && timeLeft <= 3) playSound("tick");
  }, [timeLeft, phase, isRunning, muted]);

  /* ----------------------------------------------------------- ações */
  const toggle = useCallback(() => {
    if (phase === "idle" || phase === "finished") return dispatch({ type: "START" });
    dispatch({ type: isRunning ? "PAUSE" : "RESUME" });
  }, [phase, isRunning]);

  const goBack = useCallback(() => {
    window.location.href = backHref;
  }, [backHref]);

  const handleBack = () => (isRunning ? setExitOpen(true) : goBack());

  const fullscreen = useCallback(() => {
    if (!document.fullscreenElement) void containerRef.current?.requestFullscreen().catch(() => {});
    else void document.exitFullscreen().catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const k = e.key.toLowerCase();
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (k === "r") dispatch({ type: "RESET" });
      else if (k === "s") dispatch({ type: "SKIP" });
      else if (k === "f") fullscreen();
      else if (k === "q") dispatch({ type: "TIP", alliance: "red", delta: 1 });
      else if (k === "a") dispatch({ type: "TIP", alliance: "red", delta: -1 });
      else if (k === "p") dispatch({ type: "TIP", alliance: "blue", delta: 1 });
      else if (k === "l") dispatch({ type: "TIP", alliance: "blue", delta: -1 });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, fullscreen]);

  const clockColor =
    phase === "countdown"
      ? "text-[#f5b942]"
      : phase === "transition"
        ? "text-sky-300"
        : finalStretch
          ? "text-red-400"
          : flowerOpen
            ? "text-[#f5b942]"
            : "text-white";

  const clock =
    phase === "countdown" ? String(timeLeft) : phase === "finished" ? "0:00" : formatClock(timeLeft);

  const nextCue =
    phase === "auto"
      ? mode === "auto"
        ? `Fim do AUTO em ${formatClock(timeLeft)}`
        : `Transição em ${formatClock(timeLeft)}`
      : phase === "transition"
        ? `TELEOP em ${timeLeft}s`
        : phase === "teleop"
          ? timeLeft > MATCH_TIMING.flowerWindow
            ? `FLOWERS liberadas em ${formatClock(timeLeft - MATCH_TIMING.flowerWindow)}`
            : timeLeft > MATCH_TIMING.finalWarning
              ? `Reta final em ${formatClock(timeLeft - MATCH_TIMING.finalWarning)}`
              : "PARK no LOADING ZONE!"
          : null;

  return {
    state,
    dispatch,
    containerRef,
    exitOpen,
    setExitOpen,
    left,
    progress,
    flowerOpen,
    finalStretch,
    clockColor,
    clock,
    nextCue,
    toggle,
    goBack,
    handleBack,
    fullscreen,
  };
}

export function FtcMatch({ backHref = "/ftc/timers" }: { backHref?: string }) {
  const session = useFtcMatchSession(backHref);
  const {
    state,
    dispatch,
    containerRef,
    exitOpen,
    setExitOpen,
    left,
    progress,
    flowerOpen,
    finalStretch,
    clockColor,
    clock,
    nextCue,
    toggle,
    goBack,
    handleBack,
    fullscreen,
  } = session;
  const { phase, timeLeft, isRunning, muted, mode, tips } = state;

  /* ---------------------------------------------------------- visual */
  return (
    <div
      ref={containerRef}
      className="relative flex min-h-[100dvh] w-full select-none flex-col overflow-hidden bg-[#141109] text-white"
      style={{ backgroundImage: HEX_BG }}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${flowerOpen ? "opacity-100" : "opacity-0"}`}
        style={{ background: "radial-gradient(circle at 50% 40%, rgba(245,185,66,0.18), transparent 60%)" }}
      />

      <ConfirmModal
        isOpen={exitOpen}
        onCancel={() => setExitOpen(false)}
        onConfirm={() => {
          setExitOpen(false);
          goBack();
        }}
      />

      {/* ------------------------------------------------ barra superior */}
      <header className="relative z-10 flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <button onClick={handleBack} className="btn btn-circle btn-ghost btn-sm text-white hover:bg-white/10" aria-label="Voltar">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-white/80 backdrop-blur">
          <span
            className={`size-2 rounded-full ${
              isRunning ? "animate-pulse bg-emerald-400" : phase === "finished" ? "bg-red-400" : "bg-[#f5b942]"
            }`}
          />
          FTC · BIOBUZZ · {PHASE_LABEL[phase]}
          {!isRunning && phase !== "idle" && phase !== "finished" && " (pausado)"}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => dispatch({ type: "TOGGLE_MUTE" })}
            className="btn btn-circle btn-ghost btn-sm text-white hover:bg-white/10"
            aria-label={muted ? "Ativar som" : "Silenciar"}
          >
            {muted ? <BellOff size={17} /> : <Bell size={17} />}
          </button>
          <button onClick={fullscreen} className="btn btn-circle btn-ghost btn-sm text-white hover:bg-white/10" aria-label="Tela cheia">
            <Maximize size={17} />
          </button>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col gap-8 px-4 pb-8 sm:px-8 lg:flex-row lg:items-stretch">
        {/* ------------------------------------------------ cronômetro */}
        <section className="flex flex-1 flex-col items-center justify-center">
          {(phase === "idle" || phase === "finished") && (
            <div role="radiogroup" aria-label="Modo de treino" className="mb-8 flex flex-wrap justify-center gap-2">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  role="radio"
                  aria-checked={mode === m.key}
                  onClick={() => dispatch({ type: "SET_MODE", mode: m.key })}
                  className={`rounded-tl-lg rounded-br-lg border px-4 py-2 text-left transition-colors ${
                    mode === m.key
                      ? "border-[#f5b942] bg-[#f5b942] text-[#141109]"
                      : "border-white/15 bg-black/20 text-white/75 hover:border-white/40"
                  }`}
                >
                  <span className="block text-sm font-bold">{m.label}</span>
                  <span className="block font-mono text-[11px] opacity-70">{m.detail}</span>
                </button>
              ))}
            </div>
          )}

          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">{PHASE_LABEL[phase]}</p>
          <p
            className={`font-mono font-bold tabular-nums leading-none transition-colors ${clockColor} ${
              phase === "countdown" ? "text-[10rem] sm:text-[14rem]" : "text-[6.5rem] sm:text-[11rem] lg:text-[13rem]"
            }`}
            aria-live="polite"
          >
            {clock}
          </p>
          <p className="mt-2 text-center text-sm uppercase tracking-widest text-white/55">{PHASE_HINT[phase]}</p>

          {nextCue && (
            <p className="mt-4 rounded-full border border-white/10 bg-black/30 px-4 py-1.5 font-mono text-xs text-white/75">
              {nextCue}
            </p>
          )}

          {flowerOpen && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-tl-lg rounded-br-lg bg-[#f5b942] px-4 py-2 text-sm font-bold text-[#141109]">
              <Flower2 size={16} />
              NECTAR liberado nas FLOWERS · todo NECTAR pode entrar
            </p>
          )}

          {/* linha do tempo da partida */}
          {mode === "full" && (
            <div className="mt-10 w-full max-w-3xl">
              <div className="relative h-3 overflow-hidden rounded-full bg-white/10">
                <div className="absolute inset-y-0 left-0 bg-sky-400/40" style={{ width: `${(MATCH_TIMING.auto / MATCH_TOTAL_SECONDS) * 100}%` }} />
                <div
                  className="absolute inset-y-0 bg-white/20"
                  style={{
                    left: `${(MATCH_TIMING.auto / MATCH_TOTAL_SECONDS) * 100}%`,
                    width: `${(MATCH_TIMING.transition / MATCH_TOTAL_SECONDS) * 100}%`,
                  }}
                />
                <div
                  className="absolute inset-y-0 bg-[#f5b942]/30"
                  style={{ left: `${((MATCH_TOTAL_SECONDS - MATCH_TIMING.flowerWindow) / MATCH_TOTAL_SECONDS) * 100}%`, right: 0 }}
                />
                <div className="absolute inset-y-0 left-0 bg-[#f5b942] transition-[width] duration-1000 ease-linear" style={{ width: `${progress * 100}%` }} />
              </div>
              <div className="relative mt-2 h-5 font-mono text-[10px] text-white/45">
                <span className="absolute left-0">AUTO 0:30</span>
                {MARKERS.map((m) => (
                  <span
                    key={m.label}
                    className="absolute -translate-x-1/2 whitespace-nowrap"
                    style={{ left: `${(m.at / MATCH_TOTAL_SECONDS) * 100}%` }}
                  >
                    {m.label}
                  </span>
                ))}
                <span className="absolute right-0">FIM</span>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={toggle}
              className="btn btn-lg min-w-40 rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none border-none bg-[#f5b942] text-[#141109] shadow-[4px_4px_0_0_rgba(255,255,255,0.85)] hover:bg-[#f5b942]/90"
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
              {phase === "idle" ? "Iniciar" : phase === "finished" ? "Nova partida" : isRunning ? "Pausar" : "Continuar"}
            </button>
            <button onClick={() => dispatch({ type: "SKIP" })} disabled={phase === "idle" || phase === "finished"} className="btn btn-ghost text-white hover:bg-white/10 disabled:bg-transparent disabled:text-white/25">
              <SkipForward size={18} /> Pular fase
            </button>
            <button onClick={() => dispatch({ type: "RESET" })} className="btn btn-ghost text-white hover:bg-white/10">
              <RotateCcw size={18} /> Zerar
            </button>
          </div>
        </section>

        {/* ------------------------------------------------- TIPs */}
        <aside className="w-full shrink-0 lg:w-[320px]">
          <div className="rounded-tl-3xl rounded-br-3xl border border-white/10 bg-black/35 p-5 backdrop-blur">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Contador de TIPs</p>
            <p className="mt-1 text-xs leading-5 text-white/45">
              Cada TIP da HIVE libera 1 NECTAR da ALLIANCE AREA. Com 1:00 restante, entra todo o NECTAR.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(["red", "blue"] as const).map((color) => {
                const count = tips[color];
                const nectar = nectarStatus(state, color);
                const isRed = color === "red";
                return (
                  <div
                    key={color}
                    className={`rounded-tl-2xl rounded-br-2xl border p-3 ${isRed ? "border-red-400/40 bg-red-500/10" : "border-sky-400/40 bg-sky-500/10"}`}
                  >
                    <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${isRed ? "text-red-300" : "text-sky-300"}`}>
                      {isRed ? "Vermelha" : "Azul"}
                    </p>
                    <p className="mt-1 font-mono text-5xl font-bold tabular-nums">{count}</p>
                    <p className="text-[11px] text-white/55">
                      TIPs · {count >= RANKING_POINTS.pollinator2Tips ? "2 RP" : count >= RANKING_POINTS.pollinator1Tips ? "1 RP" : `${RANKING_POINTS.pollinator1Tips - count} p/ RP`}
                    </p>
                    <div className="mt-3 flex gap-1.5">
                      <button
                        onClick={() => dispatch({ type: "TIP", alliance: color, delta: -1 })}
                        className="btn btn-sm flex-1 border-white/15 bg-white/5 text-white hover:bg-white/15"
                        aria-label={`Remover TIP ${isRed ? "vermelha" : "azul"}`}
                      >
                        <Minus size={14} />
                      </button>
                      <button
                        onClick={() => dispatch({ type: "TIP", alliance: color, delta: 1 })}
                        className={`btn btn-sm flex-[2] border-none text-white ${isRed ? "bg-red-500 hover:bg-red-500/85" : "bg-sky-500 hover:bg-sky-500/85"}`}
                        aria-label={`Adicionar TIP ${isRed ? "vermelha" : "azul"}`}
                      >
                        <Plus size={14} /> TIP
                      </button>
                    </div>
                    <p className="mt-3 border-t border-white/10 pt-2 font-mono text-[11px] text-white/70">
                      NECTAR liberado: {nectar}/{FIELD_COUNTS.nectarInAllianceArea}
                    </p>
                  </div>
                );
              })}
            </div>

            <dl className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs text-white/60">
              <div className="flex justify-between"><dt>Restante na partida</dt><dd className="font-mono text-white">{formatClock(left)}</dd></div>
              <div className="flex justify-between"><dt>RP POLLINATOR</dt><dd className="font-mono text-white">{RANKING_POINTS.pollinator1Tips} e {RANKING_POINTS.pollinator2Tips} TIPs</dd></div>
            </dl>

            <p className="mt-5 text-[11px] leading-relaxed text-white/40">
              Atalhos: <kbd className="kbd kbd-xs">Espaço</kbd> iniciar/pausar · <kbd className="kbd kbd-xs">S</kbd> pular fase ·{" "}
              <kbd className="kbd kbd-xs">R</kbd> zerar · <kbd className="kbd kbd-xs">F</kbd> tela cheia · TIP vermelha{" "}
              <kbd className="kbd kbd-xs">Q</kbd>/<kbd className="kbd kbd-xs">A</kbd> · azul <kbd className="kbd kbd-xs">P</kbd>/<kbd className="kbd kbd-xs">L</kbd>
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
