import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { leagues, userLeagueInterests } from "@/db/schema/leagues";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { leagueRelationEnum } from "@/db/schema/enums";

const RELATION_TYPES = ["participante", "interessado"] as const;
type RelationType = (typeof RELATION_TYPES)[number];

/**
 * GET /api/competitions
 * GET /api/competitions?relationType=competidor
 *
 * Retorna as competições (leagues) associadas ao usuário autenticado através
 * de user_league_interests — cobre tanto quem compete quanto quem apenas
 * "segue" uma liga, dependendo do relationType.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.userId;

  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const relationType = request.nextUrl.searchParams.get("relationType");

  if (relationType && !RELATION_TYPES.includes(relationType as RelationType)) {
    return NextResponse.json(
      { error: "Tipo de relação inválido." },
      { status: 400 },
    );
  }

  const conditions = relationType
    ? and(
        eq(userLeagueInterests.userId, userId),
        eq(
          userLeagueInterests.relationType,
          relationType as (typeof leagueRelationEnum.enumValues)[number],
        ),
      )
    : eq(userLeagueInterests.userId, userId);

  try {
    const rows = await db
      .select({
        id: leagues.id,
        code: leagues.code,
        name: leagues.name,
        description: leagues.description,
        relationType: userLeagueInterests.relationType,
        teamName: userLeagueInterests.teamName,
        season: userLeagueInterests.season,
      })
      .from(userLeagueInterests)
      .innerJoin(leagues, eq(userLeagueInterests.leagueId, leagues.id))
      .where(conditions)
      .orderBy(leagues.name);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("Erro ao buscar competições do usuário:", err);
    return NextResponse.json(
      { error: "Não foi possível carregar as competições." },
      { status: 500 }
    );
  }
}