"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, MoveUpRight } from "lucide-react";
import { HERO_CONFIG } from "@/utils/competitions/hero";

type Competicao = keyof typeof HERO_CONFIG;

export default function Hero() {
  const params = useParams();
  const paramCompeticao = params?.competicao as string | undefined;

  const competicao: Competicao =
    paramCompeticao && paramCompeticao in HERO_CONFIG
      ? (paramCompeticao as Competicao)
      : "fll";

  const hero = HERO_CONFIG[competicao];
  const palavras = hero.titulo.trim().split(/\s+/);
  const ultimaPalavra = palavras.pop() ?? "";
  const tituloPrincipal = palavras.join(" ");

  return (
    <section className="relative isolate overflow-hidden px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:pb-20 lg:pt-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            background: `linear-gradient(180deg, ${hero.accent} 0%, transparent 75%)`,
          }}
        />

        <div
          className="absolute -right-24 top-0 size-72 rounded-full border opacity-40 sm:-right-16 sm:size-96"
          style={{ borderColor: hero.accent }}
        />

        <div
          className="absolute -right-12 top-12 size-48 rounded-full border opacity-30 sm:right-8 sm:top-20 sm:size-64"
          style={{ borderColor: hero.accent }}
        />

        <div className="absolute bottom-0 left-0 h-px w-full bg-base-300" />
      </div>

      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-8 lg:gap-16">
        <div className="relative z-10 flex w-full flex-col items-center text-center md:items-start md:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100/80 px-3 py-1.5 text-xs font-semibold text-base-content/70">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: hero.accent }}
            />
            {hero.badge}
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
            {tituloPrincipal && (
              <>
                {tituloPrincipal}{" "}
              </>
            )}
            <span
              className="relative inline-block"
              style={{ color: hero.accent }}
            >
              {ultimaPalavra}
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-1 w-1/2 rounded-full opacity-70 sm:-bottom-2 sm:h-1.5"
                style={{ backgroundColor: hero.accent }}
              />
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-base-content/65 sm:text-base sm:leading-8 lg:text-lg">
            {hero.descricao}
          </p>
          {/* Ações */}
          <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row md:max-w-none">
            <Link
              href={hero.ctaPrimario.href}
              className="btn btn-primary group min-h-12 rounded-tl-xl rounded-br-xl px-5 shadow-sm"
            >
              {hero.ctaPrimario.label}
              <ArrowDownRight
                size={17}
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
              />
            </Link>

            <Link
              href={hero.ctaSecundario.href}
              className="btn btn-outline min-h-12 rounded-tl-xl rounded-br-xl border-base-300 px-5 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              {hero.ctaSecundario.label}
              <ArrowUpRight size={16} />
            </Link>
          </div>
          {/* Identificação visual */}
          <div className="mt-8 flex items-center gap-3 text-left">
            <div className="flex -space-x-1">
              <span className="size-2 rounded-full bg-primary" />
              <span className="size-2 rounded-full bg-base-content/30" />
              <span className="size-2 rounded-full bg-base-content/15" />
            </div>

            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-base-content/40 sm:text-xs">
              Planeje. Desenvolva. Evolua.
            </span>
          </div>
        </div>

        {/* Imagem */}
        <div className="relative mx-auto w-full max-w-lg md:max-w-none">
          <div
            aria-hidden="true"
            className="absolute -left-3 -top-3 size-16 rounded-tl-xl border-l-2 border-t-2 sm:-left-4 sm:-top-4 sm:size-20"
            style={{ borderColor: hero.accent }}
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-3 -right-3 size-16 rounded-br-xl border-b-2 border-r-2 sm:-bottom-4 sm:-right-4 sm:size-20"
            style={{ borderColor: hero.accent }}
          />

          <div className="relative overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100/70 p-3 sm:p-5">
            <div className="relative flex min-h-[240px] items-center justify-center overflow-hidden rounded-tl-xl rounded-br-xl bg-base-200 sm:min-h-[320px] lg:min-h-[370px]">
              
              <img
                src={hero.imagem}
                alt={hero.titulo}
                className="relative flex min-h-[240px] items-center justify-center overflow-hidden rounded-tl-xl rounded-br-xl bg-base-200 sm:min-h-[320px] lg:min-h-[370px] object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>

            <div className="flex items-center justify-between gap-3 px-1 pt-3">
              <span className="text-[10px] text-base-content/40">
                TECNOLOGIA APLICADA À ROBÓTICA
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}