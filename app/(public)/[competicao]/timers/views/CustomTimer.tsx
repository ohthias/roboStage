"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Minus, ArrowLeftCircleIcon } from "lucide-react";
import { playSound } from "@/utils/audio";
import { CompletionModal } from "@/components/Timers/CompletionModal";
import { ConfirmModal } from "@/components/Timers/ConfirmModal";
import { ControlBar } from "@/components/Timers/ControlBar";
import { TimerCircle } from "@/components/Timers/TimerCircle";
type TimerStatus = "idle" | "running" | "finished" | "paused";

const MIN_TIME = 60;
const MAX_TIME = 3600;
const STEP = 60;

export const CustomTimer: React.FC = () => {
  const [initialTime, setInitialTime] = useState(300);
  const [timeLeft, setTimeLeft] = useState(300);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [showExitModal, setShowExitModal] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  const adjustTime = useCallback(
    (delta: number) => {
      if (status !== "idle") return;
      const next = Math.max(MIN_TIME, Math.min(MAX_TIME, initialTime + delta));
      setInitialTime(next);
      setTimeLeft(next);
    },
    [initialTime, status]
  );

  const reset = useCallback(() => {
    clearTimer();
    setStatus("idle");
    setTimeLeft(initialTime);
  }, [clearTimer, initialTime]);

  const handleBack = useCallback(() => {
    if (status === "running") {
      setShowExitModal(true);
      return;
    }
    window.location.href = "/fll/timers";
  }, [status]);

  const toggle = useCallback(() => {
    if (status === "finished") {
      reset();
      return;
    }
    setStatus((prev) => (prev === "running" ? "paused" : "running"));
  }, [reset, status]);

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
          playSound("end");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clearTimer;
  }, [status, clearTimer]);

  return (
    <div className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-base-200/60">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:28px_28px] opacity-[0.04]" />
      <div className="absolute inset-0 bg-gradient-to-b from-base-100/40 via-transparent to-base-200/60" />
      <ConfirmModal
        isOpen={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => {
          setShowExitModal(false);
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
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-base-300 bg-base-100/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <button
          onClick={handleBack}
          className="btn btn-ghost btn-circle btn-sm absolute left-4 top-4"
        >
          <ArrowLeftCircleIcon size={20} />
        </button>
        <TimerCircle
          totalTime={initialTime}
          currentTime={timeLeft}
          colorClass={status === "finished" ? "text-error" : "text-success"}
        >
          <div className="font-mono text-6xl font-bold tabular-nums text-base-content sm:text-7xl">
            {formatTime(timeLeft)}
          </div>
          {status === "idle" && (
            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={() => adjustTime(-STEP)}
                className="btn btn-circle btn-sm border border-base-300 bg-base-200 hover:text-error"
              >
                <Minus size={18} />
              </button>
              <span className="font-mono text-xs font-semibold text-base-content/60">
                AJUSTAR TEMPO
              </span>
              <button
                onClick={() => adjustTime(STEP)}
                className="btn btn-circle btn-sm border border-base-300 bg-base-200 hover:text-success"
              >
                <Plus size={18} />
              </button>
            </div>
          )}
        </TimerCircle>
        <div className="mt-8">
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
      </div>
    </div>
  );
};