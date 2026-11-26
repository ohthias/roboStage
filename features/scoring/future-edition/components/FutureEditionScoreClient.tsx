"use client";
import { asset } from "@/lib/assets";

import Breadcrumbs from "@/components/layout/Breadcrumbs";
import type { MissionsData } from "../types";
import ScoreCalculator from "@/features/scoring/future-edition/components/ScoreCalculator";
import Timer from "@/features/scoring/components/Timer";
import { SeasonBanner } from "@/features/scoring/components/SeasonBanner";

/** Pontuador da Future Edition; os dados chegam prontos do servidor. */
export default function FutureEditionScoreClient({ data }: { data: MissionsData }) {
  return (
    <div className="flex flex-col min-h-screen space-y-8 bg-base-200 px-6">
      <header className="max-w-5xl mx-auto w-full pt-8">
        <Breadcrumbs start="fll" />
        <SeasonBanner
          logo={asset("/images/seasons/fll/bioglow_logo_future_edition.webp")}
          logoAlt="Logo BIOGLOW Future Edition"
          title="BIOGLOW"
          description="Baseado nos kits LEGO® Education Computer Science & AI."
        />
      </header>

      <Timer
        duration={150}
        startSound={asset("/audio/start.mp3")}
        endSound={asset("/audio/end.mp3")}
        onFinish={() => {
          console.log("Tempo encerrado!");
        }}
        className="animate-fade-in-down max-w-5xl w-full mx-auto"
      />

      <main className="max-w-6xl mx-auto w-full px-6 pb-16 space-y-8 animate-fade-in-down">
        <ScoreCalculator data={data} />
      </main>
    </div>
  );
}
