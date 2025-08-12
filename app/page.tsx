"use client";

import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/ui/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      {/* Icon Blocks */}
      <div className="max-w-5xl py-10 lg:py-14 mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 items-center gap-6 md:gap-10">
          {/* Card */}
          <div className="size-full bg-white shadow-lg rounded-lg p-5">
            <div className="flex items-center gap-x-4 mb-3">
              <div className="inline-flex justify-center items-center size-15.5 rounded-full border-4 border-primary/50 bg-primary/75">
                <i
                  className="fi fi-rr-hundred-points text-primary-content"
                  style={{ lineHeight: 0 }}
                ></i>
              </div>
              <div className="shrink-0">
                <h3 className="block text-lg font-semibold text-gray-800">
                  FLL Score
                </h3>
              </div>
            </div>
            <p className="text-gray-600">
              Registre e acompanhe o desempenho do seu robô na arena!
            </p>
          </div>
          {/* End Card */}
          {/* Card */}
          <div className="size-full bg-white shadow-lg rounded-lg p-5">
            <div className="flex items-center gap-x-4 mb-3">
              <div className="inline-flex justify-center items-center size-15.5 rounded-full border-4 border-primary/50 bg-primary/75">
                <i
                  className="fi fi-rr-blueprint text-primary-content"
                  style={{ lineHeight: 0 }}
                ></i>
              </div>
              <div className="shrink-0">
                <h3 className="block text-lg font-semibold text-gray-800">
                  QuickBrick Studio
                </h3>
              </div>
            </div>
            <p className="text-gray-600">
              Desenhe estratégias visuais para cumprir missões da FLL Challenge - UNEARTHED!
            </p>
          </div>
          {/* End Card */}
          {/* Card */}
          <div className="size-full bg-white shadow-lg rounded-lg p-5">
            <div className="flex items-center gap-x-4 mb-3">
              <div className="inline-flex justify-center items-center size-15.5 rounded-full border-4 border-primary/50 bg-primary/75">
                <i
                  className="fi fi-rr-stage-theatre text-primary-content"
                  style={{ lineHeight: 0 }}
                ></i>
              </div>
              <div className="shrink-0">
                <h3 className="block text-lg font-semibold text-gray-800">
                  showLive
                </h3>
              </div>
            </div>
            <p className="text-gray-600">
              Organize eventos de robótica para até 10 equipes, defina formatos de competição, fases e permissões personalizadas.
            </p>
          </div>
          {/* End Card */}
        </div>
      </div>
      <section className="max-w-5xl mx-auto my-8">
        <div className="container">
          <h2 className="text-3xl font-bold mb-4">
            FIRST Age (2025-2026) - FLL
          </h2>
          <p className="text-lg mb-6">
            A temporada 2025-2026 da FIRST LEGO League Challenge traz o tema{" "}
            <strong>UNEARTHED™</strong>, convida as equipes a explorarem e
            identificarem um problema enfrentado por arqueólogos, propondo uma
            solução que possa ajuda-lós. Eles usam o processo arqueológico para
            reconstruir e entender os artefatos que descobriram. Seja na
            escavação de um sítio arqueológico ou na análise de materiais em um
            laboratório, é preciso que as pessoas trabalhem junto com a
            tecnologia para encontrar as pistas necessárias para entender como
            as gerações passadas viviam, aprendiam e celebravam.
          </p>
          <p className="text-lg mb-6">
            O RoboStage está pronta para apoiar sua equipe nessa aventura,
            disponibilizando ferramentas para auxiliar no design do robô e no
            desafio da mesa.
          </p>
          <p className="text-primary font-bold">
            Você está pronto para desenvolver soluções?
          </p>
          <a
            href="https://www.portaldaindustria.com.br/sesi/canais/torneio-de-robotica/first-lego-league-brasil/#modal-temporada"
            className="text-blue-600 hover:underline font-semibold"
          >
            Leia as documentações da temporada
          </a>
        </div>
        <img
          src="/images/fll_unearthed_logo_fullcolor.png"
          alt="FLL Logo"
          className="w-auto h-50 mt-8 mx-auto"
        />
      </section>

      <Footer />
    </>
  );
}
