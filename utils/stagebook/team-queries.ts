import "server-only";

import { and, asc, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  boardCardAssignees,
  boardCards,
  boardColumns,
  boards,
  calendarEvents,
  documents,
  milestones,
  teamMembers,
  tests,
  thinklab,
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
  upcomingEvents: { id: string; title: string; startAt: string; type: string }[];
};

export async function getTeamOverview(teamId: string, userId: string): Promise<TeamOverview> {
  const now = new Date();
  const one = async (query: Promise<{ value: number }[]>) => (await query)[0]?.value ?? 0;

  const [boardsN, thinklabsN, testsN, pagesN, eventsN, milestonesN, myCards, upcoming] =
    await Promise.all([
      one(db.select({ value: count() }).from(boards).where(eq(boards.teamId, teamId))),
      one(db.select({ value: count() }).from(thinklab).where(eq(thinklab.teamId, teamId))),
      one(db.select({ value: count() }).from(tests).where(eq(tests.teamId, teamId))),
      one(db.select({ value: count() }).from(documents).where(eq(documents.teamId, teamId))),
      one(
        db
          .select({ value: count() })
          .from(calendarEvents)
          .where(and(eq(calendarEvents.teamId, teamId), gte(calendarEvents.startAt, now))),
      ),
      one(db.select({ value: count() }).from(milestones).where(eq(milestones.teamId, teamId))),
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
        })
        .from(calendarEvents)
        .where(and(eq(calendarEvents.teamId, teamId), gte(calendarEvents.startAt, now)))
        .orderBy(asc(calendarEvents.startAt))
        .limit(5),
    ]);

  return {
    counts: {
      boards: boardsN,
      thinklabs: thinklabsN,
      tests: testsN,
      pages: pagesN,
      upcomingEvents: eventsN,
      milestones: milestonesN,
    },
    myCards: myCards.map((c) => ({ ...c, dueAt: iso(c.dueAt) })),
    upcomingEvents: upcoming.map((e) => ({ ...e, startAt: e.startAt.toISOString() })),
  };
}
