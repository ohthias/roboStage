"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
  anatixLabs,
  anatixSessions,
  calendarEvents,
  teamMembers,
  testExecutions,
  tests,
  trainingSessionAttendees,
  trainingSessions,
  type TrainingSessionRow,
} from "@/db/schema";
import { requireTeamAccess, StagebookAuthError, type TeamScope } from "../scope";
import { requireCapability } from "../permissions";
import { runAction, type ActionResult } from "../action-result";
import { roleCan } from "../team-permissions";
import { requireMilestoneInScope } from "../labels-core";
import { recordTeamActivity } from "../team-activity";
import {
  closeTrainingSession,
  getActiveTrainingSession,
  isUniqueViolation,
  refreshSessionSummary,
} from "../training-core";
import { getTeamActivity } from "../team-queries";
import {
  ValidationError,
  optionalDate,
  optionalText,
  optionalUuid,
  requireOneOf,
  requireText,
  requireUuid,
} from "../validation";
import { SESSION_KINDS, type ActiveSessionRef, type TeamActivityItem } from "@/types/training";

/**
 * Sessões de treino da equipe. Toda action recebe o `teamId` explícito (a
 * página da equipe pode estar aberta numa equipe diferente do espaço ativo),
 * valida que o usuário é membro e só toca em sessões DESSA equipe.
 */

const ACTIVE_CONFLICT =
  "Já existe uma sessão em andamento nesta equipe. Encerre-a antes de iniciar outra.";

function refresh(teamId: string, sessionId?: string) {
  revalidatePath(`/dashboard/team/${teamId}`);
  if (sessionId) revalidatePath(`/dashboard/team/${teamId}/treinos/${sessionId}`);
  revalidatePath("/dashboard", "layout");
}

async function sessionScope(teamId: unknown) {
  const scope = await requireTeamAccess(teamId);
  requireCapability(scope, "session.run");
  return scope;
}

async function requireSession(scope: TeamScope, sessionId: unknown): Promise<TrainingSessionRow> {
  const id = requireUuid(sessionId, "sessão");
  const [session] = await db
    .select()
    .from(trainingSessions)
    .where(and(eq(trainingSessions.id, id), eq(trainingSessions.teamId, scope.teamId)))
    .limit(1);
  if (!session) throw new ValidationError("Sessão não encontrada nesta equipe.");
  return session;
}

async function requireMember(teamId: string, userId: unknown): Promise<string> {
  const id = requireText(userId, "o membro", { maxLength: 100 });
  const [member] = await db
    .select({ userId: teamMembers.userId })
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, id)))
    .limit(1);
  if (!member) throw new ValidationError("Esta pessoa não é membro da equipe.");
  return member.userId;
}

/** Marca o início; o índice parcial garante uma única sessão ativa por equipe. */
async function markStarted(session: TrainingSessionRow, scope: TeamScope): Promise<TrainingSessionRow> {
  // Antes de tudo: encerra uma sessão esquecida aberta (6 h sem atividade).
  await getActiveTrainingSession(scope.teamId);
  const now = new Date();
  try {
    const [started] = await db
      .update(trainingSessions)
      .set({ status: "em_andamento", startedAt: now, endedAt: null, updatedAt: now })
      .where(and(eq(trainingSessions.id, session.id), eq(trainingSessions.status, "planejada")))
      .returning();
    if (!started) throw new ValidationError("Esta sessão já foi iniciada.");

    // Quem inicia está presente.
    await db
      .insert(trainingSessionAttendees)
      .values({ sessionId: session.id, userId: scope.userId })
      .onConflictDoNothing();

    await recordTeamActivity({
      teamId: scope.teamId,
      actorId: scope.userId,
      verb: "session.started",
      entityType: "session",
      entityId: session.id,
      data: { title: session.title, kind: session.kind },
      aggregate: false,
    });
    return started;
  } catch (error) {
    if (isUniqueViolation(error)) throw new ValidationError(ACTIVE_CONFLICT);
    throw error;
  }
}

function parseKind(value: unknown) {
  return requireOneOf(value ?? "treino", SESSION_KINDS, "Tipo de sessão");
}

// ---------------------------------------------------------------------------
// Criar / iniciar / encerrar / excluir
// ---------------------------------------------------------------------------

export async function createTrainingSession(
  teamId: string,
  input: {
    title: string;
    kind?: string;
    scheduledFor?: string | null;
    location?: string | null;
    notes?: string | null;
    milestoneId?: string | null;
    /** Já começa em andamento (atalho "Iniciar agora"). */
    startNow?: boolean;
  },
): Promise<ActionResult<{ id: string; started: boolean; warning: string | null }>> {
  return runAction(async () => {
    const scope = await sessionScope(teamId);
    const title = requireText(input.title, "o título da sessão", { maxLength: 100 });
    const kind = parseKind(input.kind);
    const milestoneId = optionalUuid(input.milestoneId, "marco");
    if (milestoneId) await requireMilestoneInScope(scope, milestoneId);

    const [created] = await db
      .insert(trainingSessions)
      .values({
        teamId: scope.teamId,
        title,
        kind,
        status: "planejada",
        scheduledFor: optionalDate(input.scheduledFor),
        location: optionalText(input.location, 120),
        notes: optionalText(input.notes, 4000),
        milestoneId,
        createdBy: scope.userId,
      })
      .returning();

    await recordTeamActivity({
      teamId: scope.teamId,
      actorId: scope.userId,
      verb: "session.created",
      entityType: "session",
      entityId: created.id,
      data: { title, kind, scheduledFor: created.scheduledFor?.toISOString() ?? null },
      aggregate: false,
    });

    let started = false;
    let warning: string | null = null;
    if (input.startNow) {
      try {
        await markStarted(created, scope);
        started = true;
      } catch (error) {
        // A sessão fica criada (planejada) e o aviso explica por que não começou.
        if (!(error instanceof ValidationError)) throw error;
        warning = error.message;
      }
    }

    refresh(scope.teamId, created.id);
    return { id: created.id, started, warning };
  });
}

export async function startTrainingSession(teamId: string, sessionId: string): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await sessionScope(teamId);
    const session = await requireSession(scope, sessionId);
    if (session.status === "encerrada") throw new ValidationError("Esta sessão já foi encerrada.");
    if (session.status === "em_andamento") return;
    await markStarted(session, scope);
    refresh(scope.teamId, session.id);
  });
}

export async function endTrainingSession(teamId: string, sessionId: string): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await sessionScope(teamId);
    const session = await requireSession(scope, sessionId);
    if (session.status !== "em_andamento") {
      throw new ValidationError("Só uma sessão em andamento pode ser encerrada.");
    }
    await closeTrainingSession(session, { actorId: scope.userId });
    refresh(scope.teamId, session.id);
  });
}

export async function updateTrainingSession(
  teamId: string,
  sessionId: string,
  input: {
    title?: string;
    kind?: string;
    scheduledFor?: string | null;
    location?: string | null;
    notes?: string | null;
  },
): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await sessionScope(teamId);
    const session = await requireSession(scope, sessionId);
    const patch: Partial<typeof trainingSessions.$inferInsert> = { updatedAt: new Date() };
    if (input.title !== undefined) patch.title = requireText(input.title, "o título da sessão", { maxLength: 100 });
    if (input.kind !== undefined) {
      const kind = parseKind(input.kind);
      // Mudar de/para competição muda quem pode editar a escala.
      if ((kind === "competicao" || session.kind === "competicao") && kind !== session.kind) {
        requireCapability(scope, "roster.manage");
      }
      patch.kind = kind;
    }
    if (input.scheduledFor !== undefined) patch.scheduledFor = optionalDate(input.scheduledFor);
    if (input.location !== undefined) patch.location = optionalText(input.location, 120);
    if (input.notes !== undefined) patch.notes = optionalText(input.notes, 4000);

    await db.update(trainingSessions).set(patch).where(eq(trainingSessions.id, session.id));
    refresh(scope.teamId, session.id);
  });
}

export async function deleteTrainingSession(teamId: string, sessionId: string): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await sessionScope(teamId);
    const session = await requireSession(scope, sessionId);
    if (session.createdBy !== scope.userId && !roleCan(scope.role, "session.delete.any")) {
      throw new StagebookAuthError(
        "Só quem criou a sessão, técnicos e mentores podem excluí-la.",
      );
    }
    // Execuções e sessões Anatix continuam existindo (FK `set null`).
    await db.delete(trainingSessions).where(eq(trainingSessions.id, session.id));
    await recordTeamActivity({
      teamId: scope.teamId,
      actorId: scope.userId,
      verb: "session.deleted",
      entityType: "session",
      entityId: session.id,
      data: { title: session.title, kind: session.kind },
      aggregate: false,
    });
    refresh(scope.teamId);
  });
}

// ---------------------------------------------------------------------------
// Presença
// ---------------------------------------------------------------------------

/** Marca presença. Sem `userId`, marca a do próprio usuário ("Estou aqui"). */
export async function checkIn(
  teamId: string,
  sessionId: string,
  userId?: string | null,
): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await sessionScope(teamId);
    const session = await requireSession(scope, sessionId);
    if (session.status === "encerrada") throw new ValidationError("A sessão já foi encerrada.");
    const target = userId ? await requireMember(scope.teamId, userId) : scope.userId;

    const inserted = await db
      .insert(trainingSessionAttendees)
      .values({ sessionId: session.id, userId: target })
      .onConflictDoNothing()
      .returning({ userId: trainingSessionAttendees.userId });

    if (inserted.length && target === scope.userId) {
      await recordTeamActivity({
        teamId: scope.teamId,
        actorId: scope.userId,
        verb: "session.checked_in",
        entityType: "session",
        entityId: session.id,
        data: { title: session.title },
      });
    }
    refresh(scope.teamId, session.id);
  });
}

export async function removeAttendee(
  teamId: string,
  sessionId: string,
  userId: string,
): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await sessionScope(teamId);
    const session = await requireSession(scope, sessionId);
    const target = requireText(userId, "o membro", { maxLength: 100 });
    await db
      .delete(trainingSessionAttendees)
      .where(
        and(eq(trainingSessionAttendees.sessionId, session.id), eq(trainingSessionAttendees.userId, target)),
      );
    if (session.status === "encerrada") await refreshSessionSummary(session.id);
    refresh(scope.teamId, session.id);
  });
}

// ---------------------------------------------------------------------------
// Vínculo manual de execuções (correção)
// ---------------------------------------------------------------------------

/** Execuções informadas que pertencem a testes DESTA equipe. */
async function requireTeamExecutions(teamId: string, executionIds: unknown): Promise<string[]> {
  const list = Array.isArray(executionIds) ? executionIds : [executionIds];
  const ids = [...new Set(list.map((id) => requireUuid(id, "execução")))];
  if (ids.length === 0) throw new ValidationError("Escolha ao menos uma execução.");
  if (ids.length > 200) throw new ValidationError("Escolha no máximo 200 execuções por vez.");
  const rows = await db
    .select({ id: testExecutions.id, sessionId: testExecutions.trainingSessionId })
    .from(testExecutions)
    .innerJoin(tests, eq(tests.id, testExecutions.testId))
    .where(and(inArray(testExecutions.id, ids), eq(tests.teamId, teamId)));
  if (rows.length !== ids.length) throw new ValidationError("Execução não encontrada nesta equipe.");
  return ids;
}

export async function linkExecution(
  teamId: string,
  sessionId: string,
  executionIds: string | string[],
): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await sessionScope(teamId);
    const session = await requireSession(scope, sessionId);
    const ids = await requireTeamExecutions(scope.teamId, executionIds);

    const previous = await db
      .selectDistinct({ sessionId: testExecutions.trainingSessionId })
      .from(testExecutions)
      .where(inArray(testExecutions.id, ids));

    await db
      .update(testExecutions)
      .set({ trainingSessionId: session.id })
      .where(inArray(testExecutions.id, ids));

    for (const p of previous) if (p.sessionId && p.sessionId !== session.id) await refreshSessionSummary(p.sessionId);
    await refreshSessionSummary(session.id);
    refresh(scope.teamId, session.id);
  });
}

export async function unlinkExecution(
  teamId: string,
  sessionId: string,
  executionIds: string | string[],
): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await sessionScope(teamId);
    const session = await requireSession(scope, sessionId);
    const ids = await requireTeamExecutions(scope.teamId, executionIds);
    await db
      .update(testExecutions)
      .set({ trainingSessionId: null })
      .where(and(inArray(testExecutions.id, ids), eq(testExecutions.trainingSessionId, session.id)));
    await refreshSessionSummary(session.id);
    refresh(scope.teamId, session.id);
  });
}

/** Desvincula uma sessão Anatix (ex.: conexão de teste feita fora do treino). */
export async function unlinkAnatixSession(
  teamId: string,
  sessionId: string,
  anatixSessionId: string,
): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await sessionScope(teamId);
    const session = await requireSession(scope, sessionId);
    const id = requireUuid(anatixSessionId, "sessão Anatix");
    const [row] = await db
      .select({ id: anatixSessions.id })
      .from(anatixSessions)
      .innerJoin(anatixLabs, eq(anatixLabs.id, anatixSessions.labId))
      .where(
        and(
          eq(anatixSessions.id, id),
          eq(anatixSessions.trainingSessionId, session.id),
          eq(anatixLabs.teamId, scope.teamId),
        ),
      )
      .limit(1);
    if (!row) throw new ValidationError("Sessão Anatix não encontrada nesta sessão.");
    await db.update(anatixSessions).set({ trainingSessionId: null }).where(eq(anatixSessions.id, id));
    await refreshSessionSummary(session.id);
    refresh(scope.teamId, session.id);
  });
}

// ---------------------------------------------------------------------------
// Calendário
// ---------------------------------------------------------------------------

const EVENT_KIND: Record<string, (typeof SESSION_KINDS)[number]> = {
  treino: "treino",
  competicao: "competicao",
  simulado: "simulado",
};

/**
 * "Iniciar sessão" / "Planejar sessão" num evento de equipe do tipo treino ou
 * competição. Reaproveita a sessão já criada para o evento (se ainda não
 * encerrada); senão cria uma, herdando título, local e horário.
 */
export async function sessionFromCalendarEvent(
  eventId: string,
  { start = false }: { start?: boolean } = {},
): Promise<ActionResult<{ teamId: string; sessionId: string }>> {
  return runAction(async () => {
    const id = requireUuid(eventId, "evento");
    const [event] = await db
      .select({
        id: calendarEvents.id,
        teamId: calendarEvents.teamId,
        title: calendarEvents.title,
        type: calendarEvents.type,
        location: calendarEvents.location,
        startAt: calendarEvents.startAt,
        milestoneId: calendarEvents.milestoneId,
      })
      .from(calendarEvents)
      .where(eq(calendarEvents.id, id))
      .limit(1);
    if (!event?.teamId) throw new ValidationError("Só eventos de equipe viram sessões de treino.");
    const kind = EVENT_KIND[event.type];
    if (!kind) throw new ValidationError("Só eventos de treino ou competição viram sessões.");

    const scope = await sessionScope(event.teamId);

    const [existing] = await db
      .select()
      .from(trainingSessions)
      .where(
        and(
          eq(trainingSessions.teamId, scope.teamId),
          eq(trainingSessions.calendarEventId, event.id),
          inArray(trainingSessions.status, ["planejada", "em_andamento"]),
        ),
      )
      .limit(1);

    let session = existing;
    if (!session) {
      [session] = await db
        .insert(trainingSessions)
        .values({
          teamId: scope.teamId,
          title: event.title.slice(0, 100),
          kind,
          status: "planejada",
          calendarEventId: event.id,
          milestoneId: event.milestoneId,
          location: event.location,
          scheduledFor: event.startAt,
          createdBy: scope.userId,
        })
        .returning();
      await recordTeamActivity({
        teamId: scope.teamId,
        actorId: scope.userId,
        verb: "session.created",
        entityType: "session",
        entityId: session.id,
        data: { title: session.title, kind, scheduledFor: event.startAt.toISOString() },
        aggregate: false,
      });
    }

    if (start && session.status === "planejada") await markStarted(session, scope);

    refresh(scope.teamId, session.id);
    return { teamId: scope.teamId, sessionId: session.id };
  });
}

// ---------------------------------------------------------------------------
// Leituras para telas fora da equipe (banner do LabTest/Anatix, feed)
// ---------------------------------------------------------------------------

/**
 * Sessão em andamento da equipe dona de um teste ou laboratório — para o
 * banner "Registrando na sessão X" nas telas do LabTest e do Anatix.
 */
export async function getActiveSessionFor(
  resource: { testId: string } | { labId: string },
): Promise<ActiveSessionRef | null> {
  const lookup = async (): Promise<string | null> => {
    if ("testId" in resource) {
      const [row] = await db
        .select({ teamId: tests.teamId })
        .from(tests)
        .where(eq(tests.id, requireUuid(resource.testId, "teste")))
        .limit(1);
      return row?.teamId ?? null;
    }
    const [row] = await db
      .select({ teamId: anatixLabs.teamId })
      .from(anatixLabs)
      .where(eq(anatixLabs.id, requireUuid(resource.labId, "laboratório")))
      .limit(1);
    return row?.teamId ?? null;
  };

  try {
    const teamId = await lookup();
    if (!teamId) return null;
    await requireTeamAccess(teamId); // só membros enxergam a sessão
    const active = await getActiveTrainingSession(teamId);
    return active
      ? { id: active.id, teamId, title: active.title, kind: active.kind, startedAt: active.startedAt?.toISOString() ?? null }
      : null;
  } catch {
    return null;
  }
}

/** Mais itens do feed ("carregar mais"). */
export async function loadTeamActivity(
  teamId: string,
  before?: string | null,
): Promise<ActionResult<TeamActivityItem[]>> {
  return runAction(async () => {
    const scope = await requireTeamAccess(teamId);
    const cursor = optionalDate(before);
    return getTeamActivity(scope.teamId, { before: cursor, limit: 30 });
  });
}
