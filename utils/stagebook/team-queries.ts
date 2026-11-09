import "server-only";

import { and, asc, count, desc, eq, gte, isNull, lt, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  boardCardAssignees,
  boardCards,
  boardColumns,
  boards,
  calendarEvents,
  documents,
  leagues,
  milestones,
  teamActivity,
  teamMembers,
  teams,
  tests,
  thinklab,
  trainingSessions,
  users,
} from "@/db/schema";
import {
  milestoneColumns,
  milestoneUsageByKind,
  toMilestoneDTO,
} from "./labels-core";
import { isStaffRole, isTeamRole, type TeamRole } from "./team-permissions";
import type {
  MilestoneRef,
  TeamBoardSummary,
  TeamLabTestSummary,
  TeamMemberSummary,
  TeamMilestoneSummary,
  TeamThinkLabSummary,
} from "@/types/team-workspace";
import type { TeamActivityItem } from "@/types/training";

/**
 * Leituras da página da equipe. Todas recebem um `teamId` JÁ VALIDADO pelo
 * chamador (`requireStagebookAccess`) e filtram sempre por ele — nada aqui
 * confia em um id de recurso solto.
 */

const iso = (value: Date | null) => (value ? value.toISOString() : null);

function milestoneRef(row: {
  milestoneId: string | null;
  milestoneName: string | null;
  milestoneColor: string | null;
  milestoneDueAt: Date | null;
}): MilestoneRef | null {
  if (!row.milestoneId || !row.milestoneName) return null;
  return {
    id: row.milestoneId,
    name: row.milestoneName,
    color: row.milestoneColor,
    dueAt: iso(row.milestoneDueAt),
  };
}

export async function getTeamBoards(teamId: string): Promise<TeamBoardSummary[]> {
  const rows = await db
    .select({
      id: boards.id,
      name: boards.name,
      description: boards.description,
      createdBy: boards.createdBy,
      creatorName: users.name,
      updatedAt: boards.updatedAt,
      cardCount: sql<number>`(select count(*)::int from ${boardCards} where ${boardCards.boardId} = ${boards.id})`,
    })
    .from(boards)
    .leftJoin(users, eq(users.id, boards.createdBy))
    .where(eq(boards.teamId, teamId))
    .orderBy(asc(boards.position), asc(boards.name));

  return rows.map((row) => ({ ...row, updatedAt: row.updatedAt.toISOString() }));
}

export async function getTeamThinkLabs(teamId: string): Promise<TeamThinkLabSummary[]> {
  const rows = await db
    .select({
      id: thinklab.id,
      name: thinklab.name,
      description: thinklab.description,
      createdBy: thinklab.userId,
      creatorName: users.name,
      updatedAt: thinklab.updatedAt,
      milestoneId: milestones.id,
      milestoneName: milestones.name,
      milestoneColor: milestones.color,
      milestoneDueAt: milestones.dueAt,
    })
    .from(thinklab)
    .leftJoin(users, eq(users.id, thinklab.userId))
    .leftJoin(milestones, eq(milestones.id, thinklab.milestoneId))
    .where(eq(thinklab.teamId, teamId))
    .orderBy(desc(thinklab.updatedAt));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    createdBy: row.createdBy,
    creatorName: row.creatorName,
    updatedAt: row.updatedAt.toISOString(),
    milestone: milestoneRef(row),
  }));
}

export async function getTeamLabTests(teamId: string): Promise<TeamLabTestSummary[]> {
  const rows = await db
    .select({
      id: tests.id,
      name: tests.name,
      description: tests.description,
      mode: tests.mode,
      status: tests.status,
      season: tests.season,
      createdBy: tests.userId,
      creatorName: users.name,
      updatedAt: tests.updatedAt,
      milestoneId: milestones.id,
      milestoneName: milestones.name,
      milestoneColor: milestones.color,
      milestoneDueAt: milestones.dueAt,
    })
    .from(tests)
    .leftJoin(users, eq(users.id, tests.userId))
    .leftJoin(milestones, eq(milestones.id, tests.milestoneId))
    .where(eq(tests.teamId, teamId))
    .orderBy(desc(tests.updatedAt));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    mode: row.mode,
    status: row.status,
    season: row.season,
    createdBy: row.createdBy,
    creatorName: row.creatorName,
    updatedAt: row.updatedAt.toISOString(),
    milestone: milestoneRef(row),
  }));
}

export async function getTeamMilestones(teamId: string): Promise<TeamMilestoneSummary[]> {
  const rows = await db
    .select(milestoneColumns)
    .from(milestones)
    .where(eq(milestones.teamId, teamId))
    .orderBy(asc(milestones.dueAt), asc(milestones.name));

  const items = rows.map(toMilestoneDTO);
  const { usage } = await milestoneUsageByKind(items.map((m) => m.id));

  return items.map((m) => {
    const u = usage.get(m.id);
    return { ...m, usageTotal: u ? Object.values(u).reduce((a, b) => a + b, 0) : 0 };
  });
}

/** E-mail é dado pessoal: só vai para quem é técnico/mentor. */
export async function getTeamMembers(
  teamId: string,
  viewerRole: TeamRole,
): Promise<TeamMemberSummary[]> {
  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      role: teamMembers.role,
      joinedAt: teamMembers.joinedAt,
    })
    .from(teamMembers)
    .innerJoin(users, eq(users.id, teamMembers.userId))
    .where(eq(teamMembers.teamId, teamId))
    .orderBy(asc(teamMembers.joinedAt));

  const showEmail = isStaffRole(viewerRole);
  return rows.map((row) => ({
    userId: row.userId,
    name: row.name,
    email: showEmail ? row.email : null,
    avatarUrl: row.avatarUrl,
    role: isTeamRole(row.role) ? row.role : "colaborador",
    joinedAt: row.joinedAt.toISOString(),
  }));
}

export type TeamOverview = {
  counts: {
    boards: number;
    thinklabs: number;
    tests: number;
    pages: number;
    upcomingEvents: number;
    milestones: number;
    sessions: number;
  };
  myCards: {
    id: string;
    title: string;
    priority: string;
    dueAt: string | null;
    boardId: string;
    boardName: string;
    columnName: string;
  }[];
  upcomingEvents: { id: string; title: string; startAt: string; type: string; location: string | null }[];
  /** Próximo marco com prazo (para a contagem regressiva da aba Geral). */
  nextMilestone: { id: string; name: string; dueAt: string; color: string | null } | null;
};

export async function getTeamOverview(teamId: string, userId: string): Promise<TeamOverview> {
  const now = new Date();
  const one = async (query: Promise<{ value: number }[]>) => (await query)[0]?.value ?? 0;

  const [boardsN, thinklabsN, testsN, pagesN, eventsN, milestonesN, sessionsN, myCards, upcoming, nextMilestone] =
    await Promise.all([
      one(db.select({ value: count() }).from(boards).where(eq(boards.teamId, teamId))),
      one(db.select({ value: count() }).from(thinklab).where(eq(thinklab.teamId, teamId))),
      one(db.select({ value: count() }).from(tests).where(eq(tests.teamId, teamId))),
      one(db.select({ value: count() }).from(documents).where(and(eq(documents.teamId, teamId), isNull(documents.deletedAt)))),
      one(
        db
          .select({ value: count() })
          .from(calendarEvents)
          .where(and(eq(calendarEvents.teamId, teamId), gte(calendarEvents.startAt, now))),
      ),
      one(db.select({ value: count() }).from(milestones).where(eq(milestones.teamId, teamId))),
      one(db.select({ value: count() }).from(trainingSessions).where(eq(trainingSessions.teamId, teamId))),
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
        .where(and(eq(boardCardAssignees.userId, userId), eq(boards.teamId, teamId)))
        .orderBy(asc(boardCards.dueAt))
        .limit(8),
      db
        .select({
          id: calendarEvents.id,
          title: calendarEvents.title,
          startAt: calendarEvents.startAt,
          type: calendarEvents.type,
          location: calendarEvents.location,
        })
        .from(calendarEvents)
        .where(and(eq(calendarEvents.teamId, teamId), gte(calendarEvents.startAt, now)))
        .orderBy(asc(calendarEvents.startAt))
        .limit(5),
      db
        .select({ id: milestones.id, name: milestones.name, dueAt: milestones.dueAt, color: milestones.color })
        .from(milestones)
        .where(and(eq(milestones.teamId, teamId), gte(milestones.dueAt, new Date(now.getTime() - 86_400_000))))
        .orderBy(asc(milestones.dueAt))
        .limit(1)
        .then((rows) => rows[0] ?? null),
    ]);

  return {
    counts: {
      boards: boardsN,
      thinklabs: thinklabsN,
      tests: testsN,
      pages: pagesN,
      upcomingEvents: eventsN,
      milestones: milestonesN,
      sessions: sessionsN,
    },
    myCards: myCards.map((c) => ({ ...c, dueAt: iso(c.dueAt) })),
    upcomingEvents: upcoming.map((e) => ({ ...e, startAt: e.startAt.toISOString() })),
    nextMilestone:
      nextMilestone && nextMilestone.dueAt
        ? { ...nextMilestone, dueAt: nextMilestone.dueAt.toISOString() }
        : null,
  };
}

// ---------------------------------------------------------------------------
// Feed de atividade
// ---------------------------------------------------------------------------

/**
 * Linha do tempo da equipe, mais recente primeiro. Ordena por `updated_at`
 * porque linhas agregadas ("rodou 12 execuções") sobem quando recebem mais um
 * evento. Paginação por cursor: passe o `updatedAt` do último item em `before`.
 */
export async function getTeamActivity(
  teamId: string,
  { before, limit = 30 }: { before?: Date | null; limit?: number } = {},
): Promise<TeamActivityItem[]> {
  const rows = await db
    .select({
      id: teamActivity.id,
      verb: teamActivity.verb,
      entityType: teamActivity.entityType,
      entityId: teamActivity.entityId,
      data: teamActivity.data,
      count: teamActivity.count,
      createdAt: teamActivity.createdAt,
      updatedAt: teamActivity.updatedAt,
      actorId: teamActivity.actorId,
      actorName: users.name,
      actorAvatar: users.avatarUrl,
    })
    .from(teamActivity)
    .leftJoin(users, eq(users.id, teamActivity.actorId))
    .where(
      and(
        eq(teamActivity.teamId, teamId),
        before ? lt(teamActivity.updatedAt, before) : undefined,
      ),
    )
    .orderBy(desc(teamActivity.updatedAt), desc(teamActivity.id))
    .limit(Math.min(Math.max(limit, 1), 100));

  return rows.map((row) => ({
    id: row.id,
    verb: row.verb,
    entityType: row.entityType,
    entityId: row.entityId,
    data: row.data ?? {},
    count: row.count,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    actor: row.actorId ? { id: row.actorId, name: row.actorName, avatarUrl: row.actorAvatar } : null,
  }));
}

// ---------------------------------------------------------------------------
// Hub "Todas as equipes"
// ---------------------------------------------------------------------------

export type MyTeamSummary = {
  id: string;
  name: string;
  role: TeamRole;
  subtitle: string;
  memberCount: number;
  /** Título da sessão de treino em andamento, se houver. */
  liveSession: string | null;
  upcomingEvents: number;
};

/** Equipes do usuário com o essencial para os cartões do hub. */
export async function getMyTeamsSummary(userId: string): Promise<MyTeamSummary[]> {
  const rows = await db
    .select({
      id: teams.id,
      name: teams.name,
      role: teamMembers.role,
      organizationName: teams.organizationName,
      season: teams.season,
      leagueName: leagues.name,
      memberCount: sql<number>`(select count(*)::int from team_members tm where tm.team_id = "teams"."id")`,
      liveSession: sql<string | null>`(select ts.title from training_sessions ts where ts.team_id = "teams"."id" and ts.status = 'em_andamento' limit 1)`,
      upcomingEvents: sql<number>`(select count(*)::int from calendar_events ce where ce.team_id = "teams"."id" and ce.start_at >= now())`,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teams.id, teamMembers.teamId))
    .leftJoin(leagues, eq(leagues.id, teams.leagueId))
    .where(eq(teamMembers.userId, userId))
    .orderBy(asc(teams.name));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    role: isTeamRole(r.role) ? r.role : "colaborador",
    subtitle: [r.organizationName, r.leagueName, r.season].filter(Boolean).join(" · "),
    memberCount: Number(r.memberCount),
    liveSession: r.liveSession,
    upcomingEvents: Number(r.upcomingEvents),
  }));
}
