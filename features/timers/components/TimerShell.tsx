"use client";

import React from "react";
import { ArrowLeft, Bell, BellOff, Maximize2 } from "lucide-react";
import { cn } from "@/components/stage";

/* ------------------------------------------------------------------ */
/*  Casca comum das telas de timer (personalizado, sala de avaliação,  */
/*  round OBR): fundo pontilhado da Stage UI, barra de topo com voltar, */
/*  selo de status e ações (som, tela cheia).                          */
/* ------------------------------------------------------------------ */

export type TimerStatusTone = "idle" | "running" | "paused" | "finished" | "info";

const DOT: Record<TimerStatusTone, string> = {
  idle: "bg-base-content/30",
  running: "bg-success animate-pulse",
  paused: "bg-warning",
  finished: "bg-primary animate-pulse",
  info: "bg-info",
};

/** Selo de status no estilo sticker: borda forte, sombra dura curta. */
export function TimerStatusPill({ tone, children, className }: { tone: TimerStatusTone; children: React.ReactNode; className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "stage-shadow-sm inline-flex items-center gap-2 rounded-tl-lg rounded-br-lg rounded-tr-sm rounded-bl-sm border-2 border-base-content bg-base-100 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-base-content",
        className,
      )}
    >
      <span className={cn("size-2 rounded-full", DOT[tone])} aria-hidden />
      {children}
    </div>
  );
}

const roundBtn =
  "grid size-10 place-items-center rounded-full border border-transparent text-base-content/70 transition-colors hover:border-base-300 hover:bg-base-100 hover:text-base-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/** Botão redondo da barra de topo. */
export function TimerTopButton({ label, onClick, children, active }: { label: string; onClick: () => void; children: React.ReactNode; active?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} aria-pressed={active} className={cn(roundBtn, active && "bg-base-100 text-base-content")}>
      {children}
    </button>
  );
}

type TimerShellProps = {
  /** Texto curto acima do selo (ex.: "Timer personalizado"). */
  kicker: string;
  status: { tone: TimerStatusTone; label: React.ReactNode };
  onBack: () => void;
  /** Som: mostra o botão de silenciar quando definido. */
  muted?: boolean;
  onToggleMute?: () => void;
  onFullscreen?: () => void;
  /** Conteúdo extra logo abaixo da barra (ex.: barra de progresso). */
  below?: React.ReactNode;
  containerRef?: React.Ref<HTMLDivElement>;
  children: React.ReactNode;
  className?: string;
};

export function TimerShell({
  kicker,
  status,
  onBack,
  muted,
  onToggleMute,
  onFullscreen,
  below,
  containerRef,
  children,
  className,
}: TimerShellProps) {
  return (
    <div ref={containerRef} className={cn("relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-base-200", className)}>
      {/* fundo: pontos da Stage UI + luz suave no topo */}
      <div className="stage-dots pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-base-100/70 to-transparent" aria-hidden />

      <header className="relative z-10">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <TimerTopButton label="Voltar" onClick={onBack}>
              <ArrowLeft size={18} />
            </TimerTopButton>
            <span className="stage-kicker hidden text-base-content/50 sm:inline">/ {kicker}</span>
          </div>

          <TimerStatusPill tone={status.tone}>{status.label}</TimerStatusPill>

          <div className="flex items-center justify-end gap-1">
            {onToggleMute && (
              <TimerTopButton label={muted ? "Ativar som" : "Silenciar"} onClick={onToggleMute} active={muted}>
                {muted ? <BellOff size={18} /> : <Bell size={18} />}
              </TimerTopButton>
            )}
            {onFullscreen && (
              <TimerTopButton label="Tela cheia" onClick={onFullscreen}>
                <Maximize2 size={18} />
              </TimerTopButton>
            )}
          </div>
        </div>
        {below}
      </header>

      <main className="relative z-10 flex flex-1 flex-col">{children}</main>
    </div>
  );
}

/** Formata segundos como m:ss (ou h:mm:ss acima de 1 hora). */
export function formatTimer(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}` : `${m}:${r.toString().padStart(2, "0")}`;
}

/** Alterna tela cheia do elemento (ou da página). */
export function toggleFullscreen(el?: HTMLElement | null) {
  if (typeof document === "undefined") return;
  if (!document.fullscreenElement) void (el ?? document.documentElement).requestFullscreen?.();
  else void document.exitFullscreen();
}
