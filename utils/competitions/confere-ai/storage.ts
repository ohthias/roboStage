// lib/confere-ai/storage.ts
//
// Persistência 100% local (sem servidor, sem login).
// Estratégia: o estado é guardado em um cookie (`confere-ai-state`) sempre
// que couber em um tamanho seguro para cookies. Se o usuário acumular muitos
// itens/checklists personalizados e o estado ficar grande demais para um
// cookie, o conteúdo completo passa a ser salvo em `localStorage` e o cookie
// guarda apenas uma marca leve de preferência (modo ativo + flag de overflow).
//
// Todas as funções são tolerantes a falhas: cookie ausente, JSON inválido,
// versão antiga ou estado corrompido nunca devem quebrar a aplicação — nesses
// casos, retornamos um estado padrão.

import {
  CONFERE_AI_STATE_VERSION,
  ConfereAIState,
  createDefaultConfereAIState,
} from "./types";

const COOKIE_NAME = "confere-ai-state";
const LOCAL_STORAGE_KEY = "confere-ai-state";
const COOKIE_MAX_AGE_DAYS = 365;
// Limite conservador (a maioria dos navegadores aceita ~4096 bytes por cookie,
// incluindo o nome). Deixamos margem para o restante do cabeçalho do cookie.
const COOKIE_SAFE_BYTE_LIMIT = 3500;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function byteLength(value: string): number {
  // TextEncoder é suportado em todos os navegadores modernos e no runtime Node usado no build.
  return new TextEncoder().encode(value).length;
}

function readCookie(name: string): string | null {
  if (!isBrowser()) return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  const value = match.substring(name.length + 1);
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function writeCookie(name: string, value: string, maxAgeDays = COOKIE_MAX_AGE_DAYS): void {
  if (!isBrowser()) return;
  const maxAgeSeconds = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (!isBrowser()) return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function readLocalStorage(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    // localStorage pode estar indisponível (modo privado, cookies bloqueados, etc.)
    return null;
  }
}

function writeLocalStorage(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignora silenciosamente: se não for possível persistir, a UI continua
    // funcionando apenas com o estado em memória durante a sessão.
  }
}

function removeLocalStorage(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignora
  }
}

/** Validação estrutural mínima para evitar que dados corrompidos derrubem a UI. */
function isValidConfereAIState(value: unknown): value is ConfereAIState {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.version === "number" &&
    typeof v.activeMode === "string" &&
    typeof v.customItems === "object" &&
    v.customItems !== null &&
    typeof v.completedItems === "object" &&
    v.completedItems !== null &&
    Array.isArray(v.customChecklists)
  );
}

/**
 * Migra estados de versões antigas para a versão atual.
 * Hoje só existe a versão 1, mas a função já fica pronta para o futuro.
 */
function migrateState(state: ConfereAIState): ConfereAIState {
  if (state.version === CONFERE_AI_STATE_VERSION) return state;
  // Nenhuma migração necessária ainda — apenas normaliza a versão.
  return { ...state, version: CONFERE_AI_STATE_VERSION };
}

function safeParse(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

interface OverflowMarker {
  version: number;
  activeMode: string;
  overflow: true;
}

function isOverflowMarker(value: unknown): value is OverflowMarker {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return v.overflow === true && typeof v.activeMode === "string";
}

/**
 * Lê o estado persistido do dispositivo do usuário.
 * Nunca lança exceção — em qualquer cenário de erro, retorna um estado padrão.
 */
export function getConfereAIState(): ConfereAIState {
  if (!isBrowser()) {
    return createDefaultConfereAIState();
  }

  const rawCookie = readCookie(COOKIE_NAME);

  if (rawCookie) {
    const parsedCookie = safeParse(rawCookie);

    if (isValidConfereAIState(parsedCookie)) {
      return migrateState(parsedCookie);
    }

    if (isOverflowMarker(parsedCookie)) {
      const rawLocal = readLocalStorage(LOCAL_STORAGE_KEY);
      if (rawLocal) {
        const parsedLocal = safeParse(rawLocal);
        if (isValidConfereAIState(parsedLocal)) {
          return migrateState(parsedLocal);
        }
      }
      // O cookie indica overflow, mas o localStorage está vazio/corrompido:
      // ao menos preservamos o modo ativo salvo no cookie.
      return createDefaultConfereAIState(parsedCookie.activeMode);
    }
  }

  // Sem cookie válido: tenta localStorage como último recurso (ex.: usuário
  // limpou cookies mas manteve dados locais, ou vice-versa).
  const rawLocal = readLocalStorage(LOCAL_STORAGE_KEY);
  if (rawLocal) {
    const parsedLocal = safeParse(rawLocal);
    if (isValidConfereAIState(parsedLocal)) {
      return migrateState(parsedLocal);
    }
  }

  return createDefaultConfereAIState();
}

/**
 * Salva o estado do usuário. Usa cookie quando o estado é pequeno o
 * suficiente; caso contrário, guarda o conteúdo completo em localStorage e
 * mantém apenas um marcador leve no cookie.
 */
export function setConfereAIState(state: ConfereAIState): void {
  if (!isBrowser()) return;

  const serialized = JSON.stringify(state);

  if (byteLength(serialized) <= COOKIE_SAFE_BYTE_LIMIT) {
    writeCookie(COOKIE_NAME, serialized);
    removeLocalStorage(LOCAL_STORAGE_KEY);
    return;
  }

  writeLocalStorage(LOCAL_STORAGE_KEY, serialized);
  const marker: OverflowMarker = {
    version: state.version,
    activeMode: state.activeMode,
    overflow: true,
  };
  writeCookie(COOKIE_NAME, JSON.stringify(marker));
}

/**
 * Apaga completamente os dados locais (cookie + localStorage) e retorna um
 * estado padrão novo. Usado pela ação "Restaurar padrão".
 */
export function resetConfereAIState(activeMode?: string): ConfereAIState {
  deleteCookie(COOKIE_NAME);
  removeLocalStorage(LOCAL_STORAGE_KEY);
  return createDefaultConfereAIState(activeMode);
}
