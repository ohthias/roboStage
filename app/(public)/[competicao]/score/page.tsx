import { asset } from "@/lib/assets";
import Header from "@/components/layout/Header";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Reveal, StickerTag, cn, toneSoft } from "@/components/stage";
import PontuadorOBR from "@/features/leagues/obr/score/components/Pontuador";
import FtcScore from "@/features/leagues/ftc/components/FtcScore";
import { SEASON } from "@/features/leagues/ftc/lib/biobuzz";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competicao: string }>;
}) {
  const { competicao } = await params;

  if (competicao === "ftc") {
    return {
      title: { absolute: "Pontuador de treino FTC BIOBUZZ | RoboStage" },
      description:
        "Pontuador de treino da FIRST Tech Challenge (BIOBUZZ 2026/2027): AUTO, TELEOP, FLOWERS, RP e faltas, com cronômetro e histórico de tentativas.",
      alternates: { canonical: "/ftc/score" },
    };
  }

  if (competicao === "obr") {
    return {
      title: "Pontuador OBR | RoboStage",
      description:
        "Pontuador da Olimpíada Brasileira de Robótica para calcular a pontuação da sua equipe.",
    };
  }

  return {
    title: "FLL Score",
    description:
      "Pontuador da FIRST LEGO League (FLL) para calcular a pontuação da sua equipe.",
  };
}

const seasons = [
  {
    slug: "bioglow",
    title: "BIOGLOW",
    description:
      "Descubra a vibração dos ecossistemas do mundo natural e como a ciência pode ajudar a preservá-los.",
    image: asset("/images/seasons/fll/bioglow_logo_founders_edition.webp"),
    badge: "2026–2027",
    accent: "secondary" as const,
  },
  {
    slug: "unearthed",
    title: "UNEARTHED",
    description:
      "Descubra o passado para construir o futuro através da arqueologia e tecnologia.",
    image: asset("/images/seasons/fll/Unearthed.webp"),
    badge: "2025–2026",
    accent: "primary" as const,
  },
  {
    slug: "submerged",
    title: "SUBMERGED",
    description:
      "Explore os oceanos e desenvolva soluções para proteger nossos ecossistemas aquáticos.",
    image: asset("/images/seasons/fll/Submerged.webp"),
    badge: "2024–2025",
    accent: "secondary" as const,
  },
  {
    slug: "masterpiece",
    title: "MASTERPIECE",
    description:
      "Celebre a criatividade, arte e inovação através da tecnologia.",
    image: asset("/images/seasons/fll/Masterpiece.png"),
    badge: "2023–2024",
    accent: "accent" as const,
  },
];

export default async function ScorePage({
  params,
}: {
  params: Promise<{ competicao: string }>;
}) {
  const { competicao } = await params;

  if (competicao === "ftc") {
    return (
      <div className="bg-linear-to-b from-base-100 to-base-200">
        <FtcScore />
      </div>
    );
  }

  if (competicao === "obr") {
    return (
      <div className="bg-linear-to-b from-base-100 to-base-200">
        <PontuadorOBR />
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-12 px-4 pb-24 pt-8">
      <Header
        type="Pontuador"
        name="Pontuadores da"
        highlight="FLL"
        description="Escolha uma temporada. E comece a calcular a pontuação da sua equipe."
      />

      <section aria-label="Temporadas" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {seasons.map((season, i) => (
          <Reveal key={season.slug} delay={i * 60} className="h-full">
            <SeasonScoreCard season={season} current={i === 0} />
          </Reveal>
        ))}
      </section>
    </main>
  );
}

/* ------------------------------------------------------------ card */

const hoverShadow = {
  primary: "hover:border-primary hover:shadow-[8px_8px_0_var(--color-primary)] has-[a:focus-visible]:shadow-[8px_8px_0_var(--color-primary)]",
  secondary: "hover:border-secondary hover:shadow-[8px_8px_0_var(--color-secondary)] has-[a:focus-visible]:shadow-[8px_8px_0_var(--color-secondary)]",
  accent: "hover:border-accent hover:shadow-[8px_8px_0_var(--color-accent)] has-[a:focus-visible]:shadow-[8px_8px_0_var(--color-accent)]",
};

function SeasonScoreCard({ season, current }: { season: (typeof seasons)[number]; current?: boolean }) {
  const tone = season.accent;
  return (
    <article
      className={cn(
        "stage-paper group relative flex h-full flex-col overflow-hidden rounded-tl-[30px] rounded-br-[30px] border border-base-300 bg-base-100 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-x-1 hover:-translate-y-1 motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0",
        hoverShadow[tone],
      )}
    >
      <figure className="stage-dots relative grid h-44 place-items-center border-b border-base-300 bg-base-200/60 px-6 [background-size:16px_16px]">
        <Image
          src={season.image}
          alt=""
          width={288}
          height={144}
          sizes="240px"
          className="h-auto max-h-28 w-auto object-contain transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
        />
        {current && (
          <StickerTag tone="accent" rotate={-5} className="absolute left-4 top-4">
            Atual
          </StickerTag>
        )}
      </figure>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="stage-kicker text-base-content/45">/ {season.badge}</p>
        <h2 className="text-xl font-black tracking-tight">
          <Link
            href={`/fll/score/${season.slug}`}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {season.title}
          </Link>
        </h2>
        <p className="line-clamp-3 flex-1 text-sm leading-6 text-base-content/60">{season.description}</p>
      </div>

      <div className="flex items-center justify-between border-t border-dashed border-base-300 px-5 py-3 text-sm font-bold">
        <span>Abrir pontuador</span>
        <span
          aria-hidden="true"
          className={cn(
            "grid size-8 place-items-center rounded-tl-lg rounded-br-lg transition-colors",
            toneSoft[tone],
          )}
        >
          <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:rotate-45" />
        </span>
      </div>
    </article>
  );
}
