import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Braces,
  Database,
  FlaskConical,
  Info,
  Map,
  Route,
  Target,
} from "lucide-react";

import Hero from "@/components/Hero";
import RevealOnScroll from "@/components/UI/RevealOnScroll";

const tools = [
  {
    number: "01",
    icon: Map,
    title: "Criador de arenas",
    description:
      "Explore percursos, identifique obstáculos e planeje rotas antes de levar seu robô para a pista. Transforme a leitura da arena em uma estratégia.",
    href: "/obr/quickbrick/criador-de-arenas",
    action: "Explorar arenas",
    tag: "PLANEJAMENTO",
    color: "bg-primary",
    textColor: "text-primary-content",
  },
  {
    number: "02",
    icon: Database,
    title: "Integração com código",
    description:
      "Utilize informações estruturadas das arenas para conectar o planejamento à programação do robô e desenvolver estratégias com o Anatix.",
    href: "/obr/anatix",
    action: "Conhecer integração",
    tag: "PROGRAMAÇÃO",
    color: "bg-secondary",
    textColor: "text-secondary-content",
  },
  {
    number: "03",
    icon: FlaskConical,
    title: "LabTest",
    description:
      "Registre execuções, compare resultados e investigue o comportamento do robô. Use os dados dos testes para encontrar ajustes mais consistentes.",
    href: "/dashboard/labtest",
    action: "Experimentar o LabTest",
    tag: "EXPERIMENTAÇÃO",
    color: "bg-warning",
    textColor: "text-warning-content",
  },
];

const steps = [
  {
    number: "01",
    icon: Map,
    title: "Entenda a arena",
    description:
      "Observe o percurso, reconheça os obstáculos e identifique os desafios que o robô precisará superar.",
    detail: "Observe antes de agir",
  },
  {
    number: "02",
    icon: Braces,
    title: "Construa a estratégia",
    description:
      "Defina rotas, organize os movimentos e transforme suas decisões em uma sequência lógica de instruções.",
    detail: "Planeje e programe",
  },
  {
    number: "03",
    icon: FlaskConical,
    title: "Teste e evolua",
    description:
      "Execute tentativas, registre evidências e compare os resultados para descobrir o que funciona melhor.",
    detail: "Aprenda com os dados",
  },
];

const modalities = [
  {
    number: "01",
    title: "Modalidade Teórica",
    description:
      "Questões que exploram ciência, matemática, raciocínio lógico e fundamentos da robótica.",
  },
  {
    number: "02",
    title: "Modalidade Prática",
    description:
      "Construção e programação de robôs para superar desafios, com destaque para a categoria de Resgate.",
  },
];

export default function OBRHome() {
  return (
    <main className="mt-16 min-h-screen overflow-hidden bg-base-200 text-base-content">
      <Hero />
      <section className="w-full bg-neutral py-16 text-neutral-content md:py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-stretch gap-10 px-5 sm:px-8 md:flex-row md:items-center md:gap-14">
          <RevealOnScroll>
            <div className="w-full md:flex-1">
              <div className="relative">
                <img
                  src="https://obr.robocup.org.br/wp-content/uploads/2024/03/IMG_7744-scaled.jpg"
                  alt="Estudantes participando de uma atividade de robótica"
                  className="h-full w-full object-cover"
                  style={{ boxShadow: "-10px -10px 0 #fabd32" }}
                  loading="lazy"
                />
              </div>
              <p className="mt-4 text-xs text-neutral-content/50">
                Imagem: Olimpíada Brasileira de Robótica / RoboCup Brasil
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="w-full md:flex-1">
              <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                Sobre a OBR
              </h2>

              <p className="mt-5 text-base leading-relaxed text-neutral-content/80 md:text-lg">
                A Olimpíada Brasileira de Robótica (OBR) aproxima estudantes da
                ciência e da tecnologia por meio de desafios que estimulam a
                criatividade, o raciocínio lógico, a investigação e a resolução
                de problemas.
              </p>

              <p className="mt-4 text-base leading-relaxed text-neutral-content/80 md:text-lg">
                Na modalidade prática, as equipes projetam, constroem e
                programam robôs autônomos para enfrentar desafios. Na categoria
                de Resgate, os robôs precisam percorrer trajetos, superar
                obstáculos e identificar vítimas em cenários simulados.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {modalities.map(({ number, title, description }) => (
                  <article
                    key={number}
                    className="rounded-tl-2xl rounded-br-2xl border border-neutral-content/15 bg-neutral-content/[0.04] p-5 transition-colors duration-300 hover:border-neutral-content/60"
                  >
                    <span className="font-mono text-xs font-bold text-neutral-content/50">
                      /{number}
                    </span>

                    <h3 className="mt-3 font-bold">{title}</h3>

                    <p className="mt-2 text-sm leading-6 text-neutral-content/60">
                      {description}
                    </p>
                  </article>
                ))}
              </div>

              <div className="mt-8">
                <a
                  href="https://obr.robocup.org.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  Conhecer a competição
                  <ArrowUpRight size={18} />
                </a>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Apresentação do RoboStage */}
      <section className="px-5 py-20 sm:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-4 lg:items-stretch lg:gap-6 xl:gap-8">
            <div className="flex flex-col justify-center lg:col-span-1 lg:py-6">
              <h2 className="text-4xl font-black sm:text-5xl lg:text-4xl xl:text-5xl">
                O que sua equipe pode fazer com o{" "}
                <span className="text-primary">RoboStage?</span>
              </h2>

              <p className="mt-5 text-base leading-relaxed text-base-content/70">
                Um ambiente que conecta planejamento, programação e testes para
                apoiar o desenvolvimento de robôs na modalidade prática da OBR.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-base-content/55">
                Menos decisões no improviso. Mais estratégia, evidências e
                aprendizado a cada tentativa.
              </p>

              <div className="mt-6 flex items-center gap-3 border-t border-base-content/10 pt-5">
                <div className="flex -space-x-2">
                  <span className="grid size-9 place-items-center rounded-full border-2 border-base-200 bg-primary text-primary-content">
                    <Map size={16} />
                  </span>

                  <span className="grid size-9 place-items-center rounded-full border-2 border-base-200 bg-secondary text-secondary-content">
                    <Braces size={16} />
                  </span>

                  <span className="grid size-9 place-items-center rounded-full border-2 border-base-200 bg-warning text-warning-content">
                    <FlaskConical size={16} />
                  </span>
                </div>

                <span className="text-xs font-semibold leading-relaxed text-base-content/60">
                  Do planejamento ao teste.
                  <span className="block text-base-content">
                    Um processo conectado.
                  </span>
                </span>
              </div>
            </div>

            {[
              {
                number: "01 / 03",
                icon: Map,
                title: "Planeje sua rota",
                description:
                  "Explore a arena, identifique os desafios e organize o percurso antes de executar a estratégia.",
                label: "ANÁLISE DA ARENA",
                color: "bg-primary",
                text: "text-primary-content",
                iconBg: "bg-white/15",
              },
              {
                number: "02 / 03",
                icon: Braces,
                title: "Transforme ideias em código",
                description:
                  "Estruture a lógica dos movimentos e conecte as informações do planejamento à programação.",
                label: "DESENVOLVIMENTO",
                color: "bg-secondary",
                text: "text-secondary-content",
                iconBg: "bg-white/15",
              },
              {
                number: "03 / 03",
                icon: FlaskConical,
                title: "Aprenda com cada teste",
                description:
                  "Registre resultados, compare execuções e encontre oportunidades para melhorar o desempenho.",
                label: "ANÁLISE DE RESULTADOS",
                color: "bg-warning",
                text: "text-warning-content",
                iconBg: "bg-black/5",
              },
            ].map(
              ({
                number,
                icon: Icon,
                title,
                description,
                label,
                color,
                text,
                iconBg,
              }) => (
                <RevealOnScroll key={number}>
                  <article
                    className={`group relative flex h-full min-h-[310px] flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-content/5 ${color} ${text} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7`}
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full border-[24px] border-white/5 transition-transform duration-500 group-hover:scale-110"
                    />

                    <div className="relative flex items-center justify-between">
                      <div
                        className={`grid size-12 place-items-center rounded-xl ${iconBg}`}
                      >
                        <Icon size={23} strokeWidth={1.8} />
                      </div>

                      <span className="font-mono text-xs font-bold opacity-50">
                        {number}
                      </span>
                    </div>

                    <div className="relative mt-8">
                      <h3 className="text-xl font-black leading-snug xl:text-2xl">
                        {title}
                      </h3>

                      <p className="mt-3 text-sm leading-relaxed opacity-80">
                        {description}
                      </p>
                    </div>

                    <div className="relative mt-auto flex items-center justify-between gap-2 pt-7">
                      <span className="text-[10px] font-bold tracking-[0.14em] opacity-70">
                        {label}
                      </span>

                      <ArrowUpRight
                        size={19}
                        className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                      />
                    </div>
                  </article>
                </RevealOnScroll>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="relative w-full bg-base-100 px-5 py-20 sm:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <RevealOnScroll>
            <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
              <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
                Da ideia à pista!
                <span className="mt-2 inline-block -rotate-1 bg-primary px-3 py-1 italic text-primary-content">
                  Tudo faz parte do processo.
                </span>
              </h2>

              <p className="mt-7 max-w-2xl text-base leading-7 text-base-content/60 sm:text-lg">
                Conheça as ferramentas que ajudam sua equipe a planejar
                estratégias, desenvolver soluções e transformar testes em
                decisões melhores para a OBR Resgate.
              </p>
            </div>
          </RevealOnScroll>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {tools.map(
              ({
                number,
                icon: Icon,
                title,
                description,
                href,
                action,
                tag,
              }) => (
                <RevealOnScroll key={number}>
                  <Link
                    href={href}
                    className="group relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-xl hover:shadow-base-content/[0.04] sm:p-7"
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full border border-base-300 transition-transform duration-500 group-hover:scale-125 group-hover:border-primary/30"
                    />

                    <div className="relative flex items-center justify-between">
                      <div className="flex size-12 items-center justify-center rounded-tl-xl rounded-br-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-content">
                        <Icon size={23} strokeWidth={1.8} />
                      </div>

                      <span className="font-mono text-xs text-base-content/35">
                        /{number}
                      </span>
                    </div>

                    <p className="relative mt-8 text-[10px] font-bold tracking-[0.18em] text-primary">
                      {tag}
                    </p>

                    <h3 className="relative mt-2 text-xl font-bold tracking-tight">
                      {title}
                    </h3>

                    <p className="relative mt-3 flex-1 text-sm leading-6 text-base-content/60">
                      {description}
                    </p>

                    <div className="relative mt-7 flex items-center justify-between gap-3 border-t border-base-300 pt-4 text-sm font-semibold">
                      <span className="transition-colors group-hover:text-primary">
                        {action}
                      </span>

                      <ArrowRight
                        size={18}
                        className="shrink-0 text-base-content/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary"
                      />
                    </div>
                  </Link>
                </RevealOnScroll>
              ),
            )}
          </div>

          <div className="alert alert-soft alert-info mt-8 items-start rounded-tl-xl rounded-br-xl">
            <Info size={20} className="mt-0.5 shrink-0" />

            <div>
              <h3 className="font-bold">Um ambiente em evolução</h3>
              <p className="mt-1 text-sm leading-relaxed">
                Novas ferramentas e possibilidades poderão ampliar o apoio às
                equipes em outras modalidades e etapas da robótica educacional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fluxo de trabalho */}
      <section className="border-t border-base-300 bg-base-200 px-5 py-20 sm:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <RevealOnScroll>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                Evolua a cada tentativa.
              </h2>
              <p className="max-w-md text-sm leading-6 text-base-content/60 sm:text-base">
                Um bom resultado não depende apenas de acertar. Depende de
                observar, testar, entender e ajustar.
              </p>
            </div>
          </RevealOnScroll>

          <div className="relative mt-12 grid gap-9 md:grid-cols-3 md:gap-0">
            <div
              aria-hidden="true"
              className="absolute left-[16.66%] right-[16.66%] top-6 hidden h-px bg-base-300 md:block"
            />

            {steps.map(({ number, icon: Icon, title, description, detail }) => (
              <RevealOnScroll key={number}>
                <article className="group relative md:px-6 first:md:pl-0 last:md:pr-0">
                  <div className="flex items-center gap-4 md:block">
                    <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 text-primary transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-content">
                      <Icon size={21} strokeWidth={1.8} />
                    </div>

                    <span className="font-mono text-xs tracking-widest text-base-content/40">
                      ETAPA {number}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold tracking-tight">
                    {title}
                  </h3>

                  <p className="mt-3 max-w-sm text-sm leading-6 text-base-content/60">
                    {description}
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-primary">
                    <span className="size-1.5 rounded-full bg-primary" />
                    {detail}
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>

          <RevealOnScroll>
            <div className="mt-16 grid gap-6 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-tl-lg rounded-br-lg bg-primary/10 text-primary">
                    <Target size={20} />
                  </div>

                  <h3 className="text-lg font-bold">
                    O objetivo é melhorar com método.
                  </h3>
                </div>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-base-content/60">
                  Cada execução pode gerar informações úteis para a próxima
                  decisão. Registre o que aconteceu, compare os resultados e use
                  as evidências para orientar os próximos ajustes.
                </p>
              </div>

              <Link
                href="/dashboard/labtest"
                className="btn btn-primary rounded-tl-xl rounded-br-xl"
              >
                Registrar um teste
                <ArrowRight size={17} />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Encerramento */}
      <div className="h-10 w-full bg-gradient-to-t from-neutral to-base-200" />

      <section className="w-full bg-neutral px-5 py-20 text-neutral-content sm:px-8 md:py-28">
        <RevealOnScroll>
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Seu robô.
              <span className="block text-primary">Sua estratégia.</span>
              Sua evolução.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-neutral-content/70 sm:text-lg md:text-xl">
              O RoboStage reúne ferramentas para apoiar o desenvolvimento de
              robôs na OBR Resgate. Planeje percursos, estruture estratégias e
              experimente soluções para transformar cada teste em aprendizado.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                className="btn btn-primary rounded-tl-xl rounded-br-xl px-8"
                href="/sign-up"
              >
                Criar conta grátis
                <ArrowUpRight size={18} />
              </Link>

              <Link className="btn btn-soft btn-neutral" href="/obr/score">
                Pontuar uma arena
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </main>
  );
}
