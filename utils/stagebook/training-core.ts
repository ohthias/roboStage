import "server-only";

import { and, asc, desc, eq, inArray, isNotNull, lt, ne, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  anatixSessions,
  sessionDutyAssignments,
  teamDutyRoles,
  testExecutions,
  tests,
  trainingSessionAttendees,
  trainingSessions,
  type TrainingSessionRow,
} from "@/db/schema";
import { MISSIONS_CATALOG } from "@/utils/data/static-data";
import { buildLabTestViewData } from "@/utils/labtest/view-data";
import { scoreEntries } from "@/utils/labtest/execution-score";
import type { FllMissionDefinition } from "@/utils/labtest/fll";
import type { TrainingSummary } from "@/types/training";
import { recordTeamActivity } from "./team-activity";

/**
 * Núcleo das sessões de treino (sem "use server": só é chamado por actions
 * que já validaram o escopo da equipe).
 */

/** Sessão em andamento sem nenhuma atividade há mais que isso encerra sozinha. */
export const SESSION_IDLE_AUTO_END_MS = 6 * 60 * 60 * 1000;

const round2 = (n: number) => Math.round(n * 100) / 100;
const avgOf = (values: number[]) =>
  values.length ? round2(values.reduce((a, b) => a + b, 0) / values.length) : null;

export function isUniqueViolation(error: unknown): boolean {
  // Neon expõe o SQLSTATE em `code`; o Drizzle embrulha o erro em `cause`.
  for (let current = error, depth = 0; current && depth < 4; depth++) {
    if ((current as { code?: unknown }).code === "23505") return true;
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Sessão ativa + encerramento automático
// ---------------------------------------------------------------------------

/**
 * Momento da última atividade de uma sessão: início, check-in, execução
 * vinculada, sessão Anatix vinculada ou frame recebido nela.
 */
export async function lastSessionActivity(session: TrainingSessionRow): Promise<Date> {
  const [row] = await db
    .select({
      // Aliases explícitos: o Drizzle não qualifica colunas dentro de `sql` em
      // consultas de uma tabela só, e "id"/"created_at" ficariam ambíguos.
      last: sql<string | null>`greatest(
        (select max(te.created_at) from test_executions te where te.training_session_id = ${session.id}),
        (select max(ta.checked_in_at) from training_session_attendees ta where ta.session_id = ${session.id}),
        (select max(coalesce(an.ended_at, an.started_at)) from anatix_sessions an where an.training_session_id = ${session.id}),
        (select max(af.created_at) from anatix_frames af
           inner join anatix_sessions an2 on an2.id = af.session_id
           where an2.training_session_id = ${session.id})
      )`,
    })
    .from(trainingSessions)
    .where(eq(trainingSessions.id, session.id));

  const candidates = [session.startedAt, session.updatedAt, row?.last ? new Date(row.last) : null]
    .filter((d): d is Date => d instanceof Date && !Number.isNaN(d.getTime()));
  return new Date(Math.max(...candidates.map((d) => d.getTime())));
}

/**
 * A sessão em andamento da equipe (no máximo uma, pelo índice parcial).
 * Se ela estiver parada há mais de `SESSION_IDLE_AUTO_END_MS`, é encerrada
 * agora (com fim no momento da última atividade) e a função devolve null —
 * assim um treino esquecido aberto não captura os dados do dia seguinte.
 */
export async function getActiveTrainingSession(
  teamId: string,
  now: Date = new Date(),
): Promise<TrainingSessionRow | null> {
  const [active] = await db
    .select()
    .from(trainingSessions)
    .where(and(eq(trainingSessions.teamId, teamId), eq(trainingSessions.status, "em_andamento")))
    .limit(1);
  if (!active) return null;

  const last = await lastSessionActivity(active);
  if (now.getTime() - last.getTime() > SESSION_IDLE_AUTO_END_MS) {
    await closeTrainingSession(active, { endedAt: last, actorId: null, auto: true });
    return null;
  }
  return active;
}

/** Id da sessão ativa da equipe, para o vínculo automático (null fora de equipe). */
export async function activeSessionIdFor(teamId: string | null | undefined): Promise<string | null> {
  if (!teamId) return null;
  return (await getActiveTrainingSession(teamId))?.id ?? null;
}

/**
 * Encerra a sessão calculando o resumo. Idempotente: só a primeira chamada
 * (status ainda "em_andamento") grava e publica no feed.
 */
export async function closeTrainingSession(
  session: TrainingSessionRow,
  { endedAt = new Date(), actorId, auto = false }: { endedAt?: Date; actorId: string | null; auto?: boolean },
): Promise<TrainingSessionRow | null> {
  const summary = await computeSessionSummary({ ...session, endedAt });
  const [updated] = await db
    .update(trainingSessions)
    .set({ status: "encerrada", endedAt, summary, currentRound: null, updatedAt: new Date() })
    .where(and(eq(trainingSessions.id, session.id), eq(trainingSessions.status, "em_andamento")))
    .returning();
  if (!updated) return null;

  await recordTeamActivity({
    teamId: session.teamId,
    actorId,
    verb: "session.ended",
    entityType: "session",
    entityId: session.id,
    data: {
      title: session.title,
      kind: session.kind,
      auto,
      durationMin: summary.durationMin,
      executions: summary.executions,
      attendees: summary.attendees,
    },
    aggregate: false,
  });
  return updated;
}

/** Recalcula o resumo de uma sessão já encerrada (após vincular/desvincular execuções). */
export async function refreshSessionSummary(sessionId: string): Promise<void> {
  const [session] = await db.select().from(trainingSessions).where(eq(trainingSessions.id, sessionId)).limit(1);
  if (!session || session.status !== "encerrada") return;
  const summary = await computeSessionSummary(session);
  await db
    .update(trainingSessions)
    .set({ summary, updatedAt: new Date() })
    .where(eq(trainingSessions.id, sessionId));
}

// ---------------------------------------------------------------------------
// Pontuação das execuções
// ---------------------------------------------------------------------------

export type ScoredExecution = {
  id: string;
  testId: string;
  testName: string;
  executionNumber: number;
  createdBy: string | null;
  createdAt: Date;
  score: number | null;
};

/**
 * Pontua as execuções informadas com a mesma regra da tela do LabTest
 * (ver `utils/labtest/execution-score.ts`). Agrupa por teste para normalizar
 * cada lançamento com o `config` do próprio teste.
 */
export async function scoreExecutions(
  rows: (typeof testExecutions.$inferSelect)[],
): Promise<ScoredExecution[]> {
  if (rows.length === 0) return [];
  const testIds = [...new Set(rows.map((r) => r.testId))];
  const testRows = await db.select().from(tests).where(inArray(tests.id, testIds));
  const byTest = new Map(testRows.map((t) => [t.id, t]));

  const out: ScoredExecution[] = [];
  for (const testId of testIds) {
    const test = byTest.get(testId);
    if (!test) continue;
    const execs = rows
      .filter((r) => r.testId === testId)
      .sort((a, b) => a.executionNumber - b.executionNumber);
    const view = buildLabTestViewData(test, execs);
    const seasonMissions = test.season
      ? ((MISSIONS_CATALOG[String(test.season)] ?? null) as FllMissionDefinition[] | null)
      : null;
    const scores = scoreEntries(view.test, view.fields, view.entries, seasonMissions);
    for (const exec of execs) {
      out.push({
        id: exec.id,
        testId,
        testName: test.name,
        executionNumber: exec.executionNumber,
        createdBy: exec.createdBy,
        createdAt: exec.createdAt,
        score: scores.get(exec.id) ?? null,
      });
    }
  }
  return out.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

// ---------------------------------------------------------------------------
// Resumo
// ---------------------------------------------------------------------------

/** Média do teste na última sessão encerrada (antes desta) que o rodou. */
async function previousAverages(
  session: Pick<TrainingSessionRow, "id" | "teamId" | "startedAt" | "endedAt" | "createdAt">,
  testIds: string[],
): Promise<Map<string, number | null>> {
  const result = new Map<string, number | null>();
  if (testIds.length === 0) return result;
  const before = session.startedAt ?? session.endedAt ?? session.createdAt;

  const previous = await db
    .select({ summary: trainingSessions.summary })
    .from(trainingSessions)
    .where(
      and(
        eq(trainingSessions.teamId, session.teamId),
        eq(trainingSessions.status, "encerrada"),
        ne(trainingSessions.id, session.id),
        isNotNull(trainingSessions.endedAt),
        lt(trainingSessions.endedAt, before),
      ),
    )
    .orderBy(desc(trainingSessions.endedAt))
    .limit(50);

  for (const testId of testIds) {
    for (const row of previous) {
      const entry = (row.summary as Partial<TrainingSummary>)?.tests?.find((t) => t.testId === testId);
      if (entry) {
        result.set(testId, entry.avg ?? null);
        break;
      }
    }
  }
  return result;
}

export async function computeSessionSummary(
  session: TrainingSessionRow,
): Promise<TrainingSummary> {
  const [execRows, attendeeRows, anatixRows, assignmentRows] = await Promise.all([
    db.select().from(testExecutions).where(eq(testExecutions.trainingSessionId, session.id)),
    db
      .select({ userId: trainingSessionAttendees.userId })
      .from(trainingSessionAttendees)
      .where(eq(trainingSessionAttendees.sessionId, session.id)),
    db
      .select({
        id: anatixSessions.id,
        labId: anatixSessions.labId,
        robotName: anatixSessions.robotName,
        frameCount: anatixSessions.frameCount,
      })
      .from(anatixSessions)
      .where(eq(anatixSessions.trainingSessionId, session.id))
      .orderBy(asc(anatixSessions.startedAt)),
    db
      .select({
        dutyRoleId: sessionDutyAssignments.dutyRoleId,
        label: teamDutyRoles.label,
        userId: sessionDutyAssignments.userId,
        round: sessionDutyAssignments.round,
      })
      .from(sessionDutyAssignments)
      .innerJoin(teamDutyRoles, eq(teamDutyRoles.id, sessionDutyAssignments.dutyRoleId))
      .where(eq(sessionDutyAssignments.sessionId, session.id))
      .orderBy(asc(teamDutyRoles.position)),
  ]);

  const scored = await scoreExecutions(execRows);

  // Por teste
  const testOrder: string[] = [];
  const perTest = new Map<string, { name: string; runs: number; scores: number[] }>();
  for (const exec of scored) {
    let t = perTest.get(exec.testId);
    if (!t) {
      t = { name: exec.testName, runs: 0, scores: [] };
      perTest.set(exec.testId, t);
      testOrder.push(exec.testId);
    }
    t.runs++;
    if (exec.score !== null) t.scores.push(exec.score);
  }
  const prev = await previousAverages(session, testOrder);

  // Por operador
  const perOperator = new Map<string | null, { runs: number; scores: number[] }>();
  for (const exec of scored) {
    const o = perOperator.get(exec.createdBy) ?? { runs: 0, scores: [] };
    o.runs++;
    if (exec.score !== null) o.scores.push(exec.score);
    perOperator.set(exec.createdBy, o);
  }

  // Por função da escala: desempenho de quem estava escalado em cada função.
  const perDuty = new Map<string, { dutyRoleId: string; label: string; userId: string; rounds: number[] }>();
  for (const a of assignmentRows) {
    const key = `${a.dutyRoleId}:${a.userId}`;
    const d = perDuty.get(key) ?? { dutyRoleId: a.dutyRoleId, label: a.label, userId: a.userId, rounds: [] };
    if (a.round !== null && !d.rounds.includes(a.round)) d.rounds.push(a.round);
    perDuty.set(key, d);
  }

  const durationMin =
    session.startedAt && session.endedAt
      ? Math.max(0, Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 60000))
      : null;

  const summary: TrainingSummary = {
    durationMin,
    attendees: attendeeRows.length,
    executions: scored.length,
    tests: testOrder.map((testId) => {
      const t = perTest.get(testId)!;
      return {
        testId,
        name: t.name,
        runs: t.runs,
        best: t.scores.length ? Math.max(...t.scores) : null,
        avg: avgOf(t.scores),
        prevAvg: prev.get(testId) ?? null,
      };
    }),
    anatix: anatixRows.map((a) => ({
      sessionId: a.id,
      labId: a.labId,
      robotName: a.robotName,
      frames: a.frameCount,
    })),
    byOperator: [...perOperator.entries()]
      .map(([userId, o]) => ({ userId, runs: o.runs, avg: avgOf(o.scores) }))
      .sort((a, b) => b.runs - a.runs),
  };

  if (perDuty.size) {
    summary.byDuty = [...perDuty.values()].map((d) => {
      const op = perOperator.get(d.userId);
      return {
        ...d,
        rounds: d.rounds.sort((a, b) => a - b),
        runs: op?.runs ?? 0,
        avg: op ? avgOf(op.scores) : null,
      };
    });
  }

  return summary;
}
