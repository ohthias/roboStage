/**
 * Regras do histórico de versões e da lixeira das páginas do Stagebook.
 * Sem dependências de servidor: usado pelas actions e pela interface.
 */

/** Quantas versões de cada página ficam guardadas no histórico. */
export const MAX_DOCUMENT_VERSIONS = 5;

/**
 * O autosave grava a cada ~1s enquanto a pessoa digita. Para o histórico não
 * virar "5 versões dos últimos 5 segundos", uma nova versão só é registrada
 * quando a última tem pelo menos este intervalo — na prática, uma versão por
 * sessão de edição.
 */
export const VERSION_INTERVAL_MS = 10 * 60 * 1000;

/** Por quantos dias uma página excluída fica na lixeira antes de sumir de vez. */
export const TRASH_RETENTION_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Data a partir da qual páginas na lixeira já passaram do prazo. */
export function trashCutoff(now: Date = new Date()) {
  return new Date(now.getTime() - TRASH_RETENTION_DAYS * DAY_MS);
}

/** Quando uma página excluída em `deletedAt` será apagada de vez. */
export function trashExpiresAt(deletedAt: Date) {
  return new Date(deletedAt.getTime() + TRASH_RETENTION_DAYS * DAY_MS);
}

/** Dias inteiros restantes (mínimo 0) até a página sair da lixeira. */
export function trashDaysLeft(deletedAt: Date, now: Date = new Date()) {
  const left = trashExpiresAt(deletedAt).getTime() - now.getTime();
  return Math.max(0, Math.ceil(left / DAY_MS));
}

/** Se já passou tempo suficiente desde a última versão para registrar outra. */
export function shouldSnapshot(lastVersionAt: Date | null, now: Date = new Date()) {
  if (!lastVersionAt) return true;
  return now.getTime() - lastVersionAt.getTime() >= VERSION_INTERVAL_MS;
}
