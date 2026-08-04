"use client";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import missionsData from "@/public/data/fll/future-edition.json";
import { MissionsData } from "@/app/(public)/[competicao]/(fll)/future-edition/score/scoring.type";
import ScoreCalculator from "@/components/competicoes/FLL/Components/Future-Edition/ScoreCalculator";

const data = missionsData as MissionsData;

export default function FutureEditionScorePage() {
  return (
    <div className="flex flex-col min-h-screen space-y-8 py-10">
      <header className="max-w-6xl mx-auto w-full px-6">
        <Breadcrumbs start="fll" />
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h1 className="inline-block bg-secondary text-secondary-content px-3 py-1 italic font-black text-5xl">
              Future Edition
            </h1>
            <p className="uppercase tracking-widest text-secondary mt-3 font-semibold">
              Baseado nos kits LEGO® Education Computer Science & AI
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-6">
        <ScoreCalculator data={data} />
      </main>
    </div>
  );
}