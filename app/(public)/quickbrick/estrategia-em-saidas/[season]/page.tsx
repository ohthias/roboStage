"use client";
import CardMobileNotUse from "@/components/MobileNotUse";
import { StrategyBoard } from "@/components/QuickBrick/EstrategiaSaida/StrategyBoard";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function GeradorSaidasPage() {
  const params = useParams();
  const season = Array.isArray(params.season) ? params.season[0] : params.season;

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
    <div>
      <Navbar />
      <div className="px-4 md:px-8">
        <Breadcrumbs />

        <section className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
            Estratégia em Saídas
          </h1>
          <p className="text-base md:text-lg text-base-content/80 max-w-3xl leading-relaxed">
            Crie e organize as saídas do robô com suas missões, ordene-as de
            acordo com a estratégia e a execução desejada, e exporte os dados
            para análise comparativa.
          </p>
        </section>

        <div className="flex justify-center mt-8 mb-16 h-screen">
          <StrategyBoard seasonSelect={season} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
