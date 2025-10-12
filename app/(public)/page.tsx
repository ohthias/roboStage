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
      <FeaturesSection />
      <Image src={listra.src} alt="Listra" width={500} height={50} className="w-full" />
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
              equipes devem reconstruir e entender os artefatos descobertos. Seja
              na escavação de um sítio arqueológico ou na análise de materiais em
              um laboratório, é preciso que pessoas trabalhem junto com a
              tecnologia para encontrar as pistas necessárias para entender como
              as gerações passadas viviam, aprendiam e celebravam.
            </p>
            <p className="font-bold">Você está pronto para desenvolver soluções?</p>
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
