import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import Scouting from "@/components/competicoes/FTC/Scouting";
import { AnimatedBackground } from "@/components/home/shared";
import "@/components/home/home.css";

type Params = { params: Promise<{ competicao: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { competicao } = await params;
  if (competicao !== "ftc") return {};
  const description =
    "Scouting gratuito para a FTC BIOBUZZ: registre cada robô do evento, compare médias e receba sugestões de duplas e uma simulação da seleção de alianças dos playoffs.";
  return {
    title: { absolute: "Scouting FTC com sugestão de alianças | RoboStage" },
    description,
    alternates: { canonical: "/ftc/scouting" },
    openGraph: { title: "Scouting FTC | RoboStage", description, url: "/ftc/scouting", type: "website" },
  };
}

export default async function ScoutingPage({ params }: Params) {
  const { competicao } = await params;
  if (competicao !== "ftc") notFound();

  return (
    <main className="overflow-x-clip bg-base-100 text-base-content">
      <section className="relative isolate overflow-hidden px-6 pb-10 pt-12 sm:pt-16">
        <AnimatedBackground />
        <div className="mx-auto max-w-6xl">
          <nav aria-label="Trilha" className="font-mono text-xs tracking-[0.15em] text-base-content/45">
            <Link href="/ftc" className="hover:text-primary">/FTC</Link> / SCOUTING
          </nav>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
            Scouting FTC<span className="text-primary">.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-base-content/65 sm:text-lg">
            Cadastre a sua equipe e o evento, anote cada robô em cada partida e chegue na seleção de alianças sabendo quem
            completa o seu jogo. Funciona sem login e cada registro é salvo no próprio aparelho, sem depender da internet
            do ginásio; depois é só juntar com os arquivos dos outros scouts.
          </p>
          <ol className="mt-6 flex flex-wrap gap-2 font-mono text-xs">
            {["1 · Evento e equipes", "2 · Registrar partidas", "3 · Comparar equipes", "4 · Duplas para os playoffs"].map((s) => (
              <li key={s} className="rounded-tl-md rounded-br-md border border-base-300 bg-base-100 px-2.5 py-1 text-base-content/70">{s}</li>
            ))}
          </ol>
          <Link href="/ftc/estrategia" className="mt-5 inline-flex items-center gap-1 text-sm font-bold hover:text-primary">
            Levar os dados para a Estratégia TeleOp <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Scouting />
        </div>
      </section>
    </main>
  );
}
