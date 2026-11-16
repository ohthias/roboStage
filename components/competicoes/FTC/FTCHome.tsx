import Link from "next/link";
import { ArrowRight, ArrowUpRight, Award, BookOpen, CalendarDays, ClipboardList, Cog, Flower2, Hexagon, History, MapPin, School, Swords, Timer, Trophy, Users } from "lucide-react";

import Hero from "@/components/Hero";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import { ACCENT_TEXT, AnimatedBackground, SectionTitle, toneClasses, type Tone } from "@/components/home/shared";
import { NewsSection } from "@/components/home/HomeSections";
import { CtaBlock, StepsRow, ToolGrid, cornerBtn, type ToolItem } from "@/components/competicoes/shared/CompetitionSections";
import { POINTS, RANKING_POINTS, SEASON } from "@/utils/competitions/ftc/biobuzz";
import { getLatestNews } from "@/utils/institutional/news";
import "@/components/home/home.css";

const tools: ToolItem[] = [
  {
    icon: Timer,
    tag: "CRONÔMETRO",
    title: "Partida BIOBUZZ",
    description:
      "0:30 de AUTO, 0:08 de transição e 2:00 de TELEOP, com avisos de 1:00 e 0:20 e contador de TIPs.",
    href: "/ftc/timers/match",
    tone: "primary",
    status: "Novo",
  },
  {
    icon: Trophy,
    tag: "TREINO",
    title: "Pontuador",
    description:
      "Conte AUTO, TIPs, FLOWERS, PARK, faltas e RP de cada treino e acompanhe a evolução das tentativas.",
    href: "/ftc/score",
    tone: "accent",
    status: "Novo",
  },
  {
    icon: Swords,
    tag: "NA FILA",
    title: "Estratégia TeleOp",
    description:
      "Divida o TELEOP em fases, dê uma função a cada robô e veja pontos e RP estimados antes de entrar.",
    href: "/ftc/estrategia",
    tone: "secondary",
    status: "Novo",
  },
  {
    icon: ClipboardList,
    tag: "SCOUTING",
    title: "Scouting + alianças",
    description:
      "Importa ranking, agenda e OPR da FTCScout, soma as anotações dos seus scouts e sugere as melhores duplas para os playoffs.",
    href: "/ftc/scouting",
    tone: "primary",
    status: "Novo",
  },
  {
    icon: Flower2,
    tag: "ARENA",
    title: "Elementos da arena",
    description:
      "HIVE, CELLS, FLOWERS, GARDENS, POLLEN e NECTAR: o que cada um faz e quanto vale.",
    href: "/ftc/arena",
    tone: "secondary",
  },
  {
    icon: BookOpen,
    tag: "REGRAS",
    title: "Documentação",
    description:
      "Competition Manual, Team Updates, Field CAD, StarterBots e resultados oficiais.",
    href: "/ftc/docs",
    tone: "accent",
  },
];

const steps = [
  {
    icon: Trophy,
    title: "Treine e pontue",
    description:
      "Rode a partida no cronômetro e registre cada tentativa no pontuador, contando TIPs e PARK como no campo.",
    detail: "Evolução por tentativa",
    href: "/ftc/score",
    link: "Abrir pontuador",
  },
  {
    icon: Swords,
    title: "Combine o plano na fila",
    description:
      "Com o parceiro do lado, distribua funções por fase do TELEOP e saia com um resumo para o técnico.",
    detail: "Plano em 2 minutos",
    href: "/ftc/estrategia",
    link: "Montar estratégia",
  },
  {
    icon: Users,
    title: "Escolha bem a aliança",
    description:
      "Com os dados da FTCScout e as anotações do evento, veja quem completa o seu robô e simule a seleção dos playoffs.",
    detail: "Duplas por dados",
    href: "/ftc/scouting",
    link: "Abrir scouting",
  },
];

/** O que é a FTC: quatro características do programa. */
const ftcTraits: {
  icon: typeof Cog;
  title: string;
  text: string;
  tone: Tone;
}[] = [
  {
    icon: School,
    title: "Do 7º ano ao Ensino Médio",
    text: "Estudantes de 12 a 18 anos, em equipes de até 15 pessoas, com técnicos e mentores adultos.",
    tone: "primary",
  },
  {
    icon: Cog,
    title: "Robôs de médio porte",
    text: "Projetados, construídos e programados pela equipe, com até 19 kg e peças de vários fabricantes.",
    tone: "secondary",
  },
  {
    icon: Swords,
    title: "Alianças de 2 contra 2",
    text: "Cada partida junta duas equipes por aliança: 30 s de robô autônomo e 2 min pilotado.",
    tone: "accent",
  },
  {
    icon: Award,
    title: "Mais que robôs",
    text: "Portfólio de engenharia, entrevista com os juízes e Core Values também levam a prêmios e vagas.",
    tone: "primary",
  },
];

/** FTC no Brasil (números da temporada 2025/26, divulgados pelo SESI). */
const brazilStats = [
  { value: "120", label: "equipes na temporada 2025/26" },
  { value: "13", label: "estados com seletivas regionais" },
  { value: "1,2 mil+", label: "estudantes competindo" },
  { value: "2018/19", label: "primeira temporada no Brasil" },
];

const brazilTimeline = [
  {
    when: "2012",
    title: "SESI traz a FIRST ao Brasil",
    text: "O SESI passa a operar os programas da FIRST no país, começando pela FIRST LEGO League.",
  },
  {
    when: "2018/19",
    title: "A FTC estreia",
    text: "Primeira temporada brasileira da FTC, aberta apenas a estudantes do Ensino Médio.",
  },
  {
    when: "2025/26",
    title: "Temporada recorde",
    text: "13 seletivas regionais, 120 equipes e todas as equipes brasileiras da FTC premiadas no FIRST Championship, em Houston.",
  },
  {
    when: "Jun 2026",
    title: "Growth Award",
    text: "O SESI recebe o prêmio de crescimento da FTC na categoria Large Region, na FIRST Partner Conference.",
  },
  {
    when: "2026/27",
    title: "BIOBUZZ e o 7º ano",
    text: "Estudantes do 7º ano passam a competir. As regionais classificam para o nacional, em março de 2027, em Salvador.",
    current: true,
  },
];

/* --------------------------------------------------------------- página */

export default async function FTCHome() {
  const news = await getLatestNews(3, "FTC");

  return (
    <main className="mt-16 overflow-x-clip bg-base-100 text-base-content">
      <Hero />

      {/* ========================================================= SOBRE A FTC */}
      <section className="relative isolate overflow-clip px-6 py-24">
        <AnimatedBackground />
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.05fr] [&>*]:min-w-0">
          <figure className="relative h-fit self-start lg:sticky lg:top-24">
            <img
              src="https://www.bostontechmom.com/wp-content/uploads/2021/08/first-tech-challenge-robotics-competition.jpg"
              alt="Partida da FIRST Tech Challenge"
              className="w-full rounded-tl-3xl rounded-br-3xl shadow-[8px_8px_0_0_var(--color-base-content)]"
            />
            <p className="mt-2 text-base-content/50 italic text-sm">Imagem de Boston Tech Mom</p>
          </figure>

          <RevealOnScroll delay={0.1}>
            <SectionTitle
              kicker="/ O QUE É A FTC"
              title="Engenharia de verdade,"
              highlight="em formato de esporte."
              highlightClass="bg-secondary text-secondary-content"
            />
            <p className="mt-6 text-base leading-7 text-base-content/65 sm:text-lg">
              A FIRST® Tech Challenge é a competição internacional de robótica
              da FIRST para estudantes do 7º ano ao Ensino Médio. A cada
              temporada sai um desafio novo, e as equipes têm alguns meses para
              projetar, construir, programar e pilotar um robô que dispute
              partidas em alianças contra outras equipes.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {ftcTraits.map(({ icon: Icon, title, text, tone }) => {
                const c = toneClasses[tone];
                return (
                  <div
                    key={title}
                    className={`group flex gap-3 rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 p-4 transition-colors ${c.hover}`}
                  >
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-tl-lg rounded-br-lg transition-colors ${c.icon}`}
                    >
                      <Icon size={17} strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold">{title}</h3>
                      <p className="mt-1 text-xs leading-5 text-base-content/60">
                        {text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://www.firstinspires.org/programs/ftc"
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn-outline ${cornerBtn} border-base-content/25 hover:border-secondary hover:bg-secondary hover:text-secondary-content`}
              >
                Site oficial da FTC <ArrowUpRight size={17} />
              </a>
              <Link href="/ftc/docs" className="btn btn-ghost">
                <BookOpen size={17} /> Regras da temporada
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ========================================================== TEMPORADA */}
      <section className="relative isolate overflow-clip bg-[#fffaba] px-6 py-12 text-[#121212]">
        <svg aria-hidden="true" className="absolute inset-0 -z-10 size-full opacity-[0.14]">
          <defs>
            <pattern id="biobuzz-hex" width="56" height="97" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
              <path d="M28 0 56 16v32L28 64 0 48V16Z M28 64v33 M0 97V80 M56 97V80" fill="none" stroke="#00000044" strokeWidth="3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#biobuzz-hex)" />
        </svg>
        <RevealOnScroll>
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 md:flex-row md:items-center">
            <img
              src="/images/logos/ftc/biobuzz_logo.png"
              alt="Logo da temporada BIOBUZZ da FIRST Tech Challenge"
              className="h-auto w-36 shrink-0 sm:w-44"
            />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs font-bold tracking-[0.2em] text-[#0f1821]/60">
                / TEMPORADA {SEASON.period} · JÁ NO ROBOSTAGE
              </p>
              <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight sm:text-4xl">
                A BIOBUZZ chegou.{" "}
                <span className="inline-block -rotate-1 bg-[#0f1821] px-2 italic text-[#EEE9A5]">Bora virar a HIVE?</span>
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#0f1821]/75 sm:text-base">
                Cronômetro, pontuador, estratégia e scouting da nova temporada já estão prontos para o seu próximo treino.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href="/ftc/score"
                className={`btn border-0 bg-[#0f1821] text-[#EEE9A5] ${cornerBtn} shadow-[4px_4px_0_0_#EEE9A5] transition-all hover:-translate-y-0.5 hover:bg-[#0f1821] hover:shadow-[6px_6px_0_0_#EEE9A5]`}
              >
                <Trophy size={17} /> Pontuar a BIOBUZZ
              </Link>
              <Link
                href="/ftc/arena"
                className={`btn btn-outline ${cornerBtn} border-2 border-[#0f1821] text-[#0f1821] hover:border-[#0f1821] hover:bg-[#0f1821] hover:text-[#EEE9A5]`}
              >
                Conhecer a arena <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* ====================================================== FTC NO BRASIL */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <SectionTitle
              kicker="/ FTC NO BRASIL"
              title="Uma comunidade que"
              highlight="não para de crescer."
              highlightClass="bg-accent text-accent-content"
              description="No Brasil, a FTC é operada pelo SESI. As equipes disputam seletivas regionais entre outubro e dezembro, as melhores seguem para o nacional, e de lá saem as vagas para o FIRST Championship, nos Estados Unidos."
            />
          </RevealOnScroll>

          <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {brazilStats.map(({ value, label }, i) => (
              <RevealOnScroll key={label} delay={i * 0.06} className="h-full">
                <div
                  className={`h-full rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5 ${i === 0 ? "shadow-[6px_6px_0_0_var(--color-accent)]" : ""}`}
                >
                  <p
                    className={`font-mono text-3xl font-bold tabular-nums sm:text-4xl ${i === 0 ? ACCENT_TEXT : ""}`}
                  >
                    {value}
                  </p>
                  <p className="mt-2 text-sm leading-5 text-base-content/60">
                    {label}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          <RevealOnScroll delay={0.1}>
            <div className="mt-14 overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] bg-[#1f1c18] text-[#f3ecdc] shadow-[10px_10px_0_0_var(--color-secondary)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-4 sm:px-8">
                <p className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-white/60">
                  <History size={14} /> LINHA DO TEMPO
                </p>
                <p className="flex items-center gap-2 font-mono text-xs text-white/50">
                  <MapPin size={14} /> Nacional 2027 · Salvador (BA)
                </p>
              </div>
              <ol className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
                {brazilTimeline.map(({ when, title, text, current }) => (
                  <li
                    key={when}
                    className={`flex flex-col p-6 ${current ? "bg-[#2a2622]" : "bg-[#1f1c18]"}`}
                  >
                    <p
                      className={`font-mono text-sm font-bold ${current ? "text-[#9be15d]" : "text-white/50"}`}
                    >
                      {when}
                      {current && (
                        <span className="ml-2 rounded bg-[#9be15d] px-1.5 py-0.5 text-[10px] text-[#1f1c18]">
                          AGORA
                        </span>
                      )}
                    </p>
                    <h3 className="mt-3 font-bold leading-snug">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">
                      {text}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </RevealOnScroll>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-base-content/45">
              Números divulgados pelo SESI / Agência de Notícias da Indústria. O
              RoboStage não é afiliado à FIRST® nem ao SESI.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://noticias.portaldaindustria.com.br/noticias/robotica/sesi-recebe-premio-internacional-pelo-crescimento-da-ftc-e-da-robotica-no-brasil/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
              >
                <CalendarDays size={15} /> Calendário e notícias do SESI{" "}
                <ArrowUpRight size={14} />
              </a>
              <Link href="/roboticar#dados" className="btn btn-ghost btn-sm">
                Dados da robótica no Brasil <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================= FERRAMENTAS */}
      <section className="px-6 py-24">
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
                <ArrowUpRight
                  size={15}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </RevealOnScroll>
          <ToolGrid tools={tools} columns={3} />
        </div>
      </section>

      {/* ============================================================ ETAPAS */}
      <section className="border-t border-base-300 px-6 py-24">
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

      <NewsSection
        news={news}
        kicker="/ NOVIDADES"
        title="O que há de novo"
        highlight="no RoboStage."
      />

      <CtaBlock
        kicker="FTC · BIOBUZZ"
        icon={Hexagon}
        title="Seu evento, com mais dados e menos improviso."
        text="Pontue os treinos, combine a estratégia na fila e chegue na seleção de alianças com as duplas já comparadas."
        actions={[
          { label: "Abrir o pontuador", href: "/ftc/score", variant: "accent" },
          { label: "Scouting", href: "/ftc/scouting", variant: "ghost" },
          {
            label: "Estratégia TeleOp",
            href: "/ftc/estrategia",
            variant: "ghost",
          },
        ]}
      />
    </main>
  );
}
