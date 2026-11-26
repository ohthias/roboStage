'use client';

import React from 'react';

/**
 * Primitivas visuais compartilhadas pelo editor do ThinkLab.
 * Mantêm o mesmo vocabulário (espaçamentos, rótulos, campos com sufixo)
 * entre a sidebar, o inspetor e os controles do canvas.
 */

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

/** Bloco de seção do inspetor: título à esquerda, ação opcional à direita. */
export function PanelSection({
  title,
  action,
  children,
  className,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('px-4 py-4 border-b border-base-300/70 last:border-b-0', className)}>
      <div className="flex items-center justify-between gap-2 min-h-6">
        <h3 className="text-sm font-medium text-base-content">{title}</h3>
        {action}
      </div>
      {children && <div className="mt-3 space-y-3">{children}</div>}
    </section>
  );
}

/** Rótulo pequeno para sub-grupos dentro de uma seção. */
export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="block text-xs text-base-content/60 mb-1.5">{children}</span>;
}

/**
 * Campo numérico com sufixo (ex.: "100 %", "4 px", "24 L").
 * Usa o `input` do daisyUI 5 como container, com o sufixo como `label`.
 */
export function SuffixInput({
  value,
  suffix,
  onChange,
  min,
  max,
  step = 1,
  disabled,
  ariaLabel,
  className,
}: {
  value: number;
  suffix: string;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        'input input-sm w-full bg-base-200 border-transparent shadow-none pr-0 gap-0',
        'focus-within:border-primary/60 focus-within:outline-none',
        disabled && 'opacity-50',
        className
      )}
    >
      <input
        type="number"
        className="tabular-nums grow min-w-0"
        value={Number.isFinite(value) ? Math.round(value * 100) / 100 : 0}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (Number.isNaN(next)) return;
          const clamped = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, next));
          onChange(clamped);
        }}
      />
      <span className="h-full w-8 shrink-0 grid place-items-center border-l border-base-100 text-xs text-base-content/55">
        {suffix}
      </span>
    </label>
  );
}

/** Ícone dentro de um círculo neutro — o "avatar" das linhas de lista. */
export function IconBubble({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={cn(
        'size-9 shrink-0 rounded-full bg-base-200 text-base-content grid place-items-center',
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
}

/** Controle segmentado (estilo "Desktop | Mobile" da referência). */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  size = 'sm',
  ariaLabel,
  className,
}: {
  options: Array<{ value: T; label: React.ReactNode; title?: string }>;
  value: T;
  onChange: (value: T) => void;
  size?: 'xs' | 'sm';
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn('flex w-full gap-0.5 rounded-field bg-base-200 p-0.5', className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={active}
            title={opt.title}
            onClick={() => onChange(opt.value)}
            className={cn(
              'btn btn-ghost flex-1 border-0 font-normal shadow-none px-1',
              size === 'xs' ? 'btn-xs' : 'btn-sm',
              active
                ? 'bg-base-100 text-base-content shadow-xs hover:bg-base-100'
                : 'text-base-content/60 hover:bg-base-300/60'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
