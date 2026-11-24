import type { ReactNode } from "react";
import { requireOnboardingComplete } from "@/utils/onboarding/status";

/**
 * Guard de todas as rotas protegidas (dashboard e ThinkLab).
 *
 * O proxy só olha a flag `onboardingComplete` do Clerk, que pode estar
 * desatualizada ou ter sido marcada por uma versão antiga do onboarding.
 * Aqui conferimos no banco se todos os campos obrigatórios estão preenchidos
 * e, se faltar algo, mandamos a pessoa de volta para /onboarding.
 *
 * Atenção: layouts filhos e páginas rodam em paralelo com este layout, então
 * eles também chamam `requireOnboardingComplete()` antes de buscar dados
 * (a consulta é memorizada por requisição).
 */
export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  await requireOnboardingComplete();
  return children;
}
