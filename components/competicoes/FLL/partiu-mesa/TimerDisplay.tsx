"use client";

import { formatDurationMs } from "@/utils/competitions/fll/partiu-mesa/calculations";

interface TimerDisplayProps {
  remainingMs: number;
  /** true quando restam menos de 30s — usado para destacar visualmente. */
  urgent?: boolean;
}

export default function TimerDisplay({ remainingMs, urgent }: TimerDisplayProps) {
  return (
    <div
      className={`text-6xl sm:text-7xl font-bold tabular-nums tracking-tight text-center ${
        urgent ? "text-error" : "text-base-content"
      }`}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
    >
      {formatDurationMs(remainingMs)}
    </div>
  );
}
