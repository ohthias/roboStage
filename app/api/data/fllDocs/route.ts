import { NextResponse } from "next/server";
import { readRawDocs } from "@/utils/competitions/docs";

// Gerada no build a partir de public/data/fllDocs.json.
export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(await readRawDocs("fll"));
}
