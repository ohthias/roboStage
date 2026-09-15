/**
 * Seção 35: toda entrada vinda do navegador é não confiável. O projeto não
 * tem uma lib de validação (ex: zod) instalada, então em vez de adicionar
 * uma dependência nova só para isso (seção 51, item 6), usamos funções
 * pequenas e explícitas — suficiente para o formato dos dados do Stagebook.
 */

export class ValidationError extends Error {}

export function cleanText(
  value: unknown,
  { fallback = "", maxLength = 4000 }: { fallback?: string; maxLength?: number } = {}
): string {
  const str = typeof value === "string" ? value.trim() : "";
  const result = str || fallback;
  return result.slice(0, maxLength);
}

export function optionalText(value: unknown, maxLength = 4000): string | null {
  const str = typeof value === "string" ? value.trim() : "";
  return str ? str.slice(0, maxLength) : null;
}

export function requireUuid(value: unknown, label = "id"): string {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  ) {
    throw new ValidationError(`${label} inválido.`);
  }
  return value;
}

export function optionalUuid(value: unknown, label = "id"): string | null {
  if (value === null || value === undefined || value === "") return null;
  return requireUuid(value, label);
}

export function requireDate(value: unknown, label = "data"): Date {
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError(`${label} inválida.`);
  }
  return date;
}

export function optionalDate(value: unknown): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}
