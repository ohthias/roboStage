import { useId, type CSSProperties, type ReactNode } from "react";
import { cn, toneVar, type Tone } from "../lib";

/* ------------------------------------------------------------------ */
/*  Stickers — formas recortadas com contorno de tinta.                */
/*  Truque: a forma é desenhada 3x (sombra, contorno grosso, cor),     */
/*  assim sobreposições internas não mostram linhas.                   */
/* ------------------------------------------------------------------ */

export type StickerProps = {
  /** Tamanho em px (largura = altura). */
  size?: number;
  tone?: Tone;
  /** Cor CSS livre; tem prioridade sobre `tone`. */
  color?: string;
  /** Sombra dura atrás do sticker. */
  shadow?: boolean;
  /** Animação: gira devagar, balança ou flutua. */
  motion?: "spin" | "wiggle" | "float";
  rotate?: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
  /** Grão de impressão e borda levemente irregular (recorte à mão). Padrão: true. */
  texture?: boolean;
};

const INK = "var(--stage-outline)";
const motionClass = {
  spin: "animate-spin-slow",
  wiggle: "animate-wiggle",
  float: "animate-float",
};

function StickerSvg({
  size = 72,
  tone = "primary",
  color,
  shadow = true,
  motion,
  rotate = 0,
  className,
  style,
  title,
  stroke = 3,
  texture = true,
  children,
  extra,
}: StickerProps & { stroke?: number; children: ReactNode; extra?: ReactNode }) {
  const fill = color ?? toneVar[tone];
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span
      className={cn("pointer-events-none inline-block shrink-0 select-none", className)}
      style={{ width: size, height: size, rotate: `${rotate}deg`, ...style }}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title}
    >
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        className={cn("overflow-visible", motion && motionClass[motion])}
      >
        {texture && <StickerFilters id={uid} />}
        <g filter={texture ? `url(#cut-${uid})` : undefined}>
          {shadow && (
            <g transform="translate(4 4)" fill="var(--stage-shadow)" stroke="var(--stage-shadow)" strokeWidth={stroke * 2} strokeLinejoin="round">
              {children}
            </g>
          )}
          <g fill={INK} stroke={INK} strokeWidth={stroke * 2} strokeLinejoin="round" strokeLinecap="round">
            {children}
          </g>
          <g fill={fill} filter={texture ? `url(#grain-${uid})` : undefined}>
            {children}
          </g>
        </g>
        {extra}
      </svg>
    </span>
  );
}

/** Filtros SVG: `cut` entorta de leve a borda; `grain` aplica grão no preenchimento. */
function StickerFilters({ id }: { id: string }) {
  return (
    <defs>
      <filter id={`cut-${id}`} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="4" result="w" />
        <feDisplacementMap in="SourceGraphic" in2="w" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id={`grain-${id}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="9" result="n" />
        <feColorMatrix in="n" type="saturate" values="0" result="g" />
        <feComponentTransfer in="g" result="ga">
          <feFuncA type="table" tableValues="0 0.55" />
        </feComponentTransfer>
        <feComposite in="ga" in2="SourceGraphic" operator="in" result="gi" />
        <feBlend in="gi" in2="SourceGraphic" mode="multiply" />
      </filter>
    </defs>
  );
}

function starPoints(n: number, outer: number, inner: number, cx = 60, cy = 60) {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / n) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

/** Explosão de pontas — ótimo para "NOVO", medalhas e destaques. */
export function Starburst({
  points = 12,
  children,
  className,
  style,
  ...props
}: StickerProps & { points?: number; children?: ReactNode }) {
  return (
    <span className={cn("relative inline-grid shrink-0 place-items-center", className)} style={style}>
      <StickerSvg {...props}>
        <polygon points={starPoints(points, 54, 40)} />
      </StickerSvg>
      {children && (
        <span className="stage-display absolute inset-0 grid place-items-center text-center text-[0.9em] text-base-content">
          {children}
        </span>
      )}
    </span>
  );
}

/** Flor de 8 pétalas (o sticker vermelho da referência). */
export function Flower(props: StickerProps) {
  const petals = Array.from({ length: 8 }, (_, i) => {
    const a = (Math.PI / 4) * i;
    return <circle key={i} cx={60 + 36 * Math.cos(a)} cy={60 + 36 * Math.sin(a)} r={17} />;
  });
  return (
    <StickerSvg {...props}>
      {petals}
      <circle cx={60} cy={60} r={27} />
    </StickerSvg>
  );
}

/** Estrela de 4 pontas. */
export function Sparkle(props: StickerProps) {
  return (
    <StickerSvg {...props}>
      <path d="M60 6 C66 42 78 54 114 60 C78 66 66 78 60 114 C54 78 42 66 6 60 C42 54 54 42 60 6 Z" />
    </StickerSvg>
  );
}

/** Nuvem fofinha. */
export function Cloud(props: StickerProps) {
  return (
    <StickerSvg {...props}>
      <circle cx={38} cy={68} r={22} />
      <circle cx={62} cy={52} r={28} />
      <circle cx={88} cy={68} r={20} />
      <rect x={30} y={66} width={62} height={24} rx={12} />
    </StickerSvg>
  );
}

/** Bolha orgânica. */
export function Blob(props: StickerProps) {
  return (
    <StickerSvg {...props}>
      <path d="M61 10c22-2 46 14 48 38 2 20-14 26-12 44 2 16-18 22-36 20-24-2-24-18-40-24C6 82 6 58 16 40 26 22 40 12 61 10Z" />
    </StickerSvg>
  );
}

/** Engrenagem — o sticker "robótico" da marca. */
export function Gear({ teeth = 10, ...props }: StickerProps & { teeth?: number }) {
  const pts: string[] = [];
  const steps = teeth * 4;
  for (let i = 0; i < steps; i++) {
    const r = i % 4 < 2 ? 54 : 42;
    const a = ((Math.PI * 2) / steps) * (i + 0.5);
    pts.push(`${(60 + r * Math.cos(a)).toFixed(2)},${(60 + r * Math.sin(a)).toFixed(2)}`);
  }
  return (
    <StickerSvg
      {...props}
      extra={<circle cx={60} cy={60} r={14} fill="var(--color-base-100)" stroke={INK} strokeWidth={3.5} />}
    >
      <polygon points={pts.join(" ")} />
    </StickerSvg>
  );
}

/** Raio (energia, velocidade, ao vivo). */
export function Bolt(props: StickerProps) {
  return (
    <StickerSvg {...props}>
      <path d="M70 6 L22 68 H56 L46 114 L98 46 H62 L70 6 Z" />
    </StickerSvg>
  );
}

/** Rabisco ondulado (linha decorativa). */
export function Squiggle({
  size = 120,
  tone = "secondary",
  color,
  className,
  rotate = 0,
}: Pick<StickerProps, "size" | "tone" | "color" | "className" | "rotate">) {
  const d = "M6 40 C 22 10, 38 10, 52 40 S 82 70, 98 40 S 128 10, 144 40";
  return (
    <svg
      viewBox="0 0 150 80"
      width={size}
      height={(size * 80) / 150}
      className={cn("pointer-events-none shrink-0 overflow-visible", className)}
      style={{ rotate: `${rotate}deg` }}
      aria-hidden
    >
      <path d={d} fill="none" stroke={INK} strokeWidth={20} strokeLinecap="round" />
      <path d={d} fill="none" stroke={color ?? toneVar[tone]} strokeWidth={12} strokeLinecap="round" />
    </svg>
  );
}

/**
 * "Bit", o mascote do RoboStage: uma cabeça de robô sorridente.
 * Faz o papel do macaquinho da referência — aparece no rodapé e em estados vazios.
 */
export function Mascot({ size = 88, tone = "neutral", className, motion, rotate = 0 }: StickerProps) {
  const fill = toneVar[tone];
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={cn("shrink-0 overflow-visible", motion && motionClass[motion], className)}
      style={{ rotate: `${rotate}deg` }}
      role="img"
      aria-label="Bit, o mascote do RoboStage"
    >
      <g stroke={INK} strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round">
        {/* sombra */}
        <rect x={23} y={37} width={80} height={68} rx={22} fill="var(--stage-shadow)" stroke="none" />
        {/* antena */}
        <line x1={60} y1={32} x2={60} y2={16} />
        <circle cx={60} cy={12} r={7} fill="var(--color-primary)" />
        {/* orelhas */}
        <rect x={9} y={56} width={14} height={28} rx={6} fill="var(--color-secondary)" />
        <rect x={97} y={56} width={14} height={28} rx={6} fill="var(--color-secondary)" />
        {/* cabeça */}
        <rect x={18} y={32} width={84} height={68} rx={22} fill={fill} />
        {/* visor */}
        <rect x={30} y={46} width={60} height={30} rx={15} fill="var(--stage-night)" />
        <circle cx={47} cy={61} r={6} fill="var(--color-accent)" stroke="none" />
        <circle cx={73} cy={61} r={6} fill="var(--color-accent)" stroke="none" />
        {/* sorriso */}
        <path d="M46 86 Q60 96 74 86" fill="none" />
        {/* bochechas */}
        <circle cx={32} cy={86} r={4} fill="var(--color-primary)" stroke="none" opacity={0.6} />
        <circle cx={88} cy={86} r={4} fill="var(--color-primary)" stroke="none" opacity={0.6} />
      </g>
    </svg>
  );
}
