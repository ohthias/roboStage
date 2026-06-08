import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center max-w-6xl">
          <div>
            <div className="badge badge-primary badge-lg mb-4">
              Plataforma para Competições de Robótica
            </div>

            <h1 className="text-6xl md:text-8xl font-black">
              RoboStage
            </h1>

            <p className="text-xl mt-6 max-w-3xl mx-auto">
              Organize equipes, gerencie torneios, acompanhe rankings,
              desenvolva projetos de inovação e centralize toda sua temporada
              de robótica em um único lugar.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link href="/fll" className="btn btn-primary btn-lg">
                Acessar FLL
              </Link>

              <Link href="#produtos" className="btn btn-outline btn-lg">
                Conhecer Plataforma
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="produtos" className="py-24 bg-base-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center text-5xl font-black mb-16">
            Ecossistema RoboStage
          </h2>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Link href="/fll" className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-2xl">FLL</h3>
                <p>
                  Ferramentas para equipes e torneios da FIRST LEGO League.
                </p>
              </div>
            </Link>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-2xl">InnoLab</h3>
                <p>
                  Planejamento, pesquisa e desenvolvimento de projetos de
                  inovação.
                </p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-2xl">ShowLive</h3>
                <p>
                  Rankings, resultados e transmissões em tempo real.
                </p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-2xl">LabTest</h3>
                <p>
                  Testes, runs e acompanhamento da evolução do robô.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-neutral text-neutral-content">
        <div className="max-w-5xl mx-auto text-center px-4">
          <h2 className="text-5xl font-black">
            O que é o RoboStage?
          </h2>

          <p className="mt-8 text-xl leading-relaxed">
            O RoboStage é uma plataforma brasileira criada para apoiar
            equipes, técnicos, mentores e organizadores de competições
            de robótica. A plataforma reúne ferramentas para gestão
            de equipes, torneios, inovação, treinamentos e transmissão
            de eventos.
          </p>

          <p className="mt-6 text-lg opacity-80">
            Atualmente o RoboStage oferece soluções para a FIRST LEGO League
            e está evoluindo para suportar novas competições, recursos para
            equipes e experiências educacionais.
          </p>
        </div>
      </section>
    </main>
  );
}