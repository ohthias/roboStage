import { isTeamRole, type TeamRole } from "./team-permissions";

/**
 * Converte o cargo de uma membership do Clerk (org:admin / org:member) para o
 * cargo do RoboStage.
 *
 * `stagebookRole` (metadata pública que a gente grava no convite — ver
 * app/(protected)/dashboard/team/actions.ts) é o cargo que o técnico REALMENTE
 * escolheu e tem prioridade. Antes, `org:admin` vencia a metadata: todo
 * mentor convidado (que entra como `org:admin` no Clerk para poder editar a
 * Organização) virava técnico ao aceitar o convite.
 */
export function mapClerkOrgRole(role: string | null | undefined, stagebookRole?: unknown): TeamRole {
  if (stagebookRole === "tecnico") return "owner";
  if (isTeamRole(stagebookRole)) return stagebookRole;
  // Sem metadata (adicionado direto pelo painel do Clerk): mantém o
  // comportamento histórico — admin da Organização é técnico.
  if (role === "org:admin") return "owner";
  return "colaborador";
}

/** org:admin = equipe técnica (técnico/mentor); org:member = demais cargos. */
const STAFF_ROLES: readonly TeamRole[] = ["owner", "mentor"];

/**
 * `organizationMembership.updated`: o Clerk só conhece admin/member. Se o
 * cargo atual no banco já é compatível com o do Clerk, ele é mantido (a troca
 * foi feita pelo próprio RoboStage, que grava o cargo fino antes de chamar o
 * Clerk). Só quando divergem — mudança feita direto no painel do Clerk — é que
 * o cargo é recalculado.
 */
export function reconcileClerkOrgRole(current: string | null | undefined, clerkRole: string): TeamRole {
  const currentRole: TeamRole | null = isTeamRole(current) ? current : null;
  const clerkIsAdmin = clerkRole === "org:admin";
  if (currentRole && STAFF_ROLES.includes(currentRole) === clerkIsAdmin) return currentRole;
  return clerkIsAdmin ? "mentor" : "colaborador";
}
