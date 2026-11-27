/**
 * Último conteúdo salvo de cada página nesta aba do navegador.
 *
 * O roteador do Next guarda em cache as páginas pré-carregadas (e as visitadas,
 * ao voltar com o botão "voltar"). Esse cache pode ter o conteúdo de antes da
 * edição mais recente. O editor usa o registro daqui sempre que ele for mais
 * novo do que o que veio do servidor, então nunca reabre uma versão antiga.
 */
type Entry = { content: Record<string, unknown>; updatedAt: number };

const cache = new Map<string, Entry>();

export function rememberSavedContent(
  documentId: string,
  content: Record<string, unknown>,
  updatedAt: string | number | Date,
) {
  cache.set(documentId, { content, updatedAt: new Date(updatedAt).getTime() });
}

/** O conteúdo mais recente entre o do servidor e o último salvo nesta aba. */
export function freshestContent(
  documentId: string,
  serverContent: Record<string, unknown> | null,
  serverUpdatedAt: string | number | Date,
) {
  const entry = cache.get(documentId);
  if (entry && entry.updatedAt > new Date(serverUpdatedAt).getTime()) return entry.content;
  return serverContent;
}

export function forgetSavedContent(documentId: string) {
  cache.delete(documentId);
}
