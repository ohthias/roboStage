"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";

type ToastType = "info" | "success" | "warning" | "error";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

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
    className: "border-info/20 bg-info/20 text-info-content",
    icon: <Info size={18} className="text-info" />,
  },
  success: {
    className: "border-success/20 bg-success/20 text-success-content",
    icon: <CheckCircle2 size={18} className="text-success" />,
  },
  warning: {
    className: "border-warning/20 bg-warning/20 text-warning-content",
    icon: <TriangleAlert size={18} className="text-warning" />,
  },
  error: {
    className: "border-error/20 bg-error/20 text-error-content",
    icon: <AlertCircle size={18} className="text-error" />,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 3000) => {
      const id = crypto.randomUUID();
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
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  return (
    <ToastContext.Provider
      value={{
        addToast,
        removeToast,
        clearToasts,
      }}
    >
      {children}

      <div className="pointer-events-none fixed top-4 right-4 z-[9999] flex w-full max-w-sm flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const style = TOAST_STYLES[toast.type];
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{
                  opacity: 0,
                  y: -20,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                  scale: 0.95,
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                }}
                className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur ${style.className}`}
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
              </motion.div>
            );
          })}
        </AnimatePresence>
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