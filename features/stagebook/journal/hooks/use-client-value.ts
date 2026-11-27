"use client";

import { useSyncExternalStore } from "react";
import { localToday } from "@/features/stagebook/types/journal";

const noopSubscribe = () => () => {};

/** "Hoje" no fuso do navegador; null no servidor e na hidratação (o servidor não sabe o fuso). */
export function useClientToday(): string | null {
  return useSyncExternalStore(noopSubscribe, localToday, () => null);
}

/** Valor do localStorage (lido só no navegador). */
export function useStoredValue(key: string): string | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => null,
  );
}
