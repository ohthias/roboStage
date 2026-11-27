"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ButtonLink, Sparkle, StickerTag } from "@/components/stage";
import { HERO_CONFIG } from "@/features/leagues/shared/lib/hero";

type Competicao = keyof typeof HERO_CONFIG;

/** Garante caminho absoluto: "images/x.webp" quebraria em /ftc/arena (viraria /ftc/images/...). */
const absolute = (src: string) => (src.startsWith("/") || src.startsWith("http") ? src : `/${src}`);

/**
 * Hero das páginas de competição.
 *
 * A ilustração (PNG/WebP 1:1 com fundo transparente, recorte branco e manchas
 * próprias) é a protagonista: fica sobre uma "placa de arena" com canto
 * recortado, quadriculado na cor da competição e sombra dura, e passa um pouco
 * das bordas da placa para dar a sensação de sticker saltando do tapete.
 */
export default function Hero() {
  const params = useParams();
  const paramCompeticao = params?.competicao as string | undefined;

  const competicao: Competicao =
    paramCompeticao && paramCompeticao in HERO_CONFIG ? (paramCompeticao as Competicao) : "fll";

  const hero = HERO_CONFIG[competicao];
  const vars = { "--hero-accent": hero.accent } as CSSProperties;

  return (
    <section
      style={vars}
      className="stage-noise relative isolate overflow-hidden border-b border-base-300 px-6 pb-16 pt-10 sm:pb-20 md:pt-14"
    >
      {/* Fundo: degradê radial na cor da competição (sem filter: blur, que pesa). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 70% at 78% 45%, color-mix(in oklab, var(--hero-accent) 16%, transparent), transparent 70%), linear-gradient(to bottom, var(--color-base-100), color-mix(in oklab, var(--hero-accent) 6%, var(--color-base-100)))",
        }}
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1fr_1.05fr] lg:gap-16 [&>*]:min-w-0">
        {/* ------------------------------------------------------------ TEXTO */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <p className="stage-kicker inline-flex items-center gap-2 text-base-content/55">
            <span aria-hidden="true" className="size-2 rounded-full bg-[var(--hero-accent)]" />
            {hero.badge.toUpperCase()}
          </p>

          <h1 className="stage-display mt-5 text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
            {hero.titulo}
            <span className="text-[var(--hero-accent)]">.</span>
          </h1>

          <p className="mt-5 flex items-center gap-3 text-lg font-black tracking-tight text-base-content/80 sm:text-xl">
            <span aria-hidden="true" className="h-1 w-8 shrink-0 rounded-full bg-[var(--hero-accent)]" />
            {hero.destaque}
          </p>

          <p className="mt-6 max-w-md text-base leading-relaxed text-base-content/65">{hero.descricao}</p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 md:justify-start">
            <ButtonLink href={hero.ctaPrimario.href} size="lg" iconRight={<ArrowRight size={20} />}>
              {hero.ctaPrimario.label}
            </ButtonLink>
            <Link
              href={hero.ctaSecundario.href}
              className="group inline-flex items-center gap-1.5 font-semibold text-base-content/70 underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              {hero.ctaSecundario.label}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* ------------------------------------------------------- ILUSTRAÇÃO */}
        <div className="group/hero relative mx-auto w-full max-w-sm sm:max-w-md md:max-w-none">
          {/* Placa de arena: quadriculado + canto recortado + sombra dura na cor da competição */}
          <div
            aria-hidden="true"
            className="stage-paper absolute bottom-[3%] left-[16%] right-[-1%] top-[16%] rotate-3 rounded-tl-[3rem] rounded-br-[3rem] border-2 border-[color-mix(in_oklab,var(--hero-accent)_45%,transparent)] shadow-[10px_10px_0_0_var(--hero-accent)] transition-transform duration-500 ease-out motion-safe:group-hover/hero:rotate-2"
            style={{
              backgroundColor: "color-mix(in oklab, var(--hero-accent) 10%, var(--color-base-100))",
              backgroundImage:
                "linear-gradient(to right, color-mix(in oklab, var(--hero-accent) 22%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--hero-accent) 22%, transparent) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Sombra de chão, para a ilustração "pousar" na placa */}
          <div
            aria-hidden="true"
            className="absolute inset-x-[22%] bottom-[9%] h-[7%] rounded-[50%] bg-base-content/15 blur-md"
          />

          {/* Wrapper com z-10: em seção texturizada o stage.css põe z-index 0 na <img>. */}
          <div className="relative z-10 transition-transform duration-500 ease-out motion-safe:group-hover/hero:-translate-y-1.5">
            <Image
              src={absolute(hero.imagem)}
              alt=""
              width={1080}
              height={1080}
              priority
              sizes="(min-width: 1152px) 560px, (min-width: 768px) 48vw, 90vw"
              className="mx-auto aspect-square h-auto w-full max-w-[560px] object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,0.14)]"
            />
          </div>

          {/* Tempero: 2 stickers no máximo */}
          <Sparkle
            size={44}
            color={hero.accent}
            motion="float"
            className="absolute left-[2%] top-[4%] z-20 hidden sm:inline-block"
          />
          <StickerTag tone="ink" rotate={-6} className="absolute bottom-[1%] right-[6%] z-20">
            {hero.abr}
          </StickerTag>
        </div>
      </div>
    </section>
  );
}