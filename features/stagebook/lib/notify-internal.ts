import "server-only";

import { db } from "@/db/client";
import { notifications } from "@/db/schema";

/**
 * Notifica OUTROS usuários (ex.: os escalados de uma sessão).
 *
 * `notifyUser` (em `actions/notifications.ts`) só notifica o próprio usuário
 * de propósito: aquele arquivo é `"use server"`, então cada export vira um
 * endpoint público. Este aqui é `server-only` e NÃO é uma Server Action — só
 * pode ser chamado de dentro de actions que já validaram o escopo da equipe
 * (e que os destinatários são membros dela).
 */
export async function notifyUsers(
  userIds: readonly string[],
  payload: {
    type: string;
    title: string;
    message?: string | null;
    data?: Record<string, unknown>;
  },
): Promise<void> {
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) return;

  await db.insert(notifications).values(
    unique.map((userId) => ({
      userId,
      type: payload.type,
      title: payload.title,
      message: payload.message ?? null,
      data: payload.data ?? {},
    })),
  );
}

/** Variante com uma mensagem diferente por usuário (ex.: "Você é Piloto nas rodadas 1 e 2"). */
export async function notifyEach(
  items: readonly {
    userId: string;
    type: string;
    title: string;
    message?: string | null;
    data?: Record<string, unknown>;
  }[],
): Promise<void> {
  if (items.length === 0) return;
  await db.insert(notifications).values(
    items.map((item) => ({
      userId: item.userId,
      type: item.type,
      title: item.title,
      message: item.message ?? null,
      data: item.data ?? {},
    })),
  );
}
