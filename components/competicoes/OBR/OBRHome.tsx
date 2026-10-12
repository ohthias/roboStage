import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  Braces,
  Check,
  Code2,
  Database,
  FlaskConical,
  Map,
  MoveUpRight,
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
      "Explore percursos, identifique obstáculos e prepare o ambiente para desenvolver sua estratégia.",
    href: "/obr/arenas",
    action: "Explorar arenas",
  },
  {
    number: "02",
    icon: Database,
    title: "STAGE.data",
    description:
      "Conecte os dados estruturados das arenas ao código do robô e mantenha suas informações organizadas.",
    href: "/obr/stage-data",
    action: "Explorar integração",
  },
  {
    number: "03",
    icon: FlaskConical,
    title: "LabTest",
    description:
      "Execute experimentos, registre resultados e compare estratégias para evoluir a programação.",
    href: "/dashboard/labtest",
    action: "Abrir LabTest",
  },
];

const steps = [
  {
    number: "01",
    title: "Prepare",
    description: "Escolha uma arena e conheça seus desafios.",
  },
  {
    number: "02",
    title: "Programe",
    description: "Utilize os dados para desenvolver sua estratégia.",
  },
  {
    number: "03",
    title: "Experimente",
    description: "Teste, registre resultados e aprimore seu robô.",
  },
];

export default function OBRHome() {
  return (
    <main className="min-h-screen bg-base-200 text-base-content">
      <Hero />

      {/* Sobre a OBR */}
      <section className="border-y border-base-300 bg-base-100 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Entenda a modalidade
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Tecnologia que sai da ideia e vai para a arena.
            </h2>
          </div>

          <div>
            <p className="leading-7 text-base-content/70">
              A Olimpíada Brasileira de Robótica é uma iniciativa educacional
              que estimula o aprendizado de ciência, tecnologia, engenharia e
              matemática por meio de desafios de robótica.
            </p>

            <p className="mt-4 leading-7 text-base-content/70">
              Na modalidade prática de resgate, os estudantes constroem e
              programam robôs autônomos para percorrer arenas, identificar
              situações e superar desafios definidos pelo regulamento da
              competição.
            </p>

            <p className="mt-4 leading-7 text-base-content/70">
              O RoboStage ajuda a organizar esse processo: planeje o percurso,
              utilize os dados disponíveis no desenvolvimento do código e
              registre experimentos para entender o que funciona e o que
              precisa melhorar.
            </p>

            <a
              href="https://obr.robocup.org.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Site oficial da OBR
              <MoveUpRight size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* Ferramentas RoboStage */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Dentro do RoboStage
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Tudo conectado ao seu processo.
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-base-content/60">
              Ferramentas que acompanham diferentes etapas do desenvolvimento
              do robô, da preparação aos testes.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {tools.map(({ number, icon: Icon, title, description, href, action }) => (
              <article
                key={number}
                className="group flex min-h-[260px] flex-col rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md border border-base-300 bg-base-100 p-5 transition-colors hover:border-primary/40 sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-tl-xl rounded-br-xl bg-primary/10 text-primary">
                    <Icon size={21} />
                  </div>
                  <span className="font-mono text-xs text-base-content/35">
                    {number}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-bold">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-base-content/60">
                  {description}
                </p>

                <Link
                  href={href}
                  className="mt-6 flex items-center justify-between border-t border-base-300 pt-4 text-sm font-semibold transition-colors group-hover:text-primary"
                >
                  {action}
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Processo */}
      <section className="border-y border-base-300 bg-base-100 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Seu fluxo de trabalho
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Evolua a cada tentativa.
            </h2>
          </div>

          <div className="mt-10 grid gap-0 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`border-base-300 py-6 md:px-6 md:py-2 ${
                  index > 0 ? "border-t md:border-l md:border-t-0" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-primary">
                    /{step.number}
                  </span>
                  {index === 0 && <Map size={18} className="text-base-content/35" />}
                  {index === 1 && <Braces size={18} className="text-base-content/35" />}
                  {index === 2 && <FlaskConical size={18} className="text-base-content/35" />}
                </div>

                <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-base-content/60">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md border border-base-300 bg-base-100">
          <div className="grid md:grid-cols-[1fr_auto] md:items-center">
            <div className="p-6 sm:p-10 lg:p-12">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <FlaskConical size={17} />
                <span>Seu próximo teste começa aqui</span>
              </div>

              <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                Seu robô não evolui por acaso.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-base-content/60 sm:text-base">
                Organize suas ideias, experimente diferentes estratégias e
                use os resultados para tomar decisões melhores durante o
                desenvolvimento.
              </p>
            </div>

            <div className="border-t border-base-300 p-6 md:border-l md:border-t-0 sm:p-10">
              <Link
                href="/obr/arenas"
                className="btn btn-primary w-full gap-2 rounded-tl-xl rounded-br-xl"
              >
                Começar agora
                <ArrowDownRight size={17} />
              </Link>
              <p className="mt-3 text-center text-xs text-base-content/45">
                Desenvolva. Teste. Aprimore.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}