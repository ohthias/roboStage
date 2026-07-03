import Header from "@/components/UI/Header";
import { Footer } from "@/components/UI/Footer";
import { MenuCard } from "@/components/Timers/MenuCard";

import { Trophy, BookOpen, Clock } from "lucide-react";
import Link from "next/link";

const timers = [
  {
    slug: "robot-game",
    title: "Round do Robô",
    description:
      "Timer de rodada oficial para competições FLL, com contagem regressiva, alertas sonoros e visuais.",
    icon: Trophy,
    color: "primary",
  },
  {
    slug: "judging",
    title: "Sala de Avaliação",
    description:
      "Controle completo do tempo de Entrada, Apresentação, Perguntas e Feedback.",
    icon: BookOpen,
    color: "secondary",
  },
  {
    slug: "custom",
    title: "Timer Ajustável",
    description:
      "Timer personalizável para treinos, apresentações ou qualquer outra necessidade.",
    icon: Clock,
    color: "success",
  },
];

export default function TimersPage() {
  return (
    <>
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-12">
        <Header
          type="Timers"
          name="Controle o tempo"
          highlight="do treino à competição"
          description="Timers pensados para a realidade das equipes."
        />

        <section className="my-8">
          <div className="grid gap-6 md:grid-cols-3">
            {timers.map((timer) => (
              <Link key={timer.slug} href={`/fll/timers/${timer.slug}`}>
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

      <Footer />
    </>
  );
}