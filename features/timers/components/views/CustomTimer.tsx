"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Minus, Pencil, Timer as TimerIcon } from "lucide-react";
import { cn } from "@/components/stage";
import { playSound } from "@/lib/audio";
import { CompletionModal } from "@/features/timers/components/CompletionModal";
import { ConfirmModal } from "@/features/timers/components/ConfirmModal";
import { ControlBar } from "@/features/timers/components/ControlBar";
import { TimerCircle } from "@/features/timers/components/TimerCircle";
import { TimerShell, formatTimer, toggleFullscreen, type TimerStatusTone } from "@/features/timers/components/TimerShell";

type TimerStatus = "idle" | "running" | "finished" | "paused";

const MIN_TIME = 10;       // 10s
const MAX_TIME = 7200;     // 2h
const STEP_OPTIONS = [10, 60, 300] as const; // 10s, 1min, 5min

const PRESETS = [1, 2, 3, 5, 10, 15, 20, 30, 45, 60].map((min) => ({
  label: min < 60 ? `${min}` : "60",
  unit: "min",
  seconds: min * 60,
}));

const STATUS_LABEL: Record<TimerStatus, string> = {
  idle: "Pronto",
  running: "Em andamento",
  paused: "Pausado",
  finished: "Concluído",
};

const STATUS_TONE: Record<TimerStatus, TimerStatusTone> = {
  idle: "idle",
  running: "running",
  paused: "paused",
  finished: "finished",
};

export const CustomTimer: React.FC<{ backHref?: string }> = ({
  backHref = "/fll/timers",
}) => {
  const [initialTime, setInitialTime] = useState(300);
  const [timeLeft, setTimeLeft] = useState(300);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [showExitModal, setShowExitModal] = useState(false);

  const [step, setStep] = useState<(typeof STEP_OPTIONS)[number]>(60);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("05:00");

  const [muted, setMuted] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alarmRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const editInputRef = useRef<HTMLInputElement | null>(null);

  const isIdle = status === "idle";

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const clearAlarm = useCallback(() => {
    if (alarmRef.current) {
      clearInterval(alarmRef.current);
      alarmRef.current = null;
    }
  }, []);

  const formatTime = formatTimer;

  const clamp = useCallback(
    (value: number) => Math.max(MIN_TIME, Math.min(MAX_TIME, value)),
    []
  );

  const setBothTimes = useCallback(
    (value: number) => {
      const next = clamp(value);
      setInitialTime(next);
      setTimeLeft(next);
    },
    [clamp]
  );

  const adjustTime = useCallback(
    (delta: number) => {
      if (!isIdle) return;
      setBothTimes(initialTime + delta);
    },
    [initialTime, isIdle, setBothTimes]
  );

  const applyPreset = useCallback(
    (seconds: number) => {
      if (!isIdle) return;
      setBothTimes(seconds);
    },
    [isIdle, setBothTimes]
  );

  const reset = useCallback(() => {
    clearTimer();
    clearAlarm();
    setStatus("idle");
    setTimeLeft(initialTime);
  }, [clearTimer, clearAlarm, initialTime]);

  const handleBack = useCallback(() => {
    if (status === "running") {
      setShowExitModal(true);
      return;
    }
    clearAlarm();
    window.location.href = backHref;
  }, [status, clearAlarm, backHref]);

  const toggle = useCallback(() => {
    if (status === "finished") {
      reset();
      return;
    }
    setStatus((prev) => (prev === "running" ? "paused" : "running"));
  }, [reset, status]);

  /* ================= EDIÇÃO MANUAL DO TEMPO ================= */
  const startEditing = useCallback(() => {
    if (!isIdle) return;
    setEditValue(formatTime(initialTime));
    setIsEditing(true);
  }, [isIdle, initialTime, formatTime]);

  const commitEdit = useCallback(() => {
    const parts = editValue.split(":").map((p) => parseInt(p, 10) || 0);
    let seconds = 0;
    if (parts.length === 3) {
      const [h, m, s] = parts;
      seconds = h * 3600 + m * 60 + s;
    } else if (parts.length === 2) {
      const [m, s] = parts;
      seconds = m * 60 + s;
    } else {
      seconds = parts[0] ?? 0;
    }
    setBothTimes(seconds);
    setIsEditing(false);
  }, [editValue, setBothTimes]);

  useEffect(() => {
    if (isEditing) editInputRef.current?.select();
  }, [isEditing]);

  /* ================= TIMER ENGINE ================= */
  useEffect(() => {
    if (status !== "running") {
      clearTimer();
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          setStatus("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clearTimer;
  }, [status, clearTimer]);

  /* ================= ALARME (loop até ser dispensado) ================= */
  useEffect(() => {
    if (status !== "finished") {
      clearAlarm();
      return;
    }
    if (!muted) playSound("end");
    alarmRef.current = setInterval(() => {
      if (!muted) playSound("end");
    }, 1800);
    return clearAlarm;
  }, [status, muted, clearAlarm]);

  const percentLeft = initialTime > 0 ? timeLeft / initialTime : 0;
  const circleColor =
    status === "finished"
      ? "text-error"
      : percentLeft > 0.5
      ? "text-success"
      : percentLeft > 0.2
      ? "text-warning"
      : "text-error";

  const stepLabel = (v: number) => (v < 60 ? `${v}s` : `${v / 60}min`);
  const sliderPct = ((initialTime - MIN_TIME) / (MAX_TIME - MIN_TIME)) * 100;

  return (
    <TimerShell
      kicker="Timer personalizado"
      status={{ tone: STATUS_TONE[status], label: STATUS_LABEL[status] }}
      onBack={handleBack}
      muted={muted}
      onToggleMute={() => setMuted((m) => !m)}
      onFullscreen={() => toggleFullscreen()}
    >
      <ConfirmModal
        isOpen={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => {
          setShowExitModal(false);
          clearAlarm();
          window.location.href = backHref;
        }}
      />
      <CompletionModal
        isOpen={status === "finished"}
        title="Tempo encerrado"
        subTitle={`${formatTime(initialTime)} concluídos.`}
        onReset={reset}
        onMenu={handleBack}
        onSilence={muted ? undefined : () => setMuted(true)}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pb-10 sm:px-6 lg:flex-row lg:items-center lg:gap-12">
        {/* ===== CRONÔMETRO ===== */}
        <section className="order-1 flex flex-1 flex-col items-center justify-center py-4 lg:order-2">
          <TimerCircle totalTime={initialTime} currentTime={timeLeft} colorClass={circleColor}>
            {isEditing ? (
              <input
                ref={editInputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                aria-label="Tempo (mm:ss)"
                className="stage-display w-48 rounded-lg border-2 border-primary bg-base-100 text-center text-5xl tabular-nums outline-none sm:text-6xl"
                inputMode="numeric"
                placeholder="mm:ss"
              />
            ) : (
              <button
                onClick={startEditing}
                disabled={!isIdle}
                className="group flex flex-col items-center disabled:cursor-default"
                title={isIdle ? "Clique para digitar o tempo" : undefined}
              >
                <span className="stage-display text-6xl leading-none tabular-nums text-base-content sm:text-7xl">{formatTime(timeLeft)}</span>
                <span className="mt-2 flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.18em] text-base-content/45">
                  {isIdle ? (
                    <>
                      <Pencil size={11} className="transition-transform group-hover:-rotate-12" /> toque para editar
                    </>
                  ) : (
                    `de ${formatTime(initialTime)}`
                  )}
                </span>
              </button>
            )}
          </TimerCircle>

          <ControlBar isRunning={status === "running"} onToggle={toggle} onReset={reset} onBack={handleBack} onFullscreen={() => toggleFullscreen()} />
        </section>

        {/* ===== AJUSTES (só parado) ===== */}
        <aside
          aria-hidden={!isIdle}
          className={cn(
            "order-2 w-full shrink-0 transition-all duration-300 ease-out lg:order-1 lg:w-[360px]",
            isIdle ? "opacity-100" : "pointer-events-none max-h-0 overflow-hidden opacity-0 lg:max-h-none lg:opacity-30 lg:grayscale",
          )}
        >
          <div className="stage-ink stage-shadow rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-lg rounded-bl-lg bg-base-100 p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="stage-kicker text-base-content/50">/ Ajustar tempo</p>
              <TimerIcon size={16} className="text-base-content/40" />
            </div>

            {/* visor */}
            <div className="stage-night mb-5 flex items-center justify-between rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm px-5 py-3 text-white">
              <span className="stage-display text-4xl leading-none tabular-nums">{formatTime(initialTime)}</span>
              <button
                onClick={startEditing}
                disabled={!isIdle}
                className="grid size-8 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Digitar tempo"
                title="Digitar tempo"
              >
                <Pencil size={14} />
              </button>
            </div>

            {/* passo + / − */}
            <div className="mb-5 flex items-center gap-2">
              <button
                onClick={() => adjustTime(-step)}
                disabled={!isIdle || initialTime <= MIN_TIME}
                className="stage-ink stage-press grid size-11 shrink-0 place-items-center rounded-tl-lg rounded-br-lg bg-base-100 text-base-content hover:text-primary disabled:opacity-40"
                aria-label={`Diminuir ${stepLabel(step)}`}
              >
                <Minus size={18} strokeWidth={2.5} />
              </button>
              <div role="radiogroup" aria-label="Passo" className="grid flex-1 grid-cols-3 gap-1 rounded-lg border border-base-300 bg-base-200/70 p-1">
                {STEP_OPTIONS.map((s) => (
                  <button
                    key={s}
                    role="radio"
                    aria-checked={step === s}
                    onClick={() => setStep(s)}
                    className={cn(
                      "h-8 rounded-md font-mono text-xs font-bold transition-colors",
                      step === s ? "bg-base-content text-base-100" : "text-base-content/60 hover:text-base-content",
                    )}
                  >
                    {stepLabel(s)}
                  </button>
                ))}
              </div>
              <button
                onClick={() => adjustTime(step)}
                disabled={!isIdle || initialTime >= MAX_TIME}
                className="stage-ink stage-press grid size-11 shrink-0 place-items-center rounded-tl-lg rounded-br-lg bg-base-100 text-base-content hover:text-success disabled:opacity-40"
                aria-label={`Aumentar ${stepLabel(step)}`}
              >
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* slider */}
            <input
              type="range"
              min={MIN_TIME}
              max={MAX_TIME}
              step={10}
              value={initialTime}
              onChange={(e) => setBothTimes(parseInt(e.target.value, 10))}
              disabled={!isIdle}
              aria-label="Duração"
              className="h-2 w-full cursor-pointer appearance-none rounded-full accent-primary [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-base-content [&::-moz-range-thumb]:bg-primary [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-base-content [&::-webkit-slider-thumb]:bg-primary"
              style={{ background: `linear-gradient(to right, var(--color-primary) ${sliderPct}%, var(--color-base-300) ${sliderPct}%)` }}
            />
            <div className="mb-5 mt-1 flex justify-between font-mono text-[10px] text-base-content/45">
              <span>10s</span>
              <span>2h</span>
            </div>

            {/* presets */}
            <p className="stage-kicker mb-2 text-base-content/50">/ Atalhos</p>
            <div className="grid grid-cols-5 gap-2">
              {PRESETS.map((p) => {
                const on = initialTime === p.seconds;
                return (
                  <button
                    key={p.seconds}
                    onClick={() => applyPreset(p.seconds)}
                    aria-pressed={on}
                    className={cn(
                      "flex h-12 flex-col items-center justify-center rounded-tl-lg rounded-br-lg rounded-tr-sm rounded-bl-sm border transition-[transform,background-color,border-color] active:translate-y-px",
                      on
                        ? "stage-shadow-sm border-base-content bg-primary text-primary-content"
                        : "border-base-300 bg-base-100 hover:border-base-content/40",
                    )}
                  >
                    <span className="font-mono text-sm font-bold leading-none">{p.label}</span>
                    <span className="mt-0.5 text-[9px] leading-none opacity-60">{p.unit}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </TimerShell>
  );
};
