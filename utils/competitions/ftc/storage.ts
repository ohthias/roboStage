"use client";

/**
 * Persistência local das ferramentas FTC. Fica só no aparelho (sem login):
 * localStorage pode estar cheio, bloqueado ou indisponível, então toda
 * leitura/escrita é protegida e cai para o valor padrão.
 */
import { useEffect, useRef, useState } from "react";

export const STORAGE_KEYS = {
  scouting: "robostage:ftc-scouting:v1",
  strategy: "robostage:ftc-strategy:v1",
  score: "robostage:ftc-score:v1",
} as const;

export function readStorage<T>(key: string, fallback: T, parse?: (raw: unknown) => T | null): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const value = JSON.parse(raw);
    return parse ? (parse(value) ?? fallback) : (value as T);
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Estado salvo no localStorage. Começa com `fallback` (igual no servidor e no
 * cliente, sem erro de hidratação) e carrega o valor salvo depois de montar.
 */
export function usePersistentState<T>(key: string, fallback: () => T, parse?: (raw: unknown) => T | null) {
  const [value, setValue] = useState<T>(fallback);
  const [loaded, setLoaded] = useState(false);
  const parseRef = useRef(parse);

  useEffect(() => {
    setValue((current) => readStorage(key, current, parseRef.current));
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (loaded) writeStorage(key, value);
  }, [key, value, loaded]);

  return [value, setValue, loaded] as const;
}

export function downloadFile(name: string, content: string, type = "application/json") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function slug(text: string) {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "evento"
  );
}
