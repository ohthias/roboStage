import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import StrategyBuilder from "@/components/competicoes/FTC/StrategyBuilder";
import { AnimatedBackground } from "@/components/home/shared";
import "@/components/home/home.css";

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
    openGraph: { title: "Estratégia TeleOp | RoboStage", description, url: "/ftc/estrategia", type: "website" },
  };
}

export default async function EstrategiaPage({ params }: Params) {
  const { competicao } = await params;
  if (competicao !== "ftc") notFound();

  return (
    <main className="overflow-x-clip bg-base-100 text-base-content">
      <section className="relative isolate overflow-hidden px-6 pb-10 pt-12 sm:pt-16">
        <AnimatedBackground />
        <div className="mx-auto max-w-6xl">
          <nav aria-label="Trilha" className="font-mono text-xs tracking-[0.15em] text-base-content/45">
            <Link href="/ftc" className="hover:text-primary">/FTC</Link> / ESTRATÉGIA
          </nav>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
            Estratégia TeleOp<span className="text-primary">.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-base-content/65 sm:text-lg">
            Feito para a fila da partida: escolha um plano rápido, ajuste a função de cada robô nas três fases do TELEOP
            e saia com o briefing pronto para o técnico. Os planos ficam salvos neste aparelho.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <Link href="/ftc/scouting" className="inline-flex items-center gap-1 font-bold hover:text-primary">
              Usar dados do scouting <ArrowRight size={15} />
            </Link>
            <Link href="/ftc/arena#pontuacao" className="inline-flex items-center gap-1 font-bold text-base-content/60 hover:text-primary">
              Tabela de pontos <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <StrategyBuilder />
        </div>
      </section>
    </main>
  );
}
