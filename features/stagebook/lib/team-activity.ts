import "server-only";

import { and, desc, eq, gte, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { teamActivity } from "@/db/schema";
import type { ActivityEntityType, ActivityVerb } from "./team-activity-verbs";

export type { ActivityEntityType, ActivityVerb };

/** Janela em que o mesmo ator + verbo + recurso vira uma linha só (count++). */
export const ACTIVITY_AGGREGATE_WINDOW_MS = 30 * 60 * 1000;

/** Chaves de `data` que, ao agregar, guardam o MAIOR valor (não o último). */
const MAX_KEYS = new Set(["bestScore"]);

/**
 * Funde o `data` de uma linha agregada com o novo evento: chaves de máximo
 * guardam o maior valor; as demais ficam com o valor mais recente.
 */
export function mergeActivityData(
  previous: Record<string, unknown>,
  next: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...previous };
  for (const [key, value] of Object.entries(next)) {
    const before = previous[key];
    if (MAX_KEYS.has(key) && typeof value === "number") {
      merged[key] = typeof before === "number" ? Math.max(before, value) : value;
    } else if (value !== undefined) {
      merged[key] = value;
    }
  }
  return merged;
}

export type RecordTeamActivityInput = {
  teamId: string;
  actorId: string | null;
  verb: ActivityVerb;
  entityType?: ActivityEntityType | null;
  entityId?: string | null;
  data?: Record<string, unknown>;
  /** Agrega com uma linha recente do mesmo ator/verbo/recurso (padrão: true). */
  aggregate?: boolean;
};

/**
 * Publica um evento no feed da equipe.
 *
 * NUNCA derruba a action principal: o feed é secundário, então qualquer erro
 * aqui é só logado. Chamar DEPOIS da escrita principal ter dado certo.
 */
export async function recordTeamActivity(input: RecordTeamActivityInput): Promise<void> {
  try {
    const data = input.data ?? {};
    const entityId = input.entityId ?? null;
    const now = new Date();

    if (input.aggregate !== false) {
      const since = new Date(now.getTime() - ACTIVITY_AGGREGATE_WINDOW_MS);
      const [recent] = await db
        .select({ id: teamActivity.id, count: teamActivity.count, data: teamActivity.data })
        .from(teamActivity)
        .where(
          and(
            eq(teamActivity.teamId, input.teamId),
            input.actorId ? eq(teamActivity.actorId, input.actorId) : isNull(teamActivity.actorId),
            eq(teamActivity.verb, input.verb),
            entityId ? eq(teamActivity.entityId, entityId) : isNull(teamActivity.entityId),
            gte(teamActivity.updatedAt, since),
          ),
        )
        .orderBy(desc(teamActivity.updatedAt))
        .limit(1);

      if (recent) {
        await db
          .update(teamActivity)
          .set({
            count: recent.count + 1,
            updatedAt: now,
            data: mergeActivityData(recent.data ?? {}, data),
          })
          .where(eq(teamActivity.id, recent.id));
        return;
      }
    }

    await db.insert(teamActivity).values({
      teamId: input.teamId,
      actorId: input.actorId,
      verb: input.verb,
      entityType: input.entityType ?? null,
      entityId,
      data,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error("[stagebook] falha ao registrar atividade da equipe:", error);
  }
}
