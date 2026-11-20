import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { ChevronRight } from "lucide-react";

import { FLLIcon } from "@/components/icons/FLLIcon";
import { OBRIcon } from "@/components/icons/OBRIcon";
import { FTCIcon } from "@/components/icons/FTCIcon";
import RevealOnScroll from "../UI/RevealOnScroll";
import { SectionTitle } from "./shared";

/* -------------------------------------------------------------------------- */
/*                                    Dados                                   */
/* -------------------------------------------------------------------------- */

type Competition = {
  slug: string;
  title: string;
  description: string;
  cta: string;
  image: string;
  Icon: ComponentType<SVGProps<SVGSVGElement> & { mono?: boolean }>;
  /** Classes de layout do grid (col-span) */
  span: string;
  /** Altura mínima do card */
  minHeight: string;
  /** Tamanho do título */
  titleSize: string;
  /** Tema de cor — strings completas para o Tailwind detectar */
  theme: {
    card: string;
    overlay: string;
    arrowHover: string;
  };
};

const COMPETITIONS: Competition[] = [
  {
    slug: "fll",
    title: "FIRST LEGO League",
    description:
      "Pontuador por temporada, QuickBrick Studio, Recall, rubricas, timers e guias para equipes iniciantes.",
    cta: "Explorar a FLL",
    image: "/images/index/banner_hero_fll2.webp",
    Icon: FLLIcon,
    span: "lg:col-span-7",
    minHeight: "min-h-[300px]",
    titleSize: "text-3xl sm:text-4xl xl:text-5xl",
    theme: {
      card: "bg-primary shadow-[8px_8px_0_0_var(--color-base-content)] hover:shadow-[10px_10px_0_0_var(--color-base-content)] focus-visible:ring-primary",
      overlay: "from-primary via-primary/80 to-primary/20",
      arrowHover: "group-hover:text-primary",
    },
  },
  {
    slug: "obr",
    title: "OBR",
    description:
      "Pontuador da arena, documentação e o Anatix para visualizar o robô em tempo real.",
    cta: "Explorar a OBR",
    image: "/images/index/banner_hero_obr.webp",
    Icon: OBRIcon,
    span: "lg:col-span-5",
    minHeight: "min-h-[300px]",
    titleSize: "text-4xl sm:text-5xl",
    theme: {
      card: "bg-secondary shadow-[8px_8px_0_0_var(--color-accent)] hover:shadow-[10px_10px_0_0_var(--color-accent)] focus-visible:ring-secondary",
      overlay: "from-secondary via-secondary/85 to-secondary/20",
      arrowHover: "group-hover:text-secondary",
    },
  },
  {
    slug: "ftc",
    title: "FIRST Tech Challenge",
    description:
      "BIOBUZZ: cronômetro, estratégia de TELEOP e scouting com alianças.",
    cta: "Explorar a FTC",
    image: "/images/index/banner_hero_ftc.webp",
    Icon: FTCIcon,
    span: "lg:col-span-5",
    minHeight: "min-h-[260px]",
    titleSize: "text-3xl sm:text-4xl",
    theme: {
      card: "bg-orange-600 shadow-[8px_8px_0_0_var(--color-info)] hover:shadow-[10px_10px_0_0_var(--color-info)] focus-visible:ring-orange-500",
      overlay: "from-orange-500 via-orange-500/75 to-orange-500/10",
      arrowHover: "group-hover:text-orange-500",
    },
  },
];

/* -------------------------------------------------------------------------- */
/*                                 Componentes                                */
/* -------------------------------------------------------------------------- */

function CompetitionCard({
  slug,
  title,
  description,
  cta,
  image,
  Icon,
  minHeight,
  titleSize,
  theme,
}: Competition) {
  return (
    <Link
      href={`/${slug}`}
      className={`group relative isolate flex h-full ${minHeight} flex-col justify-between overflow-hidden rounded-tl-[32px] rounded-br-[32px] p-6 text-white transition-all duration-500 hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 sm:p-8 ${theme.card}`}
    >
      {/* Fundo */}
      <img
        src={image}
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div
        className={`absolute inset-0 -z-10 bg-gradient-to-t ${theme.overlay}`}
      />

      {/* Topo: ícone + selo + seta */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-tl-xl rounded-br-xl border border-white/25 bg-white/10 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
            <Icon mono className="size-7" aria-hidden="true" />
          </span>
        </div>

        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 transition-all duration-300 group-hover:-rotate-45 group-hover:bg-white ${theme.arrowHover}`}
        >
          <ChevronRight size={22} />
        </span>
      </div>

      {/* Conteúdo */}
      <div className="max-w-xl">
        <h3 className={`mt-2 font-black tracking-tight ${titleSize}`}>
          {title}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
          {description}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
          {cta}
          <ChevronRight
            size={18}
            className="transition-transform duration-300 group-hover:translate-x-2"
          />
        </span>
      </div>
    </Link>
  );
}

function ExpansionCard() {
  return (
    <Link
      href="/news"
      className="group flex h-full min-h-[150px] flex-col justify-between rounded-tl-[28px] rounded-br-[28px] border border-dashed border-base-300 bg-base-100/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-3xl font-light text-base-content/40 transition-transform duration-300 group-hover:rotate-90 group-hover:text-primary">
          +
        </span>
        <span className="font-mono text-[10px] font-bold tracking-[0.15em] text-base-content/45">
          EM EXPANSÃO
        </span>
      </div>
      <div>
        <h3 className="text-lg font-bold text-base-content/75">
          Mais modalidades chegando em breve!
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-base-content/60">
          Acompanhe as novidades para saber o que vem por aí.
        </p>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Seção                                   */
/* -------------------------------------------------------------------------- */

const STAGGER = 0.08;

export function CompetitionsSection() {
  return (
    <section className="bg-base-200/40 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll>
          <SectionTitle
            kicker="/ MODALIDADES"
            title="Um lar para cada"
            highlight="competição."
            highlightClass="bg-accent text-accent-content"
            description="Ferramentas pensadas para as regras, os tempos e a rotina de cada modalidade."
          />
        </RevealOnScroll>

        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {COMPETITIONS.map((competition, i) => (
            <RevealOnScroll
              key={competition.slug}
              className={competition.span}
              delay={i * STAGGER}
            >
              <CompetitionCard {...competition} />
            </RevealOnScroll>
          ))}

          <RevealOnScroll
            className="lg:col-span-7"
            delay={COMPETITIONS.length * STAGGER}
          >
            <ExpansionCard />
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
