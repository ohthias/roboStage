import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ClipboardList,
  Clock,
  Flower2,
  Hexagon,
  Swords,
  Timer,
  Users,
} from "lucide-react";

import Hero from "@/components/Hero";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import { AnimatedBackground, SectionTitle, toneClasses, type Tone } from "@/components/home/shared";
import { NewsSection } from "@/components/home/HomeSections";
import { CtaBlock, StepsRow, ToolGrid, cornerBtn, type ToolItem } from "@/components/competicoes/shared/CompetitionSections";
import { FIELD_COUNTS, MATCH_TIMING, POINTS, RANKING_POINTS, SEASON } from "@/utils/competitions/ftc/biobuzz";
import { getLatestNews } from "@/utils/institutional/news";
import "@/components/home/home.css";

const tools: ToolItem[] = [
  {
    icon: Timer,
    tag: "CRONÔMETRO",
    title: "Partida BIOBUZZ",
    description: "0:30 de AUTO, 0:08 de transição e 2:00 de TELEOP, com avisos de 1:00 e 0:20 e contador de TIPs.",
    href: "/ftc/timers/match",
    tone: "primary",
    status: "Novo",
  },
  {
    icon: Swords,
    tag: "NA FILA",
    title: "Estratégia TeleOp",
    description: "Divida o TELEOP em fases, dê uma função a cada robô e veja pontos e RP estimados antes de entrar.",
    href: "/ftc/estrategia",
    tone: "secondary",
    status: "Novo",
  },
  {
    icon: ClipboardList,
    tag: "SCOUTING",
    title: "Scouting + alianças",
    description: "Registre cada robô do evento, compare médias e receba as melhores duplas para os playoffs.",
    href: "/ftc/scouting",
    tone: "accent",
    status: "Novo",
  },
  {
    icon: Flower2,
    tag: "ARENA",
    title: "Elementos da arena",
    description: "HIVE, CELLS, FLOWERS, GARDENS, POLLEN e NECTAR: o que cada um faz e quanto vale.",
    href: "/ftc/arena",
    tone: "primary",
  },
  {
    icon: BookOpen,
    tag: "REGRAS",
    title: "Documentação",
    description: "Competition Manual, Team Updates, Field CAD, StarterBots e resultados oficiais.",
    href: "/ftc/docs",
    tone: "secondary",
  },
  {
    icon: Clock,
    tag: "TREINO",
    title: "Timer ajustável",
    description: "Para treinar ciclos, apresentações aos juízes ou qualquer outro tempo da equipe.",
    href: "/ftc/timers/custom",
    tone: "accent",
  },
];

const steps = [
  {
    icon: Timer,
    title: "Treine com o tempo real",
    description: "Rode partidas completas ou só o AUTO/TELEOP no cronômetro, contando TIPs como no campo.",
    detail: "Ciclos cronometrados",
    href: "/ftc/timers/match",
    link: "Abrir cronômetro",
  },
  {
    icon: Swords,
    title: "Combine o plano na fila",
    description: "Com o parceiro do lado, distribua funções por fase do TELEOP e saia com um resumo para o técnico.",
    detail: "Plano em 2 minutos",
    href: "/ftc/estrategia",
    link: "Montar estratégia",
  },
  {
    icon: Users,
    title: "Escolha bem a aliança",
    description: "Com o scouting do evento, veja quem completa o seu robô e simule a seleção dos playoffs.",
    detail: "Duplas por dados",
    href: "/ftc/scouting",
    link: "Abrir scouting",
  },
];

const facts: { value: string; label: string; tone: Tone }[] = [
  { value: `${POINTS.teleop.tip}`, label: "pts por TIP da HIVE", tone: "primary" },
  { value: "1:00", label: "NECTAR liberado nas FLOWERS", tone: "accent" },
  { value: `${RANKING_POINTS.swarmThreshold}`, label: "pts de LEAVE + PARK = RP SWARM", tone: "secondary" },
  { value: `${RANKING_POINTS.pollinator1Tips}/${RANKING_POINTS.pollinator2Tips}`, label: "TIPs para os RP POLLINATOR", tone: "primary" },
];

export default async function FTCHome() {
  const news = await getLatestNews(3, "FTC");

  return (
    <main className="mt-16 overflow-x-clip bg-base-100 text-base-content">
      <Hero />

      {/* ======================================================== TEMPORADA */}
      <section className="relative isolate overflow-hidden px-6 py-24">
        <AnimatedBackground />
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1fr] [&>*]:min-w-0">
          <RevealOnScroll>
            <SectionTitle
              kicker={`/ TEMPORADA ${SEASON.period}`}
              title="BIOBUZZ:"
              highlight="vire a HIVE, domine as FLOWERS."
              description={`Na temporada ${SEASON.program}, duas alianças de duas equipes coletam POLLEN e NECTAR, lançam na própria HIVE para virá-la e, no último minuto, disputam as quatro FLOWERS da parede.`}
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/ftc/arena"
                className={`btn btn-primary ${cornerBtn} shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5`}
              >
                Entender a arena <ArrowRight size={17} />
              </Link>
              <a href="https://www.youtube.com/watch?v=sUH3z5a5S9I" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                Animação oficial <ArrowUpRight size={17} />
              </a>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.1}>
            <div className="grid grid-cols-2 gap-4">
              {facts.map(({ value, label, tone }, i) => {
                const c = toneClasses[tone];
                return (
                  <div
                    key={label}
                    className={`group rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5 transition-all hover:-translate-y-1 ${c.hover} ${i === 0 ? "shadow-[6px_6px_0_0_var(--color-primary)]" : ""}`}
                  >
                    <p className={`font-mono text-4xl font-bold tabular-nums ${c.tag}`}>{value}</p>
                    <p className="mt-2 text-sm leading-5 text-base-content/60">{label}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex h-12 overflow-hidden rounded-tl-xl rounded-br-xl border border-base-300 font-mono text-xs font-bold">
              <span className="flex items-center bg-secondary px-3 text-secondary-content" style={{ width: `${(MATCH_TIMING.auto / 158) * 100}%` }}>AUTO 0:30</span>
              <span className="flex items-center justify-center bg-base-300" style={{ width: `${(MATCH_TIMING.transition / 158) * 100}%` }}>8s</span>
              <span className="flex flex-1 items-center bg-primary px-3 text-primary-content">TELEOP 2:00</span>
            </div>
            <p className="mt-3 text-xs text-base-content/45">
              {FIELD_COUNTS.pollen} POLLEN · {FIELD_COUNTS.nectarPerAlliance} NECTAR por aliança · {FIELD_COUNTS.flowers} FLOWERS · 2 HIVES
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ======================================================= FERRAMENTAS */}
      <section className="border-y border-base-300 bg-base-200/40 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionTitle
                kicker="/ FERRAMENTAS DA FTC"
                title="Feitas para o"
                highlight="dia do campeonato."
                highlightClass="bg-accent text-accent-content"
                description="Funcionam no celular, sem login. O scouting e os planos ficam salvos no aparelho e podem ser exportados para o resto da equipe."
              />
              <Link
                href="/ftc/docs"
                className="group inline-flex items-center gap-2 rounded-tl-lg rounded-br-lg border border-base-300 bg-base-100 px-4 py-2 font-mono text-sm transition-colors hover:border-primary hover:text-primary"
              >
                <Hexagon size={16} />
                /ftc/docs
                <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </RevealOnScroll>
          <ToolGrid tools={tools} columns={3} />
        </div>
      </section>

      {/* ============================================================ ETAPAS */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <SectionTitle
              kicker="/ NO EVENTO"
              title="Do treino"
              highlight="aos playoffs."
              highlightClass="bg-secondary text-secondary-content"
              description="Três momentos em que decisão rápida vale ponto: o treino, a fila da partida e a seleção de alianças."
            />
          </RevealOnScroll>
          <StepsRow steps={steps} tone="primary" />
        </div>
      </section>

      <NewsSection news={news} kicker="/ NOVIDADES" title="O que há de novo" highlight="no RoboStage." />

      <CtaBlock
        kicker="FTC · BIOBUZZ"
        icon={Hexagon}
        title="Seu evento, com mais dados e menos improviso."
        text="Comece pelo scouting: cadastre a sua equipe e o evento, registre as partidas e chegue na seleção de alianças com as duplas já comparadas."
        actions={[
          { label: "Abrir o scouting", href: "/ftc/scouting", variant: "accent" },
          { label: "Estratégia TeleOp", href: "/ftc/estrategia", variant: "ghost" },
          { label: "Cronômetro", href: "/ftc/timers/match", variant: "ghost" },
        ]}
      />
    </main>
  );
}
