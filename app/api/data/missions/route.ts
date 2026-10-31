import { NextResponse } from "next/server";
import { MISSIONS_CATALOG } from "@/utils/data/static-data";

// Gerada no build: o arquivo só muda a cada deploy.
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(MISSIONS_CATALOG);
}
