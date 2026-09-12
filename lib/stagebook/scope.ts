import "server-only";

import { cookies } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { teamMembers, users } from "@/db/schema";

export type TeamRole = "owner" | "mentor" | "competidor" | "colaborador";

/**
 * Seção 4 da spec: todo o Stagebook opera sobre um scope explícito, nunca
 * sobre um userId "solto". Um recurso ou pertence a `personal.userId`, ou a
 * `team.teamId` — nunca aos dois (ver CHECK de ownership no schema).
 */
export type StagebookScope =
  | { type: "personal"; userId: string }
  | { type: "team"; teamId: string; userId: string; role: TeamRole };

export class StagebookAuthError extends Error {
  constructor(message = "Você não tem acesso a este recurso.") {
    super(message);
    this.name = "StagebookAuthError";
  }
}

/** Nome do cookie que guarda qual equipe está selecionada no momento. */
const SCOPE_COOKIE = "stagebook_team_id";

export async function requireAuthenticatedUser(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new StagebookAuthError("Usuário não autenticado.");
  await ensureUserSynced(userId);
  return userId;
}

/**
 * Rede de segurança contra o webhook do Clerk (`db/clerk-sync.ts`) não ter
 * rodado ainda para este usuário — comum em dev local sem túnel público, ou
 * em produção se a entrega do webhook atrasar/falhar. Sem isso, a primeira
 * ação do Stagebook que grava algo com FK para `users` (criar página, time,
 * evento...) quebra com "violates foreign key constraint ... is not present
 * in table users", que é exatamente o "userId não encontrado" só que vindo
 * direto do Postgres em vez de uma mensagem amigável.
 *
 * Idempotente e barato: só faz a chamada ao Clerk quando a linha realmente
 * não existe ainda.
 */
async function ensureUserSynced(userId: string) {
  const existing = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true },
  });
  if (existing) return;

  const clerkUser = await currentUser();
  if (!clerkUser) return; // sessão inválida — deixa auth() lidar com isso normalmente

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  await db
    .insert(users)
    .values({ id: userId, email, name, avatarUrl: clerkUser.imageUrl ?? null })
    .onConflictDoNothing({ target: users.id });
}

/**
 * Lê o cookie de contexto atual (seção 32: `resolveStagebookScope()`).
 * Se o cookie apontar para uma equipe da qual o usuário não é mais membro,
 * cai silenciosamente de volta para o espaço pessoal — nunca dá acesso
 * indevido.
 */
export async function resolveStagebookScope(): Promise<StagebookScope> {
  const userId = await requireAuthenticatedUser();
  const cookieStore = await cookies();
  const teamId = cookieStore.get(SCOPE_COOKIE)?.value || null;

  if (!teamId) return { type: "personal", userId };

  const membership = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)),
  });

  if (!membership) return { type: "personal", userId };

  return {
    type: "team",
    teamId,
    userId,
    role: membership.role as TeamRole,
  };
}

/**
 * Seção 32: `requireStagebookAccess()` — resolve o scope a partir de um
 * teamId explícito (vindo de um Server Action, por exemplo) e garante
 * membership. Lança StagebookAuthError se o usuário não puder acessar.
 */
export async function requireStagebookAccess(
  teamId?: string | null
): Promise<StagebookScope> {
  const userId = await requireAuthenticatedUser();
  if (!teamId) return { type: "personal", userId };

  const membership = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)),
  });

  if (!membership) {
    throw new StagebookAuthError("Você não é membro desta equipe.");
  }

  return { type: "team", teamId, userId, role: membership.role as TeamRole };
}

/** Retorna o par { userId, teamId } a gravar em INSERTs, respeitando o scope. */
export function scopeOwnership(scope: StagebookScope) {
  return scope.type === "personal"
    ? { userId: scope.userId, teamId: null }
    : { userId: null, teamId: scope.teamId };
}

export function scopeKey(scope: StagebookScope): string {
  return scope.type === "personal" ? "personal" : `team:${scope.teamId}`;
}