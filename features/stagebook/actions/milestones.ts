"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { milestones } from "@/db/schema";
import {
  requireTeamAccess,
  resolveStagebookScope,
  scopeOwnership,
  type StagebookScope,
} from "../lib/scope";
import { requireCapability } from "../lib/permissions";
import { recordTeamActivity } from "../lib/team-activity";
import { runAction, type ActionResult } from "@/lib/action-result";
import { roleCan } from "../lib/team-permissions";
import {
  ValidationError,
  optionalDate,
  optionalText,
  requireText,
  requireUuid,
} from "../lib/validation";
import { normalizeHexColor } from "../lib/label-colors";
import {
  adapterFor,
  assertKind,
  milestoneColumns,
  milestoneScope,
  milestoneUsageByKind,
  milestonesForResources,
  requireMilestoneInScope,
  requireResourceInScope,
  requireResourceWritable,
  toMilestoneDTO,
} from "../lib/labels-core";
import { normalizeCriteria, type LabelableKind, type MilestoneDTO, type MilestoneWithUsage } from "@/features/stagebook/types/labels";

/**
 * Milestones UNIVERSAIS: um marco criado em qualquer ferramenta pode ser
 * usado por cards, páginas, eventos, quadros do ThinkLab e testes do LabTest
 * do mesmo espaço (pessoal ou equipe).
 */

function refresh() {
  revalidatePath("/dashboard", "layout");
}

function parseColor(color: unknown): string | null {
  if (color === null || color === undefined || color === "") return null;
  const hex = normalizeHexColor(color);
  if (!hex) throw new ValidationError("Cor inválida. Use o formato #rrggbb.");
  return hex;
}

export async function listMilestones(): Promise<MilestoneDTO[]> {
  const scope = await resolveStagebookScope();
  const rows = await db
    .select(milestoneColumns)
    .from(milestones)
    .where(milestoneScope(scope))
    .orderBy(milestones.dueAt, milestones.name);
  return rows.map(toMilestoneDTO);
}

export async function listMilestonesWithUsage(): Promise<MilestoneWithUsage[]> {
  const items = await listMilestones();
  const { usage, empty } = await milestoneUsageByKind(items.map((m) => m.id));
  return items.map((m) => {
    const u = usage.get(m.id) ?? empty();
    return { ...m, usage: u, total: Object.values(u).reduce((a, b) => a + b, 0) };
  });
}

type MilestoneInput = {
  name?: string;
  dueAt?: string | null;
  color?: string | null;
  description?: string | null;
  /** Critérios de conclusão (checklist da meta). Marcações já feitas são preservadas pelo id. */
  criteria?: unknown;
};

/**
 * Regra de negócio: no espaço de equipe, só técnico e mentor criam/editam/
 * excluem milestones (os "marcos" da equipe). Membros apenas usam as que já
 * existem — `setResourceMilestone` continua liberado para eles.
 */
async function insertMilestone(scope: StagebookScope, input: MilestoneInput): Promise<MilestoneDTO> {
  requireCapability(scope, "milestone.manage");
  const [created] = await db
    .insert(milestones)
    .values({
      ...scopeOwnership(scope),
      name: requireText(input.name, "o nome da milestone", { maxLength: 100 }),
      dueAt: parseDueAt(input.dueAt),
      color: parseColor(input.color),
      description: optionalText(input.description, 1000),
      criteria: normalizeCriteria(input.criteria).map((c) => ({ ...c, done: false, doneAt: null, doneBy: null })),
      createdBy: scope.userId,
    })
    .returning(milestoneColumns);
  if (scope.type === "team") {
    await recordTeamActivity({
      teamId: scope.teamId,
      actorId: scope.userId,
      verb: "milestone.created",
      entityType: "milestone",
      entityId: created.id,
      data: { name: created.name, dueAt: created.dueAt?.toISOString() ?? null },
    });
  }
  refresh();
  return toMilestoneDTO(created);
}

async function patchMilestone(
  scope: StagebookScope,
  id: string,
  input: MilestoneInput,
): Promise<MilestoneDTO> {
  requireCapability(scope, "milestone.manage");
  requireUuid(id, "milestone");
  const current = await requireMilestoneInScope(scope, id);

  const patch: Partial<typeof milestones.$inferInsert> = { updatedAt: new Date() };
  if (input.criteria !== undefined) {
    // Quem edita o texto não "desfaz" o que a equipe já marcou: o estado vem do banco.
    const before = new Map(current.criteria.map((c) => [c.id, c]));
    patch.criteria = normalizeCriteria(input.criteria).map((c) => {
      const prev = before.get(c.id);
      return prev ? { ...c, done: prev.done, doneAt: prev.doneAt ?? null, doneBy: prev.doneBy ?? null } : { ...c, done: false, doneAt: null, doneBy: null };
    });
  }
  if (input.name !== undefined) {
    patch.name = requireText(input.name, "o nome da milestone", { maxLength: 100 });
  }
  if (input.dueAt !== undefined) patch.dueAt = parseDueAt(input.dueAt);
  if (input.color !== undefined) patch.color = parseColor(input.color);
  if (input.description !== undefined) patch.description = optionalText(input.description, 1000);

  const [updated] = await db
    .update(milestones)
    .set(patch)
    .where(and(eq(milestones.id, id), milestoneScope(scope)))
    .returning(milestoneColumns);
  refresh();
  return toMilestoneDTO(updated);
}

/** Exclui a milestone; os itens ficam sem milestone (FK `set null`). */
async function removeMilestone(scope: StagebookScope, id: string): Promise<void> {
  requireCapability(scope, "milestone.manage");
  requireUuid(id, "milestone");
  await requireMilestoneInScope(scope, id);
  await db.delete(milestones).where(and(eq(milestones.id, id), milestoneScope(scope)));
  refresh();
}

/** Data de prazo opcional, mas se vier preenchida precisa ser uma data válida. */
function parseDueAt(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date = optionalDate(value);
  if (!date) throw new ValidationError("Prazo inválido.");
  return date;
}

export async function createMilestone(input: {
  name: string;
  dueAt?: string | null;
  color?: string | null;
  description?: string | null;
}): Promise<ActionResult<MilestoneDTO>> {
  return runAction(async () => {
    return insertMilestone(await resolveStagebookScope(), input);
  });
}

export async function updateMilestone(id: string, input: MilestoneInput): Promise<ActionResult<MilestoneDTO>> {
  return runAction(async () => {
    return patchMilestone(await resolveStagebookScope(), id, input);
  });
}

export async function deleteMilestone(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    return removeMilestone(await resolveStagebookScope(), id);
  });
}

/** O usuário pode criar/editar milestones no espaço ativo? (para esconder botões na UI) */
export async function getMilestoneAccess(): Promise<{ canManage: boolean }> {
  const scope = await resolveStagebookScope();
  return { canManage: scope.type === "personal" || roleCan(scope.role, "milestone.manage") };
}

/**
 * Marca/desmarca um critério da meta. Qualquer membro pode (é assim que o
 * progresso anda, inclusive de dentro do Diário); editar o texto dos
 * critérios continua sendo de técnico/mentor.
 */
async function markCriterion(scope: StagebookScope, id: string, criterionId: string, done: boolean): Promise<MilestoneDTO> {
  requireUuid(id, "milestone");
  if (typeof criterionId !== "string" || !criterionId) throw new ValidationError("Critério inválido.");
  const current = await requireMilestoneInScope(scope, id);
  const target = current.criteria.find((c) => c.id === criterionId);
  if (!target) throw new ValidationError("Critério não encontrado.");
  if (target.done === done) return current;

  const criteria = current.criteria.map((c) =>
    c.id === criterionId
      ? { ...c, done, doneAt: done ? new Date().toISOString() : null, doneBy: done ? scope.userId : null }
      : c,
  );
  const [updated] = await db
    .update(milestones)
    .set({ criteria, updatedAt: new Date() })
    .where(and(eq(milestones.id, id), milestoneScope(scope)))
    .returning(milestoneColumns);
  if (scope.type === "team" && done) {
    await recordTeamActivity({
      teamId: scope.teamId,
      actorId: scope.userId,
      verb: "milestone.criterion_done",
      entityType: "milestone",
      entityId: id,
      data: { name: current.name, criterion: target.text, done: criteria.filter((c) => c.done).length, total: criteria.length },
      aggregate: false,
    });
  }
  refresh();
  return toMilestoneDTO(updated);
}

/** Conclui (ou reabre) a meta. Técnico/mentor na equipe. */
async function markCompleted(scope: StagebookScope, id: string, completed: boolean): Promise<MilestoneDTO> {
  requireCapability(scope, "milestone.manage");
  requireUuid(id, "milestone");
  const current = await requireMilestoneInScope(scope, id);
  if (!!current.completedAt === completed) return current;
  const [updated] = await db
    .update(milestones)
    .set({ completedAt: completed ? new Date() : null, completedBy: completed ? scope.userId : null, updatedAt: new Date() })
    .where(and(eq(milestones.id, id), milestoneScope(scope)))
    .returning(milestoneColumns);
  if (scope.type === "team" && completed) {
    await recordTeamActivity({
      teamId: scope.teamId,
      actorId: scope.userId,
      verb: "milestone.completed",
      entityType: "milestone",
      entityId: id,
      data: { name: current.name },
      aggregate: false,
    });
  }
  refresh();
  return toMilestoneDTO(updated);
}

export async function toggleMilestoneCriterion(id: string, criterionId: string, done: boolean): Promise<ActionResult<MilestoneDTO>> {
  return runAction(async () => markCriterion(await resolveStagebookScope(), id, criterionId, done === true));
}

export async function setMilestoneCompleted(id: string, completed: boolean): Promise<ActionResult<MilestoneDTO>> {
  return runAction(async () => markCompleted(await resolveStagebookScope(), id, completed === true));
}

// ---------------------------------------------------------------------------
// Variantes com `teamId` explícito — usadas pela página da equipe, que pode
// estar aberta numa equipe diferente do espaço ativo (cookie). Devolvem
// `ActionResult` para a mensagem de erro chegar à UI em produção.
// ---------------------------------------------------------------------------

export async function createTeamMilestone(
  teamId: string,
  input: MilestoneInput & { name: string },
): Promise<ActionResult<MilestoneDTO>> {
  return runAction(async () => insertMilestone(await requireTeamAccess(teamId), input));
}

export async function updateTeamMilestone(
  teamId: string,
  id: string,
  input: MilestoneInput,
): Promise<ActionResult<MilestoneDTO>> {
  return runAction(async () => patchMilestone(await requireTeamAccess(teamId), id, input));
}

export async function deleteTeamMilestone(teamId: string, id: string): Promise<ActionResult> {
  return runAction(async () => removeMilestone(await requireTeamAccess(teamId), id));
}

export async function toggleTeamMilestoneCriterion(
  teamId: string,
  id: string,
  criterionId: string,
  done: boolean,
): Promise<ActionResult<MilestoneDTO>> {
  return runAction(async () => markCriterion(await requireTeamAccess(teamId), id, criterionId, done === true));
}

export async function setTeamMilestoneCompleted(teamId: string, id: string, completed: boolean): Promise<ActionResult<MilestoneDTO>> {
  return runAction(async () => markCompleted(await requireTeamAccess(teamId), id, completed === true));
}

export async function getResourceMilestone(
  kind: LabelableKind,
  id: string,
): Promise<MilestoneDTO | null> {
  assertKind(kind);
  requireUuid(id, "item");
  const scope = await resolveStagebookScope();
  await requireResourceInScope(scope, kind, id);
  return (await milestonesForResources(kind, [id])).get(id) ?? null;
}

/** Define (ou limpa, com null) a milestone de um item de qualquer ferramenta. */
export async function setResourceMilestone(
  kind: LabelableKind,
  id: string,
  milestoneId: string | null,
): Promise<ActionResult<MilestoneDTO | null>> {
  return runAction(async () => {
    assertKind(kind);
    requireUuid(id, "item");
    const scope = await resolveStagebookScope();
    await requireResourceWritable(scope, kind, id);

    let milestone: MilestoneDTO | null = null;
    if (milestoneId) {
      requireUuid(milestoneId, "milestone");
      milestone = await requireMilestoneInScope(scope, milestoneId);
    }
    await adapterFor(kind).setMilestone(id, milestone?.id ?? null);
    refresh();
    return milestone;
  });
}
