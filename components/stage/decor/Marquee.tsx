import type { ReactNode } from "react";
import { cn, toneFill, type Tone } from "../lib";
import { Flower, Gear, Sparkle, Starburst } from "./Stickers";

/* ------------------------------------------------------------------ */
/*  Marquee — faixa infinita (nomes de equipes, patrocinadores, avisos) */
/*  CSS puro: duplica o conteúdo e anima -50%. Pausa no hover.          */
/* ------------------------------------------------------------------ */

const separators = [Flower, Gear, Sparkle, Starburst];
const sepTones: Tone[] = ["primary", "secondary", "accent", "warning"];

export function Marquee({
  items,
  reverse = false,
  speed = 30,
  tone = "paper",
  tilt = 0,
  bordered = true,
  className,
  render,
}: {
  items: ReactNode[];
  reverse?: boolean;
  /** Segundos por volta. */
  speed?: number;
  tone?: Tone;
  /** Inclina a faixa (em graus) para o efeito "fita adesiva". */
  tilt?: number;
  bordered?: boolean;
  className?: string;
  /** Render customizado de cada item. */
  render?: (item: ReactNode, i: number) => ReactNode;
}) {
  const row = items.map((item, i) => {
    const Sep = separators[i % separators.length];
    return (
      <li key={i} className="flex shrink-0 items-center gap-4 pr-6">
        <Sep size={22} tone={sepTones[i % sepTones.length]} shadow={false} />
        {render ? render(item, i) : (
          <span className="stage-display whitespace-nowrap text-2xl italic uppercase sm:text-3xl">{item}</span>
        )}
      </li>
    );
  });

  return (
    <div
      className={cn(
        "stage-noise group overflow-hidden py-3",
        toneFill[tone],
        bordered && "border-y border-[var(--stage-line)]",
        className,
      )}
      style={{ rotate: `${tilt}deg` }}
    >
      <ul
        className={cn(
          "flex w-max group-hover:[animation-play-state:paused]",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
        )}
        style={{ ["--marquee-speed" as string]: `${speed}s` }}
      >
        {row}
        {/* cópia para o loop contínuo */}
        {items.map((item, i) => {
          const Sep = separators[i % separators.length];
          return (
            <li key={`dup-${i}`} aria-hidden className="flex shrink-0 items-center gap-4 pr-6">
              <Sep size={22} tone={sepTones[i % sepTones.length]} shadow={false} />
              {render ? render(item, i) : (
                <span className="stage-display whitespace-nowrap text-2xl italic uppercase sm:text-3xl">{item}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
