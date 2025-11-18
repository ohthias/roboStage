"use client";

import FeaturesSection from "@/components/FeaturesSection";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/ui/Footer";
import background from "@/public/images/background_uneartherd.png";
import listra from "@/public/images/Listra.svg";
import FLLLogo from "@/public/images/fll_unearthed_logo_fullcolor.png";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <div className="w-full">
        {/* Seção Sobre */}
        <section className="max-w-5xl p-6 mx-auto my-8">
          <div className="card bg-base-200 shadow-xl p-8">
            <div className="text-base-content text-center space-y-4">
              <h2 className="text-3xl font-bold mb-4">
                Sobre o <span className="text-primary">RoboStage</span>
              </h2>

              <p className="text-md leading-relaxed">
                O RoboStage é uma plataforma criada para ajudar equipes de
                robótica a planejarem, testarem e apresentarem suas ideias com
                mais eficiência. Inspirado pela dinâmica da FIRST LEGO League, o
                RoboStage reúne ferramentas que tornam o processo mais visual,
                organizado e interativo — desde o estudo das missões até a
                criação de torneios completos.
              </p>

              <p className="text-md leading-relaxed">
                Aqui, você pode montar estratégias, testar execuções, registrar
                resultados e simular competições, tudo em um único ambiente.
                Nosso objetivo é facilitar a jornada de equipes, treinadores e
                organizadores, trazendo mais clareza aos processos e ampliando
                as possibilidades de aprendizado.
              </p>
            </div>
          </div>
        </section>

        {/* Seção Texto + Carrossel */}
        <section className="max-w-5xl p-6 mx-auto my-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-base-content">
              <h3 className="text-2xl font-semibold text-primary">
                Evolua sua experiência
              </h3>

              <p className="text-md leading-relaxed">
                Se você quer otimizar treinos, desenvolver táticas melhores ou
                criar experiências envolventes para seus torneios, o RoboStage é
                o seu palco para evoluir.
              </p>
            </div>

            {/* Carrossel DaisyUI */}
            <div className="carousel w-full rounded-xl shadow-xl border border-base-300">
              <div id="slide1" className="carousel-item relative w-full">
                <img
                  src="/images/quickbrick_unearthed.png"
                  className="w-full object-cover"
                  alt="Tela QuickBrick"
                />
                <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                  <a href="#slide4" className="btn btn-circle btn-sm">
                    ❮
                  </a>
                  <a href="#slide2" className="btn btn-circle btn-sm">
                    ❯
                  </a>
                </div>
              </div>

              <div id="slide2" className="carousel-item relative w-full">
                <img
                  src="/images/stylelab_ui.png"
                  className="w-full object-cover"
                  alt="Tela StyleLab"
                />
                <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                  <a href="#slide1" className="btn btn-circle btn-sm">
                    ❮
                  </a>
                  <a href="#slide3" className="btn btn-circle btn-sm">
                    ❯
                  </a>
                </div>
              </div>

              <div id="slide3" className="carousel-item relative w-full">
                <img
                  src="/images/labtest_ui.png"
                  className="w-full object-cover"
                  alt="Tela LabTest"
                />
                <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                  <a href="#slide2" className="btn btn-circle btn-sm">
                    ❮
                  </a>
                  <a href="#slide4" className="btn btn-circle btn-sm">
                    ❯
                  </a>
                </div>
              </div>

              <div id="slide4" className="carousel-item relative w-full">
                <img
                  src="/images/showlive_ui.png"
                  className="w-full object-cover"
                  alt="Tela ShowLive"
                />
                <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                  <a href="#slide3" className="btn btn-circle btn-sm">
                    ❮
                  </a>
                  <a href="#slide1" className="btn btn-circle btn-sm">
                    ❯
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Image
        src={listra.src}
        alt="Listra"
        width={500}
        height={50}
        className="w-full"
      />
      <FeaturesSection />
      <Image
        src={listra.src}
        alt="Listra"
        width={500}
        height={50}
        className="w-full"
      />
      <div className="p-4 md:p-0">
        <section
          className="max-w-5xl p-4 sm:p-6 mx-auto my-12 flex flex-col sm:flex-row rounded-lg bg-yellow-100 gap-6 relative unearthed-section"
          style={{
            backgroundImage: `url(${background.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <style>{`
            .unearthed-section::after{
              content: '';
              position: absolute;
              inset: 0;
              background: rgba(0,0,0,0.25);
              border-radius: inherit;
              pointer-events: none;
            }
          `}</style>
          <div className="w-full sm:w-2/3 text-base-content z-10">
            <h2 className="text-xl sm:text-3xl font-bold mb-4">
              FIRST Age (2025-2026)
            </h2>
            <p className="text-sm sm:text-base mb-2">
              A temporada 2025-2026 da FIRST LEGO League Challenge traz o tema{" "}
              <strong>UNEARTHED™</strong>, convidando as equipes a explorarem e
              identificarem um problema enfrentado por arqueólogos, propondo uma
              solução que possa ajudá-los. Usando o processo arqueológico, as
              equipes devem reconstruir e entender os artefatos descobertos.
              Seja na escavação de um sítio arqueológico ou na análise de
              materiais em um laboratório, é preciso que pessoas trabalhem junto
              com a tecnologia para encontrar as pistas necessárias para
              entender como as gerações passadas viviam, aprendiam e celebravam.
            </p>
            <p className="font-bold">
              Você está pronto para desenvolver soluções?
            </p>
          </div>
          <div className="flex flex-col items-center sm:items-end justify-between w-full sm:w-1/3 z-10">
            <img
              src={FLLLogo.src}
              alt="FLL Logo"
              className="w-40 h-24 sm:w-auto sm:h-32 mt-4 sm:mt-8 object-contain"
            />
            <a
              href="/fll-docs"
              className="btn btn-neutral mt-4 sm:mt-6 btn-sm w-full sm:w-auto text-center"
            >
              Saiba mais sobre a temporada
            </a>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
