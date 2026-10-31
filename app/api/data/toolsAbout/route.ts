import { NextResponse } from "next/server";
import { TOOLS_ABOUT } from "@/utils/data/static-data";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(TOOLS_ABOUT);
}
