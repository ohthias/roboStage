import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";

const users = [
  {
    number: "01",
    title: "Equipes iniciantes",
    description:
      "Comecem com uma estrutura simples para organizar treinos, projetos e os primeiros passos na competição.",
    image: "/images/icons/EquipesIniciantes.svg",
  },
  {
    number: "02",
    title: "Técnicos",
    description:
      "Organizem treinos, testes e informações para acompanhar a evolução técnica da equipe.",
    image: "/images/icons/Tecnicos.svg",
  },
  {
    number: "03",
    title: "Organizadores",
    description:
      "Centralizem torneios, partidas e resultados em um ambiente pensado para facilitar a operação.",
    image: "/images/icons/Organizadores.svg",
  },
  {
    number: "04",
    title: "Equipes avançadas",
    description:
      "Transformem dados de desempenho em informações para analisar resultados e tomar decisões.",
    image: "/images/icons/EquipesAvancadas.svg",
  },
];

export default function UseCasesSection() {
  return (
    <section className="relative overflow-hidden bg-base-100 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Imagem */}
          <div className="relative">
            <div className="relative min-h-[360px] overflow-hidden rounded-tl-[30px] rounded-br-[30px]">
              <img
                src="/images/icons/Equipe.svg"
                alt="Equipe utilizando o RoboStage"
                className="absolute inset-0 h-full w-full object-contain p-8 transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>

          {/* Conteúdo */}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/50">
              Feito para a jornada
            </span>

            <h2 className="max-w-2xl text-3xl font-black leading-[1.08] tracking-tight md:text-4xl">
              Cada equipe vive a robótica de um jeito.
              <span className="mt-1 block text-primary">
                O RoboStage acompanha essa jornada.
              </span>
            </h2>

            {/* Perfis */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {users.map((user) => (
                <div
                  key={user.title}
                  className="group relative rounded-tl-2xl rounded-br-2xl border border-base-content/10 bg-base-200/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-base-200/70 hover:shadow-md"
                >
                  <div className="absolute right-4 top-4 text-[10px] font-black tracking-[0.2em] text-base-content/20">
                    {user.number}
                  </div>

                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-base-100 transition-colors duration-300 group-hover:bg-primary/10">
                    <img
                      src={user.image}
                      alt=""
                      aria-hidden="true"
                      className="h-8 w-8 object-contain"
                    />
                  </div>

                  <h3 className="text-sm font-bold">{user.title}</h3>

                  <p className="mt-2 text-xs leading-5 text-base-content/60">
                    {user.description}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <Link
                href="/sign-up"
                className="btn btn-primary rounded-tl-xl rounded-br-xl px-6 shadow-sm"
              >
                Comece a usar
                <ArrowUpRight size={17} />
              </Link>

              <Link
                href="/fll"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-base-content/65 transition-colors hover:text-primary"
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
