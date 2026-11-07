import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { unstable_cache } from "next/cache";

const getOrgLogoUrl = unstable_cache(
  async (organizationId: string): Promise<string | null> => {
    try {
      const organization = await (await clerkClient()).organizations.getOrganization({ organizationId });
      return organization.hasImage ? organization.imageUrl : null;
    } catch {
      return null;
    }
  },
  ["team-org-logo"],
  { revalidate: 600 },
);
import {
  FlaskConical,
  Flag,
  Info,
  KanbanSquare,
  LayoutDashboard,
  Lightbulb,
  Timer,
  Users,
  type LucideIcon,
} from "lucide-react";
import { db } from "@/db/client";
import { leagues, teams } from "@/db/schema";
import type { TeamScope } from "@/utils/stagebook/scope";
import { roleCan } from "@/utils/stagebook/team-permissions";
import {
  getTeamActivity,
  getTeamBoards,
  getTeamLabTests,
  getTeamMembers,
  getTeamMilestones,
  getTeamOverview,
  getTeamThinkLabs,
} from "@/utils/stagebook/team-queries";
import {
  getActiveSessionRef,
  getMemberDutyHistory,
  getSessionAttendeeIds,
  getTeamTrainingSessions,
  getUpcomingDutiesFor,
} from "@/utils/stagebook/training-queries";
import { LiveRefresh } from "@/components/stagebook/live-refresh";
import { listPendingInvitations } from "./actions";
import { ActivateTeamButton } from "./activate-team-button";
import { MembersTab } from "./_components/members-tab";
import { MilestonesTab } from "./_components/milestones-tab";
import { OverviewTab } from "./_components/overview-tab";
import { ActivityFeed } from "./_components/activity-feed";
import { TrainingTab } from "./_components/training-tab";
import { ResourceTab } from "./_components/resource-tab";
import { TeamHeader } from "./_components/team-header";
import { CORNER } from "./_components/team-ui";

export const TEAM_TABS = [
  { id: "geral", label: "Geral", Icon: LayoutDashboard },
  { id: "kanban", label: "Kanban", Icon: KanbanSquare },
  { id: "thinklab", label: "ThinkLab", Icon: Lightbulb },
  { id: "labtests", label: "LabTests", Icon: FlaskConical },
  { id: "treinos", label: "Treinos", Icon: Timer },
  { id: "marcos", label: "Marcos", Icon: Flag },
  { id: "membros", label: "Membros", Icon: Users },
] as const satisfies readonly { id: string; label: string; Icon: LucideIcon }[];

export type TeamTabId = (typeof TEAM_TABS)[number]["id"];

export function parseTab(value: string | string[] | undefined): TeamTabId {
  const raw = Array.isArray(value) ? value[0] : value;
  return TEAM_TABS.find((t) => t.id === raw)?.id ?? "geral";
}

/**
 * Workspace de uma equipe, dado um scope já validado (o chamador — `page.tsx`
 * ou `[id]/page.tsx` — garante que o usuário é membro). Todos os cargos veem as
 * mesmas abas; o que muda é o que cada aba oferece (ver `team-permissions.ts`).
 * `isActiveScope` diz se esta é a equipe "ativa" (cookie de contexto): quando
 * não é, avisamos que as demais ferramentas ainda mostram o outro espaço.
 */
export async function TeamContent({
  scope,
  isActiveScope,
  tab = "geral",
  feed = false,
}: {
  scope: TeamScope;
  isActiveScope: boolean;
  tab?: TeamTabId;
  /** `?feed=all`: a aba Geral mostra o feed completo. */
  feed?: boolean;
}) {
  const [team, members, overview] = await Promise.all([
    db
      .select({
        id: teams.id,
        name: teams.name,
        season: teams.season,
        organizationName: teams.organizationName,
        clerkOrgId: teams.clerkOrgId,
        leagueName: leagues.name,
      })
      .from(teams)
      .leftJoin(leagues, eq(leagues.id, teams.leagueId))
      .where(eq(teams.id, scope.teamId))
      .limit(1)
      .then((rows) => rows[0]),
    getTeamMembers(scope.teamId, scope.role),
    getTeamOverview(scope.teamId, scope.userId),
  ]);

  if (!team) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-sm text-base-content/50">
        Equipe não encontrada (ou você não é mais membro dela).
      </div>
    );
  }

  // O logo é só enfeite: se o Clerk falhar, a página continua funcionando.
  // Cacheado por 10 min: o LiveRefresh re-renderiza esta página periodicamente
  // e cada render chamava a Backend API do Clerk (fonte comum de 429).
  const logoUrl = team.clerkOrgId ? await getOrgLogoUrl(team.clerkOrgId) : null;
  // Sessão em andamento só importa na aba Geral (destaque e "na equipe agora").
  const activeSession = tab === "geral" && !feed ? await getActiveSessionRef(team.id) : null;

  const canManageMembers = roleCan(scope.role, "team.members.manage");
  const canEditTeam = roleCan(scope.role, "team.edit");
  const subtitle = [team.organizationName, team.leagueName, team.season].filter(Boolean).join(" · ");
  const counts: Partial<Record<TeamTabId, number>> = {
    kanban: overview.counts.boards,
    thinklab: overview.counts.thinklabs,
    labtests: overview.counts.tests,
    treinos: overview.counts.sessions,
    marcos: overview.counts.milestones,
    membros: members.length,
  };

  return (
    <div className="min-h-full bg-base-100">
      <LiveRefresh />

      <TeamHeader
        team={{ id: team.id, name: team.name }}
        logoUrl={logoUrl}
        subtitle={subtitle}
        tabs={TEAM_TABS.map((t) => ({ ...t, count: counts[t.id] }))}
        activeTab={tab}
        role={scope.role}
        canEditTeam={canEditTeam}
      />

      <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-6">
        {!isActiveScope && (
          <div role="alert" className={`alert alert-info alert-soft mb-5 ${CORNER.md}`}>
            <Info size={18} />
            <span className="text-sm">
              Você está vendo <strong>{team.name}</strong>, mas seu espaço ativo é outro. Abrir um Kanban,
              ThinkLab ou LabTest daqui só funciona depois de ativar esta equipe.
            </span>
            <ActivateTeamButton teamId={scope.teamId} />
          </div>
        )}

        {tab === "geral" && feed && (
          <ActivityFeed teamId={team.id} initial={await getTeamActivity(team.id, { limit: 30 })} />
        )}

        {tab === "geral" && !feed && (
          <OverviewTab
            teamId={team.id}
            overview={overview}
            role={scope.role}
            viewerId={scope.userId}
            members={members}
            activity={await getTeamActivity(team.id, { limit: 8 })}
            activeSession={activeSession}
            presentIds={activeSession ? await getSessionAttendeeIds(activeSession.id) : []}
            sessions={await getTeamTrainingSessions(team.id, { limit: 12 })}
            upcomingDuties={await getUpcomingDutiesFor(team.id, scope.userId)}
          />
        )}

        {tab === "treinos" && (
          <TrainingTab
            teamId={team.id}
            viewerId={scope.userId}
            viewerRole={scope.role}
            sessions={await getTeamTrainingSessions(team.id)}
          />
        )}

        {tab === "kanban" && (
          <ResourceTab
            teamId={team.id}
            kind="kanban"
            items={await getTeamBoards(team.id)}
            milestones={[]}
            viewerId={scope.userId}
            viewerRole={scope.role}
          />
        )}

        {tab === "thinklab" && (
          <ResourceTab
            teamId={team.id}
            kind="thinklab"
            items={await getTeamThinkLabs(team.id)}
            milestones={await getTeamMilestones(team.id)}
            viewerId={scope.userId}
            viewerRole={scope.role}
          />
        )}

        {tab === "labtests" && (
          <ResourceTab
            teamId={team.id}
            kind="labtest"
            items={await getTeamLabTests(team.id)}
            milestones={await getTeamMilestones(team.id)}
            viewerId={scope.userId}
            viewerRole={scope.role}
          />
        )}

        {tab === "marcos" && (
          <MilestonesTab teamId={team.id} viewerRole={scope.role} milestones={await getTeamMilestones(team.id)} />
        )}

        {tab === "membros" && (
          <MembersTab
            teamId={team.id}
            viewerId={scope.userId}
            viewerRole={scope.role}
            members={members}
            dutyHistory={await getMemberDutyHistory(team.id)}
            invitations={canManageMembers ? await listPendingInvitations(team.id).catch(() => []) : []}
          />
        )}
      </div>
    </div>
  );
}
