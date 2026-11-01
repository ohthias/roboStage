import type { ActionResult } from "@/utils/stagebook/action-result";

function isActionResult(value: unknown): value is ActionResult<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { ok?: unknown }).ok === "boolean" &&
    ("data" in value || "error" in value)
  );
}

/**
 * Chama uma Server Action e devolve o dado, lançando a mensagem em caso de
 * erro — funciona tanto com actions que lançam quanto com as que devolvem
 * `ActionResult`. Os testes de caracterização usam isto para valer antes e
 * depois da migração para `runAction`.
 */
export async function call<T>(promise: Promise<T | ActionResult<T>>): Promise<T> {
  const value = await promise;
  if (isActionResult(value)) {
    if (!value.ok) throw new Error(value.error);
    return value.data as T;
  }
  return value as T;
}
