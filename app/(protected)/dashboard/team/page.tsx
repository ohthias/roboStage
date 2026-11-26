import { resolveStagebookScope } from "@/features/stagebook/lib/scope";
import { canCurrentUserCreateTeam } from "@/features/stagebook/actions/teams";
import { getMyTeamsSummary } from "@/features/stagebook/lib/team-queries";
import { syncClerkMembershipsFor } from "@/features/stagebook/lib/team-membership-sync";
import { TeamContent, parseTab } from "@/features/stagebook/team/components/team-content";
import { TeamsHub } from "@/features/stagebook/team/components/teams-hub";

/**
 * /dashboard/team: com uma equipe ativa abre o workspace dela; sem equipe ativa
 * (ou com `?view=all`) mostra todas as equipes do usuário. Entrar numa equipe
 * daqui também a torna o espaço ativo da barra lateral.
 */
export default async function TeamHomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; view?: string; feed?: string; novo?: string; aba?: string }>;
}) {
  const { tab, view, feed, novo, aba } = await searchParams;
  const scope = await resolveStagebookScope();

  if (scope.type === "team" && view !== "all") {
    return (
      <TeamContent
        scope={scope}
        isActiveScope
        tab={parseTab(tab)}
        feed={feed === "all"}
        create={novo === "1"}
        chapterId={typeof aba === "string" && /^[0-9a-f-]{36}$/i.test(aba) ? aba : null}
      />
    );
  }

  // Convites aceitos no Clerk entram aqui mesmo que o webhook não tenha chegado.
  await syncClerkMembershipsFor(scope.userId);

  const [teams, canCreateTeam] = await Promise.all([getMyTeamsSummary(scope.userId), canCurrentUserCreateTeam()]);
  const activeId = scope.type === "team" ? scope.teamId : null;

  return <TeamsHub teams={teams} activeId={activeId} canCreateTeam={canCreateTeam} />;
}
