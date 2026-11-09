import "server-only";

import { and, asc, desc, eq, gte, inArray, isNull, ne, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  anatixLabs,
  anatixSessions,
  leagues,
  sessionDutyAssignments,
  teamDutyRoles,
  teams,
  testExecutions,
  tests,
  trainingSessionAttendees,
  trainingSessions,
  users,
  type TrainingSessionRow,
} from "@/db/schema";
import { dutyRoleSeedsFor } from "./league-features";
import { getActiveTrainingSession, scoreExecutions } from "./training-core";
import type {
  ActiveSessionRef,
  DutyAssignmentDTO,
  DutyRoleDTO,
  MemberDutyHistory,
  SessionAnatixDTO,
  SessionExecutionDTO,
  TrainingSessionListItem,
  TrainingSummary,
  UpcomingDuty,
} from "@/types/training";

/**
 * Leituras de sessões de treino e escala. Todas recebem um `teamId` JÁ
 * VALIDADO pelo chamador e filtram sempre por ele.
 */

const iso = (value: Date | null) => (value ? value.toISOString() : null);

export function toActiveRef(row: TrainingSessionRow): ActiveSessionRef {
  return {
    id: row.id,
    teamId: row.teamId,
    title: row.title,
    kind: row.kind,
    startedAt: iso(row.startedAt),
  };
}

/** Sessão em andamento (já aplica o encerramento automático por inatividade). */
export async function getActiveSessionRef(teamId: string): Promise<ActiveSessionRef | null> {
  const row = await getActiveTrainingSession(teamId);
  return row ? toActiveRef(row) : null;
}

const STATUS_ORDER = sql`case ${trainingSessions.status}
  when 'em_andamento' then 0 when 'planejada' then 1 else 2 end`;

export async function getTeamTrainingSessions(
  teamId: string,
  { limit = 60 }: { limit?: number } = {},
): Promise<TrainingSessionListItem[]> {
  // Encerra (se for o caso) a sessão parada antes de listar.
  await getActiveTrainingSession(teamId);

  const rows = await db
    .select({
      id: trainingSessions.id,
      title: trainingSessions.title,
      kind: trainingSessions.kind,
      status: trainingSessions.status,
      location: trainingSessions.location,
      scheduledFor: trainingSessions.scheduledFor,
      startedAt: trainingSessions.startedAt,
      endedAt: trainingSessions.endedAt,
      createdBy: trainingSessions.createdBy,
      creatorName: users.name,
      summary: trainingSessions.summary,
      rosterPublishedAt: trainingSessions.rosterPublishedAt,
      attendeeCount: sql<number>`(select count(*)::int from training_session_attendees ta where ta.session_id = "training_sessions"."id")`,
      executionCount: sql<number>`(select count(*)::int from test_executions te where te.training_session_id = "training_sessions"."id")`,
    })
    .from(trainingSessions)
    .leftJoin(users, eq(users.id, trainingSessions.createdBy))
    .where(eq(trainingSessions.teamId, teamId))
    .orderBy(
      STATUS_ORDER,
      // Planejadas: a mais próxima primeiro. Encerradas: a mais recente primeiro.
      sql`case when ${trainingSessions.status} = 'planejada' then ${trainingSessions.scheduledFor} end asc nulls last`,
      desc(sql`coalesce(${trainingSessions.endedAt}, ${trainingSessions.startedAt}, ${trainingSessions.createdAt})`),
    )
    .limit(limit);

  return rows.map((row) => ({
    ...row,
    attendeeCount: Number(row.attendeeCount),
    executionCount: Number(row.executionCount),
    scheduledFor: iso(row.scheduledFor),
    startedAt: iso(row.startedAt),
    endedAt: iso(row.endedAt),
    rosterPublishedAt: iso(row.rosterPublishedAt),
    summary: (row.summary ?? {}) as Partial<TrainingSummary>,
  }));
}

// ---------------------------------------------------------------------------
// Catálogo de funções
// ---------------------------------------------------------------------------

function toDutyRoleDTO(row: typeof teamDutyRoles.$inferSelect): DutyRoleDTO {
  return {
    id: row.id,
    label: row.label,
    description: row.description,
    color: row.color,
    position: row.position,
    maxPerSlot: row.maxPerSlot,
    archived: row.archivedAt !== null,
  };
}

/**
 * Funções da equipe. Na primeira leitura de uma equipe sem catálogo, semeia
 * as funções padrão da liga (FLL, OBR ou genéricas).
 */
export async function getTeamDutyRoles(
  teamId: string,
  { includeArchived = false }: { includeArchived?: boolean } = {},
): Promise<DutyRoleDTO[]> {
  const load = () =>
    db
      .select()
      .from(teamDutyRoles)
      .where(
        and(eq(teamDutyRoles.teamId, teamId), includeArchived ? undefined : isNull(teamDutyRoles.archivedAt)),
      )
      .orderBy(asc(teamDutyRoles.position), asc(teamDutyRoles.label));

  const [any] = await db
    .select({ id: teamDutyRoles.id })
    .from(teamDutyRoles)
    .where(eq(teamDutyRoles.teamId, teamId))
    .limit(1);

  if (!any) {
    const [team] = await db
      .select({ code: leagues.code, name: leagues.name })
      .from(teams)
      .leftJoin(leagues, eq(leagues.id, teams.leagueId))
      .where(eq(teams.id, teamId))
      .limit(1);
    const seeds = dutyRoleSeedsFor(team?.code && team.name ? { code: team.code, name: team.name } : null);
    await db
      .insert(teamDutyRoles)
      .values(
        seeds.map((seed, index) => ({
          teamId,
          label: seed.label,
          description: seed.description ?? null,
          maxPerSlot: seed.maxPerSlot ?? null,
          position: (index + 1) * 10,
        })),
      )
      // Duas abas abrindo juntas: a segunda não duplica.
      .onConflictDoNothing({ target: [teamDutyRoles.teamId, teamDutyRoles.label] });
  }

  return (await load()).map(toDutyRoleDTO);
}

// ---------------------------------------------------------------------------
// Detalhe da sessão
// ---------------------------------------------------------------------------

export type TrainingSessionDetail = {
  session: {
    id: string;
    teamId: string;
    title: string;
    kind: string;
    status: string;
    location: string | null;
    notes: string | null;
    scheduledFor: string | null;
    startedAt: string | null;
    endedAt: string | null;
    createdBy: string;
    creatorName: string | null;
    calendarEventId: string | null;
    roundCount: number;
    currentRound: number | null;
    rosterPublishedAt: string | null;
    rosterDirty: boolean;
    summary: Partial<TrainingSummary>;
  };
  attendees: { userId: string; checkedInAt: string }[];
  executions: SessionExecutionDTO[];
  anatix: SessionAnatixDTO[];
  dutyRoles: DutyRoleDTO[];
  assignments: DutyAssignmentDTO[];
  /** Execuções recentes de testes da equipe sem sessão (para vincular à mão). */
  unlinkedExecutions: SessionExecutionDTO[];
};

type Snapshot = { userId: string; dutyRoleId: string; round: number | null }[];

export function snapshotKey(a: { userId: string; dutyRoleId: string; round: number | null }) {
  return `${a.userId}|${a.dutyRoleId}|${a.round ?? "-"}`;
}

function sameRoster(a: Snapshot | null, b: Snapshot): boolean {
  if (!a) return b.length === 0;
  if (a.length !== b.length) return false;
  const keys = new Set(a.map(snapshotKey));
  return b.every((x) => keys.has(snapshotKey(x)));
}

async function toExecutionDTOs(
  rows: (typeof testExecutions.$inferSelect)[],
): Promise<SessionExecutionDTO[]> {
  const scored = await scoreExecutions(rows);
  const operatorIds = [...new Set(scored.map((e) => e.createdBy).filter((id): id is string => !!id))];
  const names = operatorIds.length
    ? new Map(
        (
          await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, operatorIds))
        ).map((u) => [u.id, u.name]),
      )
    : new Map<string, string | null>();
  return scored.map((e) => ({
    id: e.id,
    testId: e.testId,
    testName: e.testName,
    executionNumber: e.executionNumber,
    score: e.score,
    operatorId: e.createdBy,
    operatorName: e.createdBy ? (names.get(e.createdBy) ?? null) : null,
    createdAt: e.createdAt.toISOString(),
  }));
}

export async function getTrainingSessionDetail(
  teamId: string,
  sessionId: string,
): Promise<TrainingSessionDetail | null> {
  // Aplica o encerramento automático antes de mostrar.
  await getActiveTrainingSession(teamId);

  const [row] = await db
    .select({ session: trainingSessions, creatorName: users.name })
    .from(trainingSessions)
    .leftJoin(users, eq(users.id, trainingSessions.createdBy))
    .where(and(eq(trainingSessions.id, sessionId), eq(trainingSessions.teamId, teamId)))
    .limit(1);
  if (!row) return null;
  const s = row.session;

  const windowStart = new Date(
    (s.startedAt ?? s.scheduledFor ?? s.createdAt).getTime() - 3 * 24 * 60 * 60 * 1000,
  );

  const [attendees, execRows, anatixRows, dutyRoles, assignments, unlinkedRows] = await Promise.all([
    db
      .select()
      .from(trainingSessionAttendees)
      .where(eq(trainingSessionAttendees.sessionId, s.id))
      .orderBy(asc(trainingSessionAttendees.checkedInAt)),
    db.select().from(testExecutions).where(eq(testExecutions.trainingSessionId, s.id)),
    db
      .select({
        id: anatixSessions.id,
        labId: anatixSessions.labId,
        labName: anatixLabs.name,
        robotName: anatixSessions.robotName,
        frameCount: anatixSessions.frameCount,
        startedAt: anatixSessions.startedAt,
        endedAt: anatixSessions.endedAt,
      })
      .from(anatixSessions)
      .innerJoin(anatixLabs, eq(anatixLabs.id, anatixSessions.labId))
      .where(and(eq(anatixSessions.trainingSessionId, s.id), eq(anatixLabs.teamId, teamId)))
      .orderBy(asc(anatixSessions.startedAt)),
    getTeamDutyRoles(teamId, { includeArchived: true }),
    db
      .select()
      .from(sessionDutyAssignments)
      .where(eq(sessionDutyAssignments.sessionId, s.id))
      .orderBy(asc(sessionDutyAssignments.createdAt)),
    db
      .select({ execution: testExecutions })
      .from(testExecutions)
      .innerJoin(tests, eq(tests.id, testExecutions.testId))
      .where(
        and(
          eq(tests.teamId, teamId),
          isNull(testExecutions.trainingSessionId),
          gte(testExecutions.createdAt, windowStart),
        ),
      )
      .orderBy(desc(testExecutions.createdAt))
      .limit(40),
  ]);

  const assignmentDTOs: DutyAssignmentDTO[] = assignments.map((a) => ({
    id: a.id,
    dutyRoleId: a.dutyRoleId,
    userId: a.userId,
    round: a.round,
  }));

  return {
    session: {
      id: s.id,
      teamId: s.teamId,
      title: s.title,
      kind: s.kind,
      status: s.status,
      location: s.location,
      notes: s.notes,
      scheduledFor: iso(s.scheduledFor),
      startedAt: iso(s.startedAt),
      endedAt: iso(s.endedAt),
      createdBy: s.createdBy,
      creatorName: row.creatorName,
      calendarEventId: s.calendarEventId,
      roundCount: s.roundCount,
      currentRound: s.currentRound,
      rosterPublishedAt: iso(s.rosterPublishedAt),
      rosterDirty: s.rosterPublishedAt !== null && !sameRoster(s.rosterSnapshot ?? null, assignmentDTOs),
      summary: (s.summary ?? {}) as Partial<TrainingSummary>,
    },
    attendees: attendees.map((a) => ({ userId: a.userId, checkedInAt: a.checkedInAt.toISOString() })),
    executions: await toExecutionDTOs(execRows),
    anatix: anatixRows.map((a) => ({
      ...a,
      startedAt: a.startedAt.toISOString(),
      endedAt: iso(a.endedAt),
    })),
    dutyRoles,
    assignments: assignmentDTOs,
    unlinkedExecutions: await toExecutionDTOs(unlinkedRows.map((r) => r.execution)),
  };
}

// ---------------------------------------------------------------------------
// Escala fora da sessão
// ---------------------------------------------------------------------------

/** "Suas próximas funções": escalas publicadas de sessões ainda não encerradas. */
export async function getUpcomingDutiesFor(teamId: string, userId: string): Promise<UpcomingDuty[]> {
  const rows = await db
    .select({
      sessionId: trainingSessions.id,
      title: trainingSessions.title,
      scheduledFor: trainingSessions.scheduledFor,
      startedAt: trainingSessions.startedAt,
      label: teamDutyRoles.label,
      position: teamDutyRoles.position,
      round: sessionDutyAssignments.round,
    })
    .from(sessionDutyAssignments)
    .innerJoin(trainingSessions, eq(trainingSessions.id, sessionDutyAssignments.sessionId))
    .innerJoin(teamDutyRoles, eq(teamDutyRoles.id, sessionDutyAssignments.dutyRoleId))
    .where(
      and(
        eq(trainingSessions.teamId, teamId),
        eq(sessionDutyAssignments.userId, userId),
        ne(trainingSessions.status, "encerrada"),
        sql`${trainingSessions.rosterPublishedAt} is not null`,
      ),
    )
    .orderBy(
      sql`coalesce(${trainingSessions.startedAt}, ${trainingSessions.scheduledFor}) asc nulls last`,
      asc(teamDutyRoles.position),
      asc(sessionDutyAssignments.round),
    )
    .limit(60);

  const bySession = new Map<string, UpcomingDuty>();
  for (const r of rows) {
    let s = bySession.get(r.sessionId);
    if (!s) {
      s = { sessionId: r.sessionId, sessionTitle: r.title, when: iso(r.startedAt ?? r.scheduledFor), duties: [] };
      bySession.set(r.sessionId, s);
    }
    let d = s.duties.find((x) => x.label === r.label);
    if (!d) {
      d = { label: r.label, rounds: [] };
      s.duties.push(d);
    }
    d.rounds.push(r.round);
  }
  return [...bySession.values()].slice(0, 5);
}

/**
 * Histórico de funções por membro (só sessões encerradas): cada linha da
 * escala conta uma vez — uma rodada, ou a sessão inteira.
 */
export async function getMemberDutyHistory(teamId: string): Promise<MemberDutyHistory> {
  const rows = await db
    .select({
      userId: sessionDutyAssignments.userId,
      label: teamDutyRoles.label,
      position: teamDutyRoles.position,
      total: sql<number>`count(*)::int`,
    })
    .from(sessionDutyAssignments)
    .innerJoin(trainingSessions, eq(trainingSessions.id, sessionDutyAssignments.sessionId))
    .innerJoin(teamDutyRoles, eq(teamDutyRoles.id, sessionDutyAssignments.dutyRoleId))
    .where(and(eq(trainingSessions.teamId, teamId), eq(trainingSessions.status, "encerrada")))
    .groupBy(sessionDutyAssignments.userId, teamDutyRoles.label, teamDutyRoles.position)
    .orderBy(desc(sql`count(*)`), asc(teamDutyRoles.position));

  const out: MemberDutyHistory = {};
  for (const r of rows) {
    (out[r.userId] ??= []).push({ label: r.label, count: Number(r.total) });
  }
  return out;
}

/** Sessões ligadas a um evento do calendário (para o botão no evento). */
export async function getSessionsForCalendarEvent(teamId: string, eventId: string) {
  return db
    .select({ id: trainingSessions.id, status: trainingSessions.status })
    .from(trainingSessions)
    .where(
      and(
        eq(trainingSessions.teamId, teamId),
        eq(trainingSessions.calendarEventId, eventId),
        or(eq(trainingSessions.status, "planejada"), eq(trainingSessions.status, "em_andamento")),
      ),
    )
    .limit(1);
}

/** Quem marcou presença numa sessão (anel colorido no "Na equipe agora"). */
export async function getSessionAttendeeIds(sessionId: string): Promise<string[]> {
  const rows = await db
    .select({ userId: trainingSessionAttendees.userId })
    .from(trainingSessionAttendees)
    .where(eq(trainingSessionAttendees.sessionId, sessionId));
  return rows.map((r) => r.userId);
}
