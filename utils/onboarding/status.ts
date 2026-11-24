import "server-only";

import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { userLeagueInterests, userPreferences, users } from "@/db/schema";
import { missingOnboardingFields, type OnboardingMissing } from "./completeness";

/**
 * Lê do banco e diz o que ainda falta no onboarding do usuário.
 * Memorizado por requisição: layouts e páginas rodam em paralelo no App
 * Router e todos chamam o guard — a consulta acontece uma vez só.
 */
export const getOnboardingMissing = cache(async function getOnboardingMissing(
  userId: string,
): Promise<OnboardingMissing[]> {
  const [user, leagues, prefs] = await Promise.all([
    db
      .select({
        name: users.name,
        personaType: users.personaType,
        onboardingCompletedAt: users.onboardingCompletedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((rows) => rows[0] ?? null),
    db
      .select({
        relationType: userLeagueInterests.relationType,
        teamName: userLeagueInterests.teamName,
        season: userLeagueInterests.season,
      })
      .from(userLeagueInterests)
      .where(eq(userLeagueInterests.userId, userId)),
    db
      .select({ userId: userPreferences.userId })
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1),
  ]);

  return missingOnboardingFields({
    name: user?.name,
    personaType: user?.personaType,
    onboardingCompletedAt: user?.onboardingCompletedAt,
    leagues,
    hasPreferences: prefs.length > 0,
  });
});

/**
 * Guard das rotas protegidas. Chame ANTES de qualquer consulta pesada:
 * no App Router o `redirect()` de um layout pai não impede que layouts
 * filhos e a página rodem em paralelo, então cada um precisa parar cedo
 * por conta própria (senão o dashboard inteiro é renderizado à toa antes
 * de ir para /onboarding — lento e fonte de 429 no Clerk/Neon).
 */
export async function requireOnboardingComplete(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const missing = await getOnboardingMissing(userId);
  if (missing.length > 0) redirect("/onboarding");

  return userId;
}
