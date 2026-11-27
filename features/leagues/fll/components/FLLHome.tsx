import { asset } from "@/lib/assets";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BookCopy,
  BookOpen,
  Bot,
  CalendarDays,
  Clock,
  Cpu,
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
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

import Hero from "@/components/layout/Hero";
import FLLHighlightSeason from "./sections/FLLHighlightSeason";
import { NewsSection, SeasonsSection } from "@/features/home/components/HomeSections";
import {
  ButtonLink,
  FeatureCard,
  Flower,
  Gear,
  Kicker,
  Reveal,
  Section,
  SectionTitle,
  Sparkle,
  StageImage,
  Starburst,
  StickerTag,
  cn,
  toneSoft,
  toneText,
  type Tone,
} from "@/components/stage";
import { getLatestNews } from "@/features/institutional/lib/news";

/* ================================================================ DADOS */

const facts = [
  { value: "650 mil+", label: "estudantes" },
  { value: "77", label: "países" },
  { value: "2012", label: "SESI no Brasil" },
];

const judgedAreas: {
  icon: LucideIcon;
  title: string;
  text: string;
  tools: { label: string; href: string }[];
  tone: Tone;
}[] = [
  {
    icon: Bot,
    title: "Robot Game",
    text: "Rodadas de 2:30 em que o robô autônomo cumpre missões no tapete da temporada.",
    tools: [
      { label: "Pontuador", href: "/fll/score" },
      { label: "Timers", href: "/fll/timers" },
    ],
    tone: "primary",
  },
  {
    icon: Cuboid,
    title: "Design do Robô",
    text: "Como a equipe projetou, construiu, programou e testou o robô e a estratégia.",
    tools: [
      { label: "QuickBrick", href: "/fll/quickbrick" },
      { label: "Partiu Mesa!", href: "/fll/partiu-mesa" },
      { label: "Anatix", href: "/fll/anatix" },
    ],
    tone: "secondary",
  },
  {
    icon: Lightbulb,
    title: "Projeto de Inovação",
    text: "Uma solução para um problema real ligado ao tema da temporada.",
    tools: [
      { label: "Mapa de Empatia", href: "/fll/empathy-map" },
      { label: "Rubrica", href: "/fll/rubric" },
    ],
    tone: "accent",
  },
  {
    icon: HeartHandshake,
    title: "Core Values",
    text: "Trabalho em equipe, descoberta, inclusão e profissionalismo em tudo o que a equipe faz.",
    tools: [
      { label: "Recall", href: "/fll/recall" },
      { label: "Rubrica", href: "/fll/rubric" },
    ],
    tone: "primary",
  },
];

const tools: {
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
  href: string;
  tone: "primary" | "secondary" | "accent";
}[] = [
  {
    icon: Cuboid,
    tag: "Estratégia",
    title: "QuickBrick Studio",
    description:
      "Desenhe trajetórias no tapete, monte matrizes SWOT e de risco e simule saídas com o Sharks Simulator.",
    href: "/fll/quickbrick",
    tone: "primary",
  },
  {
    icon: Trophy,
    tag: "Pontuação",
    title: "Pontuador",
    description: "Simule missões ou rodadas completas com cronômetro de 2:30, temporada por temporada.",
    href: "/fll/score",
    tone: "accent",
  },
  {
    icon: MessageCircleQuestion,
    tag: "Avaliação",
    title: "Recall",
    description:
      "Perguntas cronometradas de Core Values, Projeto de Inovação e Design do Robô para treinar a sala de avaliação.",
    href: "/fll/recall",
    tone: "secondary",
  },
  {
    icon: NotepadText,
    tag: "Rubricas",
    title: "Rubricas de Avaliação",
    description: "Avalie a equipe com as rubricas da competição e descubra onde estão os pontos de melhoria.",
    href: "/fll/rubric",
    tone: "primary",
  },
  {
    icon: Users,
    tag: "Inovação",
    title: "Mapa de Empatia",
    description: "Entenda o profissional e o público do seu projeto para criar soluções mais certeiras.",
    href: "/fll/empathy-map",
    tone: "secondary",
  },
  {
    icon: Clock,
    tag: "Tempo",
    title: "Timers",
    description: "Round do Robô, Sala de Avaliação e timer ajustável, com alertas sonoros e visuais.",
    href: "/fll/timers",
    tone: "accent",
  },
  {
    icon: MonitorDot,
    tag: "Simulação",
    title: "Partiu Mesa!",
    description: "Simulador simples para testar saídas e analisar o desempenho do robô durante o teste.",
    href: "/fll/partiu-mesa",
    tone: "primary",
  },
  {
    icon: Activity,
    tag: "Telemetria",
    title: "Anatix",
    description:
      "Veja sensores, giro, estados e tempos do robô LEGO em tempo real, com Pybricks, por Bluetooth ou cabo USB.",
    href: "/fll/anatix",
    tone: "accent",
  },
  {
    icon: ListCheck,
    tag: "Checklist",
    title: "Confia, mas confira!",
    description: "Checklist de itens para a preparação antes do torneio e para a avaliação depois do evento.",
    href: "/fll/cheklist",
    tone: "secondary",
  },
];

const resources: { icon: LucideIcon; title: string; text: string; href: string; tone: Tone }[] = [
  { icon: School, title: "Iniciantes da Challenge", text: "Primeiros passos para equipes que vão estrear na FLL Challenge.", href: "/fll/begins", tone: "primary" },
  { icon: Telescope, title: "Iniciantes da Explore", text: "Um guia para as equipes mais novas da FLL Explore.", href: "/fll/explore", tone: "accent" },
  { icon: BookOpen, title: "Documentações", text: "Regras e documentos das temporadas da liga, reunidos em um só lugar.", href: "/fll/docs", tone: "secondary" },
  { icon: BookCopy, title: "Guia de Missões", text: "As missões da FLL Challenge explicadas uma a uma.", href: "/fll/docs/missions-guide", tone: "primary" },
];

/** Modelos da BIOGLOW Future Edition (PNG com fundo transparente). */
const feModels = [
  { src: asset("/images/missions/bioglow-fe/thumb-mission-04.png"), className: "left-[2%] top-[30%] w-[40%] -rotate-6" },
  { src: asset("/images/missions/bioglow-fe/thumb-mission-03.png"), className: "right-[2%] top-[14%] z-10 w-[58%]" },
];

/* =============================================================== PÁGINA */

export default async function FLLHome() {
  const news = await getLatestNews(3, "FLL");

  return (
    <main className="mt-16 overflow-x-clip bg-base-100 text-base-content">
      <Hero />
      <AboutSection />
      <JudgedAreasSection />
      <FLLHighlightSeason />
      <ToolsSection />
      <SeasonsSection />
      <ResourcesSection />
      <FutureEditionSection />
      <NewsSection news={news} kicker="/ NOVIDADES" title="O que há de novo" highlight="na FLL." />
      <FinalCta />
    </main>
  );
}

/* ============================================================ SOBRE A FLL */

function AboutSection() {
  return (
    <Section tone="glow">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.05fr] [&>*]:min-w-0">
        <Reveal effect="pop" className="relative">
          <StageImage
            src={asset("/images/competitions/fll/fll_about.jpg")}
            alt="Equipe participando da FIRST LEGO League"
            ratio="4/3"
            frame="card"
            tape
            sizes="(min-width: 1024px) 45vw, 100vw"
            credit="Foto: LEGO® Education / FIRST® LEGO® League"
          />
        </Reveal>

        <Reveal delay={100}>
          <SectionTitle
            kicker="/ SOBRE A FLL"
            title="Robótica, ciência e"
            highlight="trabalho em equipe."
            highlightTone="secondary"
          />
          <p className="mt-6 text-base leading-7 text-base-content/65 sm:text-lg">
            A FIRST LEGO League é uma competição internacional de robótica educacional para crianças e
            adolescentes. As equipes projetam, constroem e programam robôs com peças LEGO e desenvolvem
            soluções para problemas do mundo real.
          </p>

          <dl className="mt-8 grid grid-cols-3 divide-x divide-base-300 border-y border-base-300">
            {facts.map(({ value, label }) => (
              <div key={label} className="px-3 py-4 first:pl-0">
                <dt className="sr-only">{label}</dt>
                <dd className="stage-display text-2xl sm:text-3xl">{value}</dd>
                <dd className="stage-kicker mt-1 text-base-content/50">{label}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink
              href="https://www.firstinspires.org/robotics/fll"
              target="_blank"
              rel="noopener noreferrer"
              tone="outline"
              iconRight={<ArrowUpRight size={17} />}
            >
              Conhecer a competição
            </ButtonLink>
            <ButtonLink href="/roboticar#dados" tone="ghost" shape="rounded" iconLeft={<Globe2 size={17} />}>
              Dados da robótica no Brasil
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ======================================================= ÁREAS AVALIADAS */

/** Faixa azul com bordas de pino LEGO em cima e embaixo. */
function JudgedAreasSection() {
  return (
    <Section tone="secondary" edgeTop="studs" edgeBottom="studs" innerClassName="stage-grid-on-color">
      <div className="relative mx-auto max-w-6xl">
        <Starburst size={72} tone="accent" motion="spin" className="absolute -top-8 right-0 hidden md:inline-grid" />

        <Reveal>
          <div className="max-w-3xl">
            <p className="stage-kicker text-secondary-content/70">/ COMO A EQUIPE É AVALIADA</p>
            <h2 className="stage-display mt-3 text-3xl sm:text-5xl">
              Quatro frentes,{" "}
              <span className="mt-2 inline-block -rotate-1 bg-accent px-3 py-1 italic text-accent-content">
                uma temporada.
              </span>
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-secondary-content/80 sm:text-lg">
              Na FLL Challenge a equipe é avaliada dentro e fora da mesa. Para cada frente, uma ferramenta
              do RoboStage ajuda a se preparar.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {judgedAreas.map(({ icon: Icon, title, text, tools: t, tone }, i) => (
            <Reveal key={title} delay={i * 60} className="h-full">
              <article className="stage-paper group flex h-full flex-col rounded-tl-2xl rounded-br-2xl bg-base-100 p-6 text-base-content shadow-[6px_6px_0_0_var(--stage-shadow)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[9px_9px_0_0_var(--stage-shadow)] motion-reduce:hover:translate-y-0">
                <div className="flex items-start justify-between">
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300",
                      toneSoft[tone],
                    )}
                  >
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  <span className="font-mono text-xs text-base-content/30">0{i + 1}</span>
                </div>
                <h3 className="mt-6 text-lg font-black tracking-tight">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-base-content/60">{text}</p>
                <div className="mt-5 border-t border-dashed border-base-300 pt-4">
                  <p className="stage-kicker text-[10px] text-base-content/40">PREPARE-SE COM</p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    {t.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className={cn(
                          "inline-flex items-center gap-1 text-sm font-bold transition-colors hover:underline",
                          toneText[tone],
                        )}
                      >
                        {l.label}
                        <ArrowRight size={13} />
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* =========================================================== FERRAMENTAS */

function ToolsSection() {
  return (
    <Section id="ferramentas">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle
              kicker="/ FERRAMENTAS DA FLL"
              title="Tudo que uma equipe FLL precisa,"
              highlight="num lugar só."
              description="Planeje missões, acompanhe pontuações, desenvolva o projeto de inovação e prepare-se para o torneio sem alternar entre várias ferramentas."
            />
            <ButtonLink
              href="/dashboard"
              tone="outline"
              iconLeft={<CalendarDays size={16} />}
              iconRight={<ArrowUpRight size={15} />}
              className="font-mono font-medium"
            >
              /dashboard
            </ButtonLink>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(({ icon: Icon, tag, title, description, href, tone }, i) => (
            <Reveal key={title} delay={(i % 3) * 60} className="h-full">
              <FeatureCard
                title={title}
                description={description}
                category={tag}
                icon={<Icon />}
                href={href}
                index={i + 1}
                tone={tone}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ============================================================== RECURSOS */

function ResourcesSection() {
  return (
    <Section>
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
        <Reveal>
          <div className="relative lg:sticky lg:top-28">
            <SectionTitle
              kicker="/ RECURSOS"
              title="Primeira temporada?"
              highlight="Comece por aqui."
              highlightTone="secondary"
              description="Guias e documentos para entender a liga, as missões e o caminho até o torneio."
            />
            <StickerTag tone="accent" rotate={-4} className="mt-8">
              Para iniciantes
            </StickerTag>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {resources.map(({ icon: Icon, title, text, href, tone }, i) => (
            <Reveal key={href} delay={i * 60} className="h-full">
              <Link
                href={href}
                className="stage-paper group flex h-full flex-col rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-base-content/40 hover:shadow-[6px_6px_0_0_var(--stage-shadow)] motion-reduce:hover:translate-y-0"
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-tl-lg rounded-br-lg transition-colors duration-300",
                    toneSoft[tone],
                  )}
                >
                  <Icon size={19} strokeWidth={1.8} />
                </span>
                <h3 className="mt-4 font-bold">{title}</h3>
                <p className="mt-1 flex-1 text-sm leading-6 text-base-content/60">{text}</p>
                <span className="mt-4 inline-flex items-center gap-1 font-mono text-xs text-base-content/50 transition-colors group-hover:text-primary">
                  {href}
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ======================================================== FUTURE EDITION */

/**
 * Faixa noturna com borda de circuito (kits de Computer Science & AI).
 * Só em cima: embaixo vem a NewsSection, que some quando não há notícias,
 * e a borda de baixo bateria na engrenagem do CTA.
 */
function FutureEditionSection() {
  return (
    <Section tone="night" edgeTop="circuit">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_1fr] [&>*]:min-w-0">
        <Reveal>
          <p className="stage-kicker inline-flex items-center gap-2 text-white/55">
            <Cpu size={14} /> FUTURE EDITION
          </p>
          <Image
            src={asset("/images/seasons/fll/bioglow_logo_future_edition.webp")}
            alt="FIRST LEGO League BIOGLOW Future Edition"
            width={1726}
            height={1225}
            sizes="240px"
            className="mt-6 h-auto w-44 drop-shadow-lg sm:w-56"
          />
          <h2 className="stage-display mt-6 max-w-2xl text-3xl leading-tight sm:text-4xl">
            Uma nova geração de possibilidades para a{" "}
            <span className="mt-1 inline-block -rotate-1 bg-[#C8F77A] px-2 italic text-[#20320C]">
              FIRST LEGO League.
            </span>
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
            Conheça a BIOGLOW™ Future Edition, com os novos kits LEGO® Education Computer Science & AI,
            hardware sem fio e uma experiência colaborativa baseada em alianças.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink
              href="/fll/future-edition"
              flat
              iconRight={<ArrowUpRight size={18} />}
              className="border-0 bg-[#C8F77A] text-[#20320C] shadow-[4px_4px_0_0_#ffffff] hover:-translate-y-0.5 hover:bg-[#D8FFA0]"
            >
              Conheça a Future Edition
            </ButtonLink>
            <ButtonLink
              href="/fll/future-edition/score"
              tone="ghost"
              shape="rounded"
              iconRight={<ArrowRight size={18} />}
              className="text-white hover:bg-white/10"
            >
              Pontuador da Future Edition
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal delay={120} effect="pop">
          <div aria-hidden="true" className="relative mx-auto aspect-[5/4] w-full max-w-lg">
            <div className="absolute inset-x-[8%] bottom-[6%] top-[22%] rounded-tl-[3rem] rounded-br-[3rem] border border-[#C8F77A]/25 bg-[#C8F77A]/[0.06]" />
            <Sparkle size={34} color="#C8F77A" motion="float" className="absolute right-[6%] top-[4%] z-20" />
            {feModels.map(({ src, className }) => (
              <div key={src} className={cn("absolute", className)}>
                <Image
                  src={src}
                  alt=""
                  width={649}
                  height={662}
                  sizes="(min-width: 1024px) 260px, 45vw"
                  className="h-auto w-full drop-shadow-[0_18px_24px_rgba(0,0,0,0.45)] transition-transform duration-500 hover:-translate-y-1.5 motion-reduce:hover:translate-y-0"
                />
              </div>
            ))}
            <StickerTag tone="ink" rotate={-6} className="absolute bottom-0 left-[10%] z-20 border-white/30">
              Missões BIOGLOW FE
            </StickerTag>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ============================================================= CTA FINAL */

/** Faixa vermelha com borda de engrenagem só em cima (o rodapé vem logo depois). */
function FinalCta() {
  return (
    <Section tone="primary" edgeTop="gear" innerClassName="stage-grid-on-color relative overflow-hidden">
      <Gear size={220} tone="accent" motion="spin" className="absolute -right-14 -top-10 hidden sm:inline-block" />
      <Starburst size={64} tone="paper" rotate={12} className="absolute bottom-10 right-24 hidden md:inline-grid" />

      <Reveal>
        <div className="relative mx-auto max-w-6xl">
          <Kicker className="text-primary-content/70">SUA PRÓXIMA TEMPORADA</Kicker>
          <h2 className="stage-display mt-4 max-w-3xl text-3xl sm:text-5xl">
            Sua próxima temporada de FLL começa aqui.
          </h2>
          <p className="mt-5 max-w-xl text-primary-content/85">
            Do planejamento ao torneio. Do primeiro teste à classificação. Organize a equipe, acompanhe o
            progresso e evolua durante toda a temporada.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/sign-up" tone="accent" size="lg" iconLeft={<UserPlus size={20} />}>
              Criar conta grátis
            </ButtonLink>
            <ButtonLink
              href="/roboticar#iniciativas"
              tone="ghost"
              size="lg"
              shape="rounded"
              iconRight={<ArrowRight size={18} />}
              className="text-primary-content hover:bg-primary-content/10"
            >
              Iniciativas de outras equipes
            </ButtonLink>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}