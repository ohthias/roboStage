import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { leagues, userLeagueInterests, userPreferences, users } from "@/db/schema";
import { AnimatedBackground } from "@/components/home/shared";
import { OnboardingForm, type OnboardingInitial } from "./onboarding-form";
import { missingOnboardingFields } from "@/utils/onboarding/completeness";
import "@/components/home/home.css";

export const metadata = { title: "Boas-vindas · RoboStage" };

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [dbUser, leagueCatalog, interests, [prefs], clerkUser] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.select().from(leagues).orderBy(leagues.name),
    db.select().from(userLeagueInterests).where(eq(userLeagueInterests.userId, userId)),
    db
      .select({
        userId: userPreferences.userId,
        allowTeamInvites: userPreferences.allowTeamInvites,
        emailProductUpdates: userPreferences.emailProductUpdates,
      })
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1),
    currentUser(),
  ]);

  // Mesma regra do guard de (protected)/layout.tsx: só vai para o dashboard
  // com tudo preenchido (senão viraria loop entre as duas páginas).
  const missing = missingOnboardingFields({
    name: dbUser?.name,
    personaType: dbUser?.personaType,
    onboardingCompletedAt: dbUser?.onboardingCompletedAt,
    leagues: interests,
    hasPreferences: Boolean(prefs),
  });
  if (missing.length === 0) redirect("/dashboard");

  // Quem já tinha concluído uma versão antiga e voltou por falta de dados.
  const returning = Boolean(dbUser?.onboardingCompletedAt);

  const clerkName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ");

  const initial: OnboardingInitial = {
    name: dbUser?.name || clerkName,
    email: dbUser?.email ?? clerkUser?.emailAddresses[0]?.emailAddress ?? "",
    avatarUrl: dbUser?.avatarUrl ?? clerkUser?.imageUrl ?? null,
    personaType: dbUser?.personaType ?? null,
    allowTeamInvites: prefs?.allowTeamInvites ?? true,
    emailProductUpdates: prefs?.emailProductUpdates ?? false,
    selections: Object.fromEntries(
      interests.map((i) => [
        i.leagueId,
        { relationType: i.relationType, teamName: i.teamName ?? "", season: i.season ?? "" },
      ]),
    ),
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      <AnimatedBackground />
      <OnboardingForm
        leagues={leagueCatalog}
        initial={initial}
        pendingFields={returning ? missing : []}
      />
    </main>
  );
}
