import { asset } from "@/lib/assets";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Cog,
  Flower2,
  Hexagon,
  History,
  MapPin,
  School,
  Swords,
  Timer,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

import Hero from "@/components/layout/Hero";
import { NewsSection } from "@/features/home/components/HomeSections";
import {
  ButtonLink,
  Card,
  CountUp,
  FeatureCard,
  Gear,
  Kicker,
  Reveal,
  Section,
  SectionTitle,
  Sparkle,
  Squiggle,
  StageImage,
  Starburst,
  StatCard,
  StickerTag,
  Timeline,
  cn,
  toneSoft,
  type Tone,
} from "@/components/stage";
import { SEASON } from "@/features/leagues/ftc/lib/biobuzz";
import { getLatestNews } from "@/features/institutional/lib/news";

/* ================================================================ DADOS */

type FtcTool = {
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
  href: string;
  tone: "primary" | "secondary" | "accent";
  status?: string;
};

const tools: FtcTool[] = [
  {
    icon: Timer,
    tag: "Cronômetro",
    title: "Partida BIOBUZZ",
    description:
      "0:30 de AUTO, 0:08 de transição e 2:00 de TELEOP, com avisos de 1:00 e 0:20 e contador de TIPs.",
    href: "/ftc/timers/match",
    tone: "primary",
    status: "Novo",
  },
  {
    icon: Trophy,
    tag: "Treino",
    title: "Pontuador",
    description:
      "Conte AUTO, TIPs, FLOWERS, PARK, faltas e RP de cada treino e acompanhe a evolução das tentativas.",
    href: "/ftc/score",
    tone: "accent",
    status: "Novo",
  },
  {
    icon: Swords,
    tag: "Na fila",
    title: "Estratégia TeleOp",
    description:
      "Divida o TELEOP em fases, dê uma função a cada robô e veja pontos e RP estimados antes de entrar.",
    href: "/ftc/estrategia",
    tone: "secondary",
    status: "Novo",
  },
  {
    icon: ClipboardList,
    tag: "Scouting",
    title: "Scouting + alianças",
    description:
      "Importa ranking, agenda e OPR da FTCScout, soma as anotações dos seus scouts e sugere as melhores duplas para os playoffs.",
    href: "/ftc/scouting",
    tone: "primary",
    status: "Novo",
  },
  {
    icon: Flower2,
    tag: "Arena",
    title: "Elementos da arena",
    description: "HIVE, CELLS, FLOWERS, GARDENS, POLLEN e NECTAR: o que cada um faz e quanto vale.",
    href: "/ftc/arena",
    tone: "secondary",
  },
  {
    icon: BookOpen,
    tag: "Regras",
    title: "Documentação",
    description: "Competition Manual, Team Updates, Field CAD, StarterBots e resultados oficiais.",
    href: "/ftc/docs",
    tone: "accent",
  },
];

const steps = [
  {
    number: "01",
    icon: Trophy,
    title: "Treine e pontue",
    description:
      "Rode a partida no cronômetro e registre cada tentativa no pontuador, contando TIPs e PARK como no campo.",
    detail: "Evolução por tentativa",
    href: "/ftc/score",
    link: "Abrir pontuador",
  },
  {
    number: "02",
    icon: Swords,
    title: "Combine o plano na fila",
    description:
      "Com o parceiro do lado, distribua funções por fase do TELEOP e saia com um resumo para o técnico.",
    detail: "Plano em 2 minutos",
    href: "/ftc/estrategia",
    link: "Montar estratégia",
  },
  {
    number: "03",
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
const ftcTraits: { icon: LucideIcon; title: string; text: string; tone: Tone }[] = [
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
const brazilStats: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  tone: Tone;
}[] = [
  { label: "Equipes na temporada 2025/26", value: <CountUp value={120} />, icon: Users, tone: "accent" },
  { label: "Estados com seletivas regionais", value: <CountUp value={13} />, icon: MapPin, tone: "secondary" },
  { label: "Estudantes competindo", value: "1,2 mil+", icon: School, tone: "primary" },
  { label: "Primeira temporada no Brasil", value: "2018/19", icon: History, tone: "secondary" },
];

const brazilTimeline = [
  {
    time: "2012",
    title: "SESI traz a FIRST ao Brasil",
    text: "O SESI passa a operar os programas da FIRST no país, começando pela FIRST LEGO League.",
  },
  {
    time: "2018/19",
    title: "A FTC estreia",
    text: "Primeira temporada brasileira da FTC, aberta apenas a estudantes do Ensino Médio.",
  },
  {
    time: "2025/26",
    title: "Temporada recorde",
    text: "13 seletivas regionais, 120 equipes e todas as equipes brasileiras da FTC premiadas no FIRST Championship, em Houston.",
  },
  {
    time: "Jun 2026",
    title: "Growth Award",
    text: "O SESI recebe o prêmio de crescimento da FTC na categoria Large Region, na FIRST Partner Conference.",
  },
  {
    time: "2026/27",
    title: "BIOBUZZ e o 7º ano",
    text: "Estudantes do 7º ano passam a competir. As regionais classificam para o nacional, em março de 2027, em Salvador.",
    current: true,
  },
];

/* =============================================================== PÁGINA */

export default async function FTCHome() {
  const news = await getLatestNews(3, "FTC");

  return (
    <main className="mt-16 overflow-x-clip bg-base-100 text-base-content">
      <Hero />
      <AboutSection />
      <SeasonBand />
      <BrazilSection />
      <ToolsSection />
      <StepsSection />
      <NewsSection news={news} kicker="/ NOVIDADES" title="O que há de novo" highlight="no RoboStage." />
      <FinalCta />
    </main>
  );
}

/* ========================================================= SOBRE A FTC */

function AboutSection() {
  return (
    <Section tone="glow">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.05fr] [&>*]:min-w-0">
        <Reveal effect="pop" className="relative h-fit self-start lg:sticky lg:top-24">
          <Sparkle size={36} tone="accent" motion="float" className="absolute -left-3 -top-5 z-10" />
          <StageImage
            src={asset("/images/competitions/ftc/FTC_hero.png")}
            alt="Desenho da arena da BIOBUZZ, com a HIVE no centro, as FLOWERS e os robôs"
            ratio="16/9"
            frame="card"
            badge="ARENA · BIOBUZZ"
            sizes="(min-width: 1024px) 45vw, 100vw"
            imgClassName="!object-contain"
          />
        </Reveal>

        <Reveal delay={100}>
          <SectionTitle
            kicker="/ O QUE É A FTC"
            title="Engenharia de verdade,"
            highlight="em formato de esporte."
            highlightTone="secondary"
          />
          <p className="mt-6 text-base leading-7 text-base-content/65 sm:text-lg">
            A FIRST® Tech Challenge é a competição internacional de robótica da FIRST para estudantes do
            7º ano ao Ensino Médio. A cada temporada sai um desafio novo, e as equipes têm alguns meses
            para projetar, construir, programar e pilotar um robô que dispute partidas em alianças contra
            outras equipes.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {ftcTraits.map(({ icon: Icon, title, text, tone }) => (
              <div
                key={title}
                className="stage-paper group flex gap-3 rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 p-4 transition-colors hover:border-base-content/30"
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-tl-lg rounded-br-lg transition-colors",
                    toneSoft[tone],
                  )}
                >
                  <Icon size={17} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-base-content/60">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink
              href="https://www.firstinspires.org/programs/ftc"
              target="_blank"
              rel="noopener noreferrer"
              tone="outline"
              iconRight={<ArrowUpRight size={17} />}
            >
              Site oficial da FTC
            </ButtonLink>
            <ButtonLink href="/ftc/docs" tone="ghost" shape="rounded" iconLeft={<BookOpen size={17} />}>
              Regras da temporada
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* =========================================================== TEMPORADA */

/** Faixa da temporada: mantém a identidade da BIOBUZZ (amarelo, colmeia e azul-noite). */
function SeasonBand() {
  return (
    <Section texture="noise" innerClassName="relative isolate overflow-clip bg-[#fffaba] py-12 text-[#121212]">
      <svg aria-hidden="true" className="absolute inset-0 -z-10 size-full opacity-[0.14]">
        <defs>
          <pattern id="biobuzz-hex" width="56" height="97" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
            <path d="M28 0 56 16v32L28 64 0 48V16Z M28 64v33 M0 97V80 M56 97V80" fill="none" stroke="#00000044" strokeWidth="3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#biobuzz-hex)" />
      </svg>

      <Reveal>
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 md:flex-row md:items-center">
          <div className="relative shrink-0">
            <Image
              src={asset("/images/seasons/ftc/biobuzz_logo.png")}
              alt="Logo da temporada BIOBUZZ da FIRST Tech Challenge"
              width={176}
              height={125}
              className="h-auto w-36 sm:w-44"
            />
            <StickerTag tone="ink" size="sm" rotate={-8} className="absolute -right-4 -top-3">
              Nova
            </StickerTag>
          </div>

          <div className="min-w-0 flex-1">
            <p className="stage-kicker text-[#0f1821]/60">/ TEMPORADA {SEASON.period} · JÁ NO ROBOSTAGE</p>
            <h2 className="stage-display mt-2 text-2xl leading-tight sm:text-4xl">
              A BIOBUZZ chegou.{" "}
              <span className="inline-block -rotate-1 bg-[#0f1821] px-2 italic text-[#EEE9A5]">Bora virar a HIVE?</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#0f1821]/75 sm:text-base">
              Cronômetro, pontuador, estratégia e scouting da nova temporada já estão prontos para o seu
              próximo treino.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <ButtonLink
              href="/ftc/score"
              flat
              iconLeft={<Trophy size={17} />}
              className="border-0 bg-[#0f1821] text-[#EEE9A5] shadow-[4px_4px_0_0_#EEE9A5] hover:-translate-y-0.5 hover:bg-[#0f1821] hover:shadow-[6px_6px_0_0_#EEE9A5]"
            >
              Pontuar a BIOBUZZ
            </ButtonLink>
            <ButtonLink
              href="/ftc/arena"
              tone="outline"
              iconRight={<ArrowRight size={17} />}
              className="border-2 border-[#0f1821] text-[#0f1821] hover:border-[#0f1821] hover:bg-[#0f1821] hover:text-[#EEE9A5]"
            >
              Conhecer a arena
            </ButtonLink>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ======================================================= FTC NO BRASIL */

function BrazilSection() {
  return (
    <Section>
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionTitle
            kicker="/ FTC NO BRASIL"
            title="Uma comunidade que"
            highlight="não para de crescer."
            highlightTone="accent"
            description="No Brasil, a FTC é operada pelo SESI. As equipes disputam seletivas regionais entre outubro e dezembro, as melhores seguem para o nacional, e de lá saem as vagas para o FIRST Championship, nos Estados Unidos."
          />
        </Reveal>

        <div className="mt-12 grid items-start gap-6 lg:grid-cols-[1fr_1.15fr]">
          <div className="grid grid-cols-2 gap-4">
            {brazilStats.map(({ label, value, icon: Icon, tone }, i) => (
              <Reveal key={label} delay={i * 60} className="h-full">
                <StatCard
                  label={label}
                  value={value}
                  icon={<Icon size={17} />}
                  tone={tone}
                  className={cn(
                    "h-full border border-base-300",
                    i === 0 && "border-accent shadow-[6px_6px_0_0_var(--color-accent)]",
                  )}
                />
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <Card corner className="relative border border-base-300 p-0">
              <Squiggle size={70} tone="accent" className="absolute -top-8 right-6 hidden sm:block" />
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-300 px-6 py-4">
                <Kicker className="flex items-center gap-2">LINHA DO TEMPO</Kicker>
                <p className="flex items-center gap-1.5 font-mono text-xs text-base-content/55">
                  <MapPin size={14} /> Nacional 2027 · Salvador (BA)
                </p>
              </div>
              <Timeline items={brazilTimeline} className="px-4 py-6 sm:px-6" />
            </Card>
          </Reveal>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-base-content/45">
            Números divulgados pelo SESI / Agência de Notícias da Indústria. O RoboStage não é afiliado à
            FIRST® nem ao SESI.
          </p>
          <div className="flex flex-wrap gap-2">
            <ButtonLink
              href="https://noticias.portaldaindustria.com.br/noticias/robotica/sesi-recebe-premio-internacional-pelo-crescimento-da-ftc-e-da-robotica-no-brasil/"
              target="_blank"
              rel="noopener noreferrer"
              tone="ghost"
              size="sm"
              shape="rounded"
              iconLeft={<CalendarDays size={15} />}
              iconRight={<ArrowUpRight size={14} />}
            >
              Calendário e notícias do SESI
            </ButtonLink>
            <ButtonLink
              href="/roboticar#dados"
              tone="ghost"
              size="sm"
              shape="rounded"
              iconRight={<ArrowRight size={14} />}
            >
              Dados da robótica no Brasil
            </ButtonLink>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ========================================================= FERRAMENTAS */

function ToolsSection() {
  return (
    <Section tone="muted" edgeTop="circuit">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle
              kicker="/ FERRAMENTAS DA FTC"
              title="Feitas para o"
              highlight="dia do campeonato."
              highlightTone="accent"
              description="Funcionam no celular, sem login. O scouting e os planos ficam salvos no aparelho e podem ser exportados para o resto da equipe."
            />
            <ButtonLink
              href="/ftc/docs"
              tone="outline"
              iconLeft={<Hexagon size={16} />}
              iconRight={<ArrowUpRight size={15} />}
              className="font-mono font-medium"
            >
              /ftc/docs
            </ButtonLink>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(({ icon: Icon, tag, title, description, href, tone, status }, i) => (
            <Reveal key={title} delay={(i % 3) * 60} className="h-full">
              <FeatureCard
                title={title}
                description={description}
                category={tag}
                icon={<Icon />}
                href={href}
                index={i + 1}
                badge={status}
                tone={tone}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ============================================================== ETAPAS */

function StepsSection() {
  return (
    <Section>
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionTitle
            kicker="/ NO EVENTO"
            title="Do treino"
            highlight="aos playoffs."
            highlightTone="secondary"
            description="Três momentos em que decisão rápida vale ponto: o treino, a fila da partida e a seleção de alianças."
          />
        </Reveal>

        <div className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-12">
          <div
            aria-hidden="true"
            className="absolute left-0 right-[30%] top-6 hidden border-t-2 border-dashed border-base-300 md:block"
          />
          {steps.map(({ number, icon: Icon, title, description, detail, href, link }, i) => (
            <Reveal key={number} delay={i * 100}>
              <article className="group relative">
                <div className="flex items-center gap-4 md:block">
                  <div className="stage-noise relative z-10 flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 text-primary transition-all duration-300 group-hover:stage-shadow-sm group-hover:border-primary group-hover:bg-primary group-hover:text-primary-content">
                    <Icon size={21} strokeWidth={1.8} />
                  </div>
                  <Kicker className="text-base-content/40 md:mt-4">ETAPA {number}</Kicker>
                </div>
                <h3 className="mt-5 text-xl font-black tracking-tight">{title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-base-content/60">{description}</p>
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-primary">
                    <span className="size-1.5 rounded-full bg-primary" />
                    {detail}
                  </span>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-1 text-xs font-bold text-base-content/70 transition-colors hover:text-primary"
                  >
                    {link}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* =========================================================== CTA FINAL */

function FinalCta() {
  return (
    <Section edgeTop="ticket">
      <Reveal effect="pop">
        <Card
          tone="secondary"
          featured
          className="stage-grid-on-color relative mx-auto max-w-6xl overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] px-8 py-14 sm:px-14"
        >
          <Gear size={190} tone="accent" motion="spin" className="absolute -right-12 -top-12 hidden sm:inline-block" />
          <Starburst size={70} tone="primary" rotate={12} className="absolute bottom-8 right-16 hidden md:inline-grid" />

          <div className="relative max-w-2xl">
            <div className="stage-kicker inline-flex items-center gap-2 text-secondary-content/70">
              <Hexagon size={14} />
              FTC · BIOBUZZ
            </div>
            <h2 className="stage-display mt-4 text-3xl sm:text-5xl">Seu evento, com mais dados e menos improviso.</h2>
            <p className="mt-5 max-w-xl text-secondary-content/80">
              Pontue os treinos, combine a estratégia na fila e chegue na seleção de alianças com as duplas
              já comparadas.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/ftc/score" tone="accent" size="lg" iconLeft={<Trophy size={20} />}>
                Abrir o pontuador
              </ButtonLink>
              <ButtonLink
                href="/ftc/scouting"
                tone="ghost"
                size="lg"
                shape="rounded"
                iconRight={<ArrowRight size={18} />}
                className="text-secondary-content hover:bg-secondary-content/10"
              >
                Scouting
              </ButtonLink>
              <ButtonLink
                href="/ftc/estrategia"
                tone="ghost"
                size="lg"
                shape="rounded"
                iconRight={<ArrowRight size={18} />}
                className="text-secondary-content hover:bg-secondary-content/10"
              >
                Estratégia TeleOp
              </ButtonLink>
            </div>
          </div>
        </Card>
      </Reveal>
    </Section>
  );
}