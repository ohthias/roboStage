import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Clock, Flower2, Hexagon, ShieldAlert, Sparkles, Trophy } from "lucide-react";

import RevealOnScroll from "@/components/UI/RevealOnScroll";
import ArenaExplorer from "@/components/competicoes/FTC/ArenaExplorer";
import { AnimatedBackground, SectionTitle } from "@/components/home/shared";
import { CtaBlock, cornerBtn } from "@/components/competicoes/shared/CompetitionSections";
import { FIELD_COUNTS, MATCH_TIMING, POINTS, RANKING_POINTS, SEASON } from "@/utils/competitions/ftc/biobuzz";
import { KEY_RULES } from "@/utils/competitions/ftc/arena";
import "@/components/home/home.css";

type Params = { params: Promise<{ competicao: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { competicao } = await params;
  if (competicao !== "ftc") return {};
  const description =
    "HIVE, CELLS, FLOWERS, GARDENS, POLLEN e NECTAR: os elementos da arena BIOBUZZ (FTC 2026/2027) e quanto vale cada jogada, em português.";
  return {
    title: { absolute: "Arena BIOBUZZ: elementos e pontuação | FTC | RoboStage" },
    description,
    alternates: { canonical: "/ftc/arena" },
    openGraph: { title: "Arena BIOBUZZ | RoboStage", description, url: "/ftc/arena", type: "article" },
  };
}

const SCORE_ROWS = [
  { item: "LEAVE — sair da parede", auto: POINTS.auto.leave, teleop: null, note: "por robô, avaliado no fim do AUTO" },
  { item: "PARK — no LOADING ZONE", auto: POINTS.auto.park, teleop: POINTS.teleop.park, note: "por robô, no fim do AUTO e no fim da partida" },
  { item: "TIP da HIVE", auto: POINTS.auto.tip, teleop: POINTS.teleop.tip, note: "cada vez que a sua HIVE vira" },
  { item: "POLLEN/NECTAR na CELL de cima", auto: null, teleop: POINTS.teleop.cell, note: "cada elemento, no fim da partida" },
  { item: "Elemento em FLOWER possuída", auto: null, teleop: POINTS.teleop.flower, note: "cada elemento, de quem tiver o NECTAR mais alto" },
  { item: "NECTAR mais baixo em uma FLOWER", auto: null, teleop: POINTS.teleop.bottomNectar, note: "por FLOWER" },
  { item: "POLLEN/NECTAR no seu GARDEN", auto: null, teleop: POINTS.teleop.garden, note: "cada elemento" },
];

const TIPS = [
  {
    icon: Hexagon,
    title: "A HIVE é o motor",
    text: `Cada TIP vale ${POINTS.teleop.tip} pts, conta para os RP POLLINATOR e ainda libera NECTAR para o fim. Um robô que vira a HIVE com regularidade carrega a aliança.`,
  },
  {
    icon: Flower2,
    title: "O último minuto decide",
    text: "Com 1:00 restante o NECTAR entra nas FLOWERS. Quem tem o NECTAR mais alto leva os pontos de tudo que está dentro — inclusive o que o adversário colocou.",
  },
  {
    icon: Sparkles,
    title: "SWARM é ponto fácil",
    text: `LEAVE (3) + PARK no AUTO (5) dos dois robôs já são 16 pts: o RP SWARM sai antes do TELEOP começar.`,
  },
  {
    icon: ShieldAlert,
    title: "Não deixe a HIVE vazia",
    text: "O que fica na CELL de cima no fim vale 2 pts cada. Um último lançamento sem virar a HIVE ainda pontua.",
  },
];

export default async function ArenaPage({ params }: Params) {
  const { competicao } = await params;
  if (competicao !== "ftc") notFound();

  const timeline = [
    { label: "AUTO", time: "0:30", width: MATCH_TIMING.auto, cls: "bg-secondary text-secondary-content" },
    { label: "Troca", time: "0:08", width: MATCH_TIMING.transition, cls: "bg-base-300 text-base-content" },
    { label: "TELEOP", time: "1:00", width: MATCH_TIMING.teleop - MATCH_TIMING.flowerWindow, cls: "bg-primary text-primary-content" },
    { label: "FLOWERS", time: "0:40", width: MATCH_TIMING.flowerWindow - MATCH_TIMING.finalWarning, cls: "bg-accent text-accent-content" },
    { label: "Final", time: "0:20", width: MATCH_TIMING.finalWarning, cls: "bg-error text-error-content" },
  ];
  const timelineTotal = timeline.reduce((s, t) => s + t.width, 0);

  return (
    <main className="overflow-x-clip bg-base-100 text-base-content">
      {/* ============================================================ HERO */}
      <section className="relative isolate overflow-hidden px-6 pb-16 pt-14 sm:pt-20">
        <AnimatedBackground />
        <div className="mx-auto max-w-6xl">
          <nav aria-label="Trilha" className="font-mono text-xs tracking-[0.15em] text-base-content/45">
            <Link href="/ftc" className="hover:text-primary">/FTC</Link> / ARENA
          </nav>
          <h1 className="mt-5 text-5xl font-bold tracking-tight sm:text-7xl">
            Arena {SEASON.name}<span className="text-primary">.</span>
          </h1>
          <p className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="inline-block -rotate-1 bg-accent px-2 text-accent-content">O que tem no campo e quanto vale.</span>
          </p>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-base-content/65 sm:text-lg">
            Duas alianças de duas equipes coletam POLLEN e NECTAR, lançam na própria HIVE para virá-la e, no último
            minuto, disputam as FLOWERS. Aqui está cada elemento da temporada {SEASON.period}, com as regras que mais
            aparecem nas partidas.
          </p>

          <dl className="mt-10 grid max-w-3xl grid-cols-2 divide-base-300 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 sm:grid-cols-4 sm:divide-x">
            {[
              [String(FIELD_COUNTS.pollen), "POLLEN por partida"],
              [`${FIELD_COUNTS.nectarPerAlliance}+${FIELD_COUNTS.nectarPerAlliance}`, "NECTAR vermelho e azul"],
              [String(FIELD_COUNTS.flowers), "FLOWERS na parede"],
              ["2:38", "de partida"],
            ].map(([v, l]) => (
              <div key={l} className="px-4 py-4">
                <dd className="font-mono text-2xl font-bold tabular-nums">{v}</dd>
                <dt className="mt-1 text-xs text-base-content/55">{l}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ======================================================= LINHA DO TEMPO */}
      <section className="border-y border-base-300 bg-base-200/40 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <p className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-base-content/45">
              <Clock size={14} /> / UMA PARTIDA
            </p>
            <div className="mt-5 flex h-20 overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300">
              {timeline.map((t) => (
                <div
                  key={t.label}
                  className={`flex min-w-0 flex-col justify-center px-2 sm:px-3 ${t.cls}`}
                  style={{ width: `${(t.width / timelineTotal) * 100}%` }}
                >
                  <span className="truncate text-[10px] font-bold uppercase tracking-wider sm:text-xs">{t.label}</span>
                  <span className="font-mono text-sm font-bold sm:text-lg">{t.time}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-4 text-sm leading-6 text-base-content/65 md:grid-cols-3">
              <p><strong className="text-base-content">AUTO (0:30):</strong> robôs sozinhos, guiados por sensores e pelas AprilTags das CELLS. LEAVE, PARK e os primeiros TIPs.</p>
              <p><strong className="text-base-content">TELEOP (2:00):</strong> ciclos de coleta e lançamento na HIVE. Cada TIP libera 1 NECTAR da ALLIANCE AREA.</p>
              <p><strong className="text-base-content">Com 1:00 restante:</strong> NECTAR liberado nas FLOWERS e todo NECTAR pode entrar em campo. Aviso de 0:20 para o PARK.</p>
            </div>
            <Link href="/ftc/timers/match" className="mt-6 inline-flex items-center gap-2 text-sm font-bold hover:text-primary">
              Treinar com o cronômetro da partida <ArrowRight size={15} />
            </Link>
          </RevealOnScroll>
        </div>
      </section>

      {/* ========================================================= EXPLORADOR */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <SectionTitle
              kicker="/ ELEMENTOS DA ARENA"
              title="Toque e"
              highlight="descubra cada peça."
              description="Estruturas, zonas e elementos de jogo: o que cada um faz, onde começa a partida, como pontuar e quais regras cuidar."
            />
          </RevealOnScroll>
          <div className="mt-12">
            <ArenaExplorer />
          </div>
        </div>
      </section>

      {/* ========================================================== PONTUAÇÃO */}
      <section id="pontuacao" className="scroll-mt-20 border-t border-base-300 bg-base-200/40 px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
          <RevealOnScroll>
            <SectionTitle kicker="/ TABELA DE PONTOS" title="Quanto vale" highlight="cada jogada." highlightClass="bg-secondary text-secondary-content" />
            <div className="mt-10 overflow-x-auto rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100">
              <table className="table">
                <thead>
                  <tr className="font-mono text-[11px] uppercase tracking-wider">
                    <th>Jogada</th>
                    <th className="text-right">AUTO</th>
                    <th className="text-right">TELEOP</th>
                  </tr>
                </thead>
                <tbody>
                  {SCORE_ROWS.map((r) => (
                    <tr key={r.item}>
                      <td>
                        <p className="font-semibold">{r.item}</p>
                        <p className="text-xs text-base-content/50">{r.note}</p>
                      </td>
                      <td className="text-right font-mono font-bold tabular-nums">{r.auto ?? "—"}</td>
                      <td className="text-right font-mono font-bold tabular-nums">{r.teleop ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-base-content/45">
              Fonte: Competition Manual {SEASON.name}, tabela 10-2. Confira os Team Updates antes de cada evento.
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={0.1} className="space-y-5">
            <div className="rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6">
              <p className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.18em] text-primary">
                <Trophy size={13} /> RANKING POINTS
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex justify-between gap-3"><span>Vitória</span><b className="font-mono">{RANKING_POINTS.win} RP</b></li>
                <li className="flex justify-between gap-3"><span>Empate</span><b className="font-mono">{RANKING_POINTS.tie} RP</b></li>
                <li className="flex justify-between gap-3"><span>SWARM · LEAVE + PARK ≥ {RANKING_POINTS.swarmThreshold} pts</span><b className="font-mono">+1 RP</b></li>
                <li className="flex justify-between gap-3"><span>POLLINATOR 1 · ≥ {RANKING_POINTS.pollinator1Tips} TIPs</span><b className="font-mono">+1 RP</b></li>
                <li className="flex justify-between gap-3"><span>POLLINATOR 2 · ≥ {RANKING_POINTS.pollinator2Tips} TIPs</span><b className="font-mono">+1 RP</b></li>
              </ul>
              <p className="mt-4 text-xs leading-5 text-base-content/50">
                Limites de eventos comuns. Premier Events e campeonatos regionais podem usar outros valores.
              </p>
            </div>
            <div className="rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6">
              <p className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.18em] text-secondary">
                <ShieldAlert size={13} /> FALTAS
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex justify-between gap-3"><span>MINOR FOUL</span><b className="font-mono">+{POINTS.foul.minor} p/ adversário</b></li>
                <li className="flex justify-between gap-3"><span>MAJOR FOUL</span><b className="font-mono">+{POINTS.foul.major} p/ adversário</b></li>
              </ul>
              <p className="mt-4 text-xs leading-5 text-base-content/50">
                Na qualificação, os empates no ranking são decididos por média de pontos sem faltas, média de TIPs e média do AUTO.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ========================================================== REGRAS */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <SectionTitle kicker="/ REGRAS QUE MAIS APARECEM" title="Antes de entrar" highlight="na fila." highlightClass="bg-accent text-accent-content" />
          </RevealOnScroll>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {KEY_RULES.map((r, i) => (
              <RevealOnScroll key={r.code} delay={(i % 4) * 0.05} className="h-full">
                <a
                  href={`https://ftc.game/cm-html#${r.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <span className="font-mono text-xs font-bold text-primary">{r.code}</span>
                  <h3 className="mt-2 font-bold">{r.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-base-content/60">{r.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-base-content/50 group-hover:text-primary">
                    Ler no manual <ArrowUpRight size={13} />
                  </span>
                </a>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================== DICAS */}
      <section className="border-t border-base-300 bg-base-200/40 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <SectionTitle kicker="/ LEITURA DE JOGO" title="Onde estão" highlight="os pontos." />
          </RevealOnScroll>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {TIPS.map(({ icon: Icon, title, text }, i) => (
              <RevealOnScroll key={title} delay={(i % 2) * 0.06}>
                <article className="flex gap-5 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6">
                  <span className="grid size-12 shrink-0 place-items-center rounded-tl-xl rounded-br-xl bg-primary/10 text-primary">
                    <Icon size={22} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-base-content/65">{text}</p>
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/ftc/estrategia" className={`btn btn-primary ${cornerBtn} shadow-[4px_4px_0_0_var(--color-base-content)]`}>
              Montar a estratégia do TELEOP <ArrowRight size={17} />
            </Link>
            <a href={SEASON.manualHtmlUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              Competition Manual <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
      </section>

      <CtaBlock
        kicker="FTC · BIOBUZZ"
        icon={Hexagon}
        title="Da arena para o plano de jogo."
        text="Use o cronômetro nos treinos, monte a estratégia na fila e acompanhe as outras equipes no scouting."
        actions={[
          { label: "Abrir o scouting", href: "/ftc/scouting", variant: "accent" },
          { label: "Cronômetro da partida", href: "/ftc/timers/match", variant: "ghost" },
          { label: "Documentos", href: "/ftc/docs", variant: "ghost" },
        ]}
      />
    </main>
  );
}
