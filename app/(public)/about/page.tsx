import { Footer } from "@/components/UI/Footer";
import { PLATFORM_FEATURES } from "./constants";
import { FeatureCard } from "@/components/About/FeatureCard";
import { FAQSection } from "@/components/About/FAQSection";
import { ArrowRight, BookOpen, Boxes, BrainCircuit, CheckCircle2, Code, Code2, ExternalLink, Github, Lightbulb, Linkedin, Plus, Radio, Rocket, Sparkles, Target, Users, Wrench } from "lucide-react";
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

      <main className="flex-1 overflow-hidden">
        <header className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
          <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:32px_32px]" />

          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[120px]" />

          <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-base-200 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12 py-24">
            <div className="max-w-4xl">
              <RevealOnScroll>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                  Construído por quem
                  <br />
                  <span className="inline-block bg-primary text-primary-content px-3 py-2 mt-3 -rotate-1">
                    vive a robótica.
                  </span>
                </h1>

                <p className="mt-10 max-w-2xl text-lg md:text-xl text-base-content/65 leading-relaxed">
                  O RoboStage nasceu dentro de uma equipe de robótica e
                  evoluiu para um ecossistema de ferramentas criado para
                  acompanhar toda a jornada de uma temporada.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-10">
                  <Link
                    href="/fll"
                    className="btn btn-primary btn-lg rounded-xl"
                  >
                    Explorar o RoboStage
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  <Link
                    href="#historia"
                    className="btn btn-ghost btn-lg rounded-xl"
                  >
                    Conhecer nossa história
                  </Link>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </header>

        <section
          id="historia"
          className="bg-base-200 py-24 md:py-32 px-6"
        >
          <div className="max-w-6xl mx-auto">
            <RevealOnScroll>
              <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-24 items-start">
                <div>
                  <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                    De onde veio
                  </span>

                  <h2 className="text-4xl md:text-5xl font-black mt-4 leading-tight">
                    Antes de ser uma plataforma, era um problema.
                  </h2>
                </div>

                <div className="space-y-6 text-lg text-base-content/70 leading-relaxed">
                  <p>
                    O <strong className="text-base-content">RoboStage</strong>{" "}
                    nasceu dentro de uma equipe de robótica. Não como uma
                    grande ideia de mercado, mas como uma tentativa de resolver
                    problemas reais vividos durante uma temporada.
                  </p>

                  <p>
                    Informações espalhadas, estratégias difíceis de acompanhar,
                    resultados que se perdiam e poucos recursos para registrar
                    a evolução da equipe. A tecnologia começou como uma
                    resposta simples para tornar esse processo mais organizado.
                  </p>

                  <p>
                    Com o tempo, ficou claro que o problema era maior. Equipes
                    não precisavam apenas de uma ferramenta para o dia da
                    competição. Precisavam de um ambiente que acompanhasse{" "}
                    <strong className="text-base-content">
                      toda a jornada.
                    </strong>
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        <section className="py-24 md:py-32 px-6 bg-base-100">
          <div className="max-w-6xl mx-auto">
            <RevealOnScroll>
              <div className="text-center max-w-2xl mx-auto mb-20">
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                  Nossa evolução
                </span>

                <h2 className="text-4xl md:text-5xl font-black mt-4">
                  Uma ideia que continuou crescendo.
                </h2>

                <p className="mt-5 text-lg text-base-content/60">
                  Cada nova ferramenta surgiu de uma necessidade diferente da
                  comunidade.
                </p>
              </div>
            </RevealOnScroll>

            <div className="relative max-w-4xl mx-auto">
              {/* Timeline line */}
              <div className="absolute left-[15px] md:left-1/2 top-0 bottom-0 w-px bg-base-content/10 md:-translate-x-1/2" />

              <TimelineItem
                side="left"
                icon={<Radio className="w-5 h-5" />}
                title="ShowLive"
                text="A primeira solução. Um hub pensado para organizar e transmitir microeventos de robótica."
              />

              <TimelineItem
                side="right"
                icon={<Boxes className="w-5 h-5" />}
                title="Um ecossistema"
                text="O projeto deixou de olhar apenas para o evento e passou a acompanhar planejamento, testes, inovação e competição."
              />

              <TimelineItem
                side="left"
                icon={<BrainCircuit className="w-5 h-5" />}
                title="Ferramentas especializadas"
                text="Surgiram módulos específicos para estratégia, análise de desempenho, organização e documentação."
              />

              <TimelineItem
                side="right"
                icon={<Rocket className="w-5 h-5" />}
                title="O próximo capítulo"
                text="O RoboStage continua evoluindo para oferecer ferramentas cada vez mais flexíveis e construídas junto da comunidade."
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            ECOSYSTEM
        ========================================================= */}
        <section className="bg-base-100 py-24 md:py-32">
          <RevealOnScroll>
            <div className="max-w-6xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                    O ecossistema
                  </span>

                  <h2 className="text-4xl md:text-5xl font-black mt-4 leading-tight">
                    Uma temporada.
                    <br />
                    <span className="text-primary">Várias necessidades.</span>
                  </h2>

                  <p className="mt-6 text-lg text-base-content/65 leading-relaxed">
                    O RoboStage reúne ferramentas específicas para diferentes
                    momentos da temporada, conectando organização, estratégia,
                    testes, inovação e competição em um único ecossistema.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Tag icon={<Target />} text="Estratégia" />
                    <Tag icon={<Wrench />} text="Testes" />
                    <Tag icon={<Lightbulb />} text="Inovação" />
                    <Tag icon={<Radio />} text="Eventos" />
                    <Tag icon={<BookOpen />} text="Documentação" />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />

                  <div className="relative grid grid-cols-2 gap-4">
                    <EcosystemCard
                      icon={<Boxes />}
                      title="QuickBrick Studio"
                      description="Planejamento e estratégia."
                    />

                    <EcosystemCard
                      icon={<Wrench />}
                      title="LabTest"
                      description="Testes e análise de desempenho."
                    />

                    <EcosystemCard
                      icon={<Radio />}
                      title="ShowLive"
                      description="Eventos e transmissões."
                    />

                    <EcosystemCard
                      icon={<BrainCircuit />}
                      title="ThinkLab"
                      description="Ideias, inovação e processos."
                    />
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        <div className="py-8 overflow-hidden bg-base-100">
          <CurvedLoop
            marqueeText="Planejar ▪ Testar ▪ Criar ▪ Competir ▪"
            speed={0.4}
            curveAmount={60}
            direction="left"
            interactive={false}
            className="fill-base-content/30"
          />
        </div>

        <section className="bg-base-200 py-24 md:py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <RevealOnScroll>
              <div className="max-w-2xl mb-14">
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                  O que fazemos
                </span>

                <h2 className="text-4xl md:text-5xl font-black mt-4">
                  Ferramentas para cada parte da temporada.
                </h2>

                <p className="mt-5 text-lg text-base-content/60">
                  Do técnico ao administrativo, o objetivo é reduzir a
                  complexidade para que equipes possam se concentrar no que
                  realmente importa.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {PLATFORM_FEATURES.map((feature, idx) => (
                  <RevealOnScroll key={idx}>
                    <FeatureCard {...feature} />
                  </RevealOnScroll>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </section>

        <section className="bg-base-100 py-24 md:py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <RevealOnScroll>
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="relative">
                  <div className="absolute -inset-4 border border-primary/10 rounded-[2rem]" />
                  <div className="absolute -inset-8 border border-primary/5 rounded-[2.5rem]" />

                  <div className="relative bg-base-200 rounded-[1.5rem] p-8 md:p-12">
                    <Sparkles className="w-10 h-10 text-primary mb-8" />

                    <blockquote className="text-3xl md:text-4xl font-black leading-tight">
                      “Cada funcionalidade existe porque, em algum momento,
                      ela fez falta.”
                    </blockquote>

                    <div className="mt-8 flex items-center gap-3">
                      <div className="w-10 h-px bg-primary" />
                      <span className="text-sm text-base-content/50">
                        Filosofia do RoboStage
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                    Por que existe
                  </span>

                  <h2 className="text-4xl md:text-5xl font-black mt-4 leading-tight">
                    Software feito a partir da experiência.
                  </h2>

                  <div className="mt-8 space-y-6 text-base-content/70 text-lg leading-relaxed">
                    <p>
                      O RoboStage não nasceu de uma pesquisa de mercado.
                      Nasceu da experiência de estar dentro de equipes,
                      competições, testes e eventos.
                    </p>

                    <p>
                      Isso influencia diretamente a forma como novas
                      funcionalidades são pensadas: primeiro existe o
                      problema, depois vem a tecnologia.
                    </p>

                    <p>
                      A plataforma busca transformar processos que costumam
                      ser manuais, fragmentados ou difíceis de acompanhar em
                      experiências mais simples e acessíveis.
                    </p>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        <section className="bg-base-200 py-24 md:py-32 px-6">
          <RevealOnScroll>
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-[1fr_0.7fr] gap-16">
                <div>
                  <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                    Quem constrói
                  </span>

                  <h2 className="text-4xl md:text-5xl font-black mt-4">
                    Uma plataforma feita por alguém que também está na arena.
                  </h2>

                  <div className="mt-8 space-y-6 text-lg text-base-content/70 leading-relaxed">
                    <p>
                      O RoboStage é desenvolvido por{" "}
                      <strong className="text-base-content">
                        Matheus Gabriel
                      </strong>
                      , mentor de robótica e desenvolvedor de software.
                    </p>

                    <p>
                      A experiência dentro de equipes e competições influencia
                      cada decisão do projeto. A ideia é construir ferramentas
                      que façam sentido não apenas tecnicamente, mas também para
                      quem realmente precisa utilizá-las durante uma temporada.
                    </p>

                    <p>
                      Mais do que criar software, o objetivo é construir uma
                      infraestrutura aberta para a comunidade de robótica.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-10">
                    <a
                      href="https://github.com/ohthias"
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary rounded-xl"
                    >
                      <Github className="w-5 h-5" />
                      GitHub
                    </a>

                    <a
                      href="https://www.linkedin.com/in/mathgab/"
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline rounded-xl"
                    >
                      LinkedIn
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-full space-y-4">
                    <InfoRow
                      icon={<Code2 />}
                      title="Desenvolvimento"
                      text="Software e ferramentas para a comunidade."
                    />

                    <InfoRow
                      icon={<Users />}
                      title="Comunidade"
                      text="Construído ouvindo quem vive a robótica."
                    />

                    <InfoRow
                      icon={<Target />}
                      title="Propósito"
                      text="Menos burocracia. Mais tempo para criar."
                    />
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        <section className="py-24 md:py-32 px-6 bg-base-100">
          <RevealOnScroll>
            <div className="max-w-6xl mx-auto">
              <div className="relative overflow-hidden rounded-[2rem] bg-neutral text-neutral-content">
                <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:32px_32px]" />

                <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/30 blur-[100px] rounded-full" />

                <div className="relative p-8 md:p-14 lg:p-20">
                  <div className="max-w-3xl">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 rounded-xl bg-primary text-primary-content">
                        <Lightbulb className="w-6 h-6" />
                      </div>

                      <span className="font-bold uppercase tracking-widest text-sm text-neutral-content/60">
                        Construído com a comunidade
                      </span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black leading-tight">
                      O próximo capítulo pode começar com{" "}
                      <span className="text-primary">a sua ideia.</span>
                    </h2>

                    <p className="mt-6 text-lg md:text-xl text-neutral-content/65 leading-relaxed max-w-2xl">
                      Muitas funcionalidades do RoboStage nasceram de
                      sugestões, conversas e experiências compartilhadas por
                      pessoas da comunidade.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mt-10">
                      <a
                        href="https://github.com/ohthias/roboStage/issues"
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary btn-lg rounded-xl"
                      >
                        <Plus className="w-5 h-5" />
                        Enviar sugestão
                      </a>

                      <a
                        href="https://github.com/ohthias/roboStage"
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-lg"
                      >
                        <Github className="w-5 h-5" />
                        Ver projeto
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        <section className="bg-base-100">
          <FAQSection />
        </section>

        <div className="w-full h-10 bg-gradient-to-t from-neutral to-base-200 " />
        <section className="relative bg-neutral text-neutral-content py-28 px-6 overflow-hidden">
          <div className="relative max-w-4xl mx-auto text-center">
            <RevealOnScroll>
              <h2 className="text-4xl md:text-6xl font-black leading-tight">
                Sua jornada na robótica
                <br />
                começa aqui.
              </h2>

              <p className="mt-6 text-lg md:text-xl text-neutral-content/60 max-w-2xl mx-auto leading-relaxed">
                Explore as ferramentas, acompanhe a evolução do projeto e faça
                parte da construção de um ecossistema pensado para quem vive a
                robótica.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
                <Link
                  href="/fll"
                  className="btn btn-primary btn-lg rounded-xl px-8"
                >
                  Explorar RoboStage
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <a
                  href="https://github.com/ohthias/roboStage"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost btn-lg rounded-xl px-8 text-neutral-content"
                >
                  Conhecer no GitHub
                </a>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function TimelineItem({
  side,
  icon,
  title,
  text,
}: {
  side: "left" | "right";
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="relative grid md:grid-cols-2 gap-8 mb-14 last:mb-0">
      <div
        className={
          side === "left"
            ? "md:text-right md:pr-14 pl-12 md:pl-0"
            : "md:col-start-2 md:pl-14 pl-12 md:pr-0"
        }
      >
        <div className="inline-flex flex-col">
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="mt-3 text-base-content/60 leading-relaxed max-w-md">
            {text}
          </p>
        </div>
      </div>

      <div
        className={`absolute left-0 md:left-1/2 top-0 w-8 h-8 rounded-full bg-base-100 border-2 border-primary flex items-center justify-center text-primary md:-translate-x-1/2`}
      >
        {icon}
      </div>
    </div>
  );
}

function Tag({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="badge badge-lg bg-base-200 border-base-300 gap-2 px-4 py-4">
      <span className="text-primary [&>svg]:w-4 [&>svg]:h-4">
        {icon}
      </span>

      {text}
    </div>
  );
}

function EcosystemCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-base-300 bg-base-100 p-6 hover:-translate-y-1 hover:border-primary/30 transition-all duration-300">
      <div className="w-11 h-11 rounded-xl bg-base-200 flex items-center justify-center text-primary mb-5 [&>svg]:w-5 [&>svg]:h-5">
        {icon}
      </div>

      <h3 className="font-bold text-lg">{title}</h3>

      <p className="mt-2 text-sm text-base-content/50 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function InfoRow({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-5 p-5 rounded-2xl bg-base-100 border border-base-300">
      <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
        {icon}
      </div>

      <div>
        <h3 className="font-bold">{title}</h3>

        <p className="text-sm text-base-content/55 mt-1 leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
}