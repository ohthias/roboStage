import type { ReactNode } from "react";
import { resolveStagebookScope } from "@/utils/stagebook/scope";
import { canCurrentUserCreateTeam, listMyTeams } from "@/utils/stagebook/actions/teams";
import { TeamRail } from "./_components/team-rail";

/**
 * Casca no estilo Microsoft Teams: painel de equipes à esquerda e, à direita,
 * o conteúdo (hub de equipes ou o workspace de uma equipe).
 */
export default async function TeamLayout({ children }: { children: ReactNode }) {
  const [scope, teams, canCreateTeam] = await Promise.all([
    resolveStagebookScope(),
    listMyTeams(),
    canCurrentUserCreateTeam(),
  ]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-base-200 md:flex">
      <TeamRail
        teams={teams.map((t) => ({ id: t.id, name: t.name, role: t.role }))}
        activeTeamId={scope.type === "team" ? scope.teamId : null}
        canCreateTeam={canCreateTeam}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
