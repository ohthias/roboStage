import Link from "next/link";
import type { ReactNode } from "react";
import { cn, textureClass, type Texture } from "../lib";
import { EDGES, type EdgeVariant } from "../decor/Edges";
import { Mascot, Sparkle } from "../decor/Stickers";
import { PauseOffscreen } from "../core/Motion";

/* ------------------------------------------------------------------ */
/*  Seções de página e rodapé                                          */
/* ------------------------------------------------------------------ */

/** Fundo animado da home: dois brilhos (vermelho/azul) + grade de pontos. */
export function AnimatedBackground() {
  return (
    <PauseOffscreen className="rs-background" aria-hidden="true">
      <div className="rs-glow rs-glow-one" />
      <div className="rs-glow rs-glow-two" />
      <div className="rs-grid" />
    </PauseOffscreen>
  );
}

type SectionTone = "base" | "muted" | "glow" | "night" | "primary" | "secondary" | "accent";

const sectionTone: Record<SectionTone, string> = {
  base: "bg-base-100 text-base-content",
  muted: "border-y border-base-300 bg-base-200/40 text-base-content",
  glow: "relative isolate overflow-hidden bg-base-100 text-base-content",
  night: "stage-night",
  primary: "bg-primary text-primary-content",
  secondary: "bg-secondary text-secondary-content",
  accent: "bg-accent text-accent-content",
};

const edgeColor: Record<SectionTone, string> = {
  base: "var(--color-base-100)",
  muted: "var(--color-base-200)",
  glow: "var(--color-base-100)",
  night: "var(--stage-night)",
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  accent: "var(--color-accent)",
};

/**
 * Section — bloco padrão do site (px-6 py-24, conteúdo max-w-6xl).
 * `edgeTop` / `edgeBottom` desenham a borda recortada da referência na
 * cor desta seção — use com moderação, em faixas de destaque.
 */
export function Section({
  tone = "base",
  edgeTop,
  edgeBottom,
  id,
  className,
  innerClassName,
  texture,
  children,
}: {
  tone?: SectionTone;
  edgeTop?: EdgeVariant;
  edgeBottom?: EdgeVariant;
  id?: string;
  className?: string;
  innerClassName?: string;
  /** Padrão: ruído nas faixas coloridas/escuras, papel na muted, nada na base. */
  texture?: Texture;
  children: ReactNode;
}) {
  const color = edgeColor[tone];
  const tex: Texture = texture ?? (tone === "base" || tone === "glow" ? "none" : tone === "muted" ? "paper" : "both");
  const Top = edgeTop ? EDGES[edgeTop] : null;
  const Bottom = edgeBottom ? EDGES[edgeBottom] : null;
  const hasEdge = !!(Top || Bottom);
  const edgeTex = tex;
  return (
    <PauseOffscreen as="section" id={id} className={cn("relative scroll-mt-20", className)}>
      {Top && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 -translate-y-full">
          <Top color={color} direction="up" texture={edgeTex} />
        </div>
      )}
      <div className={cn(sectionTone[tone], textureClass[tex], hasEdge && tone === "muted" && "border-y-0", "px-6 py-24", innerClassName)}>
        {tone === "glow" && <AnimatedBackground />}
        {children}
      </div>
      {Bottom && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 translate-y-full">
          <Bottom color={color} direction="down" texture={edgeTex} />
        </div>
      )}
    </PauseOffscreen>
  );
}

/** Rodapé do site + wordmark gigante (o "FUNKHAUS" da referência, no estilo do logo). */
export function Footer({
  columns,
  note = "RoboStage é uma plataforma para gestão de competições de robótica, equipes, rankings, transmissões ao vivo e eventos educacionais.",
}: {
  columns: { title: string; links: { label: string; href: string }[] }[];
  note?: string;
}) {
  return (
    <footer className="stage-paper overflow-hidden border-t border-base-300 bg-base-100 text-base-content">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <span className="text-2xl font-black uppercase italic tracking-tight">
              Robo<span className="text-primary">Stage</span>
            </span>
            <p className="mt-5 text-sm leading-relaxed text-base-content/60">{note}</p>
          </div>
          {columns.map((c) => (
            <div key={c.title}>
              <h4 className="footer-title">{c.title}</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="link link-hover">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-12 text-xs font-medium text-base-content/40">© 2026 RoboStage · Feito para a comunidade da robótica.</p>
      </div>
      <div className="relative mx-auto max-w-[1400px] px-2">
        <Mascot size={84} motion="wiggle" className="absolute left-[47%] top-0 z-10 -translate-y-1/2" />
        <Sparkle size={34} tone="accent" className="absolute right-[5%] top-[8%] z-10" motion="spin" />
        <p
          aria-hidden
          className="select-none whitespace-nowrap pr-[0.08em] text-center text-[17vw] font-black uppercase italic leading-[0.78] tracking-tighter text-base-content/[0.08] [margin-bottom:-0.1em] xl:text-[15rem]"
        >
          Robo<span className="text-primary/25">Stage</span>
        </p>
      </div>
    </footer>
  );
}
