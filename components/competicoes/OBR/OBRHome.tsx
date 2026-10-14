import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Braces,
  Database,
  FlaskConical,
  Info,
  Map,
  Route,
} from "lucide-react";
import Hero from "@/components/Hero";

const tools = [
  {
    number: "01",
    icon: Map,
    title: "Criador de arenas",
    description:
      "Explore percursos, visualize obstáculos e prepare sua estratégia antes de levar o robô para a pista.",
    href: "/obr/quickbrick/criador-de-arenas",
    action: "Explorar arenas",
    tag: "PLANEJAMENTO",
  },
  {
    number: "02",
    icon: Database,
    title: "Integração com código",
    description:
      "Transforme as informações das arenas em dados estruturados para integrar ao código do seu robô com o Anatix.",
    href: "/obr/anatix",
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

      <section className="mt-8 w-full bg-neutral py-16 text-neutral-content">
        <div className="mx-auto flex max-w-6xl flex-col items-stretch gap-8 px-4 md:flex-row md:gap-12">
          {/* Imagem */}
          <div className="w-full flex-1">
            <img
              src="https://obr.robocup.org.br/wp-content/uploads/2024/03/IMG_7744-scaled.jpg"
              alt="Estudantes participando de uma atividade de robótica"
              className="h-full max-h-[400px] w-full object-cover"
              style={{ boxShadow: "-10px -10px 0 #fabd32" }}
              loading="lazy"
            />

            <p className="mt-2 text-xs text-neutral-content/60">
              Imagem: Olimpíada Brasileira de Robótica / RoboCup Brasil
            </p>
          </div>

          {/* Conteúdo */}
          <div className="flex-1">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Sobre a OBR</h2>

            <p className="text-base leading-relaxed opacity-90 md:text-lg">
              A Olimpíada Brasileira de Robótica (OBR) estimula estudantes a
              explorar ciência, tecnologia, engenharia e matemática (STEM) por
              meio de desafios que desenvolvem criatividade, raciocínio lógico e
              resolução de problemas.
            </p>

            <p className="mt-4 text-base leading-relaxed opacity-90 md:text-lg">
              Na modalidade prática, as equipes projetam, constroem e programam
              robôs autônomos para superar desafios. Na categoria de Resgate, os
              robôs percorrem trajetos, superam obstáculos e identificam vítimas
              em cenários simulados.
            </p>

            {/* Modalidades */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
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

            <div className="mt-6">
              <a
                href="https://obr.robocup.org.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                Conhecer a Competição
                <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Ferramentas RoboStage */}
      <section className="relative px-4 py-20 sm:px-6 sm:pb-28 bg-base-100">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl md:text-6xl font-black max-w-5xl leading-tight mx-auto text-center">
            Da ideia à pista!{" "}
            <span className="inline-block bg-primary text-primary-content px-3 py-1 italic -rotate-1">
              Tudo faz parte do processo
            </span>
          </h2>
          <p className="max-w-lg text-sm leading-7 text-base-content/60 text-center mx-auto mt-6">
            Um conjunto de ferramentas para apoiar o desenvolvimento de robôs na
            modalidade prática de Resgate da OBR.
          </p>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
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
                <Link
                  key={number}
                  href={href}
                  className="group relative flex min-h-[310px] flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-base-content/[0.04] hover:bg-primary/10 sm:p-7"
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

          <div className="alert alert-soft alert-info mt-8">
            <Info size={20} className="mr-2" />
            Mais recursos, incluindo novas possibilidades para a modalidade Artística, poderão ampliar essa experiência.
          </div>
        </div>
      </section>

      {/* Fluxo de trabalho */}
      <section className="border-t border-base-300 bg-base-100 px-4 py-20 sm:px-6 sm:py-24">
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
              O desempenho melhora quando cada execução gera informação para a
              próxima decisão.
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

      <div className="w-full h-10 bg-gradient-to-t from-neutral to-base-100 " />
      <section className="w-full bg-neutral text-neutral-content py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black leading-tight">
            Seu robô, sua estratégia, sua evolução.
          </h2>
          <p className="mt-6 text-lg md:text-xl text-neutral-content/70 max-w-3xl mx-auto">
            O RoboStage é uma plataforma de apoio ao desenvolvimento de robôs
            para a OBR Resgate. Planeje, programe e experimente estratégias de
            forma integrada, com ferramentas que se complementam.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
            <Link className="btn btn-primary rounded-2xl px-8" href="/sign-up">
              Criar conta grátis
            </Link>
            <Link
              className="btn btn-ghost text-neutral-content rounded-2xl px-8"
              href="/obr/score"
            >
              Pontuar uma arena
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
