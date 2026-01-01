import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { season: string };
}): Promise<Metadata> {
  const season = params.season.replace("-", " ");

  return {
    title: `FLL Score ${season} | RoboStage`,
    description: `Pontuador oficial da FIRST LEGO League ${season}. Acompanhe pontuação, regras e progresso da partida em tempo real.`,
    keywords: [
      "FIRST LEGO League",
      "FLL Score",
      "pontuação FLL",
      "FLL scoreboard",
      season,
      "RoboStage",
    ],
    openGraph: {
      title: `FLL Score ${season}`,
      description:
        `Placar e pontuação da FIRST LEGO League ${season}, com regras oficiais e visual de arena.`,
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function FllScoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section
      className="min-h-screen bg-base-100"
      aria-labelledby="fll-score-title"
    >
      {children}
    </section>
  );
}
