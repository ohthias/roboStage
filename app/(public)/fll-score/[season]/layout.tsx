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
    season.charAt(0).toUpperCase() + season.slice(1);

  return {
    title: `${seasonFormatted} - FLL Score`,
    description: `Pontuador da temporada ${seasonFormatted} da FLL`,
  };
}

export default function FllScoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-base-100">
      {children}
    </section>
  );
}