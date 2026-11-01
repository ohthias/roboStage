"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import { nanoid } from "nanoid";

type ToastType = "info" | "success" | "warning" | "error";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  /** Saindo: a animação de saída roda antes de remover. */
  leaving?: boolean;
}

/** Igual à duração de `toast-leave` em globals.css. */
const LEAVE_MS = 150;

interface ToastContextType {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_STYLES: Record<
  ToastType,
  {
    className: string;
    icon: ReactNode;
  }
> = {
  info: {
    className: "border-info/20 bg-info/45 text-info-content",
    icon: <Info size={18} className="text-info" />,
  },
  success: {
    className: "border-success/20 bg-success/45 text-success-content",
    icon: <CheckCircle2 size={18} className="text-success" />,
  },
  warning: {
    className: "border-warning/20 bg-warning/45 text-warning-content",
    icon: <TriangleAlert size={18} className="text-warning" />,
  },
  error: {
    className: "border-error/20 bg-error/45 text-error-content",
    icon: <AlertCircle size={18} className="text-error" />,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    const timeout = timeoutsRef.current.get(id);
    if (timeout) clearTimeout(timeout);
    // Marca como saindo (animação em CSS) e remove depois.
    setToasts((prev) => prev.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)));
    timeoutsRef.current.set(
      id,
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
        timeoutsRef.current.delete(id);
      }, LEAVE_MS),
    );
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 3000) => {
      const id = nanoid();
      const toast: Toast = {
        id,
        message,
        type,
        duration,
      };
      setToasts((prev) => [...prev, toast]);
      const timeout = setTimeout(() => {
        removeToast(id);
      }, duration);
      timeoutsRef.current.set(id, timeout);
    },
    [removeToast],
  );

  const clearToasts = useCallback(() => {
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current.clear();
    setToasts([]);
  }, []);

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  // Valor estável: abrir/fechar um toast não re-renderiza todo consumidor de useToast().
  const value = useMemo(
    () => ({ addToast, removeToast, clearToasts }),
    [addToast, removeToast, clearToasts],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Animações em CSS (globals.css): antes o framer-motion entrava no
          bundle de TODAS as páginas só por causa deste provider. */}
      <div
        className="pointer-events-none fixed top-4 right-4 z-[9999] flex w-full max-w-sm flex-col gap-3"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.type];
          return (
            <div
              key={toast.id}
              className={`${toast.leaving ? "toast-leave" : "toast-enter"} pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur ${style.className}`}
            >
              <div className="mt-0.5 shrink-0">{style.icon}</div>
              <div className="flex-1 text-sm leading-relaxed">
                {toast.message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="btn btn-ghost btn-xs h-6 min-h-6 w-6 p-0 opacity-70 transition hover:opacity-100"
                aria-label="Fechar toast"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro do ToastProvider");
  }
  return context;
}