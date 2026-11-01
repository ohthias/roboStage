import { NextResponse } from "next/server";
import { FUTURE_EDITION_DATA } from "@/utils/data/static-data";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(FUTURE_EDITION_DATA);
}
