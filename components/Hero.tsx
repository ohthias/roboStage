"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-base-100/50 to-base-300"></div>

      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <RevealOnScroll>
        <div className="hero-content relative z-10 px-8 pt-16 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">

            {/* Texto */}
            <div className="space-y-6 flex flex-col items-start max-w-lg text-center lg:text-left">
              <span className="badge badge-primary badge-outline badge-sm font-semibold tracking-widest uppercase hidden sm:inline-block">
                {hero.badge}
              </span>
              <Logo logoSize="6xl" redirectIndex={false} />

              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                {hero.titulo}
              </h1>
              <p className="text-base md:text-xl text-base-content/60 max-w-xl font-medium leading-relaxed">
                {hero.descricao}
              </p>
              <div className="flex flex-col sm:flex-row gap-5 pt-4">
                <button
                  className="btn btn-primary btn-md"
                  onClick={() => (window.location.href = hero.ctaPrimario.href)}
                >
                  {hero.ctaPrimario.label}
                </button>
                <button
                  className="btn btn-soft btn-md flex items-center gap-2"
                  onClick={() => (window.location.href = hero.ctaSecundario.href)}
                >
                  {hero.ctaSecundario.label}
                  <ArrowRight />
                </button>
              </div>
            </div>
            <img
              src={hero.imagem}
              alt={hero.titulo}
              className="rounded-3xl shadow-xl w-full max-w-lg h-72 object-cover"
            />
          </div>
        </div>
      </RevealOnScroll>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-20">
        <ChevronDown size={28} />
      </div>
    </section>
  );
}