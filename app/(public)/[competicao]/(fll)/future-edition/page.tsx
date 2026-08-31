import { ArrowUpRight, Cpu, File, Leaf, TriangleAlert, Trophy, Users } from "lucide-react";
import Link from "next/link";

const heroBadges = [
  { label: "Kits Computer Science & AI", icon: Cpu },
  { label: "Biodiversidade", icon: Leaf },
  { label: "Alianças cooperativas", icon: Users },
];

const tools = [
  {
    href: "/fll/future-edition/score",
    icon: Trophy,
    title: "Pontuador",
    description: "Simule partidas e calcule automaticamente sua pontuação.",
    text: "text-secondary",
    iconBg: "bg-secondary text-secondary-content",
    iconGhost: "text-secondary",
    bar: "bg-secondary",
  },
  {
    href: "/fll/docs",
    icon: File,
    title: "Documentação",
    description: "Acesse a documentação oficial da Future Edition.",
    text: "text-primary",
    iconBg: "bg-primary text-primary-content",
    iconGhost: "text-primary",
    bar: "bg-primary",
  },
];

export default function FutureEditionPage() {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero */}
      <header className="max-w-6xl mx-auto w-full px-6 pt-16 pb-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h1 className="text-5xl font-black leading-[1.05] text-base-content">
              Future{" "}
              <span className="inline-block bg-secondary text-secondary-content px-3 py-1 italic -rotate-1">
                Edition
              </span>
            </h1>
            <p className="text-secondary font-semibold mt-4">
              Baseado nos kits LEGO® Education Computer Science &amp; AI
            </p>

            <div className="mt-6 space-y-4 text-base-content/75 text-sm leading-relaxed">
              <p>
                Na BIOGLOW™ Future Edition, as equipes da FIRST LEGO League
                participam de uma experiência baseada na biodiversidade
                utilizando os kits LEGO® Education Computer Science &amp; AI.
              </p>
              <p>
                Durante as partidas, as equipes constroem e programam
                hardware sem fio para resolver desafios em um novo formato de
                jogo cooperativo baseado em alianças.
              </p>
              <p>
                Além das missões do robô, o Projeto de Inovação incentiva a
                investigação sobre biodiversidade e sobre como a relação
                entre a natureza e a sociedade contribui para um planeta
                saudável.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mt-8">
              {heroBadges.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="badge badge-outline badge-lg gap-2 py-4 border-base-300 text-base-content/70"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </span>
              ))}
            </div>

            <Link href="#ferramentas" className="btn btn-secondary rounded-full mt-8 px-6">
              Ver ferramentas
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex justify-center flex-1">
            <div className="shadow-[16px_16px_0_theme(colors.secondary)] rounded-lg overflow-hidden">
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/vHT9L_x9P_E?si=YCe6R02B70qVlMEZ"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full max-w-[560px] aspect-video"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Aviso de conteúdo não oficial */}
      <section className="max-w-6xl mx-auto px-6">
        <div role="alert" className="alert alert-warning rounded-2xl items-start">
          <TriangleAlert className="w-6 h-6 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold">Conteúdo não oficial</h3>
            <p className="text-sm mt-1">
              A Future Edition ainda não possui suporte oficial da FIRST LEGO
              League no Brasil. As ferramentas disponibilizadas pela
              RoboStage têm caráter educacional e experimental,
              desenvolvidas para auxiliar equipes, técnicos e estudantes
              interessados em conhecer o formato da competição.
            </p>
          </div>
        </div>
      </section>

      {/* Ferramentas */}
      <section id="ferramentas" className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-10">
          <span className="badge badge-ghost bg-base-200 mb-3">Ferramentas</span>
          <h2 className="text-3xl font-bold text-base-content">
            Ferramentas disponíveis
          </h2>
          <p className="text-base-content/70 mt-2 max-w-md">
            Recursos desenvolvidos para apoiar equipes durante a temporada.
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tools.map(({ href, icon: Icon, title, description, text, iconBg, iconGhost, bar }) => (
            <Link
              key={href}
              href={href}
              className="card bg-base-200 border border-base-300 group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <Icon
                size={112}
                className={`absolute -top-2 -right-2 opacity-[0.06] ${iconGhost} group-hover:opacity-10 transition-opacity`}
              />
              <div className="card-body relative">
                <div className={`inline-flex w-fit p-3 rounded-xl mb-2 ${iconBg}`}>
                  <Icon size={28} />
                </div>
                <h3 className={`card-title text-2xl ${text}`}>{title}</h3>
                <p className="text-base-content/75">{description}</p>
              </div>
              <div className={`absolute bottom-0 left-0 h-1 w-0 ${bar} group-hover:w-full transition-all duration-300`} />
            </Link>
          ))}

          <div className="card bg-base-200/50 border border-dashed border-base-300">
            <div className="card-body items-start justify-center text-center sm:text-left">
              <p className="text-base-content/60 text-sm">
                Mais ferramentas chegam ao longo da temporada. Volte em breve
                para conferir novidades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Encerramento */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-3xl bg-neutral text-neutral-content px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="badge badge-secondary mb-3">Vamos começar?</span>
            <h3 className="text-2xl md:text-3xl font-bold max-w-md">
              Explore as ferramentas e prepare sua equipe para a temporada
            </h3>
          </div>
          <Link
            href="#ferramentas"
            className="btn btn-circle btn-lg bg-secondary text-secondary-content border-none hover:bg-secondary/90 shrink-0"
          >
            <ArrowUpRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}