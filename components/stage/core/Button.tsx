import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { cn } from "../lib";

/* ------------------------------------------------------------------ */
/*  Button — o CTA do robostage.com.br: canto recortado + sombra dura. */
/*  Tons cheios ganham a sombra; ghost/outline seguem o daisyUI puro.  */
/* ------------------------------------------------------------------ */

export type ButtonTone =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "ink"
  | "outline"
  | "ghost";

type Common = {
  tone?: ButtonTone;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** corner = canto recortado da marca (padrão) · rounded = daisyUI · pill · circle/square = só ícone */
  shape?: "corner" | "rounded" | "pill" | "square" | "circle";
  /** Inclinação leve, para CTAs-sticker. */
  tilt?: number;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  /** Tira a sombra dura de um tom cheio. */
  flat?: boolean;
  /** Grão de impressão nos tons cheios. Padrão: true. */
  texture?: boolean;
  className?: string;
  children?: ReactNode;
};

const toneClass: Record<ButtonTone, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  accent: "btn-accent",
  success: "btn-success",
  warning: "btn-warning",
  ink: "border-base-content bg-base-content text-base-100 hover:bg-base-content/90",
  outline: "border-base-300 bg-base-100 text-base-content hover:border-primary hover:text-primary hover:bg-base-100",
  ghost: "btn-ghost",
};

const sizeClass = {
  xs: "btn-xs",
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
  xl: "btn-xl",
};

// O globals.css do site tem `.btn { border-radius: var(--radius-box) }` fora de
// camada, que vence qualquer utilitário rounded-*. Por isso o `!` aqui.
const shapeClass = {
  corner: "rounded-[0.75rem_0_0.75rem_0]! px-[1.25em]",
  rounded: "px-[1.25em]",
  pill: "rounded-full! px-[1.4em]",
  square: "btn-square rounded-[0.75rem_0_0.75rem_0]!",
  circle: "btn-circle rounded-full!",
};

export function buttonClasses({
  tone = "primary",
  size = "md",
  shape = "corner",
  flat,
  texture = true,
  className,
}: Pick<Common, "tone" | "size" | "shape" | "flat" | "texture" | "className">) {
  const filled = tone !== "ghost" && tone !== "outline";
  return cn(
    "btn group gap-2 font-bold",
    toneClass[tone],
    sizeClass[size],
    shapeClass[shape],
    filled && !flat && "stage-shadow stage-press",
    filled && texture && "stage-noise",
    !filled && "transition-colors",
    className,
  );
}

function Inner({ iconLeft, iconRight, loading, children }: Common) {
  return (
    <>
      {loading ? <span className="loading loading-spinner loading-sm" /> : iconLeft}
      {children}
      {iconRight && <span className="transition-transform duration-200 group-hover:translate-x-1">{iconRight}</span>}
    </>
  );
}

export function Button({
  tone,
  size,
  shape,
  tilt,
  iconLeft,
  iconRight,
  loading,
  flat,
  texture,
  className,
  children,
  style,
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      disabled={rest.disabled || loading}
      className={buttonClasses({ tone, size, shape, flat, texture, className })}
      style={{ rotate: tilt ? `${tilt}deg` : undefined, ...style }}
    >
      <Inner iconLeft={iconLeft} iconRight={iconRight} loading={loading}>
        {children}
      </Inner>
    </button>
  );
}

/** Mesmo visual, como link do Next. */
export function ButtonLink({
  tone,
  size,
  shape,
  tilt,
  iconLeft,
  iconRight,
  flat,
  texture,
  className,
  children,
  style,
  ...rest
}: Common & ComponentProps<typeof Link>) {
  return (
    <Link
      {...rest}
      className={buttonClasses({ tone, size, shape, flat, texture, className })}
      style={{ rotate: tilt ? `${tilt}deg` : undefined, ...style }}
    >
      <Inner iconLeft={iconLeft} iconRight={iconRight}>
        {children}
      </Inner>
    </Link>
  );
}
