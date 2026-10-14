import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Braces,
  Database,
  FlaskConical,
  Map,
  Route,
  Trophy,
} from "lucide-react";
import Hero from "@/components/Hero";

const tools = [
  {
    number: "01",
    icon: Map,
    title: "Criador de arenas",
    description:
      "Explore percursos, visualize obstáculos e prepare sua estratégia antes de levar o robô para a pista.",
    href: "/obr/arenas",
    action: "Explorar arenas",
    tag: "PLANEJAMENTO",
  },
  {
    number: "02",
    icon: Database,
    title: "STAGE.data",
    description:
      "Transforme as informações das arenas em dados estruturados para integrar ao código do seu robô.",
    href: "/obr/stage-data",
    action: "Conhecer integração",
    tag: "INTEGRAÇÃO",
  },
  {
    number: "03",
    icon: FlaskConical,
    title: "LabTest",
    description:
      "Registre experimentos, compare resultados e encontre os ajustes que tornam sua estratégia mais consistente.",
    href: "/dashboard/labtest",
    action: "Abrir LabTest",
    tag: "EXPERIMENTAÇÃO",
  },
];

const steps = [
  {
    number: "01",
    icon: Map,
    title: "Prepare",
    description:
      "Conheça a arena, identifique os desafios e defina o caminho do seu robô.",
    detail: "Mapeie o percurso",
  },
  {
    number: "02",
    icon: Braces,
    title: "Programe",
    description:
      "Transforme sua estratégia em código e organize a lógica de cada movimento.",
    detail: "Construa a estratégia",
  },
  {
    number: "03",
    icon: FlaskConical,
    title: "Experimente",
    description:
      "Execute testes, analise os resultados e aprimore sua programação a cada tentativa.",
    detail: "Valide os resultados",
  },
];

const modalities = [
  {
    number: "01",
    title: "Modalidade Teórica",
    description:
      "Questões sobre ciência, matemática, raciocínio lógico e fundamentos da robótica.",
  },
  {
    number: "02",
    title: "Modalidade Prática",
    description:
      "Desenvolvimento de robôs para cumprir desafios, com destaque para a categoria de Resgate.",
  },
];

export default function OBRHome() {
  return (
    <main className="min-h-screen overflow-hidden bg-base-200 text-base-content mt-16">
      <Hero />

      <section className="relative mt-8 overflow-hidden bg-neutral py-16 text-neutral-content sm:py-20 lg:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full border border-neutral-content/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full border border-neutral-content/10"
        />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div className="relative">
            <div className="absolute -left-3 -top-3 size-20 border-l-2 border-t-2 border-[#fabd32] sm:-left-4 sm:-top-4" />

            <div className="relative overflow-hidden rounded-tl-2xl rounded-br-2xl">
              <img
                src="https://obr.robocup.org.br/wp-content/uploads/2024/03/IMG_7744-scaled.jpg"
                alt="Estudantes participando de uma atividade de robótica"
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                    Ciência em movimento
                  </p>
                  <p className="mt-1 text-xl font-bold text-white sm:text-2xl">
                    Aprender. Construir. Resolver.
                  </p>
                </div>

                <div className="hidden size-11 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl bg-[#fabd32] text-neutral sm:flex">
                  <Trophy size={21} />
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs text-neutral-content/50">
              Imagem: Olimpíada Brasileira de Robótica / RoboCup Brasil
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[#fabd32]">
              <span className="h-px w-8 bg-[#fabd32]" />
              Conheça a competição
            </div>

            <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              A robótica transforma{" "}
              <span className="text-[#fabd32]">curiosidade</span> em
              conhecimento.
            </h2>

            <p className="mt-6 text-sm leading-7 text-neutral-content/75 sm:text-base">
              A Olimpíada Brasileira de Robótica (OBR) estimula estudantes a
              explorar ciência, tecnologia, engenharia e matemática por meio
              de desafios que desenvolvem criatividade, raciocínio lógico e
              resolução de problemas.
            </p>

            <p className="mt-4 text-sm leading-7 text-neutral-content/75 sm:text-base">
              Na modalidade prática, as equipes projetam, constroem e programam
              robôs autônomos para superar desafios. Na categoria de Resgate,
              por exemplo, os robôs precisam percorrer trajetos, superar
              obstáculos e identificar vítimas em cenários simulados.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {modalities.map((modality) => (
                <div
                  key={modality.number}
                  className="rounded-tl-xl rounded-br-xl border border-neutral-content/15 bg-neutral-content/[0.04] p-4 transition-colors hover:border-[#fabd32]/50"
                >
                  <span className="font-mono text-xs text-[#fabd32]">
                    /{modality.number}
                  </span>
                  <h3 className="mt-3 font-bold">{modality.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-neutral-content/60">
                    {modality.description}
                  </p>
                </div>
              ))}
            </div>

            <a
              href="https://obr.robocup.org.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex items-center gap-3 text-sm font-semibold text-neutral-content transition-colors hover:text-[#fabd32]"
            >
              Conhecer a OBR
              <ArrowUpRight
                size={17}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </div>
      </section>

      {/* Ferramentas RoboStage */}
      <section className="relative px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.65fr] lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                <span className="size-2 rounded-full bg-primary" />
                OBR dentro do RoboStage
              </p>

              <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Da ideia à pista.
                <br />
                <span className="text-base-content/45">
                  Tudo faz parte do processo.
                </span>
              </h2>
            </div>

            <p className="max-w-lg text-sm leading-7 text-base-content/60 lg:justify-self-end">
              Um conjunto de ferramentas para apoiar o desenvolvimento de
              robôs na modalidade prática de Resgate da OBR. Mais recursos,
              incluindo novas possibilidades para a modalidade Artística,
              poderão ampliar essa experiência.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {tools.map(
              ({ number, icon: Icon, title, description, href, action, tag }) => (
                <Link
                  key={number}
                  href={href}
                  className="group relative flex min-h-[310px] flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-base-content/[0.04] sm:p-7"
                >
                  <div className="absolute -right-10 -top-10 size-36 rounded-full border border-base-300 transition-transform duration-500 group-hover:scale-125 group-hover:border-primary/20" />

                  <div className="relative flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-tl-xl rounded-br-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-content">
                      <Icon size={22} strokeWidth={1.8} />
                    </div>

                    <span className="font-mono text-xs text-base-content/35">
                      /{number}
                    </span>
                  </div>

                  <p className="mt-8 text-[10px] font-bold tracking-[0.18em] text-primary">
                    {tag}
                  </p>

                  <h3 className="mt-2 text-xl font-bold tracking-tight">
                    {title}
                  </h3>

                  <p className="mt-3 flex-1 text-sm leading-6 text-base-content/60">
                    {description}
                  </p>

                  <div className="mt-7 flex items-center justify-between border-t border-base-300 pt-4 text-sm font-semibold">
                    <span className="transition-colors group-hover:text-primary">
                      {action}
                    </span>
                    <ArrowRight
                      size={17}
                      className="text-base-content/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary"
                    />
                  </div>
                </Link>
              ),
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-base-300/60">
                <Route size={17} className="text-base-content/70" />
              </div>
              <p className="text-sm leading-6 text-base-content/65">
                <span className="font-semibold text-base-content">
                  Um fluxo conectado.
                </span>{" "}
                Planeje, programe e aprimore sem perder o contexto.
              </p>
            </div>

            <span className="hidden font-mono text-xs text-base-content/35 sm:block">
              OBR / ROBO STAGE
            </span>
          </div>
        </div>
      </section>

      {/* Fluxo de trabalho */}
      <section className="border-y border-base-300 bg-base-100 px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Seu fluxo de trabalho
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Evolua a cada tentativa.
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-base-content/55">
              O desempenho melhora quando cada execução gera informação para
              a próxima decisão.
            </p>
          </div>

          <div className="relative mt-12 grid gap-8 md:grid-cols-3 md:gap-0">
            <div
              aria-hidden="true"
              className="absolute left-[16.66%] right-[16.66%] top-6 hidden h-px bg-base-300 md:block"
            />

            {steps.map(({ number, icon: Icon, title, description, detail }) => (
              <article
                key={number}
                className="group relative md:px-6 first:md:pl-0 last:md:pr-0"
              >
                <div className="flex items-center gap-4 md:block">
                  <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 text-primary transition-colors duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-content">
                    <Icon size={20} strokeWidth={1.8} />
                  </div>

                  <span className="font-mono text-xs tracking-widest text-base-content/35">
                    ETAPA {number}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold">{title}</h3>

                <p className="mt-3 max-w-sm text-sm leading-6 text-base-content/60">
                  {description}
                </p>

                <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-primary">
                  <span className="size-1.5 rounded-full bg-primary" />
                  {detail}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full border border-primary/10 sm:-right-10 sm:-top-32 sm:size-96"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-8 size-48 rounded-full border border-primary/10 sm:right-8 sm:-top-20 sm:size-64"
          />

          <div className="relative grid md:grid-cols-[1fr_auto] md:items-center">
            <div className="p-6 sm:p-10 lg:p-14">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                <FlaskConical size={16} />
                Seu próximo teste começa aqui
              </div>

              <h2 className="mt-5 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Seu robô não evolui por acaso.
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-base-content/60 sm:text-base">
                Organize suas estratégias, experimente possibilidades e
                transforme os resultados dos testes em decisões melhores
                para a pista.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {["Planeje", "Execute", "Analise", "Melhore"].map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-base-300 px-3 py-1.5 text-xs font-medium text-base-content/60"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-base-300 p-6 md:min-w-[250px] md:border-l md:border-t-0 md:p-8 lg:p-10">
              <Link
                href="/obr/arenas"
                className="btn btn-primary group w-full gap-3 rounded-tl-xl rounded-br-xl"
              >
                Explorar arenas
                <ArrowDownRight
                  size={17}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                />
              </Link>

              <p className="mt-4 text-center text-xs leading-5 text-base-content/45">
                Comece pela arena. Evolua com cada teste.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}