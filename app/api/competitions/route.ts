import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserLeagues } from "@/utils/stagebook/user-leagues";

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

  try {
    const rows = (await getUserLeagues(userId))
      .filter((row) => !relationType || row.relationType === relationType)
      .map(({ leagueId, ...row }) => ({ id: leagueId, ...row }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

    return NextResponse.json(rows);
  } catch (err) {
    console.error("Erro ao buscar competições do usuário:", err);
    return NextResponse.json(
      { error: "Não foi possível carregar as competições." },
      { status: 500 }
    );
  }
}