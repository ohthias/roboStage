import "server-only";

import { and, eq, isNotNull, isNull, sql, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db/client";
import {
  boardCards,
  boards,
  calendarEvents,
  documents,
  milestones,
  notifications,
  tags,
  teamMembers,
  testExecutions,
  tests,
  thinklab,
} from "@/db/schema";

/**
 * Consumo do usuário: quantos itens ele tem e quanto espaço ocupam. "Pessoal"
 * = o que está no espaço pessoal; "Equipes" = o que ele CRIOU dentro de
 * equipes (o conteúdo continua sendo da equipe — ver `clearPersonalData`).
 *
 * O tamanho é uma ESTIMATIVA do conteúdo armazenado: soma `pg_column_size`
 * das colunas pesadas (JSON de páginas, quadros, testes) e dos textos. Não
 * inclui índices nem overhead do Postgres, e não há cota rígida aplicada.
 */

export type UsageCategory = {
  key: string;
  label: string;
  personalCount: number;
  teamCount: number;
  personalBytes: number;
  teamBytes: number;
};

export type UserUsage = {
  categories: UsageCategory[];
  totals: { items: number; bytes: number; personalBytes: number; teamBytes: number };
  teams: { member: number; owner: number };
};

type Measure = { count: number; bytes: number };

async function measure(table: PgTable, bytesExpr: SQL, where: SQL | undefined): Promise<Measure> {
  const [row] = await db
    .select({
      count: sql<number>`count(*)::float8`,
      bytes: sql<number>`coalesce(sum(${bytesExpr}), 0)::float8`,
    })
    .from(table)
    .where(where);
  return { count: Number(row?.count ?? 0), bytes: Number(row?.bytes ?? 0) };
}

const size = (...cols: unknown[]) =>
  sql.join(
    cols.map((c) => sql`coalesce(pg_column_size(${c as never}), 0)`),
    sql` + `,
  );

export async function getUserUsage(userId: string): Promise<UserUsage> {
  const [
    docsP, docsT,
    boardsP, boardsT,
    cardsP, cardsT,
    thinkP, thinkT,
    testsP, testsT,
    execs,
    eventsP, eventsT,
    tagsP,
    milestonesP, milestonesT,
    notifs,
    memberOf,
    ownerOf,
  ] = await Promise.all([
    measure(documents, size(documents.title, documents.content, documents.properties), and(eq(documents.userId, userId), isNull(documents.teamId))),
    measure(documents, size(documents.title, documents.content, documents.properties), and(eq(documents.createdBy, userId), isNotNull(documents.teamId))),

    measure(boards, size(boards.name, boards.description), eq(boards.userId, userId)),
    measure(boards, size(boards.name, boards.description), and(eq(boards.createdBy, userId), isNotNull(boards.teamId))),

    db
      .select({ count: sql<number>`count(*)::float8`, bytes: sql<number>`coalesce(sum(${size(boardCards.title, boardCards.description)}), 0)::float8` })
      .from(boardCards)
      .innerJoin(boards, eq(boards.id, boardCards.boardId))
      .where(and(eq(boardCards.createdBy, userId), isNull(boards.teamId)))
      .then(([r]) => ({ count: Number(r?.count ?? 0), bytes: Number(r?.bytes ?? 0) })),
    db
      .select({ count: sql<number>`count(*)::float8`, bytes: sql<number>`coalesce(sum(${size(boardCards.title, boardCards.description)}), 0)::float8` })
      .from(boardCards)
      .innerJoin(boards, eq(boards.id, boardCards.boardId))
      .where(and(eq(boardCards.createdBy, userId), isNotNull(boards.teamId)))
      .then(([r]) => ({ count: Number(r?.count ?? 0), bytes: Number(r?.bytes ?? 0) })),

    measure(thinklab, size(thinklab.name, thinklab.config), and(eq(thinklab.userId, userId), isNull(thinklab.teamId))),
    measure(thinklab, size(thinklab.name, thinklab.config), and(eq(thinklab.userId, userId), isNotNull(thinklab.teamId))),

    measure(tests, size(tests.name, tests.config), and(eq(tests.userId, userId), isNull(tests.teamId))),
    measure(tests, size(tests.name, tests.config), and(eq(tests.userId, userId), isNotNull(tests.teamId))),

    // Execuções dos testes do usuário (pessoais e de equipe juntas).
    db
      .select({ count: sql<number>`count(*)::float8`, bytes: sql<number>`coalesce(sum(${size(testExecutions.results, testExecutions.notes)}), 0)::float8` })
      .from(testExecutions)
      .innerJoin(tests, eq(tests.id, testExecutions.testId))
      .where(eq(tests.userId, userId))
      .then(([r]) => ({ count: Number(r?.count ?? 0), bytes: Number(r?.bytes ?? 0) })),

    measure(calendarEvents, size(calendarEvents.title, calendarEvents.description), eq(calendarEvents.userId, userId)),
    measure(calendarEvents, size(calendarEvents.title, calendarEvents.description), and(eq(calendarEvents.createdBy, userId), isNotNull(calendarEvents.teamId))),

    measure(tags, size(tags.name), eq(tags.userId, userId)),

    measure(milestones, size(milestones.name, milestones.description), eq(milestones.userId, userId)),
    measure(milestones, size(milestones.name, milestones.description), and(eq(milestones.createdBy, userId), isNotNull(milestones.teamId))),

    measure(notifications, size(notifications.title, notifications.message, notifications.data), eq(notifications.userId, userId)),

    db.select({ n: sql<number>`count(*)::int` }).from(teamMembers).where(eq(teamMembers.userId, userId)),
    db.select({ n: sql<number>`count(*)::int` }).from(teamMembers).where(and(eq(teamMembers.userId, userId), eq(teamMembers.role, "owner"))),
  ]);

  const zero: Measure = { count: 0, bytes: 0 };
  const row = (key: string, label: string, p: Measure, t: Measure = zero): UsageCategory => ({
    key,
    label,
    personalCount: p.count,
    teamCount: t.count,
    personalBytes: p.bytes,
    teamBytes: t.bytes,
  });

  const categories = [
    row("documents", "Páginas (StageBook)", docsP, docsT),
    row("boards", "Kanbans", boardsP, boardsT),
    row("cards", "Cards", cardsP, cardsT),
    row("thinklab", "Quadros do ThinkLab", thinkP, thinkT),
    row("tests", "LabTests", testsP, testsT),
    row("executions", "Execuções de teste", execs),
    row("events", "Eventos do calendário", eventsP, eventsT),
    row("tags", "Tags", tagsP),
    row("milestones", "Milestones", milestonesP, milestonesT),
    row("notifications", "Notificações", notifs),
  ];

  const personalBytes = categories.reduce((a, c) => a + c.personalBytes, 0);
  const teamBytes = categories.reduce((a, c) => a + c.teamBytes, 0);

  return {
    categories,
    totals: {
      items: categories.reduce((a, c) => a + c.personalCount + c.teamCount, 0),
      bytes: personalBytes + teamBytes,
      personalBytes,
      teamBytes,
    },
    teams: { member: memberOf[0]?.n ?? 0, owner: ownerOf[0]?.n ?? 0 },
  };
}
