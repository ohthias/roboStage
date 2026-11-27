import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDown, ArrowUpRight, ChevronRight } from "lucide-react";
import {
  ButtonLink,
  Chip,
  DisplayHeading,
  MediaHero,
  Reveal,
  Starburst,
  cn,
  type Tone,
} from "@/components/stage";

export type ProductHeroProps = {
  kicker: string;
  title: string;
  highlight: string;
  highlightTone?: Tone;
  description: string;
  image: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  badges?: { label: string; href?: string; soon?: boolean }[];
  /** Selo em estrela no canto do título ("NOVO", "BETA"). */
  burst?: { label: string; tone?: Tone };
  /** Prévia do produto à direita (cards da Stage UI). Some no celular. */
  aside?: ReactNode;
  scrollTarget?: string;
};

/**
 * Hero das páginas de produto (LabTest, Stagebook, Equipes): foto de fundo
 * com degradê, título com destaque inclinado, CTAs da marca, chips de
 * navegação e uma prévia do produto montada com cards da Stage UI.
 */
export function ProductHero({
  kicker,
  title,
  highlight,
  highlightTone = "primary",
  description,
  image,
  primary,
  secondary,
  badges = [],
  burst,
  aside,
  scrollTarget,
}: ProductHeroProps) {
  return (
    <MediaHero image={image} minHeight="min-h-[100svh]">
      <div className={cn("grid items-center gap-14", !!aside && "lg:grid-cols-[1.1fr_1fr]")}>
        <div className="relative flex flex-col items-center text-center md:items-start md:text-left">
          {burst && (
            <Starburst
              size={84}
              tone={burst.tone ?? "accent"}
              rotate={12}
              className="absolute -top-16 right-2 hidden text-xs sm:inline-grid lg:right-10"
            >
              {burst.label}
            </Starburst>
          )}
          <Reveal effect="fade-up">
            <DisplayHeading as="h1" size="xl" tag={kicker} highlight={highlight} highlightTone={highlightTone}>
              {title}
            </DisplayHeading>
          </Reveal>

          <Reveal effect="fade-up" delay={150}>
            <p className="mt-6 max-w-[34rem] text-base leading-relaxed text-base-content/80 sm:text-lg md:text-xl">
              {description}
            </p>
          </Reveal>

          <Reveal effect="fade-up" delay={300} className="w-full sm:w-auto">
            <div className="mt-8 flex w-full flex-col items-center gap-3 sm:flex-row">
              <ButtonLink
                href={primary.href}
                size="lg"
                iconRight={<ArrowUpRight size={18} aria-hidden />}
                className="w-full sm:w-auto"
              >
                {primary.label}
              </ButtonLink>
              {secondary && (
                <ButtonLink
                  href={secondary.href}
                  tone="ghost"
                  size="lg"
                  shape="rounded"
                  iconRight={<ChevronRight size={18} aria-hidden />}
                  className="w-full sm:w-auto"
                >
                  {secondary.label}
                </ButtonLink>
              )}
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

        {aside && (
          <Reveal effect="pop" delay={250} className="relative hidden lg:block">
            {aside}
          </Reveal>
        )}
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
