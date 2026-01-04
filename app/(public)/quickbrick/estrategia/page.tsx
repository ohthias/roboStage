"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/UI/Navbar";
import QuickBrickCanvas from "@/components/QuickBrick/Estrategia/QuickBrickCanva";
import { Footer } from "@/components/UI/Footer";
import Breadcrumbs from "@/components/UI/Breadcrumbs";

export default function StrategyPage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 720px)");

    const handleChange = () => {
      setIsMobile(mediaQuery.matches);
    };

    handleChange(); // verifica no mount
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (isMobile === null) return null;

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center flex-1 text-center px-6">
          <img src="/progress.svg" alt="Ícone do robô" className="w-48 mb-4" />
          <h1 className="text-2xl font-bold text-primary mb-4">
            Ops! Ferramenta não disponível no celular
          </h1>
          <p className="text-sm text-base-content max-w-md">
            O QuickBrick Studio é um conjunto de ferramentas para criação de
            estratégias avançadas no FIRST LEGO League Challenge. Para garantir
            a melhor experiência, esta funcionalidade está disponível apenas em
            telas maiores.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <Navbar />
      <div className="px-4 md:px-8">
        <Breadcrumbs />
      </div>

      <div className="flex flex-col items-center w-full">
        <h1 className="text-2xl font-bold my-4 text-primary">
          QuickBrick Studio – Estratégias
        </h1>
        <p className="text-sm text-base-content text-center max-w-3xl px-2 mb-4">
          Selecione uma das ferramentas disponíveis e desenhe diretamente sobre o
          tapete, planejando cada movimento com precisão. Ao final, exporte e
          utilize como preferir.
        </p>

        <QuickBrickCanvas />
      </div>

      <Footer />
    </div>
  );
}