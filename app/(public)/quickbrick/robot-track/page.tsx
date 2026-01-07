"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/UI/Navbar";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import { Footer } from "@/components/UI/Footer";
import RobotTrackCanvas from "@/components/QuickBrick/RobotTrack/RobotTrack";
import Link from "next/link";

const RobotTrack: React.FC = () => {
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
    <div>
      <Navbar />
      <div className="px-4 md:px-8">
        <Breadcrumbs />
        <section className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
            SHARKS UNEARTHED Simulator
          </h1>
          <p className="text-base md:text-lg text-base-content/80 max-w-3xl leading-relaxed">
            Simule o percurso do seu robô na mesa do desafio feito pela equipe <Link href="#">SHARKS</Link>. Planeje
            movimentos, teste estratégias e visualize como seu robô interagirá
            com os elementos da mesa para maximizar sua pontuação.
          </p>
        </section>

        <div className="flex justify-center mt-8 mb-16">
        <RobotTrackCanvas />
        </div>
      </div>
        <Footer />
    </div>
  );
};

export default RobotTrack;
