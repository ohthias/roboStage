"use client";
import CardMobileNotUse from "@/components/MobileNotUse";
import HeaderTool from "@/components/QuickBrick/HeaderTool";
import ViewSection from "@/components/QuickBrick/SharksSimulator/ViewSection";
import { Bot } from "lucide-react";
import { useEffect, useState } from "react";

export default function SharksSimulatorPage() {
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
    <div className="px-4 md:px-8">
      <HeaderTool
        NameTool="Sharks Simulator"
        DescriptionTool="Simule visualmente as trajetórias para robôs da FLL. Defina movimentos retos e giros, visualizando a trajetória resultante sobre o tapete de competição."
        IconTool={Bot}
      />

      <div className="flex justify-center mt-8 mb-16">
        <ViewSection />
      </div>
    </div>
  );
}
