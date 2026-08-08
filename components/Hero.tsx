"use client";

import { useParams } from "next/navigation";
import Logo from "./UI/Logo";
import { HERO_CONFIG } from "@/utils/competitions/hero";
import Link from "next/link";

type Competicao = keyof typeof HERO_CONFIG;

export default function Hero() {
  const params = useParams();
  const competicao = (params?.competicao as Competicao) || "fll";

  const hero = HERO_CONFIG[competicao];
  const titulo = hero.titulo.split(" ");
  const ultimaPalavra = titulo.pop();
  const tituloPrincipal = titulo.join(" ");

  return (
    <section className="w-full mx-auto px-3 sm:px-4 relative">
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div
        className="absolute inset-0 opacity-5"
        style={{ background: `linear-gradient(to top, transparent, ${hero.accent}, transparent)` }}
      />
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 max-w-5xl mx-auto py-6 sm:py-12 md:py-16 z-10 relative">
        <div className="flex flex-col gap-2 sm:gap-4 max-w-2xl w-full md:w-auto text-center justify-center sm:justify-start sm:text-left itens-center sm:items-start">
          <div className="badge badge-primary badge-sm badge-outline mx-auto sm:mx-0">{hero.badge}</div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight max-w-md mx-auto sm:mx-0">
            {tituloPrincipal ? `${tituloPrincipal} ` : ""}
            <span style={{ color: hero.accent }}>{ultimaPalavra}</span>
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-base-content/70">{hero.descricao}</p>
          
          <div className="flex flex-row gap-3 sm:gap-4 mt-2 sm:mt-4 max-w-sm w-full mx-auto sm:mx-0 justify-center sm:justify-start">
            <Link
              href={hero.ctaPrimario.href}
              className="btn btn-primary btn-md sm:btn-lg"
            >
              {hero.ctaPrimario.label}
            </Link>
            <Link
              href={hero.ctaSecundario.href}
              className="btn btn-outline btn-md sm:btn-lg"
            >
              {hero.ctaSecundario.label}
            </Link>
          </div>
        </div>

        <div className="relative w-full md:max-w-md mt-6 md:mt-0 flex items-center justify-center">
          <img
            src={hero.imagem}
            alt={hero.titulo}
            className="w-full h-auto object-contain max-h-84 sm:max-h-80 hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </section>
  );
}