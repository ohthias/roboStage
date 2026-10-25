import Header from "@/components/UI/Header";
import { MenuCard } from "@/components/Timers/MenuCard";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTimers } from "./config";

type Props = {
  params: Promise<{ competicao: string }>;
};

export const metadata: Metadata = {
  title: "Timers | RoboStage",
  description:
    "Controle o tempo do treino à competição com timers pensados para a realidade das equipes.",
};

export default async function TimersPage({ params }: Props) {
  const { competicao } = await params;
  const timers = getTimers(competicao);

  if (timers.length === 0) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 space-y-8 pt-8 pb-16 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      <Header
        type="Timers"
        name="Controle o tempo"
        highlight="do treino à competição"
        description="Timers pensados para a realidade das equipes."
      />

      <section className="my-8">
        <div
          className={`grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 w-full`}
        >
          {timers.map((timer) => (
            <Link key={timer.slug} href={`/${competicao}/timers/${timer.slug}`}>
              <MenuCard
                title={timer.title}
                description={timer.description}
                icon={timer.icon}
                color={timer.color}
              />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
