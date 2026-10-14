"use client";
import CardMobileNotUse from "@/components/MobileNotUse";
import ArenaBuilder from "@/components/QuickBrick/ArenaBuilder/ArenaBuilder";
import HeaderTool from "@/components/QuickBrick/HeaderTool";
import { Puzzle } from "lucide-react";
import { useState, useEffect } from "react";

export default function CriadorDeArenasPage() {
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
    return <CardMobileNotUse competitionName="OBR Resgate" />;
  }

  return (
    <>
      <div className="px-4 md:px-8">
        <HeaderTool
          NameTool="Criador de Arenas"
          DescriptionTool="Crie e edite arenas para a OBR Resgate, faça o percursos e salas de resgate do seu jeito, e exporte para o formato oficial da competição. Ao final veja a pontuação máxima do percurso estimada sem o Chekpoints e os problemas encontrados."
          IconTool={Puzzle}
        />
        <div className="flex justify-center mt-8 mb-16">
          <ArenaBuilder />
        </div>
      </div>
    </>
  );
}
