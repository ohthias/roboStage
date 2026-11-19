import type { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOnboardingMissing } from "@/utils/onboarding/status";

/**
 * Guard de todas as rotas protegidas (dashboard e ThinkLab).
 *
 * O proxy só olha a flag `onboardingComplete` do Clerk, que pode estar
 * desatualizada ou ter sido marcada por uma versão antiga do onboarding.
 * Aqui conferimos no banco se todos os campos obrigatórios estão preenchidos
 * e, se faltar algo, mandamos a pessoa de volta para /onboarding.
 */
export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const missing = await getOnboardingMissing(userId);
  if (missing.length > 0) redirect("/onboarding");

  return children;
}
