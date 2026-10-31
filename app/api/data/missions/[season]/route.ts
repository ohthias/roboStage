import { NextResponse } from "next/server";
import { MISSIONS_CATALOG } from "@/utils/data/static-data";

// Uma rota estática por temporada: quem usa uma temporada não baixa todas.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(MISSIONS_CATALOG).map((season) => ({ season }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ season: string }> }) {
  const { season } = await params;
  const missions = MISSIONS_CATALOG[season];
  if (!missions) {
    return NextResponse.json({ error: "Temporada não encontrada." }, { status: 404 });
  }
  return NextResponse.json(missions);
}
