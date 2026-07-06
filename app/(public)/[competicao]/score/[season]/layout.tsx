import { Metadata } from "next";

type Props = {
  params: Promise<{
    season: string;
  }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { season } = await params;

  const seasonFormatted =
    season.toUpperCase();

  return {
    title: `${seasonFormatted} | RoboStage Score`,
    description: `Pontuador da temporada ${seasonFormatted} da FLL`,
  };
}

export default function FllScoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-base-200">
      {children}
    </section>
  );
}