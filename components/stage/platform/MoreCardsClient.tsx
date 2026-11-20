"use client";

import { useEffect, useState, type ReactNode } from "react";
import { MapPin, RotateCw } from "lucide-react";
import { cn, toneFill, type Tone } from "../lib";
import { FlipNumber } from "../core/Motion";

/* ------------------------------------------------------------------ */
/*  Cards interativos: flashcard (FlashQA) e contagem regressiva.      */
/* ------------------------------------------------------------------ */

/**
 * FlipCard — flashcard de frente e verso (perguntas do FlashQA, regras, curiosidades).
 * Vira no clique, no Enter/Espaço e no hover com mouse. Sem JS, vira só no hover/foco.
 */
export function FlipCard({
  front,
  back,
  kicker = "Pergunta",
  backKicker = "Resposta",
  tone = "secondary",
  className,
}: {
  front: ReactNode;
  back: ReactNode;
  kicker?: string;
  backKicker?: string;
  tone?: Tone;
  className?: string;
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      aria-label={flipped ? "Mostrar pergunta" : "Mostrar resposta"}
      className={cn("group block aspect-[4/3] w-full text-left sm:aspect-[5/6] [perspective:1000px] focus-visible:outline-none", className)}
    >
      <span
        className={cn(
          "relative block h-full w-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none",
          "group-focus-visible:[transform:rotateY(180deg)] [@media(hover:hover)]:group-hover:[transform:rotateY(180deg)]",
          flipped && "[transform:rotateY(180deg)] [@media(hover:hover)]:group-hover:[transform:rotateY(180deg)]",
        )}
      >
        {/* frente */}
        <span className="stage-paper stage-ink absolute inset-0 flex flex-col rounded-tl-[30px] rounded-br-[30px] bg-base-100 p-6 [backface-visibility:hidden]">
          <span className="stage-label text-base-content/45">/ {kicker}</span>
          <span className="mt-4 flex-1 text-xl font-black leading-snug tracking-tight">{front}</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-base-content/55">
            <RotateCw size={13} /> Toque para virar
          </span>
        </span>
        {/* verso */}
        <span
          className={cn(
            "stage-texture stage-shadow-lg absolute inset-0 flex flex-col rounded-tl-[30px] rounded-br-[30px] p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]",
            toneFill[tone],
          )}
        >
          <span className="stage-label opacity-75">/ {backKicker}</span>
          <span className="mt-4 flex-1 text-base font-semibold leading-relaxed">{back}</span>
        </span>
      </span>
    </button>
  );
}

function parts(target: number, now: number) {
  const diff = Math.max(0, target - now);
  return {
    done: diff === 0,
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff / 3600000) % 24),
    m: Math.floor((diff / 60000) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

/** CountdownCard — contagem regressiva para o torneio/evento. */
export function CountdownCard({
  title,
  date,
  location,
  tone = "primary",
  className,
}: {
  title: string;
  /** ISO, ex.: "2026-12-05T08:00:00-03:00" */
  date: string;
  location?: string;
  tone?: Tone;
  className?: string;
}) {
  const target = new Date(date).getTime();
  // Primeiro render: tempo zerado no servidor e no cliente (sem divergência de hidratação);
  // o relógio começa a correr depois de montar.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const p = now == null ? null : parts(target, now);
  const when = new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const unit = (v: number | undefined, label: string) => (
    <div className="flex flex-col items-center">
      <span className="stage-noise grid min-w-[3.5rem] place-items-center rounded-tl-xl rounded-br-xl bg-base-100 px-2 py-2 text-base-content">
        {v == null ? <span className="text-4xl font-black tabular-nums text-base-content/30">--</span> : <FlipNumber value={v} minDigits={2} className="text-4xl font-black tracking-tight" />}
      </span>
      <span className="stage-label mt-1.5 opacity-80">{label}</span>
    </div>
  );
  return (
    <article className={cn("stage-texture stage-grid-on-color stage-shadow-lg relative overflow-hidden rounded-tl-[30px] rounded-br-[30px] p-6", toneFill[tone], className)}>
      <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-75">/ Contagem regressiva</p>
      <h3 className="mt-1 text-2xl font-black leading-tight tracking-tight">{title}</h3>
      <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm opacity-85">
        <span>{when}</span>
        {location && (
          <span className="inline-flex items-center gap-1">
            <MapPin size={13} /> {location}
          </span>
        )}
      </p>
      {p?.done ? (
        <p className="mt-6 text-3xl font-black tracking-tight">É hoje! Bora pro palco.</p>
      ) : (
        <div className="mt-6 flex flex-wrap gap-3" role="timer" aria-live="off" aria-label={p ? `Faltam ${p.d} dias, ${p.h} horas e ${p.m} minutos` : `Evento em ${when}`}>
          {unit(p?.d, "dias")}
          {unit(p?.h, "horas")}
          {unit(p?.m, "min")}
          {unit(p?.s, "seg")}
        </div>
      )}
    </article>
  );
}
