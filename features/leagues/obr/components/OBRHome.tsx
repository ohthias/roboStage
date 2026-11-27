import { asset } from "@/lib/assets";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Braces,
  Brain,
  Clock,
  Code,
  FlaskConical,
  Gauge,
  Globe2,
  Grid3x3,
  HeartPulse,
  Map,
  MapPin,
  Mountain,
  Palette,
  Play,
  Radar,
  Route,
  ShieldAlert,
  Spline,
  Target,
  Trophy,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import Hero from "@/components/layout/Hero";
import ObrChart from "@/features/institutional/components/roboticar/ObrChart";
import { NewsSection } from "@/features/home/components/HomeSections";
import {
  ButtonLink,
  FeatureCard,
  Gear,
  Kicker,
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
} from "@/components/stage";
import { getLatestNews } from "@/features/institutional/lib/news";

/* ================================================================ DADOS */

const modalities: {
  icon: LucideIcon;
  title: string;
  text: string;
  tone: Tone;
  image?: string;
  isNew?: boolean;
}[] = [
  {
    icon: Target,
    title: "Prática",
    text: "Robôs autônomos percorrem a arena de Resgate, superam obstáculos e identificam vítimas em cenários simulados.",
    tone: "primary",
  },
  {
    icon: Brain,
    title: "Teórica",
    text: "Provas que exploram ciência, matemática, raciocínio lógico e fundamentos da robótica.",
    tone: "secondary",
  },
  {
    icon: Palette,
    title: "Artística",
    text: "A modalidade mais nova da OBR, que une robótica, criatividade e expressão artística.",
    tone: "accent",
    isNew: true,
  },
];

const numbers = [
  { value: "+1 mi", label: "estudantes desde 2007" },
  { value: "198.297", label: "inscrições em 2023" },
  { value: "+3 mil", label: "escolas representadas" },
];

/** LabTest · modo Runs com a rodada da OBR Resgate (ver features/labtest/lib/obr.ts). */
const runsFeatures: { icon: LucideIcon; text: string }[] = [
  { icon: Clock, text: "Mesmo cronômetro e mesma pontuação do Pontuador" },
  { icon: Mountain, text: "Tentativas por perigo (gangorra, rampa, gap…) viram taxa de sucesso" },
  { icon: MapPin, text: "Cada falha guarda o instante e o ladrilho ou checkpoint: mapa de calor" },
  { icon: HeartPulse, text: "Linha do tempo da sala de resgate: entrada, capturas e depósitos" },
];

/** LabTest · CalibraBot com os testes prontos para a OBR (ver features/labtest/lib/obr-presets.ts). */
const calibraPresets: { icon: LucideIcon; title: string; detail: string }[] = [
  { icon: Gauge, title: "Sensores de cor", detail: "leituras, margem entre cores e confusões" },
  { icon: Spline, title: "Seguidor de linha", detail: "Kp, Ki, Kd, oscilação e saídas por curva" },
  { icon: Route, title: "Verde nas interseções", detail: "taxa de acerto em cada tipo de cruzamento" },
  { icon: Mountain, title: "Rampa e gangorra", detail: "inclinação, tempo e se escorregou" },
  { icon: Radar, title: "Detecção de vítimas", detail: "alcance, acertos e falsos positivos" },
];

/** Prévia do mapa de calor: falhas por ladrilho (3 tablados × 9 ladrilhos). Valores ilustrativos. */
const heatmap = [
  [0, 0, 1, 0, 0, 2, 0, 0, 0],
  [0, 3, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 4, 1],
];

const tools: {
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
  href: string;
  tone: "primary" | "secondary" | "accent";
  badge?: string;
}[] = [
  {
    icon: Map,
    tag: "Planejamento",
    title: "Criador de arenas",
    description: "Monte percursos, identifique obstáculos e planeje rotas antes de levar o robô para a pista.",
    href: "/obr/quickbrick/criador-de-arenas",
    tone: "primary",
  },
  {
    icon: Trophy,
    tag: "Pontuação",
    title: "Pontuador",
    description: "Acompanhe a pontuação da arena com multiplicadores e os desafios superados pelo robô.",
    href: "/obr/score",
    tone: "accent",
  },
  {
    icon: FlaskConical,
    tag: "Experimentação",
    title: "LabTest",
    description: "Rodadas da OBR Resgate no modo Runs e testes de sensores e PID no CalibraBot.",
    href: "/labtest",
    tone: "secondary",
    badge: "OBR Resgate",
  },
  {
    icon: Code,
    tag: "Telemetria",
    title: "Anatix",
    description: "Biblioteca aberta para ver distância, sensores, estados e tempos do robô enquanto ele roda.",
    href: "/anatix",
    tone: "primary",
  },
  {
    icon: ShieldAlert,
    tag: "Riscos",
    title: "Matriz de risco",
    description: "Identifique e avalie o que pode comprometer o desempenho do robô na arena.",
    href: "/obr/quickbrick/matriz-de-risco",
    tone: "accent",
  },
  {
    icon: BookOpen,
    tag: "Regras",
    title: "Documentação",
    description: "Manuais e documentos da OBR reunidos para consulta rápida durante os treinos.",
    href: "/obr/docs",
    tone: "secondary",
  },
];

const steps = [
  {
    number: "01",
    icon: Map,
    title: "Entenda a arena",
    description: "Observe o percurso, reconheça os obstáculos e identifique os desafios que o robô precisará superar.",
    detail: "Observe antes de agir",
    href: "/obr/quickbrick/criador-de-arenas",
    link: "Montar arena",
  },
  {
    number: "02",
    icon: Braces,
    title: "Construa a estratégia",
    description: "Defina rotas, organize os movimentos e transforme decisões em uma sequência lógica de instruções.",
    detail: "Planeje e programe",
    href: "/anatix",
    link: "Ver o Anatix",
  },
  {
    number: "03",
    icon: FlaskConical,
    title: "Teste e evolua",
    description: "Registre rodadas no modo Runs, calibre sensores no CalibraBot e compare para descobrir o que funciona.",
    detail: "Aprenda com os dados",
    href: "/labtest",
    link: "Conhecer o LabTest",
  },
];

const anatixCode = [
  "void loop() {",
  "  ANX_UPDATE();",
  "  float dist = lerUltrassom();",
  '  ANX_VALUE("distancia_cm", dist);',
  "  if (dist < 10) {",
  '    ANX_STATE("modo", "desviando");',
  '    ANX_EVENT("obstaculo");',
  "  }",
  "}",
];

/* =============================================================== PÁGINA */

export default async function OBRHome() {
  const news = await getLatestNews(3, "OBR");

  return (
    <main className="mt-16 overflow-x-clip bg-base-100 text-base-content">
      <Hero />
      <AboutSection />
      <NumbersSection />
      <LabTestSection />
      <ToolsSection />
      <AnatixSection />
      <StepsSection />
      <NewsSection news={news} kicker="/ NOVIDADES" title="O que há de novo" highlight="no RoboStage." />
      <FinalCta />
    </main>
  );
}

/* ============================================================ SOBRE A OBR */

function AboutSection() {
  return (
    <Section tone="glow">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.05fr] [&>*]:min-w-0">
        <Reveal effect="pop" className="relative">
          <StageImage
            src={asset("/images/home/banner_hero_obr2.webp")}
            alt="Ilustração de um robô de resgate seguindo a linha na arena da OBR"
            ratio="4/3"
            frame="card"
            tape
            sizes="(min-width: 1024px) 45vw, 100vw"
          />
        </Reveal>

        <Reveal delay={100}>
          <SectionTitle
            kicker="/ SOBRE A OBR"
            title="Ciência e tecnologia"
            highlight="para todo o Brasil."
            description="A Olimpíada Brasileira de Robótica é uma iniciativa pública e gratuita para estudantes de 6 a 19 anos, que aproxima a escola da ciência por meio de desafios de criatividade, lógica e resolução de problemas."
          />
          <dl className="mt-8 grid grid-cols-3 divide-x divide-base-300 border-y border-base-300">
            {numbers.map(({ value, label }) => (
              <div key={label} className="min-w-0 px-3 py-4 first:pl-0">
                <dt className="sr-only">{label}</dt>
                <dd className="stage-display text-xl tabular-nums sm:text-3xl">{value}</dd>
                <dd className="stage-kicker mt-1 text-base-content/50">{label}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink
              href="https://obr.robocup.org.br/"
              target="_blank"
              rel="noopener noreferrer"
              iconRight={<ArrowUpRight size={17} />}
            >
              Conhecer a competição
            </ButtonLink>
            <ButtonLink href="#numeros" tone="ghost" shape="rounded" iconRight={<ArrowRight size={17} />}>
              Ver a evolução
            </ButtonLink>
          </div>
        </Reveal>
      </div>

      <div className="mx-auto mt-20 max-w-6xl">
        <Reveal>
          <Kicker>MODALIDADES</Kicker>
        </Reveal>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {modalities.map(({ icon: Icon, title, text, tone, isNew }, i) => (
            <Reveal key={title} delay={i * 80} className="h-full">
              <article className="stage-paper group relative flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-base-content/40 hover:shadow-[6px_6px_0_0_var(--stage-shadow)] motion-reduce:hover:translate-y-0">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300",
                      toneSoft[tone],
                    )}
                  >
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  {isNew ? (
                    <StickerTag tone="primary" size="sm" rotate={4}>
                      Nova
                    </StickerTag>
                  ) : (
                    <span className="font-mono text-xs text-base-content/35">/{String(i + 1).padStart(2, "0")}</span>
                  )}
                </div>
                <p className={cn("stage-kicker mt-6 text-[10px]", toneText[tone])}>MODALIDADE</p>
                <h3 className="mt-1 text-xl font-black tracking-tight">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-base-content/60">{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* =============================================================== NÚMEROS */

function NumbersSection() {
  return (
    <Section id="numeros" tone="muted">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1.2fr] [&>*]:min-w-0">
        <Reveal>
          <SectionTitle
            kicker="/ A OBR EM NÚMEROS"
            title="De 6.500 para quase"
            highlight="200 mil inscrições."
            highlightTone="secondary"
            description="Desde 2007 a olimpíada cresceu cerca de 30 vezes. A queda de 2020 marca a pandemia, quando a etapa nacional foi virtual; em 2023 as inscrições voltaram para perto do recorde de 2019."
          />
          <ButtonLink
            href="/roboticar#dados"
            tone="outline"
            iconLeft={<Globe2 size={16} />}
            iconRight={<ArrowRight size={15} />}
            className="mt-8"
          >
            Mais dados no Roboticar
          </ButtonLink>
          <p className="mt-4 text-xs text-base-content/45">Fonte: OBR, números por edição (obr.robocup.org.br).</p>
        </Reveal>
        <Reveal delay={100}>
          <ObrChart />
        </Reveal>
      </div>
    </Section>
  );
}

/* ================================================== LABTEST · OBR RESGATE */

/** Faixa azul com bordas de pixel: Runs e CalibraBot para a OBR Resgate. */
function LabTestSection() {
  return (
    <Section tone="secondary" edgeTop="pixel" edgeBottom="pixel" innerClassName="stage-grid-on-color">
      <div className="relative mx-auto max-w-6xl">
        <Gear size={120} tone="accent" motion="spin" className="absolute -right-10 -top-16 hidden md:inline-block" />

        <Reveal>
          <div className="max-w-3xl">
            <StickerTag tone="accent" rotate={-3}>
              Novo para a OBR Resgate
            </StickerTag>
            <p className="stage-kicker mt-5 text-secondary-content/70">/ LABTEST NA OBR</p>
            <h2 className="stage-display mt-3 text-3xl sm:text-5xl">
              Cada rodada vira{" "}
              <span className="mt-2 inline-block -rotate-1 bg-accent px-3 py-1 italic text-accent-content">
                dado de treino.
              </span>
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-secondary-content/80 sm:text-lg">
              No LabTest, a OBR Resgate tem dois caminhos: o modo <strong>Runs</strong>, para registrar a
              rodada inteira na arena, e o <strong>CalibraBot</strong>, com testes prontos para os sensores
              e o controle do robô.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* ------------------------------------------------------- Runs */}
          <Reveal className="h-full">
            <article className="stage-paper flex h-full flex-col overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] bg-base-100 text-base-content shadow-[8px_8px_0_0_var(--stage-shadow)]">
              <div className="relative grid grid-cols-[1fr_auto] items-center gap-4 border-b border-base-300 bg-base-200/60 px-6 pt-6 sm:px-8">
                <div className="pb-6">
                  <p className="stage-kicker flex items-center gap-2 text-secondary">
                    <Play size={14} /> MODO RUNS
                  </p>
                  <h3 className="stage-display mt-2 text-2xl sm:text-3xl">Rodada da OBR Resgate</h3>
                  <p className="mt-2 text-sm leading-6 text-base-content/60">
                    Pontue a rodada como no campeonato e saia com o mapa de onde o robô falha.
                  </p>
                </div>
                <Image
                  src={asset("/images/products/labtest/run_OBR.png")}
                  alt=""
                  width={500}
                  height={500}
                  sizes="160px"
                  className="h-auto w-28 self-end drop-shadow-[0_10px_14px_rgba(0,0,0,0.2)] sm:w-40"
                />
              </div>
              <ul className="flex-1 space-y-3 p-6 pb-5 sm:px-8">
                {runsFeatures.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex gap-3 text-sm leading-6">
                    <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-tl-md rounded-br-md", toneSoft.secondary)}>
                      <Icon size={15} />
                    </span>
                    <span className="text-base-content/75">{text}</span>
                  </li>
                ))}
              </ul>
              <div aria-hidden="true" className="mx-6 mb-6 rounded-tl-xl rounded-br-xl border border-base-300 bg-base-200/50 p-4 sm:mx-8">
                <div className="flex items-center justify-between">
                  <span className="stage-kicker text-base-content/50">MAPA DE FALHAS · 12 RODADAS</span>
                  <span className="font-mono text-[10px] text-base-content/40">gangorra 7/12</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 sm:gap-4">
                  {heatmap.map((board, b) => (
                    <div key={b}>
                      <div className="grid w-16 grid-cols-3 gap-0.5 sm:w-20">
                        {board.map((n, c) => (
                          <span
                            key={c}
                            className="aspect-square rounded-[3px] border border-base-300"
                            style={{
                              backgroundColor: n
                                ? `color-mix(in oklab, var(--color-primary) ${18 + n * 20}%, var(--color-base-100))`
                                : "var(--color-base-100)",
                            }}
                          />
                        ))}
                      </div>
                      <span className="mt-1 block text-center font-mono text-[10px] text-base-content/40">tablado {b + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-dashed border-base-300 px-6 py-4 sm:px-8">
                <Link href="/labtest#modos" className="inline-flex items-center gap-1 text-sm font-bold text-secondary hover:underline">
                  Ver o modo Runs <ArrowRight size={14} />
                </Link>
                <span className="text-xs text-base-content/50">Liga a rodada a uma arena do Criador de Arenas.</span>
              </div>
            </article>
          </Reveal>

          {/* -------------------------------------------------- CalibraBot */}
          <Reveal delay={100} className="h-full">
            <article className="stage-paper flex h-full flex-col overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] bg-base-100 text-base-content shadow-[8px_8px_0_0_var(--stage-shadow)]">
              <div className="border-b border-base-300 bg-base-200/60 p-6 sm:px-8">
                <p className="stage-kicker flex items-center gap-2 text-primary">
                  <Gauge size={14} /> CALIBRABOT
                </p>
                <h3 className="stage-display mt-2 text-2xl sm:text-3xl">5 testes prontos para a OBR</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/60">
                  Meça um componente por vez, repita e compare até achar a configuração mais estável.
                </p>
              </div>
              <ol className="flex-1 divide-y divide-base-300">
                {calibraPresets.map(({ icon: Icon, title, detail }, i) => (
                  <li key={title} className="flex items-center gap-3 px-6 py-3.5 sm:px-8">
                    <span className="w-5 font-mono text-xs text-base-content/35">{String(i + 1).padStart(2, "0")}</span>
                    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-tl-md rounded-br-md", toneSoft.primary)}>
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold">{title}</span>
                      <span className="block text-xs text-base-content/55">{detail}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="border-t border-dashed border-base-300 px-6 py-4 sm:px-8">
                <Link href="/labtest#calibrabot" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                  Ver o CalibraBot <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          </Reveal>
        </div>

        <Reveal delay={150}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonLink href="/labtest" tone="accent" size="lg" iconLeft={<FlaskConical size={19} />}>
              Abrir o LabTest
            </ButtonLink>
            <p className="text-sm text-secondary-content/75">Grátis, com a conta do RoboStage.</p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* =========================================================== FERRAMENTAS */

function ToolsSection() {
  return (
    <Section>
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle
              kicker="/ FERRAMENTAS DA OBR"
              title="Para planejar, programar"
              highlight="e testar."
              highlightTone="accent"
            />
            <ButtonLink
              href="/obr/quickbrick"
              tone="outline"
              iconLeft={<Grid3x3 size={16} />}
              iconRight={<ArrowUpRight size={15} />}
              className="font-mono font-medium"
            >
              /obr/quickbrick
            </ButtonLink>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(({ icon: Icon, tag, title, description, href, tone, badge }, i) => (
            <Reveal key={title} delay={(i % 3) * 60} className="h-full">
              <FeatureCard
                title={title}
                description={description}
                category={tag}
                icon={<Icon />}
                href={href}
                index={i + 1}
                badge={badge}
                tone={tone}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ================================================================ ANATIX */

/** Faixa noturna com borda de circuito: telemetria do robô. */
function AnatixSection() {
  return (
    <Section tone="night" edgeTop="circuit">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.05fr] [&>*]:min-w-0">
        <Reveal>
          <p className="stage-kicker inline-flex items-center gap-2 text-white/55">
            <Code size={14} /> ANATIX
          </p>
          <h2 className="stage-display mt-3 text-3xl sm:text-5xl">
            Seu robô,{" "}
            <span className="mt-2 inline-block -rotate-1 bg-accent px-3 py-1 italic text-accent-content">
              em tempo real.
            </span>
          </h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/70">
            Coloque algumas linhas no código, conecte o cabo USB e veja sensores, decisões e tempos de
            execução enquanto o robô percorre a arena. Biblioteca aberta, para Uno, Nano, Mega, ESP32 e mais.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/anatix" iconLeft={<Code size={18} />}>
              Conhecer o Anatix
            </ButtonLink>
            <ButtonLink
              href="https://github.com/ohthias/Anatix_C"
              target="_blank"
              rel="noopener noreferrer"
              tone="ghost"
              shape="rounded"
              iconRight={<ArrowUpRight size={17} />}
              className="text-white hover:bg-white/10"
            >
              Ver no GitHub
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal delay={100} effect="pop" className="relative">
          <Sparkle size={34} tone="accent" motion="float" className="absolute -left-3 -top-5 z-10" />
          <div className="overflow-hidden rounded-tl-2xl rounded-br-2xl border border-white/10 bg-black/40 shadow-[8px_8px_0_0_var(--color-secondary)]">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="size-2.5 rounded-full bg-primary" />
              <span className="size-2.5 rounded-full bg-accent" />
              <span className="size-2.5 rounded-full bg-success" />
              <span className="ml-3 font-mono text-xs text-white/45">robo_resgate.ino</span>
            </div>
            <pre className="overflow-x-auto py-3 text-sm leading-6">
              {anatixCode.map((line, i) => {
                const anx = line.includes("ANX_");
                return (
                  <code
                    key={i}
                    className={cn("block px-4", anx ? "bg-primary/20 text-white" : "text-white/60")}
                  >
                    <span className="mr-4 inline-block w-4 select-none text-right text-white/25">{i + 1}</span>
                    {line}
                  </code>
                );
              })}
            </pre>
            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-4 py-3 font-mono text-xs">
              <span className="rounded-tl-md rounded-br-md bg-white/10 px-2 py-1 text-white/70">distancia_cm 8.4</span>
              <span className="rounded-tl-md rounded-br-md bg-accent px-2 py-1 text-accent-content">modo desviando</span>
              <span className="rounded-tl-md rounded-br-md bg-primary px-2 py-1 text-primary-content">evento obstaculo</span>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ================================================================ ETAPAS */

function StepsSection() {
  return (
    <Section>
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionTitle
            kicker="/ MÉTODO"
            title="Evolua a"
            highlight="cada tentativa."
            highlightTone="secondary"
            description="Um bom resultado não depende só de acertar. Depende de observar, testar, entender e ajustar."
          />
        </Reveal>

        <div className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-12">
          <div
            aria-hidden="true"
            className="absolute left-0 right-[30%] top-6 hidden border-t-2 border-dashed border-base-300 md:block"
          />
          <Squiggle size={80} tone="primary" className="absolute -top-14 right-0 hidden md:inline-block" />
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

/* ============================================================= CTA FINAL */

/** Faixa amarela com borda em zigue-zague só em cima (o rodapé vem logo depois). */
function FinalCta() {
  return (
    <Section tone="accent" edgeTop="zigzag" innerClassName="relative overflow-hidden">
      <Gear size={200} tone="primary" motion="spin" className="absolute -right-14 -top-10 hidden sm:inline-block" />
      <Starburst size={60} tone="secondary" rotate={12} className="absolute bottom-10 right-28 hidden md:inline-grid" />

      <Reveal>
        <div className="relative mx-auto max-w-6xl">
          <Kicker className="text-accent-content/70">SEU ROBÔ · SUA ESTRATÉGIA</Kicker>
          <h2 className="stage-display mt-4 max-w-3xl text-3xl sm:text-5xl">Seu robô. Sua estratégia. Sua evolução.</h2>
          <p className="mt-5 max-w-xl text-accent-content/85">
            Planeje percursos, estruture estratégias e experimente soluções para transformar cada teste em
            aprendizado na OBR.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/sign-up" size="lg" iconLeft={<UserPlus size={20} />}>
              Criar conta grátis
            </ButtonLink>
            <ButtonLink
              href="/obr/score"
              tone="ghost"
              size="lg"
              shape="rounded"
              iconRight={<ArrowRight size={18} />}
              className="text-accent-content hover:bg-accent-content/10"
            >
              Pontuar uma arena
            </ButtonLink>
            <ButtonLink
              href="/roboticar#iniciativas"
              tone="ghost"
              size="lg"
              shape="rounded"
              iconRight={<ArrowRight size={18} />}
              className="text-accent-content hover:bg-accent-content/10"
            >
              Iniciativas de outras equipes
            </ButtonLink>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}