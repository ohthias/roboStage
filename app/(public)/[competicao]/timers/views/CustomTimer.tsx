"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Minus, ArrowLeftCircleIcon, Bell, BellOff, Pencil } from "lucide-react";
import { playSound } from "@/utils/audio";
import { CompletionModal } from "@/components/Timers/CompletionModal";
import { ConfirmModal } from "@/components/Timers/ConfirmModal";
import { ControlBar } from "@/components/Timers/ControlBar";
import { TimerCircle } from "@/components/Timers/TimerCircle";

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

const STATUS_DOT: Record<TimerStatus, string> = {
  idle: "bg-base-content/30",
  running: "bg-success animate-pulse",
  paused: "bg-warning",
  finished: "bg-error animate-pulse",
};

export const CustomTimer: React.FC = () => {
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

  const formatTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

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
    window.location.href = "/fll/timers";
  }, [status, clearAlarm]);

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

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-base-200/60">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:28px_28px] opacity-[0.04]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-base-100/40 via-transparent to-base-200/60" />

      <ConfirmModal
        isOpen={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => {
          setShowExitModal(false);
          clearAlarm();
          window.location.href = "/fll/timers";
        }}
      />
      <CompletionModal
        isOpen={status === "finished"}
        title="Tempo encerrado"
        subTitle="Apresentação finalizada."
        onReset={reset}
        onMenu={handleBack}
      />

      {/* ===== BARRA SUPERIOR ===== */}
      <header className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6">
        <button
          onClick={handleBack}
          className="btn btn-ghost btn-circle btn-sm"
          aria-label="Voltar"
        >
          <ArrowLeftCircleIcon size={20} />
        </button>

        <div className="flex items-center gap-2 rounded-full border border-base-300 bg-base-100/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-base-content/70 backdrop-blur">
          <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
          {STATUS_LABEL[status]}
        </div>

        <button
          onClick={() => setMuted((m) => !m)}
          className="btn btn-ghost btn-circle btn-sm"
          aria-label={muted ? "Ativar som" : "Silenciar"}
        >
          {muted ? <BellOff size={18} /> : <Bell size={18} />}
        </button>
      </header>

      <main className="relative z-10 flex flex-1 flex-col gap-6 px-4 pb-8 sm:px-6 lg:flex-row lg:items-stretch lg:gap-8 lg:px-10">
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
                className="input input-ghost w-40 text-center font-mono text-5xl font-bold tabular-nums sm:text-6xl"
                inputMode="numeric"
                placeholder="mm:ss"
              />
            ) : (
              <button
                onClick={startEditing}
                disabled={!isIdle}
                className="group flex items-center gap-2 font-mono text-6xl font-bold tabular-nums text-base-content disabled:cursor-default sm:text-7xl"
                title={isIdle ? "Clique para editar o tempo" : undefined}
              >
                {formatTime(timeLeft)}
                {isIdle && (
                  <Pencil
                    size={18}
                    className="opacity-0 transition-opacity group-hover:opacity-40"
                  />
                )}
              </button>
            )}
          </TimerCircle>

          {status === "finished" && (
            <button
              onClick={() => setMuted(true)}
              className="btn btn-outline btn-error btn-sm mt-6"
            >
              Parar alarme
            </button>
          )}

          <div className="mt-8 w-full max-w-md">
            <ControlBar
              isRunning={status === "running"}
              onToggle={toggle}
              onReset={reset}
              onBack={handleBack}
              onFullscreen={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen();
                } else {
                  document.exitFullscreen();
                }
              }}
            />
          </div>
        </section>

        <aside
          className={`order-2 w-full shrink-0 transition-all duration-300 ease-out lg:order-1 lg:w-[340px] ${
            isIdle
              ? "max-h-[900px] opacity-100"
              : "pointer-events-none max-h-0 overflow-hidden opacity-0 lg:max-h-[900px] lg:w-0 lg:opacity-0"
          }`}
        >
          <div className="rounded-3xl border border-base-300 bg-base-100/80 p-6 shadow-xl backdrop-blur-xl">
            <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-widest text-base-content/50">
              Ajustar tempo
            </p>

            {/* mostrador estilo LCD */}
            <div className="mb-5 flex items-center justify-between rounded-2xl bg-neutral px-5 py-3 text-neutral-content">
              <span className="font-mono text-3xl font-bold tabular-nums">
                {formatTime(initialTime)}
              </span>
              <button
                onClick={startEditing}
                className="btn btn-ghost btn-circle btn-xs text-neutral-content/70 hover:text-neutral-content"
                aria-label="Digitar tempo"
              >
                <Pencil size={14} />
              </button>
            </div>

            {/* incremento configurável */}
            <div className="mb-5 flex items-center justify-center gap-3">
              <button
                onClick={() => adjustTime(-step)}
                className="btn btn-circle btn-sm border border-base-300 bg-base-200 hover:text-error"
                aria-label={`Diminuir ${step}s`}
              >
                <Minus size={18} />
              </button>

              <div className="join">
                {STEP_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStep(s)}
                    className={`btn btn-xs join-item ${
                      step === s ? "btn-primary" : "btn-ghost"
                    }`}
                  >
                    {s < 60 ? `${s}s` : `${s / 60}min`}
                  </button>
                ))}
              </div>

              <button
                onClick={() => adjustTime(step)}
                className="btn btn-circle btn-sm border border-base-300 bg-base-200 hover:text-success"
                aria-label={`Aumentar ${step}s`}
              >
                <Plus size={18} />
              </button>
            </div>

            {/* slider fino */}
            <input
              type="range"
              min={MIN_TIME}
              max={MAX_TIME}
              step={10}
              value={initialTime}
              onChange={(e) => setBothTimes(parseInt(e.target.value, 10))}
              className="range range-primary range-xs mb-1 w-full"
            />
            <div className="mb-5 flex justify-between text-[10px] text-base-content/40">
              <span>10s</span>
              <span>2h</span>
            </div>

            <div className="divider my-2 text-xs text-base-content/40">presets</div>

            {/* teclado de presets */}
            <div className="grid grid-cols-5 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.seconds}
                  onClick={() => applyPreset(p.seconds)}
                  className={`btn btn-sm flex-col gap-0 ${
                    initialTime === p.seconds ? "btn-primary" : "btn-ghost border border-base-300"
                  }`}
                >
                  <span className="font-mono text-sm leading-none">{p.label}</span>
                  <span className="text-[9px] leading-none opacity-60">{p.unit}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};