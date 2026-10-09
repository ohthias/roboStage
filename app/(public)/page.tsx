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

              <div className="flex flex-col gap-4 lg:flex-row">
                {/* FLL */}
                <Link
                  href="/fll"
                  className="group relative min-h-[190px] flex-1 overflow-hidden rounded-tl-[28px] rounded-br-[28px] bg-primary text-primary-content transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2MaJHxvQaDf651mvznuwe3TPQ0RjcFLNHypBRED4X8z9LnoAHlr5ATQU&s=10"
                    alt="Equipe FLL em competição"
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 via-45% to-primary/10" />
                  <div className="relative z-10 flex min-h-[190px] items-center p-5 sm:p-6">
                    <div className="max-w-xl">
                      <div className="badge badge-neutral mb-3">
                        Disponível agora
                      </div>
                      <h3 className="text-4xl font-black tracking-tight sm:text-5xl">
                        FIRST LEGO League
                      </h3>

                      <p className="mt-2 max-w-lg text-sm leading-relaxed opacity-80">
                        Organize sua documentação, acompanhe testes, estratégias
                        e gerencie tudo o que sua equipe precisa para competir
                        na FIRST LEGO League.
                      </p>
                    </div>
                    <ChevronRight
                      className="ml-auto hidden shrink-0 pr-2 text-2xl opacity-50 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100 sm:block"
                    />
                  </div>
                </Link>

                {/* FTC + Mais */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:w-[420px]">
                  {/* FTC */}
                  <div className="rounded-tl-[28px] rounded-br-[28px] border border-base-300 bg-base-200 px-5 py-5 transition-all hover:border-secondary/30 hover:bg-base-200/80">
                    <div className="badge badge-ghost mb-3">Em breve</div>

                    <h3 className="text-4xl font-black text-base-content/50">
                      FTC
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                      Recursos dedicados para equipes da FIRST Tech Challenge.
                    </p>
                  </div>

                  {/* Mais */}
                  <div className="rounded-tl-[28px] rounded-br-[28px] border border-dashed border-base-300 bg-base-200/50 px-5 py-5 transition-all hover:border-secondary/30">
                    <h3 className="text-4xl font-black text-base-content/40">
                      +
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                      Novas modalidades e programas serão adicionados
                      futuramente.
                    </p>
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
