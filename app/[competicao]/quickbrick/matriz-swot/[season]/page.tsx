"use client";

import { useParams } from "next/navigation";
import SWOTCanvasWrapper from "./SWOTCanvasWrapper";

export default function SwotPage() {
  const params = useParams();
  const selectedSeason =
    typeof params?.season === "string"
      ? params.season
      : Array.isArray(params?.season)
      ? params.season[0] || ""
      : "";

  return <SWOTCanvasWrapper season={selectedSeason} />;
}
