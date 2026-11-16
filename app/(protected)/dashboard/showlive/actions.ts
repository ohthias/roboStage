"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/utils/stagebook/action-result";
import { ValidationError } from "@/utils/stagebook/validation";
import { ShowLiveError, showliveFetch } from "@/utils/showlive/client";
import { buildCreatePayload } from "@/utils/showlive/input";
import type { CreatedShowLiveEvent } from "@/utils/showlive/types";

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
