import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bot,
  CalendarHeart,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Code,
  Cog,
  Cuboid,
  FlaskConical,
  FolderGit2,
  Gauge,
  Globe2,
  HeartHandshake,
  History,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  Lightbulb,
  Megaphone,
  MessageSquare,
  Newspaper,
  NotebookPen,
  Play,
  QrCode,
  Radio,
  Rocket,
  Smartphone,
  Sparkles,
  Swords,
  ToyBrick,
  Trophy,
  Tv,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  Accordion,
  ButtonLink,
  Card,
  FeatureCard,
  Flower,
  Gear,
  Kicker,
  Marquee,
  Reveal,
  Section,
  SectionTitle,
  Sparkle,
  StageImage,
  Starburst,
  StickerTag,
  Squiggle,
  cn,
  toneSoft,
  toneText,
  type Tone,
  NewsCard,
  StatusBadge,
  CoverArt,
  coverFromSeed,
} from "@/components/stage";
import LivePreview from "./LivePreview";
import PersonaTabs from "./PersonaTabs";

/* ================================================================ FAIXA */

const marqueeItems = [
  "Pontuador",
  "QuickBrick Studio",
  "LabTest",
  "Recall",
  "Timers",
  "Stagebook",
  "Anatix",
  "ShowLive",
  "Scouting FTC",
  "Estratégia TeleOp",
];

/** Faixa em marquee com as ferramentas, logo abaixo do hero. */
export function ToolsMarquee() {
  return (
    <div className="relative z-10 -my-2 overflow-hidden py-2">
      <Marquee items={marqueeItems} tone="ink" tilt={-1} speed={40} />
    </div>
  );
}

/* ================================================================ SOBRE */

const platformPoints = [
  { icon: Trophy, text: "Pontuadores e timers com as regras oficiais" },
  { icon: FlaskConical, text: "Testes do robô registrados e comparados" },
  { icon: NotebookPen, text: "Ideias, projetos e tarefas da equipe" },
];

export function PlatformIntro() {
  return (
    <Section id="conheca" tone="glow" className="border-b border-base-300">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_1fr] [&>*]:min-w-0">
        <Reveal>
          <SectionTitle
            kicker="/ O QUE É O ROBOSTAGE"
            title="Muito mais que uma"
            highlight="plataforma."
            description="O RoboStage reúne em um só lugar o que acontece no universo da robótica: equipes, pessoas, projetos e competições. Da preparação ao dia do torneio, cada etapa fica mais simples de acompanhar e de participar."
          />

          <ul className="mt-8 space-y-3">
            {platformPoints.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 text-sm sm:text-base"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-tl-lg rounded-br-lg bg-base-200 text-primary">
                  <Icon size={16} strokeWidth={2} />
                </span>
                <span className="text-base-content/75">{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink href="/sign-up" size="lg" iconLeft={<UserPlus size={20} />}>
              Criar conta grátis
            </ButtonLink>
            <ButtonLink
              href="/about"
              tone="ghost"
              size="lg"
              shape="rounded"
              iconRight={<ArrowRight size={18} />}
            >
              Sobre o projeto
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal delay={100} effect="pop" className="relative">
          <Sparkle size={40} tone="accent" motion="float" className="absolute -left-4 -top-6 z-10" />
          <LivePreview />
        </Reveal>
      </div>
    </Section>
  );
}

/* =========================================================== COMPETIÇÕES */

type Competition = {
  href: string;
  path: string;
  title: string;
  text: string;
  cta: string;
  image: string;
  tone: "primary" | "secondary";
  span: string;
  shadow: string;
};

const competitions: Competition[] = [
  {
    href: "/fll",
    title: "FIRST LEGO League",
    text: "Pontuador por temporada, QuickBrick Studio, Recall, rubricas, timers e guias para equipes iniciantes.",
    cta: "Explorar a FLL",
    image: "/images/index/banner_hero_fll2.webp",
    tone: "primary",
    status: "Disponível",
    span: "lg:col-span-7",
  },
  {
    href: "/obr",
    title: "OBR",
    text: "Pontuador da arena, documentação e o Anatix para ver o robô em tempo real.",
    cta: "Explorar a OBR",
    image: "/images/index/banner_hero_obr.webp",
    tone: "secondary",
    status: "Disponível",
    span: "lg:col-span-5",
  },
  {
    href: "/ftc",
    title: "FIRST Tech Challenge",
    text: "Cronômetro da BIOBUZZ, estratégia do TeleOp, scouting com dados da FTCScout, arena e documentação.",
    cta: "Explorar a FTC",
    image: "/images/index/banner_hero_ftc.webp",
    tone: "dark",
    status: "Novo",
    span: "lg:col-span-8",
  },
];

/** Cores de cada card: fundo, degradê sobre a foto, sombra dura e foco. */
const competitionStyle: Record<
  CompetitionTone,
  { base: string; overlay: string; shadow: string; arrow: string; kicker: string; tag: Tone }
> = {
  primary: {
    base: "bg-primary text-primary-content focus-visible:ring-primary",
    overlay: "from-primary via-primary/80 to-primary/20",
    shadow: "stage-shadow-lg hover:shadow-[10px_10px_0_0_var(--stage-shadow)]",
    arrow: "group-hover:text-primary",
    kicker: "text-white/70",
    tag: "paper",
  },
  secondary: {
    base: "bg-secondary text-secondary-content focus-visible:ring-secondary",
    overlay: "from-secondary via-secondary/85 to-secondary/20",
    shadow: "shadow-[8px_8px_0_0_var(--color-accent)] hover:shadow-[10px_10px_0_0_var(--color-accent)]",
    arrow: "group-hover:text-secondary",
    kicker: "text-white/70",
    tag: "paper",
  },
  // O amarelo da marca não segura texto branco; a FTC usa véu escuro com detalhes em accent.
  dark: {
    base: "bg-neutral text-neutral-content focus-visible:ring-accent",
    overlay: "from-black via-black/75 to-black/10",
    shadow: "shadow-[8px_8px_0_0_var(--color-primary)] hover:shadow-[10px_10px_0_0_var(--color-primary)]",
    arrow: "group-hover:text-neutral",
    kicker: "text-accent",
    tag: "accent",
  },
};

function CompetitionCard({ c }: { c: Competition }) {
  const s = competitionStyle[c.tone];
  return (
    <Link
      href={c.href}
      className={cn(
        "group relative isolate block h-full min-h-[340px] overflow-hidden rounded-tl-[32px] rounded-br-[32px] transition-all duration-500 ease-out hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 motion-reduce:hover:translate-y-0",
        s.base,
        s.shadow,
      )}
    >
      {/* Wrapper com -z-20: dentro de seção texturizada o stage.css põe z-index 0 na <img>. */}
      <div aria-hidden className="absolute inset-0 -z-20 overflow-hidden">
        <Image
          src={c.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
      </div>
      <div aria-hidden className={cn("absolute inset-0 -z-10 bg-gradient-to-t", s.overlay)} />

      <div className="flex h-full min-h-[340px] flex-col justify-between p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <StickerTag tone={s.tag} size="sm" shadow={false}>
            {c.status}
          </StickerTag>
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition-all duration-300 group-hover:-rotate-45 group-hover:bg-white",
              s.arrow,
            )}
          >
            <ChevronRight size={22} />
          </span>
        </div>
        <div className="text-white">
          <p className={cn("stage-kicker", s.kicker)}>{c.href}</p>
          <h3 className="stage-display mt-2 text-3xl sm:text-4xl xl:text-5xl">{c.title}</h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">{c.text}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
            {c.cta}
            <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-2" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CompetitionsSection() {
  return (
    <Section tone="muted">
      <div className="relative mx-auto max-w-6xl">
        <Flower
          size={64}
          tone="primary"
          motion="spin"
          className="absolute -top-6 right-0 hidden md:inline-block"
        />
        <Reveal>
          <SectionTitle
            kicker="/ MODALIDADES"
            title="Um lar para cada"
            highlight="competição."
            highlightTone="accent"
            description="Ferramentas pensadas para as regras, os tempos e a rotina de cada modalidade."
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
          {competitions.map((c, i) => (
            <Reveal key={c.href} delay={i * 80} className={cn("h-full", c.span)}>
              <CompetitionCard c={c} />
            </Reveal>
          ))}

          {/* Próximas modalidades */}
          <Reveal delay={competitions.length * 80} className="h-full lg:col-span-4">
            <Link href="/news" className="group block h-full focus-visible:outline-none">
              <Card
                corner
                interactive
                className="flex h-full min-h-[200px] flex-col justify-between border border-dashed border-base-300 bg-base-100/60 group-hover:border-primary/50 group-focus-visible:border-primary"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-light text-base-content/40 transition-transform duration-300 group-hover:rotate-90 group-hover:text-primary">
                    +
                  </span>
                  <Kicker className="text-base-content/45">EM EXPANSÃO</Kicker>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-base-content/75">Mais modalidades</h3>
                  <p className="mt-1 text-sm leading-relaxed text-base-content/60">
                    Acompanhe as novidades para saber o que vem por aí.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-base-content/60 transition-colors group-hover:text-primary">
                    Ver novidades
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Card>
            </Link>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ========================================================== ECOSSISTEMA */

type Tool = {
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
  href: string;
  tone: "primary" | "secondary" | "accent";
  status?: string;
};

const tools: Tool[] = [
  {
    icon: Trophy,
    tag: "Pontuação",
    title: "Pontuador",
    description: "Simule missões ou rodadas completas com cronômetro de 2:30, temporada por temporada.",
    href: "/fll/score",
    tone: "primary",
  },
  {
    icon: Cuboid,
    tag: "Estratégia",
    title: "QuickBrick Studio",
    description: "Desenhe trajetórias no tapete, monte matrizes SWOT e de risco e simule saídas.",
    href: "/fll/quickbrick",
    tone: "secondary",
  },
  {
    icon: FlaskConical,
    tag: "Testes",
    title: "LabTest",
    description: "Registre execuções, calibre o robô e compare versões com dados, não com achismo.",
    href: "/labtest",
    tone: "accent",
  },
  {
    icon: MessageSquare,
    tag: "Avaliação",
    title: "Recall",
    description: "Treine a sala de avaliação com perguntas cronometradas de Core Values, Projeto e Robô.",
    href: "/fll/recall",
    tone: "secondary",
  },
  {
    icon: ClipboardCheck,
    tag: "Avaliação",
    title: "Rubricas",
    description: "Avalie o projeto, o robô e os valores centrais com rúbricas personalizadas.",
    href: "/fll/rubric",
    tone: "accent",
  },
  {
    icon: Clock,
    tag: "Tempo",
    title: "Timers",
    description: "Round do Robô, Sala de Avaliação e timer ajustável com alertas sonoros e visuais.",
    href: "/fll/timers",
    tone: "primary",
  },
  {
    icon: NotebookPen,
    tag: "Processo",
    title: "Stagebook",
    description: "Registre ideias, organize projetos e acompanhe tarefas para virar conhecimento da equipe.",
    href: "/stagebook",
    tone: "secondary",
  },
  {
    icon: Code,
    tag: "Telemetria",
    title: "Anatix",
    description: "Biblioteca aberta para ver sensores, estados e tempos do robô da FLL e OBR enquanto ele roda.",
    href: "/anatix",
    tone: "accent",
  },
  {
    icon: Radio,
    tag: "Eventos",
    title: "ShowLive",
    description: "Ranking no telão atualizado em tempo real e regras configuráveis para torneios e microeventos.",
    href: "/showlive",
    tone: "primary",
    status: "Disponível",
  },
  {
    icon: ClipboardList,
    tag: "FTC · Scouting",
    title: "Scouting",
    description: "Dados oficiais da FTCScout com as anotações dos scouts, ranking e simulação da seleção de alianças.",
    href: "/ftc/scouting",
    tone: "secondary",
    status: "Novo",
  },
  {
    icon: Swords,
    tag: "FTC · Estratégia",
    title: "Estratégia TeleOp",
    description: "Monte o plano dos 2:00 de TeleOp em três fases, com presets e briefing para a aliança.",
    href: "/ftc/estrategia",
    tone: "accent",
    status: "Novo",
  },
];

export function ToolsSection() {
  return (
    <Section>
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle
              kicker="/ ECOSSISTEMA"
              title="Tudo o que a equipe usa,"
              highlight="num lugar só."
              description="Cada ferramenta resolve uma parte da temporada. Comece pela que faz mais falta hoje."
            />
            <ButtonLink
              href="/dashboard"
              tone="outline"
              shape="corner"
              iconLeft={<Gauge size={16} />}
              iconRight={<ArrowUpRight size={15} />}
              className="font-mono font-medium"
            >
              /dashboard
            </ButtonLink>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map(({ icon: Icon, tag, title, description, href, tone, status }, i) => (
            <Reveal key={title} delay={(i % 4) * 60} className="h-full">
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

/* =============================================================== ETAPAS */

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Crie sua conta",
    description:
      "O cadastro é gratuito e libera o painel com as ferramentas da equipe.",
    detail: "Leva um minuto",
    href: "/sign-up",
    link: "Cadastrar",
  },
  {
    number: "02",
    icon: Users,
    title: "Monte a equipe",
    description:
      "Convide os integrantes, escolha a modalidade e organize documentos e tarefas.",
    detail: "Todos no mesmo lugar",
    href: "/dashboard/team",
    link: "Ver equipes",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Treine e evolua",
    description:
      "Pontue rodadas, registre testes no LabTest e compare a evolução ao longo da temporada.",
    detail: "Decisões com dados",
    href: "/labtest",
    link: "Conhecer o LabTest",
  },
];

export function StepsSection() {
  return (
    <Section tone="muted" edgeTop="torn" edgeBottom="torn">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionTitle
            kicker="/ COMO COMEÇAR"
            title="Três passos até"
            highlight="o primeiro treino."
            highlightTone="secondary"
          />
        </Reveal>

        <div className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-12">
          <div
            aria-hidden="true"
            className="absolute left-0 right-[30%] top-6 hidden border-t-2 border-dashed border-base-300 md:block"
          />
          <Squiggle
            size={80}
            tone="secondary"
            className="absolute -top-14 right-0 hidden md:inline-block"
          />
          {steps.map(({ number, icon: Icon, title, description, detail, href, link }, i) => (
            <Reveal key={number} delay={i * 100}>
              <article className="group relative">
                <div className="flex items-center gap-4 md:block">
                  <div className="stage-noise relative z-10 flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 text-secondary transition-all duration-300 group-hover:stage-shadow-sm group-hover:border-secondary group-hover:bg-secondary group-hover:text-secondary-content">
                    <Icon size={21} strokeWidth={1.8} />
                  </div>
                  <Kicker className="text-base-content/40 md:mt-4">ETAPA {number}</Kicker>
                </div>
                <h3 className="mt-5 text-xl font-black tracking-tight">{title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-base-content/60">{description}</p>
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-secondary">
                    <span className="size-1.5 rounded-full bg-secondary" />
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

/* ============================================================ PARA QUEM */

export function PersonasSection() {
  return (
    <Section>
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionTitle
            kicker="/ PARA QUEM"
            title="Cada equipe vive a robótica"
            highlight="de um jeito."
            highlightTone="accent"
            description="Escolha o seu perfil e veja por onde começar."
          />
        </Reveal>
        <Reveal delay={100}>
          <PersonaTabs />
        </Reveal>
      </div>
    </Section>
  );
}

/* ============================================================ TEMPORADAS */

const seasons = [
  { key: "bioglow", name: "BIOGLOW", period: "2026/2027", logo: "/images/logos/fll/seasons/bioglow_logo.png", current: true },
  { key: "unearthed", name: "UNEARTHED", period: "2025/2026", logo: "/images/logos/fll/seasons/Unearthed.webp" },
  { key: "submerged", name: "SUBMERGED", period: "2024/2025", logo: "/images/logos/fll/seasons/Submerged.webp" },
  { key: "masterpiece", name: "MASTERPIECE", period: "2023/2024", logo: "/images/logos/fll/seasons/Masterpiece.png" },
];

export function SeasonsSection() {
  return (
    <Section tone="muted">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle
              kicker="/ TEMPORADAS DA FLL"
              title="Pontue qualquer"
              highlight="temporada."
              description="Missões da temporada atual e das anteriores, prontas para treinar ou rever estratégias."
            />
            <ButtonLink href="/fll/future-edition" tone="outline" iconLeft={<Sparkles size={17} />}>
              Future Edition
            </ButtonLink>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {seasons.map(({ key, name, period, logo, current }, i) => (
            <Reveal key={key} delay={i * 60} className="h-full">
              <Link
                href={`/fll/score/${key}`}
                className={cn(
                  "stage-paper group relative flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border bg-base-100 p-4 transition-all duration-300 hover:-translate-y-1 sm:p-5",
                  current
                    ? "border-primary shadow-[6px_6px_0_0_var(--color-primary)]"
                    : "border-base-300 hover:border-secondary/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-base-content/45">
                    {period}
                  </span>
                  {current && (
                    <StickerTag tone="primary" size="sm" rotate={3}>
                      Atual
                    </StickerTag>
                  )}
                </div>
                <div className="my-5 grid h-28 place-items-center rounded-tl-xl rounded-br-xl bg-[#f7f4ec] p-2">
                  <Image
                    src={logo}
                    alt={`Logo da temporada ${name}`}
                    width={192}
                    height={96}
                    className="max-h-24 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                  <h3 className="text-sm font-black tracking-tight sm:text-base">{name}</h3>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-base-content/55 transition-colors group-hover:text-primary">
                    Pontuar
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ============================================================= DESTAQUES */

const spotlight: {
  kicker: string;
  title: string;
  text: string;
  image: string;
  href: string;
  cta: string;
  tone: "primary" | "secondary";
}[] = [
  {
    kicker: "LABTEST",
    title: "Teste antes da competição.",
    text: "Runs, CalibraBot e testes personalizados: execute em condições controladas, meça, compare e decida.",
    image: "/images/index/banner_labtest.png",
    href: "/labtest",
    cta: "Conhecer o LabTest",
    tone: "secondary",
  },
  {
    kicker: "STAGEBOOK",
    title: "A ideia começa aqui.",
    text: "Registre ideias, organize projetos e acompanhe tarefas, transformando o processo da equipe em conhecimento.",
    image: "/images/index/banner_stagebook.png",
    href: "/stagebook",
    cta: "Conhecer o Stagebook",
    tone: "primary",
  },
];

export function SpotlightSection() {
  return (
    <Section>
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionTitle
            kicker="/ EM DESTAQUE"
            title="Do teste no tapete"
            highlight="ao caderno da equipe."
            highlightTone="secondary"
          />
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {spotlight.map(({ kicker, title, text, image, href, cta, tone }, i) => (
            <Reveal key={href} delay={i * 100} className="h-full">
              <Link
                href={href}
                className={cn(
                  "stage-paper group flex h-full flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 transition-all duration-300 hover:-translate-y-1",
                  tone === "primary"
                    ? "hover:shadow-[8px_8px_0_0_var(--color-primary)]"
                    : "hover:shadow-[8px_8px_0_0_var(--color-secondary)]",
                )}
              >
                <StageImage
                  src={image}
                  alt=""
                  ratio="21/9"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="border-b border-base-300"
                  imgClassName="transition-transform duration-700 group-hover:scale-105"
                />
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <Kicker className={toneText[tone]}>{kicker}</Kicker>
                  <h3 className="mt-2 text-2xl font-black tracking-tight">{title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-base-content/60 sm:text-base">{text}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">
                    {cta}
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ================================================================ CANOPY */

export function CanopySection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#091A07] text-white">
      <div className="mx-auto grid max-w-6xl items-stretch md:grid-cols-2">
        <div className="relative z-10 flex flex-col justify-center gap-4 px-6 py-20">
          <p className="stage-kicker text-white/50">/ ESPECIAL</p>
          <h2 className="stage-display text-3xl sm:text-5xl">FIRST® CANOPY™</h2>
          <p className="max-w-md text-sm leading-7 text-white/75 sm:text-base">
            Nada na Terra prospera sozinha. Cada gene, espécie e ecossistema faz
            parte de uma teia viva de diversidade biológica. Com STEM como
            ferramenta e a natureza como inspiração.
          </p>
          <div>
            <ButtonLink
              href="/robostage-canopy"
              flat
              iconRight={<ArrowRight size={18} />}
              className="mt-2 border-none bg-[#9BE15D] text-[#091A07] shadow-[4px_4px_0_0_#ffffff] hover:-translate-y-0.5 hover:bg-[#b4ec80]"
            >
              Conhecer
            </ButtonLink>
          </div>
          <a
            href="https://www.magnific.com/br/vetores-gratis/fundo-organico-de-selva-plana_13839964.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/25 hover:text-white/50"
          >
            Imagem de freepik
          </a>
        </div>
      </div>
      <div className="absolute inset-y-0 right-0 -z-10 w-full md:w-1/2">
        <Image src="/images/index/canopy.webp" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover opacity-40 md:opacity-100" />
        <div className="absolute inset-0 hidden bg-gradient-to-l from-transparent to-[#091A07] md:block" />
      </div>
    </section>
  );
}
/* ============================================================= NOVIDADES */

export type HomeNews = {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  category?: string;
  cover?: string;
};

function formatDate(date?: string) {
  if (!date) return "";
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ---------- capa gerada para notícia sem imagem ---------- */

type NewsLook = { icon: LucideIcon; tone: Tone };

/**
 * Ícone e cor pela categoria (comparação sem acento e sem caixa).
 * A primeira regra que bater vence; sem categoria conhecida, cor e ícone
 * saem do slug, então cada notícia mantém sempre a mesma capa.
 */
const newsLooks: { match: RegExp; look: NewsLook }[] = [
  { match: /\bfll\b|lego/, look: { icon: ToyBrick, tone: "primary" } },
  { match: /\bobr\b|olimpiada/, look: { icon: Bot, tone: "secondary" } },
  { match: /\bftc\b|tech challenge/, look: { icon: Cog, tone: "accent" } },
  { match: /atualiza|changelog|lancamento|versao|novidade|ferramenta/, look: { icon: Rocket, tone: "info" } },
  { match: /evento|torneio|showlive|competic|campeonato/, look: { icon: Trophy, tone: "success" } },
  { match: /comunidade|equipe|parceri|apoio/, look: { icon: HeartHandshake, tone: "secondary" } },
  { match: /dica|guia|tutorial|aprend|estrategia/, look: { icon: Lightbulb, tone: "accent" } },
  { match: /aviso|comunicado|importante/, look: { icon: Megaphone, tone: "primary" } },
  { match: /agenda|calendario|data/, look: { icon: CalendarHeart, tone: "info" } },
];

const fallbackIcons: LucideIcon[] = [Newspaper, Sparkles, Rocket, Lightbulb, Megaphone];

function newsLook(n: HomeNews): NewsLook {
  const key = (n.category ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const hit = key && newsLooks.find((r) => r.match.test(key));
  if (hit) return hit.look;
  const auto = coverFromSeed(n.slug);
  return { icon: fallbackIcons[n.slug.length % fallbackIcons.length], tone: auto.tone };
}

/** Desenho de fundo (padrão estável pelo slug) + ícone do assunto, no tamanho de cada layout. */
function newsFallback(n: HomeNews) {
  const { icon: Icon, tone } = newsLook(n);
  const { pattern } = coverFromSeed(n.slug);
  // No amarelo e no "paper" o ícone fica escuro; nos outros, branco.
  const light = tone === "accent" || tone === "paper";
  const ink = light ? "text-black/75" : "text-white";

  function NewsFallback(layout: "vertical" | "horizontal" | "featured") {
    return (
      <>
        <CoverArt pattern={pattern} tone={tone} seed={n.slug} className="absolute inset-0 size-full" />
        {layout === "featured" ? (
          <>
            <Icon
              aria-hidden
              strokeWidth={1.4}
              className={cn("absolute -right-6 -top-6 size-56 rotate-12 opacity-25 sm:size-72", ink)}
            />
            {/* véu extra: o texto do destaque é branco, inclusive sobre o amarelo */}
            <span className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </>
        ) : (
          <span
            className={cn(
              "absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-tl-xl rounded-br-xl",
              light ? "bg-white/55" : "bg-black/25",
              layout === "horizontal" ? "size-12" : "size-16",
            )}
          >
            <Icon aria-hidden strokeWidth={1.8} className={cn(ink, layout === "horizontal" ? "size-6" : "size-8")} />
          </span>
        )}
      </>
    );
  }
  return NewsFallback;
}

/* ---------- seção ---------- */

type NewsSectionProps = {
  news: HomeNews[];
  kicker?: string;
  title?: string;
  highlight?: string;
};

export function NewsSection(props: NewsSectionProps) {
  return <NewsSectionContent {...props} />;
}

function NewsSectionContent({
  news,
  kicker = "/ NOVIDADES",
  title = "O que mudou",
  highlight = "por aqui.",
}: NewsSectionProps) {
  if (news.length === 0) return null;
  const [first, ...rest] = news;
  const sideNews = rest.slice(0, 3);
  const bottomNews = rest.slice(3, 6);

  const card = (n: HomeNews) => ({
    title: n.title,
    href: `/news/${encodeURIComponent(n.slug)}`,
    image: n.cover ?? "",
    tag: n.category,
    date: formatDate(n.date),
    fallback: newsFallback(n),
  });

  return (
    <Section tone="muted" className="[&>div]:border-b-0">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle kicker={kicker} title={title} highlight={highlight} />
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/news" tone="outline" size="sm" iconLeft={<Newspaper size={16} />}>
                Todas as notícias
              </ButtonLink>
              <ButtonLink
                href="/changelog"
                tone="outline"
                size="sm"
                iconLeft={<History size={16} />}
                className="hover:border-secondary hover:text-secondary"
              >
                Changelog
              </ButtonLink>
            </div>
          </div>
        </Reveal>

        <div className={cn("mt-12 grid gap-5", sideNews.length > 0 && "lg:grid-cols-[1.55fr_1fr]")}>
          <Reveal className="h-full">
            <NewsCard
              {...card(first)}
              excerpt={first.description}
              layout="featured"
              className="h-full min-h-[27rem]"
            />
          </Reveal>

          {sideNews.length > 0 && (
            <div className="flex flex-col gap-5">
              {sideNews.map((n, i) => (
                <Reveal key={n.slug} delay={(i + 1) * 80} className="flex-1">
                  <NewsCard {...card(n)} layout="horizontal" className="h-full min-h-[8.25rem]" />
                </Reveal>
              ))}
            </div>
          )}
        </div>

        {bottomNews.length > 0 && (
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {bottomNews.map((n, i) => (
              <Reveal key={n.slug} delay={(i + 1) * 80}>
                <NewsCard {...card(n)} excerpt={n.description} layout="vertical" />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

/* ============================================================ COMUNIDADE */

const communityLinks: {
  icon: LucideIcon;
  title: string;
  text: string;
  href: string;
  external?: boolean;
  tone: Tone;
}[] = [
  {
    icon: FolderGit2,
    title: "Código aberto",
    text: "Acompanhe o desenvolvimento e sugira melhorias no GitHub.",
    href: "https://github.com/ohthias/roboStage",
    external: true,
    tone: "primary",
  },
  {
    icon: HeartHandshake,
    title: "Apoie o projeto",
    text: "Veja como contribuir com código, divulgação ou apoio financeiro.",
    href: "/sponsors",
    tone: "accent",
  },
  {
    icon: Globe2,
    title: "Roboticar",
    text: "Iniciativas de equipes do Brasil e do mundo e os números da robótica no país.",
    href: "/roboticar",
    tone: "primary",
  },
  {
    icon: LifeBuoy,
    title: "Central de ajuda",
    text: "Tire dúvidas sobre as ferramentas e o uso da plataforma.",
    href: "/help",
    tone: "secondary",
  },
];

const communityHover: Partial<Record<Tone, string>> = {
  primary: "hover:border-primary/40",
  secondary: "hover:border-secondary/40",
  accent: "hover:border-accent/60",
};

export function CommunitySection() {
  return (
    <Section>
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.1fr] [&>*]:min-w-0">
        <Reveal>
          <SectionTitle
            kicker="/ COMUNIDADE"
            title="Um projeto independente,"
            highlight="feito com a comunidade."
            highlightTone="secondary"
          />
          <div className="mt-8 border-l-2 border-secondary pl-5">
            <p className="text-base leading-7 text-base-content/70">
              O RoboStage é desenvolvido de forma independente e evolui junto
              com equipes, organizadores e voluntários que testam a plataforma,
              compartilham experiências e ajudam a definir os próximos passos.
            </p>
            <p className="mt-3 text-base leading-7 text-base-content/60">
              Cada atualização parte de situações reais vividas nas competições.
            </p>
          </div>
        </Reveal>

        <div className="grid content-center gap-4">
          {communityLinks.map(({ icon: Icon, title, text, href, external, tone }, i) => {
            const inner = (
              <>
                <div
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300",
                    toneSoft[tone],
                  )}
                >
                  <Icon size={21} strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-base-content/60">{text}</p>
                </div>
                {external ? (
                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-base-content/35 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                ) : (
                  <ArrowRight size={18} className="shrink-0 text-base-content/35 transition-transform group-hover:translate-x-1" />
                )}
              </>
            );
            const cls = cn(
              "stage-paper group flex items-center gap-4 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5 transition-all duration-300 hover:-translate-y-0.5",
              communityHover[tone],
            );
            return (
              <Reveal key={title} delay={i * 80}>
                {external ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
                    {inner}
                  </a>
                ) : (
                  <Link href={href} className={cls}>
                    {inner}
                  </Link>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

/* =================================================================== FAQ */

const faq = [
  {
    title: "O RoboStage é gratuito?",
    content:
      "Sim. Criar a conta é grátis, e várias ferramentas, como o pontuador, os timers e o Recall, podem ser usadas direto pelo site.",
  },
  {
    title: "Quais competições são atendidas?",
    content:
      "Hoje a plataforma tem ferramentas para a FIRST LEGO League, a FIRST Tech Challenge (temporada BIOBUZZ) e a OBR. Outras modalidades estão nos planos; acompanhe pelas notícias.",
  },
  {
    title: "Preciso de conta para usar as ferramentas?",
    content:
      "Não para todas. As ferramentas públicas abrem sem login. A conta é necessária para recursos da equipe, como o painel, o LabTest e o Stagebook.",
  },
  {
    title: "Funciona no celular?",
    content:
      "Sim, mas algumas ferramentas, como as do QuickBrick Studio, foram pensadas para telas maiores. Para elas, prefira o notebook ou o computador.",
  },
  {
    title: "Como sugerir uma ferramenta ou relatar um problema?",
    content:
      "Abra uma issue no repositório do GitHub ou consulte a central de ajuda. As sugestões da comunidade orientam as próximas atualizações.",
  },
];

export function FaqSection() {
  return (
    <Section tone="muted" className="[&>div]:border-b-0">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <SectionTitle
              kicker="/ DÚVIDAS"
              title="Antes de"
              highlight="começar."
            />
            <Link
              href="/help"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-base-content/70 transition-colors hover:text-primary"
            >
              <LifeBuoy size={18} className="text-success" />
              Mais respostas na central de ajuda
              <ArrowRight size={15} />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <Accordion items={faq} defaultOpen={0} />
        </Reveal>
      </div>
    </Section>
  );
}

/* ============================================================= CTA FINAL */

export function FinalCta() {
  return (
    <Section>
      <Reveal effect="pop">
        <Card
          tone="secondary"
          featured
          className="stage-grid-on-color relative mx-auto max-w-6xl overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] px-8 py-14 sm:px-14"
        >
          <Gear size={190} tone="accent" motion="spin" className="absolute -right-12 -top-12 hidden sm:inline-block" />
          <Starburst size={70} tone="primary" rotate={12} className="absolute bottom-8 right-16 hidden md:inline-grid" />
          <Sparkle size={28} tone="paper" shadow={false} className="absolute bottom-24 right-56 hidden md:inline-block" />

          <div className="relative max-w-2xl">
            <div className="stage-kicker inline-flex items-center gap-2 text-secondary-content/70">
              <Trophy size={14} />
              O PRÓXIMO EVENTO COMEÇA AQUI
            </div>
            <h2 className="stage-display mt-4 text-3xl sm:text-5xl">
              Existe um lugar esperando pela sua equipe.
            </h2>
            <p className="mt-5 max-w-xl text-secondary-content/80">
              Se você compete, organiza, ensina, aprende ou simplesmente ama
              robótica, comece agora e leve a equipe mais longe nesta temporada.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/sign-up" tone="accent" size="lg" iconLeft={<UserPlus size={20} />}>
                Criar conta grátis
              </ButtonLink>
              <ButtonLink
                href="/fll"
                tone="ghost"
                size="lg"
                shape="rounded"
                iconRight={<ArrowRight size={18} />}
                className="text-secondary-content hover:bg-secondary-content/10"
              >
                Começar na FLL
              </ButtonLink>
              <ButtonLink
                href="/obr"
                tone="ghost"
                size="lg"
                shape="rounded"
                iconRight={<ArrowRight size={18} />}
                className="text-secondary-content hover:bg-secondary-content/10"
              >
                Começar na OBR
              </ButtonLink>
              <ButtonLink
                href="/ftc"
                tone="ghost"
                size="lg"
                shape="rounded"
                iconRight={<ArrowRight size={18} />}
                className="text-secondary-content hover:bg-secondary-content/10"
              >
                Começar na FTC
              </ButtonLink>
            </div>
          </div>
        </Card>
      </Reveal>
    </Section>
  );
}

export function ShowLiveSection() {
  const showliveUrl = process.env.NEXT_PUBLIC_SHOWLIVE_URL ?? "https://showlive.robostage.com.br";

  const roles: { icon: LucideIcon; who: string; text: string; tone: Tone }[] = [
    { icon: LayoutDashboard, who: "Organização", text: "Equipes, rodadas, desafio e aprovação de notas no hub do evento.", tone: "primary" },
    { icon: Smartphone, who: "Mesa do robô", text: "Voluntários entram com o código e pontuam a súmula pelo celular.", tone: "secondary" },
    { icon: ClipboardCheck, who: "Avaliação", text: "Cada sala só vê as próprias sessões; as fichas ficam fora do telão.", tone: "accent" },
    { icon: Tv, who: "Público", text: "O ranking atualiza sozinho no telão e no celular, pelo código ou QR.", tone: "primary" },
  ];

  const ranking = [
    { pos: 1, team: "Robôs do Cerrado", score: 412 },
    { pos: 2, team: "Mecatrônicos", score: 398 },
    { pos: 3, team: "Byte Bees", score: 365 },
    { pos: 4, team: "Equipe Ômega", score: 341 },
    { pos: 5, team: "LEGOlândia", score: 297 },
  ];

  const formats = ["FLL", "FLL FE", "OBR", "FTC", "Livre"];

  return (
    <Section tone="muted" edgeTop="checker">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.1fr] [&>*]:min-w-0">
        {/* ----------------------------------------------------------- texto */}
        <Reveal>
          <SectionTitle
            kicker="/ SHOWLIVE"
            title="Seu torneio,"
            highlight="ao vivo no telão."
            description="Organize microeventos e seletivas com súmula no celular, notas aprovadas pela organização e ranking em tempo real para o público."
          />

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {roles.map(({ icon: Icon, who, text, tone }) => (
              <li
                key={who}
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
                  <h3 className="text-sm font-bold">{who}</h3>
                  <p className="mt-1 text-xs leading-5 text-base-content/60">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink href="/showlive" size="lg" iconLeft={<Radio size={19} />}>
              Conhecer o ShowLive
            </ButtonLink>
            <ButtonLink
              href={`${showliveUrl}/entrar`}
              target="_blank"
              rel="noopener noreferrer"
              tone="ghost"
              size="lg"
              shape="rounded"
              iconLeft={<KeyRound size={18} />}
              iconRight={<ArrowUpRight size={16} />}
            >
              Entrar com código
            </ButtonLink>
          </div>
        </Reveal>

        {/* ---------------------------------------------------- telão (prévia) */}
        <Reveal delay={100} effect="pop" className="relative sm:pb-36">
          <div className="relative">
            <Sparkle size={40} tone="accent" motion="float" className="absolute -left-4 -top-6 z-20 hidden sm:inline-block" />

            <div
              aria-hidden="true"
              className="stage-night stage-noise overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] text-white shadow-[10px_10px_0_0_var(--color-primary)]"
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                  <Tv size={16} className="text-white/60" />
                  <span className="stage-kicker text-white/60">TELÃO · RODADA 2</span>
                </div>
                <StatusBadge status="live" />
              </div>

              <ol className="divide-y divide-white/10">
                {ranking.map(({ pos, team, score }) => (
                  <li
                    key={team}
                    className={cn("flex items-center gap-4 px-5 py-3 sm:px-6", pos === 1 && "bg-white/[0.06]")}
                  >
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-tl-lg rounded-br-lg font-mono text-sm font-bold",
                        pos === 1 ? "bg-accent text-accent-content" : "bg-white/10 text-white/70",
                      )}
                    >
                      {pos}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-bold">{team}</span>
                    {pos === 1 && <Trophy size={16} className="shrink-0 text-accent" />}
                    <span className="stage-display w-16 text-right text-2xl tabular-nums">{score}</span>
                  </li>
                ))}
              </ol>

              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 px-5 py-4 sm:px-6 sm:pl-56">
                {formats.map((f) => (
                  <span key={f} className="stage-label rounded-tl-md rounded-br-md border border-white/20 px-2 py-1 text-white/70">
                    {f}
                  </span>
                ))}
                <span className="flex w-full items-center justify-end gap-1.5 font-mono text-xs text-white/50">
                  <QrCode size={14} /> showlive · MESA22
                </span>
              </div>
            </div>

            {/* Celular da mesa, sobreposto ao telão */}
            <Card
              aria-hidden="true"
              corner
              className="absolute -left-6 top-full hidden w-52 -translate-y-10 border border-base-300 p-4 stage-shadow sm:block"
            >
              <div className="flex items-center justify-between">
                <span className="stage-kicker text-base-content/50">MESA 2</span>
                <Smartphone size={14} className="text-base-content/40" />
              </div>
              <p className="mt-2 text-sm font-bold">Byte Bees · R2</p>
              <div className="mt-3 space-y-1.5 text-xs text-base-content/65">
                <p className="flex justify-between"><span>M01 · Coleta</span><span className="font-mono font-bold text-base-content">+30</span></p>
                <p className="flex justify-between"><span>M04 · Entrega</span><span className="font-mono font-bold text-base-content">+45</span></p>
              </div>
              <p className="mt-3 flex items-center justify-between border-t border-base-300 pt-2 text-xs font-bold">
                Enviar nota <ArrowRight size={14} className="text-primary" />
              </p>
            </Card>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
