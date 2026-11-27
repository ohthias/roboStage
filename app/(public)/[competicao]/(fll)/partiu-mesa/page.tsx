import type { Metadata } from "next";
import MissionTimer from "@/features/leagues/fll/partiu-mesa/components/MissionTimer";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Partiu Mesa! — Treine suas missões da FLL | RoboStage",
  description:
    "Monte uma sequência de missões da FLL, cronometre seus lançamentos e analise seu desempenho. Gratuito e sem login.",
};

export default function PartiuMesaPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-10 px-4 pb-24 pt-8">
      <Header
        type="Simulação"
        name=""
        highlight="Partiu Mesa!"
        description="Monte uma sequência de missões da temporada, cronometre seus lançamentos e analise seu desempenho. Exporte seus resultados e compartilhe com a equipe."
      />
      <MissionTimer />
    </main>
  );
}
