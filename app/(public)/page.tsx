import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import { Newspaper } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <Navbar />
      <header className="relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto h-full px-6 md:px-12 py-24 gap-16">
          {/* Texto */}
          <div className="flex flex-col justify-center max-w-xl z-10 gap-4 select-none">
            <h1 className="text-4xl md:text-4xl lg:text-6xl font-bold leading-tight">
              O palco onde a<br />
              <span className="text-primary-content bg-primary px-2 inline-block">
                robótica acontece
              </span>
            </h1>
            <p className="font-semibold text-lg md:text-xl italic text-base-content/80">
              Competições. Equipes. Comunidade. Tudo conectado!
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <a href="/auth/signup" className="btn btn-primary btn-outline">
                Criar conta gratuitamente
              </a>
              <a href="/fll" className="btn btn-secondary btn-outline">
                Explorar a Plataforma
              </a>
            </div>
          </div>

          {/* Colagem de imagens */}
          <div className="relative w-full max-w-sm h-[380px] shrink-0 mr-0 md:mr-16">
            <div className="absolute bottom-6 right-0 w-72 h-72 hover:scale-105 transition-transform duration-300">
              <img
                src="/images/index/rectangle.svg"
                alt="Equipe de robótica em competição"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="absolute -bottom-5 left-0 w-50 h-50 z-5 hover:scale-110 transition-transform duration-300">
              <img
                src="/images/index/triangle.svg"
                alt="Crianças montando robô"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="absolute top-0 -right-6 w-32 h-32 z-5 hover:scale-107 transition-transform duration-300">
              <img
                src="/images/index/circle.svg"
                alt="Cena de competição de robótica"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </header>
      <main className="bg-base-100">
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16">
          <div className="flex flex-col">
            <h2 className="text-3xl md:text-4xl font-bold">
              Muito mais que uma{" "}
              <span className="text-primary-content bg-primary">
                plataforma
              </span>
            </h2>
            <p className="mt-4 text-base-content/70 max-w-xl text-xl">
              O RoboStage conecta pessoas, equipes e competições em um único
              lugar, tornando a experiência mais organizada, acessível e
              divertida para todos.
            </p>
            <p className="mt-4 text-base-content/70 max-w-xl text-lg">
              Seja você um competidor, mentor, organizador, árbitro ou apenas um
              apaixonado por robótica, aqui sempre existe algo novo para
              descobrir.
            </p>
          </div>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdf7TJNOmMTAIpSFfY1gu1so6SXXhEt8eVnOotnUjaKX1hnCU5CZcmkyC7&s=10"
            alt="Robô de LEGO"
            className="w-full max-w-sm md:max-w-lg h-auto object-cover"
            style={{ boxShadow: "-10px 10px 0 #DE5017" }}
          />
        </section>

        {/* Competições */}
        <section className="py-8 mb-16">
          <RevealOnScroll>
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                  Um lar para cada
                  <br />
                  <span className="bg-accent px-2 inline-block">
                    competição
                  </span>{" "}
                  de robótica
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
                  className="group relative overflow-hidden rounded-tl-[30px] rounded-br-[30px] bg-primary text-primary-content p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
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
                <div className="rounded-tl-[30px] rounded-br-[30px] border border-base-300 bg-base-200 p-8 transition-all hover:border-secondary/30">
                  <div className="badge badge-ghost mb-6">Em breve</div>
                  <h3 className="text-6xl font-black text-base-content/50">
                    FTC
                  </h3>
                  <p className="mt-4 text-base-content/60">
                    Recursos dedicados para equipes da FIRST Tech Challenge.
                  </p>
                </div>

                {/* OBR */}
                <div className="rounded-tl-[30px] rounded-br-[30px] border border-base-300 bg-base-200 p-8 transition-all hover:border-secondary/30">
                  <div className="badge badge-ghost mb-6">Em breve</div>
                  <h3 className="text-6xl font-black text-base-content/50">
                    OBR
                  </h3>
                  <p className="mt-4 text-base-content/60">
                    Ferramentas para a Olimpíada Brasileira de Robótica.
                  </p>
                </div>

                {/* Mais */}
                <div className="rounded-tl-[30px] rounded-br-[30px] border border-dashed border-base-300 bg-base-200/50 p-8 flex flex-col justify-center transition-all hover:border-secondary/30">
                  <h3 className="text-6xl font-black text-base-content/40">
                    +
                  </h3>
                  <p className="mt-4 text-base-content/60">
                    Novas modalidades e programas serão adicionados futuramente.
                  </p>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        <section className="bg-[#091A07] w-full flex flex-col md:flex-row gap-8">
          <div className="max-w-2xl md:ml-16 px-6 md:px-4 text-white flex flex-col justify-center items-start gap-4 py-16">
            <h3 className="text-2xl md:text-3xl font-bold">FIRST® CANOPY™</h3>
            <p className="text-sm md:text-md">
              Nada na Terra prospera sozinha. Cada gene, espécie e ecossistema
              faz parte de uma teia viva de diversidade biológica. Com STEM como
              ferramenta e a natureza como inspiração.
            </p>
            <Link
              className="btn btn-neutral btn-outline btn-sm md:btn-md"
              href="/robostage-canopy"
            >
              Conheça!
            </Link>
            <a
              href="https://www.magnific.com/br/vetores-gratis/fundo-organico-de-selva-plana_13839964.htm#fromView=search&page=2&position=5&uuid=0d42a9de-b5ff-41eb-a3d4-967b0ab14993&query=canopy+florest"
              className="text-xs opacity-20"
            >
              Imagem de freepik
            </a>
          </div>

          <div className="w-full md:max-w-1/2 relative h-64 md:h-auto">
            <img
              src="images/index/canopy.webp"
              className="w-full h-full object-cover"
            />
            <div
              className="hidden md:block absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(to left, transparent, #091A07)`,
              }}
            />
            <div
              className="block md:hidden absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(to top, transparent, #091A07)`,
              }}
            />
          </div>
        </section>

        <section className="max-w-6xl mx-auto py-16 px-4 mb-24">
          <h3 className="text-2xl md:text-3xl font-semibold">
            Um{" "}
            <span className="bg-secondary text-secondary-content px-1">
              projeto independente
            </span>
            , construído com a comunidade.
          </h3>
          <div className="border-l-5 border-secondary pl-4 mt-4 max-w-xl">
            <p className="text-lg">
              O RoboStage é desenvolvido por uma única pessoa e evolui
              continuamente com a ajuda de equipes de robótica, organizadores e
              voluntários que participam dos testes e compartilham ideias para
              novas funcionalidades.
            </p>
            <p className="text-lg mt-2">
              Cada atualização nasce de experiências reais vividas dentro das
              competições.
            </p>
          </div>
          <Link href="/news" className="mt-8 btn bnt-outline">
          <Newspaper className="inline-block mr-2"/>
            Ver notícias
          </Link>
        </section>

        <div className="w-full h-10 bg-gradient-to-t from-neutral to-transparent " />
        <section className="w-full bg-neutral text-neutral-content py-24 px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black leading-tight">
              O próximo evento começa aqui!
            </h2>
            <p className="mt-6 text-lg md:text-xl text-neutral-content/70 max-w-3xl mx-auto">
              Se você compete, organiza, ensina, aprende ou simplesmente ama
              robótica, existe um lugar esperando por você.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
              <Link
                className="btn btn-primary rounded-2xl px-8"
                href="/auth/signup"
              >
                Criar conta grátis
              </Link>
              <Link
                className="btn btn-ghost text-neutral-content rounded-2xl px-8"
                href="/fll"
              >
                Começar na FLL
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
