"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { ToastProvider as StageToastProvider, useToast as useStageToast } from "@/components/stage";

/**
 * Avisos do RoboStage — agora os da Stage UI (`components/stage/core/Toasts`):
 * tokens do tema, barra de tempo, pausa no hover/foco e movimento reduzido.
 *
 * Este arquivo é só um adaptador: mantém a API antiga
 * (`addToast(message, type, duration)`, `removeToast`, `clearToasts`) para as
 * telas que já usam `@/components/providers/ToastContext` não precisarem mudar. Telas
 * novas podem usar direto `useToast` da Stage UI (título, ação, `promise()`).
 */

type ToastType = "info" | "success" | "warning" | "error";

interface ToastContextType {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/** Ponte: lê a API da Stage UI e expõe a antiga. */
function LegacyBridge({ children }: { children: ReactNode }) {
  const stage = useStageToast();
  const value = useMemo<ToastContextType>(
    () => ({
      // Sem duração explícita vale o padrão da Stage UI (4 s; erro, 6 s).
      addToast: (message, type = "info", duration) => {
        stage.addToast(message, type, duration);
      },
      removeToast: stage.dismiss,
      clearToasts: stage.clear,
    }),
    [stage],
  );
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <StageToastProvider position="top-right">
      <LegacyBridge>{children}</LegacyBridge>
    </StageToastProvider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro do ToastProvider");
  }
  return context;
}
