import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

/**
 * Peças visuais do workspace da equipe, no idioma do robostage.com.br:
 * rótulos em mono com "/" ("/ AGORA"), cantos assimétricos (superior
 * esquerdo + inferior direito) e as três cores da marca.
 */

/** Cantos assimétricos da marca, em três tamanhos. */
export const CORNER = {
  sm: "rounded-tl-lg rounded-br-lg rounded-tr-sm rounded-bl-sm",
  md: "rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md",
  lg: "rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-lg rounded-bl-lg",
} as const;

export type Tone = "primary" | "secondary" | "accent" | "success";

/** Fundo cheio + texto, para os cards coloridos em destaque. */
export const TONE_FILL: Record<Tone, string> = {
  primary: "bg-primary text-primary-content",
  secondary: "bg-secondary text-secondary-content",
  accent: "bg-accent text-accent-content",
  success: "bg-success text-success-content",
};

/** Versão suave (cards pequenos, ícones). */
export const TONE_SOFT: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/25 text-[color-mix(in_oklab,var(--color-accent)_55%,var(--color-base-content))]",
  success: "bg-success/12 text-success",
};

/** Cabeçalho de seção: "/ RÓTULO" em mono + título + link opcional à direita. */
export function SectionHead({
  kicker,
  title,
  href,
  linkLabel = "ver tudo",
  action,
}: {
  kicker: string;
  title: ReactNode;
  href?: string;
  linkLabel?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="font-mono text-[10px] tracking-[0.2em] text-base-content/40">/ {kicker}</p>
        <h3 className="mt-0.5 truncate text-base font-bold tracking-tight">{title}</h3>
      </div>
      {action}
      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-0.5 font-mono text-[11px] text-base-content/45 hover:text-primary"
        >
          {linkLabel}
          <ArrowUpRight size={12} className="transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
        </Link>
      )}
    </div>
  );
}

/**
 * Arte decorativa dos cards em destaque (no lugar das ilustrações da
 * referência): pista de robô vista de cima, com grade de pontos, círculos e
 * o "robô" — tudo em `currentColor`, então segue a cor do card.
 */
export function TrackArt({ variant = 0, className = "" }: { variant?: 0 | 1 | 2; className?: string }) {
  const rot = [0, 18, -14][variant];
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={`pointer-events-none ${className}`}>
      <defs>
        <pattern id={`dots-${variant}`} width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.2" fill="currentColor" opacity="0.35" />
        </pattern>
      </defs>
      <rect width="200" height="200" fill={`url(#dots-${variant})`} />
      <g transform={`rotate(${rot} 100 100)`}>
        <circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="54" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="10" strokeDasharray="2 10" />
        <path
          d="M30 150 C 60 60, 140 160, 172 54"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.55"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="1 14"
        />
        {/* robô */}
        <g transform="translate(118 62) rotate(-25)">
          <rect x="-16" y="-13" width="32" height="26" rx="6" fill="currentColor" opacity="0.9" />
          <rect x="-20" y="-16" width="8" height="10" rx="2" fill="currentColor" opacity="0.6" />
          <rect x="12" y="-16" width="8" height="10" rx="2" fill="currentColor" opacity="0.6" />
          <rect x="-20" y="6" width="8" height="10" rx="2" fill="currentColor" opacity="0.6" />
          <rect x="12" y="6" width="8" height="10" rx="2" fill="currentColor" opacity="0.6" />
          <circle cx="0" cy="-4" r="4" fill="var(--color-base-100)" opacity="0.85" />
        </g>
        <rect x="36" y="128" width="26" height="26" rx="5" fill="none" stroke="currentColor" strokeOpacity="0.6" strokeWidth="2" />
      </g>
    </svg>
  );
}

/** Número grande em mono (contagens e placares). */
export function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div>
      <p className="font-mono text-xl font-bold leading-none tracking-tight">{value}</p>
      <p className="mt-1 text-[11px] text-base-content/50">{label}</p>
    </div>
  );
}
