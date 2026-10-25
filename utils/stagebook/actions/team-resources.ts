"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql, type AnyColumn } from "drizzle-orm";
import { db } from "@/db/client";
import { boardColumns, boards, teams, tests, thinklab } from "@/db/schema";
import { requireStagebookAccess, StagebookAuthError } from "../scope";
import { requireCapability, requireTeamScope } from "../permissions";
import { runAction, type ActionResult } from "../action-result";
import { canDeleteResource } from "../team-permissions";
import { requireMilestoneInScope } from "../labels-core";
import {
  ValidationError,
  optionalText,
  optionalUuid,
  requireOneOf,
  requireText,
  requireUuid,
} from "../validation";

/**
 * Criação/exclusão de Kanbans, quadros do ThinkLab e LabTests DENTRO de uma
 * equipe, com `teamId` explícito (a página da equipe pode estar aberta numa
 * equipe diferente do espaço ativo). Regras:
 *
 *  - Todo membro (competidor, colaborador, mentor, técnico) cria.
 *  - Excluir: quem criou, ou técnico/mentor.
 *  - Nome obrigatório e único dentro da equipe, por tipo de recurso.
 *  - Milestone opcional, mas só uma milestone DESTA equipe.
 */

const TEST_MODES = ["runs", "calibrabot", "individual", "custom"] as const;
const TEST_STATUSES = ["planejamento", "em_andamento", "concluido", "cancelado"] as const;

/** Colunas que todo Kanban novo recebe (a equipe renomeia/adiciona depois). */
const DEFAULT_COLUMNS = [
  { name: "A fazer", color: null },
  { name: "Em andamento", color: null },
  { name: "Concluído", color: null },
] as const;
const POSITION_STEP = 1000;

function refresh() {
  revalidatePath("/dashboard", "layout");
}

async function teamScope(teamId: string) {
  const scope = await requireStagebookAccess(requireUuid(teamId, "equipe"));
  requireTeamScope(scope);
  return scope;
}

/** Resolve a milestone (se vier) garantindo que ela pertence à equipe. */
async function resolveMilestoneId(
  scope: Awaited<ReturnType<typeof teamScope>>,
  value: unknown,
): Promise<string | null> {
  const id = optionalUuid(value, "milestone");
  if (!id) return null;
  return (await requireMilestoneInScope(scope, id)).id;
}

/** Comparação de nome sem diferenciar maiúsculas/minúsculas (para detectar duplicados na equipe). */
const sameName = (column: AnyColumn, name: string) =>
  sql`lower(trim(${column})) = ${name.toLowerCase()}`;

// ---------------------------------------------------------------------------
// Kanban
// ---------------------------------------------------------------------------

export async function createTeamBoard(
  teamId: string,
  input: { name: string; description?: string | null },
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const scope = await teamScope(teamId);
    requireCapability(scope, "tool.create");

    const name = requireText(input.name, "o nome do kanban", { maxLength: 100 });
    const description = optionalText(input.description, 500);

    const clash = await db
      .select({ id: boards.id })
      .from(boards)
      .where(and(eq(boards.teamId, scope.teamId), sameName(boards.name, name)))
      .limit(1);
    if (clash.length) throw new ValidationError("Já existe um kanban com esse nome nesta equipe.");

    const created = await db.transaction(async (tx) => {
      const [{ next }] = await tx
        .select({ next: sql<number>`coalesce(max(${boards.position}), 0) + 1` })
        .from(boards)
        .where(eq(boards.teamId, scope.teamId));

      const [board] = await tx
        .insert(boards)
        .values({
          userId: null,
          teamId: scope.teamId,
          name,
          description,
          position: next,
          createdBy: scope.userId,
        })
        .returning({ id: boards.id });

      await tx.insert(boardColumns).values(
        DEFAULT_COLUMNS.map((column, index) => ({
          boardId: board.id,
          name: column.name,
          color: column.color,
          position: (index + 1) * POSITION_STEP,
        })),
      );

      return board;
    });

    refresh();
    return created;
  });
}

export async function deleteTeamBoard(teamId: string, boardId: string): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await teamScope(teamId);
    const id = requireUuid(boardId, "kanban");

    const [board] = await db
      .select({ id: boards.id, createdBy: boards.createdBy })
      .from(boards)
      .where(and(eq(boards.id, id), eq(boards.teamId, scope.teamId)))
      .limit(1);
    if (!board) throw new ValidationError("Kanban não encontrado nesta equipe.");
    if (!canDeleteResource(scope.role, board.createdBy, scope.userId)) {
      throw new StagebookAuthError("Só quem criou o kanban, técnicos e mentores podem excluí-lo.");
    }

    // Colunas, cards e vínculos caem em cascata (FKs).
    await db.delete(boards).where(and(eq(boards.id, id), eq(boards.teamId, scope.teamId)));
    refresh();
  });
}

// ---------------------------------------------------------------------------
// ThinkLab
// ---------------------------------------------------------------------------

export async function createTeamThinkLab(
  teamId: string,
  input: { name: string; description?: string | null; milestoneId?: string | null },
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const scope = await teamScope(teamId);
    requireCapability(scope, "tool.create");

    const name = requireText(input.name, "o nome do quadro", { maxLength: 100 });
    const description = optionalText(input.description, 500);
    const milestoneId = await resolveMilestoneId(scope, input.milestoneId);

    const clash = await db
      .select({ id: thinklab.id })
      .from(thinklab)
      .where(and(eq(thinklab.teamId, scope.teamId), sameName(thinklab.name, name)))
      .limit(1);
    if (clash.length) throw new ValidationError("Já existe um quadro com esse nome nesta equipe.");

    // `user_id` é NOT NULL nesta tabela e guarda o CRIADOR; o item é da equipe
    // por causa do `team_id` (ver `creatorScopeWhere`).
    const [created] = await db
      .insert(thinklab)
      .values({ userId: scope.userId, teamId: scope.teamId, name, description, milestoneId })
      .returning({ id: thinklab.id });

    refresh();
    return created;
  });
}

export async function deleteTeamThinkLab(teamId: string, thinklabId: string): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await teamScope(teamId);
    const id = requireUuid(thinklabId, "quadro");

    const [row] = await db
      .select({ id: thinklab.id, createdBy: thinklab.userId })
      .from(thinklab)
      .where(and(eq(thinklab.id, id), eq(thinklab.teamId, scope.teamId)))
      .limit(1);
    if (!row) throw new ValidationError("Quadro não encontrado nesta equipe.");
    if (!canDeleteResource(scope.role, row.createdBy, scope.userId)) {
      throw new StagebookAuthError("Só quem criou o quadro, técnicos e mentores podem excluí-lo.");
    }

    await db.delete(thinklab).where(and(eq(thinklab.id, id), eq(thinklab.teamId, scope.teamId)));
    refresh();
  });
}

// ---------------------------------------------------------------------------
// LabTest
// ---------------------------------------------------------------------------

export async function createTeamLabTest(
  teamId: string,
  input: {
    name: string;
    description?: string | null;
    mode?: string;
    season?: string | null;
    milestoneId?: string | null;
  },
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const scope = await teamScope(teamId);
    requireCapability(scope, "tool.create");

    const name = requireText(input.name, "o nome do teste", { maxLength: 100 });
    const description = optionalText(input.description, 500);
    const mode = requireOneOf(input.mode ?? "runs", TEST_MODES, "Modo");
    const milestoneId = await resolveMilestoneId(scope, input.milestoneId);

    // Sem temporada informada, herda a da equipe.
    let season = optionalText(input.season, 40);
    if (!season) {
      const [team] = await db
        .select({ season: teams.season })
        .from(teams)
        .where(eq(teams.id, scope.teamId))
        .limit(1);
      season = team?.season ?? null;
    }

    const clash = await db
      .select({ id: tests.id })
      .from(tests)
      .where(and(eq(tests.teamId, scope.teamId), sameName(tests.name, name)))
      .limit(1);
    if (clash.length) throw new ValidationError("Já existe um teste com esse nome nesta equipe.");

    const [created] = await db
      .insert(tests)
      .values({
        userId: scope.userId,
        teamId: scope.teamId,
        name,
        description,
        mode,
        season,
        milestoneId,
        status: requireOneOf("planejamento", TEST_STATUSES, "Status"),
      })
      .returning({ id: tests.id });

    refresh();
    return created;
  });
}

export async function deleteTeamLabTest(teamId: string, testId: string): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await teamScope(teamId);
    const id = requireUuid(testId, "teste");

    const [row] = await db
      .select({ id: tests.id, createdBy: tests.userId })
      .from(tests)
      .where(and(eq(tests.id, id), eq(tests.teamId, scope.teamId)))
      .limit(1);
    if (!row) throw new ValidationError("Teste não encontrado nesta equipe.");
    if (!canDeleteResource(scope.role, row.createdBy, scope.userId)) {
      throw new StagebookAuthError("Só quem criou o teste, técnicos e mentores podem excluí-lo.");
    }

    // Execuções e valores caem em cascata (FKs).
    await db.delete(tests).where(and(eq(tests.id, id), eq(tests.teamId, scope.teamId)));
    refresh();
  });
}
