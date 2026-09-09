/**
 * lib/mission-timer/storage.ts
 *
 * Persistência local (sem backend, sem banco de dados). Guarda apenas
 * o necessário para retomar uma sessão em andamento ou reabrir a última
 * configuração usada. Todo acesso a `window`/`localStorage` fica isolado
 * aqui e é sempre protegido por `typeof window !== "undefined"`, para não
 * quebrar a hidratação do Next.js (estes componentes rodam como Client
 * Components, mas o guard evita problemas em qualquer SSR acidental).
 */

import type { MissionTimerSession } from "./types";

const STORAGE_KEY = "robostage:mission-timer:session:v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function saveSession(session: MissionTimerSession): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Armazenamento indisponível (modo privado, quota excedida, etc.)
    // A ferramenta continua funcionando normalmente sem persistência.
  }
}

export function loadSession(): MissionTimerSession | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MissionTimerSession;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.sequence)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignora — não há nada a limpar de forma confiável.
  }
}
