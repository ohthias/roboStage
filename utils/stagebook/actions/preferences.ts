"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { userPreferences } from "@/db/schema";
import { requireAuthenticatedUser } from "../scope";
import { getPreferencesFor } from "../preferences-core";
import { runAction, type ActionResult } from "../action-result";
import { ValidationError } from "../validation";
import { PREFERENCE_KEYS, type UserPreferences } from "@/types/preferences";

export async function getUserPreferences(): Promise<UserPreferences> {
  return getPreferencesFor(await requireAuthenticatedUser());
}

/**
 * Atualiza só as chaves enviadas. Chaves desconhecidas e valores que não são
 * booleanos são rejeitados (o navegador é não confiável).
 */
export async function updatePreferences(
  patch: Partial<UserPreferences>,
): Promise<ActionResult<UserPreferences>> {
  return runAction(async () => {
    const userId = await requireAuthenticatedUser();

    if (typeof patch !== "object" || patch === null) {
      throw new ValidationError("Preferências inválidas.");
    }
    const clean: Partial<UserPreferences> = {};
    for (const [key, value] of Object.entries(patch)) {
      if (!(PREFERENCE_KEYS as string[]).includes(key) || typeof value !== "boolean") {
        throw new ValidationError("Preferências inválidas.");
      }
      clean[key as keyof UserPreferences] = value;
    }

    const current = await getPreferencesFor(userId);
    const next = { ...current, ...clean };

    await db
      .insert(userPreferences)
      .values({ userId, ...next })
      .onConflictDoUpdate({ target: userPreferences.userId, set: { ...next, updatedAt: new Date() } });

    revalidatePath("/dashboard", "layout");
    return next;
  });
}
