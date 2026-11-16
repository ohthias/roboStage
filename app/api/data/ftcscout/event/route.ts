import { NextResponse } from "next/server";
import { FtcScoutError, fetchOfficialEvent } from "@/utils/competitions/ftc/ftcscout-server";

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
    const event = await fetchOfficialEvent(params.get("code") ?? "");
    return NextResponse.json(event, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } });
  } catch (err) {
    return fail(err);
  }
}
