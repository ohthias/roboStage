import "server-only";

import { and, asc, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import {
  users,
  leagues,
  userLeagueInterests,
  testExecutions,
  tests,
  documents,
  calendarEvents,
  boardCards,
  boardColumns,
  boards,
  teams,
} from "@/db/schema";
import {
  requireAuthenticatedUser,
  resolveStagebookScope,
} from "@/utils/stagebook/scope";
import { scopeWhere } from "@/utils/stagebook/permissions";

function startOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export async function getDashboardData() {
  const userId = await requireAuthenticatedUser();
  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!currentUser?.onboardingCompletedAt) redirect("/onboarding");

  const scope = await resolveStagebookScope();
  const activeTeamName =
    scope.type === "team"
      ? (
          await db
            .select({ name: teams.name })
            .from(teams)
            .where(eq(teams.id, scope.teamId))
            .limit(1)
        )[0]?.name ?? null
      : null;
  const documentScope = scopeWhere(scope, {
    userId: documents.userId,
    teamId: documents.teamId,
  });
  const eventScope = scopeWhere(scope, {
    userId: calendarEvents.userId,
    teamId: calendarEvents.teamId,
  });
  const boardScope = scopeWhere(scope, {
    userId: boards.userId,
    teamId: boards.teamId,
  });

  const [
    leagueInterests,
    recentTests,
    totalExecutionsCount,
    executionsThisWeek,
    recentDocuments,
    upcomingEvents,
    pendingCards,
  ] = await Promise.all([
    db
      .select({
        id: userLeagueInterests.id,
        relationType: userLeagueInterests.relationType,
        teamName: userLeagueInterests.teamName,
        season: userLeagueInterests.season,
        leagueName: leagues.name,
        leagueCode: leagues.code,
      })
      .from(userLeagueInterests)
      .innerJoin(leagues, eq(leagues.id, userLeagueInterests.leagueId))
      .where(eq(userLeagueInterests.userId, userId))
      .orderBy(desc(userLeagueInterests.relationType)),
    db
      .select({
        id: tests.id,
        name: tests.name,
        description: tests.description,
        type: tests.mode,
        status: tests.status,
        executionCount: sql<number>`count(${testExecutions.id})`.mapWith(Number),
      })
      .from(tests)
      .leftJoin(testExecutions, eq(testExecutions.testId, tests.id))
      .where(eq(tests.userId, userId))
      .groupBy(tests.id)
      .orderBy(desc(tests.updatedAt))
      .limit(5),
    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(testExecutions)
      .innerJoin(tests, eq(tests.id, testExecutions.testId))
      .where(eq(tests.userId, userId)),
    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(testExecutions)
      .innerJoin(tests, eq(tests.id, testExecutions.testId))
      .where(
        and(
          eq(tests.userId, userId),
          gte(testExecutions.createdAt, startOfWeek()),
        ),
      ),
    db
      .select({
        id: documents.id,
        title: documents.title,
        icon: documents.icon,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .where(documentScope)
      .orderBy(desc(documents.updatedAt))
      .limit(4),
    db
      .select({
        id: calendarEvents.id,
        title: calendarEvents.title,
        startAt: calendarEvents.startAt,
        type: calendarEvents.type,
      })
      .from(calendarEvents)
      .where(and(eventScope, gte(calendarEvents.startAt, new Date())))
      .orderBy(asc(calendarEvents.startAt))
      .limit(4),
    db
      .select({
        id: boardCards.id,
        title: boardCards.title,
        dueAt: boardCards.dueAt,
        priority: boardCards.priority,
        boardId: boardCards.boardId,
        boardName: boards.name,
        columnName: boardColumns.name,
      })
      .from(boardCards)
      .innerJoin(boards, eq(boards.id, boardCards.boardId))
      .innerJoin(boardColumns, eq(boardColumns.id, boardCards.columnId))
      .where(and(boardScope, isNotNull(boardCards.dueAt)))
      .orderBy(asc(boardCards.dueAt))
      .limit(4),
  ]);

  return {
    currentUser,
    scope,
    activeTeamName,
    leagueInterests,
    recentTests,
    totalExecutions: totalExecutionsCount[0]?.count ?? 0,
    weeklyExecutions: executionsThisWeek[0]?.count ?? 0,
    recentDocuments,
    upcomingEvents,
    pendingCards,
  };
}