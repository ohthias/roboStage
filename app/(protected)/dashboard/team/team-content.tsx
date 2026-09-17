import { and, asc, count, eq, gte } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { Book, CalendarDays, KanbanSquare, Settings, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { db } from "@/db/client";
import {
  teams,
  teamMembers,
  users,
  leagues,
  documents,
  boards,
  boardColumns,
  boardCards,
  boardCardAssignees,
  calendarEvents,
} from "@/db/schema";
import type { StagebookScope } from "@/utils/stagebook/scope";
import { listPendingInvitations } from "./actions";
import { MemberManagement } from "./member-management";
import { CompetitorTeamView } from "./competitor-view";
import { LiveRefresh } from "@/components/stagebook/live-refresh";
import { ActivateTeamButton } from "./activate-team-button";
import { OrganizationSettings } from "./organization-settings";

const ROLE_LABEL: Record<string, string> = {
  owner: "Técnico (owner)",
  mentor: "Mentor",
  competidor: "Competidor",
  colaborador: "Colaborador",
};

type TeamScope = Extract<StagebookScope, { type: "team" }>;

/**
 * Conteúdo da página de uma equipe, dado um scope já resolvido/validado
 * (o chamador — `page.tsx` ou `[id]/page.tsx` — é quem garante que o
 * usuário atual é membro dela). `isActiveScope` diz se essa é a equipe
 * "ativa" no momento (cookie de contexto do Stagebook); quando não é,
 * mostramos um aviso com botão pra ativar, em vez de trocar o contexto
 * sozinho ao simplesmente abrir a página.
 */
export async function TeamContent({
  scope,
  isActiveScope,
}: {
  scope: TeamScope;
  isActiveScope: boolean;
}) {
  const [team, members] = await Promise.all([
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
  ]);

  if (!team) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-sm text-base-content/50">
        Equipe não encontrada (ou você não é mais membro dela).
      </div>
    );
  }

  const organization = team.clerkOrgId
    ? await (await clerkClient()).organizations.getOrganization({ organizationId: team.clerkOrgId })
    : null;

  const activationBanner = !isActiveScope && (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
      <p className="text-sm text-base-content/70">
        Você está vendo <strong>{team.name}</strong>, mas seu espaço ativo é outro. Páginas,
        Calendário e Kanban continuam mostrando o espaço ativo até você trocar.
      </p>
      <ActivateTeamButton teamId={scope.teamId} />
    </div>
  );

  // -------------------------------------------------------------------
  // Competidor: dashboard focado no que precisa ser feito, sem administração.
  // -------------------------------------------------------------------
  if (scope.role === "competidor") {
    const [assignedCards, upcomingEvents] = await Promise.all([
      db
        .select({
          id: boardCards.id,
          title: boardCards.title,
          priority: boardCards.priority,
          dueAt: boardCards.dueAt,
          boardId: boards.id,
          boardName: boards.name,
          columnName: boardColumns.name,
        })
        .from(boardCardAssignees)
        .innerJoin(boardCards, eq(boardCards.id, boardCardAssignees.cardId))
        .innerJoin(boards, eq(boards.id, boardCards.boardId))
        .innerJoin(boardColumns, eq(boardColumns.id, boardCards.columnId))
        .where(and(eq(boardCardAssignees.userId, scope.userId), eq(boards.teamId, scope.teamId)))
        .orderBy(asc(boardCards.dueAt)),
      db
        .select({
          id: calendarEvents.id,
          title: calendarEvents.title,
          startAt: calendarEvents.startAt,
          type: calendarEvents.type,
        })
        .from(calendarEvents)
        .where(and(eq(calendarEvents.teamId, scope.teamId), gte(calendarEvents.startAt, new Date())))
        .orderBy(asc(calendarEvents.startAt))
        .limit(6),
    ]);

    return (
      <div className="mx-auto max-w-3xl px-4 pt-8">
        <LiveRefresh />
        {activationBanner}
        <CompetitorTeamView
          teamName={team.name}
          assignedCards={assignedCards.map((c) => ({ ...c, dueAt: c.dueAt ? c.dueAt.toISOString() : null }))}
          upcomingEvents={upcomingEvents.map((e) => ({ ...e, startAt: e.startAt.toISOString() }))}
          teammates={members.map((m) => ({ userId: m.userId, name: m.name, role: ROLE_LABEL[m.role] ?? m.role }))}
        />
      </div>
    );
  }

  // -------------------------------------------------------------------
  // Técnico (owner) / mentor / colaborador: visão completa do desenvolvimento.
  // -------------------------------------------------------------------
  const [pageCount, boardCount, upcomingEventCount, invitations] = await Promise.all([
    db.select({ value: count() }).from(documents).where(eq(documents.teamId, scope.teamId)),
    db.select({ value: count() }).from(boards).where(eq(boards.teamId, scope.teamId)),
    db
      .select({ value: count() })
      .from(calendarEvents)
      .where(and(eq(calendarEvents.teamId, scope.teamId), gte(calendarEvents.startAt, new Date()))),
    scope.role === "owner" ? listPendingInvitations(scope.teamId) : Promise.resolve([]),
  ]);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 bg-base-300">
      <LiveRefresh />
      {activationBanner}

      <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-base-300 bg-base-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-xl">
                {organization?.imageUrl ? (
                  <img
                    src={organization.imageUrl}
                    alt={`Logo da organização ${team.organizationName ?? team.name}`}
                    className="h-11 w-11 rounded-xl object-cover"
                  />
                ) : (
                  <Users size={20} />
                )}
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

          <div className="flex shrink-0 flex-col items-end gap-2">
            {team.clerkOrgId && (
              <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-base-100 px-3 py-1.5 text-xs text-base-content/50">
                <ShieldCheck size={13} className="text-success" />
                Organização Configurada
              </span>
            )}
            {scope.role === "owner" && (
              <>
                <button
                  type="button"
                  popoverTarget="organization-profile-modal"
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-base-100 px-3 py-1.5 text-xs text-base-content/70 transition hover:bg-base-300"
                >
                  <Settings size={13} />
                  Configurações da organização
                </button>
                <div
                  id="organization-profile-modal"
                  popover="auto"
                  className="relative flex h-full w-full items-center justify-center bg-base-100/50 backdrop-blur-sm [&:not(:popover-open)]:hidden"
                >
                  <button
                    type="button"
                    popoverTarget="organization-profile-modal"
                    popoverTargetAction="hide"
                    aria-label="Fechar configurações da organização"
                    className="absolute inset-0 cursor-default"
                  />
                  <div className="relative z-10">
                    <OrganizationSettings organizationId={team.clerkOrgId!} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Acesso rápido */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <QuickLink href="/dashboard/documents" icon={<Book size={18} />} label="Páginas" value={pageCount[0]?.value ?? 0} />
        <QuickLink href="/dashboard/calendar" icon={<CalendarDays size={18} />} label="Próximos eventos" value={upcomingEventCount[0]?.value ?? 0} />
        <QuickLink href="/dashboard/kanban" icon={<KanbanSquare size={18} />} label="Boards" value={boardCount[0]?.value ?? 0} />
      </div>

      {scope.role === "owner" ? (
        <MemberManagement teamId={scope.teamId} members={members} invitations={invitations} />
      ) : (
        <>
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
                  <span className="badge badge-ghost badge-sm">{ROLE_LABEL[member.role] ?? member.role}</span>
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-4 text-center text-xs text-base-content/35">
            Convidar, remover ou trocar o papel de alguém é uma ação só do técnico responsável (owner) pela equipe.
          </p>
        </>
      )}
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
