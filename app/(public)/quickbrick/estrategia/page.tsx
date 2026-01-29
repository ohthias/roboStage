"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/UI/Navbar";
import QuickBrickCanvas from "@/components/QuickBrick/Estrategia/QuickBrickCanva";
import { Footer } from "@/components/UI/Footer";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import CardMobileNotUse from "@/components/MobileNotUse";

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
    <div>
      <Navbar />
      <div className="px-4 md:px-8">
        <Breadcrumbs />

        <section className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
            Estratégia de Mesa
          </h1>
          <p className="text-base md:text-lg text-base-content/80 max-w-3xl leading-relaxed">
            Planeje e visualize a estratégia da sua equipe utilizando o
            QuickBrick. Distribua as saidas, defina zonas e crie um plano de
            ação eficiente para maximizar o desempenho no FIRST LEGO League
            Challenge.
          </p>
        </section>

        <div className="flex justify-center mt-8 mb-16">
          <QuickBrickCanvas />
        </div>
      </div>

      <Footer />
    </div>
  );
}
