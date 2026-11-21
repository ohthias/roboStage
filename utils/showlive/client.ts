import "server-only";
import { auth } from "@clerk/nextjs/server";

export const SHOWLIVE_URL = (
  process.env.SHOWLIVE_URL ||
  process.env.NEXT_PUBLIC_SHOWLIVE_URL ||
  "https://showlive.robostage.com.br"
).replace(/\/$/, "");

/** Erro da API do ShowLive com mensagem que pode ir para a tela. */
export class ShowLiveError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ShowLiveError";
  }
}

type TokenGetter = () => Promise<string | null>;

/** Token de sessão do Clerk do usuário atual (mesma instância do ShowLive). */
const sessionToken: TokenGetter = async () => {
  const session = await auth();
  return session.userId ? ((await session.getToken?.()) ?? null) : null;
};

/**
 * Chama a API do ShowLive do servidor do RoboStage, em nome do usuário logado.
 * O navegador nunca fala direto com a API: não há CORS nem segredo exposto.
 */
export async function showliveFetch<T>(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown } = {},
  getToken: TokenGetter = sessionToken,
): Promise<T> {
  const token = await getToken();
  if (!token) throw new ShowLiveError("Entre na sua conta RoboStage para usar o ShowLive.", 401);

  let res: Response;
  try {
    res = await fetch(`${SHOWLIVE_URL}${path}`, {
      method: init.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new ShowLiveError("O ShowLive não respondeu. Tente de novo em instantes.", 503);
  }

  const data = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!res.ok || !data) {
    const message =
      data?.error ??
      (res.status === 401
        ? "Sua sessão não foi aceita pelo ShowLive. Saia e entre de novo."
        : "O ShowLive está indisponível no momento.");
    throw new ShowLiveError(message, res.status);
  }
  return data;
}
