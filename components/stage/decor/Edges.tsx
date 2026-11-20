import { useId, type ReactNode } from "react";
import { cn } from "../lib";

/* ------------------------------------------------------------------ */
/*  Bordas de seção                                                    */
/*  Todas seguem o mesmo contrato: a forma ocupa a parte de baixo e    */
/*  os "bicos" apontam para cima. Coloque no topo de uma seção com a   */
/*  cor DESTA seção (direction="up") ou no rodapé (direction="down").  */
/*  Tudo é determinístico (sem Math.random): o HTML do servidor e o    */
/*  do navegador batem.                                                */
/* ------------------------------------------------------------------ */

export type EdgeProps = {
  /** Cor de preenchimento (normalmente a cor da seção que "invade"). */
  color?: string;
  /** "up" = bicos para cima (topo da seção) · "down" = espelhado (rodapé). */
  direction?: "up" | "down";
  height?: number;
  /** Espelha na horizontal (útil na diagonal e no pincel). */
  flip?: boolean;
  /**
   * Textura dentro da forma, para emendar sem degrau com uma seção texturizada.
   * Padrão "both" (papel + grão, igual ao <Section> colorido).
   */
  texture?: "none" | "noise" | "both";
  className?: string;
};

const flipCls = (direction: EdgeProps["direction"], flip?: boolean) =>
  cn(direction === "down" && !flip && "rotate-180", direction === "down" && flip && "-scale-y-100", direction !== "down" && flip && "-scale-x-100");

/** Pseudo-aleatório estável: mesma entrada, mesma saída. */
const rand = (i: number, seed = 1) => {
  const n = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return n - Math.floor(n);
};

/**
 * Filtro SVG que imita o stage-noise (grão em overlay) e o stage-paper
 * (manchas em multiply), recortado pela própria forma.
 */
/**
 * Ajuste de tom medido contra o stage-texture em CSS, com amostras das cinco cores
 * de marca: o grão em overlay clareia mais os tons médios, por isso a curva gama no
 * claro. Diferença máxima: ≈ 3/255 no claro e 1/255 no escuro.
 */
const CALIBRATION = {
  light: { type: "gamma" as const, amplitude: 1.045, exponent: 0.83, offset: -0.04 },
  dark: { type: "linear" as const, slope: 0.951, intercept: 0.072 },
};

function EdgeTexture({ id, texture, mode }: { id: string; texture: NonNullable<EdgeProps["texture"]>; mode: keyof typeof CALIBRATION }) {
  const fn = CALIBRATION[mode];
  return (
    <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" result="n" />
      <feColorMatrix in="n" type="saturate" values="0" result="g" />
      <feBlend in="g" in2="SourceGraphic" mode="overlay" result="ov" />
      <feComposite in="ov" in2="SourceGraphic" operator="arithmetic" k1="0" k2="0.45" k3="0.55" k4="0" result="noisy" />
      {texture === "both" ? (
        <>
          <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="3" seed="11" result="b" />
          <feColorMatrix in="b" type="saturate" values="0" result="bg" />
          <feBlend in="bg" in2="noisy" mode="multiply" result="pm" />
          <feComposite in="pm" in2="noisy" operator="arithmetic" k1="0" k2="0.12" k3="0.88" k4="0" result="mix" />
        </>
      ) : (
        <feOffset in="noisy" dx="0" dy="0" result="mix" />
      )}
      <feComponentTransfer in="mix" result="cal">
        <feFuncR {...fn} />
        <feFuncG {...fn} />
        <feFuncB {...fn} />
      </feComponentTransfer>
      <feComposite in="cal" in2="SourceGraphic" operator="in" />
    </filter>
  );
}

/** Os dois filtros (claro/escuro) e o estilo que deixa o CSS escolher pelo data-theme. */
function textureProps(id: string, texture: NonNullable<EdgeProps["texture"]>) {
  if (texture === "none") return { defs: null, props: {} };
  return {
    defs: (
      <>
        <EdgeTexture id={`${id}-l`} texture={texture} mode="light" />
        <EdgeTexture id={`${id}-d`} texture={texture} mode="dark" />
      </>
    ),
    props: {
      className: "stage-edge-tx",
      style: { ["--tx-l" as string]: `url(#${id}-l)`, ["--tx-d" as string]: `url(#${id}-d)` },
    },
  };
}

/** Borda feita de um padrão repetido (ladrilho w × h). */
function PatternEdge({
  name,
  w,
  height,
  color,
  direction,
  flip,
  texture = "both",
  className,
  children,
}: Required<Pick<EdgeProps, "height">> & EdgeProps & { name: string; w: number; children: ReactNode }) {
  const id = `${name}-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const tx = textureProps(`${id}-tx`, texture);
  return (
    <svg aria-hidden className={cn("block w-full", flipCls(direction, flip), className)} height={height} preserveAspectRatio="none">
      <defs>
        <pattern id={id} width={w} height={height} patternUnits="userSpaceOnUse">
          <g fill={color}>{children}</g>
        </pattern>
        {tx.defs}
      </defs>
      <rect width="100%" height={height} fill={`url(#${id})`} {...tx.props} />
    </svg>
  );
}

/** Borda feita de uma forma única esticada na largura (viewBox 1000 × h). */
function ShapeEdge({ height, direction, flip, texture = "both", className, children }: Required<Pick<EdgeProps, "height">> & EdgeProps & { children: ReactNode }) {
  const id = `sh-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const tx = textureProps(id, texture);
  return (
    <svg
      aria-hidden
      viewBox={`0 0 1000 ${height}`}
      preserveAspectRatio="none"
      className={cn("block w-full", flipCls(direction, flip), className)}
      style={{ height }}
    >
      {tx.defs && <defs>{tx.defs}</defs>}
      <g {...tx.props}>{children}</g>
    </svg>
  );
}

/* ================================================== DA REFERÊNCIA */

/** Festonado de semicírculos — a borda da faixa escura da referência. */
export function ScallopEdge({ color = "var(--stage-night)", height = 14, ...rest }: EdgeProps) {
  const w = height * 1.6;
  return (
    <PatternEdge name="sc" w={w} height={height} color={color} {...rest}>
      <path d={`M0 ${height} Q ${w / 2} ${-height * 0.9} ${w} ${height} Z`} />
    </PatternEdge>
  );
}

/** Onda suave (rodapé do bloco "contact me"). */
export function WaveEdge({ color = "var(--color-base-100)", height = 22, ...rest }: EdgeProps) {
  const w = height * 4;
  const h = height;
  return (
    <PatternEdge name="wv" w={w} height={h} color={color} {...rest}>
      <path d={`M0 ${h * 0.55} C ${w * 0.25} 0, ${w * 0.25} 0, ${w * 0.5} ${h * 0.55} S ${w * 0.75} ${h * 1.1}, ${w} ${h * 0.55} V ${h} H 0 Z`} />
    </PatternEdge>
  );
}

/** Papel rasgado — transição entre blocos claros. */
export function TornEdge({ color = "var(--color-base-200)", height = 26, ...rest }: EdgeProps) {
  const pts: string[] = [];
  const segments = 60;
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * 1000;
    const y = 6 + rand(i) * (height - 8);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return (
    <ShapeEdge height={height} {...rest}>
      <polygon points={`0,${height} ${pts.join(" ")} 1000,${height}`} fill={color} />
    </ShapeEdge>
  );
}

/* ================================================= GEOMÉTRICAS */

/** Zigue-zague — dentes de serra, energia de cartaz. */
export function ZigzagEdge({ color = "var(--color-primary)", height = 14, ...rest }: EdgeProps) {
  const w = height * 2;
  return (
    <PatternEdge name="zz" w={w} height={height} color={color} {...rest}>
      <path d={`M0 ${height} L ${w / 2} 0 L ${w} ${height} Z`} />
    </PatternEdge>
  );
}

/** Pixel — degraus quadrados, estética de jogo/8 bits. */
export function PixelEdge({ color = "var(--color-secondary)", height = 16, ...rest }: EdgeProps) {
  const s = height / 2;
  const w = s * 6;
  return (
    <PatternEdge name="px" w={w} height={height} color={color} {...rest}>
      <path d={`M0 ${height} V ${s} H ${s} V 0 H ${s * 3} V ${s} H ${s * 4} V ${height} Z`} />
      <rect x={s * 5} y={s} width={s} height={s} />
    </PatternEdge>
  );
}

/** Diagonal — corte inclinado de ponta a ponta. Use `flip` para inverter a inclinação. */
export function SlantEdge({ color = "var(--color-accent)", height = 48, ...rest }: EdgeProps) {
  return (
    <ShapeEdge height={height} {...rest}>
      <polygon points={`0,${height} 1000,0 1000,${height}`} fill={color} />
    </ShapeEdge>
  );
}

/** Curva — um arco único (convexo) ou uma "tigela" (concave). */
export function CurveEdge({ color = "var(--color-base-200)", height = 40, concave, ...rest }: EdgeProps & { concave?: boolean }) {
  const d = concave ? `M0 0 Q 500 ${height * 2} 1000 0 V ${height} H 0 Z` : `M0 ${height} Q 500 ${-height} 1000 ${height} Z`;
  return (
    <ShapeEdge height={height} {...rest}>
      <path d={d} fill={color} />
    </ShapeEdge>
  );
}

/** Ingresso — picote de meia-lua, como o canhoto do EventCard. */
export function TicketEdge({ color = "var(--color-base-100)", height = 12, ...rest }: EdgeProps) {
  const r = height;
  const w = r * 3.2;
  const gap = (w - r * 2) / 2;
  return (
    <PatternEdge name="tk" w={w} height={height} color={color} {...rest}>
      <path d={`M0 0 H ${gap} A ${r} ${r} 0 0 0 ${gap + r * 2} 0 H ${w} V ${height} H 0 Z`} />
    </PatternEdge>
  );
}

/** Bandeira quadriculada — largada e chegada de partida. */
export function CheckerEdge({ color = "var(--stage-night)", height = 16, ...rest }: EdgeProps) {
  const s = height / 2;
  return (
    <PatternEdge name="ck" w={s * 2} height={height} color={color} {...rest}>
      <rect x={0} y={0} width={s} height={s} />
      <rect x={s} y={s} width={s} height={s} />
    </PatternEdge>
  );
}

/* =================================================== ROBÓTICA */

/** Engrenagem — dentes trapezoidais, a borda "mecânica" da marca. */
export function GearEdge({ color = "var(--color-accent)", height = 14, ...rest }: EdgeProps) {
  const w = height * 2.6;
  return (
    <PatternEdge name="gr" w={w} height={height} color={color} {...rest}>
      <path d={`M0 ${height} L ${w * 0.12} ${height} L ${w * 0.22} 0 L ${w * 0.58} 0 L ${w * 0.68} ${height} L ${w} ${height} Z`} />
    </PatternEdge>
  );
}

/** Pinos — encaixes arredondados, como peças de montar. */
export function StudsEdge({ color = "var(--color-primary)", height = 14, ...rest }: EdgeProps) {
  const w = height * 2.4;
  const a = w * 0.2;
  const b = w * 0.8;
  const r = height * 0.45;
  return (
    <PatternEdge name="st" w={w} height={height} color={color} {...rest}>
      <path d={`M${a} ${height} V ${r} Q ${a} 0 ${a + r} 0 H ${b - r} Q ${b} 0 ${b} ${r} V ${height} Z`} />
    </PatternEdge>
  );
}

/** Circuito — trilhas de placa com "vias" (pontos de solda). */
export function CircuitEdge({ color = "var(--color-secondary)", height = 22, ...rest }: EdgeProps) {
  const h = height;
  const w = h * 6;
  return (
    <PatternEdge name="ci" w={w} height={h} color={color} {...rest}>
      <path d={`M0 ${h} V ${h * 0.72} H ${w * 0.18} L ${w * 0.26} ${h * 0.38} H ${w * 0.56} L ${w * 0.64} ${h * 0.72} H ${w} V ${h} Z`} />
      <circle cx={w * 0.41} cy={h * 0.14} r={h * 0.13} />
      <rect x={w * 0.405} y={h * 0.14} width={h * 0.1} height={h * 0.3} />
      <circle cx={w * 0.84} cy={h * 0.42} r={h * 0.1} />
      <rect x={w * 0.835} y={h * 0.42} width={h * 0.08} height={h * 0.32} />
    </PatternEdge>
  );
}

/* ================================================== ORGÂNICAS */

/** Nuvem — bolhas de tamanhos diferentes. */
export function CloudEdge({ color = "var(--color-base-100)", height = 28, ...rest }: EdgeProps) {
  const h = height;
  const w = h * 4.2;
  return (
    <PatternEdge name="cl" w={w} height={h} color={color} {...rest}>
      <circle cx={w * 0.12} cy={h * 0.95} r={h * 0.55} />
      <circle cx={w * 0.38} cy={h * 0.85} r={h * 0.78} />
      <circle cx={w * 0.66} cy={h * 1.0} r={h * 0.5} />
      <circle cx={w * 0.88} cy={h * 0.9} r={h * 0.62} />
      <rect x={0} y={h * 0.8} width={w} height={h * 0.2} />
    </PatternEdge>
  );
}

/** Tinta escorrendo — use no rodapé (direction="down") para os pingos caírem. */
export function DripEdge({ color = "var(--color-primary)", height = 44, ...rest }: EdgeProps) {
  const h = height;
  const base = h * 0.78;
  let d = `M0 ${h} V ${base}`;
  let x = 0;
  let i = 0;
  while (x < 1000) {
    const gap = 30 + rand(i, 2) * 70;
    const wd = 16 + rand(i, 3) * 26;
    const hd = (0.25 + rand(i, 4) * 0.75) * base;
    const start = Math.min(1000, x + gap);
    const end = Math.min(1000, start + wd);
    if (end - start < 8) break;
    d += ` H ${start.toFixed(1)} C ${start.toFixed(1)} ${(base - hd).toFixed(1)}, ${end.toFixed(1)} ${(base - hd).toFixed(1)}, ${end.toFixed(1)} ${base}`;
    x = end;
    i++;
  }
  d += ` H 1000 V ${h} Z`;
  return (
    <ShapeEdge height={h} {...rest}>
      <path d={d} fill={color} />
    </ShapeEdge>
  );
}

/** Pincelada — borda irregular e macia, como tinta passada com rolo. */
export function BrushEdge({ color = "var(--color-accent)", height = 30, ...rest }: EdgeProps) {
  const h = height;
  const n = 48;
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const x = (i / n) * 1000;
    const y = h * (0.15 + 0.35 * (0.5 + 0.5 * Math.sin(i * 0.55)) * 0.6 + rand(i, 5) * 0.4);
    return [x, Math.min(h * 0.85, y)] as const;
  });
  let d = `M0 ${h} L 0 ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    d += ` Q ${px.toFixed(1)} ${py.toFixed(1)} ${((px + x) / 2).toFixed(1)} ${((py + y) / 2).toFixed(1)}`;
  }
  d += ` L 1000 ${pts[n][1].toFixed(1)} V ${h} Z`;
  // fiapos soltos do pincel
  const specks = Array.from({ length: 14 }, (_, i) => ({
    cx: rand(i, 6) * 1000,
    cy: h * (0.05 + rand(i, 7) * 0.2),
    r: 1.2 + rand(i, 8) * 2.4,
  }));
  return (
    <ShapeEdge height={h} {...rest}>
      <path d={d} fill={color} />
      {specks.map((s, i) => (
        <ellipse key={i} cx={s.cx} cy={s.cy} rx={s.r * 2.2} ry={s.r} fill={color} />
      ))}
    </ShapeEdge>
  );
}

/* ================================================== REGISTRO */

export const EDGES = {
  scallop: ScallopEdge,
  wave: WaveEdge,
  torn: TornEdge,
  zigzag: ZigzagEdge,
  pixel: PixelEdge,
  slant: SlantEdge,
  curve: CurveEdge,
  ticket: TicketEdge,
  checker: CheckerEdge,
  gear: GearEdge,
  studs: StudsEdge,
  circuit: CircuitEdge,
  cloud: CloudEdge,
  drip: DripEdge,
  brush: BrushEdge,
} as const;

export type EdgeVariant = keyof typeof EDGES;

/** SectionEdge — qualquer borda pelo nome: <SectionEdge variant="gear" color="…" />. */
export function SectionEdge({ variant, ...props }: EdgeProps & { variant: EdgeVariant }) {
  const C = EDGES[variant];
  return <C {...props} />;
}
