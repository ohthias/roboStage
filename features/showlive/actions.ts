"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/lib/action-result";
import { ValidationError } from "@/features/stagebook/lib/validation";
import { ShowLiveError, showliveFetch } from "@/features/showlive/lib/client";
import { buildCreatePayload } from "@/features/showlive/lib/input";
import type { CreatedShowLiveEvent } from "@/features/showlive/lib/types";

/** Cria um evento no ShowLive com a conta RoboStage do usuário. */
export async function createShowLiveEvent(input: unknown): Promise<ActionResult<CreatedShowLiveEvent>> {
  return runAction(async () => {
    const payload = buildCreatePayload(input);
    try {
      const created = await showliveFetch<CreatedShowLiveEvent>("/api/v1/events", { method: "POST", body: payload });
      revalidatePath("/dashboard/showlive");
      return created;
    } catch (error) {
      // Mensagens do ShowLive (validação, limite, sessão) chegam ao usuário.
      if (error instanceof ShowLiveError) throw new ValidationError(error.message);
      throw error;
    }
  });
}
