"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { heroBtn } from "@/components/UI/PageHero";
import { HERO_CONFIG } from "@/utils/competitions/hero";
import "@/components/home/home.css";

type Competicao = keyof typeof HERO_CONFIG;

export default function Hero() {
  const params = useParams();
  const paramCompeticao = params?.competicao as string | undefined;

  const competicao: Competicao =
    paramCompeticao && paramCompeticao in HERO_CONFIG
      ? (paramCompeticao as Competicao)
      : "fll";

  const hero = HERO_CONFIG[competicao];

  return (
    <section className="relative isolate overflow-hidden border-b border-base-300 px-6 pb-16 pt-12 sm:pb-20 sm:pt-16">
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-base-100/70 to-[var(--hero-accent)]/20"
        style={{ "--hero-accent": hero.accent } as React.CSSProperties}
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1fr_1fr] lg:gap-16 [&>*]:min-w-0">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <p className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-base-content/45">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full"
              style={{ backgroundColor: hero.accent }}
            />
            {hero.badge.toUpperCase()}
          </p>

          <h1 className="mt-5 text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            {hero.titulo}
            <span style={{ color: hero.accent }}>.</span>
          </h1>

          <p className="mt-5 flex items-center gap-3 text-lg font-semibold tracking-tight text-base-content/80 sm:text-xl">
            <span
              aria-hidden="true"
              className="h-0.5 w-8 rounded-full"
              style={{ backgroundColor: hero.accent }}
            />
            {hero.destaque}
          </p>

          <p className="mt-6 max-w-md text-base leading-relaxed text-base-content/60">
            {hero.descricao}
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:justify-start">
            <Link href={hero.ctaPrimario.href} className={heroBtn}>
              {hero.ctaPrimario.label}
              <ArrowRight size={20} />
            </Link>
            <Link
              href={hero.ctaSecundario.href}
              className="group inline-flex items-center gap-1.5 font-medium text-base-content/70 underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              {hero.ctaSecundario.label}
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>

        {/* Imagem com fundo transparente, sem moldura */}
        <div className="relative mx-auto w-full max-w-md md:max-w-none">
          {/* Forma de canto recortado (assinatura visual) atrás da imagem */}
          <div
            aria-hidden="true"
            className="absolute inset-[12%] rotate-6 rounded-tl-[3rem] rounded-br-[3rem] border"
            style={{ borderColor: `${hero.accent}55` }}
          />
          {/* Brilho suave na cor da competição */}
          <div
            aria-hidden="true"
            className="absolute inset-[22%] rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: hero.accent }}
          />
          <img
            src={hero.imagem}
            alt={hero.titulo}
            className="relative aspect-square w-full object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.12)] transition-transform duration-500 motion-safe:hover:-translate-y-1"
          />
        </div>
      </div>
    </section>
  );
}
