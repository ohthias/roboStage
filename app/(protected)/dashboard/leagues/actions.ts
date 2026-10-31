"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { leagues, userLeagueInterests } from "@/db/schema";
import { resolveStagebookScope } from "@/utils/stagebook/scope";
import { ValidationError } from "@/utils/stagebook/validation";
import { runAction } from "@/utils/stagebook/action-result";

const RELATIONS = ["participante", "interessado"] as const;
export type LeagueRelation = (typeof RELATIONS)[number];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function clean(value: string | null | undefined, maxLength: number) {
  const text = (value ?? "").trim().slice(0, maxLength);
  return text === "" ? null : text;
}

function revalidate() {
  revalidatePath("/dashboard/leagues");
  revalidatePath("/dashboard");
}

/** Cria ou atualiza a relação do usuário com uma liga (participa / acompanha). */
export async function saveLeagueInterest(input: {
  leagueId: string;
  relationType: LeagueRelation;
  teamName?: string | null;
  season?: string | null;
}) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();

    if (!UUID.test(input.leagueId)) throw new ValidationError("Liga inválida.");
    if (!RELATIONS.includes(input.relationType)) throw new ValidationError("Relação inválida.");

    const [league] = await db
      .select({ id: leagues.id })
      .from(leagues)
      .where(eq(leagues.id, input.leagueId))
      .limit(1);
    if (!league) throw new ValidationError("Liga não encontrada.");

    // Equipe e temporada só fazem sentido para quem participa.
    const participates = input.relationType === "participante";
    const teamName = participates ? clean(input.teamName, 80) : null;
    const season = participates ? clean(input.season, 40) : null;

    await db
      .insert(userLeagueInterests)
      .values({
        userId: scope.userId,
        leagueId: input.leagueId,
        relationType: input.relationType,
        teamName,
        season,
      })
      .onConflictDoUpdate({
        target: [userLeagueInterests.userId, userLeagueInterests.leagueId],
        set: { relationType: input.relationType, teamName, season },
      });

    revalidate();
  });
}

export async function removeLeagueInterest(leagueId: string) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    if (!UUID.test(leagueId)) throw new ValidationError("Liga inválida.");

    await db
      .delete(userLeagueInterests)
      .where(
        and(
          eq(userLeagueInterests.userId, scope.userId),
          eq(userLeagueInterests.leagueId, leagueId),
        ),
      );

    revalidate();
  });
}
