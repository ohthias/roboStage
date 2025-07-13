"use client";

import Banner from "@/components/Banner";
import Hero from "@/components/hero";
import Footer from "@/components/ui/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <Banner />
      <main className="flex flex-col items-center justify-center gap-8">
        <div className="py-24 sm:py-12 mb-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-teal-500 sm:text-5xl lg:text-balance">
                Potencialize sua equipe de robótica
              </p>
              <p className="mt-6 text-lg/8 text-zinc-900">
                Crie estratégias, registre pontuações, conduza testes e
                documente cada avanço do seu robô. Além disso, organize eventos
                completos de robótica com facilidade.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                <div className="relative pl-16">
                  <dt className="text-base/7 font-semibold text-zinc-900">
                    <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-teal-500 text-white">
                      <i className="fi fi-rr-hundred-points" style={{ lineHeight: 0}}></i>
                    </div>
                    FLL Score
                  </dt>
                  <dd className="mt-2 text-base/7 text-zinc-600">
                    Registre e acompanhe o desempenho do seu robô na arena da
                    temporada UNEARTHED de forma prática
                  </dd>
                </div>
                <div className="relative pl-16">
                  <dt className="text-base/7 font-semibold text-zinc-900">
                    <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-red-600 text-white">
                      <i className="fi fi-rr-blueprint" style={{ lineHeight: 0}}></i>
                    </div>
                    Quick<span className="text-red-600">Brick</span> Studio
                  </dt>
                  <dd className="mt-2 text-base/7 text-zinc-600">
                    Desenhe estratégias visuais para cumprir missões da FLL
                    UNEARTHED ou desafios de resgate da OBR.
                  </dd>
                </div>
                <div className="relative pl-16">
                  <dt className="text-base/7 font-semibold text-zinc-900 flex justify-start items-center">
                    <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-red-600 text-white">
                      <i className="fi fi-rr-blood-test-tube-alt" style={{ lineHeight: 0}}></i>
                    </div>
                    lab<span className="text-red-600">Test</span><div className="ml-2 p-1 text-xs text-yellow-600 font-semibold bg-yellow-100 w-max rounded-full">Em desenvolvimento</div>
                  </dt>
                  <dd className="mt-2 text-base/7 text-zinc-600">
                    Simule missões específicas, saídas ou rounds completos e
                    analise resultados detalhados do seu robô.
                  </dd>
                </div>
                <div className="relative pl-16">
                  <dt className="text-base/7 font-semibold text-zinc-900">
                    <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-teal-500 text-white">
                      <i className="fi fi-rr-stage-theatre" style={{ lineHeight: 0}}></i>
                    </div>
                    show<span className="text-teal-500">Live</span>
                  </dt>
                  <dd className="mt-2 text-base/7 text-zinc-600">
                    Organize eventos de robótica para até 10 equipes, defina
                    formatos de competição, fases e permissões personalizadas.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>

      <section className="overflow-hidden bg-gray-50 sm:grid sm:grid-cols-2 sm:items-center">
        <div className="p-8 md:p-12 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-xl text-center ltr:sm:text-left rtl:sm:text-right">
            <h2 className="text-2xl font-bold text-gray-600 md:text-3xl">
              Totalmente imerso na robótica
            </h2>

            <p className="hidden text-gray-500 md:mt-4 md:block">
              Com o <span className="text-red-600">roboStage</span>, você amplia
              a visão sobre o desempenho do seu time e cria eventos
              personalizados de maneira simples e intuitiva.
            </p>

            <div className="mt-4 md:mt-8">
              <a
                href="/create-room"
                className="inline-block rounded-sm bg-red-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-red-700 focus:ring-3 focus:ring-yellow-400 focus:outline-hidden"
              >
                Explore hoje mesmo
              </a>
            </div>
          </div>
        </div>

        <img
          alt="FLL board game"
          src="/images/index_image.jpg"
          className="h-full w-full object-cover sm:h-[calc(100%_-_2rem)] sm:self-end sm:rounded-ss-[30px] md:h-[calc(100%_-_4rem)] md:rounded-ss-[60px]"
        />
      </section>
      <Footer />
    </>
  );
}
