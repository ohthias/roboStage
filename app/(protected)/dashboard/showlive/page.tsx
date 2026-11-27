import type { Metadata } from "next";
import { ShowLiveError, SHOWLIVE_URL, showliveFetch } from "@/features/showlive/lib/client";
import type { ShowLiveOverview } from "@/features/showlive/lib/types";
import { ShowLiveView } from "@/features/showlive/components/showlive-view";

export const metadata: Metadata = { title: "ShowLive · Dashboard" };
export const dynamic = "force-dynamic";

export default async function ShowLivePage() {
  let overview: ShowLiveOverview | null = null;
  let error: string | null = null;
  try {
    overview = await showliveFetch<ShowLiveOverview>("/api/v1/events");
  } catch (e) {
    error = e instanceof ShowLiveError ? e.message : "Não foi possível carregar seus eventos do ShowLive.";
    if (!(e instanceof ShowLiveError)) console.error("[dashboard/showlive]", e);
  }

  return <ShowLiveView overview={overview} error={error} showliveUrl={SHOWLIVE_URL} />;
}
