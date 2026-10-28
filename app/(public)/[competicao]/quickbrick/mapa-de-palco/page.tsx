"use client";
import CardMobileNotUse from "@/components/MobileNotUse";
import HeaderTool from "@/components/QuickBrick/HeaderTool";
import StageMap from "@/components/QuickBrick/StageMap/StageMap";
import { Theater } from "lucide-react";
import { useEffect, useState } from "react";

export default function MapaDePalcoPage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 720px)");
    const handleChange = () => setIsMobile(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (isMobile === null) return null;
  if (isMobile) return <CardMobileNotUse competitionName="OBR Artística" />;

  return (
    <div className="px-4 md:px-8">
      <HeaderTool
        NameTool="Mapa de palco"
        DescriptionTool="Planeje a apresentação da OBR Robótica Artística no palco oficial de 2,70 × 2,70 m: marcações no chão, desenhos livres, pistas de seguidor de linha e as trajetórias de robôs e integrantes em cada cena, com animação quadro a quadro. O verificador aponta colisões e o que foge das regras de 2026 (tempo de 1:30 a 5:00, janela de 7 min, os 4 recursos, robôs começando no palco)."
        IconTool={Theater}
      />
      <div className="mt-8 mb-16 flex justify-center">
        <StageMap />
      </div>
    </div>
  );
}
