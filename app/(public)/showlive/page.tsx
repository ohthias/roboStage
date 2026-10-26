import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  CircleDashed,
  CircleDot,
  ClipboardList,
  Construction,
  Eye,
  KeyRound,
  ListChecks,
  Newspaper,
  Radio,
  Settings,
  Timer,
  Trophy,
  Tv,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import {
  AnimatedBackground,
  SectionTitle,
  toneClasses,
  type Tone,
} from "@/components/home/shared";
import {
  CtaBlock,
  cornerBtn,
} from "@/components/competicoes/shared/CompetitionSections";
import "@/components/home/home.css";

const ISSUES_URL =
  "https://github.com/ohthias/roboStage/issues/new?title=ShowLive%3A%20sugest%C3%A3o";

/* -------------------------------------------------------------- dados */

const roadmap: {
  status: string;
  label: string;
  title: string;
  text: string;
  icon: LucideIcon;
  style: string;
}[] = [
  {
    status: "FORA DO AR",
    label: "Versão anterior",
    title: "ShowLive para a FLL Challenge",
    text: "Ranking em tempo real, mesa do robô para os juízes e códigos de acesso para voluntários e visitantes.",
    icon: CircleDashed,
    style: "border-base-300 text-base-content/55",
  },
  {
    status: "EM ANDAMENTO",
    label: "Agora",
    title: "Reformulação",
    text: "Melhorias estruturais, correções de bugs e uma nova experiência para organizadores e espectadores.",
    icon: Construction,
    style: "border-warning bg-warning/10 text-base-content",
  },
  {
    status: "PLANEJADO",
    label: "Próxima versão",
    title: "Eventos do seu jeito",
    text: "Eventos customizados, com regras, critérios e rubricas próprias para diferentes formatos de competição.",
    icon: CircleDot,
    style: "border-secondary/50 text-base-content",
  },
];

const upcoming: {
  icon: LucideIcon;
  title: string;
  text: string;
  tone: Tone;
}[] = [
  {
    icon: Radio,
    title: "Sistema customizado de eventos",
    text: "Crie e configure eventos de acordo com as necessidades da sua competição, definindo sua própria estrutura, etapas, equipes e organização.",
    tone: "primary",
  },
  {
    icon: ClipboardList,
    title: "Regras e rubricas personalizadas",
    text: "Defina regras, critérios de avaliação e rubricas próprias para diferentes formatos de competição, indo além dos modelos tradicionais.",
    tone: "secondary",
  },
];

const previous: {
  icon: LucideIcon;
  title: string;
  text: string;
  tone: Tone;
}[] = [
  {
    icon: Tv,
    title: "Ranking em tempo real",
    text: "Assim que o juiz enviava a nota da mesa, o ranking no telão era atualizado automaticamente.",
    tone: "accent",
  },
  {
    icon: Settings,
    title: "Regras configuráveis",
    text: "Adaptava o sistema a diferentes formatos, como torneios internos ou eventos maiores.",
    tone: "primary",
  },
  {
    icon: KeyRound,
    title: "Códigos de acesso",
    text: "Um código para voluntários e outro para visitantes, cada um com sua visão do evento.",
    tone: "secondary",
  },
  {
    icon: Eye,
    title: "Visualização do evento",
    text: "Equipes, ranking e uma tela de visualização para acompanhar o torneio.",
    tone: "accent",
  },
];

const meanwhile: {
  icon: LucideIcon;
  title: string;
  text: string;
  href: string;
  tone: Tone;
}[] = [
  {
    icon: Timer,
    title: "Timers",
    text: "Round do Robô e Sala de Avaliação com os tempos oficiais, prontos para o telão.",
    href: "/fll/timers",
    tone: "primary",
  },
  {
    icon: Trophy,
    title: "Pontuador",
    text: "Calcule a pontuação das rodadas da FLL e da OBR.",
    href: "/fll/score",
    tone: "secondary",
  },
  {
    icon: ListChecks,
    title: "Confia, mas confira!",
    text: "Checklist para a preparação do evento e para a avaliação depois dele.",
    href: "/fll/cheklist",
    tone: "accent",
  },
];

const board = [
  { pos: 1, team: "Equipe Alfa", pts: 385 },
  { pos: 2, team: "Equipe Beta", pts: 340 },
  { pos: 3, team: "Equipe Gama", pts: 312 },
  { pos: 4, team: "Equipe Delta", pts: 275 },
];

/* --------------------------------------------------------------- partes */

function DevBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-tl-md rounded-br-md border border-warning bg-warning/15 px-2.5 py-1 font-mono text-[11px] font-bold tracking-[0.15em] text-base-content ${className}`}
    >
      <Wrench size={12} />
      EM DESENVOLVIMENTO
    </span>
  );
}

function StatusPanel() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -right-4 -top-4 size-24 rotate-12 rounded-tl-2xl rounded-br-2xl bg-accent"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-5 -left-5 size-20 rounded-full border-2 border-dashed border-secondary/50"
      />
      <div className="relative overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-secondary)]">
        <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
          <span className="inline-flex items-center gap-2 font-mono text-xs text-base-content/60">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-warning opacity-70 motion-reduce:hidden" />
              <span className="relative size-2 rounded-full bg-warning" />
            </span>
            Telão · final regional
          </span>
          <span className="rounded-sm border border-base-300 px-1.5 py-0.5 font-mono text-[10px] tracking-widest text-base-content/50">
            PRÉVIA ILUSTRATIVA
          </span>
        </div>

        <div className="relative">
          <ol
            className="divide-y divide-base-300 opacity-60 blur-[1.5px] grayscale-[40%]"
            aria-hidden="true"
          >
            {board.map(({ pos, team, pts }) => (
              <li key={pos} className="flex items-center gap-4 px-5 py-3.5">
                <span
                  className={`grid size-8 place-items-center rounded-tl-md rounded-br-md font-mono text-sm font-bold ${pos === 1 ? "bg-accent text-accent-content" : "bg-base-200"}`}
                >
                  {pos}
                </span>
                <span className="flex-1 font-semibold">{team}</span>
                <span className="font-mono text-lg font-bold tabular-nums">
                  {pts}
                </span>
              </li>
            ))}
          </ol>
          <div className="absolute inset-0 grid place-items-center bg-base-100/40">
            <div className="mx-6 rounded-tl-2xl rounded-br-2xl border-2 border-dashed border-warning bg-base-100 px-5 py-4 text-center shadow-lg">
              <Construction className="mx-auto text-warning" size={26} />
              <p className="mt-2 font-bold">Em construção</p>
              <p className="mt-1 text-xs text-base-content/60">
                O ShowLive volta em uma próxima versão.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1f1c18] px-5 py-4 font-mono text-[11px] leading-6 text-[#f3ecdc] sm:text-xs">
          <p>
            <span className="opacity-60">status:</span>{" "}
            <span className="text-[#fabd32]">em desenvolvimento</span>
          </p>
          <p>
            <span className="opacity-60">versão atual:</span>{" "}
            <span className="text-[#ff8a7a]">indisponível</span>
          </p>
          <p>
            <span className="opacity-60">próxima:</span> eventos, regras e
            rubricas personalizadas
          </p>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- página */

export default function ShowLivePage() {
  return (
    <>
      <Navbar />

      <main className="overflow-x-clip bg-base-100 text-base-content">
        {/* =========================================================== HERO */}
        <section className="relative isolate overflow-hidden px-6 pb-20 pt-14 sm:pt-20">
          <AnimatedBackground />
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_1fr] [&>*]:min-w-0">
            <div>
              <DevBadge />
              <h1 className="mt-5 text-5xl font-bold tracking-tight sm:text-7xl">
                Show<span className="text-primary">Live</span>
                <span className="text-primary">.</span>
              </h1>
              <p className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Seu evento,{" "}
                <span className="inline-block -rotate-1 bg-accent px-2 text-accent-content">
                  ao vivo.
                </span>
              </p>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-base-content/65 sm:text-lg">
                O ShowLive está temporariamente fora do ar enquanto preparamos
                uma nova versão da plataforma para transmissões e gestão de
                eventos de robótica.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href="/news"
                  className={`btn btn-primary btn-lg ${cornerBtn} shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-base-content)]`}
                >
                  <Newspaper size={20} />
                  Acompanhar novidades
                </Link>
                <a href="#roadmap" className="btn btn-ghost btn-lg">
                  O que está por vir
                  <ArrowDown size={18} />
                </a>
              </div>
            </div>
            <StatusPanel />
          </div>
        </section>

        {/* ========================================================= AVISO */}
        <section className="px-6 mt-8">
          <div
            role="status"
            className="mx-auto flex max-w-6xl flex-col gap-4 rounded-tl-2xl rounded-br-2xl border-2 border-warning bg-warning/10 p-5 sm:flex-row sm:items-center sm:p-6"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-tl-lg rounded-br-lg bg-warning text-warning-content">
              <Construction size={24} />
            </span>
            <div className="flex-1">
              <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-base-content/60">
                FERRAMENTA EM DESENVOLVIMENTO · INDISPONÍVEL NO MOMENTO
              </p>
              <p className="mt-1.5 text-sm leading-6 text-base-content/80">
                A versão atual não pode ser usada. O ShowLive está passando por
                uma reformulação para receber as novas funcionalidades, e o
                acesso será restabelecido em uma próxima versão. Tudo o que você
                vê nesta página pode mudar até o lançamento.
              </p>
            </div>
            <Link
              href="/news"
              className="btn btn-sm shrink-0 rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none border-base-content/20 bg-base-100"
            >
              Ver notícias
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </section>

        {/* ======================================================= ROADMAP */}
        <section id="roadmap" className="scroll-mt-20 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ STATUS DO PROJETO"
                title="Onde o ShowLive"
                highlight="está agora."
                highlightClass="bg-secondary text-secondary-content"
                description="A versão anterior saiu do ar. A reformulação está em andamento, e a próxima versão traz um sistema mais flexível."
              />
            </RevealOnScroll>

            <div className="relative mt-14">
              <div
                aria-hidden="true"
                className="absolute left-[16.66%] right-[16.66%] top-[2.6rem] hidden border-t-2 border-dashed border-base-300 md:block"
              />
              <ol className="relative grid gap-5 md:grid-cols-3">
                {roadmap.map(
                  ({ status, label, title, text, icon: Icon, style }, i) => (
                    <li key={title}>
                      <RevealOnScroll delay={i * 0.08} className="h-full">
                        <article
                          className={`relative flex h-full flex-col rounded-tl-2xl rounded-br-2xl border-2 bg-base-100 p-6 ${style}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span
                              className={`relative z-10 grid size-11 place-items-center rounded-tl-xl rounded-br-xl ${i === 1 ? "bg-warning text-warning-content" : "bg-base-200"}`}
                            >
                              <Icon
                                size={20}
                                strokeWidth={1.8}
                                className={
                                  i === 1 ? "motion-safe:animate-pulse" : ""
                                }
                              />
                            </span>
                            <span className="font-mono text-[10px] font-bold tracking-[0.15em]">
                              {status}
                            </span>
                          </div>
                          <p className="mt-6 font-mono text-xs text-base-content/45">
                            {label}
                          </p>
                          <h3 className="mt-1 text-xl font-bold tracking-tight">
                            {title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-base-content/65">
                            {text}
                          </p>
                        </article>
                      </RevealOnScroll>
                    </li>
                  ),
                )}
              </ol>
            </div>
          </div>
        </section>

        {/* ===================================================== PRÓXIMAS */}
        <section className="border-y border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionTitle
                  kicker="/ PRÓXIMAS VERSÕES"
                  title="O ShowLive"
                  highlight="está evoluindo."
                  highlightClass="bg-accent text-accent-content"
                  description="O sistema retornará com uma estrutura mais completa para criação, configuração e transmissão de eventos de robótica."
                />
                <DevBadge />
              </div>
            </RevealOnScroll>
            <div className="mt-14 grid gap-5 md:grid-cols-2">
              {upcoming.map(({ icon: Icon, title, text, tone }, i) => {
                const c = toneClasses[tone];
                return (
                  <RevealOnScroll
                    key={title}
                    delay={i * 0.08}
                    className="h-full"
                  >
                    <article
                      className={`group relative flex h-full flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-7 transition-all duration-300 hover:-translate-y-1 ${c.hover}`}
                    >
                      <div
                        aria-hidden="true"
                        className={`pointer-events-none absolute -right-10 -top-10 size-32 rounded-full border border-base-300 transition-transform duration-500 group-hover:scale-125 ${c.ring}`}
                      />
                      <div className="relative flex items-center justify-between">
                        <div
                          className={`flex size-14 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}
                        >
                          <Icon size={24} strokeWidth={1.8} />
                        </div>
                        <span className="rounded-tl-md rounded-br-md border border-dashed border-base-content/30 px-2 py-0.5 font-mono text-[10px] tracking-[0.15em] text-base-content/55">
                          PLANEJADO
                        </span>
                      </div>
                      <h3 className="relative mt-7 text-2xl font-bold tracking-tight">
                        {title}
                      </h3>
                      <p className="relative mt-3 text-sm leading-6 text-base-content/60 sm:text-base sm:leading-7">
                        {text}
                      </p>
                    </article>
                  </RevealOnScroll>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================= VERSÃO ANTERIOR */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ VERSÃO ANTERIOR · FLL CHALLENGE"
                title="O que o ShowLive"
                highlight="já fazia."
                description="A primeira versão foi construída seguindo as regras e dinâmicas oficiais da FIRST LEGO League. Ela está fora do ar, mas mostra a base do que vem por aí."
              />
            </RevealOnScroll>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {previous.map(({ icon: Icon, title, text, tone }, i) => {
                const c = toneClasses[tone];
                return (
                  <RevealOnScroll
                    key={title}
                    delay={i * 0.06}
                    className="h-full"
                  >
                    <article
                      className={`group relative flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 ${c.hover}`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex size-12 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}
                        >
                          <Icon size={22} strokeWidth={1.8} />
                        </div>
                        <span className="font-mono text-[10px] text-base-content/40">
                          v. anterior
                        </span>
                      </div>
                      <h3 className="mt-6 text-lg font-bold tracking-tight">
                        {title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-base-content/60">
                        {text}
                      </p>
                    </article>
                  </RevealOnScroll>
                );
              })}
            </div>

            {/* mesa do robô */}
            <RevealOnScroll>
              <div className="mt-16 grid items-center gap-10 overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] border border-base-300 bg-base-200/60 p-8 sm:p-12 lg:grid-cols-[1fr_1.1fr] [&>*]:min-w-0">
                <div>
                  <p className="font-mono text-xs tracking-[0.2em] text-base-content/45">
                    / MESA DO ROBÔ (ROBOT GAME)
                  </p>
                  <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                    Arbitragem simples e{" "}
                    <span className="inline-block -rotate-1 bg-primary px-2 italic text-primary-content">
                      à prova de erros.
                    </span>
                  </h3>
                  <p className="mt-5 text-base leading-7 text-base-content/65">
                    Os juízes marcavam as missões cumpridas e o sistema
                    calculava a pontuação com base nas regras da temporada.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {[
                      "Validação de regras conflitantes",
                      "Histórico de rounds por time",
                    ].map((t) => (
                      <li key={t} className="flex items-center gap-3 text-sm">
                        <span className="grid size-7 place-items-center rounded-tl-md rounded-br-md bg-success/15 text-success">
                          ✓
                        </span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <figure className="overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-primary)]">
                  <div className="flex items-center justify-between border-b border-base-300 px-4 py-2.5 font-mono text-[11px] text-base-content/55">
                    <span>Mesa do robô · voluntário</span>
                    <span className="tracking-widest">VERSÃO ANTERIOR</span>
                  </div>
                  <video
                    className="block h-auto w-full"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    aria-label="Gravação da tela de arbitragem da versão anterior do ShowLive"
                  >
                    <source
                      src="/images/showLive/Showlive_voluntario.mp4"
                      type="video/mp4"
                    />
                    Seu navegador não suporta o elemento de vídeo.
                  </video>
                </figure>
              </div>
            </RevealOnScroll>

            {/* painel */}
            <RevealOnScroll>
              <figure className="mt-10 overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-secondary)]">
                <div className="flex items-center justify-between border-b border-base-300 px-5 py-3 font-mono text-xs text-base-content/55">
                  <span className="inline-flex items-center gap-2">
                    <Users size={13} /> Painel do organizador
                  </span>
                  <span className="text-[10px] tracking-widest">
                    VERSÃO ANTERIOR · PODE MUDAR
                  </span>
                </div>
                <img
                  src="/images/showLive/ShowLiveDashboard.png"
                  alt="Painel do organizador na versão anterior do ShowLive, com códigos de voluntário e visitante e a lista de equipes"
                  className="block h-auto w-full"
                  loading="lazy"
                />
              </figure>
            </RevealOnScroll>
          </div>
        </section>

        {/* ===================================================== ENQUANTO ISSO */}
        <section className="border-t border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ ENQUANTO ISSO"
                title="Organizando um"
                highlight="evento agora?"
                highlightClass="bg-secondary text-secondary-content"
                description="Estas ferramentas já funcionam e ajudam no dia do torneio, enquanto o ShowLive não volta."
              />
            </RevealOnScroll>
            <div className="grid content-center gap-4">
              {meanwhile.map(({ icon: Icon, title, text, href, tone }, i) => {
                const c = toneClasses[tone];
                return (
                  <RevealOnScroll key={href} delay={i * 0.08}>
                    <Link
                      href={href}
                      className={`group flex items-center gap-4 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5 transition-all duration-300 hover:-translate-y-0.5 ${c.hover}`}
                    >
                      <span
                        className={`flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}
                      >
                        <Icon size={21} strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 font-bold">
                          {title}
                          <span className="rounded bg-success/15 px-1.5 py-0.5 font-mono text-[10px] text-success">
                            DISPONÍVEL
                          </span>
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-base-content/60">
                          {text}
                        </span>
                      </span>
                      <ArrowUpRight
                        size={18}
                        className="shrink-0 text-base-content/35 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </Link>
                  </RevealOnScroll>
                );
              })}
            </div>
          </div>
        </section>

        <CtaBlock
          kicker="EM DESENVOLVIMENTO"
          icon={Construction}
          title="O próximo ShowLive será diferente."
          text="Estamos construindo uma plataforma mais flexível para diferentes formatos de eventos, com ferramentas para criação de regras, rubricas e experiências personalizadas de competição. Tem uma ideia? Conte para a gente."
          actions={[
            {
              label: "Acompanhar atualizações",
              href: "/news",
              variant: "accent",
            },
            { label: "Sugerir no GitHub", href: ISSUES_URL, variant: "ghost" },
          ]}
        />
      </main>

      <Footer />
    </>
  );
}