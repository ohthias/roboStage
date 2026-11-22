"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, ChevronRight } from "lucide-react";
import {
  ButtonLink,
  Chip,
  DisplayHeading,
  MediaHero,
  Reveal,
  Sparkle,
  Starburst,
} from "@/components/stage";

const heroImages = [
  "/images/index/banner_hero_fll.webp",
  "/images/index/banner_hero_fll2.webp",
  "/images/index/banner_hero_ftc.webp",
  "/images/index/banner_hero_obr.webp",
  "/images/index/banner_hero_obr2.webp",
  "/images/index/banner_hero_obr_art.webp",
];

// Sorteada uma vez por carregamento, no cliente. O servidor (e a hidratação)
// usam a primeira imagem, então não há divergência no HTML.
let clientPick: number | null = null;
const subscribe = () => () => {};
const getPick = () => (clientPick ??= Math.floor(Math.random() * heroImages.length));
const getServerPick = () => 0;

type HeroBadge = { label: string; href?: string; soon?: boolean };

/**
 * Hero da home montado com a Stage UI: MediaHero (foto + degradê),
 * DisplayHeading com o destaque inclinado, CTAs com canto recortado e
 * sombra dura, chips das modalidades e dois stickers de tempero.
 */
export default function HomeHero({
  kicker = "PLATAFORMA PARA EQUIPES DE ROBÓTICA",
  badges = [],
  scrollTarget,
}: {
  kicker?: string;
  badges?: HeroBadge[];
  scrollTarget?: string;
}) {
  const image = heroImages[useSyncExternalStore(subscribe, getPick, getServerPick)];

  return (
    <MediaHero image={image} minHeight="min-h-[100svh]">
      <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center md:mx-0 md:items-start md:text-left">
        <Starburst
          size={92}
          tone="accent"
          motion="spin"
          className="absolute -right-6 -top-16 hidden text-sm sm:inline-grid md:-right-24"
        />
        <Reveal effect="fade-up">
          <DisplayHeading
            as="h1"
            size="xl"
            tag={kicker}
            highlight="robótica acontece."
            className="[&_h1]:leading-[0.95]"
          >
            O palco onde a
          </DisplayHeading>
        </Reveal>

        <Reveal effect="fade-up" delay={150}>
          <p className="mt-6 max-w-[34rem] text-base leading-relaxed text-base-content/80 sm:text-lg md:mt-7 md:text-xl">
            Uma plataforma para acompanhar competições, descobrir equipes,
            explorar projetos e conectar a comunidade da robótica.
          </p>
        </Reveal>

        <Reveal effect="fade-up" delay={300} className="w-full sm:w-auto">
          <div className="mt-8 flex w-full flex-col items-center gap-3 sm:flex-row">
            <ButtonLink
              href="/sign-up"
              size="lg"
              iconRight={<ArrowUpRight size={18} aria-hidden />}
              className="w-full sm:w-auto"
            >
              Cadastre-se
            </ButtonLink>
            <ButtonLink
              href="/fll"
              tone="ghost"
              size="lg"
              iconRight={<ChevronRight size={18} aria-hidden />}
              className="w-full sm:w-auto"
            >
              Conhecer a plataforma
            </ButtonLink>
          </div>
        </Reveal>

        {badges.length > 0 && (
          <Reveal effect="fade" delay={450}>
            <ul className="mt-8 flex flex-wrap justify-center gap-2 md:justify-start">
              {badges.map(({ label, href, soon }) => (
                <li key={label}>
                  {href && !soon ? (
                    <Link href={href} className="rounded-tl-md rounded-br-md">
                      <Chip className="backdrop-blur">{label}</Chip>
                    </Link>
                  ) : (
                    <Chip soon={soon} className="backdrop-blur">
                      {label}
                      {soon && <span className="text-[10px]">· em breve</span>}
                    </Chip>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>

      <div aria-hidden className="pointer-events-none absolute bottom-16 right-10 hidden lg:block">
        <Sparkle size={34} tone="secondary" motion="float" className="absolute -left-10 -top-6" />
      </div>

      {scrollTarget && (
        <a
          href={scrollTarget}
          aria-label="Rolar para o conteúdo"
          className="stage-kicker absolute bottom-0 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-base-content/60 transition-colors hover:text-primary md:flex"
        >
          ROLE
          <span className="flex size-9 items-center justify-center rounded-full border border-base-content/25 motion-safe:animate-bounce">
            <ArrowDown size={16} />
          </span>
        </a>
      )}
    </MediaHero>
  );
}
