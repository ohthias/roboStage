"use client";

import { useEffect, useId, type CSSProperties, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Kit de modais de criação/edição no padrão visual do "Novo evento" do
 * ShowLive: cabeçalho com eyebrow em mono, cantos assimétricos, corpo com
 * rolagem própria e rodapé fixo com as ações.
 *
 * Usa `modal modal-open` (e não `showModal()`) de propósito: os seletores de
 * tag/milestone abrem dropdowns no fluxo normal da página, e o top layer do
 * `<dialog>` nativo os esconderia atrás do modal.
 */

const WIDTH = {
  sm: "sm:max-w-md",
  md: "sm:max-w-xl",
  lg: "sm:max-w-2xl",
} as const;

export function FormDialog({
  open = true,
  onClose,
  eyebrow,
  title,
  description,
  headerSlot,
  size = "md",
  busy = false,
  closeOnEscape = true,
  onSubmit,
  footer,
  children,
}: {
  open?: boolean;
  onClose: () => void;
  /** Linha pequena em mono acima do título (ex.: "Calendário", "QuickBrick"). */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Conteúdo extra no cabeçalho, abaixo do título (ex.: status, chips). */
  headerSlot?: ReactNode;
  size?: keyof typeof WIDTH;
  /** Enquanto true, Esc/backdrop/X não fecham. */
  busy?: boolean;
  /** false enquanto um popover interno (ex.: seletor de ícone) usa o Esc. */
  closeOnEscape?: boolean;
  /** Quando presente, corpo + rodapé viram um `<form>` (Enter envia). */
  onSubmit?: () => void;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy && closeOnEscape) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, closeOnEscape, onClose]);

  if (!open) return null;

  const close = () => {
    if (!busy) onClose();
  };

  const body = (
    <>
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-6 py-5">{children}</div>
      {footer && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-base-300 bg-base-100 px-6 py-4">
          {footer}
        </div>
      )}
    </>
  );

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div
        className={`modal-box flex max-h-[90vh] w-full flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl rounded-tr-none rounded-bl-none p-0 ${WIDTH[size]}`}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-base-300 px-6 py-4">
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-base-content/50">{eyebrow}</p>
            )}
            <h2 id={titleId} className="text-lg font-bold leading-snug">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-base-content/60">{description}</p>}
            {headerSlot}
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square shrink-0"
            onClick={close}
            disabled={busy}
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        {onSubmit ? (
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            {body}
          </form>
        ) : (
          body
        )}
      </div>
      <button type="button" className="modal-backdrop" aria-label="Fechar" onClick={close} />
    </div>
  );
}

/** Campo com rótulo, marcação de opcional e dica abaixo. */
export function Field({
  label,
  optional,
  hint,
  className = "",
  children,
}: {
  label: ReactNode;
  optional?: boolean;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium">
        {label}
        {optional && <span className="ml-1 font-normal text-base-content/45">(opcional)</span>}
      </span>
      <span className="mt-1.5 block">{children}</span>
      {hint && <span className="mt-1 block text-xs text-base-content/55">{hint}</span>}
    </label>
  );
}

/** Grupo de escolhas (cards, chips) com legenda e um slot à direita. */
export function FieldGroup({
  legend,
  hint,
  aside,
  className = "",
  children,
}: {
  legend: ReactNode;
  hint?: ReactNode;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className={className}>
      <div className="mb-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <legend className="text-sm font-medium">{legend}</legend>
          {hint && <p className="text-xs text-base-content/55">{hint}</p>}
        </div>
        {aside}
      </div>
      {children}
    </fieldset>
  );
}

function tint(color: string, pct: number): CSSProperties["background"] {
  return `color-mix(in oklab, ${color} ${pct}%, transparent)`;
}

/**
 * Card de opção com ícone, título e descrição — o mesmo da escolha de liga
 * no ShowLive. `color` troca o primário por uma cor própria (tipo de evento,
 * tipo de diagrama…).
 */
export function OptionCard({
  active,
  onClick,
  icon,
  color,
  title,
  description,
  badge,
  disabled,
  compact,
}: {
  active: boolean;
  onClick: () => void;
  icon?: ReactNode;
  color?: string;
  title: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
  /** Ícone e título numa linha só — para grades com muitas opções. */
  compact?: boolean;
}) {
  const ring = color
    ? { borderColor: active ? color : undefined, boxShadow: active ? `0 0 0 1px ${color}` : undefined, background: active ? tint(color, 7) : undefined }
    : undefined;
  const iconStyle = color
    ? { background: active ? color : tint(color, 14), color: active ? "#fff" : color }
    : undefined;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      disabled={disabled}
      onClick={onClick}
      style={ring}
      className={`flex rounded-tl-xl rounded-br-xl border text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
        compact ? "items-center gap-2 p-2" : "items-start gap-3 p-3"
      } ${
        active
          ? color
            ? ""
            : "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-base-300 hover:border-base-content/30"
      }`}
    >
      {icon && (
        <span
          style={iconStyle}
          className={`flex shrink-0 items-center justify-center rounded-lg ${compact ? "size-7" : "size-9"} ${
            color ? "" : active ? "bg-primary text-primary-content" : "bg-base-200 text-base-content/60"
          }`}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className={`block font-semibold ${compact ? "truncate text-[13px]" : "text-sm"}`}>{title}</span>
          {badge && <span className="badge badge-ghost badge-xs shrink-0">{badge}</span>}
        </span>
        {description && !compact && (
          <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-base-content/55">{description}</span>
        )}
      </span>
    </button>
  );
}

/** Chips de escolha única (temporada, prioridade…). */
export function ChipGroup<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  disabled,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode; meta?: ReactNode; dot?: string; disabled?: boolean }[];
  ariaLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={ariaLabel}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled || o.disabled}
            onClick={() => onChange(o.value)}
            className={`btn btn-sm gap-1.5 rounded-lg ${active ? "btn-neutral" : "btn-ghost border-base-300"}`}
          >
            {o.dot && <span className="size-2 rounded-full" style={{ background: o.dot }} aria-hidden />}
            {o.label}
            {o.meta && <span className="font-mono text-[11px] opacity-60">{o.meta}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Caixa de contexto discreta (o aviso da OBR no ShowLive). */
export function DialogNote({ icon, children, tone = "base" }: { icon?: ReactNode; children: ReactNode; tone?: "base" | "error" }) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={`flex items-start gap-2.5 rounded-xl p-3 text-sm ${
        tone === "error" ? "bg-error/10 text-error" : "bg-base-200/70 text-base-content/70"
      }`}
    >
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Interruptor em linha com título e explicação (ex.: "Dia inteiro"). */
export function ToggleRow({
  checked,
  onChange,
  title,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        {description && <span className="block text-xs text-base-content/55">{description}</span>}
      </span>
      <input
        type="checkbox"
        className="toggle toggle-sm toggle-primary"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
