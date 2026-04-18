"use client";

import { ArrowRight, Bot, ChevronDown } from "lucide-react";
import { useParams } from "next/navigation";
import Logo from "./UI/Logo";
import RevealOnScroll from "./UI/RevealOnScroll";
import { HERO_CONFIG } from "@/config/hero";

type Competicao = keyof typeof HERO_CONFIG;

export default function Hero() {
  const params = useParams();
  const competicao = (params?.competicao as Competicao) || "fll";

  const hero = HERO_CONFIG[competicao];

  return (
    <section className="hero h-screen relative overflow-hidden">
      {/* Background */}
      <img
        src={hero.imagem}
        alt={hero.titulo}
        className="absolute inset-0 w-full h-full object-cover opacity-35"
      />
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-base-100/30 to-base-300"></div>

      <RevealOnScroll>
        <div className="hero-content relative z-10 px-8 flex flex-col items-start justify-content w-screen max-w-6xl">
          <div>
            <span className="badge badge-default badge-outline badge-sm font-semibold tracking-widest uppercase hidden sm:inline-block">
              {hero.badge}
            </span>
            <div className="flex flex-col items-start gap-4 mt-2 mb-4">
              <Logo logoSize="6xl" redirectIndex={false} />
              <h1 className="text-2xl md:text-3xl font-bold leading-tight max-w-3xl text-base-content tracking-tight">
                {hero.titulo}
              </h1>
            </div>
            <p className="text-base md:text-xl text-base-content/60 max-w-xl font-medium leading-relaxed">
              {hero.descricao}
            </p>
            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <button
                className="btn btn-primary btn-md flex items-center gap-2"
                onClick={() => (window.location.href = hero.ctaPrimario.href)}
              >
                {hero.ctaPrimario.label}
                <Bot />
              </button>
              <button
                className="btn btn-outline btn-md flex items-center gap-2 backdrop-blur-sm"
                onClick={() => (window.location.href = hero.ctaSecundario.href)}
              >
                {hero.ctaSecundario.label}
                <ArrowRight />
              </button>
            </div>
          </div>
        </div>
      </RevealOnScroll>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-20">
        <ChevronDown size={28} />
      </div>
    </section>
  );
}
