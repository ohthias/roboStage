import type { ReactNode } from "react";
import { cn, toneFill, type Tone } from "../lib";

/* ------------------------------------------------------------------ */
/*  Etiquetas — todas no padrão mono + canto recortado do site.        */
/* ------------------------------------------------------------------ */

/**
 * StickerTag — etiqueta mono com canto recortado ("DISPONÍVEL").
 * Com `rotate`, vira o selo inclinado colado sobre títulos.
 */
export function StickerTag({
  children,
  tone = "paper",
  rotate = 0,
  size = "md",
  shadow = true,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  rotate?: number;
  size?: "sm" | "md" | "lg";
  shadow?: boolean;
  className?: string;
}) {
  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-[11px]",
    lg: "px-3 py-1.5 text-xs",
  };
  return (
    <span
      className={cn(
        "stage-noise stage-corner-sm inline-flex items-center gap-1.5 font-mono font-bold uppercase tracking-[0.15em]",
        toneFill[tone],
        tone === "paper" && "stage-ink",
        shadow && "stage-shadow-sm",
        sizes[size],
        className,
      )}
      style={{ rotate: rotate ? `${rotate}deg` : undefined }}
    >
      {children}
    </span>
  );
}

export type Status = "live" | "open" | "soon" | "draft" | "done" | "closed";

const statusMap: Record<Status, { label: string; cls: string; dot: string; pulse?: boolean }> = {
  live: { label: "Ao vivo", cls: "bg-primary text-primary-content", dot: "bg-primary-content", pulse: true },
  open: { label: "Inscrições abertas", cls: "bg-success/15 text-success border-success/30", dot: "bg-success" },
  soon: { label: "Em breve", cls: "bg-accent/20 text-[color-mix(in_oklab,var(--color-accent)_50%,var(--color-base-content))] border-accent/40", dot: "bg-accent" },
  draft: { label: "Rascunho", cls: "bg-base-200 text-base-content/70 border-dashed border-base-content/25", dot: "bg-base-content/40" },
  done: { label: "Encerrado", cls: "bg-base-content text-base-100", dot: "bg-base-100" },
  closed: { label: "Fechado", cls: "bg-base-300 text-base-content/60", dot: "bg-base-content/40" },
};

/** StatusBadge — estado de evento, partida ou projeto. */
export function StatusBadge({ status, children, className }: { status: Status; children?: ReactNode; className?: string }) {
  const s = statusMap[status];
  return (
    <span
      className={cn(
        "stage-corner-sm inline-flex items-center gap-1.5 border border-transparent px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em]",
        s.cls,
        className,
      )}
    >
      <span className="relative flex size-1.5">
        {s.pulse && <span className={cn("absolute inset-0 rounded-full animate-live", s.dot)} />}
        <span className={cn("relative size-1.5 rounded-full", s.dot)} />
      </span>
      {children ?? s.label}
    </span>
  );
}

/** Chip — o badge mono do hero ("FLL", "OBR"); clicável vira filtro. */
export function Chip({
  children,
  active,
  tone = "primary",
  icon,
  soon,
  onClick,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  tone?: Tone;
  icon?: ReactNode;
  /** Pontilhado e apagado, como "Em breve" no hero. */
  soon?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-pressed={onClick ? !!active : undefined}
      className={cn(
        "stage-corner-sm inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-xs transition-colors",
        soon
          ? "border-dashed border-base-content/25 bg-base-100/30 text-base-content/55"
          : active
            ? cn(toneFill[tone], "border-transparent")
            : "border-base-content/20 bg-base-100/60 text-base-content/80 hover:border-primary hover:text-primary",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {icon}
      {children}
    </Comp>
  );
}
