import type { ReactNode } from "react";
import { cn, toneFill, toneVar, type Tone } from "../lib";

/* ------------------------------------------------------------------ */
/*  Capas geradas em SVG — para testes do LabTest, documentos do       */
/*  StageBook, projetos e eventos.                                     */
/*  · determinísticas: mesmo `seed` (ou título) = mesma capa, no       */
/*    servidor e no navegador;                                         */
/*  · sem imagem externa: leves, nítidas em qualquer tamanho;          */
/*  · texto fica fora do SVG, em HTML (acessível e traduzível).        */
/* ------------------------------------------------------------------ */

export const COVER_PATTERNS = [
  "grid",
  "dots",
  "stripes",
  "waves",
  "circuit",
  "gears",
  "blocks",
  "orbit",
  "topo",
  "confetti",
  "arena",
  "halftone",
] as const;
export type CoverPattern = (typeof COVER_PATTERNS)[number];

export const COVER_TONES: Tone[] = ["primary", "secondary", "accent", "success", "info", "ink"];

/** Hash estável de texto → número. */
export function hashSeed(text: string) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}

/** Gerador pseudo-aleatório estável (mulberry32). */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Escolhe padrão e cor a partir de um texto (ex.: título do teste). */
export function coverFromSeed(seed: string): { pattern: CoverPattern; tone: Tone } {
  const h = hashSeed(seed);
  return { pattern: COVER_PATTERNS[h % COVER_PATTERNS.length], tone: COVER_TONES[(h >>> 8) % COVER_TONES.length] };
}

const W = 800;
const H = 450;

/** Só o desenho (sem texto). Use como fundo de qualquer coisa. */
export function CoverArt({
  pattern,
  tone = "secondary",
  seed = "robostage",
  className,
}: {
  pattern: CoverPattern;
  tone?: Tone;
  seed?: string;
  className?: string;
}) {
  const r = rng(hashSeed(seed + pattern));
  const bg = toneVar[tone];
  const light = tone === "accent" || tone === "paper";
  const ink = light ? "rgb(0 0 0 / .18)" : "rgb(255 255 255 / .2)";
  const inkStrong = light ? "rgb(0 0 0 / .32)" : "rgb(255 255 255 / .38)";
  const accentPool = ["var(--color-accent)", "var(--color-primary)", "var(--color-secondary)", "var(--color-success)", "var(--color-base-100)"].filter(
    (c) => c !== bg,
  );
  const pick = () => accentPool[Math.floor(r() * accentPool.length)];
  const els: ReactNode[] = [];

  switch (pattern) {
    case "grid":
      for (let x = 0; x <= W; x += 40) els.push(<line key={`x${x}`} x1={x} y1={0} x2={x} y2={H} stroke={ink} strokeWidth={1.2} />);
      for (let y = 0; y <= H; y += 40) els.push(<line key={`y${y}`} x1={0} y1={y} x2={W} y2={y} stroke={ink} strokeWidth={1.2} />);
      for (let i = 0; i < 5; i++) {
        const x = Math.floor(r() * 20) * 40;
        const y = Math.floor(r() * 11) * 40;
        els.push(<rect key={`c${i}`} x={x} y={y} width={40 * (1 + Math.floor(r() * 2))} height={40} fill={pick()} opacity={0.85} />);
      }
      break;
    case "dots":
      for (let y = 20; y < H; y += 30)
        for (let x = 20; x < W; x += 30) els.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={2.4 + (x / W) * 4} fill={ink} />);
      els.push(<circle key="big" cx={W * (0.6 + r() * 0.3)} cy={H * (0.2 + r() * 0.4)} r={90} fill={pick()} />);
      break;
    case "stripes":
      for (let i = -H; i < W + H; i += 46) els.push(<line key={i} x1={i} y1={H} x2={i + H} y2={0} stroke={ink} strokeWidth={18} />);
      els.push(<rect key="band" x={0} y={H * 0.62} width={W} height={28} fill={pick()} />);
      break;
    case "waves":
      for (let k = 0; k < 9; k++) {
        const y0 = 40 + k * 48;
        const amp = 14 + r() * 18;
        const f = 0.008 + r() * 0.006;
        let d = `M0 ${y0}`;
        for (let x = 0; x <= W; x += 20) d += ` L${x} ${(y0 + Math.sin(x * f + k) * amp).toFixed(1)}`;
        els.push(<path key={k} d={d} fill="none" stroke={k === 4 ? pick() : ink} strokeWidth={k === 4 ? 10 : 5} strokeLinecap="round" />);
      }
      break;
    case "circuit": {
      for (let i = 0; i < 26; i++) {
        let x = Math.floor(r() * 20) * 40;
        let y = Math.floor(r() * 11) * 40;
        let d = `M${x} ${y}`;
        for (let s = 0; s < 4; s++) {
          if (r() > 0.5) x += (r() > 0.5 ? 1 : -1) * 40 * (1 + Math.floor(r() * 3));
          else y += (r() > 0.5 ? 1 : -1) * 40 * (1 + Math.floor(r() * 2));
          d += ` L${x} ${y}`;
        }
        els.push(<path key={`p${i}`} d={d} fill="none" stroke={ink} strokeWidth={4} strokeLinejoin="round" />);
        els.push(<circle key={`v${i}`} cx={x} cy={y} r={7} fill={i % 6 === 0 ? pick() : inkStrong} />);
      }
      break;
    }
    case "gears": {
      const gear = (cx: number, cy: number, R: number, key: string, fill: string) => {
        const teeth = Math.round(R / 7);
        const pts: string[] = [];
        for (let i = 0; i < teeth * 4; i++) {
          const rad = i % 4 < 2 ? R : R * 0.82;
          const a = ((Math.PI * 2) / (teeth * 4)) * (i + 0.5);
          pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
        }
        els.push(
          <g key={key}>
            <polygon points={pts.join(" ")} fill={fill} />
            <circle cx={cx} cy={cy} r={R * 0.32} fill={bg} />
          </g>,
        );
      };
      gear(W * 0.78, H * 0.38, 150, "g1", ink);
      gear(W * 0.5, H * 0.85, 90, "g2", pick());
      gear(W * 0.12, H * 0.2, 70, "g3", ink);
      gear(W * 0.95, H * 0.95, 60, "g4", inkStrong);
      break;
    }
    case "blocks":
      for (let i = 0; i < 18; i++) {
        const w = 60 + Math.floor(r() * 4) * 40;
        const x = Math.floor(r() * 18) * 44;
        const y = Math.floor(r() * 9) * 50;
        els.push(
          <g key={i}>
            <rect x={x} y={y} width={w} height={44} rx={6} fill={i % 4 === 0 ? pick() : ink} />
            {Array.from({ length: Math.floor(w / 30) }, (_, k) => (
              <circle key={k} cx={x + 16 + k * 30} cy={y - 4} r={7} fill={i % 4 === 0 ? pick() : ink} />
            ))}
          </g>,
        );
      }
      break;
    case "orbit": {
      const cx = W * 0.72;
      const cy = H * 0.5;
      for (let k = 1; k <= 6; k++) els.push(<circle key={k} cx={cx} cy={cy} r={k * 55} fill="none" stroke={ink} strokeWidth={2.5} strokeDasharray={k % 2 ? "0" : "6 10"} />);
      for (let k = 1; k <= 5; k++) {
        const a = r() * Math.PI * 2;
        els.push(<circle key={`p${k}`} cx={cx + Math.cos(a) * k * 55} cy={cy + Math.sin(a) * k * 55} r={8 + r() * 10} fill={k === 3 ? pick() : inkStrong} />);
      }
      els.push(<circle key="sun" cx={cx} cy={cy} r={34} fill={pick()} />);
      break;
    }
    case "topo": {
      const cx = W * (0.3 + r() * 0.4);
      const cy = H * (0.3 + r() * 0.4);
      for (let k = 1; k <= 12; k++) {
        let d = "";
        for (let a = 0; a <= 64; a++) {
          const t = (a / 64) * Math.PI * 2;
          const rad = k * 34 + Math.sin(t * 3 + k * 0.7) * 10 + Math.cos(t * 5) * 6;
          d += `${a ? "L" : "M"}${(cx + Math.cos(t) * rad * 1.4).toFixed(1)} ${(cy + Math.sin(t) * rad).toFixed(1)} `;
        }
        els.push(<path key={k} d={d + "Z"} fill="none" stroke={k === 5 ? pick() : ink} strokeWidth={k === 5 ? 5 : 2.5} />);
      }
      break;
    }
    case "confetti":
      for (let i = 0; i < 70; i++) {
        const x = r() * W;
        const y = r() * H;
        const c = i % 3 ? ink : pick();
        const rot = r() * 180;
        els.push(
          i % 2 ? (
            <rect key={i} x={x} y={y} width={18} height={8} rx={2} fill={c} transform={`rotate(${rot} ${x} ${y})`} />
          ) : (
            <circle key={i} cx={x} cy={y} r={4 + r() * 5} fill={c} />
          ),
        );
      }
      break;
    case "arena":
      // vista de cima da mesa FLL: borda, áreas de lançamento e linhas guia
      els.push(<rect key="mat" x={60} y={50} width={W - 120} height={H - 100} rx={14} fill="none" stroke={inkStrong} strokeWidth={8} />);
      els.push(<rect key="base1" x={60} y={H - 170} width={150} height={120} fill={pick()} opacity={0.9} />);
      els.push(<rect key="base2" x={W - 210} y={H - 170} width={150} height={120} fill={ink} />);
      for (let i = 0; i < 6; i++) {
        const x = 140 + r() * (W - 280);
        const y = 90 + r() * (H - 240);
        els.push(<rect key={`m${i}`} x={x} y={y} width={46} height={46} rx={6} fill={ink} />);
      }
      els.push(<path key="route" d={`M135 ${H - 110} C 260 ${H - 260}, 420 120, ${W - 260} 150`} fill="none" stroke={pick()} strokeWidth={6} strokeDasharray="14 12" strokeLinecap="round" />);
      break;
    case "halftone":
      for (let y = 0; y < H + 20; y += 18)
        for (let x = (y / 18) % 2 ? 9 : 0; x < W + 20; x += 18) {
          const d = Math.hypot(x - W * 0.8, y - H * 0.2) / W;
          els.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={Math.max(0.6, 8 - d * 11)} fill={ink} />);
        }
      break;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={cn("block h-full w-full", className)} aria-hidden>
      <rect width={W} height={H} fill={bg} />
      {els}
    </svg>
  );
}

/* ============================================================ COVER */

export type CoverProps = {
  title?: string;
  /** Rótulo pequeno acima do título ("LabTest", "Documento"). */
  kicker?: string;
  pattern?: CoverPattern;
  tone?: Tone;
  /** Texto que define padrão/cor quando eles não são passados. Padrão: o título. */
  seed?: string;
  /** Ícone grande (ex.: emoji do documento ou ícone lucide). */
  icon?: ReactNode;
  ratio?: "16/9" | "3/2" | "4/3" | "1/1" | "4/1" | "3/1";
  /** Cantos: brand (recorte da marca) · rounded · none. */
  corners?: "brand" | "rounded" | "none";
  /** Conteúdo extra no canto inferior (chips, métricas). */
  footer?: ReactNode;
  className?: string;
};

const ratioCls = { "16/9": "aspect-video", "3/2": "aspect-[3/2]", "4/3": "aspect-[4/3]", "1/1": "aspect-square", "4/1": "aspect-[4/1]", "3/1": "aspect-[3/1]" };
const cornerCls = { brand: "rounded-tl-[1.5rem] rounded-br-[1.5rem]", rounded: "rounded-xl", none: "" };

/** Cover — capa genérica (arte + título opcional). */
export function Cover({ title, kicker, pattern, tone, seed, icon, ratio = "16/9", corners = "brand", footer, className }: CoverProps) {
  const auto = coverFromSeed(seed ?? title ?? "robostage");
  const p = pattern ?? auto.pattern;
  const t = tone ?? auto.tone;
  const hasText = !!(title || kicker || icon || footer);
  return (
    <div className={cn("relative isolate overflow-hidden", ratioCls[ratio], cornerCls[corners], className)}>
      <CoverArt pattern={p} tone={t} seed={seed ?? title} className="absolute inset-0 -z-20" />
      {/* véu para o texto ficar legível em qualquer cor e padrão */}
      {title && <span aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-3/4 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />}
      {hasText && (
        <div className="flex h-full flex-col justify-between p-4 text-white sm:p-5">
          <div className="flex items-start justify-between gap-3">
            {kicker && <span className="stage-label rounded-tl-md rounded-br-md bg-black/45 px-2 py-1 backdrop-blur-sm">{kicker}</span>}
            {icon && <span className="ml-auto text-3xl leading-none drop-shadow [&>svg]:size-8">{icon}</span>}
          </div>
          <div>
            {title && <p className="line-clamp-2 text-xl font-black leading-tight tracking-tight [text-shadow:0_1px_2px_rgb(0_0_0/.35)] sm:text-2xl">{title}</p>}
            {footer && <div className="mt-2">{footer}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ======================================================== TEST COVER */

/**
 * TestCover — capa de teste do LabTest. Gera a arte a partir do código do
 * teste, então cada teste tem sempre a mesma capa, sem upload.
 */
export function TestCover({
  code,
  title,
  robot,
  runs,
  best,
  status = "ativo",
  pattern,
  tone,
  className,
}: {
  /** "T-014" */
  code: string;
  title: string;
  robot?: string;
  runs?: number;
  best?: number;
  status?: "ativo" | "pausado" | "concluído";
  pattern?: CoverPattern;
  tone?: Tone;
  className?: string;
}) {
  const statusCls = { ativo: "bg-success text-success-content", pausado: "bg-accent text-accent-content", concluído: "bg-base-100 text-base-content" }[status];
  return (
    <Cover
      seed={code}
      pattern={pattern}
      tone={tone}
      kicker={`LabTest · ${code}`}
      title={title}
      ratio="16/9"
      className={className}
      icon={<span className={cn("stage-label rounded-tl-md rounded-br-md px-2 py-1 text-xs", statusCls)}>{status}</span>}
      footer={
        (robot || runs != null || best != null) && (
          <div className="flex flex-wrap gap-1.5 font-mono text-[11px] font-bold">
            {robot && <span className="rounded-tl-md rounded-br-md bg-black/40 px-2 py-0.5 backdrop-blur-sm">🤖 {robot}</span>}
            {runs != null && <span className="rounded-tl-md rounded-br-md bg-black/40 px-2 py-0.5 backdrop-blur-sm">{runs} runs</span>}
            {best != null && <span className="rounded-tl-md rounded-br-md bg-black/40 px-2 py-0.5 backdrop-blur-sm">melhor {best} pts</span>}
          </div>
        )
      }
    />
  );
}

/* ======================================================= DOC BANNER */

/**
 * DocBanner — faixa de capa no topo de um documento do StageBook,
 * com ícone sobreposto, título, trilha e metadados (como no Notion).
 * Passe `image` para usar foto em vez da arte gerada.
 */
export function DocBanner({
  title,
  icon = "📘",
  breadcrumb = [],
  meta,
  pattern,
  tone,
  seed,
  image,
  height = "h-40 sm:h-52",
  actions,
  className,
}: {
  title: string;
  icon?: ReactNode;
  breadcrumb?: string[];
  meta?: ReactNode;
  pattern?: CoverPattern;
  tone?: Tone;
  seed?: string;
  image?: string;
  height?: string;
  /** Botões sobre a capa (ex.: "Trocar capa"). Aparecem no hover/foco. */
  actions?: ReactNode;
  className?: string;
}) {
  const auto = coverFromSeed(seed ?? title);
  return (
    <header className={cn("relative", className)}>
      <div className={cn("group relative overflow-hidden rounded-t-2xl", height)}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <CoverArt pattern={pattern ?? auto.pattern} tone={tone ?? auto.tone} seed={seed ?? title} />
        )}
        {actions && (
          <div className="absolute right-3 top-3 z-10 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">{actions}</div>
        )}
      </div>
      <div className="relative px-6 sm:px-10">
        <span className="-mt-10 grid size-20 place-items-center rounded-2xl border border-base-300 bg-base-100 text-5xl shadow-sm [&>svg]:size-10">{icon}</span>
        {breadcrumb.length > 0 && (
          <nav aria-label="Trilha" className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-base-content/55">
            {breadcrumb.map((b, i) => (
              <span key={b} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden>/</span>}
                <span className={i === breadcrumb.length - 1 ? "font-semibold text-base-content/80" : ""}>{b}</span>
              </span>
            ))}
          </nav>
        )}
        <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{title}</h1>
        {meta && <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-base-content/60">{meta}</div>}
      </div>
    </header>
  );
}

/** Miniatura de padrão com nome (usada no seletor). */
export function CoverSwatch({ pattern, tone, selected, className }: { pattern: CoverPattern; tone: Tone; selected?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "relative block aspect-[16/10] overflow-hidden rounded-lg ring-offset-2 ring-offset-base-100 transition",
        selected ? "ring-2 ring-primary" : "ring-1 ring-base-300 hover:ring-base-content/40",
        className,
      )}
    >
      <CoverArt pattern={pattern} tone={tone} seed={pattern} />
      {selected && <span className={cn("absolute right-1 top-1 size-3 rounded-full ring-2 ring-white", toneFill.primary)} />}
    </span>
  );
}
