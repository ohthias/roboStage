import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { users, leagues } from "@/db/schema";
import { eq } from "drizzle-orm";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [currentUser, leagueCatalog] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.select().from(leagues).orderBy(leagues.name),
  ]);

  // Já concluiu o onboarding antes — não deixa refazer por engano.
  if (currentUser?.onboardingCompletedAt) {
    redirect("/dashboard");
  }

  return (
    <main className="h-screen">
      <OnboardingForm leagues={leagueCatalog} />
    </main>
  );
}
