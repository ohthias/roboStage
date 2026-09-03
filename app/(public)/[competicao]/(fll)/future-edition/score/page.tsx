"use client";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import missionsData from "@/public/data/fll/future-edition.json";
import { MissionsData } from "@/app/(public)/[competicao]/(fll)/future-edition/score/scoring.type";
import ScoreCalculator from "@/components/FormMission/Future-Edition/ScoreCalculator";
import Timer from "@/components/FormMission/Timer";
import { SeasonBanner } from "@/components/FormMission/SeasonBanner";

const data = missionsData as MissionsData;

export default function FutureEditionScorePage() {
  return (
    <div className="flex flex-col min-h-screen space-y-8 bg-base-200 px-6">
      <header className="max-w-5xl mx-auto w-full pt-8">
        <Breadcrumbs start="fll" />
        <SeasonBanner
          logo="/images/logos/fll/seasons/bioglow_logo_future_edition.webp"
          logoAlt="Logo BIOGLOW Future Edition"
          title="BIOGLOW"
          description="Baseado nos kits LEGO® Education Computer Science & AI."
        />
      </header>

      <Timer
        duration={150}
        startSound="/sounds/start.mp3"
        endSound="/sounds/end.mp3"
        onFinish={() => {
          console.log("Tempo encerrado!");
        }}
        className="animate-fade-in-down max-w-5xl w-full mx-auto"
      />

      <main className="max-w-5xl mx-auto w-full px-6 pb-8 space-y-8 animate-fade-in-down">
        <ScoreCalculator data={data} />
      </main>
    </div>
  );
}
