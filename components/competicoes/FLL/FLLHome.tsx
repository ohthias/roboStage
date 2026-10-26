import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookCopy,
  BookOpen,
  Bot,
  CalendarDays,
  Clock,
  Cuboid,
  Globe2,
  HeartHandshake,
  Lightbulb,
  ListCheck,
  MessageCircleQuestion,
  MonitorDot,
  NotepadText,
  School,
  Telescope,
  Trophy,
  Users,
} from "lucide-react";

import Hero from "../../Hero";
import FLLHighlightSeason from "./Components/FLLHighlightSeason";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import LivePreview from "@/components/home/LivePreview";
import {
  AnimatedBackground,
  SectionTitle,
  toneClasses,
  type Tone,
} from "@/components/home/shared";
import { NewsSection, SeasonsSection } from "@/components/home/HomeSections";
import {
  CtaBlock,
  ToolGrid,
  cornerBtn,
  type ToolItem,
} from "@/components/competicoes/shared/CompetitionSections";
import { getLatestNews } from "@/utils/institutional/news";
import "@/components/home/home.css";

/* -------------------------------------------------------------- dados */

const pillars = [
  {
    icon: Users,
    tag: "TREINAMENTO",
    title: "Desenvolva sua equipe",
    description:
      "Treine a sala de avaliação, aplique rubricas e registre testes para transformar evolução em aprendizado contínuo.",
    links: [
      { label: "Recall", href: "/fll/recall" },
      { label: "Rubrica", href: "/fll/rubric" },
    ],
    tone: "primary" as Tone,
  },
  {
    icon: CalendarDays,
    tag: "ORGANIZAÇÃO",
    title: "Planeje sua temporada",
    description:
      "Organize missões, estratégias de mesa e o projeto de inovação ao longo de toda a temporada.",
    links: [
      { label: "QuickBrick", href: "/fll/quickbrick" },
      { label: "Documentações", href: "/fll/docs" },
    ],
    tone: "secondary" as Tone,
  },
  {
    icon: Trophy,
    tag: "COMPETIÇÃO",
    title: "Chegue pronto ao torneio",
    description:
      "Pontue rodadas com o cronômetro oficial, revise o checklist e simule saídas antes do dia da competição.",
    links: [
      { label: "Pontuador", href: "/fll/score" },
      { label: "Checklist", href: "/fll/cheklist" },
    ],
    tone: "accent" as Tone,
  },
];

const judgedAreas = [
  {
    icon: Bot,
    title: "Robot Game",
    text: "Rodadas de 2:30 em que o robô autônomo cumpre missões no tapete da temporada.",
    tools: [
      { label: "Pontuador", href: "/fll/score" },
      { label: "Timers", href: "/fll/timers" },
    ],
    tone: "primary" as Tone,
  },
  {
    icon: Cuboid,
    title: "Design do Robô",
    text: "Como a equipe projetou, construiu, programou e testou o robô e a estratégia.",
    tools: [
      { label: "QuickBrick", href: "/fll/quickbrick" },
      { label: "Partiu Mesa!", href: "/fll/partiu-mesa" },
    ],
    tone: "secondary" as Tone,
  },
  {
    icon: Lightbulb,
    title: "Projeto de Inovação",
    text: "Uma solução para um problema real ligado ao tema da temporada.",
    tools: [
      { label: "Mapa de Empatia", href: "/fll/empathy-map" },
      { label: "Rubrica", href: "/fll/rubric" },
    ],
    tone: "accent" as Tone,
  },
  {
    icon: HeartHandshake,
    title: "Core Values",
    text: "Trabalho em equipe, descoberta, inclusão e profissionalismo em tudo o que a equipe faz.",
    tools: [
      { label: "Recall", href: "/fll/recall" },
      { label: "Rubrica", href: "/fll/rubric" },
    ],
    tone: "primary" as Tone,
  },
];

const tools: ToolItem[] = [
  {
    icon: Cuboid,
    tag: "ESTRATÉGIA",
    title: "QuickBrick Studio",
    description:
      "Desenhe trajetórias no tapete, monte matrizes SWOT e de risco e simule saídas com o Sharks Simulator.",
    href: "/fll/quickbrick",
    tone: "primary",
  },
  {
    icon: Trophy,
    tag: "PONTUAÇÃO",
    title: "Pontuador",
    description:
      "Simule missões ou rodadas completas com cronômetro de 2:30, temporada por temporada.",
    href: "/fll/score",
    tone: "accent",
  },
  {
    icon: MessageCircleQuestion,
    tag: "AVALIAÇÃO",
    title: "Recall",
    description:
      "Perguntas cronometradas de Core Values, Projeto de Inovação e Design do Robô para treinar a sala de avaliação.",
    href: "/fll/recall",
    tone: "secondary",
  },
  {
    icon: NotepadText,
    tag: "RUBRICAS",
    title: "Rubricas de Avaliação",
    description:
      "Avalie a equipe com as rubricas da competição e descubra onde estão os pontos de melhoria.",
    href: "/fll/rubric",
    tone: "primary",
  },
  {
    icon: Users,
    tag: "INOVAÇÃO",
    title: "Mapa de Empatia",
    description:
      "Entenda o profissional e o público do seu projeto para criar soluções mais certeiras.",
    href: "/fll/empathy-map",
    tone: "secondary",
    status: "Novo",
  },
  {
    icon: Clock,
    tag: "TEMPO",
    title: "Timers",
    description:
      "Round do Robô, Sala de Avaliação e timer ajustável, com alertas sonoros e visuais.",
    href: "/fll/timers",
    tone: "accent",
  },
  {
    icon: MonitorDot,
    tag: "SIMULAÇÃO",
    title: "Partiu Mesa!",
    description:
      "Simulador simples para testar saídas e analisar o desempenho do robô durante o teste.",
    href: "/fll/partiu-mesa",
    tone: "primary",
  },
  {
    icon: ListCheck,
    tag: "CHECKLIST",
    title: "Confia, mas confira!",
    description:
      "Checklist de itens para a preparação antes do torneio e para a avaliação depois do evento.",
    href: "/fll/cheklist",
    tone: "secondary",
  },
];

const resources = [
  { icon: School, title: "Iniciantes da Challenge", text: "Primeiros passos para equipes que vão estrear na FLL Challenge.", href: "/fll/begins" },
  { icon: Telescope, title: "Iniciantes da Explore", text: "Um guia para as equipes mais novas da FLL Explore.", href: "/fll/explore" },
  { icon: BookOpen, title: "Documentações", text: "Regras e documentos das temporadas da liga, reunidos em um só lugar.", href: "/fll/docs" },
  { icon: BookCopy, title: "Guia de Missões", text: "As missões da FLL Challenge explicadas uma a uma.", href: "/fll/docs/missions-guide" },
];

/* --------------------------------------------------------------- página */

export default function FLLHome() {
  const news = getLatestNews(3, "FLL");

  return (
    <main className="mt-16 overflow-x-clip bg-base-100 text-base-content">
      <Hero />

      {/* ============================================== COMO O ROBOSTAGE AJUDA */}
      <section className="relative isolate overflow-hidden px-6 py-24">
        <AnimatedBackground />
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_1fr] [&>*]:min-w-0">
          <RevealOnScroll>
            <SectionTitle
              kicker="/ O ROBOSTAGE NA FLL"
              title="Menos tempo organizando,"
              highlight="mais tempo construindo."
              description="Um ambiente que conecta pessoas, ideias e tecnologia em todas as etapas da temporada: do primeiro treino de mesa à sala de avaliação."
            />
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/fll/score/bioglow"
                className={`btn btn-primary btn-lg ${cornerBtn} shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-base-content)]`}
              >
                <Trophy size={20} />
                Pontuar a BIOGLOW
              </Link>
              <a href="#ferramentas" className="btn btn-ghost btn-lg">
                Ver ferramentas
                <ArrowRight size={18} />
              </a>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <LivePreview />
          </RevealOnScroll>
        </div>

        <div className="mx-auto mt-20 grid max-w-6xl gap-5 md:grid-cols-3">
          {pillars.map(({ icon: Icon, tag, title, description, links, tone }, i) => {
            const c = toneClasses[tone];
            return (
              <RevealOnScroll key={title} delay={i * 0.08} className="h-full">
                <article
                  className={`group relative flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 ${c.hover}`}
                >
                  <div aria-hidden="true" className={`pointer-events-none absolute -right-10 -top-10 size-32 rounded-full border border-base-300 transition-transform duration-500 group-hover:scale-125 ${c.ring}`} />
                  <div className="relative flex items-center justify-between">
                    <div className={`flex size-12 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}>
                      <Icon size={22} strokeWidth={1.8} />
                    </div>
                    <span className="font-mono text-xs text-base-content/35">{String(i + 1).padStart(2, "0")} / 03</span>
                  </div>
                  <p className={`relative mt-7 text-[10px] font-bold tracking-[0.18em] ${c.tag}`}>{tag}</p>
                  <h3 className="relative mt-2 text-xl font-bold tracking-tight">{title}</h3>
                  <p className="relative mt-3 flex-1 text-sm leading-6 text-base-content/60">{description}</p>
                  <div className="relative mt-6 flex flex-wrap gap-2">
                    {links.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="inline-flex items-center gap-1 rounded-md bg-base-200 px-2.5 py-1 font-mono text-xs text-base-content/75 transition-colors hover:bg-base-content hover:text-base-100"
                      >
                        {l.label}
                        <ArrowRight size={12} />
                      </Link>
                    ))}
                  </div>
                </article>
              </RevealOnScroll>
            );
          })}
        </div>
      </section>

      {/* ========================================================= SOBRE A FLL */}
      <section className="border-y border-base-300 bg-base-200/40 px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.05fr] [&>*]:min-w-0">
          <RevealOnScroll>
            <figure className="relative">
              <div aria-hidden="true" className="absolute -left-4 -top-4 size-24 -rotate-6 rounded-tl-2xl rounded-br-2xl bg-accent" />
              <img
                src="/images/fll/fll_about.jpg"
                alt="Equipe participando da FIRST LEGO League"
                className="relative aspect-[4/3] w-full rounded-tl-3xl rounded-br-3xl border border-base-300 object-cover shadow-[8px_8px_0_0_var(--color-primary)]"
              />
              <figcaption className="mt-4 text-xs text-base-content/50">
                Foto: LEGO® Education / FIRST® LEGO® League
              </figcaption>
            </figure>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <SectionTitle
              kicker="/ SOBRE A FLL"
              title="Robótica, ciência e"
              highlight="trabalho em equipe."
              highlightClass="bg-secondary text-secondary-content"
            />
            <p className="mt-6 text-base leading-7 text-base-content/65 sm:text-lg">
              A FIRST LEGO League é uma competição internacional de robótica
              educacional para crianças e adolescentes. As equipes projetam,
              constroem e programam robôs com peças LEGO e desenvolvem soluções
              para problemas do mundo real.
            </p>
            <p className="mt-4 text-base leading-7 text-base-content/60">
              São mais de 650 mil estudantes em 77 países, e no Brasil os
              torneios são organizados pelo SESI desde 2012.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://www.firstinspires.org/robotics/fll"
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn-outline ${cornerBtn} border-base-content/25 hover:border-secondary hover:bg-secondary hover:text-secondary-content`}
              >
                Conhecer a competição
                <ArrowUpRight size={17} />
              </a>
              <Link href="/roboticar#dados" className="btn btn-ghost">
                <Globe2 size={17} />
                Dados da robótica no Brasil
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ===================================================== ÁREAS AVALIADAS */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <SectionTitle
              kicker="/ COMO A EQUIPE É AVALIADA"
              title="Quatro frentes,"
              highlight="uma temporada."
              highlightClass="bg-accent text-accent-content"
              description="Na FLL Challenge a equipe é avaliada dentro e fora da mesa. Para cada frente, uma ferramenta do RoboStage ajuda a se preparar."
            />
          </RevealOnScroll>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {judgedAreas.map(({ icon: Icon, title, text, tools: t, tone }, i) => {
              const c = toneClasses[tone];
              return (
                <RevealOnScroll key={title} delay={i * 0.06} className="h-full">
                  <article className={`group flex h-full flex-col rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 ${c.hover}`}>
                    <div className={`flex size-11 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}>
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                    <h3 className="mt-6 text-lg font-bold tracking-tight">{title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-base-content/60">{text}</p>
                    <div className="mt-5 border-t border-base-300 pt-4">
                      <p className="font-mono text-[10px] tracking-[0.15em] text-base-content/40">PREPARE-SE COM</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {t.map((l) => (
                          <Link
                            key={l.href}
                            href={l.href}
                            className={`inline-flex items-center gap-1 text-sm font-semibold transition-colors hover:underline ${c.tag}`}
                          >
                            {l.label}
                            <ArrowRight size={13} />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </article>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      <FLLHighlightSeason />

      {/* ========================================================= FERRAMENTAS */}
      <section id="ferramentas" className="scroll-mt-20 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <SectionTitle
              kicker="/ FERRAMENTAS DA FLL"
              title="Tudo que uma equipe FLL precisa,"
              highlight="num lugar só."
              description="Planeje missões, acompanhe pontuações, desenvolva o projeto de inovação e prepare-se para o torneio sem alternar entre várias ferramentas."
            />
          </RevealOnScroll>
          <ToolGrid tools={tools} />
        </div>
      </section>

      <SeasonsSection />

      {/* ============================================================ RECURSOS */}
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
          <RevealOnScroll>
            <div className="lg:sticky lg:top-28">
              <SectionTitle
                kicker="/ RECURSOS"
                title="Primeira temporada?"
                highlight="Comece por aqui."
                highlightClass="bg-secondary text-secondary-content"
                description="Guias e documentos para entender a liga, as missões e o caminho até o torneio."
              />
            </div>
          </RevealOnScroll>
          <div className="grid gap-4 sm:grid-cols-2">
            {resources.map(({ icon: Icon, title, text, href }, i) => (
              <RevealOnScroll key={href} delay={i * 0.06} className="h-full">
                <Link
                  href={href}
                  className="group flex h-full flex-col rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-[6px_6px_0_0_var(--color-secondary)]"
                >
                  <Icon size={20} className="text-secondary" />
                  <h3 className="mt-4 font-bold">{title}</h3>
                  <p className="mt-1 flex-1 text-sm leading-6 text-base-content/60">{text}</p>
                  <span className="mt-4 inline-flex items-center gap-1 font-mono text-xs text-base-content/50 transition-colors group-hover:text-secondary">
                    {href}
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================== FUTURE EDITION */}
      <section className="px-6 pb-24">
        <RevealOnScroll>
          <div className="group relative isolate mx-auto max-w-6xl overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] bg-[#1d2a10] text-white shadow-[10px_10px_0_0_var(--color-accent)]">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-20 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.02]"
              style={{
                backgroundImage:
                  "url('https://www.bischoff-ag.ch/thumbnail/0f/a0/d5/1782169686/45834_Lifestyle_Cons_19_7d6229d67aa1ee63977a4f49a9682fb43b5dfc10_800x800.png?ts=1782173521&nocache=1')",
              }}
            />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/65 to-black/20" />
            <div className="px-8 py-14 sm:px-14">
              <p className="font-mono text-xs tracking-[0.2em] text-white/60">/ FUTURE EDITION</p>
              <img
                src="https://www.firstinspires.org/hs-fs/hubfs/web/brand/season/2027/first_canopy_fll_bioglow_logo_horizontal_future_edition_rgb_fullcolor.png?width=1436&height=484&name=first_canopy_fll_bioglow_logo_horizontal_future_edition_rgb_fullcolor.png"
                alt="FIRST LEGO League BIOGLOW Future Edition"
                className="mt-6 h-auto w-48 max-w-full drop-shadow-lg sm:w-60"
              />
              <h2 className="mt-6 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Uma nova geração de possibilidades para a{" "}
                <span className="text-[#C8F77A]">FIRST LEGO League.</span>
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
                Conheça a BIOGLOW™ Future Edition, com os novos kits LEGO®
                Education Computer Science & AI, hardware sem fio e uma
                experiência colaborativa baseada em alianças.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/fll/future-edition"
                  className={`btn border-0 bg-[#C8F77A] px-6 font-bold text-[#20320C] ${cornerBtn} shadow-[4px_4px_0_0_#ffffff] transition-all hover:-translate-y-0.5 hover:bg-[#D8FFA0]`}
                >
                  Conheça a Future Edition
                  <ArrowUpRight size={18} />
                </Link>
                <Link
                  href="/fll/future-edition/score"
                  className="btn btn-ghost text-white hover:bg-white/10"
                >
                  Pontuador da Future Edition
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      <NewsSection news={news} kicker="/ NOVIDADES" title="O que há de novo" highlight="na FLL." />

      <CtaBlock
        kicker="SUA PRÓXIMA TEMPORADA"
        icon={Trophy}
        title="Sua próxima temporada de FLL começa aqui."
        text="Do planejamento ao torneio. Do primeiro teste à classificação. Organize a equipe, acompanhe o progresso e evolua durante toda a temporada."
        actions={[
          { label: "Criar conta grátis", href: "/sign-up", variant: "accent" },
          { label: "Iniciativas de outras equipes", href: "/roboticar#iniciativas", variant: "ghost" },
        ]}
      />
    </main>
  );
}
