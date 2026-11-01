import Link from "next/link";
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
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { db } from "@/db/client";
import { leagues, teams } from "@/db/schema";
import type { TeamScope } from "@/utils/stagebook/scope";
import { roleCan } from "@/utils/stagebook/team-permissions";
import {
  getTeamBoards,
  getTeamLabTests,
  getTeamMembers,
  getTeamMilestones,
  getTeamOverview,
  getTeamThinkLabs,
} from "@/utils/stagebook/team-queries";
import { LiveRefresh } from "@/components/stagebook/live-refresh";
import { listPendingInvitations } from "./actions";
import { ActivateTeamButton } from "./activate-team-button";
import { MembersTab } from "./_components/members-tab";
import { MilestonesTab } from "./_components/milestones-tab";
import { OverviewTab } from "./_components/overview-tab";
import { ResourceTab } from "./_components/resource-tab";
import { RoleBadge } from "./_components/role-badge";
import { PersonAvatar, TeamAvatar } from "./_components/team-avatar";

export const TEAM_TABS = [
  { id: "geral", label: "Geral", Icon: LayoutDashboard },
  { id: "kanban", label: "Kanban", Icon: KanbanSquare },
  { id: "thinklab", label: "ThinkLab", Icon: Lightbulb },
  { id: "labtests", label: "LabTests", Icon: FlaskConical },
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
}: {
  scope: TeamScope;
  isActiveScope: boolean;
  tab?: TeamTabId;
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

  const canManageMembers = roleCan(scope.role, "team.members.manage");
  const canEditTeam = roleCan(scope.role, "team.edit");
  const subtitle = [team.organizationName, team.leagueName, team.season].filter(Boolean).join(" · ");
  const counts: Partial<Record<TeamTabId, number>> = {
    kanban: overview.counts.boards,
    thinklab: overview.counts.thinklabs,
    labtests: overview.counts.tests,
    marcos: overview.counts.milestones,
    membros: members.length,
  };
  const base = `/dashboard/team/${team.id}`;

  return (
    <div>
      <LiveRefresh />

      {/* Cabeçalho da equipe + abas */}
      <header className="border-b border-base-300 bg-base-100">
        <div className="flex flex-wrap items-center gap-4 px-4 pb-3 pt-5 sm:px-6">
          <TeamAvatar name={team.name} imageUrl={logoUrl} size="lg" />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold leading-tight">{team.name}</h1>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-base-content/55">
              <RoleBadge role={scope.role} size="xs" />
              {subtitle && <span>{subtitle}</span>}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Link
              href={`${base}?tab=membros`}
              className="avatar-group -space-x-3 rtl:space-x-reverse"
              aria-label={`${members.length} membros`}
            >
              {members.slice(0, 4).map((m) => (
                <PersonAvatar key={m.userId} name={m.name} imageUrl={m.avatarUrl} size="size-8" />
              ))}
              {members.length > 4 && (
                <div className="avatar avatar-placeholder">
                  <div className="size-8 bg-neutral text-neutral-content">
                    <span className="text-[10px]">+{members.length - 4}</span>
                  </div>
                </div>
              )}
            </Link>

            {canEditTeam && (
              <Link href={`${base}/settings`} className="btn btn-sm btn-ghost gap-1.5">
                <Settings size={15} />
                <span className="hidden sm:inline">Gerenciar equipe</span>
              </Link>
            )}
          </div>
        </div>

        <nav role="tablist" aria-label="Seções da equipe" className="tabs tabs-border overflow-x-auto px-2 sm:px-4">
          {TEAM_TABS.map(({ id, label, Icon }) => {
            const active = id === tab;
            const count = counts[id];
            return (
              <Link
                key={id}
                role="tab"
                aria-selected={active}
                href={`${base}?tab=${id}`}
                className={`tab gap-2 whitespace-nowrap ${active ? "tab-active font-semibold" : ""}`}
              >
                <Icon size={15} />
                {label}
                {count !== undefined && <span className="badge badge-ghost badge-xs">{count}</span>}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="mx-auto w-full p-4 sm:p-6">
        {!isActiveScope && (
          <div role="alert" className="alert alert-info alert-soft mb-5">
            <Info size={18} />
            <span className="text-sm">
              Você está vendo <strong>{team.name}</strong>, mas seu espaço ativo é outro. Abrir um Kanban,
              ThinkLab ou LabTest daqui só funciona depois de ativar esta equipe.
            </span>
            <ActivateTeamButton teamId={scope.teamId} />
          </div>
        )}

        {tab === "geral" && <OverviewTab teamId={team.id} overview={overview} role={scope.role} />}

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
            invitations={canManageMembers ? await listPendingInvitations(team.id).catch(() => []) : []}
          />
        )}
      </div>
    </div>
  );
}
