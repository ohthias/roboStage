/**
 * Seção 35: toda entrada vinda do navegador é não confiável. O projeto não
 * tem uma lib de validação (ex: zod) instalada, então em vez de adicionar
 * uma dependência nova só para isso (seção 51, item 6), usamos funções
 * pequenas e explícitas — suficiente para o formato dos dados do Stagebook.
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

const upperFirst = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** Texto obrigatório: erro claro (em vez de cair num fallback silencioso) quando vazio. */
export function requireText(
  value: unknown,
  label: string,
  { maxLength = 120, minLength = 1 }: { maxLength?: number; minLength?: number } = {}
): string {
  const str = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  if (str.length < minLength) {
    throw new ValidationError(
      minLength <= 1 ? `Informe ${label}.` : `${upperFirst(label)} precisa ter ao menos ${minLength} caracteres.`
    );
  }
  if (str.length > maxLength) {
    throw new ValidationError(`${upperFirst(label)} pode ter no máximo ${maxLength} caracteres.`);
  }
  return str;
}

export function requireOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  label: string
): T {
  if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) {
    throw new ValidationError(`${label} inválido.`);
  }
  return value as T;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function requireEmail(value: unknown): string {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    throw new ValidationError("Informe um e-mail válido.");
  }
  return email;
}

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
