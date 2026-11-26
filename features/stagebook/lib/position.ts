/**
 * Seção 16: ordenação simples e confiável, sem infraestrutura complexa.
 *
 * Cada item guarda um `position` (double precision). Para inserir um item
 * entre dois vizinhos, calculamos a média das posições ao redor — não é
 * preciso reescrever a posição de mais ninguém. Se o espaço entre dois
 * itens ficar pequeno demais (dois `position` muito próximos), o próximo
 * "append" simplesmente soma um espaçamento padrão; isso nunca falha, só
 * eventualmente perde um pouco de precisão de ponto flutuante — para o
 * volume de itens de um Stagebook isso não é um problema prático.
 */

const GAP = 1024;

/** Posição para um novo item ao final de uma lista. */
export function nextPosition(existing: number[]): number {
  if (existing.length === 0) return GAP;
  return Math.max(...existing) + GAP;
}

/** Posição para inserir um item entre `before` e `after` (qualquer um pode ser null = extremidade). */
export function positionBetween(
  before: number | null,
  after: number | null
): number {
  if (before === null && after === null) return GAP;
  if (before === null) return after! - GAP / 2;
  if (after === null) return before + GAP;
  return (before + after) / 2;
}
