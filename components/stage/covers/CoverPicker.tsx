"use client";

import { useId } from "react";
import { Shuffle } from "lucide-react";
import { cn, toneVar, type Tone } from "../lib";
import { COVER_PATTERNS, COVER_TONES, CoverSwatch, type CoverPattern } from "./Covers";

const patternNames: Record<CoverPattern, string> = {
  grid: "Grade",
  dots: "Pontos",
  stripes: "Listras",
  waves: "Ondas",
  circuit: "Circuito",
  gears: "Engrenagens",
  blocks: "Blocos",
  orbit: "Órbita",
  topo: "Relevo",
  confetti: "Confete",
  arena: "Arena",
  halftone: "Retícula",
};

const toneNames: Record<string, string> = {
  primary: "Vermelho",
  secondary: "Azul",
  accent: "Amarelo",
  success: "Verde",
  info: "Azul-claro",
  ink: "Tinta",
};

export type CoverValue = { pattern: CoverPattern; tone: Tone };

/** CoverPicker — escolhe padrão e cor de uma capa (para "Trocar capa"). */
export function CoverPicker({ value, onChange, className }: { value: CoverValue; onChange: (v: CoverValue) => void; className?: string }) {
  const name = useId();
  const shuffle = () => {
    const p = COVER_PATTERNS[Math.floor(Math.random() * COVER_PATTERNS.length)];
    const t = COVER_TONES[Math.floor(Math.random() * COVER_TONES.length)];
    onChange({ pattern: p, tone: t });
  };
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Cor da capa" className="flex flex-wrap gap-2">
          {COVER_TONES.map((t) => (
            <label key={t} className="cursor-pointer" title={toneNames[t]}>
              <input type="radio" name={`${name}-t`} className="peer sr-only" checked={value.tone === t} onChange={() => onChange({ ...value, tone: t })} />
              <span
                aria-hidden
                className="block size-7 rounded-full ring-1 ring-black/10 ring-offset-2 ring-offset-base-100 transition peer-checked:ring-2 peer-checked:ring-base-content peer-focus-visible:outline-2 peer-focus-visible:outline-primary"
                style={{ background: toneVar[t] }}
              />
              <span className="sr-only">{toneNames[t]}</span>
            </label>
          ))}
        </div>
        <button type="button" onClick={shuffle} className="btn btn-ghost btn-sm gap-1.5">
          <Shuffle size={14} /> Aleatória
        </button>
      </div>
      <div role="radiogroup" aria-label="Padrão da capa" className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {COVER_PATTERNS.map((p) => (
          <label key={p} className="cursor-pointer">
            <input type="radio" name={`${name}-p`} className="peer sr-only" checked={value.pattern === p} onChange={() => onChange({ ...value, pattern: p })} />
            <CoverSwatch pattern={p} tone={value.tone} selected={value.pattern === p} className="peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary" />
            <span className="mt-1 block text-center text-[11px] font-semibold text-base-content/65">{patternNames[p]}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
