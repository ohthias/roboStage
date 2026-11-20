"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, Loader2, TriangleAlert, X } from "lucide-react";
import { cn } from "../lib";

/* ------------------------------------------------------------------ */
/*  Toasts — avisos curtos.                                            */
/*  · <Toast /> é só o visual (use em qualquer lugar)                  */
/*  · <ToastProvider /> + useToast() é o sistema completo, compatível  */
/*    com o addToast(message, type, duration) do app/context atual     */
/* ------------------------------------------------------------------ */

export type ToastType = "info" | "success" | "warning" | "error" | "loading";

export const TOAST_STYLES: Record<ToastType, { tone: string; bar: string; icon: ReactNode; label: string }> = {
  info: { tone: "bg-info text-info-content", bar: "bg-info", icon: <Info size={18} />, label: "Info" },
  success: { tone: "bg-success text-success-content", bar: "bg-success", icon: <CheckCircle2 size={18} />, label: "Feito!" },
  warning: { tone: "bg-warning text-warning-content", bar: "bg-warning", icon: <TriangleAlert size={18} />, label: "Atenção" },
  error: { tone: "bg-error text-error-content", bar: "bg-error", icon: <AlertCircle size={18} />, label: "Ops" },
  loading: { tone: "bg-base-content text-base-100", bar: "bg-base-content", icon: <Loader2 size={18} className="animate-spin" />, label: "Aguarde" },
};

export type ToastAction = { label: string; onClick: () => void };

export type ToastProps = {
  type?: ToastType;
  /** Título curto; sem ele, usa o rótulo do tipo ("Feito!", "Ops"…). */
  title?: ReactNode;
  message?: ReactNode;
  action?: ToastAction;
  /** card = papel com ícone colorido · solid = cheio na cor do tipo */
  variant?: "card" | "solid";
  /** 0–1: barra de tempo restante (opcional). */
  progress?: number;
  onClose?: () => void;
  className?: string;
};

/** Toast — o visual. */
export function Toast({ type = "info", title, message, action, variant = "card", progress, onClose, className }: ToastProps) {
  const s = TOAST_STYLES[type];
  const solid = variant === "solid";
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={cn(
        "stage-shadow relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-tl-xl rounded-br-xl p-3 pr-2",
        solid ? cn("stage-texture", s.tone) : "stage-paper stage-ink bg-base-100",
        className,
      )}
    >
      <span className={cn("stage-noise grid size-9 shrink-0 place-items-center rounded-tl-lg rounded-br-lg", solid ? "bg-white/20" : s.tone)}>
        {s.icon}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-black leading-tight tracking-tight">{title ?? s.label}</p>
        {message && <p className={cn("mt-0.5 text-sm leading-snug", solid ? "opacity-90" : "text-base-content/75")}>{message}</p>}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className={cn(
              "mt-2 rounded-tl-md rounded-br-md px-2 py-1 text-xs font-bold underline-offset-2 transition",
              solid ? "bg-white/20 hover:bg-white/30" : "bg-base-200 hover:bg-primary hover:text-primary-content",
            )}
          >
            {action.label}
          </button>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar aviso"
          className={cn("grid size-7 shrink-0 place-items-center rounded-full transition", solid ? "hover:bg-white/20" : "hover:bg-base-200")}
        >
          <X size={15} />
        </button>
      )}
      {progress != null && (
        <span aria-hidden className={cn("absolute bottom-0 left-0 h-1", solid ? "bg-white/50" : s.bar)} style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }} />
      )}
    </div>
  );
}

/* ============================================================ SISTEMA */

type Item = ToastProps & { id: string; duration: number };

export type ToastOptions = Omit<ToastProps, "onClose" | "progress" | "className"> & {
  /** ms; 0 = só fecha manualmente. Padrão: 4000 (erro: 6000). */
  duration?: number;
  id?: string;
};

type ToastApi = {
  /** API nova: toast({ type, title, message, action, duration }). */
  toast: (opts: ToastOptions) => string;
  /** Compatível com o ToastContext atual. */
  addToast: (message: string, type?: Exclude<ToastType, "loading">, duration?: number) => string;
  /** Mostra "carregando" e troca por sucesso/erro quando a promise termina. */
  promise: <T>(p: Promise<T>, msgs: { loading: ReactNode; success: ReactNode | ((v: T) => ReactNode); error: ReactNode | ((e: unknown) => ReactNode) }) => Promise<T>;
  update: (id: string, opts: ToastOptions) => void;
  dismiss: (id: string) => void;
  clear: () => void;
};

const Ctx = createContext<ToastApi | null>(null);

type Position = "top-right" | "top-center" | "bottom-right" | "bottom-center";
const posClass: Record<Position, string> = {
  "top-right": "top-4 right-4 items-end",
  "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-right": "bottom-4 right-4 items-end flex-col-reverse",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center flex-col-reverse",
};

let seq = 0;

/**
 * ToastProvider — empilha até `max` avisos, pausa o tempo no hover/foco,
 * mostra a barra de tempo e respeita prefers-reduced-motion.
 */
export function ToastProvider({
  children,
  position = "top-right",
  max = 4,
  variant = "card",
}: {
  children: ReactNode;
  position?: Position;
  max?: number;
  variant?: "card" | "solid";
}) {
  const [items, setItems] = useState<Item[]>([]);
  const reduce = useReducedMotion();

  const dismiss = useCallback((id: string) => setItems((p) => p.filter((t) => t.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const toast = useCallback(
    (opts: ToastOptions) => {
      const id = opts.id ?? `t${++seq}`;
      const duration = opts.duration ?? (opts.type === "loading" ? 0 : opts.type === "error" ? 6000 : 4000);
      setItems((p) => [...p.filter((t) => t.id !== id), { variant, ...opts, id, duration }].slice(-max));
      return id;
    },
    [max, variant],
  );

  const update = useCallback(
    (id: string, opts: ToastOptions) =>
      setItems((p) =>
        p.map((t) =>
          t.id === id
            ? { ...t, ...opts, duration: opts.duration ?? (opts.type === "loading" ? 0 : opts.type === "error" ? 6000 : 4000) }
            : t,
        ),
      ),
    [],
  );

  const addToast = useCallback(
    (message: string, type: Exclude<ToastType, "loading"> = "info", duration?: number) => toast({ message, type, duration }),
    [toast],
  );

  const promise = useCallback<ToastApi["promise"]>(
    async (p, msgs) => {
      const id = toast({ type: "loading", message: msgs.loading });
      try {
        const v = await p;
        update(id, { type: "success", message: typeof msgs.success === "function" ? (msgs.success as (v: unknown) => ReactNode)(v) : msgs.success });
        return v;
      } catch (e) {
        update(id, { type: "error", message: typeof msgs.error === "function" ? (msgs.error as (e: unknown) => ReactNode)(e) : msgs.error });
        throw e;
      }
    },
    [toast, update],
  );

  const api = useMemo(() => ({ toast, addToast, promise, update, dismiss, clear }), [toast, addToast, promise, update, dismiss, clear]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className={cn("pointer-events-none fixed z-[9999] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3", posClass[position])} aria-live="polite">
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout={!reduce}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: position.startsWith("top") ? -16 : 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: 40, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="pointer-events-auto w-full"
            >
              <TimedToast item={t} onDone={() => dismiss(t.id)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

/** Conta o tempo do aviso e pausa no hover/foco. */
function TimedToast({ item, onDone }: { item: Item; onDone: () => void }) {
  const [left, setLeft] = useState(item.duration);
  const paused = useRef(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => setLeft(item.duration), [item.duration, item.type, item.message]);

  useEffect(() => {
    if (!item.duration) return;
    const step = 100;
    const t = setInterval(() => {
      if (paused.current) return;
      setLeft((l) => {
        if (l <= step) {
          clearInterval(t);
          setTimeout(() => doneRef.current(), 0);
          return 0;
        }
        return l - step;
      });
    }, step);
    return () => clearInterval(t);
  }, [item.duration, item.type, item.message]);

  return (
    <div
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
    >
      <Toast
        type={item.type}
        title={item.title}
        message={item.message}
        variant={item.variant}
        action={item.action && { ...item.action, onClick: () => (item.action!.onClick(), onDone()) }}
        progress={item.duration ? left / item.duration : undefined}
        onClose={onDone}
        className="max-w-none"
      />
    </div>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast deve ser usado dentro do <ToastProvider>");
  return ctx;
}
