"use client";

import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/ui/Footer";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      {/* Icon Blocks */}
      <div className="max-w-5xl px-4 sm:px-6 py-10 lg:py-14 mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch gap-6 md:gap-10">
          {/* Card */}
          <div className="bg-base-200 shadow-lg rounded-lg p-5 flex flex-col">
            <div className="flex items-center gap-x-4 mb-3">
              <div className="inline-flex justify-center items-center size-16 rounded-full border-4 border-primary/50 bg-primary/75">
                <i
                  className="fi fi-rr-hundred-points text-primary-content text-xl"
                  style={{ lineHeight: 0 }}
                ></i>
              </div>
              <h3 className="text-lg font-semibold text-primary">FLL Score</h3>
            </div>
            <p className="text-base-content flex-grow">
              Registre e acompanhe o desempenho do seu robô na arena!
            </p>
          </div>
          {/* End Card */}
    
          {/* Card */}
          <div className="bg-base-200 shadow-lg rounded-lg p-5 flex flex-col">
            <div className="flex items-center gap-x-4 mb-3">
              <div className="inline-flex justify-center items-center size-16 rounded-full border-4 border-primary/50 bg-primary/75">
                <i
                  className="fi fi-rr-blueprint text-primary-content text-xl"
                  style={{ lineHeight: 0 }}
                ></i>
              </div>
              <h3 className="text-lg font-semibold text-primary">
                QuickBrick Studio
              </h3>
            </div>
            <p className="text-base-content flex-grow">
              Desenhe estratégias visuais para cumprir missões da FLL Challenge
              - UNEARTHED!
            </p>
          </div>
          {/* End Card */}

          {/* Card */}
          <div className="bg-base-200 shadow-lg rounded-lg p-5 flex flex-col">
            <div className="flex items-center gap-x-4 mb-3">
              <div className="inline-flex justify-center items-center size-16 rounded-full border-4 border-primary/50 bg-primary/75">
                <i
                  className="fi fi-rr-stage-theatre text-primary-content text-xl"
                  style={{ lineHeight: 0 }}
                ></i>
              </div>
              <h3 className="text-lg font-semibold text-primary">showLive</h3>
            </div>
            <p className="text-base-content flex-grow">
              Crie eventos de robótica, defina os aspectos da temporada e organize as rodadas que irão acontecer.
            </p>
          </div>
          {/* End Card */}
        </div>
      </div>

      <section className="max-w-5xl px-4 sm:px-6 mx-auto my-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            FIRST Age (2025-2026) - FLL
          </h2>
          <p className="text-base sm:text-lg mb-6">
            A temporada 2025-2026 da FIRST LEGO League Challenge traz o tema{" "}
            <strong>UNEARTHED™</strong>, convidando as equipes a explorarem e
            identificarem um problema enfrentado por arqueólogos, propondo uma
            solução que possa ajudá-los. Usando o processo arqueológico, as
            equipes devem reconstruir e entender os artefatos descobertos. Seja
            na escavação de um sítio arqueológico ou na análise de materiais em
            um laboratório, é preciso que pessoas trabalhem junto com a
            tecnologia para encontrar as pistas necessárias para entender como
            as gerações passadas viviam, aprendiam e celebravam.
          </p>
          <p className="text-base sm:text-lg mb-6">
            O RoboStage está pronto para apoiar sua equipe nessa aventura,
            disponibilizando ferramentas para auxiliar no design do robô e no
            desafio da mesa.
          </p>
          <p className="text-primary font-bold">
            Você está pronto para desenvolver soluções?
          </p>
          <a
            href="https://www.portaldaindustria.com.br/sesi/canais/torneio-de-robotica/first-lego-league-brasil/#modal-temporada"
            className="text-blue-600 hover:underline font-semibold block mt-2"
          >
            Leia as documentações da temporada
          </a>
        </div>

        <img
          src="/images/fll_unearthed_logo_fullcolor.png"
          alt="FLL Logo"
          className="w-auto h-32 mt-8 mx-auto"
        />
      </section>

      <Footer />
    </div>
  );
}
