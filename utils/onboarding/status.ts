import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { userLeagueInterests, userPreferences, users } from "@/db/schema";
import { missingOnboardingFields, type OnboardingMissing } from "./completeness";

/** Lê do banco e diz o que ainda falta no onboarding do usuário. */
export async function getOnboardingMissing(userId: string): Promise<OnboardingMissing[]> {
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
}
