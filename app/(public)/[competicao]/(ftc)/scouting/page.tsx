import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import Scouting from "@/features/leagues/ftc/components/Scouting";
import { FTCSCOUT } from "@/features/leagues/ftc/lib/ftcscout";
import Header from "@/components/layout/Header";

type Params = { params: Promise<{ competicao: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { competicao } = await params;
  if (competicao !== "ftc") return {};
  const description =
    "Scouting gratuito para a FTC BIOBUZZ com dados oficiais da FTCScout (ranking, agenda, placares e OPR): compare equipes, receba sugestões de duplas e simule a seleção de alianças dos playoffs.";
  return {
    title: { absolute: "Scouting FTC com sugestão de alianças | RoboStage" },
    description,
    alternates: { canonical: "/ftc/scouting" },
    openGraph: {
      title: "Scouting FTC | RoboStage",
      description,
      url: "/ftc/scouting",
      type: "website",
    },
  };
}

export default async function ScoutingPage({ params }: Params) {
  const { competicao } = await params;
  if (competicao !== "ftc") notFound();

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Header
        type="Estratégia"
        name="FTC Scouting"
        highlight=""
        description="Desempenho de cada equipe no evento e os melhores parceiros para as alianças, com dados oficiais da FTCScout."
      />

      <Scouting />
    </main>
  );
}
