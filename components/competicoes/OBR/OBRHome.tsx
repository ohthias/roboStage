import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Braces,
  Brain,
  Code,
  FlaskConical,
  Globe2,
  Grid3x3,
  Map,
  Palette,
  ShieldAlert,
  Target,
  Trophy,
} from "lucide-react";

import Hero from "@/components/Hero";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import ObrChart from "@/components/roboticar/ObrChart";
import {
  AnimatedBackground,
  SectionTitle,
  toneClasses,
  type Tone,
} from "@/components/home/shared";
import { NewsSection } from "@/components/home/HomeSections";
import {
  CtaBlock,
  StepsRow,
  ToolGrid,
  cornerBtn,
  type ToolItem,
} from "@/components/competicoes/shared/CompetitionSections";
import { getLatestNews } from "@/utils/institutional/news";
import "@/components/home/home.css";

/* -------------------------------------------------------------- dados */

const modalities = [
  {
    icon: Target,
    title: "Prática",
    text: "Robôs autônomos percorrem a arena de Resgate, superam obstáculos e identificam vítimas em cenários simulados.",
    tone: "primary" as Tone,
  },
  {
    icon: Brain,
    title: "Teórica",
    text: "Provas que exploram ciência, matemática, raciocínio lógico e fundamentos da robótica.",
    tone: "secondary" as Tone,
  },
  {
    icon: Palette,
    title: "Artística",
    text: "A modalidade mais nova da OBR, que une robótica, criatividade e expressão artística.",
    tone: "accent" as Tone,
    isNew: true,
  },
];

const numbers = [
  { value: "+1 mi", label: "estudantes desde 2007" },
  { value: "198.297", label: "inscrições em 2023" },
  { value: "+3 mil", label: "escolas representadas" },
];

const pillars = [
  {
    icon: Map,
    tag: "ANÁLISE DA ARENA",
    title: "Planeje sua rota",
    description: "Explore a arena, identifique os desafios e organize o percurso antes de executar a estratégia.",
    href: "/obr/quickbrick/criador-de-arenas",
    link: "Criador de arenas",
    tone: "primary" as Tone,
  },
  {
    icon: Braces,
    tag: "DESENVOLVIMENTO",
    title: "Transforme ideias em código",
    description: "Estruture a lógica dos movimentos e acompanhe sensores e estados do robô em tempo real.",
    href: "/anatix",
    link: "Anatix",
    tone: "secondary" as Tone,
  },
  {
    icon: FlaskConical,
    tag: "ANÁLISE DE RESULTADOS",
    title: "Aprenda com cada teste",
    description: "Registre resultados, compare execuções e encontre oportunidades para melhorar o desempenho.",
    href: "/labtest",
    link: "LabTest",
    tone: "accent" as Tone,
  },
];

const tools: ToolItem[] = [
  {
    icon: Map,
    tag: "PLANEJAMENTO",
    title: "Criador de arenas",
    description: "Monte percursos, identifique obstáculos e planeje rotas antes de levar o robô para a pista.",
    href: "/obr/quickbrick/criador-de-arenas",
    tone: "primary",
  },
  {
    icon: Code,
    tag: "TELEMETRIA",
    title: "Anatix",
    description: "Biblioteca aberta para ver distância, sensores, estados e tempos do robô enquanto ele roda.",
    href: "/anatix",
    tone: "secondary",
  },
  {
    icon: FlaskConical,
    tag: "EXPERIMENTAÇÃO",
    title: "LabTest",
    description: "Registre execuções, compare resultados e investigue o comportamento do robô com dados.",
    href: "/labtest",
    tone: "accent",
  },
  {
    icon: Trophy,
    tag: "PONTUAÇÃO",
    title: "Pontuador",
    description: "Acompanhe a pontuação da arena com multiplicadores e os desafios superados pelo robô.",
    href: "/obr/score",
    tone: "primary",
  },
  {
    icon: ShieldAlert,
    tag: "RISCOS",
    title: "Matriz de risco",
    description: "Identifique e avalie o que pode comprometer o desempenho do robô na arena.",
    href: "/obr/quickbrick/matriz-de-risco",
    tone: "secondary",
  },
  {
    icon: BookOpen,
    tag: "REGRAS",
    title: "Documentação",
    description: "Manuais e documentos da OBR reunidos para consulta rápida durante os treinos.",
    href: "/obr/docs",
    tone: "accent",
  },
];

const steps = [
  {
    icon: Map,
    title: "Entenda a arena",
    description: "Observe o percurso, reconheça os obstáculos e identifique os desafios que o robô precisará superar.",
    detail: "Observe antes de agir",
    href: "/obr/quickbrick/criador-de-arenas",
    link: "Montar arena",
  },
  {
    icon: Braces,
    title: "Construa a estratégia",
    description: "Defina rotas, organize os movimentos e transforme decisões em uma sequência lógica de instruções.",
    detail: "Planeje e programe",
    href: "/anatix",
    link: "Ver o Anatix",
  },
  {
    icon: FlaskConical,
    title: "Teste e evolua",
    description: "Execute tentativas, registre evidências e compare os resultados para descobrir o que funciona melhor.",
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

/* --------------------------------------------------------------- página */

export default function OBRHome() {
  const news = getLatestNews(3, "OBR");

  return (
    <main className="mt-16 overflow-x-clip bg-base-100 text-base-content">
      <Hero />

      {/* ========================================================= SOBRE A OBR */}
      <section className="relative isolate overflow-hidden px-6 py-24">
        <AnimatedBackground />
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.05fr] [&>*]:min-w-0">
          <RevealOnScroll>
            <figure className="relative">
              <div aria-hidden="true" className="absolute -right-4 -top-4 size-24 rotate-12 rounded-tl-2xl rounded-br-2xl bg-accent" />
              <div aria-hidden="true" className="absolute -bottom-5 -left-5 size-20 rounded-full border-2 border-dashed border-secondary/50" />
              <img
                src="https://obr.robocup.org.br/wp-content/uploads/2024/03/IMG_7744-scaled.jpg"
                alt="Estudantes participando de uma atividade de robótica"
                className="relative aspect-[4/3] w-full rounded-tl-3xl rounded-br-3xl border border-base-300 object-cover shadow-[8px_8px_0_0_var(--color-secondary)]"
                loading="lazy"
              />
              <figcaption className="mt-4 text-xs text-base-content/50">
                Imagem: Olimpíada Brasileira de Robótica / RoboCup Brasil
              </figcaption>
            </figure>
          </RevealOnScroll>

          <RevealOnScroll delay={0.1}>
            <SectionTitle
              kicker="/ SOBRE A OBR"
              title="Ciência e tecnologia"
              highlight="para todo o Brasil."
              description="A Olimpíada Brasileira de Robótica é uma iniciativa pública e gratuita para estudantes de 6 a 19 anos, que aproxima a escola da ciência por meio de desafios de criatividade, lógica e resolução de problemas."
            />
            <dl className="mt-8 grid grid-cols-3 divide-x divide-base-300 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100">
              {numbers.map(({ value, label }) => (
                <div key={label} className="px-3 py-4 sm:px-5">
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-mono text-lg font-bold tabular-nums sm:text-2xl">{value}</dd>
                  <dd className="mt-1 text-[11px] leading-4 text-base-content/55 sm:text-xs">{label}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://obr.robocup.org.br/"
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn-primary ${cornerBtn} shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5`}
              >
                Conhecer a competição
                <ArrowUpRight size={17} />
              </a>
              <a href="#numeros" className="btn btn-ghost">
                Ver a evolução
                <ArrowRight size={17} />
              </a>
            </div>
          </RevealOnScroll>
        </div>

        <div className="mx-auto mt-20 max-w-6xl">
          <RevealOnScroll>
            <p className="font-mono text-xs tracking-[0.2em] text-base-content/45">/ MODALIDADES</p>
          </RevealOnScroll>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {modalities.map(({ icon: Icon, title, text, tone, isNew }, i) => {
              const c = toneClasses[tone];
              return (
                <RevealOnScroll key={title} delay={i * 0.08} className="h-full">
                  <article className={`group relative flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 ${c.hover}`}>
                    <div aria-hidden="true" className={`pointer-events-none absolute -right-10 -top-10 size-28 rounded-full border border-base-300 transition-transform duration-500 group-hover:scale-125 ${c.ring}`} />
                    <div className="relative flex items-center justify-between">
                      <div className={`flex size-11 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}>
                        <Icon size={20} strokeWidth={1.8} />
                      </div>
                      {isNew ? (
                        <span className="badge badge-primary badge-xs font-mono">NOVA</span>
                      ) : (
                        <span className="font-mono text-xs text-base-content/35">/{String(i + 1).padStart(2, "0")}</span>
                      )}
                    </div>
                    <p className={`relative mt-6 text-[10px] font-bold tracking-[0.18em] ${c.tag}`}>MODALIDADE</p>
                    <h3 className="relative mt-1 text-xl font-bold tracking-tight">{title}</h3>
                    <p className="relative mt-3 text-sm leading-6 text-base-content/60">{text}</p>
                  </article>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================== NÚMEROS */}
      <section id="numeros" className="scroll-mt-20 border-y border-base-300 bg-base-200/40 px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1.2fr] [&>*]:min-w-0">
          <RevealOnScroll>
            <SectionTitle
              kicker="/ A OBR EM NÚMEROS"
              title="De 6.500 para quase"
              highlight="200 mil inscrições."
              highlightClass="bg-secondary text-secondary-content"
              description="Desde 2007 a olimpíada cresceu cerca de 30 vezes. A queda de 2020 marca a pandemia, quando a etapa nacional foi virtual; em 2023 as inscrições voltaram para perto do recorde de 2019."
            />
            <Link
              href="/roboticar#dados"
              className="mt-8 inline-flex items-center gap-2 rounded-tl-lg rounded-br-lg border border-base-300 bg-base-100 px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
            >
              <Globe2 size={16} />
              Mais dados no Roboticar
              <ArrowRight size={15} />
            </Link>
            <p className="mt-4 text-xs text-base-content/45">
              Fonte: OBR, números por edição (obr.robocup.org.br).
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <ObrChart />
          </RevealOnScroll>
        </div>
      </section>

      {/* ============================================================ PILARES */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <SectionTitle
              kicker="/ O ROBOSTAGE NA OBR"
              title="Da ideia à pista,"
              highlight="tudo faz parte do processo."
              description="Um ambiente que conecta planejamento, programação e testes. Menos decisões no improviso, mais estratégia e evidências a cada tentativa."
            />
          </RevealOnScroll>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {pillars.map(({ icon: Icon, tag, title, description, href, link, tone }, i) => {
              const c = toneClasses[tone];
              return (
                <RevealOnScroll key={title} delay={i * 0.08} className="h-full">
                  <Link
                    href={href}
                    className={`group relative flex h-full flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-7 transition-all duration-300 hover:-translate-y-1 ${
                      tone === "primary"
                        ? "hover:shadow-[8px_8px_0_0_var(--color-primary)]"
                        : tone === "secondary"
                          ? "hover:shadow-[8px_8px_0_0_var(--color-secondary)]"
                          : "hover:shadow-[8px_8px_0_0_var(--color-accent)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`flex size-12 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}>
                        <Icon size={22} strokeWidth={1.8} />
                      </div>
                      <span className="font-mono text-xs text-base-content/35">{String(i + 1).padStart(2, "0")} / 03</span>
                    </div>
                    <p className={`mt-8 text-[10px] font-bold tracking-[0.18em] ${c.tag}`}>{tag}</p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight">{title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-6 text-base-content/60">{description}</p>
                    <span className="mt-6 inline-flex items-center gap-2 border-t border-base-300 pt-4 text-sm font-bold">
                      {link}
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================= ANATIX */}
      <section className="px-6 pb-24">
        <RevealOnScroll>
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] border border-base-300 bg-base-200/60 p-8 sm:p-12 lg:grid-cols-[1fr_1.05fr] [&>*]:min-w-0">
            <div aria-hidden="true" className="absolute -right-16 -top-16 size-48 rounded-full border border-secondary/20" />
            <div className="relative">
              <p className="font-mono text-xs tracking-[0.2em] text-base-content/45">/ ANATIX</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Seu robô,{" "}
                <span className="inline-block -rotate-1 bg-accent px-2 text-accent-content">em tempo real.</span>
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-base-content/65">
                Coloque algumas linhas no código, conecte o cabo USB e veja
                sensores, decisões e tempos de execução enquanto o robô percorre
                a arena. Biblioteca aberta, para Uno, Nano, Mega, ESP32 e mais.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/anatix"
                  className={`btn btn-primary ${cornerBtn} shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5`}
                >
                  <Code size={18} />
                  Conhecer o Anatix
                </Link>
                <a
                  href="https://github.com/ohthias/Anatix_C"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                >
                  Ver no GitHub
                  <ArrowUpRight size={17} />
                </a>
              </div>
            </div>
            <div className="mockup-code relative w-full overflow-x-auto rounded-tl-2xl rounded-br-2xl rounded-tr-none rounded-bl-none text-sm shadow-[8px_8px_0_0_var(--color-secondary)]">
              {anatixCode.map((line, i) => (
                <pre
                  key={i}
                  data-prefix={i + 1}
                  className={line.includes("ANX_") ? "bg-primary/25 text-neutral-content" : undefined}
                >
                  <code>{line}</code>
                </pre>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* ======================================================= FERRAMENTAS */}
      <section className="border-t border-base-300 bg-base-200/40 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionTitle
                kicker="/ FERRAMENTAS DA OBR"
                title="Para planejar, programar"
                highlight="e testar."
                highlightClass="bg-accent text-accent-content"
              />
              <Link
                href="/obr/quickbrick"
                className="group inline-flex items-center gap-2 rounded-tl-lg rounded-br-lg border border-base-300 bg-base-100 px-4 py-2 font-mono text-sm transition-colors hover:border-primary hover:text-primary"
              >
                <Grid3x3 size={16} />
                /obr/quickbrick
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
              kicker="/ MÉTODO"
              title="Evolua a"
              highlight="cada tentativa."
              highlightClass="bg-secondary text-secondary-content"
              description="Um bom resultado não depende só de acertar. Depende de observar, testar, entender e ajustar."
            />
          </RevealOnScroll>
          <StepsRow steps={steps} tone="primary" />
        </div>
      </section>

      <NewsSection news={news} kicker="/ NOVIDADES" title="O que há de novo" highlight="no RoboStage." />

      <CtaBlock
        kicker="SEU ROBÔ · SUA ESTRATÉGIA"
        icon={Target}
        title="Seu robô. Sua estratégia. Sua evolução."
        text="Planeje percursos, estruture estratégias e experimente soluções para transformar cada teste em aprendizado na OBR."
        actions={[
          { label: "Criar conta grátis", href: "/sign-up", variant: "accent" },
          { label: "Pontuar uma arena", href: "/obr/score", variant: "ghost" },
          { label: "Iniciativas de outras equipes", href: "/roboticar#iniciativas", variant: "ghost" },
        ]}
      />
    </main>
  );
}
