"use client";

import { useParams } from "next/navigation";
import Logo from "./UI/Logo";
import NoiseImage from "./UI/NoiseImage";
import { HERO_CONFIG } from "@/config/hero";

type Competicao = keyof typeof HERO_CONFIG;

export default function Hero() {
  const params = useParams();
  const competicao = (params?.competicao as Competicao) || "fll";

  const hero = HERO_CONFIG[competicao];

  return (
    <section className="relative w-full">
      <div className="relative isolate overflow-hidden rounded-[28px] h-[420px] md:h-[340px]">
        {/* Imagem */}
        <NoiseImage
          variant="animated"
          noiseOpacity={0.9}
          className="absolute inset-0 z-0"
        >
          <img
            src={hero.imagem}
            alt={hero.titulo}
            className="h-full w-full object-cover"
          />
        </NoiseImage>

        {/* Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-l from-primary/50 to-base-300/70" />

        {/* Conteúdo */}
        <div className="absolute inset-0 z-30 flex flex-col justify-start md:justify-center px-5 md:px-12 pt-6 md:pt-0 max-w-2xl">
          {/* Logo */}
          <div className="md:hidden scale-75 origin-left">
            <Logo logoSize="5xl" />
          </div>

          <div className="hidden md:block">
            <Logo logoSize="5xl" />
          </div>

          <h1 className="mt-3 md:mt-4 text-xl md:text-3xl font-bold text-base-content">
            {hero.titulo}
          </h1>

          <p className="mt-2 md:mt-3 text-sm md:text-md text-base-content/90 max-w-lg line-clamp-3 md:line-clamp-none">
            {hero.descricao}
          </p>
        </div>

        {/* CTA */}
        <div className="absolute bottom-0 left-0 z-40 w-full md:max-w-sm">
          <div
            className="
              relative
              flex
              flex-col
              md:flex-row
              gap-2
              bg-base-100
              p-3
              rounded-tr-[28px]
              w-full
              md:w-auto
            "
          >
            {/* Recorte superior esquerdo (somente desktop) */}
            <div
              className="
                hidden md:block
                absolute
                -top-7
                left-0
                w-7
                h-7
                rounded-bl-[28px]
                bg-transparent
                shadow-[-14px_14px_0_0_hsl(var(--b1))]
              "
            />

            {/* Recorte inferior direito (somente desktop) */}
            <div
              className="
                hidden md:block
                absolute
                bottom-0
                -right-7
                w-7
                h-7
                rounded-bl-[28px]
                bg-transparent
                shadow-[-14px_14px_0_0_hsl(var(--b1))]
              "
            />

            <button className="btn btn-ghost btn-sm min-h-11 flex-1">
              {hero.ctaSecundario.label}
            </button>

            <button className="btn btn-primary btn-sm min-h-11 flex-1">
              {hero.ctaPrimario.label}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}