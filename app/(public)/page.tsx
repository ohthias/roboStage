import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import { Users, Trophy, Lightbulb, Radio } from "lucide-react";
import Link from "next/link";

function SeasonBlock() {
  return (
    <section className="py-24 bg-[#024959] text-neutral-content">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-neutral lg:grid-cols-[1.15fr_0.85fr]">
          {/* Left */}
          <div className="p-8 sm:p-12 lg:p-14 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                Temporada 2026–2027
              </div>

              <h2 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none">
                CANOPY
                <span className="text-primary">™</span>
              </h2>

              <p className="mt-6 max-w-2xl border-l-2 border-primary/70 pl-5 text-base sm:text-lg leading-8 text-base-content/70">
                Nada na Terra prospera sozinha. Cada gene, espécie e ecossistema
                faz parte de uma teia viva de diversidade biológica. Com STEM
                como ferramenta e a natureza como inspiração.
              </p>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link href="/robostage-canopy" className="btn btn-primary btn-lg">
                Conhecer a CANOPY™
              </Link>
              <a href="#recursos" className="btn btn-ghost btn-lg">
                Ver recursos
              </a>
            </div>
          </div>

          {/* Right */}
          <div className="p-8 sm:p-12 lg:p-14 bg-base-100 text-base-content">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold tracking-[0.18em] uppercase text-base-content/50">
                  Por que CANOPY™?
                </div>
                <h3 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">
                  Uma temporada feita para crescer em conjunto
                </h3>
              </div>

              <div className="hidden sm:inline-flex rounded-2xl bg-primary/10 px-4 py-3 text-primary font-black text-2xl leading-none">
                🌿
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-dashed border-base-300 bg-base-200/40 p-5">
              <div className="text-sm font-semibold uppercase tracking-[0.16em] text-base-content/50">
                A essência
              </div>
              <p className="mt-3 text-sm sm:text-base leading-7 text-base-content/75">
                Construção, colaboração, impacto e aprendizado prático em uma
                temporada com identidade forte e visual limpo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="mt-16">
        <section className="relative overflow-hidden bg-base-100 h-[100vh]">
          {/* Background */}
          <div className="absolute inset-0">
            {/* Gradiente principal */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10" />

            {/* Grid */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
          linear-gradient(to right, currentColor 1px, transparent 1px),
          linear-gradient(to bottom, currentColor 1px, transparent 1px)
        `,
                backgroundSize: "40px 40px",
              }}
            />

            {/* Blur shapes */}
            <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-secondary/20 blur-3xl" />
          </div>

          {/* Floating geometry */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-[15%] w-12 h-12 border-2 border-primary rotate-12 opacity-40" />

            <div className="absolute top-32 right-[20%] w-16 h-16 rounded-full border-2 border-secondary opacity-40" />

            <div
              className="absolute bottom-24 left-[25%] w-0 h-0 opacity-40"
              style={{
                borderLeft: "25px solid transparent",
                borderRight: "25px solid transparent",
                borderBottom: "40px solid hsl(var(--p))",
              }}
            />

            <div className="absolute bottom-20 right-[30%] w-10 h-10 bg-accent/30 rotate-45" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="container mx-auto px-6">
              <div className="min-h-[85vh] flex flex-col justify-center items-center text-center">
                <h1 className="max-w-5xl text-5xl md:text-7xl font-black leading-tight">
                  O palco onde a<span className="text-primary"> robótica </span>
                  encontra a<span className="text-secondary"> inovação</span>
                </h1>

                <p className="mt-8 max-w-3xl text-lg md:text-xl text-base-content/70">
                  Aprenda, projete, programe e participe de competições. Uma
                  plataforma criada para equipes, mentores, professores e
                  estudantes que querem transformar ideias em soluções reais.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-10">
                  <button className="btn btn-primary btn-lg">
                    Explorar Competições
                  </button>

                  <button className="btn btn-outline btn-lg">
                    Conhecer a Plataforma
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="recursos" className="py-28 bg-base-200">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto mb-20">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">
                Tudo o que sua equipe precisa
              </h2>

              <p className="mt-6 text-lg md:text-xl text-base-content/70">
                Ferramentas desenvolvidas para acompanhar toda a jornada da
                equipe, desde a organização interna até os torneios e projetos
                de inovação.
              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Gestão */}
              <div className="card bg-base-100 border border-base-300 hover:border-primary/40 hover:shadow-2xl transition-all duration-300">
                <div className="card-body">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="w-7 h-7 text-primary" />
                  </div>

                  <div className="badge badge-primary badge-outline mb-2">
                    Organização
                  </div>

                  <h3 className="text-xl font-bold">Gestão de Equipes</h3>

                  <p className="text-base-content/70">
                    Organize membros, temporadas, documentos e atividades em um
                    único lugar.
                  </p>
                </div>
              </div>

              {/* Torneios */}
              <div className="card bg-base-100 border border-base-300 hover:border-secondary/40 hover:shadow-2xl transition-all duration-300">
                <div className="card-body">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
                    <Trophy className="w-7 h-7 text-secondary" />
                  </div>

                  <div className="badge badge-secondary badge-outline mb-2">
                    Competições
                  </div>

                  <h3 className="text-xl font-bold">Torneios</h3>

                  <p className="text-base-content/70">
                    Rankings, resultados, classificações e acompanhamento em
                    tempo real.
                  </p>
                </div>
              </div>

              {/* Projetos */}
              <div className="card bg-base-100 border border-base-300 hover:border-accent/40 hover:shadow-2xl transition-all duration-300">
                <div className="card-body">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                    <Lightbulb className="w-7 h-7 text-accent" />
                  </div>

                  <div className="badge badge-accent badge-outline mb-2">
                    Inovação
                  </div>

                  <h3 className="text-xl font-bold">Projetos de Inovação</h3>

                  <p className="text-base-content/70">
                    Centralize pesquisas, documentos, protótipos e entregas da
                    temporada.
                  </p>
                </div>
              </div>

              {/* Transmissões */}
              <div className="card bg-base-100 border border-base-300 hover:border-info/40 hover:shadow-2xl transition-all duration-300">
                <div className="card-body">
                  <div className="w-14 h-14 rounded-2xl bg-info/10 flex items-center justify-center mb-4">
                    <Radio className="w-7 h-7 text-info" />
                  </div>

                  <div className="badge badge-info badge-outline mb-2">
                    Comunidade
                  </div>

                  <h3 className="text-xl font-bold">Transmissões</h3>

                  <p className="text-base-content/70">
                    Compartilhe eventos, conteúdos e experiências com toda a
                    comunidade.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Competições */}
        <section className="py-16 bg-base-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">
                Um lar para cada
                <br />
                programa de robótica
              </h2>
              <p className="mt-6 text-lg text-base-content/70">
                Soluções específicas para equipes, torneios e comunidades de
                cada modalidade.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {/* FLL */}
              <Link
                href="/fll"
                className="
          group
          relative
          overflow-hidden
          rounded-3xl
          bg-primary
          text-primary-content
          p-8
          transition-all
          duration-300
          hover:-translate-y-1
          hover:shadow-2xl
        "
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />

                <div className="relative">
                  <div className="badge badge-neutral mb-6">
                    Disponível agora
                  </div>

                  <h3 className="text-6xl font-black tracking-tight">FLL</h3>

                  <p className="mt-4 opacity-80">
                    Gestão completa para equipes, projetos, temporadas e
                    torneios da FIRST LEGO League.
                  </p>
                </div>
              </Link>

              {/* FTC */}
              <div
                className="
          rounded-3xl
          border
          border-base-300
          bg-base-200
          p-8
          transition-all
          hover:border-secondary/30
        "
              >
                <div className="badge badge-ghost mb-6">Em breve</div>

                <h3 className="text-6xl font-black text-base-content/50">
                  FTC
                </h3>

                <p className="mt-4 text-base-content/60">
                  Recursos dedicados para equipes da FIRST Tech Challenge.
                </p>
              </div>

              {/* OBR */}
              <div
                className="
          rounded-3xl
          border
          border-base-300
          bg-base-200
          p-8
        "
              >
                <div className="badge badge-ghost mb-6">Em breve</div>

                <h3 className="text-6xl font-black text-base-content/50">
                  OBR
                </h3>

                <p className="mt-4 text-base-content/60">
                  Ferramentas para a Olimpíada Brasileira de Robótica.
                </p>
              </div>

              {/* Mais */}
              <div
                className="
          rounded-3xl
          border
          border-dashed
          border-base-300
          bg-base-200/50
          p-8
          flex
          flex-col
          justify-center
        "
              >
                <h3 className="text-6xl font-black text-base-content/40">+</h3>

                <p className="mt-4 text-base-content/60">
                  Novas modalidades e programas serão adicionados futuramente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Temporada */}
        <SeasonBlock />

        {/* CTA */}
        <section className="py-32 bg-primary text-primary-content">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-4xl md:text-6xl font-black">
              Pronto para elevar sua temporada?
            </h2>

            <p className="mt-6 text-lg md:text-xl opacity-90">
              Centralize sua equipe, seus projetos e suas competições em uma
              única plataforma.
            </p>

            <Link href="/fll" className="btn btn-neutral btn-lg mt-10">
              Entrar no RoboStage
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
