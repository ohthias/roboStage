import { NextResponse } from "next/server";
import { readRawDocs } from "@/features/leagues/shared/lib/docs";

// Gerada no build a partir de data/docs/ftc.json.
export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(await readRawDocs("ftc"));
}
