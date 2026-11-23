"use client";

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, ChevronDown, Info, TriangleAlert, X } from "lucide-react";
import { cn, type Tone } from "../lib";
import { useDialogBehavior } from "../core/Interactive";

/* ------------------------------------------------------------------ */
/*  Kit Ferramenta — versão institucional e funcional dos componentes  */
/*  para usar DENTRO das ferramentas (QuickBrick, StageBook, LabTest). */
/*  Regras: sem sticker, sem inclinação, sem textura, sem sombra dura; */
/*  densidade alta (28–36px de altura), raio pequeno, foco visível,    */
/*  mesmas cores e Roboto. O canto recortado fica só no botão primário.*/
/* ------------------------------------------------------------------ */

/**
 * ToolScope — envolve a área de trabalho da ferramenta. Desliga texturas
 * (data-texture="off") e aplica o fundo neutro. Os componentes "de
 * vitrine" usados aqui dentro também ficam sem textura.
 */
export function ToolScope({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div data-texture="off" className={cn("stage-tool bg-base-200/40 text-sm text-base-content", className)}>
      {children}
    </div>
  );
}

/* ========================================================== BOTÕES */

type ToolBtnVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
const btnVariant: Record<ToolBtnVariant, string> = {
  primary: "bg-primary text-primary-content hover:bg-primary/90 border-transparent rounded-tl-lg rounded-br-lg rounded-tr-sm rounded-bl-sm",
  secondary: "bg-secondary text-secondary-content hover:bg-secondary/90 border-transparent rounded-md",
  outline: "bg-base-100 border-base-300 hover:border-base-content/30 hover:bg-base-200/60 rounded-md",
  ghost: "border-transparent bg-transparent hover:bg-base-content/[0.06] rounded-md",
  danger: "bg-base-100 border-base-300 text-error hover:bg-error hover:text-error-content hover:border-error rounded-md",
};
const btnSize = { xs: "h-7 px-2 text-xs gap-1", sm: "h-8 px-2.5 text-[13px] gap-1.5", md: "h-9 px-3.5 text-sm gap-2" };

export function ToolButton({
  variant = "outline",
  size = "sm",
  icon,
  iconRight,
  active,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ToolBtnVariant;
  size?: keyof typeof btnSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  /** Estado ligado (ferramenta selecionada na barra). */
  active?: boolean;
}) {
  return (
    <button
      type="button"
      {...rest}
      aria-pressed={active ?? rest["aria-pressed"]}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap border font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4",
        btnVariant[variant],
        btnSize[size],
        active && "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15",
        className,
      )}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

/** Botão só com ícone — `label` vira aria-label e dica. */
export function IconButton({
  label,
  icon,
  size = "sm",
  variant = "ghost",
  active,
  className,
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & { label: string; icon: ReactNode; size?: "xs" | "sm" | "md"; variant?: ToolBtnVariant; active?: boolean }) {
  const s = { xs: "size-7", sm: "size-8", md: "size-9" }[size];
  return (
    <ToolButton {...rest} variant={variant} active={active} aria-label={label} title={label} className={cn("px-0", s, className)}>
      {icon}
    </ToolButton>
  );
}

/* ========================================================= TOOLBAR */

export function Toolbar({ children, className, label = "Ferramentas" }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <div role="toolbar" aria-label={label} className={cn("flex min-h-11 flex-wrap items-center gap-1 border-b border-base-300 bg-base-100 px-2 py-1.5", className)}>
      {children}
    </div>
  );
}
export function ToolbarGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex items-center gap-0.5", className)}>{children}</div>;
}
export function ToolbarDivider() {
  return <span aria-hidden className="mx-1.5 h-5 w-px bg-base-300" />;
}
export function ToolbarSpacer() {
  return <span aria-hidden className="flex-1" />;
}

/* ========================================================== PAINEL */

/** Panel — caixa de trabalho com cabeçalho fino; `collapsible` abre/fecha. */
export function Panel({
  title,
  icon,
  actions,
  collapsible,
  defaultOpen = true,
  padded = true,
  footer,
  children,
  className,
}: {
  title?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  padded?: boolean;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <section className={cn("overflow-hidden rounded-lg border border-base-300 bg-base-100", className)}>
      {title && (
        <header className="flex h-10 items-center gap-2 border-b border-base-300 px-3">
          {collapsible ? (
            <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} className="flex min-w-0 flex-1 items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-primary">
              <ChevronDown size={14} className={cn("shrink-0 text-base-content/50 transition-transform", !open && "-rotate-90")} />
              {icon && <span className="text-base-content/60 [&>svg]:size-4">{icon}</span>}
              <span className="truncate text-[13px] font-bold">{title}</span>
            </button>
          ) : (
            <span className="flex min-w-0 flex-1 items-center gap-2">
              {icon && <span className="text-base-content/60 [&>svg]:size-4">{icon}</span>}
              <span className="truncate text-[13px] font-bold">{title}</span>
            </span>
          )}
          {actions && <div className="flex items-center gap-0.5">{actions}</div>}
        </header>
      )}
      {open && (
        <div id={id} className={cn(padded && "p-3")}>
          {children}
        </div>
      )}
      {open && footer && <footer className="flex items-center justify-end gap-2 border-t border-base-300 bg-base-200/40 px-3 py-2">{footer}</footer>}
    </section>
  );
}

/** PanelSection — rótulo de grupo dentro de um painel. */
export function ToolSection({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-2 py-2 first:pt-0 last:pb-0", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50">{title}</p>
      {children}
    </div>
  );
}

/* ======================================================= CAMPOS */

const fieldBase =
  "h-8 w-full rounded-md border border-base-300 bg-base-100 px-2.5 text-[13px] transition-colors placeholder:text-base-content/40 hover:border-base-content/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50";

export function ToolInput({ className, icon, suffix, ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> & { icon?: ReactNode; suffix?: ReactNode }) {
  if (!icon && !suffix) return <input {...rest} className={cn(fieldBase, className)} />;
  return (
    <span className={cn(fieldBase, "flex items-center gap-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20", className)}>
      {icon && <span className="shrink-0 text-base-content/45 [&>svg]:size-3.5">{icon}</span>}
      <input {...rest} className="h-full min-w-0 flex-1 bg-transparent outline-none" />
      {suffix && <span className="shrink-0 font-mono text-[11px] text-base-content/45">{suffix}</span>}
    </span>
  );
}

export function ToolSelect({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative block">
      <select {...rest} className={cn(fieldBase, "appearance-none pr-7", className)}>
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-base-content/45" />
    </span>
  );
}

/** PropertyRow — "rótulo: controle" alinhado (painel de propriedades). */
export function PropertyRow({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  const id = useId();
  return (
    <div className={cn("grid grid-cols-[6.5rem_1fr] items-center gap-2 py-1", className)}>
      <label htmlFor={id} className="truncate text-[12px] text-base-content/65" title={hint ?? label}>
        {label}
      </label>
      <div id={id} className="min-w-0">
        {children}
      </div>
    </div>
  );
}

/** Segmented — escolha exclusiva compacta (modo de visão, unidade, alinhamento). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "sm",
  label,
  className,
}: {
  options: { value: T; label?: ReactNode; icon?: ReactNode; title?: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: "xs" | "sm";
  label?: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex rounded-md border border-base-300 bg-base-200/60 p-0.5", className)}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            title={o.title}
            aria-label={!o.label ? o.title : undefined}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center justify-center gap-1 rounded-[5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-primary [&>svg]:size-3.5",
              size === "xs" ? "h-6 px-2 text-[11px]" : "h-7 px-2.5 text-xs",
              on ? "bg-base-100 text-base-content shadow-sm" : "text-base-content/60 hover:text-base-content",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** ToolSwitch — interruptor pequeno com rótulo à esquerda. */
export function ToolSwitch({ label, checked, onChange, className }: { label: string; checked: boolean; onChange: (v: boolean) => void; className?: string }) {
  return (
    <label className={cn("flex cursor-pointer items-center justify-between gap-3 py-1 text-[13px]", className)}>
      <span className="text-base-content/80">{label}</span>
      <input type="checkbox" className="toggle toggle-primary toggle-xs" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

/* ========================================================== ABAS */

/** ToolTabs — abas sublinhadas (dentro de painéis e editores). */
export function ToolTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { value: T; label: ReactNode; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div role="tablist" className={cn("flex gap-4 border-b border-base-300", className)}>
      {tabs.map((t) => {
        const on = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={on}
            onClick={() => onChange(t.value)}
            className={cn(
              "-mb-px inline-flex h-9 items-center gap-1.5 border-b-2 text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-primary",
              on ? "border-primary text-base-content" : "border-transparent text-base-content/55 hover:text-base-content",
            )}
          >
            {t.label}
            {t.count != null && <span className="rounded bg-base-200 px-1.5 font-mono text-[10px]">{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ====================================================== SELOS */

const badgeTone: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/25 text-[color-mix(in_oklab,var(--color-accent)_45%,var(--color-base-content))]",
  info: "bg-info/10 text-info",
  success: "bg-success/12 text-success",
  warning: "bg-warning/20 text-[color-mix(in_oklab,var(--color-warning)_55%,var(--color-base-content))]",
  neutral: "bg-neutral/50 text-neutral-content",
  ink: "bg-base-content/[0.07] text-base-content/75",
  paper: "bg-base-200 text-base-content",
};

export function ToolBadge({ children, tone = "ink", dot, className }: { children: ReactNode; tone?: Tone; dot?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex h-5 items-center gap-1 rounded px-1.5 text-[11px] font-semibold", badgeTone[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* ====================================================== LISTAS */

/** ListItem — linha clicável de lista (missões, documentos, testes). */
export function ListItem({
  title,
  description,
  leading,
  trailing,
  meta,
  selected,
  onClick,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  meta?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-primary",
        selected ? "bg-primary/10" : onClick && "hover:bg-base-content/[0.05]",
        className,
      )}
    >
      {leading && <span className="grid size-7 shrink-0 place-items-center rounded-md bg-base-200 text-base-content/70 [&>svg]:size-4">{leading}</span>}
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-[13px] font-semibold", selected && "text-primary")}>{title}</span>
        {description && <span className="block truncate text-[11px] text-base-content/55">{description}</span>}
      </span>
      {meta && <span className="shrink-0 font-mono text-[11px] text-base-content/50">{meta}</span>}
      {trailing}
    </Comp>
  );
}

export function ListGroup({ label, children, className }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-0.5", className)}>
      {label && <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-base-content/45">{label}</p>}
      {children}
    </div>
  );
}

/* ====================================================== CARDS */

/** InfoTile — número de resumo, sóbrio (barra de métricas da ferramenta). */
export function InfoTile({ label, value, unit, hint, trend, className }: { label: string; value: ReactNode; unit?: string; hint?: ReactNode; trend?: "up" | "down"; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-base-300 bg-base-100 px-3 py-2.5", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50">{label}</p>
      <p className="mt-0.5 text-xl font-bold tabular-nums tracking-tight">
        {value}
        {unit && <span className="ml-0.5 text-xs font-semibold text-base-content/50">{unit}</span>}
      </p>
      {hint && <p className={cn("text-[11px]", trend === "up" ? "text-success" : trend === "down" ? "text-error" : "text-base-content/50")}>{hint}</p>}
    </div>
  );
}

/** PlainCard — card neutro para listas e grades dentro das ferramentas. */
export function PlainCard({
  title,
  description,
  media,
  meta,
  actions,
  selected,
  onClick,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  /** Capa (ex.: <Cover />, <TestCover />). */
  media?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-base-100 transition-[border-color,box-shadow] duration-150",
        selected ? "border-primary ring-2 ring-primary/20" : "border-base-300 hover:border-base-content/25 hover:shadow-sm",
        className,
      )}
    >
      {media && <div className="border-b border-base-300 [&>*]:!rounded-none">{media}</div>}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 text-[13px] font-bold leading-snug">
            {onClick ? (
              <button type="button" onClick={onClick} className="text-left outline-none after:absolute after:inset-0 focus-visible:underline">
                {title}
              </button>
            ) : (
              title
            )}
          </h3>
          {actions && <div className="relative z-10 -mr-1 -mt-1 flex gap-0.5">{actions}</div>}
        </div>
        {description && <p className="mt-1 line-clamp-2 text-xs text-base-content/60">{description}</p>}
        {children && <div className="mt-2">{children}</div>}
        {meta && <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-base-content/50">{meta}</div>}
      </div>
    </article>
  );
}

/* ====================================================== AVISOS */

const alertMeta = {
  info: { icon: <Info size={16} />, cls: "border-info/30 bg-info/[0.07] text-info" },
  success: { icon: <CheckCircle2 size={16} />, cls: "border-success/30 bg-success/[0.07] text-success" },
  warning: { icon: <TriangleAlert size={16} />, cls: "border-warning/40 bg-warning/[0.1] text-[color-mix(in_oklab,var(--color-warning)_60%,var(--color-base-content))]" },
  error: { icon: <AlertCircle size={16} />, cls: "border-error/30 bg-error/[0.07] text-error" },
};

/** InlineAlert — aviso dentro do fluxo (validação, salvamento, regra). */
export function InlineAlert({
  type = "info",
  title,
  children,
  action,
  onClose,
  className,
}: {
  type?: keyof typeof alertMeta;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  onClose?: () => void;
  className?: string;
}) {
  const m = alertMeta[type];
  return (
    <div role={type === "error" ? "alert" : "status"} className={cn("flex items-start gap-2.5 rounded-md border px-3 py-2", m.cls, className)}>
      <span className="mt-0.5 shrink-0">{m.icon}</span>
      <div className="min-w-0 flex-1 text-[13px] text-base-content/80">
        {title && <p className="font-semibold text-base-content">{title}</p>}
        {children}
      </div>
      {action}
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Fechar" className="grid size-6 place-items-center rounded text-base-content/50 hover:bg-base-content/10">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/** ToolEmpty — estado vazio sóbrio (sem mascote). */
export function ToolEmpty({ icon, title, description, action, className }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-2 rounded-lg border border-dashed border-base-300 px-4 py-8 text-center", className)}>
      {icon && <span className="grid size-10 place-items-center rounded-full bg-base-200 text-base-content/50 [&>svg]:size-5">{icon}</span>}
      <p className="text-sm font-bold">{title}</p>
      {description && <p className="max-w-xs text-xs text-base-content/55">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

/** KeyValue — lista "rótulo · valor" compacta. */
export function KeyValue({ items, className }: { items: { label: string; value: ReactNode }[]; className?: string }) {
  return (
    <dl className={cn("divide-y divide-base-300 text-[13px]", className)}>
      {items.map((it) => (
        <div key={it.label} className="flex items-baseline justify-between gap-3 py-1.5">
          <dt className="text-base-content/55">{it.label}</dt>
          <dd className="text-right font-semibold tabular-nums">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ====================================================== TABELA */

export type Column<T> = {
  key: string;
  header: string;
  /** Valor para ordenar (padrão: row[key]). */
  sortValue?: (row: T) => number | string;
  render?: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  width?: string;
};

/** DataTable — tabela densa, cabeçalho fixo, ordenação por coluna e linha selecionável. */
export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  rowKey,
  selectedKey,
  onRowClick,
  maxHeight,
  empty = "Nada por aqui ainda.",
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  selectedKey?: string;
  onRowClick?: (row: T) => void;
  maxHeight?: string;
  empty?: ReactNode;
  className?: string;
}) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    const get = col?.sortValue ?? ((r: T) => r[sort.key] as number | string);
    return [...rows].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      return (va > vb ? 1 : va < vb ? -1 : 0) * sort.dir;
    });
  }, [rows, sort, columns]);

  const alignCls = (a?: string) => (a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left");
  return (
    <div className={cn("overflow-auto rounded-lg border border-base-300 bg-base-100", className)} style={{ maxHeight }}>
      <table className="w-full border-collapse text-[13px]">
        <thead className="sticky top-0 z-10 bg-base-200/95 backdrop-blur">
          <tr>
            {columns.map((c) => {
              const on = sort?.key === c.key;
              const Icon = !on ? ArrowUpDown : sort!.dir === 1 ? ArrowUp : ArrowDown;
              return (
                <th
                  key={c.key}
                  scope="col"
                  style={{ width: c.width }}
                  aria-sort={on ? (sort!.dir === 1 ? "ascending" : "descending") : "none"}
                  className={cn("h-8 border-b border-base-300 px-3 font-semibold text-base-content/60", alignCls(c.align))}
                >
                  <button
                    type="button"
                    onClick={() => setSort(on ? (sort!.dir === 1 ? { key: c.key, dir: -1 } : null) : { key: c.key, dir: 1 })}
                    className={cn("inline-flex items-center gap-1 text-[11px] uppercase tracking-wider hover:text-base-content focus-visible:outline-2 focus-visible:outline-primary", on && "text-base-content")}
                  >
                    {c.header}
                    <Icon size={11} className={cn(!on && "opacity-40")} />
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-base-content/50">
                {empty}
              </td>
            </tr>
          ) : (
            sorted.map((row) => {
              const k = rowKey(row);
              const sel = k === selectedKey;
              return (
                <tr
                  key={k}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={onRowClick ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onRowClick(row)) : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  aria-selected={onRowClick ? sel : undefined}
                  className={cn(
                    "border-b border-base-300/70 last:border-0",
                    onRowClick && "cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
                    sel ? "bg-primary/[0.08]" : onRowClick && "hover:bg-base-content/[0.03]",
                  )}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn("h-9 px-3 tabular-nums", alignCls(c.align))}>
                      {c.render ? c.render(row) : (row[c.key] as ReactNode)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ====================================================== DIÁLOGO */

/**
 * ToolDialog — diálogo sóbrio para dentro das ferramentas: sem sticker, sem
 * textura, raio pequeno. Mesmo comportamento do Modal (foco preso, Esc,
 * trava de rolagem, devolve o foco). `inline` para documentação.
 */
export function ToolDialog({
  open,
  onClose,
  title,
  description,
  size = "sm",
  inline,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  inline?: boolean;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useDialogBehavior(open && !inline, onClose, ref);
  const w = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" }[size];
  const panel = (
    <>
      <div className="flex items-start justify-between gap-3 px-4 pb-2 pt-4">
        <div className="min-w-0">
          <h2 id={titleId} className="text-[15px] font-bold leading-tight">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-[13px] text-base-content/60">{description}</p>}
        </div>
        <IconButton label="Fechar" icon={<X />} size="xs" onClick={onClose} />
      </div>
      {children != null && <div className="max-h-[65vh] overflow-y-auto px-4 py-2 text-[13px]">{children}</div>}
      {footer && <div className="mt-2 flex justify-end gap-2 border-t border-base-300 bg-base-200/40 px-4 py-2.5">{footer}</div>}
    </>
  );
  if (inline)
    return (
      <div role="group" aria-labelledby={titleId} className={cn("w-full overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-lg", w)}>
        {panel}
      </div>
    );
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-3" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={cn("w-full overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-2xl outline-none", w)}
          >
            {panel}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================================================= CONFIRMAÇÃO (v0.9) */

export type ToolConfirmOptions = {
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** danger = botão vermelho e ícone de alerta (padrão). */
  intent?: "danger" | "default";
};

/**
 * ToolConfirmDialog — confirmação sóbria (kit ferramenta). Com `pending`, os
 * botões travam e o diálogo não fecha por Esc/fundo até a ação terminar.
 */
export function ToolConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  intent = "danger",
  pending = false,
  onConfirm,
  onCancel,
}: ToolConfirmOptions & { open: boolean; pending?: boolean; onConfirm: () => void; onCancel: () => void }) {
  const danger = intent === "danger";
  return (
    <ToolDialog
      open={open}
      onClose={pending ? () => {} : onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <ToolButton onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </ToolButton>
          <ToolButton
            variant={danger ? "danger" : "primary"}
            className={danger ? "border-error bg-error text-error-content hover:bg-error/90" : undefined}
            onClick={onConfirm}
            disabled={pending}
            icon={pending ? <span className="loading loading-spinner loading-xs" /> : undefined}
            data-autofocus
          >
            {confirmLabel}
          </ToolButton>
        </>
      }
    >
      {message != null && (
        <div className="flex gap-3 pb-1">
          {danger && (
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-error/10 text-error">
              <TriangleAlert size={18} />
            </span>
          )}
          <div className="text-[13px] leading-relaxed text-base-content/75">{message}</div>
        </div>
      )}
    </ToolDialog>
  );
}

/**
 * useToolConfirm — confirmação por Promise sem provider:
 * `const { confirm, dialog } = useToolConfirm()`, renderize `{dialog}` e
 * `if (await confirm({ title: "Excluir?" })) …`.
 */
export function useToolConfirm() {
  const [opts, setOpts] = useState<ToolConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);
  const confirm = useCallback((o: ToolConfirmOptions) => {
    resolver.current?.(false);
    setOpts(o);
    return new Promise<boolean>((resolve) => (resolver.current = resolve));
  }, []);
  const finish = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOpts(null);
  };
  const dialog = (
    <ToolConfirmDialog
      open={!!opts}
      title={opts?.title ?? ""}
      message={opts?.message}
      confirmLabel={opts?.confirmLabel}
      cancelLabel={opts?.cancelLabel}
      intent={opts?.intent}
      onConfirm={() => finish(true)}
      onCancel={() => finish(false)}
    />
  );
  return { confirm, dialog };
}