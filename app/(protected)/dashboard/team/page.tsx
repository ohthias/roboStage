import { resolveStagebookScope } from "@/utils/stagebook/scope";
import { canCurrentUserCreateTeam } from "@/utils/stagebook/actions/teams";
import { getMyTeamsSummary } from "@/utils/stagebook/team-queries";
import { TeamContent, parseTab } from "./team-content";
import { TeamsHub } from "./_components/teams-hub";

/**
 * /dashboard/team: com uma equipe ativa abre o workspace dela; sem equipe ativa
 * (ou com `?view=all`) mostra todas as equipes do usuário. Entrar numa equipe
 * daqui também a torna o espaço ativo da barra lateral.
 */
export default async function TeamHomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; view?: string; feed?: string }>;
}) {
  const { tab, view, feed } = await searchParams;
  const scope = await resolveStagebookScope();

  if (scope.type === "team" && view !== "all") {
    return <TeamContent scope={scope} isActiveScope tab={parseTab(tab)} feed={feed === "all"} />;
  }

  const [teams, canCreateTeam] = await Promise.all([getMyTeamsSummary(scope.userId), canCurrentUserCreateTeam()]);
  const activeId = scope.type === "team" ? scope.teamId : null;

  return <TeamsHub teams={teams} activeId={activeId} canCreateTeam={canCreateTeam} />;
}
