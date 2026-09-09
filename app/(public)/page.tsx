import UseCasesSection from "@/components/competicoes/FLL/Components/UseCasesSection";
import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import NoiseImage from "@/components/UI/NoiseImage";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import { Newspaper } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <Navbar />
      <header className="relative min-h-screen w-full overflow-hidden bg-base-100">
        <div
          aria-hidden="true"
          className="
            absolute inset-0
            opacity-[0.035]
            bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)]
            bg-[size:32px_32px]
            mask-[linear-gradient(to_bottom,black_0%,transparent_85%)]
          "
        />
        <div
          aria-hidden="true"
          className="absolute -top-32 right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl pointer-events-none"
        />
        <div className="relative z-10 max-w-7xl min-h-screen mx-auto px-6 md:px-12 py-28 lg:py-24 flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="w-full max-w-2xl flex flex-col items-start">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] z-10">
              O palco onde a
            </h1>
            <p className="inline-block bg-primary text-primary-content px-3 py-1 italic -rotate-1 text-2xl sm:text-3xl lg:text-6xl mt-1 z-8 font-black tracking-tight leading-[0.95]">
              robótica acontece.
            </p>
            <p className="mt-7 max-w-xl text-lg md:text-xl leading-relaxed text-base-content/65">
              Uma plataforma para acompanhar competições, descobrir equipes,
              explorar projetos e conectar a comunidade da robótica.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-9">
              <a href="/fll" className="btn btn-primary px-6">
                Explorar a FLL
              </a>

              <a href="/sign-up" className="btn btn-ghost px-6">
                Conhecer a plataforma
                <span aria-hidden="true">→</span>
              </a>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-3 mt-12 pt-6 border-t border-base-content/10 text-sm text-base-content/50">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Competições
              </span>

              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                Ferramentas
              </span>

              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Comunidade
              </span>
            </div>
          </div>

          <div className="relative w-full max-w-lg h-[430px] lg:h-[500px] shrink-0">
            <div className="absolute right-0 top-8 w-[75%] h-[78%] overflow-hidden transition-transform duration-500 hover:rotate-1 hover:scale-[1.02]" style={{ boxShadow: "-10px 10px 0 #CF2A2A" }}>
              <img
                src="https://www.first-lego-league.org/files/Dateiverwaltung%20NEU/Fotos/f%C3%BCr%20Presse%20%26%20Download/%28C%29%20HANDS%20on%20TECHNOLOGY%20e.V.%20-%20FIRST%20LEGO%20League%20-%20Challenge%2003.jpg"
                alt="Equipe de robótica durante uma competição"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 w-44 h-44 overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] shadow-xl rotate-[-5deg] transition-transform duration-500 hover:rotate-0 hover:scale-105" style={{ boxShadow: "5px -5px 0 #1E459F"}}>
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdq11Zclmz-Hrxdc_Si6M7x1y9mE4QHmvdTs4dLiRFE0Nr7ggLx12BRdg&s=10"
                alt="Crianças construindo um robô"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-0 right-[-1rem] w-32 h-32 overflow-hidden rounded-full shadow-xl rotate-[6deg] transition-transform duration-500 hover:rotate-0 hover:scale-110" style={{ boxShadow: "5px 5px 0 #FABD32"}}>
              <img
                src="https://www.firstinspires.org/hs-fs/hubfs/20230420_bm_0312.jpg?width=630&height=420&name=20230420_bm_0312.jpg"
                alt="Competição de robótica"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-8 right-[-2rem] z-[-1] w-32 h-32 border border-primary/30 rounded-full" />
            <div className="absolute bottom-20 right-8 z-[-1] w-3 h-3 rounded-full bg-primary" />
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-xs uppercase tracking-widest 'text-base-content/30">
          <span>Explore</span>
          <span className="text-lg">↓</span>
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

        <NoiseImage variant="animated" noiseOpacity={0.8} className="relative shadow-2xl">
          <section className="bg-neutral text-neutral-content py-16 px-4 md:px-12">
            <h3 className="text-xl md:text-2xl font-bold">
              Plataforma passando por transformação
            </h3>
            <p className="text-base-content/80">
              O RoboStage está em constante evolução, e novas funcionalidades
              estão sendo adicionadas regularmente. Algumas features ainda estão
              em desenvolvimento e estão chegando em breve.
            </p>
          </section>
          <div className="absolute top-0 -translate-y-1/2 left-0 -translate-x-1/2 w-100 h-100 border border-primary/30 rounded-full" />
          <div className="absolute bottom-0 translate-y-1/2 right-0 translate-x-1/2 w-50 h-50 border border-primary/30 rounded-full" />
        </NoiseImage>
        <UseCasesSection />

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
            <Newspaper className="inline-block mr-2" />
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
                href="/sign-up"
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
