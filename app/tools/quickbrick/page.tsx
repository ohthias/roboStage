"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import QuickBrickCanvas from "@/components/QuickBrickCanva";

export default function QuickBrickPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth <= 720);
    };

    checkSize();
    window.addEventListener("resize", checkSize);

    return () => {
      window.removeEventListener("resize", checkSize);
    };
  }, []);

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <Navbar />
        <h1 className="text-2xl font-bold my-4 text-primary">
          Ops! Ferramenta não está disponível no celular
        </h1>
        <p className="text-sm mb-2 text-base-content px-5">
          O QuickBrick Studio é uma ferramenta que ajuda sua equipe a criar
          estratégias eficientes para o robô durante sua jornada no FIRST LEGO
          League Challenge. Basta selecionar uma das ferramentas disponíveis e
          desenhar diretamente sobre a imagem do tapete, planejando cada
          movimento com precisão e facilidade.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <Navbar />
      <div className="text-center my-4 w-5xl">
        <h1 className="text-2xl font-bold my-4 text-primary">
          QuickBrick Studio
        </h1>
        <p className="text-sm mb-2 text-base-content px-2">
          O QuickBrick Studio é uma ferramenta que ajuda sua equipe a criar
          estratégias eficientes para o robô durante sua jornada no FIRST LEGO
          League Challenge. Basta selecionar uma das ferramentas disponíveis e
          desenhar diretamente sobre a imagem do tapete, planejando cada
          movimento com precisão e facilidade.
        </p>
      </div>
      <QuickBrickCanvas />
    </div>
  );
}
