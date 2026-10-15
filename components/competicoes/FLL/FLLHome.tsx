"use client";
import Hero from "../../Hero";
import { ModuleCard } from "./Components/FLLModules";
import {
  Trophy,
  MessageCircleQuestion,
  Cuboid,
  ChartPie,
  File,
  CircleAlertIcon,
  NotepadText,
  ArrowUpRight,
  CalendarDays,
  Users,
  Clock,
  ListCheck,
  MonitorDot,
} from "lucide-react";
import Banner from "@/components/Banner";
import NoiseImage from "@/components/UI/NoiseImage";
import Link from "next/link";
import FLLHighlightSeason from "./Components/FLLHighlightSeason";
import RevealOnScroll from "@/components/UI/RevealOnScroll";

const modules = [
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
    title: "Recall",
    description:
      "Realize treinos de sessões de perguntas e respostas, prepare-se para entrevistas e desenvolva habilidades de comunicação para apresentações e avaliações.",
    color: "bg-lime-600",
    icon: <MessageCircleQuestion size={96} strokeWidth={1.5} />,
  },
  {
    title: "Rubricas de Avaliação",
    description:
      "Crie e gerencie rubricas para avaliar o desempenho da sua equipe em diferentes categorias.",
    color: "bg-emerald-500",
    icon: <NotepadText size={96} strokeWidth={1.5} />,
  },
  {
    title: "Mapa de Empatia",
    description:
      "Entenda melhor as necessidades e desejos do seu público-alvo, criando soluções mais eficazes e inovadoras.",
    color: "bg-cyan-500",
    icon: <Users size={96} strokeWidth={1.5} />,
    featured: true,
  },
  {
    title: "Timers",
    description:
      "Gerencie o tempo de atividades, treinos e apresentações com precisão, garantindo que sua equipe esteja sempre dentro do cronograma.",
    color: "bg-yellow-500",
    icon: <Clock size={96} strokeWidth={1.5} />,
  },
  {
    title: "Partiu Mesa!",
    description:
      "Simulador de simples para teste de saídas. Para análise de desempenho do robô durante um teste de saída.",
    color: "bg-violet-500",
    icon: <MonitorDot size={96} strokeWidth={1.5} />,
  },
  {
    title: "Confia, Mas Confira!",
    description:
      "Checklist de verificação de itens para competições, seja para preparação ou para avaliação pós-evento.",
    color: "bg-green-500",
    icon: <ListCheck size={96} strokeWidth={1.5} />,
  },
];

export default function FLLHome() {
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <main className="mt-16">
        <Hero />
        <section className="py-12 md:pb-16 max-w-7xl mx-auto px-6 sm:px-8">
          <div className="relative mt-12">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 lg:items-stretch lg:gap-6 xl:gap-8">
              <div className="flex flex-col justify-center lg:col-span-1 lg:py-6">
                <h2 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-base-content sm:text-5xl lg:text-4xl xl:text-5xl">
                  O que é o <span className="text-primary">RoboStage?</span>
                </h2>
                <p className="mt-5 text-base leading-relaxed text-base-content/70">
                  Um ambiente que conecta pessoas, ideias e tecnologia em todas
                  as etapas da robótica educacional.
                </p>

                <p className="mt-3 text-sm leading-relaxed text-base-content/60">
                  Menos tempo organizando informações. Mais tempo construindo,
                  testando e inovando.
                </p>

                <div className="mt-6 flex items-center gap-3 border-t border-base-content/10 pt-5">
                  <div className="flex -space-x-2">
                    <span className="grid size-8 place-items-center rounded-full border-2 border-base-100 bg-primary text-xs font-black text-primary-content">
                      R
                    </span>
                    <span className="grid size-8 place-items-center rounded-full border-2 border-base-100 bg-secondary text-xs font-black text-secondary-content">
                      S
                    </span>
                    <span className="grid size-8 place-items-center rounded-full border-2 border-base-100 bg-warning text-xs font-black text-warning-content">
                      +
                    </span>
                  </div>

                  <span className="text-xs font-semibold leading-relaxed text-base-content/60">
                    Do planejamento à competição.
                    <span className="block text-base-content">
                      Tudo conectado em um só lugar.
                    </span>
                  </span>
                </div>
              </div>

              {/* Card 01 — Vermelho */}
              <RevealOnScroll>
                <article className="group relative flex h-full min-h-[310px] flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl border border-primary/20 bg-primary p-6 text-primary-content transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7">
                  <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full border-[24px] border-white/5 transition-transform duration-500 group-hover:scale-110" />

                  <div className="relative flex items-center justify-between">
                    <div className="grid size-11 place-items-center rounded-xl bg-white/15">
                      <Users size={22} />
                    </div>
                    <span className="font-mono text-xs font-bold text-white/50">
                      01 / 03
                    </span>
                  </div>

                  <div className="relative mt-8">
                    <h3 className="text-xl font-black leading-snug xl:text-2xl">
                      Desenvolva sua equipe
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-white/80">
                      Acompanhe integrantes, aplique testes e registre
                      resultados para transformar evolução em aprendizado
                      contínuo.
                    </p>
                  </div>

                  <div className="relative mt-auto flex items-center justify-between gap-2 pt-7">
                    <span className="text-xs font-bold uppercase tracking-wide text-white/70">
                      Treinamento
                    </span>
                    <ArrowUpRight
                      size={19}
                      className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </div>
                </article>
              </RevealOnScroll>

              {/* Card 02 — Azul */}
              <RevealOnScroll>
                <article className="group relative flex h-full min-h-[310px] flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl border border-secondary/20 bg-secondary p-6 text-secondary-content transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7">
                  <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full border-[24px] border-white/5 transition-transform duration-500 group-hover:scale-110" />

                  <div className="relative flex items-center justify-between">
                    <div className="grid size-11 place-items-center rounded-xl bg-white/15">
                      <CalendarDays size={22} />
                    </div>
                    <span className="font-mono text-xs font-bold text-white/50">
                      02 / 03
                    </span>
                  </div>

                  <div className="relative mt-8">
                    <h3 className="text-xl font-black leading-snug xl:text-2xl">
                      Planeje sua temporada
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-white/80">
                      Organize missões, projetos de inovação, documentos e
                      estratégias ao longo de toda a temporada.
                    </p>
                  </div>

                  <div className="relative mt-auto flex items-center justify-between gap-2 pt-7">
                    <span className="text-xs font-bold uppercase tracking-wide text-white/70">
                      Organização
                    </span>
                    <ArrowUpRight
                      size={19}
                      className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </div>
                </article>
              </RevealOnScroll>

              {/* Card 03 — Amarelo */}
              <RevealOnScroll>
                <article className="group relative flex h-full min-h-[310px] flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl border border-warning/50 bg-warning p-6 text-warning-content transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7">
                  <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full border-[24px] border-black/5 transition-transform duration-500 group-hover:scale-110" />

                  <div className="relative flex items-center justify-between">
                    <div className="grid size-11 place-items-center rounded-xl bg-black/5">
                      <Trophy size={22} />
                    </div>
                    <span className="font-mono text-xs font-bold opacity-50">
                      03 / 03
                    </span>
                  </div>

                  <div className="relative mt-8">
                    <h3 className="text-xl font-black leading-snug xl:text-2xl">
                      Conecte-se às competições
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed opacity-80">
                      Consulte rankings, acompanhe informações e utilize
                      ferramentas para preparar e organizar eventos.
                    </p>
                  </div>

                  <div className="relative mt-auto flex items-center justify-between gap-2 pt-7">
                    <span className="text-xs font-bold uppercase tracking-wide opacity-70">
                      Competições
                    </span>
                    <ArrowUpRight
                      size={19}
                      className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </div>
                </article>
              </RevealOnScroll>
            </div>
          </div>
        </section>
        <section className="bg-neutral text-neutral-content w-full py-16 mt-8">
          <RevealOnScroll>
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-stretch gap-8 md:gap-12">
              <div className="flex-1 w-full">
                <img
                  src="/images/fll/fll_about.jpg"
                  alt="Equipe participando da FIRST LEGO League"
                  className="w-full h-full max-h-[400px] object-cover"
                  style={{ boxShadow: "-10px -10px 0 #fabd32" }}
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
                  robótica educacional para crianças e adolescentes. O objetivo
                  da FLL é inspirar jovens a se interessarem por ciência,
                  tecnologia, engenharia e matemática (STEM) por meio de
                  desafios práticos e criativos.
                </p>

                <p className="text-base md:text-lg leading-relaxed opacity-90 mt-4">
                  Os participantes formam equipes para projetar, construir e
                  programar robôs usando peças LEGO, além de desenvolver
                  soluções inovadoras para problemas do mundo real.
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
          </RevealOnScroll>
        </section>
        <FLLHighlightSeason />
        <section className="w-full py-16 bg-base-200">
          <RevealOnScroll>
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex flex-col items-center text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-black max-w-5xl leading-tight">
                  Tudo que uma equipe FLL precisa{" "}
                  <span className="inline-block bg-primary text-primary-content px-3 py-1 italic -rotate-1">
                    Em um único lugar
                  </span>
                </h2>
                <p className="mt-6 text-base-content/70 max-w-2xl text-lg">
                  Planeje missões, acompanhe pontuações, desenvolva projetos de
                  inovação, organize torneios e gerencie sua equipe sem precisar
                  alternar entre várias ferramentas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {modules.map((module) => (
                  <ModuleCard
                    key={module.title}
                    title={module.title}
                    description={module.description}
                    color={module.color}
                    featured={module.featured}
                    icon={module.icon}
                  />
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </section>
        <Banner />
        <RevealOnScroll>
          <div className="bg-base-300">
            <NoiseImage
              variant="animated"
              noiseOpacity={0.2}
              className="relative"
            >
              <section className="py-16">
                <div className="max-w-6xl mx-auto px-4">
                  <div className="relative overflow-hidden rounded-3xl bg-[url(https://www.bischoff-ag.ch/thumbnail/0f/a0/d5/1782169686/45834_Lifestyle_Cons_19_7d6229d67aa1ee63977a4f49a9682fb43b5dfc10_800x800.png?ts=1782173521&nocache=1)] bg-cover bg-bottom bg-no-repeat bg-[#6FA61C] text-primary-content">
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

                          <h2 className="text-3xl md:text-5xl font-black leading-tight text-white">
                            Conheça a próxima geração da
                            <br />
                            FIRST LEGO League
                          </h2>

                          <p className="mt-4 text-lg opacity-90 text-white">
                            BIOGLOW™ Future Edition introduz novos kits LEGO®
                            Education Computer Science & AI, hardware sem fio e
                            uma experiência colaborativa baseada em alianças.
                          </p>
                          <Link
                            href="/fll/future-edition"
                            className="btn btn-sm btn-primary mt-6"
                          >
                            Conheça a Future Edition
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </NoiseImage>
          </div>
        </RevealOnScroll>
        <div className="w-full h-10 bg-gradient-to-t from-neutral to-base-300 " />
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
              <Link
                className="btn btn-primary rounded-2xl px-8"
                href="/sign-up"
              >
                Criar conta grátis
              </Link>
              <Link
                className="btn btn-ghost text-neutral-content rounded-2xl px-8"
                href="/news"
              >
                Ver novidades da temporada
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
