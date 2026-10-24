import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { leagues, userLeagueInterests } from "@/db/schema";
import { resolveStagebookScope } from "@/utils/stagebook/scope";
import { LeaguesView, type LeagueItem } from "./leagues-view";

export default async function LeaguesPage() {
  const scope = await resolveStagebookScope();

  const [allLeagues, interests] = await Promise.all([
    db
      .select({
        id: leagues.id,
        code: leagues.code,
        name: leagues.name,
        description: leagues.description,
      })
      .from(leagues)
      .orderBy(asc(leagues.code)),
    db
      .select({
        leagueId: userLeagueInterests.leagueId,
        relationType: userLeagueInterests.relationType,
        teamName: userLeagueInterests.teamName,
        season: userLeagueInterests.season,
      })
      .from(userLeagueInterests)
      .where(eq(userLeagueInterests.userId, scope.userId)),
  ]);

  const byLeague = new Map(interests.map((i) => [i.leagueId, i]));

  const items: LeagueItem[] = allLeagues.map((league) => {
    const interest = byLeague.get(league.id);
    return {
      ...league,
      relation: interest?.relationType ?? null,
      teamName: interest?.teamName ?? null,
      season: interest?.season ?? null,
    };
  });

  return <LeaguesView leagues={items} />;
}
