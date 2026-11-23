"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Minus, Plus } from "lucide-react";
import { cn, toneFill, type Tone } from "../lib";

/* ------------------------------------------------------------------ */
/*  Formulário — campos daisyUI com contorno de tinta e foco vermelho. */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-semibold text-base-content/80">{label}</span>
      {children}
      {(error || hint) && (
        <span className={cn("text-xs", error ? "font-semibold text-error" : "text-base-content/60")}>{error ?? hint}</span>
      )}
    </label>
  );
}

export function Input({
  icon,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }) {
  return (
    <span className={cn("input w-full", className)}>
      {icon && <span className="opacity-60">{icon}</span>}
      <input {...rest} className="grow" />
    </span>
  );
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={cn("textarea w-full", className)} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...rest} className={cn("select w-full", className)}>
      {children}
    </select>
  );
}

/** Linha label + switch (substitui o ToggleRow do panel-kit). */
export function SwitchRow({
  label,
  description,
  checked,
  onChange,
  tone = "primary",
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  tone?: "primary" | "secondary" | "success" | "accent";
}) {
  const toneCls = { primary: "toggle-primary", secondary: "toggle-secondary", success: "toggle-success", accent: "toggle-accent" };
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-1.5">
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {description && <span className="block text-xs text-base-content/60">{description}</span>}
      </span>
      <input
        type="checkbox"
        className={cn("toggle", toneCls[tone])}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

/** Grupo de opções em pílulas (rádio) — modalidade, cor da cena, nível. */
export function PillChoice<T extends string | number>({
  options,
  value,
  onChange,
  tone = "secondary",
  size = "md",
  label,
}: {
  options: { value: T; label: ReactNode }[];
  value: T | null | undefined;
  onChange: (v: T) => void;
  tone?: Tone;
  size?: "sm" | "md";
  label?: string;
}) {
  const name = useId();
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <label
            key={String(o.value)}
            className={cn(
              "cursor-pointer select-none rounded-tl-lg rounded-br-lg border font-semibold transition-all has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
              size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm",
              active
                ? cn(toneFill[tone], "stage-shadow-sm -translate-y-px border-transparent")
                : "border-base-300 bg-base-100 hover:border-primary/40 hover:text-primary",
            )}
          >
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={active}
              onChange={() => onChange(o.value)}
            />
            {o.label}
          </label>
        );
      })}
    </div>
  );
}

/** Contador +/− (peças, voltas, pontos). */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}) {
  const btn =
    "grid size-9 place-items-center bg-base-100 transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed";
  return (
    <div className="stage-ink inline-flex items-stretch overflow-hidden rounded-tl-xl rounded-br-xl" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - step))} disabled={value <= min} aria-label="Diminuir">
        <Minus size={16} strokeWidth={2.5} />
      </button>
      <output className="stage-display grid min-w-12 place-items-center border-x border-[var(--stage-line)] bg-base-200 px-2 text-xl tabular-nums" aria-live="polite">
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + step))} disabled={value >= max} aria-label="Aumentar">
        <Plus size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
