"use client";

import { useParams } from "next/navigation";
import Logo from "./UI/Logo";
import { HERO_CONFIG } from "@/config/hero";
import Link from "next/link";

type Competicao = keyof typeof HERO_CONFIG;

export default function Hero() {
  const params = useParams();
  const competicao = (params?.competicao as Competicao) || "fll";

  const hero = HERO_CONFIG[competicao];

  return (
    <section className="w-full mx-auto px-3 sm:px-4 relative">
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 opacity-16 bg-gradient-to-t from-transparent via-primary to-transparent" />
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 max-w-5xl mx-auto py-8 sm:py-12 md:py-16 z-10 relative">
        <div className="flex flex-col gap-4 sm:gap-6 max-w-2xl w-full md:w-auto">
          <Logo logoSize="lg" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">{hero.titulo}</h1>
          <p className="text-base sm:text-lg md:text-xl text-base-content/70 leading-relaxed">{hero.descricao}</p>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mt-2 sm:mt-4">
            <Link
              href={hero.ctaPrimario.href}
              className="btn btn-primary btn-md sm:btn-lg w-full sm:w-auto"
            >
              {hero.ctaPrimario.label}
            </Link>
            <Link
              href={hero.ctaSecundario.href}
              className="btn btn-outline btn-md sm:btn-lg w-full sm:w-auto"
            >
              {hero.ctaSecundario.label}
            </Link>
          </div>
        </div>

        <div className="relative w-full md:max-w-md mt-6 md:mt-0">
          <div className="absolute h-12 sm:h-16 w-12 sm:w-16 border-2 sm:border-3 border-dashed border-accent rounded-full top-0 left-0 transform -translate-x-1/2 -translate-y-1/2" />
          <img src={hero.imagem} alt={hero.titulo} className="w-full h-auto" style={{boxShadow: '8px 8px 0 #CF2A2A'}} />
        </div>
      </div>
    </section>
  );
}