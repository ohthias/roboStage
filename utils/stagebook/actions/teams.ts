"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { teams, teamMembers, users } from "@/db/schema";
import { requireAuthenticatedUser, StagebookAuthError } from "../scope";
import { cleanText } from "../validation";

const SCOPE_COOKIE = "stagebook_team_id";

/**
 * Regra pedida pelo produto: só quem NÃO é competidor pode criar um espaço
 * de equipe — mentores técnicos, entusiastas e organizadores. Um competidor
 * só participa de equipes já existentes (via convite), não abre uma nova.
 */
const CAN_CREATE_TEAM_PERSONAS = ["mentor_tecnico", "entusiasta", "organizador"] as const;

export async function canCurrentUserCreateTeam(): Promise<boolean> {
  const userId = await requireAuthenticatedUser();
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { personaType: true },
  });
  return !!user?.personaType && (CAN_CREATE_TEAM_PERSONAS as readonly string[]).includes(user.personaType);
}

/** Lista as equipes das quais o usuário atual é membro (para o seletor de contexto). */
export async function listMyTeams() {
  const userId = await requireAuthenticatedUser();

  return db
    .select({
      id: teams.id,
      name: teams.name,
      role: teamMembers.role,
      clerkOrgId: teams.clerkOrgId,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teams.id, teamMembers.teamId))
    .where(eq(teamMembers.userId, userId))
    .orderBy(teams.name);
}

/**
 * Cria uma equipe nova. Por trás, cria uma Clerk Organization de verdade —
 * o criador vira automaticamente `org:admin` dela (comportamento padrão do
 * `createOrganization`) — e guarda o vínculo em `teams.clerk_org_id`.
 *
 * `team_members` continua sendo a fonte usada pelo resto do Stagebook para
 * resolver scope/permissão (evita reescrever todo o app pra consultar a API
 * do Clerk a cada request), mas fica sincronizada com a Organization via
 * webhook (`organizationMembership.*` em db/clerk-sync.ts) — então se
 * alguém for adicionado/removido pela tela de organização do Clerk, o
 * Stagebook reflete isso automaticamente.
 */
export async function createTeam(name: string) {
  const userId = await requireAuthenticatedUser();

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { personaType: true },
  });

  if (!user?.personaType || !(CAN_CREATE_TEAM_PERSONAS as readonly string[]).includes(user.personaType)) {
    throw new StagebookAuthError(
      "Só perfis de mentor técnico, entusiasta ou organizador podem criar um espaço de equipe."
    );
  }

  const clean = cleanText(name, { fallback: "Nova equipe", maxLength: 120 });
  const client = await clerkClient();

  const organization = await client.organizations.createOrganization({
    name: clean,
    createdBy: userId,
  });

  try {
    const [team] = await db
      .insert(teams)
      .values({ name: clean, createdBy: userId, clerkOrgId: organization.id })
      .returning({ id: teams.id, name: teams.name });

    await db.insert(teamMembers).values({
      teamId: team.id,
      userId,
      role: "owner",
    });

    revalidatePath("/dashboard", "layout");
    return team;
  } catch (error) {
    // Não deixa uma Organization órfã no Clerk se a escrita no nosso banco falhar.
    await client.organizations.deleteOrganization(organization.id).catch(() => {});
    throw error;
  }
}

/** Troca o scope ativo do Stagebook (seção 4). `teamId` null volta ao espaço pessoal. */
export async function switchStagebookScope(teamId: string | null) {
  const userId = await requireAuthenticatedUser();

  if (teamId) {
    const membership = await db.query.teamMembers.findFirst({
      where: (fields, { and, eq }) =>
        and(eq(fields.teamId, teamId), eq(fields.userId, userId)),
    });
    if (!membership) throw new Error("Você não é membro desta equipe.");
  }

  const cookieStore = await cookies();
  if (teamId) {
    cookieStore.set(SCOPE_COOKIE, teamId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  } else {
    cookieStore.delete(SCOPE_COOKIE);
  }

  revalidatePath("/dashboard", "layout");
}
