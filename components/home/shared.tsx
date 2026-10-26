import type { ReactNode } from "react";

// Amarelo misturado com a cor do texto: ocre no tema claro, amarelo claro no
// escuro. Legível nos dois, ao contrário de accent-content.
export const ACCENT_TEXT =
  "text-[color-mix(in_oklab,var(--color-accent)_55%,var(--color-base-content))]";

export type Tone = "primary" | "secondary" | "accent";

export const toneClasses: Record<
  Tone,
  { icon: string; tag: string; ring: string; hover: string; dot: string }
> = {
  primary: {
    icon: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-content",
    tag: "text-primary",
    ring: "group-hover:border-primary/30",
    hover: "hover:border-primary/40",
    dot: "bg-primary",
  },
  secondary: {
    icon: "bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-content",
    tag: "text-secondary",
    ring: "group-hover:border-secondary/30",
    hover: "hover:border-secondary/40",
    dot: "bg-secondary",
  },
  accent: {
    icon: `bg-accent/20 ${ACCENT_TEXT} group-hover:bg-accent group-hover:text-accent-content`,
    tag: ACCENT_TEXT,
    ring: "group-hover:border-accent/50",
    hover: "hover:border-accent/60",
    dot: "bg-accent",
  },
};

export function SectionTitle({
  kicker,
  title,
  highlight,
  highlightClass = "bg-primary text-primary-content",
  description,
  align = "left",
  children,
}: {
  kicker: string;
  title: string;
  highlight: string;
  highlightClass?: string;
  description?: string;
  align?: "left" | "center";
  children?: ReactNode;
}) {
  const center = align === "center";
  return (
    <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      <p className="font-mono text-xs tracking-[0.2em] text-base-content/45">
        {kicker}
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
        {title}{" "}
        <span
          className={`mt-2 inline-block -rotate-1 px-3 py-1 italic ${highlightClass}`}
        >
          {highlight}
        </span>
      </h2>
      {description && (
        <p
          className={`mt-6 max-w-2xl text-base leading-7 text-base-content/60 sm:text-lg ${center ? "mx-auto" : ""}`}
        >
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

export function AnimatedBackground() {
  return (
    <div className="rs-background" aria-hidden="true">
      <div className="rs-glow rs-glow-one" />
      <div className="rs-glow rs-glow-two" />
      <div className="rs-grid" />
    </div>
  );
}
