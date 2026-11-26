import type { HTMLAttributes, ReactNode } from "react";
import { cn, textureClass, toneFill, toneSoft, type Texture, type Tone } from "../lib";

/* ------------------------------------------------------------------ */
/*  Card — dois níveis, como na home do site:                          */
/*   · padrão: borda base-300, hover com borda no tom                  */
/*   · featured: canto recortado grande + sombra dura de 8px           */
/* ------------------------------------------------------------------ */

type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: Tone;
  /** Hover: sobe e pinta a borda (padrão) ou cresce a sombra (featured). */
  interactive?: boolean;
  /** Card de destaque: canto recortado + sombra dura. */
  featured?: boolean;
  /** Canto recortado sem sombra. */
  corner?: boolean;
  tilt?: number;
  padded?: boolean;
  /** Papel no tom "paper", ruído nos tons coloridos (padrão). */
  texture?: Texture;
};

export function Card({
  tone = "paper",
  interactive,
  featured,
  corner,
  tilt,
  padded = true,
  texture,
  className,
  style,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      {...rest}
      className={cn(
        "relative",
        textureClass[texture ?? (tone === "paper" ? "paper" : "both")],
        featured || corner ? "rounded-tl-[2rem] rounded-br-[2rem]" : "rounded-2xl",
        toneFill[tone],
        tone === "paper" && "stage-ink",
        featured && "stage-shadow-lg",
        padded && "p-6",
        interactive && "group cursor-pointer transition-all duration-300 ease-out",
        interactive && !featured && "hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_12px_30px_-18px_color-mix(in_oklab,var(--color-base-content)_45%,transparent)]",
        interactive && featured && "hover:-translate-y-1.5 hover:shadow-[10px_10px_0_0_var(--stage-shadow)]",
        className,
      )}
      style={{ rotate: tilt ? `${tilt}deg` : undefined, ...style }}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
  iconTone = "primary",
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  iconTone?: Tone;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <span className={cn("grid size-10 shrink-0 place-items-center rounded-tl-lg rounded-br-lg transition-colors duration-300", toneSoft[iconTone])}>
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold tracking-tight">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm opacity-65">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/** Section do Panel Kit — mesma API de `Section` em components/stage/tool/panel-kit.tsx. */
export function PanelSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-base-content/60">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}
