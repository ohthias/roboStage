import { Footer } from "@/components/UI/Footer";
import { PLATFORM_FEATURES } from "./constants";
import { FeatureCard } from "@/components/About/FeatureCard";
import { FAQSection } from "@/components/About/FAQSection";
import { Code, Github, Linkedin, Plus } from "lucide-react";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import { Navbar } from "@/components/UI/Navbar";
import CurvedLoop from "@/components/UI/CurvedLoop/CurvedLoop";
import Link from "next/link";

export const metadata = {
  title: "Sobre",
  description:
    "O RoboStage é um ecossistema completo para equipes de robótica, oferecendo ferramentas para planejamento, testes, inovação e eventos.",
};

export default function AboutRoboStage() {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Navbar />
      <header className="relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute bg-gradient-to-b from-base-100/50 to-base-200 h-[100px] bottom-0 w-full" />

        <div className="flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto h-full px-6 md:px-12 py-24 gap-16 mt-10">
          <div className="flex flex-col justify-center max-w-xl z-10 gap-4 select-none text-center">
            <RevealOnScroll>
              <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Construído por quem
                <br />
                <span className="text-primary-content bg-primary px-2 inline-block">
                  vive a robótica
                </span>
              </h1>
              <p className="font-semibold text-lg md:text-xl italic text-base-content/80">
                O que começou como uma solução para organizar eventos se
                transformou em um ecossistema que acompanha toda a jornada de
                uma temporada, do planejamento às competições.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-base-200">
        <RevealOnScroll>
          <section className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 md:py-16 flex flex-col gap-12 lg:flex-row items-center justify-center">
            <article className="prose max-w-none space-y-6 text-base-content prose-base lg:prose-lg">
              <p className="leading-relaxed first-letter:float-left first-letter:mr-3 first-letter:text-5xl first-letter:font-bold first-letter:text-primary">
                O <strong>RoboStage</strong> nasceu dentro de uma equipe de
                robótica. Não como uma grande ideia, mas como a tentativa de
                resolver um problema vivido todos os dias: informações
                espalhadas, estratégias difíceis de acompanhar e poucos recursos
                para registrar a evolução da equipe ao longo da temporada.
              </p>

              <p className="leading-relaxed">
                A primeira solução foi o{" "}
                <span className="font-semibold text-primary">ShowLive</span>, um
                hub criado para organizar microeventos da FIRST LEGO League. O
                que parecia resolver um único desafio revelou uma oportunidade
                maior: equipes precisavam de uma plataforma que acompanhasse
                toda a sua jornada, e não apenas o dia da competição.
              </p>
            </article>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKi5ble4F2bE8x_fVp8N_MmhIJ2eNNmdwmu3Fdu-_pGA&s=10"
              alt="Ecossistema do RoboStage"
              className="w-full h-auto shadow-[10px_10px_0_theme(colors.primary)]"
            />
          </section>
        </RevealOnScroll>
        <RevealOnScroll>
          <section className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 md:py-16 flex flex-col gap-12 lg:flex-row items-center justify-center flex-col-reverse">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjzvMhYVgrRWp-b93boCIZ7As2jVrzg4Y3-zXPi3Vv6svT0JPwbXDhJZs&s=10"
              alt="Ecossistema do RoboStage"
              className="w-full h-auto shadow-[10px_10px_0_theme(colors.secondary)]"
            />
            <p className="prose w-full lg:max-w-md space-y-6 text-base-content prose-base lg:prose-lg leading-relaxed">
              Foi assim que ele evoluiu para um ecossistema completo. Hoje,
              reuindo ferramentas que apoiam cada etapa da temporada. Do
              planejamento das estratégias com o{" "}
              <span className="font-semibold text-secondary-content bg-secondary px-2">
                QuickBrick Studio
              </span>
              , aos testes e análises de desempenho no round com o{" "}
              <span className="font-semibold text-secondary-content bg-secondary px-2">
                LabTest
              </span>
              , passando por inovação, eventos, cronômetros e muito mais. E essa
              evolução continua, construída lado a lado com a comunidade de
              robótica.
            </p>
          </section>
        </RevealOnScroll>
        <CurvedLoop
          marqueeText="Ecossistema ▪"
          speed={0.4}
          curveAmount={60}
          direction="right"
          interactive={false}
          className="fill-neutral-content mt-10"
        />
        <section className="mx-auto max-w-6xl sm:px-6 lg:px-8">
          <RevealOnScroll>
            <p className="text-base-content max-w-2xl text-base md:text-lg mx-auto leading-relaxed text-center mb-8">
              Desenvolvemos ferramentas específicas para cada pilar de uma
              temporada de robótica, do técnico ao administrativo.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {PLATFORM_FEATURES.map((feature, idx) => (
                <RevealOnScroll>
                  <FeatureCard key={idx} {...feature} />
                </RevealOnScroll>
              ))}
            </div>
          </RevealOnScroll>
        </section>

        <section className="bg-base-100 py-4 my-16">
          <RevealOnScroll>
            <div className="max-w-6xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="mt-6 text-4xl font-bold text-base-content">
                    <span className="text-primary-content bg-primary px-2">
                      Construído
                    </span>{" "}
                    por quem vive a robótica.
                  </h2>
                  <div className="mt-8 space-y-6 text-base-content/80 leading-relaxed">
                    <p>
                      O RoboStage é desenvolvido por{" "}
                      <strong className="text-base-content">
                        Matheus Gabriel
                      </strong>
                      , mentor de robótica e desenvolvedor de software
                      apaixonado por criar ferramentas que simplificam desafios
                      reais da comunidade.
                    </p>

                    <p>
                      A plataforma não nasceu de uma ideia de mercado, mas da
                      experiência adquirida dentro de equipes, acompanhando
                      temporadas, competições, testes e eventos. Cada
                      funcionalidade existe porque, em algum momento, ela fez
                      falta durante essa jornada.
                    </p>

                    <p>
                      Mais do que desenvolver software, o objetivo é construir
                      um ecossistema aberto que ajude estudantes, mentores e
                      organizadores a gastarem menos tempo organizando processos
                      e mais tempo aprendendo, criando e competindo.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-10">
                    <a
                      href="https://github.com/ohthias"
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                    >
                      GitHub
                    </a>

                    <a
                      href="https://www.linkedin.com/in/mathgab/"
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        <section className="py-2 md:py-4 overflow-hidden">
          <RevealOnScroll>
            <div className="max-w-6xl mx-auto px-4">
              <div className="relative overflow-hidden rounded-[2rem] bg-neutral text-neutral-content">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#12121275_1px,transparent_1px),linear-gradient(to_bottom,#12121275_1px,transparent_1px)] bg-[size:28px_28px]" />

                <div className="relative grid lg:grid-cols-2 gap-12 items-center p-8 md:p-14">
                  {/* Texto */}
                  <div className="text-center lg:text-left">
                    <h2 className="mt-6 text-4xl md:text-5xl font-black leading-tight">
                      O próximo capítulo
                      <br />
                      pode começar com a sua ideia.
                    </h2>

                    <p className="mt-6 text-lg leading-relaxed max-w-xl">
                      O RoboStage evolui a partir das necessidades reais de
                      equipes de robótica. Muitas das funcionalidades existentes
                      nasceram de sugestões, conversas e experiências
                      compartilhadas pela própria comunidade.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4">
                      <Link
                        className="btn btn-accent btn-lg"
                        href="https://github.com/ohthias/roboStage/issues"
                      >
                        <Plus className="w-5 h-5" />
                        Enviar sugestão
                      </Link>

                      <Link
                        className="btn btn-outline btn-lg"
                        href="https://github.com/ohthias/roboStage/"
                      >
                        Ver documentação
                      </Link>
                    </div>
                  </div>

                  {/* Ilustração */}
                  <div className="relative flex justify-center lg:justify-end">
                    <div className="absolute w-80 h-80 rounded-full bg-white/10 blur-3xl" />

                    <img
                      src="/images/index/ideias.svg"
                      alt="Comunidade contribuindo para o RoboStage"
                      className="relative w-full max-w-md drop-shadow-2xl"
                    />
                    <a href="https://storyset.com/idea" className="text-xs text-muted-foreground hover:underline">
                      Idea illustrations by Storyset
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        <FAQSection />
        <div className="w-full h-10 bg-gradient-to-t from-neutral to-transparent " />
        <section className="w-full bg-neutral text-neutral-content py-24 px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black leading-tight">
              Pronto para transformar sua temporada?
            </h2>
            <p className="mt-6 text-lg md:text-xl text-neutral-content/70 max-w-3xl mx-auto">
              Junte-se a equipes de robótica que já estão usando o RoboStage
              para planejar, testar, inovar e competir com mais eficiência.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
              <Link
                className="btn btn-primary rounded-2xl px-8"
                href="/auth/signup"
              >
                Comece agora gratuitamente
              </Link>
              <Link
                className="btn btn-ghost text-neutral-content rounded-2xl px-8"
                href="/fll"
              >
                Explorar funcionalidades
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
