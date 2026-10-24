import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, BookOpen, CalendarDays, ChevronRight, Clock, Code, Cuboid, FlaskConical, FolderGit2, Gauge, GraduationCap, HeartHandshake, History, LifeBuoy, MessageSquare, Newspaper, NotebookPen, Radio,  Rocket, School, ShieldCheck, Sparkles, Telescope, Trophy, UserPlus, Users, Wrench, type LucideIcon,
} from "lucide-react";

import RevealOnScroll from "@/components/UI/RevealOnScroll";
import LivePreview from "./LivePreview";
import {
  SectionTitle,
  toneClasses,
  type Tone,
} from "./shared";

const cornerBtn =
  "rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none";

const platformPoints = [
  { icon: Trophy, text: "Pontuadores e timers com as regras oficiais" },
  { icon: FlaskConical, text: "Testes do robô registrados e comparados" },
  { icon: NotebookPen, text: "Ideias, projetos e tarefas da equipe" },
];

export function PlatformIntro() {
  return (
    <section
      id="conheca"
      className="relative isolate scroll-mt-20 overflow-hidden border-b border-base-300 px-6 py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_1fr] [&>*]:min-w-0">
        <RevealOnScroll>
          <SectionTitle
            kicker="/ O QUE É O ROBOSTAGE"
            title="Muito mais que uma"
            highlight="plataforma."
            description="O RoboStage reúne em um só lugar o que acontece no universo da robótica: equipes, pessoas, projetos e competições. Da preparação ao dia do torneio, cada etapa fica mais simples de acompanhar e de participar."
          />

          <ul className="mt-8 space-y-3">
            {platformPoints.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm sm:text-base">
                <span className="grid size-8 shrink-0 place-items-center rounded-tl-lg rounded-br-lg bg-base-200 text-primary">
                  <Icon size={16} strokeWidth={2} />
                </span>
                <span className="text-base-content/75">{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/sign-up"
              className={`btn btn-primary btn-lg ${cornerBtn} shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-base-content)]`}
            >
              <UserPlus size={20} />
              Criar conta grátis
            </Link>
            <Link href="/about" className="btn btn-ghost btn-lg">
              Sobre o projeto
              <ArrowRight size={18} />
            </Link>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <LivePreview />
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* =========================================================== COMPETIÇÕES */

export function CompetitionsSection() {
  return (
    <section className="bg-base-200/40 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll>
          <SectionTitle
            kicker="/ MODALIDADES"
            title="Um lar para cada"
            highlight="competição."
            highlightClass="bg-accent text-accent-content"
            description="Ferramentas pensadas para as regras, os tempos e a rotina de cada modalidade."
          />
        </RevealOnScroll>

        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* FLL */}
          <RevealOnScroll className="lg:col-span-5">
            <Link
              href="/fll"
              className="group relative isolate block h-full min-h-[340px] overflow-hidden rounded-tl-[32px] rounded-br-[32px] bg-primary text-primary-content shadow-[8px_8px_0_0_var(--color-base-content)] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[10px_10px_0_0_var(--color-base-content)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
            >
              <img
                src="/images/index/hero_banner_fll.jpg"
                alt=""
                className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-primary via-primary/80 to-primary/20" />
              <div className="flex h-full min-h-[340px] flex-col justify-between p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-tl-md rounded-br-md bg-base-100 px-2 py-1 font-mono text-[10px] font-bold tracking-[0.15em] text-base-content">
                    DISPONÍVEL
                  </span>
                  <span className="flex size-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition-all duration-300 group-hover:-rotate-45 group-hover:bg-white group-hover:text-primary">
                    <ChevronRight size={22} />
                  </span>
                </div>
                <div className="text-white">
                  <p className="font-mono text-xs tracking-[0.2em] text-white/70">
                    /fll
                  </p>
                  <h3 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl xl:text-5xl">
                    FIRST LEGO League
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
                    Pontuador por temporada, QuickBrick Studio, Recall, rubricas,
                    timers e guias para equipes iniciantes.
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
                    Explorar a FLL
                    <ChevronRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-2"
                    />
                  </span>
                </div>
              </div>
            </Link>
          </RevealOnScroll>

          {/* OBR */}
          <RevealOnScroll className="lg:col-span-4" delay={0.08}>
            <Link
              href="/obr"
              className="group relative isolate block h-full min-h-[340px] overflow-hidden rounded-tl-[32px] rounded-br-[32px] bg-secondary text-secondary-content shadow-[8px_8px_0_0_var(--color-accent)] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[10px_10px_0_0_var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-4"
            >
              <img
                src="/images/index/hero_banner_obr.png"
                alt=""
                className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-secondary via-secondary/85 to-secondary/20" />
              <div className="flex h-full min-h-[340px] flex-col justify-between p-6 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-tl-md rounded-br-md bg-base-100 px-2 py-1 font-mono text-[10px] font-bold tracking-[0.15em] text-base-content">
                    DISPONÍVEL
                  </span>
                  <span className="flex size-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition-all duration-300 group-hover:-rotate-45 group-hover:bg-white group-hover:text-secondary">
                    <ChevronRight size={22} />
                  </span>
                </div>
                <div className="text-white">
                  <p className="font-mono text-xs tracking-[0.2em] text-white/70">
                    /obr
                  </p>
                  <h3 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
                    OBR
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85">
                    Pontuador da arena, documentação e o Anatix para ver o robô
                    em tempo real.
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
                    Explorar a OBR
                    <ChevronRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-2"
                    />
                  </span>
                </div>
              </div>
            </Link>
          </RevealOnScroll>

          {/* Futuras */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-1">
            <RevealOnScroll delay={0.16} className="h-full">
              <div className="group flex h-full min-h-[150px] flex-col justify-between rounded-tl-[28px] rounded-br-[28px] border border-base-300 bg-base-100 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-secondary/50">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold tracking-[0.15em] text-base-content/45">
                    EM BREVE
                  </span>
                  <span className="font-mono text-xs text-base-content/30">/ftc</span>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-base-content/60 transition-colors group-hover:text-secondary">
                    FTC
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-base-content/60">
                    Ferramentas para equipes da FIRST Tech Challenge.
                  </p>
                </div>
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={0.24} className="h-full">
              <Link
                href="/news"
                className="group flex h-full min-h-[150px] flex-col justify-between rounded-tl-[28px] rounded-br-[28px] border border-dashed border-base-300 bg-base-100/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-light text-base-content/40 transition-transform duration-300 group-hover:rotate-90 group-hover:text-primary">
                    +
                  </span>
                  <span className="font-mono text-[10px] font-bold tracking-[0.15em] text-base-content/45">
                    EM EXPANSÃO
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-base-content/75">
                    Mais modalidades
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-base-content/60">
                    Acompanhe as novidades para saber o que vem por aí.
                  </p>
                </div>
              </Link>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================== ECOSSISTEMA */

type Tool = {
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
  href: string;
  tone: Tone;
  status?: string;
};

const tools: Tool[] = [
  {
    icon: Trophy,
    tag: "PONTUAÇÃO",
    title: "Pontuador",
    description:
      "Simule missões ou rodadas completas com cronômetro de 2:30, temporada por temporada.",
    href: "/fll/score",
    tone: "primary",
  },
  {
    icon: Cuboid,
    tag: "ESTRATÉGIA",
    title: "QuickBrick Studio",
    description:
      "Desenhe trajetórias no tapete, monte matrizes SWOT e de risco e simule saídas.",
    href: "/fll/quickbrick",
    tone: "secondary",
  },
  {
    icon: FlaskConical,
    tag: "TESTES",
    title: "LabTest",
    description:
      "Registre execuções, calibre o robô e compare versões com dados, não com achismo.",
    href: "/labtest",
    tone: "accent",
  },
  {
    icon: MessageSquare,
    tag: "AVALIAÇÃO",
    title: "Recall",
    description:
      "Treine a sala de avaliação com perguntas cronometradas de Core Values, Projeto e Robô.",
    href: "/fll/recall",
    tone: "secondary",
  },
  {
    icon: Clock,
    tag: "TEMPO",
    title: "Timers",
    description:
      "Round do Robô, Sala de Avaliação e timer ajustável com alertas sonoros e visuais.",
    href: "/fll/timers",
    tone: "accent",
  },
  {
    icon: NotebookPen,
    tag: "PROCESSO",
    title: "Stagebook",
    description:
      "Registre ideias, organize projetos e acompanhe tarefas para virar conhecimento da equipe.",
    href: "/stagebook",
    tone: "primary",
  },
  {
    icon: Code,
    tag: "TELEMETRIA",
    title: "Anatix",
    description:
      "Biblioteca aberta para ver sensores, estados e tempos do robô da OBR enquanto ele roda.",
    href: "/anatix",
    tone: "primary",
  },
  {
    icon: Radio,
    tag: "EVENTOS",
    title: "ShowLive",
    description:
      "Ranking no telão atualizado em tempo real e regras configuráveis para torneios e microeventos.",
    href: "/showlive",
    tone: "secondary",
    status: "Em manutenção",
  },
];

export function ToolsSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle
              kicker="/ ECOSSISTEMA"
              title="Tudo o que a equipe usa,"
              highlight="num lugar só."
              description="Cada ferramenta resolve uma parte da temporada. Comece pela que faz mais falta hoje."
            />
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-tl-lg rounded-br-lg border border-base-300 bg-base-100 px-4 py-2 font-mono text-sm transition-colors hover:border-primary hover:text-primary"
            >
              <Gauge size={16} />
              /dashboard
              <ArrowUpRight
                size={15}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </RevealOnScroll>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map(({ icon: Icon, tag, title, description, href, tone, status }, i) => {
            const c = toneClasses[tone];
            return (
              <RevealOnScroll key={title} delay={(i % 4) * 0.06} className="h-full">
                <Link
                  href={href}
                  className={`group relative flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-base-content/[0.04] ${c.hover}`}
                >
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute -right-10 -top-10 size-32 rounded-full border border-base-300 transition-transform duration-500 group-hover:scale-125 ${c.ring}`}
                  />
                  <div className="relative flex items-center justify-between">
                    <div
                      className={`flex size-12 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}
                    >
                      <Icon size={22} strokeWidth={1.8} />
                    </div>
                    <span className="font-mono text-xs text-base-content/35">
                      /{String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className={`relative mt-7 text-[10px] font-bold tracking-[0.18em] ${c.tag}`}>
                    {tag}
                  </p>
                  <h3 className="relative mt-2 flex items-center gap-2 text-xl font-bold tracking-tight">
                    {title}
                    {status && (
                      <span className="badge badge-warning badge-outline badge-xs gap-1 font-normal">
                        <Wrench size={10} />
                        {status}
                      </span>
                    )}
                  </h3>
                  <p className="relative mt-3 flex-1 text-sm leading-6 text-base-content/60">
                    {description}
                  </p>
                  <div className="relative mt-6 flex items-center justify-between">
                    <code className="rounded-md bg-base-200 px-2 py-1 font-mono text-xs text-base-content/70">
                      {href}
                    </code>
                    <ArrowRight
                      size={16}
                      className="text-base-content/40 transition-all group-hover:translate-x-1 group-hover:text-base-content"
                    />
                  </div>
                </Link>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =============================================================== ETAPAS */

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Crie sua conta",
    description: "O cadastro é gratuito e libera o painel com as ferramentas da equipe.",
    detail: "Leva um minuto",
    href: "/sign-up",
    link: "Cadastrar",
  },
  {
    number: "02",
    icon: Users,
    title: "Monte a equipe",
    description: "Convide os integrantes, escolha a modalidade e organize documentos e tarefas.",
    detail: "Todos no mesmo lugar",
    href: "/dashboard/team",
    link: "Ver equipes",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Treine e evolua",
    description: "Pontue rodadas, registre testes no LabTest e compare a evolução ao longo da temporada.",
    detail: "Decisões com dados",
    href: "/labtest",
    link: "Conhecer o LabTest",
  },
];

export function StepsSection() {
  return (
    <section className="border-y border-base-300 bg-base-200/40 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll>
          <SectionTitle
            kicker="/ COMO COMEÇAR"
            title="Três passos até"
            highlight="o primeiro treino."
            highlightClass="bg-secondary text-secondary-content"
          />
        </RevealOnScroll>

        <div className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-12">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 max-w-[70%] top-6 hidden border-t-2 border-dashed border-base-300 md:block"
          />
          {steps.map(({ number, icon: Icon, title, description, detail, href, link }, i) => (
            <RevealOnScroll key={number} delay={i * 0.1}>
              <article className="group relative">
                <div className="flex items-center gap-4 md:block">
                  <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 text-secondary transition-all duration-300 group-hover:border-secondary group-hover:bg-secondary group-hover:text-secondary-content">
                    <Icon size={21} strokeWidth={1.8} />
                  </div>
                  <span className="font-mono text-xs tracking-widest text-base-content/40 md:mt-4 md:block">
                    ETAPA {number}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold tracking-tight">{title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-base-content/60">
                  {description}
                </p>
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
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ PARA QUEM */

const personas = [
  {
    id: "iniciantes",
    label: "Equipes iniciantes",
    image: "/images/icons/EquipesIniciantes.svg",
    text: "Comecem com uma estrutura simples para os primeiros passos: entendam a competição, conheçam as missões e organizem os treinos.",
    links: [
      { label: "Iniciantes da Challenge", href: "/fll/begins", icon: School },
      { label: "Iniciantes da Explore", href: "/fll/explore", icon: Telescope },
      { label: "Guia de Missões", href: "/fll/docs/missions-guide", icon: BookOpen },
    ],
  },
  {
    id: "tecnicos",
    label: "Técnicos",
    image: "/images/icons/Tecnicos.svg",
    text: "Acompanhem a evolução técnica da equipe com treinos cronometrados, rubricas e testes registrados.",
    links: [
      { label: "Rubrica de Avaliação", href: "/fll/rubric", icon: GraduationCap },
      { label: "Timers", href: "/fll/timers", icon: Clock },
      { label: "Recall", href: "/fll/recall", icon: MessageSquare },
    ],
  },
  {
    id: "organizadores",
    label: "Organizadores",
    image: "/images/icons/Organizadores.svg",
    text: "Centralizem partidas e resultados de torneios e microeventos em um ambiente pensado para a operação.",
    links: [
      { label: "ShowLive", href: "/showlive", icon: Radio },
      { label: "Entrar em um evento", href: "/universe", icon: Sparkles },
      { label: "Checklist de evento", href: "/fll/cheklist", icon: ShieldCheck },
    ],
  },
  {
    id: "avancadas",
    label: "Equipes avançadas",
    image: "/images/icons/EquipesAvancadas.svg",
    text: "Transformem dados de desempenho em decisões: compare versões do robô e encontre onde está a perda de pontos.",
    links: [
      { label: "LabTest", href: "/labtest", icon: FlaskConical },
      { label: "QuickBrick Studio", href: "/fll/quickbrick", icon: Cuboid },
      { label: "Anatix", href: "/obr/anatix", icon: Code },
    ],
  },
];

export function PersonasSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll>
          <SectionTitle
            kicker="/ PARA QUEM"
            title="Cada equipe vive a robótica"
            highlight="de um jeito."
            highlightClass="bg-accent text-accent-content"
            description="Escolha o seu perfil e veja por onde começar."
          />
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <div className="tabs tabs-box mt-12 rounded-tl-2xl rounded-br-2xl bg-base-200/60 p-2">
            {personas.map(({ id, label, image, text, links }, i) => (
              <PersonaTab
                key={id}
                label={label}
                image={image}
                text={text}
                links={links}
                index={i}
              />
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function PersonaTab({
  label,
  image,
  text,
  links,
  index,
}: Omit<(typeof personas)[number], "id"> & { index: number }) {
  return (
    <>
      <input
        type="radio"
        name="home_personas"
        className="tab font-semibold"
        aria-label={label}
        defaultChecked={index === 0}
      />
      <div className="tab-content pt-2">
        <div className="grid items-center gap-8 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 sm:p-8 md:grid-cols-[220px_1fr]">
          <div className="grid aspect-square w-40 place-items-center justify-self-center rounded-tl-3xl rounded-br-3xl bg-base-200 p-6 md:w-full">
            <img src={image} alt="" aria-hidden="true" className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-base-content/45">
              /{String(index + 1).padStart(2, "0")} · {label.toUpperCase()}
            </p>
            <p className="mt-3 max-w-2xl text-base leading-7 text-base-content/75 sm:text-lg sm:leading-8">
              {text}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {links.map(({ label: l, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 px-4 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[4px_4px_0_0_var(--color-primary)]"
                >
                  <Icon size={17} className="shrink-0 text-primary" />
                  <span className="flex-1">{l}</span>
                  <ArrowRight
                    size={15}
                    className="text-base-content/35 transition-transform group-hover:translate-x-1 group-hover:text-primary"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================ TEMPORADAS */

const seasons = [
  {
    key: "bioglow",
    name: "BIOGLOW",
    period: "2026/2027",
    logo: "/images/logos/fll/seasons/bioglow_logo.png",
    current: true,
  },
  {
    key: "unearthed",
    name: "UNEARTHED",
    period: "2025/2026",
    logo: "/images/logos/fll/seasons/Unearthed.webp",
  },
  {
    key: "submerged",
    name: "SUBMERGED",
    period: "2024/2025",
    logo: "/images/logos/fll/seasons/Submerged.webp",
  },
  {
    key: "masterpiece",
    name: "MASTERPIECE",
    period: "2023/2024",
    logo: "/images/logos/fll/seasons/Masterpiece.png",
  },
];

export function SeasonsSection() {
  return (
    <section className="border-y border-base-300 bg-base-200/40 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle
              kicker="/ TEMPORADAS DA FLL"
              title="Pontue qualquer"
              highlight="temporada."
              description="Missões da temporada atual e das anteriores, prontas para treinar ou rever estratégias."
            />
            <Link
              href="/fll/future-edition"
              className={`btn btn-outline ${cornerBtn} border-base-content/20 hover:border-primary hover:bg-primary hover:text-primary-content`}
            >
              <Sparkles size={17} />
              Future Edition
            </Link>
          </div>
        </RevealOnScroll>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {seasons.map(({ key, name, period, logo, current }, i) => (
            <RevealOnScroll key={key} delay={i * 0.06} className="h-full">
              <Link
                href={`/fll/score/${key}`}
                className={`group relative flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border bg-base-100 p-4 transition-all sm:p-5 duration-300 hover:-translate-y-1 ${
                  current
                    ? "border-primary shadow-[6px_6px_0_0_var(--color-primary)]"
                    : "border-base-300 hover:border-secondary/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-base-content/45">{period}</span>
                  {current && (
                    <span className="rounded-tl-md rounded-br-md bg-primary px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.15em] text-primary-content">
                      ATUAL
                    </span>
                  )}
                </div>
                <div className="my-5 grid h-28 place-items-center rounded-tl-xl rounded-br-xl bg-[#f7f4ec] p-2">
                  <img
                    src={logo}
                    alt={`Logo da temporada ${name}`}
                    className="max-h-24 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                  <h3 className="text-sm font-bold tracking-tight sm:text-base">{name}</h3>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-base-content/55 transition-colors group-hover:text-primary">
                    Pontuar
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================= DESTAQUES */

export function SpotlightSection() {
  const items = [
    {
      kicker: "/ LABTEST",
      title: "Teste antes da competição.",
      text: "Runs, CalibraBot e testes personalizados: execute em condições controladas, meça, compare e decida.",
      image: "/images/index/banner_labtest.png",
      href: "/labtest",
      cta: "Conhecer o LabTest",
      tone: "secondary" as Tone,
    },
    {
      kicker: "/ STAGEBOOK",
      title: "A ideia começa aqui.",
      text: "Registre ideias, organize projetos e acompanhe tarefas, transformando o processo da equipe em conhecimento.",
      image: "/images/index/banner_stagebook.png",
      href: "/stagebook",
      cta: "Conhecer o Stagebook",
      tone: "primary" as Tone,
    },
  ];

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll>
          <SectionTitle
            kicker="/ EM DESTAQUE"
            title="Do teste no tapete"
            highlight="ao caderno da equipe."
            highlightClass="bg-secondary text-secondary-content"
          />
        </RevealOnScroll>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {items.map(({ kicker, title, text, image, href, cta, tone }, i) => (
            <RevealOnScroll key={href} delay={i * 0.1} className="h-full">
              <Link
                href={href}
                className={`group flex h-full flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 transition-all duration-300 hover:-translate-y-1 ${
                  tone === "primary"
                    ? "hover:shadow-[8px_8px_0_0_var(--color-primary)]"
                    : "hover:shadow-[8px_8px_0_0_var(--color-secondary)]"
                }`}
              >
                <div className="relative aspect-[16/8] overflow-hidden border-b border-base-300 bg-base-200">
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <p className={`font-mono text-xs tracking-[0.2em] ${toneClasses[tone].tag}`}>
                    {kicker}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight">{title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-base-content/60 sm:text-base">
                    {text}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">
                    {cta}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================ CANOPY */

export function CanopySection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#091A07] text-white">
      <div className="mx-auto grid max-w-6xl items-stretch md:grid-cols-2">
        <div className="relative z-10 flex flex-col justify-center gap-4 px-6 py-20">
          <p className="font-mono text-xs tracking-[0.2em] text-white/50">
            / ESPECIAL
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            FIRST® CANOPY™
          </h2>
          <p className="max-w-md text-sm leading-7 text-white/75 sm:text-base">
            Nada na Terra prospera sozinha. Cada gene, espécie e ecossistema faz
            parte de uma teia viva de diversidade biológica. Com STEM como
            ferramenta e a natureza como inspiração.
          </p>
          <div>
            <Link
              href="/robostage-canopy"
              className={`btn mt-2 ${cornerBtn} border-none bg-[#9BE15D] text-[#091A07] shadow-[4px_4px_0_0_#ffffff] transition-all hover:-translate-y-0.5 hover:bg-[#b4ec80]`}
            >
              Conhecer
              <ArrowRight size={18} />
            </Link>
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
        <img
          src="/images/index/canopy.webp"
          alt=""
          className="h-full w-full object-cover opacity-40 md:opacity-100"
        />
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
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export function NewsSection({ news }: { news: HomeNews[] }) {
  if (news.length === 0) return null;
  const [first, ...rest] = news;

  return (
    <section className="border-t border-base-300 bg-base-200/40 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle
              kicker="/ NOVIDADES"
              title="O que mudou"
              highlight="por aqui."
            />
            <div className="flex flex-wrap gap-2">
              <Link
                href="/news"
                className="group inline-flex items-center gap-2 rounded-tl-lg rounded-br-lg border border-base-300 bg-base-100 px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
              >
                <Newspaper size={16} />
                Todas as notícias
              </Link>
              <Link
                href="/changelog"
                className="group inline-flex items-center gap-2 rounded-tl-lg rounded-br-lg border border-base-300 bg-base-100 px-4 py-2 text-sm font-semibold transition-colors hover:border-secondary hover:text-secondary"
              >
                <History size={16} />
                Changelog
              </Link>
            </div>
          </div>
        </RevealOnScroll>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <RevealOnScroll className="h-full">
            <Link
              href={`/news/${first.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_var(--color-primary)]"
            >
              {first.cover && (
                <div className="aspect-[16/8] overflow-hidden bg-base-200">
                  <img
                    src={first.cover}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <NewsMeta date={first.date} category={first.category} />
                <h3 className="mt-3 text-2xl font-bold leading-tight tracking-tight">
                  {first.title}
                </h3>
                {first.description && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-base-content/60">
                    {first.description}
                  </p>
                )}
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">
                  Ler notícia
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </RevealOnScroll>

          <div className="flex flex-col gap-5">
            {rest.map((n, i) => (
              <RevealOnScroll key={n.slug} delay={(i + 1) * 0.08} className="flex-1">
                <Link
                  href={`/news/${n.slug}`}
                  className="group flex h-full flex-col rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40"
                >
                  <NewsMeta date={n.date} category={n.category} />
                  <h3 className="mt-3 text-lg font-bold leading-snug tracking-tight">{n.title}</h3>
                  {n.description && (
                    <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-base-content/60">
                      {n.description}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-base-content/60 transition-colors group-hover:text-secondary">
                    Ler
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsMeta({ date, category }: { date?: string; category?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-base-content/50">
      {category && (
        <span className="rounded-tl-md rounded-br-md bg-base-200 px-2 py-0.5 font-bold tracking-wider text-base-content/70">
          {category.toUpperCase()}
        </span>
      )}
      {date && (
        <span className="inline-flex items-center gap-1">
          <CalendarDays size={12} />
          {formatDate(date)}
        </span>
      )}
    </div>
  );
}

/* ============================================================ COMUNIDADE */

const communityLinks = [
  {
    icon: FolderGit2,
    title: "Código aberto",
    text: "Acompanhe o desenvolvimento e sugira melhorias no GitHub.",
    href: "https://github.com/ohthias/roboStage",
    external: true,
    tone: "primary" as Tone,
  },
  {
    icon: HeartHandshake,
    title: "Apoie o projeto",
    text: "Veja como contribuir com código, divulgação ou apoio financeiro.",
    href: "/sponsors",
    tone: "accent" as Tone,
  },
  {
    icon: LifeBuoy,
    title: "Central de ajuda",
    text: "Tire dúvidas sobre as ferramentas e o uso da plataforma.",
    href: "/help",
    tone: "secondary" as Tone,
  },
];

export function CommunitySection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.1fr] [&>*]:min-w-0">
        <RevealOnScroll>
          <SectionTitle
            kicker="/ COMUNIDADE"
            title="Um projeto independente,"
            highlight="feito com a comunidade."
            highlightClass="bg-secondary text-secondary-content"
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
        </RevealOnScroll>

        <div className="grid content-center gap-4">
          {communityLinks.map(({ icon: Icon, title, text, href, external, tone }, i) => {
            const c = toneClasses[tone];
            const inner = (
              <>
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}
                >
                  <Icon size={21} strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-base-content/60">{text}</p>
                </div>
                {external ? (
                  <ArrowUpRight size={18} className="shrink-0 text-base-content/35 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                ) : (
                  <ArrowRight size={18} className="shrink-0 text-base-content/35 transition-transform group-hover:translate-x-1" />
                )}
              </>
            );
            const cls = `group flex items-center gap-4 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5 transition-all duration-300 hover:-translate-y-0.5 ${c.hover}`;
            return (
              <RevealOnScroll key={title} delay={i * 0.08}>
                {external ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
                    {inner}
                  </a>
                ) : (
                  <Link href={href} className={cls}>
                    {inner}
                  </Link>
                )}
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =================================================================== FAQ */

const faq = [
  {
    q: "O RoboStage é gratuito?",
    a: "Sim. Criar a conta é grátis, e várias ferramentas, como o pontuador, os timers e o Recall, podem ser usadas direto pelo site.",
  },
  {
    q: "Quais competições são atendidas?",
    a: "Hoje a plataforma tem ferramentas para a FIRST LEGO League e para a OBR. A FTC e outras modalidades estão nos planos; acompanhe pelas notícias.",
  },
  {
    q: "Preciso de conta para usar as ferramentas?",
    a: "Não para todas. As ferramentas públicas abrem sem login. A conta é necessária para recursos da equipe, como o painel, o LabTest e o Stagebook.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim, mas algumas ferramentas, como as do QuickBrick Studio, foram pensadas para telas maiores. Para elas, prefira o notebook ou o computador.",
  },
  {
    q: "Como sugerir uma ferramenta ou relatar um problema?",
    a: "Abra uma issue no repositório do GitHub ou consulte a central de ajuda. As sugestões da comunidade orientam as próximas atualizações.",
  },
];

export function FaqSection() {
  return (
    <section className="border-t border-base-300 bg-base-200/40 px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
        <RevealOnScroll>
          <div className="lg:sticky lg:top-28">
            <SectionTitle kicker="/ DÚVIDAS" title="Antes de" highlight="começar." />
            <Link
              href="/help"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-base-content/70 transition-colors hover:text-primary"
            >
              <LifeBuoy size={18} className="text-success" />
              Mais respostas na central de ajuda
              <ArrowRight size={15} />
            </Link>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <div className="space-y-3">
            {faq.map(({ q, a }, i) => (
              <div
                key={q}
                className="collapse collapse-plus rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100"
              >
                <input type="radio" name="home_faq" defaultChecked={i === 0} aria-label={q} />
                <div className="collapse-title pr-12 font-semibold">{q}</div>
                <div className="collapse-content text-sm leading-6 text-base-content/65">
                  <p>{a}</p>
                </div>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ============================================================= CTA FINAL */

export function FinalCta() {
  return (
    <section className="px-6 py-24">
      <RevealOnScroll>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] bg-secondary px-8 py-14 text-secondary-content sm:px-14">
          <div aria-hidden="true" className="absolute -right-16 -top-16 size-64 rounded-full border-[28px] border-accent/90" />
          <div aria-hidden="true" className="absolute -bottom-10 right-40 size-24 rotate-12 rounded-tl-2xl rounded-br-2xl bg-primary" />
          <div aria-hidden="true" className="absolute bottom-8 right-12 size-10 rounded-full border-2 border-dashed border-secondary-content/40" />
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] bg-[size:22px_22px] opacity-[0.08]" />

          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-secondary-content/70">
              <Trophy size={14} />
              O PRÓXIMO EVENTO COMEÇA AQUI
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Existe um lugar esperando pela sua equipe.
            </h2>
            <p className="mt-5 max-w-xl text-secondary-content/80">
              Se você compete, organiza, ensina, aprende ou simplesmente ama
              robótica, comece agora e leve a equipe mais longe nesta temporada.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/sign-up"
                className={`btn btn-accent btn-lg ${cornerBtn} shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5`}
              >
                <UserPlus size={20} />
                Criar conta grátis
              </Link>
              <Link
                href="/fll"
                className="btn btn-ghost btn-lg text-secondary-content hover:bg-secondary-content/10"
              >
                Começar na FLL
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/obr"
                className="btn btn-ghost btn-lg text-secondary-content hover:bg-secondary-content/10"
              >
                Começar na OBR
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}

