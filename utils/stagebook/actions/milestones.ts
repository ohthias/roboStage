"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { milestones } from "@/db/schema";
import {
  requireStagebookAccess,
  resolveStagebookScope,
  scopeOwnership,
  type StagebookScope,
} from "../scope";
import { requireCapability, requireTeamScope } from "../permissions";
import { runAction, type ActionResult } from "../action-result";
import { roleCan } from "../team-permissions";
import {
  ValidationError,
  optionalDate,
  optionalText,
  requireText,
  requireUuid,
} from "../validation";
import { normalizeHexColor } from "../label-colors";
import {
  adapterFor,
  assertKind,
  milestoneColumns,
  milestoneScope,
  milestoneUsageByKind,
  milestonesForResources,
  requireMilestoneInScope,
  requireResourceInScope,
  toMilestoneDTO,
} from "../labels-core";
import type { LabelableKind, MilestoneDTO, MilestoneWithUsage } from "@/types/labels";

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
      createdBy: scope.userId,
    })
    .returning(milestoneColumns);
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
  await requireMilestoneInScope(scope, id);

  const patch: Partial<typeof milestones.$inferInsert> = { updatedAt: new Date() };
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
}): Promise<MilestoneDTO> {
  return insertMilestone(await resolveStagebookScope(), input);
}

export async function updateMilestone(id: string, input: MilestoneInput): Promise<MilestoneDTO> {
  return patchMilestone(await resolveStagebookScope(), id, input);
}

export async function deleteMilestone(id: string): Promise<void> {
  return removeMilestone(await resolveStagebookScope(), id);
}

/** O usuário pode criar/editar milestones no espaço ativo? (para esconder botões na UI) */
export async function getMilestoneAccess(): Promise<{ canManage: boolean }> {
  const scope = await resolveStagebookScope();
  return { canManage: scope.type === "personal" || roleCan(scope.role, "milestone.manage") };
}

// ---------------------------------------------------------------------------
// Variantes com `teamId` explícito — usadas pela página da equipe, que pode
// estar aberta numa equipe diferente do espaço ativo (cookie). Devolvem
// `ActionResult` para a mensagem de erro chegar à UI em produção.
// ---------------------------------------------------------------------------

async function teamScope(teamId: string) {
  const scope = await requireStagebookAccess(requireUuid(teamId, "equipe"));
  requireTeamScope(scope);
  return scope;
}

export async function createTeamMilestone(
  teamId: string,
  input: MilestoneInput & { name: string },
): Promise<ActionResult<MilestoneDTO>> {
  return runAction(async () => insertMilestone(await teamScope(teamId), input));
}

export async function updateTeamMilestone(
  teamId: string,
  id: string,
  input: MilestoneInput,
): Promise<ActionResult<MilestoneDTO>> {
  return runAction(async () => patchMilestone(await teamScope(teamId), id, input));
}

export async function deleteTeamMilestone(teamId: string, id: string): Promise<ActionResult> {
  return runAction(async () => removeMilestone(await teamScope(teamId), id));
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
): Promise<MilestoneDTO | null> {
  assertKind(kind);
  requireUuid(id, "item");
  const scope = await resolveStagebookScope();
  await requireResourceInScope(scope, kind, id);

  let milestone: MilestoneDTO | null = null;
  if (milestoneId) {
    requireUuid(milestoneId, "milestone");
    milestone = await requireMilestoneInScope(scope, milestoneId);
  }
  await adapterFor(kind).setMilestone(id, milestone?.id ?? null);
  refresh();
  return milestone;
}
