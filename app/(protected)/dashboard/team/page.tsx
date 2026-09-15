import Link from "next/link";
import { and, count, eq, gte } from "drizzle-orm";
import {
  Book,
  CalendarDays,
  KanbanSquare,
  Lock,
  ShieldCheck,
  Users,
} from "lucide-react";
import { db } from "@/db/client";
import {
  teams,
  teamMembers,
  users,
  leagues,
  documents,
  boards,
  calendarEvents,
} from "@/db/schema";
import { resolveStagebookScope } from "@/utils/stagebook/scope";
import { listMyTeams, canCurrentUserCreateTeam } from "@/utils/stagebook/actions/teams";
import { TeamCreateForm } from "./team-create-form";

const ROLE_LABEL: Record<string, string> = {
  owner: "Dono",
  mentor: "Mentor",
  competidor: "Competidor",
  colaborador: "Colaborador",
};

export default async function TeamHomePage() {
  const scope = await resolveStagebookScope();

  if (scope.type === "personal") {
    const [myTeams, canCreateTeam] = await Promise.all([listMyTeams(), canCurrentUserCreateTeam()]);
    return (
      <PersonalEmptyState teams={myTeams} canCreateTeam={canCreateTeam} />
    );
  }

  const [team, members, pageCount, boardCount, upcomingEventCount] = await Promise.all([
    db
      .select({
        id: teams.id,
        name: teams.name,
        season: teams.season,
        organizationName: teams.organizationName,
        clerkOrgId: teams.clerkOrgId,
        leagueName: leagues.name,
        leagueCode: leagues.code,
      })
      .from(teams)
      .leftJoin(leagues, eq(leagues.id, teams.leagueId))
      .where(eq(teams.id, scope.teamId))
      .limit(1)
      .then((rows) => rows[0]),
    db
      .select({
        userId: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        role: teamMembers.role,
        joinedAt: teamMembers.joinedAt,
      })
      .from(teamMembers)
      .innerJoin(users, eq(users.id, teamMembers.userId))
      .where(eq(teamMembers.teamId, scope.teamId))
      .orderBy(teamMembers.joinedAt),
    db.select({ value: count() }).from(documents).where(eq(documents.teamId, scope.teamId)),
    db.select({ value: count() }).from(boards).where(eq(boards.teamId, scope.teamId)),
    db
      .select({ value: count() })
      .from(calendarEvents)
      .where(and(eq(calendarEvents.teamId, scope.teamId), gte(calendarEvents.startAt, new Date()))),
  ]);

  if (!team) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-sm text-base-content/50">
        Equipe não encontrada (ou você não é mais membro dela).
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-base-300 bg-base-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-xl">
                <Users size={20} />
              </span>
              <div>
                <h1 className="text-xl font-bold">{team.name}</h1>
                <p className="text-xs text-base-content/50">
                  {[team.organizationName, team.leagueName, team.season].filter(Boolean).join(" · ") ||
                    "Espaço de equipe"}
                </p>
              </div>
            </div>
          </div>

          {team.clerkOrgId && (
            <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-base-100 px-3 py-1.5 text-xs text-base-content/50">
              <ShieldCheck size={13} className="text-success" />
              Organização Clerk vinculada
            </span>
          )}
        </div>
      </div>

      {/* Acesso rápido */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <QuickLink href="/dashboard/documents" icon={<Book size={18} />} label="Páginas" value={pageCount[0]?.value ?? 0} />
        <QuickLink href="/dashboard/calendar" icon={<CalendarDays size={18} />} label="Próximos eventos" value={upcomingEventCount[0]?.value ?? 0} />
        <QuickLink href="/dashboard/kanban" icon={<KanbanSquare size={18} />} label="Boards" value={boardCount[0]?.value ?? 0} />
      </div>

      {/* Membros */}
      <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-200">
        <div className="border-b border-base-300 px-5 py-4">
          <h2 className="font-semibold">Membros</h2>
          <p className="mt-0.5 text-xs text-base-content/50">
            {members.length} {members.length === 1 ? "pessoa" : "pessoas"} nesta equipe
          </p>
        </div>

        <ul className="divide-y divide-base-300/70">
          {members.map((member) => (
            <li key={member.userId} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold">
                  {(member.name ?? "?")
                    .split(" ")
                    .slice(0, 2)
                    .map((p) => p[0]?.toUpperCase())
                    .join("")}
                </span>
                <span className="text-sm font-medium">{member.name ?? "Sem nome"}</span>
              </div>
              <span className="badge badge-ghost badge-sm">
                {ROLE_LABEL[member.role] ?? member.role}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-4 text-center text-xs text-base-content/35">
        Convites e mudança de papel de membros são gerenciados pela Organização no Clerk.
      </p>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
  value,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-base-300 bg-base-100 px-4 py-4 transition-colors hover:border-primary/40"
    >
      <span className="flex items-center gap-2.5 text-sm font-medium">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        {label}
      </span>
      <span className="text-lg font-bold text-base-content/70">{value}</span>
    </Link>
  );
}

function PersonalEmptyState({
  teams,
  canCreateTeam,
}: {
  teams: { id: string; name: string; role: string }[];
  canCreateTeam: boolean;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Users size={24} />
      </span>
      <h1 className="text-xl font-bold">Espaço de equipe</h1>
      <p className="mt-2 text-sm text-base-content/60">
        Você está no espaço pessoal. Troque de contexto pelo seletor no topo da tela para ver a
        página de uma equipe, ou crie uma nova abaixo.
      </p>

      {teams.length > 0 && (
        <div className="mt-6 flex flex-col gap-2 text-left">
          {teams.map((team) => (
            <div
              key={team.id}
              className="flex items-center justify-between rounded-xl border border-base-300 px-4 py-3 text-sm"
            >
              <span className="font-medium">{team.name}</span>
              <span className="badge badge-ghost badge-sm capitalize">{team.role}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        {canCreateTeam ? (
          <TeamCreateForm />
        ) : (
          <p className="flex items-center justify-center gap-2 text-xs text-base-content/40">
            <Lock size={13} />
            Criar um espaço de equipe é permitido só para perfis de mentor técnico, entusiasta ou
            organizador.
          </p>
        )}
      </div>
    </div>
  );
}
