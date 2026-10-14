"use client";

import UseCasesSection from "@/components/competicoes/FLL/Components/UseCasesSection";
import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import NoiseImage from "@/components/UI/NoiseImage";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import { ChevronRight, Newspaper } from "lucide-react";
import Link from "next/link";
import HeroSection from "@/components/UI/HeroSection";

export default function Page() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <main className="bg-base-100">
        <div className="bg-neutral">
          <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-16 md:px-12 md:py-20 lg:flex-row lg:items-stretch">
            <div className="flex flex-1 flex-col justify-center rounded-tl-[30px] rounded-br-[30px] bg-base-200 p-8 md:p-10">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Muito mais que uma{" "}
                <span className="inline-block bg-primary px-2 text-primary-content">
                  plataforma
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-lg leading-relaxed text-base-content/70">
                O RoboStage reúne tudo o que acontece no universo da robótica em
                um só lugar. Conectando equipes, pessoas, projetos e competições
                para tornar cada etapa mais simples de acompanhar e participar.
              </p>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-base-content/60">
                Da preparação à competição, encontre ferramentas para organizar
                sua equipe, acompanhar seus projetos e viver a robótica com mais
                conexão, clareza e propósito.
              </p>
            </div>

            <div className="relative min-h-[280px] flex-1 overflow-hidden rounded-tl-[30px] rounded-br-[30px] bg-primary">
              <img
                src="https://www.seattleschools.org/wp-content/uploads/2026/01/990A0831-scaled.jpg"
                alt="Robótica e competição"
                className="object-cover transition-transform duration-500 hover:scale-105 h-full w-full"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/20 to-transparent" />
            </div>
          </section>
        </div>
        {/* Competições */}
        <section className="pt-16 pb-24 bg-base-100">
          <RevealOnScroll>
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                  Um lar para cada
                  <br />
                  <span className="bg-accent px-2 inline-block">
                    competição
                  </span>{" "}
                  de robótica
                </h2>
                <p className="mt-6 text-lg text-base-content/70">
                  Soluções específicas para equipes, torneios e comunidades de
                  cada modalidade.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                {/* FLL */}
                <Link
                  href="/fll"
                  className="group relative isolate min-h-[300px] overflow-hidden rounded-tl-[32px] rounded-br-[32px] bg-primary text-primary-content transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 lg:col-span-5"
                >
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2MaJHxvQaDf651mvznuwe3TPQ0RjcFLNHypBRED4X8z9LnoAHlr5ATQU&s=10"
                    alt="Equipe FIRST LEGO League em competição"
                    className="absolute inset-0 -z-20 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-primary via-primary/75 to-primary/15 transition-opacity duration-500 group-hover:opacity-95" />
                  <div className="flex min-h-[300px] flex-col justify-between p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-3">
                      <span className="badge badge-neutral">
                        Disponível agora
                      </span>
                      <span className="flex size-10 items-center justify-center rounded-full border border-primary-content/30 bg-primary-content/10 transition-all duration-300 group-hover:rotate-[-45deg] group-hover:bg-primary-content group-hover:text-primary">
                        <ChevronRight size={22} />
                      </span>
                    </div>
                    <div className="max-w-lg transition-transform duration-500 group-hover:translate-x-1">
                      <h3 className="text-3xl font-black tracking-tight sm:text-4xl xl:text-5xl text-white">
                        FIRST LEGO League
                      </h3>
                      <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
                        Organize documentos, registre testes e desenvolva
                        estratégias para levar sua equipe mais longe.
                      </p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white">
                        Explorar plataforma
                        <ChevronRight
                          size={18}
                          className="transition-transform duration-300 group-hover:translate-x-2"
                        />
                      </span>
                    </div>
                  </div>
                </Link>

                {/* OBR */}
                <Link
                  href="/obr"
                  className="group relative isolate min-h-[300px] overflow-hidden rounded-tl-[32px] rounded-br-[32px] bg-secondary text-secondary-content transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-secondary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-4 lg:col-span-4"
                >
                  <img
                    src="https://imgs.search.brave.com/_03sbcescxM_touUXL3zkaldk6AwnPGzF3OE_PwYyMA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9vYnIu/cm9ib2N1cC5vcmcu/YnIvd3AtY29udGVu/dC91cGxvYWRzLzIw/MjYvMDMvUmVzZ2F0/ZS1PQlItMS0xMDI0/eDY4My5qcGc"
                    alt="Equipe participando da Olimpíada Brasileira de Robótica"
                    className="absolute inset-0 -z-20 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                  />

                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-secondary via-secondary/80 to-secondary/15 transition-opacity duration-500 group-hover:opacity-95" />
                  <div className="flex min-h-[300px] flex-col justify-between p-6 sm:p-7">
                    <div className="flex items-center justify-between gap-3">
                      <span className="badge badge-neutral">
                        Disponível agora
                      </span>
                      <span className="flex size-10 items-center justify-center rounded-full border border-secondary-content/30 bg-secondary-content/10 transition-all duration-300 group-hover:rotate-[-45deg] group-hover:bg-secondary-content group-hover:text-secondary">
                        <ChevronRight size={22} />
                      </span>
                    </div>
                    <div className="transition-transform duration-500 group-hover:translate-x-1 text-white">
                      <h3 className="text-4xl font-black tracking-tight sm:text-5xl text-white">
                        OBR
                      </h3>
                      <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85">
                        Crie arenas, pontue partidas e acompanhe o desempenho
                        das equipes.
                      </p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white">
                        Explorar ferramentas
                        <ChevronRight
                          size={18}
                          className="transition-transform duration-300 group-hover:translate-x-2"
                        />
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Modalidades futuras */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-1">
                  {/* FTC */}
                  <div className="group relative flex min-h-[140px] flex-col justify-between overflow-hidden rounded-tl-[28px] rounded-br-[28px] border border-base-300 bg-base-200 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-secondary/50 hover:bg-base-200 hover:shadow-lg sm:min-h-0 lg:min-h-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="badge badge-ghost">Em breve</span>
                      <span className="text-base-content/30 transition-transform duration-300 group-hover:rotate-12 group-hover:text-secondary">
                        <ChevronRight size={20} />
                      </span>
                    </div>

                    <div>
                      <h3 className="text-3xl font-black text-base-content/60 transition-colors duration-300 group-hover:text-secondary">
                        FTC
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-base-content/60">
                        Ferramentas para equipes da FIRST Tech Challenge.
                      </p>
                    </div>
                  </div>

                  {/* Novas modalidades */}
                  <div className="group relative flex min-h-[140px] flex-col justify-between overflow-hidden rounded-tl-[28px] rounded-br-[28px] border border-dashed border-base-300 bg-base-200/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-base-200 hover:shadow-lg sm:min-h-0 lg:min-h-0">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-light text-base-content/40 transition-transform duration-300 group-hover:rotate-90 group-hover:text-primary">
                        +
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-base-content/40">
                        Em expansão
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-base-content/70">
                        Mais possibilidades
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-base-content/60">
                        Novas modalidades e ferramentas para a comunidade
                        robótica.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        <UseCasesSection />

        <section className="bg-[#091A07] w-full flex flex-col md:flex-row gap-8">
          <div className="max-w-2xl md:ml-16 px-6 md:px-4 text-white flex flex-col justify-center items-start gap-4 py-16">
            <h3 className="text-2xl md:text-3xl font-bold">FIRST® CANOPY™</h3>
            <p className="text-sm md:text-md">
              Nada na Terra prospera sozinha. Cada gene, espécie e ecossistema
              faz parte de uma teia viva de diversidade biológica. Com STEM como
              ferramenta e a natureza como inspiração.
            </p>
            <Link
              className="btn btn-neutral btn-outline btn-sm md:btn-md"
              href="/robostage-canopy"
            >
              Conheça!
            </Link>
            <a
              href="https://www.magnific.com/br/vetores-gratis/fundo-organico-de-selva-plana_13839964.htm#fromView=search&page=2&position=5&uuid=0d42a9de-b5ff-41eb-a3d4-967b0ab14993&query=canopy+florest"
              className="text-xs opacity-20"
            >
              Imagem de freepik
            </a>
          </div>

          <div className="w-full md:max-w-1/2 relative h-64 md:h-auto">
            <img
              src="images/index/canopy.webp"
              className="w-full h-full object-cover"
            />
            <div
              className="hidden md:block absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(to left, transparent, #091A07)`,
              }}
            />
            <div
              className="block md:hidden absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(to top, transparent, #091A07)`,
              }}
            />
          </div>
        </section>

        <section className="mx-auto mb-16 max-w-7xl px-6 md:mb-20 md:px-12 mt-16">
          <div className="relative overflow-hidden rounded-tl-[30px] rounded-br-[30px] bg-base-200/60 px-6 py-10 md:px-10 md:py-12">
            <div className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full border border-secondary/20" />

            <div className="relative z-10 max-w-3xl">
              <h3 className="text-2xl font-black leading-tight tracking-tight md:text-3xl">
                Um{" "}
                <span className="inline-block bg-secondary px-2 text-secondary-content">
                  projeto independente
                </span>
                , construído com a comunidade.
              </h3>

              <div className="mt-5 border-l-2 border-secondary pl-5">
                <p className="text-base leading-7 text-base-content/70 md:text-lg">
                  O RoboStage é desenvolvido de forma independente e evolui em
                  colaboração com equipes de robótica, organizadores e
                  voluntários que testam a plataforma, compartilham experiências
                  e ajudam a definir seus próximos passos.
                </p>

                <p className="mt-3 text-base leading-7 text-base-content/60">
                  Cada atualização parte de situações reais vividas dentro das
                  competições e busca transformar essas experiências em
                  ferramentas úteis para toda a comunidade.
                </p>
              </div>

              <div className="mt-7">
                <Link
                  href="/news"
                  className="btn btn-outline rounded-tl-xl rounded-br-xl border-secondary text-base-content hover:bg-secondary hover:text-secondary-content"
                >
                  <Newspaper size={17} />
                  Acompanhar novidades
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="w-full h-10 bg-gradient-to-t from-neutral to-base-100 " />
        <section className="w-full bg-neutral text-neutral-content py-24 px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black leading-tight">
              O próximo evento começa aqui!
            </h2>
            <p className="mt-6 text-lg md:text-xl text-neutral-content/70 max-w-3xl mx-auto">
              Se você compete, organiza, ensina, aprende ou simplesmente ama
              robótica, existe um lugar esperando por você.
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
                href="/fll"
              >
                Começar na FLL
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
