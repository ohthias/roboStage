"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, ChevronRight } from "lucide-react";

const heroImages = [
  "/images/index/hero_banner_fll.jpg",
  "/images/index/hero_banner_fll_2.jpg",
  "/images/index/hero_banner_obr.png",
  "/images/index/hero_banner_obr_2.png",
];

type HeroAction = {
  label: string;
  href: string;
};

type HeroBadge = {
  label: string;
  href?: string;
  soon?: boolean;
};

type HeroSectionProps = {
  kicker?: string;
  badges?: HeroBadge[];
  scrollTarget?: string;
  images?: string[];
  title?: string;
  highlight?: string;
  description?: string;
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
  ariaLabel?: string;
};

export default function HeroSection({
  kicker,
  badges,
  scrollTarget,
  images = heroImages,
  title = "O palco onde a",
  highlight = "robótica acontece.",
  description = "Uma plataforma para acompanhar competições, descobrir equipes, explorar projetos e conectar a comunidade da robótica.",
  primaryAction = { label: "Cadastre-se", href: "/sign-up" },
  secondaryAction = {
    label: "Conhecer a plataforma",
    href: "/fll",
  },
  ariaLabel = "Equipe de robótica em competição",
}: HeroSectionProps) {
  const [heroImage, setHeroImage] = useState(images[0]);

  useEffect(() => {
    if (images.length <= 1) return;

    const randomIndex = Math.floor(Math.random() * images.length);
    setHeroImage(images[randomIndex]);
  }, [images]);

  return (
    <header
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${heroImage})` }}
      aria-label={ariaLabel}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/70 to-base-200/20"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-center px-5 py-24 sm:px-8 md:justify-start md:px-12 lg:py-24">
        <div className="flex w-full max-w-2xl flex-col items-center text-center md:items-start md:text-left">
          <h1 className="text-5xl font-black leading-[0.95] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {title}
          </h1>

          <p
            className="-rotate-1 bg-primary px-3 py-1 text-3xl font-black leading-[0.95] tracking-tight text-white md:text-4xl lg:text-6xl"
            style={{ animationDelay: "150ms" }}
          >
            {highlight}
          </p>

          <p
            className="mt-6 max-w-[34rem] text-base leading-relaxed text-base-content/80 sm:text-lg md:mt-7 md:text-xl"
            style={{ animationDelay: "300ms" }}
          >
            {description}
          </p>

          <div
            className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
            style={{ animationDelay: "450ms" }}
          >
            <Link
              href={primaryAction.href}
              className="btn btn-primary group w-full px-6 transition-transform duration-200 hover:scale-105 sm:w-auto"
            >
              {primaryAction.label}
              <ArrowUpRight
                size={16}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>

            <Link
              href={secondaryAction.href}
              className="btn btn-ghost group w-full px-6 transition-transform duration-200 hover:scale-105 sm:w-auto"
            >
              {secondaryAction.label}
              <ChevronRight
                size={16}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>

          {badges && badges.length > 0 && (
            <ul className="mt-8 flex flex-wrap justify-center gap-2 md:justify-start">
              {badges.map(({ label, href, soon }) => {
                const cls = `inline-flex items-center gap-1.5 rounded-tl-md rounded-br-md border px-2.5 py-1 font-mono text-xs backdrop-blur transition-colors ${
                  soon
                    ? "border-dashed border-base-content/25 bg-base-100/30 text-base-content/55"
                    : "border-base-content/20 bg-base-100/60 text-base-content/80 hover:border-primary hover:text-primary"
                }`;
                return (
                  <li key={label}>
                    {href && !soon ? (
                      <Link href={href} className={cls}>
                        {label}
                      </Link>
                    ) : (
                      <span className={cls}>
                        {label}
                        {soon && <span className="text-[10px]">· em breve</span>}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {scrollTarget && (
        <a
          href={scrollTarget}
          aria-label="Rolar para o conteúdo"
          className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-base-content/60 transition-colors hover:text-primary md:flex"
        >
          ROLE
          <span className="flex size-9 items-center justify-center rounded-full border border-base-content/25 motion-safe:animate-bounce">
            <ArrowDown size={16} />
          </span>
        </a>
      )}
    </header>
  );
}
