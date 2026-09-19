import type { Metadata } from "next";
import MissionTimer from "@/components/competicoes/FLL/partiu-mesa/MissionTimer";
import Header from "@/components/UI/Header";

export const metadata: Metadata = {
  title: "Partiu Mesa! — Treine suas missões da FLL | RoboStage",
  description:
    "Monte uma sequência de missões da FLL, cronometre seus lançamentos e analise seu desempenho. Gratuito e sem login.",
};

export default function PartiuMesaPage() {
  return (
    <div className="bg-base-200/40 min-h-screen">
      <main className="mx-auto min-h-screen max-w-6xl px-4 space-y-8 pt-8 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <Header
          name=""
          highlight="Partiu Mesa!"
          description="Monte uma sequência de missões da temporada, cronometre seus lançamentos e analise seu desempenho. Exporte seus resultados e compartilhe com a equipe."
          type="Simulação"
        />

        <section className="pb-24">
          <MissionTimer />
        </section>
      </main>
    </div>
  );
}
