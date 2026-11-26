import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import StrategyBuilder from "@/features/leagues/ftc/components/StrategyBuilder";
import { AnimatedBackground } from "@/features/home/components/shared";
import "@/features/home/components/home.css";
import Header from "@/components/layout/Header";

type Params = { params: Promise<{ competicao: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { competicao } = await params;
  if (competicao !== "ftc") return {};
  const description =
    "Monte o plano da aliança para o TELEOP da BIOBUZZ na fila da partida: funções por fase, metas por robô, pontos e RP estimados e briefing para o técnico.";
  return {
    title: { absolute: "Estratégia TeleOp | FTC BIOBUZZ | RoboStage" },
    description,
    alternates: { canonical: "/ftc/estrategia" },
    openGraph: {
      title: "Estratégia TeleOp | RoboStage",
      description,
      url: "/ftc/estrategia",
      type: "website",
    },
  };
}

export default async function EstrategiaPage({ params }: Params) {
  const { competicao } = await params;
  if (competicao !== "ftc") notFound();

  return (
    <main className="mx-auto max-w-6xl w-full py-8 space-y-8 px-4">
      <Header
        type="Estratégia"
        name="Estratégia"
        highlight="TeleOp"
        description="Feito para a fila da partida: escolha um plano rápido, ajuste a função de cada robô nas três fases do TELEOP
            e saia com o briefing pronto para o técnico. Os planos ficam salvos neste aparelho."
      />

      <StrategyBuilder />
    </main>
  );
}
