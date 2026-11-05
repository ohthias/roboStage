"use server";

import { revalidatePath } from "next/cache";
import { and, asc, count, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { userPins } from "@/db/schema";
import { resolveStagebookScope } from "../scope";
import { isOwnedByScope } from "../permissions";
import { runAction, type ActionResult } from "../action-result";
import { getPinsForScope, pinSpaceWhere, pinTarget, searchPinCandidates } from "../pins-core";
import { ValidationError, requireUuid } from "../validation";
import { MAX_PINS, PIN_KINDS, isPinKind, type PinCandidate, type PinDTO } from "@/types/pins";

/**
 * Itens fixados na barra lateral. Sempre no espaço ATIVO (cookie): é o espaço
 * cuja barra mostra os fixados e o único em que os links abrem.
 */

function refresh() {
  revalidatePath("/dashboard", "layout");
}

export async function listPins(): Promise<PinDTO[]> {
  return getPinsForScope(await resolveStagebookScope());
}

export async function findPinCandidates(input: {
  q?: string;
  kind?: string | null;
}): Promise<ActionResult<PinCandidate[]>> {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const kinds = input.kind && isPinKind(input.kind) ? [input.kind] : [...PIN_KINDS];
    return searchPinCandidates(scope, {
      q: typeof input.q === "string" ? input.q : "",
      kinds,
      perKind: kinds.length === 1 ? 20 : 6,
    });
  });
}

export async function pinResource(kind: string, resourceId: string): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    if (!isPinKind(kind)) throw new ValidationError("Tipo de item inválido.");
    const id = requireUuid(resourceId, "item");

    const target = await pinTarget(kind, id);
    if (!target || !isOwnedByScope(scope, target)) {
      throw new ValidationError("Item não encontrado neste espaço.");
    }

    const [{ total }] = await db.select({ total: count() }).from(userPins).where(pinSpaceWhere(scope));
    const [already] = await db
      .select({ id: userPins.id })
      .from(userPins)
      .where(and(eq(userPins.userId, scope.userId), eq(userPins.kind, kind), eq(userPins.resourceId, id)))
      .limit(1);
    if (already) return;
    if (Number(total) >= MAX_PINS) {
      throw new ValidationError(`Você já fixou ${MAX_PINS} itens neste espaço. Desafixe um para fixar outro.`);
    }

    await db
      .insert(userPins)
      .values({
        userId: scope.userId,
        teamId: scope.type === "team" ? scope.teamId : null,
        kind,
        resourceId: id,
        position: Number(total),
      })
      .onConflictDoNothing();
    refresh();
  });
}

export async function unpinResource(pinId: string): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const id = requireUuid(pinId, "fixado");
    await db.delete(userPins).where(and(eq(userPins.id, id), eq(userPins.userId, scope.userId)));
    refresh();
  });
}

/** Desafixa pelo item (botão "Fixado" nas páginas). */
export async function unpinByResource(kind: string, resourceId: string): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    if (!isPinKind(kind)) throw new ValidationError("Tipo de item inválido.");
    await db
      .delete(userPins)
      .where(
        and(eq(userPins.userId, scope.userId), eq(userPins.kind, kind), eq(userPins.resourceId, requireUuid(resourceId, "item"))),
      );
    refresh();
  });
}

/** Sobe/desce um fixado (reescreve as posições do espaço). */
export async function movePin(pinId: string, direction: "up" | "down"): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const id = requireUuid(pinId, "fixado");
    const rows = await db
      .select({ id: userPins.id })
      .from(userPins)
      .where(pinSpaceWhere(scope))
      .orderBy(asc(userPins.position), asc(userPins.createdAt));
    const index = rows.findIndex((r) => r.id === id);
    const swap = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swap < 0 || swap >= rows.length) return;
    const order = rows.map((r) => r.id);
    [order[index], order[swap]] = [order[swap], order[index]];
    for (const [position, pid] of order.entries()) {
      await db.update(userPins).set({ position }).where(eq(userPins.id, pid));
    }
    refresh();
  });
}

/** Estado do botão "Fixar" nas páginas: se o item já está fixado e se ainda cabe. */
export async function getPinState(
  kind: string,
  resourceId: string,
): Promise<{ pinned: boolean; full: boolean }> {
  try {
    const scope = await resolveStagebookScope();
    if (!isPinKind(kind)) return { pinned: false, full: false };
    const rows = await db
      .select({ kind: userPins.kind, resourceId: userPins.resourceId })
      .from(userPins)
      .where(pinSpaceWhere(scope));
    return {
      pinned: rows.some((r) => r.kind === kind && r.resourceId === resourceId),
      full: rows.length >= MAX_PINS,
    };
  } catch {
    return { pinned: false, full: false };
  }
}
