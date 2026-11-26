import type { ReactNode } from "react";
import { cn, toneFill, toneText, type Tone } from "../lib";
import { StickerTag } from "./Tag";

/* ------------------------------------------------------------------ */
/*  Tipografia — Roboto black + destaque vermelho inclinado.           */
/* ------------------------------------------------------------------ */

const sizeMap = {
  sm: "text-2xl sm:text-3xl",
  md: "text-3xl sm:text-5xl",
  lg: "text-4xl sm:text-6xl",
  xl: "text-5xl sm:text-6xl md:text-7xl",
};

/** Kicker mono — "/ MODALIDADES". */
export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("stage-kicker text-base-content/45", className)}>/ {children}</p>;
}

/**
 * DisplayHeading — título da plataforma: kicker mono, frase em black
 * e o trecho `highlight` num bloco colorido inclinado (-1°).
 * `tagStyle="sticker"` troca o kicker por uma etiqueta inclinada (referência).
 */
export function DisplayHeading({
  as: As = "h2",
  children,
  highlight,
  highlightTone = "primary",
  italic = true,
  tag,
  tagStyle = "kicker",
  tagTone = "accent",
  size = "md",
  align = "left",
  className,
}: {
  as?: "h1" | "h2" | "h3";
  children: ReactNode;
  highlight?: ReactNode;
  highlightTone?: Tone;
  italic?: boolean;
  tag?: ReactNode;
  tagStyle?: "kicker" | "sticker";
  tagTone?: Tone;
  size?: keyof typeof sizeMap;
  align?: "left" | "center";
  className?: string;
}) {
  const center = align === "center";
  return (
    <div className={cn("relative", center && "text-center", className)}>
      {tag &&
        (tagStyle === "kicker" ? (
          <Kicker className="mb-3">{tag}</Kicker>
        ) : (
          <div className={cn("relative z-10 mb-2", center && "flex justify-center")}>
            <StickerTag tone={tagTone} rotate={-3}>
              {tag}
            </StickerTag>
          </div>
        ))}
      <As className={cn("stage-display text-base-content", sizeMap[size])}>
        {children}
        {highlight && (
          <>
            {" "}
            <span className={cn("mt-2 inline-block -rotate-1 px-3 py-1", italic && "italic", toneFill[highlightTone])}>
              {highlight}
            </span>
          </>
        )}
      </As>
    </div>
  );
}

/**
 * SectionTitle — mesma API e mesmo visual do SectionTitle da home
 * (features/home/components/shared.tsx), aceitando também `highlightTone`.
 */
export function SectionTitle({
  kicker,
  title,
  highlight,
  highlightClass,
  highlightTone = "primary",
  description,
  align = "left",
  children,
}: {
  kicker: string;
  title: string;
  highlight: string;
  highlightClass?: string;
  highlightTone?: Tone;
  description?: string;
  align?: "left" | "center";
  children?: ReactNode;
}) {
  const center = align === "center";
  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center")}>
      <p className="font-mono text-xs tracking-[0.2em] text-base-content/45">{kicker}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
        {title}{" "}
        <span className={cn("mt-2 inline-block -rotate-1 px-3 py-1 italic", highlightClass ?? toneFill[highlightTone])}>
          {highlight}
        </span>
      </h2>
      {description && (
        <p className={cn("mt-6 max-w-2xl text-base leading-7 text-base-content/60 sm:text-lg", center && "mx-auto")}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

/** Número grande + legenda ("120+ equipes"). */
export function StatBlock({
  value,
  label,
  tone,
  className,
  valueClassName,
}: {
  value: ReactNode;
  label: ReactNode;
  tone?: Tone;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className={cn("stage-display text-4xl sm:text-5xl", tone && toneText[tone], valueClassName)}>{value}</div>
      <div className="stage-kicker mt-2 opacity-60">{label}</div>
    </div>
  );
}
