import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

const users = [
  {
    number: "01",
    title: "Equipes iniciantes",
    description:
      "Tenham uma base clara para começar a treinar, organizar estratégias e evoluir sem complicação.",
    image: "/images/icons/EquipesIniciantes.svg",
  },
  {
    number: "02",
    title: "Técnicos",
    description:
      "Centralizem treinos, testes e análises para acompanhar a evolução técnica da equipe.",
    image: "/images/icons/Tecnicos.svg",
  },
  {
    number: "03",
    title: "Organizadores",
    description:
      "Estruturem torneios, partidas e resultados em um único ambiente, com menos trabalho manual.",
    image: "/images/icons/Organizadores.svg",
  },
  {
    number: "04",
    title: "Equipes avançadas",
    description:
      "Analisem consistência, desempenho e resultados para transformar dados em decisões melhores.",
    image: "/images/icons/EquipesAvancadas.svg",
  },
];

export default function UseCasesSection() {
  return (
    <section className="relative overflow-hidden bg-base-100 py-24">
      {/* Decoração */}
      <div className="pointer-events-none absolute left-0 top-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative flex justify-center lg:justify-start">
            <div className="relative w-full max-w-xl">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[3rem] bg-base-200/60 p-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8),transparent_65%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_65%)]" />

                <img
                  src="/images/icons/Equipe.svg"
                  alt="Equipe utilizando o RoboStage"
                  className="relative z-10 w-full max-w-md object-contain drop-shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div>
            <h2 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-tight md:text-3xl lg:text-4xl">
              Cada equipe usa o{" "}
              <span className="text-primary">RoboStage</span> de um jeito.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-base-content/65 md:text-lg">
              Do primeiro treino à análise de alto nível, o RoboStage reúne
              ferramentas para ajudar sua equipe a planejar, testar, competir
              e evoluir.
            </p>

            {/* Cards */}
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {users.map((user) => (
                <div
                  key={user.title}
                  className="group relative overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                >
                  {/* Número */}
                  <div className="absolute right-4 top-4 text-[10px] font-black tracking-[0.2em] text-base-content/20">
                    {user.number}
                  </div>

                  {/* Ícone */}
                  <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-base-200 transition-colors duration-300 group-hover:bg-primary/10">
                    <img
                      src={user.image}
                      alt=""
                      aria-hidden="true"
                      className="h-10 w-10 object-contain"
                    />
                  </div>

                  <h3 className="text-base font-bold">
                    {user.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-base-content/60">
                    {user.description}
                  </p>

                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Explorar
                    <ChevronRight size={14} />
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/sign-up"
                className="btn btn-primary rounded-xl px-6 shadow-sm"
              >
                Comece a usar hoje
                <ArrowUpRight size={17} />
              </Link>

              <Link
                href="/fll"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-base-content/70 transition-colors hover:text-primary"
              >
                Conheça a plataforma
                <ChevronRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}