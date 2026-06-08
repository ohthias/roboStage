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
    <section className="w-full max-w-6xl mx-auto px-4">
      <div className="relative w-full">
        {/* Imagem */}
        <div className="relative h-[350px] overflow-hidden rounded-[32px] border-8 border-base-200">
          <NoiseImage
            variant="animated"
            noiseOpacity={0.2}
            className="absolute inset-0"
          >
            <img
              src={hero.imagem}
              alt={hero.titulo}
              className="h-full w-full object-cover"
            />
          </NoiseImage>

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-base-300/90 via-base-300/50 to-primary/50" />

          {/* Conteúdo */}
          <div className="absolute z-20 max-w-xl p-8 md:p-12 left-4 top-1/3 -translate-y-1/3">
            <div className="scale-75 md:scale-100 origin-left">
              <Logo logoSize="5xl" />
            </div>

            <h1 className="mt-2 text-xl md:text-3xl font-black text-base-content">
              {hero.titulo}
            </h1>

            <p className="mt-3 text-sm md:text-lg text-base-content/80 max-w-lg font-medium">
              {hero.descricao}
            </p>
          </div>

          {/* Área dos botões */}
          <div
            className="
              absolute
              bottom-0
              left-0
              w-full
              md:w-[420px]
              bg-base-200
              border-t-8
              border-r-8
              border-base-200
              rounded-tr-[24px]
              p-3
              flex
              items-center
              z-30
            "
          >
            {/* Curva superior */}
            <div
              className="
                absolute
                -top-6
                left-2
                w-4
                h-4
                rounded-bl-2xl
                shadow-[-7px_5px_0_hsl(var(--b3))]
              "
            />

            {/* Curva interna */}
            <div
              className="
                absolute
                -top-4
                left-0
                w-4
                h-4
                rounded-bl-2xl
                shadow-[-4px_4px_0_hsl(var(--b1))]
              "
            />

            <div className="flex w-full gap-2">
              <button className="btn btn-outline btn-sm flex-1">
                {hero.ctaSecundario.label}
              </button>

              <button className="btn btn-primary btn-sm flex-1">
                {hero.ctaPrimario.label}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}