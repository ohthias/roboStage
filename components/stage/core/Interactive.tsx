"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, MotionLazy, motion } from "./lazy-motion";
import { Plus, X } from "lucide-react";
import { cn, toneFill, type Tone } from "../lib";
import { Flower } from "../decor/Stickers";

/* ================================================================ TABS */

/** Abas segmentadas em cápsula, com indicador deslizante. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  tone = "paper",
  className,
}: {
  tabs: { value: T; label: ReactNode; icon?: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  tone?: Tone;
  className?: string;
}) {
  const layoutId = useId();
  return (
    <MotionLazy>
    <div role="tablist" className={cn("stage-paper inline-flex max-w-full gap-1 overflow-x-auto rounded-tl-2xl rounded-br-2xl bg-base-200/60 p-1.5 [scrollbar-width:none]", className)}>
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              "relative isolate flex shrink-0 items-center gap-1.5 rounded-tl-xl rounded-br-xl px-4 py-2 text-sm font-semibold transition-colors",
              active ? toneFill[tone].split(" ").filter((c) => c.startsWith("text-")).join(" ") : "text-base-content/60 hover:text-base-content",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className={cn("absolute inset-0 -z-10 rounded-tl-xl rounded-br-xl shadow-sm", toneFill[tone])}
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            {t.icon}
            {t.label}
          </button>
        );
      })}
    </div>
    </MotionLazy>
  );
}

/* =========================================================== ACCORDION */

/** FAQ em pílulas (referência "MOST COMMON QUESTIONS"). Mesma API do Accordion atual. */
export function Accordion({
  items,
  defaultOpen = null,
}: {
  items: { title: string; content: ReactNode }[];
  defaultOpen?: number | null;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const baseId = useId();
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.title}
            className={cn(
              "stage-paper overflow-hidden rounded-xl border border-base-300 transition-all duration-200",
              isOpen ? "bg-base-200/60 shadow-[4px_4px_0_0_var(--color-primary)]" : "bg-base-200/30 hover:bg-base-200/60",
            )}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`${baseId}-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-primary"
            >
              {item.title}
              <Plus
                size={22}
                strokeWidth={1.75}
                className={cn(
                  "shrink-0 transition-all duration-300",
                  isOpen ? "rotate-45 text-primary" : "text-base-content/40 group-hover:rotate-90 group-hover:text-primary",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${baseId}-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <div className="px-5 pb-5 text-sm leading-relaxed text-base-content/70">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* =============================================================== MODAL */

const modalSize = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Trava a rolagem da página, prende o Tab no painel e devolve o foco ao fechar. */
export function useDialogBehavior(open: boolean, onClose: () => void, panelRef: React.RefObject<HTMLElement | null>) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      const panel = panelRef.current;
      const first = panel?.querySelector<HTMLElement>("[data-autofocus]") ?? panel?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panel)?.focus();
    }, 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key !== "Tab" || !panelRef.current) return;
      const els = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!els.length) return;
      const [first, last] = [els[0], els[els.length - 1]];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, panelRef]);
}

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Rótulo mono acima do título ("/ CONFIRMAÇÃO"). */
  kicker?: string;
  /** Ícone em caixa colorida ao lado do título. */
  icon?: ReactNode;
  iconTone?: Tone;
  size?: keyof typeof modalSize;
  /** Sticker decorativo no canto (tempero da referência). */
  sticker?: boolean;
  /** Fechar clicando fora (padrão: true). */
  dismissible?: boolean;
  /**
   * Desenha o modal parado na página, sem fundo escuro nem trava de rolagem
   * (vitrines, documentação, telas de exemplo). Ignora `open`.
   */
  inline?: boolean;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

type PanelProps = Omit<ModalProps, "open" | "dismissible" | "inline"> & { titleId?: string };

/** ModalPanel — só o painel (cabeçalho, corpo, rodapé), sem overlay. */
export function ModalPanel({
  onClose,
  title,
  description,
  kicker,
  icon,
  iconTone = "primary",
  size = "md",
  sticker = true,
  children,
  footer,
  className,
  titleId,
}: PanelProps) {
  return (
    <>
      {sticker && <Flower size={46} tone="accent" motion="spin" className="absolute -right-4 -top-5 hidden sm:block" />}
      <div className="flex items-start justify-between gap-4 border-b border-base-300 px-6 py-5">
        <div className="flex min-w-0 items-start gap-3">
          {icon && (
            <span className={cn("stage-noise grid size-11 shrink-0 place-items-center rounded-tl-xl rounded-br-xl", toneFill[iconTone])}>{icon}</span>
          )}
          <div className="min-w-0">
            {kicker && <p className="stage-kicker mb-1 text-base-content/45">/ {kicker}</p>}
            <h2 id={titleId} className="text-xl font-black leading-tight tracking-tight">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-base-content/60">{description}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="btn btn-circle btn-ghost btn-sm rounded-full! shrink-0 transition-transform hover:rotate-90"
        >
          <X size={18} />
        </button>
      </div>
      {children != null && <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</div>}
      {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-base-300 px-6 py-4">{footer}</div>}
    </>
  );
}

export const modalPanelClass = (size: keyof typeof modalSize = "md", className?: string) =>
  cn(
    "stage-paper stage-shadow-lg relative flex w-full flex-col bg-base-100 outline-none",
    "rounded-t-[2rem] sm:rounded-tl-[2rem] sm:rounded-br-[2rem] sm:rounded-tr-lg sm:rounded-bl-lg",
    modalSize[size],
    className,
  );

/** Modal — mesma API do BaseModal (open, onClose, title, description, size, footer) e mais. */
export function Modal({ open, onClose, dismissible = true, inline, size = "md", className, ...panel }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useDialogBehavior(open && !inline, onClose, panelRef);

  if (inline) {
    return (
      <div role="group" aria-labelledby={titleId} className={cn(modalPanelClass(size, className), "rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-lg rounded-bl-lg")}>
        <ModalPanel {...panel} size={size} onClose={onClose} titleId={titleId} />
      </div>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:px-3"
          onClick={dismissible ? onClose : undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ scale: 0.96, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 24, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className={cn(modalPanelClass(size, className), "max-h-[92svh]")}
          >
            <ModalPanel {...panel} size={size} onClose={onClose} titleId={titleId} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
