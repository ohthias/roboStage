"use client";

import { useState, useEffect } from "react";
import QuickBrickCanvas from "@/components/QuickBrick/Estrategia/QuickBrickCanva";
import CardMobileNotUse from "@/components/MobileNotUse";
import HeaderTool from "@/components/QuickBrick/HeaderTool";
import { Brush } from "lucide-react";

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
    return <CardMobileNotUse />;
  }

  return (
    <>
      <div className="px-4 md:px-8">
        <HeaderTool
          NameTool="Estratégia de Mesa"
          DescriptionTool="Planeje e visualize a estratégia da sua equipe utilizando camadas, zonas. Posicionando seu robô em cada lançamento."
          IconTool={Brush}
        />
        <div className="flex justify-center mt-8 mb-16">
          <QuickBrickCanvas />
        </div>
      </div>
    </>
  );
}
