"use client";
import { Footer } from "../../UI/Footer";
import Hero from "../../Hero";
import { ModuleCard } from "./Components/FLLModules";
import {
  Radio,
  Trophy,
  Palette,
  MessageCircleQuestion,
  Cuboid,
  ChartPie,
  File,
  TreeDeciduous,
} from "lucide-react";
import FLLCountdownBanner from "./Components/FLLCountdownBanner";
import UseCasesSection from "./Components/UseCasesSection";
import FLLRoadmap from "./Components/FLLRoadmap";
import Link from "next/link";
import Banner from "@/components/Banner";
import NoiseImage from "@/components/UI/NoiseImage";

const modules = [
  {
    title: "LabTest",
    description:
      "Crie testes e runs para registrarem o progresso do desempenho do robô durante a temporada.",
    color: "bg-warning",
    icon: <ChartPie size={96} strokeWidth={1.5} />,
  },
  {
    title: "InnoLab",
    description:
      "Estruture projetos de inovação, organize pesquisas, registre evidências, acompanhe o progresso e desenvolva apresentações impactantes.",
    color: "bg-primary",
    icon: <File size={96} strokeWidth={1.5} />,
  },
  {
    title: "ShowLive",
    description:
      "Gerencie e transmita torneios em tempo real, acompanhe rankings, resultados e compartilhe a experiência com equipes e espectadores.",
    color: "bg-orange-600",
    icon: <Radio size={96} strokeWidth={1.5} />,
  },
  {
    title: "QuickBrick Studio",
    description:
      "Planeje estratégias de missões, analise mesas da temporada, registre soluções e desenvolva táticas para maximizar sua pontuação.",
    color: "bg-red-600",
    icon: <Cuboid size={96} strokeWidth={1.5} />,
  },
  {
    title: "Pontuador",
    description:
      "Simule partidas, calcule pontuações rapidamente e avalie diferentes estratégias para otimizar o desempenho do robô.",
    color: "bg-amber-500",
    icon: <Trophy size={96} strokeWidth={1.5} />,
  },
  {
    title: "Perguntas & Respostas",
    description:
      "Realize treinos de sessões de perguntas e respostas, prepare-se para entrevistas e desenvolva habilidades de comunicação para apresentações e avaliações.",
    color: "bg-lime-600",
    icon: <MessageCircleQuestion size={96} strokeWidth={1.5} />,
  },
  {
    title: "StyleLab",
    description:
      "Desenvolva identidades visuais, materiais gráficos, apresentações e conteúdos que destacam a personalidade da sua equipe.",
    color: "bg-sky-500",
    icon: <Palette size={96} strokeWidth={1.5} />,
  },
];

export default function FLLHome() {
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <main className="mt-16">
        <Hero />
        <Banner />
        <section className="py-12 md:py-16 max-w-7xl mx-auto my-8">
          <div className="px-4 sm:px-6">
            <div className="flex flex-col xl:flex-row gap-10 xl:gap-16 items-start">
              <div className="w-full xl:max-w-md flex-shrink-0">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-base-content leading-tight">
                  O que é o <span className="text-primary">RoboStage</span>?
                </h2>
                <p className="mt-4 text-base sm:text-lg text-base-content/80 leading-relaxed">
                  É a plataforma que conecta todo o universo da FIRST LEGO
                  League em um único lugar.
                </p>
                <p className="mt-4 text-base sm:text-lg text-base-content/80 leading-relaxed">
                  Chega de planilhas dispersas e documentos perdidos: o
                  RoboStage transforma informações em decisões, organização em
                  resultados e preparação em conquistas.
                </p>
              </div>

              <div className="grid w-full gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                <div className="bg-primary text-primary-content rounded-3xl p-6 lg:p-8 border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <span className="text-5xl font-black opacity-20">01</span>

                  <h3 className="mt-4 text-lg lg:text-xl font-bold">
                    Treine e desenvolva sua equipe
                  </h3>

                  <p className="mt-3 text-sm lg:text-base opacity-80 leading-relaxed">
                    Gerencie integrantes, aplique testes, acompanhe evolução e
                    registre resultados durante toda a temporada.
                  </p>
                </div>
                <div className="bg-secondary text-secondary-content rounded-3xl p-6 lg:p-8 border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <span className="text-5xl font-black opacity-20">02</span>
                  <h3 className="mt-4 text-lg lg:text-xl font-bold">
                    Planeje sua temporada
                  </h3>
                  <p className="mt-3 text-sm lg:text-base opacity-80 leading-relaxed">
                    Organize missões, projetos de inovação, apresentações e
                    estratégias em um único ambiente.
                  </p>
                </div>
                <div className="bg-warning text-warning-content rounded-3xl p-6 lg:p-8 border border-black/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <span className="text-5xl font-black opacity-20">03</span>
                  <h3 className="mt-4 text-lg lg:text-xl font-bold">
                    Gerencie torneios
                  </h3>
                  <p className="mt-3 text-sm lg:text-base opacity-80 leading-relaxed">
                    Rankings, dashboards, transmissões e todas as informações
                    necessárias para seus eventos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-neutral text-neutral-content w-full py-16 mt-8">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-stretch gap-8 md:gap-12">
            <div className="flex-1 w-full">
              <img
                src="/images/fll/fll_about.jpg"
                alt="Equipe participando da FIRST LEGO League"
                className="w-full h-full max-h-[400px] object-cover rounded-box shadow-xl"
              />

              <p className="text-xs text-neutral-content/60 mt-2">
                Foto: LEGO® Education / FIRST® LEGO® League
              </p>
            </div>

            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Sobre a FLL
              </h2>

              <p className="text-base md:text-lg leading-relaxed opacity-90">
                A FIRST LEGO League (FLL) é uma competição internacional de
                robótica educacional para crianças e adolescentes. O objetivo da
                FLL é inspirar jovens a se interessarem por ciência, tecnologia,
                engenharia e matemática (STEM) por meio de desafios práticos e
                criativos.
              </p>

              <p className="text-base md:text-lg leading-relaxed opacity-90 mt-4">
                Os participantes formam equipes para projetar, construir e
                programar robôs usando peças LEGO, além de desenvolver soluções
                inovadoras para problemas do mundo real.
              </p>

              <div className="mt-6">
                <button
                  className="btn btn-outline"
                  onClick={() =>
                    window.open(
                      "https://www.firstinspires.org/robotics/fll",
                      "_blank",
                    )
                  }
                >
                  Conhecer a Competição
                </button>
              </div>
            </div>
          </div>
        </section>
        <FLLCountdownBanner />
        <section className="w-full py-24 bg-base-200">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col items-center text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black max-w-5xl leading-tight">
                Tudo que uma equipe FLL precisa
              </h2>
              <span className="text-2xl md:text-5xl font-black text-primary mt-2">
                Em um único lugar
              </span>
              <p className="mt-6 text-base-content/70 max-w-2xl text-lg">
                Planeje missões, acompanhe pontuações, desenvolva projetos de
                inovação, organize torneios e gerencie sua equipe sem precisar
                alternar entre várias ferramentas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {modules.map((module) => (
                <ModuleCard
                  key={module.title}
                  title={module.title}
                  description={module.description}
                  color={module.color}
                  icon={module.icon}
                />
              ))}
            </div>
          </div>
        </section>
        <UseCasesSection />
        {/* FLL Future Edition */}
        <NoiseImage variant="animated" noiseOpacity={0.15} className="relative">
          <section className="py-16 bg-gradient-to-r from-[#6BA612] to-[#25D9B8]">
            <div className="max-w-6xl mx-auto px-4">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#6BA612] to-[#25D9B8] text-primary-content">
                <div className="absolute inset-0 bg-black/50 w-full h-full" />
                {/* Glow */}
                <div className="absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -right-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />

                <div className="relative p-8 md:p-12">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                    <div className="max-w-3xl">
                      <img
                        src="https://www.firstinspires.org/hs-fs/hubfs/web/brand/season/2027/first_canopy_fll_bioglow_logo_horizontal_future_edition_rgb_fullcolor.png?width=1436&height=484&name=first_canopy_fll_bioglow_logo_horizontal_future_edition_rgb_fullcolor.png"
                        alt="BIOGLOW Future Edition"
                        className="max-w-[150px] h-auto mb-4"
                      />

                      <h2 className="text-3xl md:text-5xl font-black leading-tight">
                        Conheça a próxima geração da
                        <br />
                        FIRST LEGO League
                      </h2>

                      <p className="mt-4 text-lg opacity-90">
                        BIOGLOW™ Future Edition introduz novos kits LEGO®
                        Education Computer Science & AI, hardware sem fio e uma
                        experiência colaborativa baseada em alianças.
                      </p>
                    </div>

                    <div className="text-3xl font-black">04 AGO</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </NoiseImage>
        <FLLRoadmap />
        <section className="w-full bg-neutral text-neutral-content py-24 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-black leading-tight">
              Sua próxima temporada de FLL começa aqui
            </h2>
            <p className="mt-6 text-lg md:text-xl text-neutral-content/70 max-w-3xl mx-auto">
              Do planejamento ao torneio. Do primeiro teste à classificação.
              Organize sua equipe, acompanhe o progresso e evolua durante toda a
              temporada.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
              <button className="btn btn-primary rounded-2xl px-8">
                Criar conta grátis
              </button>
              <button className="btn btn-ghost text-neutral-content rounded-2xl px-8">
                Ver novidades da temporada
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
