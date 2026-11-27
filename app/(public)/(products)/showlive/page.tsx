import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Camera,
  ClipboardCheck,
  ClipboardList,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Palette,
  Puzzle,
  QrCode,
  Radio,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Swords,
  Timer,
  Trophy,
  Tv,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import RevealOnScroll from "@/components/stage/core/RevealOnScroll";
import {
  AnimatedBackground,
  SectionTitle,
  toneClasses,
  type Tone,
} from "@/features/home/components/shared";
import {
  CtaBlock,
  cornerBtn,
} from "@/features/leagues/shared/components/CompetitionSections";
import "@/features/home/components/home.css";

const SHOWLIVE_URL =
  process.env.NEXT_PUBLIC_SHOWLIVE_URL ?? "https://showlive.robostage.com.br";
const JOIN_URL = `${SHOWLIVE_URL}/entrar`;
const ISSUES_URL =
  "https://github.com/ohthias/roboStage/issues/new?title=ShowLive%3A%20sugest%C3%A3o";

/* -------------------------------------------------------------- dados */

const formats: {
  tag: string;
  title: string;
  text: string;
  icon: LucideIcon;
  tone: Tone;
}[] = [
  {
    tag: "FLL",
    title: "FLL Challenge",
    text: "Missões da temporada com o motor do Pontuador e imagem de cada missão na mesa.",
    icon: Trophy,
    tone: "primary",
  },
  {
    tag: "FLL FE",
    title: "FLL Future Edition",
    text: "Itens agrupados por missão e penalidade por cartões, como no regulamento.",
    icon: Sparkles,
    tone: "secondary",
  },
  {
    tag: "OBR",
    title: "OBR Resgate",
    text: "Três arenas, checkpoints e Desafio Surpresa. Ranking pela soma das 2 maiores, desempate pelo tempo.",
    icon: Radio,
    tone: "accent",
  },
  {
    tag: "FTC",
    title: "Alianças",
    text: "Partidas vermelha × azul ou cooperativas, cronograma automático e classificação por RP.",
    icon: Swords,
    tone: "primary",
  },
  {
    tag: "LIVRE",
    title: "Desafio personalizado",
    text: "Monte a súmula do zero: contagens, escolhas, tempo, penalidades e regulamento gerado.",
    icon: Puzzle,
    tone: "secondary",
  },
];

const roles: {
  step: string;
  who: string;
  title: string;
  text: string;
  icon: LucideIcon;
  tone: Tone;
}[] = [
  {
    step: "01",
    who: "Organização",
    title: "Hub do evento",
    text: "Equipes, rodadas, desafio, aprovação de notas, avisos e configurações em um só lugar.",
    icon: LayoutDashboard,
    tone: "primary",
  },
  {
    step: "02",
    who: "Voluntários",
    title: "Mesa do robô",
    text: "Entram com o código da mesa no celular, preenchem a súmula e a pontuação é calculada na hora.",
    icon: Smartphone,
    tone: "secondary",
  },
  {
    step: "03",
    who: "Avaliadores",
    title: "Salas de avaliação",
    text: "Cada sala tem seu código e só vê as próprias sessões. As fichas ficam fora do telão.",
    icon: ClipboardCheck,
    tone: "accent",
  },
  {
    step: "04",
    who: "Público",
    title: "Telão e celular",
    text: "O ranking atualiza sozinho quando uma nota é aprovada. O público acompanha pelo código ou QR code.",
    icon: Tv,
    tone: "primary",
  },
];

const screenFeatures: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Palette,
    title: "Visual do seu evento",
    text: "Cores, fundos, padrões, 4 layouts de tabela, cantos e fontes próprias para títulos e números.",
  },
  {
    icon: Sparkles,
    title: "Animações",
    text: "Reordenação suave, contagem do placar, setas de subida e comemoração com confete. Respeita quem prefere menos movimento.",
  },
  {
    icon: Megaphone,
    title: "Avisos no telão",
    text: "Um aviso por vez, em tom de informação, atenção ou comemoração, com duração opcional.",
  },
  {
    icon: Camera,
    title: "Câmera ao vivo",
    text: "Webcam do computador do telão ou transmissão do YouTube, Twitch ou Vimeo, em janela, lado a lado ou tela cheia.",
  },
];

const judging: string[] = [
  "27 rubricas prontas em 8 grupos: FLL, Future Edition, FTC, feiras, hackathon e mais",
  "Critérios com peso, descrição por nível e comentário obrigatório quando você quiser",
  "Cronograma por sala, status automático e folha de retorno imprimível por equipe",
  "Resultado geral ponderado, com opção de incluir a nota da partida",
];

const security: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: KeyRound,
    title: "Códigos só ao vivo",
    text: "Gerados novos a cada ativação e apagados quando o evento sai do ar.",
  },
  {
    icon: ShieldCheck,
    title: "Um código, um lugar",
    text: "Dois eventos ao mesmo tempo nunca dividem um código, e cada mesa ou sala só acessa o que é seu.",
  },
  {
    icon: ListChecks,
    title: "Notas conferidas",
    text: "Aprove antes do telão, pause envios e deixe a equipe confirmar a súmula.",
  },
];

const tools: {
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
    text: "Treine as rodadas da FLL e da OBR com as mesmas regras do ShowLive.",
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
  { pos: 1, team: "Equipe Alfa", pts: 385, move: "▲" },
  { pos: 2, team: "Equipe Beta", pts: 340, move: "▼" },
  { pos: 3, team: "Equipe Gama", pts: 312, move: "" },
  { pos: 4, team: "Equipe Delta", pts: 275, move: "▲" },
];

/* --------------------------------------------------------------- partes */

function LiveBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-tl-md rounded-br-md border border-success bg-success/15 px-2.5 py-1 font-mono text-[11px] font-bold tracking-[0.15em] text-base-content ${className}`}
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-70 motion-reduce:hidden" />
        <span className="relative size-2 rounded-full bg-success" />
      </span>
      NOVA VERSÃO NO AR
    </span>
  );
}

function ScreenPreview() {
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
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-error opacity-70 motion-reduce:hidden" />
              <span className="relative size-2 rounded-full bg-error" />
            </span>
            AO VIVO · Telão · final regional
          </span>
          <span className="rounded-sm border border-base-300 px-1.5 py-0.5 font-mono text-[10px] tracking-widest text-base-content/50">
            EXEMPLO
          </span>
        </div>

        <div className="flex items-center gap-2 border-b border-base-300 bg-accent/15 px-5 py-2 text-xs font-semibold">
          <Megaphone size={14} className="shrink-0" />
          Intervalo de 10 min antes da rodada 3
        </div>

        <ol className="divide-y divide-base-300" aria-hidden="true">
          {board.map(({ pos, team, pts, move }) => (
            <li key={pos} className="flex items-center gap-4 px-5 py-3.5">
              <span
                className={`grid size-8 place-items-center rounded-tl-md rounded-br-md font-mono text-sm font-bold ${pos === 1 ? "bg-accent text-accent-content" : "bg-base-200"}`}
              >
                {pos}
              </span>
              <span className="flex-1 font-semibold">{team}</span>
              <span
                className={`w-4 text-xs ${move === "▲" ? "text-success" : "text-error"}`}
              >
                {move}
              </span>
              <span className="font-mono text-lg font-bold tabular-nums">
                {pts}
              </span>
            </li>
          ))}
        </ol>

        <div className="flex items-center justify-between gap-4 bg-[#1f1c18] px-5 py-4 font-mono text-[11px] leading-6 text-[#f3ecdc] sm:text-xs">
          <div>
            <p>
              <span className="opacity-60">última nota:</span> Equipe Delta ·{" "}
              <span className="text-[#fabd32]">+275</span>
            </p>
            <p>
              <span className="opacity-60">código público:</span>{" "}
              <span className="tracking-widest text-[#7ad3a0]">FLL2X7</span>
            </p>
          </div>
          <span className="grid size-12 shrink-0 place-items-center rounded-md bg-[#f3ecdc] text-[#1f1c18]">
            <QrCode size={30} />
          </span>
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
              <LiveBadge />
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
                Organize torneios de robótica do começo ao fim: mesas do robô no
                celular, salas de avaliação com rubricas e um telão que se
                atualiza sozinho. FLL, OBR, FTC ou o formato que você inventar.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={SHOWLIVE_URL}
                  className={`btn btn-primary btn-lg ${cornerBtn} shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-base-content)]`}
                >
                  <Radio size={20} />
                  Criar meu evento
                </a>
                <a href={JOIN_URL} className="btn btn-ghost btn-lg">
                  <KeyRound size={18} />
                  Entrar com código
                </a>
              </div>
              <p className="mt-5 font-mono text-xs text-base-content/45">
                Use a mesma conta do RoboStage.{" "}
                <a href="#como-funciona" className="link link-hover">
                  Como funciona
                  <ArrowDown size={12} className="ml-1 inline" />
                </a>
              </p>
            </div>
            <ScreenPreview />
          </div>
        </section>

        {/* ======================================================= FORMATOS */}
        <section className="border-y border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ FORMATOS"
                title="Uma plataforma,"
                highlight="várias ligas."
                highlightClass="bg-secondary text-secondary-content"
                description="Escolha um modelo pronto ou monte o seu desafio. A pontuação segue as regras de cada liga, e o ranking se ajusta ao formato."
              />
            </RevealOnScroll>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {formats.map(({ tag, title, text, icon: Icon, tone }, i) => {
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
                        <span className="font-mono text-[10px] font-bold tracking-[0.15em] text-base-content/45">
                          {tag}
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
          </div>
        </section>

        {/* ================================================= COMO FUNCIONA */}
        <section id="como-funciona" className="scroll-mt-20 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ COMO FUNCIONA"
                title="Cada pessoa,"
                highlight="sua tela."
                description="A organização controla tudo pelo hub. Voluntários, avaliadores e público entram com um código, sem precisar de conta."
              />
            </RevealOnScroll>

            <div className="relative mt-14">
              <div
                aria-hidden="true"
                className="absolute left-[12.5%] right-[12.5%] top-[2.6rem] hidden border-t-2 border-dashed border-base-300 lg:block"
              />
              <ol className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {roles.map(({ step, who, title, text, icon: Icon, tone }, i) => {
                  const c = toneClasses[tone];
                  return (
                    <li key={title}>
                      <RevealOnScroll delay={i * 0.08} className="h-full">
                        <article className="relative flex h-full flex-col rounded-tl-2xl rounded-br-2xl border-2 border-base-300 bg-base-100 p-6">
                          <div className="flex items-center justify-between gap-3">
                            <span
                              className={`relative z-10 grid size-11 place-items-center rounded-tl-xl rounded-br-xl ${c.icon}`}
                            >
                              <Icon size={20} strokeWidth={1.8} />
                            </span>
                            <span className="font-mono text-2xl font-bold text-base-content/15">
                              {step}
                            </span>
                          </div>
                          <p className="mt-6 font-mono text-xs text-base-content/45">
                            {who}
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
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        {/* ========================================================= TELÃO */}
        <section className="border-y border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.2fr] [&>*]:min-w-0">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ TELÃO"
                title="Feito para"
                highlight="a arquibancada."
                highlightClass="bg-accent text-accent-content"
                description="Ajuste o visual no editor, confira na prévia e aplique quando estiver pronto. O público no celular vê a mesma classificação, no mesmo segundo."
              />
            </RevealOnScroll>
            <div className="grid gap-4 sm:grid-cols-2">
              {screenFeatures.map(({ icon: Icon, title, text }, i) => (
                <RevealOnScroll key={title} delay={i * 0.06} className="h-full">
                  <article className="flex h-full flex-col rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5">
                    <span className="grid size-10 place-items-center rounded-tl-lg rounded-br-lg bg-base-200">
                      <Icon size={19} strokeWidth={1.8} />
                    </span>
                    <h3 className="mt-4 font-bold tracking-tight">{title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-base-content/60">
                      {text}
                    </p>
                  </article>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================== AVALIAÇÃO */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <div className="grid items-center gap-10 overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] border border-base-300 bg-base-200/60 p-8 sm:p-12 lg:grid-cols-[1fr_1fr] [&>*]:min-w-0">
                <div>
                  <p className="font-mono text-xs tracking-[0.2em] text-base-content/45">
                    / AVALIAÇÃO POR RUBRICAS
                  </p>
                  <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                    Salas de avaliação{" "}
                    <span className="inline-block -rotate-1 bg-primary px-2 italic text-primary-content">
                      sem papelada.
                    </span>
                  </h3>
                  <p className="mt-5 text-base leading-7 text-base-content/65">
                    Projeto de inovação, design do robô, portfólio, entrevista
                    ou pitch: os avaliadores preenchem as fichas no celular e o
                    resultado fica só com a organização.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {judging.map((t) => (
                      <li key={t} className="flex items-start gap-3 text-sm">
                        <span className="grid size-7 shrink-0 place-items-center rounded-tl-md rounded-br-md bg-success/15 text-success">
                          ✓
                        </span>
                        <span className="pt-1">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <figure
                  aria-hidden="true"
                  className="overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-primary)]"
                >
                  <div className="flex items-center justify-between border-b border-base-300 px-4 py-2.5 font-mono text-[11px] text-base-content/55">
                    <span className="inline-flex items-center gap-2">
                      <ClipboardList size={13} /> Sala 2 · Design do Robô
                    </span>
                    <span className="tracking-widest">EXEMPLO</span>
                  </div>
                  <div className="space-y-4 p-5">
                    {[
                      { c: "Estratégia e planejamento", lvl: 3 },
                      { c: "Programação", lvl: 4 },
                      { c: "Inovação mecânica", lvl: 2 },
                    ].map(({ c, lvl }) => (
                      <div key={c}>
                        <p className="text-sm font-semibold">{c}</p>
                        <div className="mt-2 grid grid-cols-4 gap-1.5">
                          {[1, 2, 3, 4].map((n) => (
                            <span
                              key={n}
                              className={`rounded-tl-md rounded-br-md border py-1.5 text-center font-mono text-xs ${n === lvl ? "border-primary bg-primary text-primary-content" : "border-base-300 text-base-content/45"}`}
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t border-base-300 pt-4 font-mono text-xs">
                      <span className="text-base-content/55">total</span>
                      <span className="text-base font-bold">9 / 12</span>
                    </div>
                  </div>
                </figure>
              </div>
            </RevealOnScroll>

            {/* segurança */}
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {security.map(({ icon: Icon, title, text }, i) => (
                <RevealOnScroll key={title} delay={i * 0.06} className="h-full">
                  <article className="flex h-full items-start gap-4 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-tl-lg rounded-br-lg bg-base-200">
                      <Icon size={19} strokeWidth={1.8} />
                    </span>
                    <span>
                      <span className="block font-bold tracking-tight">
                        {title}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-base-content/60">
                        {text}
                      </span>
                    </span>
                  </article>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================== FERRAMENTAS */}
        <section className="border-t border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ NO DIA DO TORNEIO"
                title="Junto com"
                highlight="o ShowLive."
                highlightClass="bg-secondary text-secondary-content"
                description="Ferramentas do RoboStage que completam o evento, do treino das equipes ao checklist da organização."
              />
            </RevealOnScroll>
            <div className="grid content-center gap-4">
              {tools.map(({ icon: Icon, title, text, href, tone }, i) => {
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
                        <span className="block font-bold">{title}</span>
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
          kicker="SHOWLIVE"
          icon={Users}
          title="Seu próximo torneio começa aqui."
          text="Crie o evento, cadastre as equipes e ative quando for a hora. Os códigos de mesa, sala e telão são gerados na ativação. Tem uma ideia ou achou um problema? Conte para a gente."
          actions={[
            {
              label: "Criar meu evento",
              href: SHOWLIVE_URL,
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