import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { cn, toneFill, type Tone } from "../lib";
import { StickerTag } from "./Tag";
import { AmbientVideo } from "./AmbientVideo";

/* ------------------------------------------------------------------ */
/*  Imagens — moldura, fita, efeito de impressão e legenda.            */
/*  Usa next/image (fill): em src remoto, libere o domínio em          */
/*  images.remotePatterns do next.config.                              */
/* ------------------------------------------------------------------ */

export type MediaRatio = "1/1" | "4/3" | "3/4" | "16/9" | "9/16" | "21/9" | "3/2";
export type MediaFrame = "plain" | "card" | "polaroid" | "sticker" | "torn" | "arch";
export type MediaEffect = "none" | "grain" | "halftone" | "duotone";

const ratioClass: Record<MediaRatio, string> = {
  "1/1": "aspect-square",
  "4/3": "aspect-[4/3]",
  "3/4": "aspect-[3/4]",
  "16/9": "aspect-video",
  "9/16": "aspect-[9/16]",
  "21/9": "aspect-[21/9]",
  "3/2": "aspect-[3/2]",
};

/** Recorte de papel rasgado (polígono fixo, sem Math.random). */
function tornClip() {
  const pts: string[] = [];
  const n = 22;
  const j = (i: number) => {
    const v = Math.sin(i * 91.7) * 43758.5453;
    return (v - Math.floor(v)) * 2.2;
  };
  for (let i = 0; i <= n; i++) pts.push(`${((i / n) * 100).toFixed(1)}% ${j(i).toFixed(2)}%`);
  for (let i = 0; i <= n; i++) pts.push(`${(100 - j(i + 40)).toFixed(2)}% ${((i / n) * 100).toFixed(1)}%`);
  for (let i = n; i >= 0; i--) pts.push(`${((i / n) * 100).toFixed(1)}% ${(100 - j(i + 80)).toFixed(2)}%`);
  for (let i = n; i >= 0; i--) pts.push(`${j(i + 120).toFixed(2)}% ${((i / n) * 100).toFixed(1)}%`);
  return `polygon(${pts.join(",")})`;
}
const TORN = tornClip();

/** Pedaços de fita adesiva nos cantos. */
export function Tape({ className, rotate = -8, style }: { className?: string; rotate?: number; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      className={cn("stage-tape stage-noise pointer-events-none absolute z-20 block h-6 w-20", className)}
      style={{ rotate: `${rotate}deg`, ...style }}
    />
  );
}

/** Camadas de efeito sobre a mídia (compartilhado com o vídeo). */
export function MediaEffectLayer({ effect, tone = "primary" }: { effect: MediaEffect; tone?: Tone }) {
  // "none" = imagem limpa, sem nenhuma textura por cima.
  if (effect === "none") return null;
  return (
    <>
      {effect === "duotone" && (
        <>
          <span aria-hidden className={cn("pointer-events-none absolute inset-0 z-10 mix-blend-multiply", toneFill[tone])} />
          <span aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-base-100/10 mix-blend-screen" />
        </>
      )}
      {effect === "halftone" && (
        <span aria-hidden className="stage-halftone pointer-events-none absolute inset-0 z-10 mix-blend-multiply opacity-70" />
      )}
      <span
        aria-hidden
        className="stage-noise pointer-events-none absolute inset-0 z-10 [--stage-noise-opacity:0.55]"
      />
    </>
  );
}

const frameOuter: Record<MediaFrame, string> = {
  plain: "",
  card: "",
  polaroid: "stage-paper stage-shadow bg-[color-mix(in_oklab,var(--color-base-100)_85%,white)] p-3 pb-4 rounded-sm",
  sticker: "stage-shadow rounded-[1.75rem] border-[6px] border-base-100 bg-base-100 outline-[1.5px] outline-base-content",
  torn: "drop-shadow-[4px_5px_0_var(--stage-shadow)]",
  arch: "",
};

const frameInner: Record<MediaFrame, string> = {
  plain: "rounded-2xl border border-base-300",
  card: "stage-shadow-lg rounded-tl-[2rem] rounded-br-[2rem]",
  polaroid: "",
  sticker: "rounded-[1.25rem]",
  torn: "",
  arch: "stage-shadow rounded-t-full rounded-b-2xl",
};

export type StageImageProps = {
  src: string;
  alt: string;
  ratio?: MediaRatio;
  frame?: MediaFrame;
  effect?: MediaEffect;
  /** Cor do duotone. */
  tone?: Tone;
  tilt?: number;
  /** Fita adesiva nos cantos. */
  tape?: boolean;
  /** Etiqueta mono no canto. */
  badge?: ReactNode;
  caption?: ReactNode;
  credit?: ReactNode;
  priority?: boolean;
  sizes?: string;
  /** Passa direto para o next/image (útil em export estático). */
  unoptimized?: boolean;
  /** Ocupa a altura do pai em vez de seguir `ratio` (células de grade). */
  fillParent?: boolean;
  className?: string;
  imgClassName?: string;
};

/** StageImage — imagem com moldura do RoboStage. */
export function StageImage({
  src,
  alt,
  ratio = "4/3",
  frame = "plain",
  effect = "none",
  tone = "primary",
  tilt,
  tape,
  badge,
  caption,
  credit,
  priority,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  unoptimized,
  fillParent,
  className,
  imgClassName,
}: StageImageProps) {
  const polaroid = frame === "polaroid";
  return (
    <figure className={cn("relative", fillParent && "flex h-full flex-col", className)} style={{ rotate: tilt ? `${tilt}deg` : undefined }}>
      {tape && (
        <>
          <Tape className="-left-4 -top-2" rotate={-14} />
          <Tape className="-right-4 -top-2" rotate={12} />
        </>
      )}
      <div className={cn(frameOuter[frame], fillParent && "flex-1")}>
        <div
          className={cn("relative isolate overflow-hidden bg-base-200", fillParent ? "h-full min-h-56" : ratioClass[ratio], frameInner[frame])}
          style={frame === "torn" ? { clipPath: TORN } : undefined}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            unoptimized={unoptimized}
            className={cn(
              "object-cover",
              effect === "duotone" && "contrast-125 grayscale",
              effect === "halftone" && "contrast-110 saturate-125",
              imgClassName,
            )}
          />
          <MediaEffectLayer effect={effect} tone={tone} />
          {badge && (
            <span className="absolute left-3 top-3 z-20">
              <StickerTag tone="paper" size="sm">{badge}</StickerTag>
            </span>
          )}
        </div>
        {polaroid && caption && (
          <figcaption className="relative z-10 px-1 pt-3 text-center text-sm font-black italic tracking-tight">{caption}</figcaption>
        )}
      </div>
      {!polaroid && (caption || credit) && (
        <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          {caption && <span className="text-sm font-semibold">{caption}</span>}
          {credit && <span className="stage-label text-base-content/45">{credit}</span>}
        </figcaption>
      )}
    </figure>
  );
}

/* ================================================================ GRADE */

export type MediaItem = Omit<StageImageProps, "className"> & { key?: string };

/**
 * MediaGrid — várias imagens de uma vez.
 *  · bento: a primeira ocupa 2×2 (vitrine de projeto, galeria de evento)
 *  · grid: grade uniforme
 *  · scatter: polaroides "jogadas na mesa", com fita e inclinação
 */
export function MediaGrid({
  items,
  layout = "bento",
  className,
}: {
  items: MediaItem[];
  layout?: "bento" | "grid" | "scatter";
  className?: string;
}) {
  if (layout === "scatter") {
    const tilts = [-4, 3, -2, 5, -5, 2];
    return (
      <div className={cn("grid grid-cols-2 gap-x-6 gap-y-10 px-4 pt-4 sm:grid-cols-3 lg:grid-cols-4", className)}>
        {items.map((it, i) => (
          <StageImage
            key={it.key ?? it.src}
            frame="polaroid"
            ratio="1/1"
            tape={i % 2 === 0}
            tilt={tilts[i % tilts.length]}
            sizes="(min-width: 1024px) 25vw, 50vw"
            {...it}
            className={i % 2 ? "sm:translate-y-6" : ""}
          />
        ))}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "grid gap-4",
        layout === "bento" ? "grid-cols-2 md:grid-cols-4 md:grid-rows-2" : "grid-cols-2 md:grid-cols-3",
        className,
      )}
    >
      {items.map((it, i) => {
        const big = layout === "bento" && i === 0;
        return (
          <div key={it.key ?? it.src} className={cn(big && "col-span-2 md:row-span-2")}>
            <StageImage
              frame="plain"
              ratio="4/3"
              fillParent={big}
              sizes={big ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
              {...it}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================ HERO */

/**
 * MediaHero — o hero do site (imagem de fundo + degradê para base-100),
 * aceitando também vídeo ambiente (mudo, em loop).
 */
export function MediaHero({
  image,
  video,
  poster,
  children,
  minHeight = "min-h-[80svh]",
  className,
}: {
  image?: string;
  video?: string;
  poster?: string;
  children: ReactNode;
  minHeight?: string;
  className?: string;
}) {
  return (
    <header className={cn("relative isolate flex w-full items-center overflow-hidden", minHeight, className)}>
      {video ? (
        <AmbientVideo className="absolute inset-0 -z-20 h-full w-full object-cover" src={video} poster={poster ?? image} />
      ) : (
        image && <Image src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
      )}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-base-100 via-base-100/75 to-base-200/20" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 md:px-12">{children}</div>
    </header>
  );
}
