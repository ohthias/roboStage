"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { users, userLeagueInterests } from "@/db/schema";
import { eq } from "drizzle-orm";

const PERSONA_VALUES = [
  "competidor",
  "mentor_tecnico",
  "entusiasta",
  "organizador",
] as const;

const RELATION_VALUES = ["participante", "interessado"] as const;

export type LeagueSelectionInput = {
  leagueId: string;
  relationType: (typeof RELATION_VALUES)[number];
  teamName?: string;
  season?: string;
};

export type OnboardingInput = {
  personaType: (typeof PERSONA_VALUES)[number];
  leagues: LeagueSelectionInput[];
};

export async function completeOnboarding(input: OnboardingInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Usuário não autenticado.");
  }

  if (!PERSONA_VALUES.includes(input.personaType)) {
    throw new Error("Perfil inválido.");
  }

  const cleanLeagues = input.leagues
    .filter((l) => l.leagueId && RELATION_VALUES.includes(l.relationType))
    .map((l) => ({
      userId,
      leagueId: l.leagueId,
      relationType: l.relationType,
      teamName: l.teamName?.trim() || null,
      season: l.season?.trim() || null,
    }));

  if (cleanLeagues.length === 0) {
    throw new Error("Selecione ao menos uma competição ou liga.");
  }

  // Garante que o usuário já existe (o webhook do Clerk normalmente já criou
  // a linha, mas isso protege contra corrida entre webhook e primeiro acesso).
  const existing = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (existing) {
    await db
      .update(users)
      .set({
        personaType: input.personaType,
        onboardingCompletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  } else {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    await db.insert(users).values({
      id: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
      avatarUrl: clerkUser.imageUrl ?? null,
      personaType: input.personaType,
      onboardingCompletedAt: new Date(),
    });
  }

  // Substitui as preferências de liga anteriores pelas atuais (idempotente
  // ao reabrir o formulário) — mais simples do que fazer diff linha a linha.
  await db.delete(userLeagueInterests).where(eq(userLeagueInterests.userId, userId));
  await db.insert(userLeagueInterests).values(cleanLeagues);

  // Marca o onboarding como concluído no publicMetadata do Clerk. O
  // middleware lê essa flag direto do token de sessão, sem consultar o banco.
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { onboardingComplete: true },
  });

  redirect("/dashboard");
}
