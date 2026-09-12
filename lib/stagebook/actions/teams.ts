"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { teams, teamMembers } from "@/db/schema";
import { requireAuthenticatedUser } from "../scope";
import { cleanText } from "../validation";

const SCOPE_COOKIE = "stagebook_team_id";

/** Lista as equipes das quais o usuário atual é membro (para o seletor de contexto). */
export async function listMyTeams() {
  const userId = await requireAuthenticatedUser();

  return db
    .select({
      id: teams.id,
      name: teams.name,
      role: teamMembers.role,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teams.id, teamMembers.teamId))
    .where(eq(teamMembers.userId, userId))
    .orderBy(teams.name);
}

/** Cria uma equipe nova; o criador entra automaticamente como owner. */
export async function createTeam(name: string) {
  const userId = await requireAuthenticatedUser();
  const clean = cleanText(name, { fallback: "Nova equipe", maxLength: 120 });

  const [team] = await db
    .insert(teams)
    .values({ name: clean, createdBy: userId })
    .returning({ id: teams.id, name: teams.name });

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId,
    role: "owner",
  });

  revalidatePath("/dashboard", "layout");
  return team;
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
