"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { teamMembers, teams } from "@/db/schema";
import { runAction, type ActionResult } from "../action-result";
import { requireCapability } from "../permissions";
import { requireAuthenticatedUser, requireTeamAccess } from "../scope";
import { recordTeamActivity } from "../team-activity";
import { listTransferCandidates, transferToTeam } from "../transfer-core";
import { ValidationError, requireUuid } from "../validation";
import {
  TRANSFER_KINDS,
  isTransferKind,
  type TransferCandidateDTO,
  type TransferKind,
  type TransferResultDTO,
} from "@/types/legacy";
import { roleLabel } from "../team-permissions";

/**
 * Transferência de arquivos do espaço pessoal para uma equipe (ver
 * `transfer-core.ts` para o que vai junto e o que é ajustado).
 *
 * Regras: só o dono transfere o que é dele, e só para uma equipe de que é
 * membro (qualquer cargo cria recursos na equipe). É uma via de mão única pela
 * interface: depois de transferido, o item é da equipe.
 */

/** Itens do espaço pessoal de quem está logado (independe do espaço ativo). */
export async function searchTransferCandidates(input: { q?: string; kind?: string | null } = {}): Promise<
  ActionResult<TransferCandidateDTO[]>
> {
  return runAction(async () => {
    const userId = await requireAuthenticatedUser();
    const kinds: TransferKind[] = isTransferKind(input.kind) ? [input.kind] : [...TRANSFER_KINDS];
    return listTransferCandidates(userId, { q: typeof input.q === "string" ? input.q : "", kinds, perKind: input.kind ? 60 : 25 });
  });
}

/** Equipes para onde a pessoa pode transferir. */
export async function listTransferTargets(): Promise<ActionResult<{ id: string; name: string; role: string }[]>> {
  return runAction(async () => {
    const userId = await requireAuthenticatedUser();
    const rows = await db
      .select({ id: teams.id, name: teams.name, role: teamMembers.role })
      .from(teamMembers)
      .innerJoin(teams, eq(teams.id, teamMembers.teamId))
      .where(eq(teamMembers.userId, userId))
      .orderBy(teams.name);
    return rows.map((r) => ({ ...r, role: roleLabel(r.role) }));
  });
}

export async function transferItemsToTeam(
  teamId: string,
  items: { kind: string; id: string }[],
): Promise<ActionResult<TransferResultDTO>> {
  return runAction(async () => {
    const scope = await requireTeamAccess(teamId);
    requireCapability(scope, "tool.create");
    if (!Array.isArray(items)) throw new ValidationError("Lista de itens inválida.");
    const refs = items.map((item) => {
      if (!item || !isTransferKind(item.kind)) throw new ValidationError("Tipo de item inválido.");
      return { kind: item.kind, id: requireUuid(item.id, "item") };
    });

    const result = await transferToTeam(scope.userId, scope, refs);

    await recordTeamActivity({
      teamId: scope.teamId,
      actorId: scope.userId,
      verb: "resource.transferred",
      data: { count: result.moved.length, first: result.moved[0]?.title ?? null, pages: result.pages },
      aggregate: false,
    });
    revalidatePath("/dashboard", "layout");
    return result;
  });
}
