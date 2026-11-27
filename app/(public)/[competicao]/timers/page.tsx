import { Metadata } from "next";
import { notFound } from "next/navigation";

import Header from "@/components/layout/Header";
import { FeatureCard, Reveal } from "@/components/stage";
import { getTimers } from "@/features/timers/lib/config";

type Props = {
  params: Promise<{ competicao: string }>;
};

export const metadata: Metadata = {
  title: "Timers | RoboStage",
  description:
    "Controle o tempo do treino à competição com timers pensados para a realidade das equipes.",
};

// O FeatureCard aceita estes tons; o resto cai em primary.
const TONES = ["primary", "secondary", "accent", "success", "info"] as const;
type CardTone = (typeof TONES)[number];
const toTone = (c: string): CardTone => ((TONES as readonly string[]).includes(c) ? (c as CardTone) : "primary");

export default async function TimersPage({ params }: Props) {
  const { competicao } = await params;
  const timers = getTimers(competicao);

  if (timers.length === 0) notFound();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-12 px-4 pb-24 pt-8">
      <Header
        type="Timers"
        name="Controle o tempo"
        highlight="do treino à competição"
        description="Timers pensados para a realidade das equipes."
      />

      <section aria-label="Timers disponíveis" className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {timers.map(({ slug, title, description, icon: Icon, color }, i) => (
          <Reveal key={slug} delay={(i % 3) * 60} className="h-full">
            <FeatureCard
              title={title}
              description={description}
              category="Timer"
              icon={<Icon />}
              href={`/${competicao}/timers/${slug}`}
              index={i + 1}
              tone={toTone(color)}
              ctaLabel="Abrir timer"
            />
          </Reveal>
        ))}
      </section>
    </main>
  );
}
