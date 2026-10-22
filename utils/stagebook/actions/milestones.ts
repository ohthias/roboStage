"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { milestones } from "@/db/schema";
import { resolveStagebookScope, scopeOwnership } from "../scope";
import { requireRole } from "../permissions";
import { cleanText, optionalDate, optionalText, requireUuid } from "../validation";
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
  if (!hex) throw new Error("Cor inválida. Use o formato #rrggbb.");
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

export async function createMilestone(input: {
  name: string;
  dueAt?: string | null;
  color?: string | null;
  description?: string | null;
}): Promise<MilestoneDTO> {
  const scope = await resolveStagebookScope();
  const [created] = await db
    .insert(milestones)
    .values({
      ...scopeOwnership(scope),
      name: cleanText(input.name, { fallback: "Nova milestone", maxLength: 100 }),
      dueAt: optionalDate(input.dueAt),
      color: parseColor(input.color),
      description: optionalText(input.description, 1000),
      createdBy: scope.userId,
    })
    .returning(milestoneColumns);
  refresh();
  return toMilestoneDTO(created);
}

export async function updateMilestone(
  id: string,
  input: {
    name?: string;
    dueAt?: string | null;
    color?: string | null;
    description?: string | null;
  },
): Promise<MilestoneDTO> {
  const scope = await resolveStagebookScope();
  requireUuid(id, "milestone");
  await requireMilestoneInScope(scope, id);

  const patch: Partial<typeof milestones.$inferInsert> = { updatedAt: new Date() };
  if (input.name !== undefined) {
    patch.name = cleanText(input.name, { fallback: "Nova milestone", maxLength: 100 });
  }
  if (input.dueAt !== undefined) patch.dueAt = optionalDate(input.dueAt);
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
export async function deleteMilestone(id: string): Promise<void> {
  const scope = await resolveStagebookScope();
  requireRole(scope, ["owner", "mentor"]);
  requireUuid(id, "milestone");
  await requireMilestoneInScope(scope, id);
  await db.delete(milestones).where(and(eq(milestones.id, id), milestoneScope(scope)));
  refresh();
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
