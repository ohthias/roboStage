"use client";

import { Navbar } from "@/components/UI/Navbar";
import { Footer } from "@/components/UI/Footer";
import { PLATFORM_FEATURES } from "./constants";
import { FeatureCard } from "@/components/About/FeatureCard";
import { HeroSection } from "@/components/About/HeroSection";
import { TeamSpacesSection } from "@/components/About/TeamSpacesSection";
import { FAQSection } from "@/components/About/FAQSection";
import {
  Code,
  Database,
  Github,
  Linkedin,
  Newspaper,
  Plus,
  Users,
} from "lucide-react";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import { useRouter } from "next/navigation";

export default function AboutRoboStage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <section className="py-16 md:py-28 bg-base-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-base-100 to-transparent opacity-50"></div>
          <RevealOnScroll>
            <div className="max-w-6xl mx-auto px-4 relative z-10">
              <div className="flex flex-col lg:flex-row gap-12 items-start">
                <div className="lg:w-2/3 order-2 lg:order-1">
                  <div className="bg-base-100 p-8 md:p-12 rounded-3xl shadow-sm border border-base-300 relative">
                    <div className="absolute -top-6 -left-2 text-secondary text-8xl font-serif select-none pointer-events-none opacity-50">
                      &ldquo;
                    </div>
                    <div className="prose prose-blue prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-700 space-y-6">
                      <p className="leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-3 first-letter:float-left text-base-content">
                        O <strong>RoboStage</strong> nasceu da necessidade real
                        de um mentor. Matheus Gabriel percebeu que a paixão pela
                        robótica educacional muitas vezes era freada pela
                        burocracia de planilhas infinitas e documentos perdidos.
                      </p>
                      <p className="leading-relaxed text-base-content">
                        O que começou como o{" "}
                        <span className="text-primary font-semibold">
                          ShowLive
                        </span>{" "}
                        — um hub para micro eventos da FLL — rapidamente se
                        transformou em algo maior. A comunidade pedia por mais:
                        queriam documentar testes, criar estratégias e provar
                        que seus robôs evoluíam através de dados estatísticos
                        sólidos.
                      </p>
                      <p className="leading-relaxed text-base-content">
                        Hoje, o ecossistema abrange desde a análise inicial da
                        temporada com o{" "}
                        <span className="font-medium text-secondary">
                          QuickBrick
                        </span>{" "}
                        até o diário de bordo digital completo no{" "}
                        <span className="font-medium text-secondary">
                          Workspace
                        </span>
                        . É uma plataforma feita por quem vive a robótica para
                        quem quer vencer nela.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Creator Card */}
                <div className="lg:w-1/3 order-1 lg:order-2 w-full">
                  <div className="bg-base-100 rounded-3xl p-8 border border-base-300 shadow-xl shadow-secondary/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>

                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-gradient-to-tr from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                        <Code className="w-10 h-10 text-primary-content" />
                      </div>

                      <h3 className="text-2xl font-bold text-base-content mb-1">
                        Matheus Gabriel
                      </h3>
                      <p className="text-primary font-medium text-sm mb-4">
                        Fundador & Desenvolvedor
                      </p>
                      <p className="text-base-content text-sm leading-relaxed mb-8">
                        Entusiasta, mentor de robótica e arquiteto de soluções
                        digitais focado em potencializar o aprendizado através
                        da tecnologia.
                      </p>

                      <div className="space-y-3">
                        <a
                          href="https://github.com/ohthias"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-neutral/80 text-neutral-content rounded-xl font-bold hover:bg-neutral transition-all shadow-md active:scale-[0.98]"
                        >
                          <Github className="text-xl" />
                          Ver no GitHub
                        </a>
                        <a
                          href="https://www.linkedin.com/in/mathgab/"
                          className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-base-200 text-base-content border border-base-content/20 rounded-xl font-bold hover:bg-base-300 transition-all"
                        >
                          <Linkedin className="text-xl" />
                          LinkedIn
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>
        <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-base-content mb-4">
                Nosso Ecossistema
              </h2>
              <p className="text-base-content max-w-2xl mx-auto text-sm md:text-base">
                Desenvolvemos ferramentas específicas para cada pilar de uma
                temporada de robótica, do técnico ao administrativo.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {PLATFORM_FEATURES.map((feature, idx) => (
                <FeatureCard key={idx} {...feature} />
              ))}
            </div>
          </RevealOnScroll>
        </section>

        {/* Philosophy & Team Section */}
        <section className="py-16 md:py-20 bg-secondary relative overflow-hidden">
          <RevealOnScroll>
            <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-secondary-content mb-6 md:mb-8">
                Nunca estamos sozinhos, estamos em equipe.
              </h2>
              <p className="text-secondary-content text-base md:text-lg leading-relaxed mb-10 md:mb-12">
                O RoboStage permite a criação de espaços de equipe
                compartilhados, onde testes, documentos e anotações ficam
                centralizados com acesso para todos os membros.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                <div className="p-6 bg-base-100/20 rounded-2xl backdrop-blur-sm border border-base-100 flex flex-row items-center gap-4">
                  <Users className="w-8 h-8 text-secondary-content" />
                  <h4 className="text-white font-bold text-sm md:text-base">
                    Colaborativo
                  </h4>
                </div>
                <div className="p-6 bg-base-100/20 rounded-2xl backdrop-blur-sm border border-base-100 flex flex-row items-center gap-4">
                  <Database className="w-8 h-8 text-secondary-content" />
                  <h4 className="text-white font-bold text-sm md:text-base">
                    Baseado em Dados
                  </h4>
                </div>
                <div className="p-6 bg-base-100/20 rounded-2xl backdrop-blur-sm border border-base-100 flex flex-row items-center gap-4">
                  <Newspaper className="w-8 h-8 text-secondary-content" />
                  <h4 className="text-white font-bold text-sm md:text-base">
                    Feedback Contínuo
                  </h4>
                </div>
              </div>
            </div>
          </RevealOnScroll>
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-indigo-900 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
          </div>
        </section>

        {/* Team Spaces Section */}
        <TeamSpacesSection />

        {/* Contact/CTA */}
        <section className="py-16 md:py-24 text-center">
          <RevealOnScroll>
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-base-content mb-6">
                Tem uma sugestão?
              </h2>
              <p className="text-base-content/80 mb-8 md:mb-10 text-base md:text-lg">
                Nosso objetivo é continuar evoluindo. Se você quer contribuir ou
                dar um feedback, entre em contato conosco.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
                <button
                  className="bg-primary/80 text-primary-content px-8 py-4 rounded-xl font-bold text-base md:text-lg hover:bg-primary transition-all shadow-lg hover:shadow-primary/50 flex items-center justify-center gap-2 cursor-pointer"
                  onClick={() =>
                    (window.location.href =
                      "https://github.com/ohthias/roboStage/issues")
                  }
                >
                  <Plus className="w-4 h-4" /> Adicionar Sugestão
                </button>
                <button
                  className="bg-base-200 text-base-content border border-base-300 px-8 py-4 rounded-xl font-bold text-base md:text-lg hover:bg-base-300/70 transition-all shadow-lg hover:shadow-base-300/50 flex items-center justify-center gap-2 cursor-pointer"
                  onClick={() =>
                    (window.location.href =
                      "https://github.com/ohthias/roboStage/wiki")
                  }
                >
                  Ver Documentação
                </button>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* FAQ Section */}
        <FAQSection />
        <section className="py-28 bg-base-100">
          <RevealOnScroll>
            <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-black uppercase">
                Pronto para essa jornada?
              </h2>

              <button
                className="btn btn-primary btn-lg px-20 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
                onClick={() => {
                  router.push("/auth/signup");
                }}
              >
                Criar conta no RoboStage
              </button>
            </div>
          </RevealOnScroll>
        </section>
      </main>
      <Footer />
    </div>
  );
}
