"use server";

import { revalidatePath } from "next/cache";
import { and, asc, count, eq, isNull, max, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  sessionDutyAssignments,
  teamDutyRoles,
  teamMembers,
  tests,
  trainingSessions,
  users,
  type TrainingSessionRow,
} from "@/db/schema";
import { requireTeamAccess, StagebookAuthError, type TeamScope } from "../scope";
import { requireCapability } from "../permissions";
import { runAction, type ActionResult } from "../action-result";
import { canEditRoster, CAPABILITY_DENIED_MESSAGE } from "../team-permissions";
import { normalizeHexColor } from "../label-colors";
import { recordTeamActivity } from "../team-activity";
import { notifyEach } from "../notify-internal";
import { getActiveTrainingSession } from "../training-core";
import { snapshotKey } from "../training-queries";
import { ValidationError, optionalText, requireText, requireUuid } from "../validation";
import { sessionKindLabel, type ActiveSessionRef } from "@/types/training";

/**
 * Escala de funções: catálogo da equipe (`team_duty_roles`) e quem faz o quê
 * em cada sessão/rodada (`session_duty_assignments`).
 *
 *  - Catálogo: só técnico/mentor (`roster.manage`).
 *  - Escala de treino/simulado: qualquer membro. De competição: técnico/mentor.
 *  - Publicar avisa os escalados; republicar avisa só quem entrou, saiu ou mudou.
 */

const MAX_ROUNDS = 12;

function refresh(teamId: string, sessionId?: string) {
  revalidatePath(`/dashboard/team/${teamId}`);
  if (sessionId) revalidatePath(`/dashboard/team/${teamId}/treinos/${sessionId}`);
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

/** Sessão cuja escala o usuário pode editar (regra muda em competições). */
async function requireRosterSession(teamId: unknown, sessionId: unknown) {
  const scope = await requireTeamAccess(teamId);
  const session = await requireSession(scope, sessionId);
  if (!canEditRoster(scope.role, session.kind)) {
    throw new StagebookAuthError(CAPABILITY_DENIED_MESSAGE["roster.manage"]);
  }
  if (session.status === "encerrada") {
    throw new ValidationError("A sessão já foi encerrada; a escala não pode mais mudar.");
  }
  return { scope, session };
}

function parseRound(value: unknown, roundCount: number): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > Math.max(roundCount, 1) || n > MAX_ROUNDS) {
    throw new ValidationError("Rodada inválida.");
  }
  return n;
}

function parseMaxPerSlot(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 20) throw new ValidationError("Limite por rodada inválido.");
  return n;
}

// ---------------------------------------------------------------------------
// Catálogo de funções
// ---------------------------------------------------------------------------

export async function createDutyRole(
  teamId: string,
  input: { label: string; description?: string | null; color?: string | null; maxPerSlot?: number | null },
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const scope = await requireTeamAccess(teamId);
    requireCapability(scope, "roster.manage");
    const label = requireText(input.label, "o nome da função", { maxLength: 60 });

    const [clash] = await db
      .select({ id: teamDutyRoles.id, archivedAt: teamDutyRoles.archivedAt })
      .from(teamDutyRoles)
      .where(and(eq(teamDutyRoles.teamId, scope.teamId), sql`lower(${teamDutyRoles.label}) = ${label.toLowerCase()}`))
      .limit(1);
    if (clash) {
      throw new ValidationError(
        clash.archivedAt
          ? "Já existe uma função arquivada com esse nome. Restaure-a em vez de criar outra."
          : "Já existe uma função com esse nome.",
      );
    }

    const [{ next }] = await db
      .select({ next: sql<number>`coalesce(${max(teamDutyRoles.position)}, 0) + 10` })
      .from(teamDutyRoles)
      .where(eq(teamDutyRoles.teamId, scope.teamId));

    const [created] = await db
      .insert(teamDutyRoles)
      .values({
        teamId: scope.teamId,
        label,
        description: optionalText(input.description, 200),
        color: normalizeHexColor(input.color ?? null),
        maxPerSlot: parseMaxPerSlot(input.maxPerSlot),
        position: Number(next),
      })
      .returning({ id: teamDutyRoles.id });
    refresh(scope.teamId);
    return created;
  });
}

export async function updateDutyRole(
  teamId: string,
  dutyRoleId: string,
  input: {
    label?: string;
    description?: string | null;
    color?: string | null;
    maxPerSlot?: number | null;
    position?: number;
    archived?: boolean;
  },
): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await requireTeamAccess(teamId);
    requireCapability(scope, "roster.manage");
    const id = requireUuid(dutyRoleId, "função");
    const [role] = await db
      .select()
      .from(teamDutyRoles)
      .where(and(eq(teamDutyRoles.id, id), eq(teamDutyRoles.teamId, scope.teamId)))
      .limit(1);
    if (!role) throw new ValidationError("Função não encontrada nesta equipe.");

    const patch: Partial<typeof teamDutyRoles.$inferInsert> = {};
    if (input.label !== undefined) {
      const label = requireText(input.label, "o nome da função", { maxLength: 60 });
      if (label.toLowerCase() !== role.label.toLowerCase()) {
        const [clash] = await db
          .select({ id: teamDutyRoles.id })
          .from(teamDutyRoles)
          .where(and(eq(teamDutyRoles.teamId, scope.teamId), sql`lower(${teamDutyRoles.label}) = ${label.toLowerCase()}`))
          .limit(1);
        if (clash) throw new ValidationError("Já existe uma função com esse nome.");
      }
      patch.label = label;
    }
    if (input.description !== undefined) patch.description = optionalText(input.description, 200);
    if (input.color !== undefined) patch.color = normalizeHexColor(input.color);
    if (input.maxPerSlot !== undefined) patch.maxPerSlot = parseMaxPerSlot(input.maxPerSlot);
    if (input.position !== undefined && Number.isFinite(input.position)) patch.position = Math.trunc(input.position);
    // Arquivar em vez de excluir: o histórico da escala continua apontando para ela.
    if (input.archived !== undefined) patch.archivedAt = input.archived ? new Date() : null;

    if (Object.keys(patch).length) {
      await db.update(teamDutyRoles).set(patch).where(eq(teamDutyRoles.id, id));
    }
    refresh(scope.teamId);
  });
}

/** Troca a posição de uma função com a vizinha (setas ↑/↓ nas configurações). */
export async function moveDutyRole(
  teamId: string,
  dutyRoleId: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await requireTeamAccess(teamId);
    requireCapability(scope, "roster.manage");
    const id = requireUuid(dutyRoleId, "função");
    const roles = await db
      .select({ id: teamDutyRoles.id, position: teamDutyRoles.position })
      .from(teamDutyRoles)
      .where(and(eq(teamDutyRoles.teamId, scope.teamId), isNull(teamDutyRoles.archivedAt)))
      .orderBy(asc(teamDutyRoles.position), asc(teamDutyRoles.label));
    const index = roles.findIndex((r) => r.id === id);
    if (index < 0) throw new ValidationError("Função não encontrada nesta equipe.");
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= roles.length) return;

    // Reescreve as posições em passos de 10 (resolve empates antigos também).
    const order = roles.map((r) => r.id);
    [order[index], order[swapWith]] = [order[swapWith], order[index]];
    for (const [i, roleId] of order.entries()) {
      await db.update(teamDutyRoles).set({ position: (i + 1) * 10 }).where(eq(teamDutyRoles.id, roleId));
    }
    refresh(scope.teamId);
  });
}

// ---------------------------------------------------------------------------
// Escala da sessão
// ---------------------------------------------------------------------------

export async function assignDuty(
  teamId: string,
  sessionId: string,
  input: { dutyRoleId: string; userId: string; round?: number | null },
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const { scope, session } = await requireRosterSession(teamId, sessionId);
    const dutyRoleId = requireUuid(input.dutyRoleId, "função");
    const userId = requireText(input.userId, "o membro", { maxLength: 100 });
    const round = parseRound(input.round, session.roundCount);

    const [[role], [member]] = await Promise.all([
      db
        .select()
        .from(teamDutyRoles)
        .where(and(eq(teamDutyRoles.id, dutyRoleId), eq(teamDutyRoles.teamId, scope.teamId)))
        .limit(1),
      db
        .select({ userId: teamMembers.userId })
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, scope.teamId), eq(teamMembers.userId, userId)))
        .limit(1),
    ]);
    if (!role || role.archivedAt) throw new ValidationError("Função não encontrada nesta equipe.");
    if (!member) throw new ValidationError("Esta pessoa não é membro da equipe.");

    // Limite por (função, rodada) — "sessão inteira" é a sua própria vaga.
    if (role.maxPerSlot !== null) {
      const [{ taken }] = await db
        .select({ taken: count() })
        .from(sessionDutyAssignments)
        .where(
          and(
            eq(sessionDutyAssignments.sessionId, session.id),
            eq(sessionDutyAssignments.dutyRoleId, role.id),
            round === null ? isNull(sessionDutyAssignments.round) : eq(sessionDutyAssignments.round, round),
          ),
        );
      if (Number(taken) >= role.maxPerSlot) {
        throw new ValidationError(
          `${role.label} aceita no máximo ${role.maxPerSlot} ${role.maxPerSlot === 1 ? "pessoa" : "pessoas"} por ${round === null ? "sessão" : "rodada"}.`,
        );
      }
    }

    const inserted = await db
      .insert(sessionDutyAssignments)
      .values({ sessionId: session.id, dutyRoleId: role.id, userId: member.userId, round, assignedBy: scope.userId })
      .onConflictDoNothing()
      .returning({ id: sessionDutyAssignments.id });
    if (!inserted.length) throw new ValidationError("Esta pessoa já está nessa função.");

    refresh(scope.teamId, session.id);
    return inserted[0];
  });
}

export async function unassignDuty(teamId: string, sessionId: string, assignmentId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { scope, session } = await requireRosterSession(teamId, sessionId);
    const id = requireUuid(assignmentId, "atribuição");
    await db
      .delete(sessionDutyAssignments)
      .where(and(eq(sessionDutyAssignments.id, id), eq(sessionDutyAssignments.sessionId, session.id)));
    refresh(scope.teamId, session.id);
  });
}

/** Quantas rodadas a grade mostra. Reduzir apaga as atribuições das rodadas que somem. */
export async function setRoundCount(teamId: string, sessionId: string, rounds: number): Promise<ActionResult> {
  return runAction(async () => {
    const { scope, session } = await requireRosterSession(teamId, sessionId);
    const n = Math.trunc(Number(rounds));
    if (!Number.isFinite(n) || n < 0 || n > MAX_ROUNDS) throw new ValidationError(`Use de 0 a ${MAX_ROUNDS} rodadas.`);
    if (n < session.roundCount) {
      await db
        .delete(sessionDutyAssignments)
        .where(and(eq(sessionDutyAssignments.sessionId, session.id), sql`${sessionDutyAssignments.round} > ${n}`));
    }
    await db
      .update(trainingSessions)
      .set({
        roundCount: n,
        currentRound: session.currentRound && session.currentRound > n ? null : session.currentRound,
        updatedAt: new Date(),
      })
      .where(eq(trainingSessions.id, session.id));
    refresh(scope.teamId, session.id);
  });
}

/** Rodada acontecendo agora (sugere o operador das execuções). Qualquer membro muda. */
export async function setCurrentRound(
  teamId: string,
  sessionId: string,
  round: number | null,
): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await requireTeamAccess(teamId);
    requireCapability(scope, "session.run");
    const session = await requireSession(scope, sessionId);
    const value = parseRound(round, session.roundCount);
    await db
      .update(trainingSessions)
      .set({ currentRound: value, updatedAt: new Date() })
      .where(eq(trainingSessions.id, session.id));
    refresh(scope.teamId, session.id);
  });
}

function describeRounds(rounds: (number | null)[]): string {
  const specific = rounds.filter((r): r is number => r !== null).sort((a, b) => a - b);
  if (rounds.includes(null) || specific.length === 0) return "na sessão inteira";
  if (specific.length === 1) return `na rodada ${specific[0]}`;
  return `nas rodadas ${specific.slice(0, -1).join(", ")} e ${specific[specific.length - 1]}`;
}

function describeWhen(session: TrainingSessionRow): string {
  const date = session.startedAt ?? session.scheduledFor;
  if (!date) return "";
  return `, ${date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  })}`;
}

/**
 * Publica a escala: na primeira vez avisa todos os escalados; nas seguintes,
 * só quem entrou, saiu ou teve a função/rodada alterada.
 */
export async function publishRoster(
  teamId: string,
  sessionId: string,
): Promise<ActionResult<{ notified: number }>> {
  return runAction(async () => {
    const { scope, session } = await requireRosterSession(teamId, sessionId);

    const rows = await db
      .select({
        userId: sessionDutyAssignments.userId,
        dutyRoleId: sessionDutyAssignments.dutyRoleId,
        round: sessionDutyAssignments.round,
        label: teamDutyRoles.label,
        position: teamDutyRoles.position,
      })
      .from(sessionDutyAssignments)
      .innerJoin(teamDutyRoles, eq(teamDutyRoles.id, sessionDutyAssignments.dutyRoleId))
      .where(eq(sessionDutyAssignments.sessionId, session.id))
      .orderBy(asc(teamDutyRoles.position), asc(sessionDutyAssignments.round));

    if (rows.length === 0 && !session.rosterPublishedAt) {
      throw new ValidationError("Escale ao menos uma pessoa antes de publicar.");
    }

    const snapshot = rows.map(({ userId, dutyRoleId, round }) => ({ userId, dutyRoleId, round }));
    const previous = session.rosterSnapshot ?? [];
    const firstPublish = session.rosterPublishedAt === null;

    // Quem mudou: conjunto de linhas diferente entre a publicação anterior e agora.
    const keysOf = (list: typeof snapshot, userId: string) =>
      list.filter((x) => x.userId === userId).map(snapshotKey).sort().join(",");
    const everyone = new Set([...snapshot.map((x) => x.userId), ...previous.map((x) => x.userId)]);
    const changed = [...everyone].filter((u) => firstPublish || keysOf(snapshot, u) !== keysOf(previous, u));

    const when = describeWhen(session);
    const kind = sessionKindLabel(session.kind).toLowerCase();
    const link = { teamId: scope.teamId, sessionId: session.id };

    const notices = changed.map((userId) => {
      const mine = rows.filter((r) => r.userId === userId);
      if (mine.length === 0) {
        return {
          userId,
          type: "roster",
          title: `Você saiu da escala de ${session.title}`,
          message: `A escala do ${kind} ${session.title}${when} foi atualizada.`,
          data: link,
        };
      }
      const byLabel = new Map<string, (number | null)[]>();
      for (const r of mine) byLabel.set(r.label, [...(byLabel.get(r.label) ?? []), r.round]);
      const parts = [...byLabel.entries()].map(([label, rounds]) => `${label} ${describeRounds(rounds)}`);
      return {
        userId,
        type: "roster",
        title: `Escala: ${session.title}`,
        message: `Você é ${parts.join("; ")} do ${kind} ${session.title}${when}.`,
        data: link,
      };
    });

    const now = new Date();
    await db
      .update(trainingSessions)
      .set({ rosterPublishedAt: now, rosterSnapshot: snapshot, updatedAt: now })
      .where(eq(trainingSessions.id, session.id));

    await notifyEach(notices);
    await recordTeamActivity({
      teamId: scope.teamId,
      actorId: scope.userId,
      verb: firstPublish ? "roster.published" : "roster.updated",
      entityType: "session",
      entityId: session.id,
      data: { title: session.title, people: new Set(snapshot.map((x) => x.userId)).size, notified: notices.length },
      aggregate: !firstPublish,
    });

    refresh(scope.teamId, session.id);
    revalidatePath("/dashboard", "layout");
    return { notified: notices.length };
  });
}

// ---------------------------------------------------------------------------
// Tela de execução do LabTest: sessão ativa + operador sugerido pela escala
// ---------------------------------------------------------------------------

export type ExecutionContext = {
  session: (ActiveSessionRef & { currentRound: number | null }) | null;
  members: { userId: string; name: string | null }[];
  viewerId: string | null;
  suggestedOperatorId: string | null;
  suggestedDuty: string | null;
};

/**
 * Para testes de equipe: a sessão em andamento (banner), os membros (para
 * escolher o operador) e o operador sugerido — quem está escalado na
 * primeira função do catálogo (Piloto/Operador) na rodada atual, ou na
 * sessão inteira. Testes pessoais devolvem tudo vazio.
 */
function sessionRef(active: TrainingSessionRow): NonNullable<ExecutionContext["session"]> {
  return {
    id: active.id,
    teamId: active.teamId,
    title: active.title,
    kind: active.kind,
    startedAt: active.startedAt?.toISOString() ?? null,
    currentRound: active.currentRound,
  };
}

export async function getExecutionContext(testId: string): Promise<ExecutionContext> {
  const empty: ExecutionContext = {
    session: null,
    members: [],
    viewerId: null,
    suggestedOperatorId: null,
    suggestedDuty: null,
  };
  try {
    const [test] = await db
      .select({ teamId: tests.teamId })
      .from(tests)
      .where(eq(tests.id, requireUuid(testId, "teste")))
      .limit(1);
    if (!test?.teamId) return empty;
    const scope = await requireTeamAccess(test.teamId);

    const [members, active] = await Promise.all([
      db
        .select({ userId: users.id, name: users.name })
        .from(teamMembers)
        .innerJoin(users, eq(users.id, teamMembers.userId))
        .where(eq(teamMembers.teamId, scope.teamId))
        .orderBy(asc(users.name)),
      getActiveTrainingSession(scope.teamId),
    ]);
    if (!active) return { ...empty, members, viewerId: scope.userId };

    const round = active.currentRound;
    const [firstRole] = await db
      .select({ id: teamDutyRoles.id })
      .from(teamDutyRoles)
      .where(and(eq(teamDutyRoles.teamId, scope.teamId), isNull(teamDutyRoles.archivedAt)))
      .orderBy(asc(teamDutyRoles.position), asc(teamDutyRoles.label))
      .limit(1);
    if (!firstRole) return { ...empty, members, viewerId: scope.userId, session: sessionRef(active) };

    const [suggestion] = await db
      .select({ userId: sessionDutyAssignments.userId, label: teamDutyRoles.label })
      .from(sessionDutyAssignments)
      .innerJoin(teamDutyRoles, eq(teamDutyRoles.id, sessionDutyAssignments.dutyRoleId))
      .where(
        and(
          eq(sessionDutyAssignments.sessionId, active.id),
          eq(sessionDutyAssignments.dutyRoleId, firstRole.id),
          round === null
            ? isNull(sessionDutyAssignments.round)
            : or(eq(sessionDutyAssignments.round, round), isNull(sessionDutyAssignments.round)),
        ),
      )
      // A rodada específica vence a "sessão inteira".
      .orderBy(sql`${sessionDutyAssignments.round} is null`, asc(sessionDutyAssignments.createdAt))
      .limit(1);

    return {
      session: sessionRef(active),
      members,
      viewerId: scope.userId,
      suggestedOperatorId: suggestion?.userId ?? null,
      suggestedDuty: suggestion?.label ?? null,
    };
  } catch {
    return empty;
  }
}
