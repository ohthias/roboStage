import { NextResponse } from "next/server";
import { FtcScoutError, searchEvents } from "@/utils/competitions/ftc/ftcscout-server";

// Proxy da API pública da FTCScout (ftcscout.org). O cache fica no fetch.
export const dynamic = "force-dynamic";

function fail(err: unknown) {
  const status = err instanceof FtcScoutError ? err.status : 502;
  const message = err instanceof Error ? err.message : "Falha ao consultar a FTCScout.";
  return NextResponse.json({ error: message, source: "ftcscout" }, { status });
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  try {
    const events = await searchEvents(params.get("q") ?? "");
    return NextResponse.json(events, { headers: { "Cache-Control": "public, s-maxage=1800" } });
  } catch (err) {
    return fail(err);
  }
}
