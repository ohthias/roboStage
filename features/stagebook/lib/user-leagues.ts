import "server-only";

import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { leagues, userLeagueInterests } from "@/db/schema/leagues";

export type UserLeague = {
  leagueId: string;
  code: string;
  name: string;
  description: string | null;
  relationType: (typeof userLeagueInterests.$inferSelect)["relationType"];
  teamName: string | null;
  season: string | null;
};

/**
 * Ligas/competições que o usuário acompanha (participa ou tem interesse),
 * ordenadas por código. Único lugar com o join `user_league_interests` ×
 * `leagues`: LabTest, QuickBrick, ThinkLab e `/api/competitions` partem daqui,
 * e `cache()` evita repetir a consulta no mesmo render/ação.
 */
export const getUserLeagues = cache(async (userId: string): Promise<UserLeague[]> => {
  return db
    .select({
      leagueId: leagues.id,
      code: leagues.code,
      name: leagues.name,
      description: leagues.description,
      relationType: userLeagueInterests.relationType,
      teamName: userLeagueInterests.teamName,
      season: userLeagueInterests.season,
    })
    .from(userLeagueInterests)
    .innerJoin(leagues, eq(leagues.id, userLeagueInterests.leagueId))
    .where(eq(userLeagueInterests.userId, userId))
    .orderBy(asc(leagues.code));
});
