import { unstable_rethrow } from "next/navigation";
import { StagebookAuthError } from "./scope-errors";
import { ValidationError } from "./validation";

/**
 * Em produção o Next.js troca a mensagem de qualquer erro lançado por uma
 * Server Action por um texto genérico — então `throw new Error("Nome inválido")`
 * nunca chega ao usuário. As ações novas devolvem este resultado tipado: erros
 * esperados (permissão, validação) viram `{ ok: false, error }` com a mensagem
 * em português; qualquer outra falha é logada e vira uma mensagem genérica.
 */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    // redirect()/notFound() são exceções de controle do Next: seguem adiante.
    unstable_rethrow(error);
    if (error instanceof StagebookAuthError || error instanceof ValidationError) {
      return { ok: false, error: error.message };
    }
    console.error("[stagebook] ação falhou:", error);
    return { ok: false, error: "Não foi possível concluir a ação. Tente novamente." };
  }
}

/**
 * Lado do cliente: devolve o dado ou lança um `Error` com a mensagem já
 * amigável. Para quem prefere manter o fluxo de try/catch.
 */
export function unwrapAction<T>(result: ActionResult<T>): T {
  if (!result.ok) throw new Error(result.error);
  return result.data;
}
