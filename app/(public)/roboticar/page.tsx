import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  Globe2,
  Lightbulb,
  MapPin,
  Megaphone,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";

import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import ObrChart from "@/components/roboticar/ObrChart";
import InitiativesExplorer from "@/components/roboticar/InitiativesExplorer";
import { AnimatedBackground, SectionTitle, toneClasses } from "@/components/home/shared";
import {
  brazilStats,
  initiatives,
  sources,
  worldStats,
  SUGGEST_URL,
  type Stat,
} from "@/utils/institutional/roboticar";
import "@/components/home/home.css";

export const metadata: Metadata = {
  title: "Roboticar",
  description:
    "Iniciativas de equipes do Brasil e do mundo e os números da robótica educacional brasileira: OBR, FIRST, MNR, CBR, RoboCup e mais.",
};

const cornerBtn = "rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none";
const sourceIndex = Object.fromEntries(sources.map((s, i) => [s.id, i + 1]));

function SourceRef({ id }: { id: string }) {
  const n = sourceIndex[id];
  return (
    <a
      href={`#fonte-${n}`}
      className="ml-1 align-super font-mono text-[10px] text-base-content/45 no-underline hover:text-primary"
      aria-label={`Fonte ${n}`}
    >
      [{n}]
    </a>
  );
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const c = toneClasses[stat.tone];
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 ${c.hover}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-10 -top-10 size-28 rounded-full border border-base-300 transition-transform duration-500 group-hover:scale-125 ${c.ring}`}
      />
      <span className="relative font-mono text-xs text-base-content/35">
        /{String(index + 1).padStart(2, "0")}
      </span>
      <p className="relative mt-4 font-bold tracking-tight">
        <span className="text-4xl tabular-nums">{stat.value}</span>
        {stat.unit && <span className="ml-1.5 text-lg text-base-content/70">{stat.unit}</span>}
      </p>
      <p className={`relative mt-1 text-sm font-bold ${c.tag}`}>{stat.label}</p>
      <p className="relative mt-3 flex-1 text-sm leading-6 text-base-content/60">
        {stat.detail}
        <SourceRef id={stat.source} />
      </p>
    </article>
  );
}

const brasilCount = initiatives.filter((i) => i.region === "brasil").length;
const mundoCount = initiatives.length - brasilCount;

export default function RoboticarPage() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-clip">
        {/* =============================================================== HERO */}
        <section className="relative isolate overflow-hidden px-6 pb-20 pt-16 sm:pt-24">
          <AnimatedBackground />
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_1fr] [&>*]:min-w-0">
            <div>
              <p className="font-mono text-xs tracking-[0.2em] text-base-content/45">
                / COMUNIDADE · DADOS · INICIATIVAS
              </p>
              <h1 className="mt-5 text-5xl font-bold tracking-tight sm:text-7xl">
                Roboticar<span className="text-primary">.</span>
              </h1>
              <p className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Robótica se faz{" "}
                <span className="inline-block -rotate-1 bg-accent px-2 text-accent-content">
                  em rede.
                </span>
              </p>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-base-content/65 sm:text-lg">
                Um espaço para divulgar o que equipes e projetos do Brasil e do
                mundo estão construindo, e para mostrar, com dados, o tamanho da
                robótica educacional brasileira.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="#iniciativas"
                  className={`btn btn-primary btn-lg ${cornerBtn} shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-base-content)]`}
                >
                  <Lightbulb size={20} />
                  Ver iniciativas
                </a>
                <a href="#dados" className="btn btn-ghost btn-lg">
                  Ver os dados
                  <ArrowDown size={18} />
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-2 text-xs">
                <span className="badge badge-outline badge-sm gap-1 font-mono">
                  <MapPin size={11} /> {brasilCount} do Brasil
                </span>
                <span className="badge badge-outline badge-sm gap-1 font-mono">
                  <Globe2 size={11} /> {mundoCount} do mundo
                </span>
                <span className="badge badge-ghost badge-sm">{sources.length} fontes citadas</span>
              </div>
            </div>

            {/* painel de destaques */}
            <div className="relative">
              <div aria-hidden="true" className="absolute -right-4 -top-4 size-24 rotate-12 rounded-tl-2xl rounded-br-2xl bg-accent" />
              <div aria-hidden="true" className="absolute -bottom-5 -left-5 size-20 rounded-full border-2 border-dashed border-secondary/50" />
              <div className="relative overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-secondary)]">
                <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
                  <span className="inline-flex items-center gap-2 font-mono text-xs text-base-content/60">
                    <MapPin size={13} className="text-primary" /> Brasil · em números
                  </span>
                  <a href="#fontes" className="font-mono text-[10px] tracking-widest text-base-content/40 hover:text-primary">
                    FONTES
                  </a>
                </div>
                <dl className="divide-y divide-base-300">
                  {[
                    { k: "OBR desde 2007", v: "+1 milhão", d: "de estudantes", tone: "text-primary" },
                    { k: "FIRST no Brasil desde 2012", v: "+45 mil", d: "estudantes em torneios", tone: "text-secondary" },
                    { k: "RoboCup 2025, Salvador", v: "45 equipes", d: "maior delegação do mundial", tone: "text-primary" },
                  ].map(({ k, v, d, tone }) => (
                    <div key={k} className="flex items-end justify-between gap-4 px-5 py-4">
                      <div>
                        <dt className={`text-[10px] font-bold tracking-[0.15em] ${tone}`}>{k.toUpperCase()}</dt>
                        <dd className="mt-1 text-sm text-base-content/60">{d}</dd>
                      </div>
                      <dd className="font-mono text-2xl font-bold tabular-nums sm:text-3xl">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="bg-[#1f1c18] px-5 py-4 font-mono text-[11px] leading-6 text-[#f3ecdc] sm:text-xs">
                  <p className="opacity-60">$ obr --inscricoes 2007..2023</p>
                  <p>
                    6.500 → 198.297 <span className="text-[#9be15d]">▲ ≈30×</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== DADOS */}
        <section id="dados" className="scroll-mt-20 border-t border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ ROBÓTICA NO BRASIL"
                title="Os números de um país que"
                highlight="compete e cria."
                description="Olimpíadas, torneios, mostras científicas e indústria: um retrato da robótica brasileira a partir de dados oficiais e reportagens."
              />
            </RevealOnScroll>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {brazilStats.map((s, i) => (
                <RevealOnScroll key={s.label} delay={(i % 4) * 0.06} className="h-full">
                  <StatCard stat={s} index={i} />
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ OBR */}
        <section className="px-6 py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1.2fr] [&>*]:min-w-0">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ OLIMPÍADA BRASILEIRA DE ROBÓTICA"
                title="Dezessete edições,"
                highlight="uma curva."
                highlightClass="bg-secondary text-secondary-content"
              />
              <ul className="mt-8 space-y-5">
                <li className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-tl-lg rounded-br-lg bg-secondary/10 text-secondary">
                    <TrendingUp size={18} />
                  </span>
                  <p className="text-sm leading-6 text-base-content/70">
                    <strong className="text-base-content">Recorde em 2019:</strong> 204.952
                    inscrições, mais de 31 vezes a primeira edição.
                    <SourceRef id="obr-invista" />
                  </p>
                </li>
                <li className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-tl-lg rounded-br-lg bg-primary/10 text-primary">
                    <TrendingDown size={18} />
                  </span>
                  <p className="text-sm leading-6 text-base-content/70">
                    <strong className="text-base-content">Pandemia:</strong> em 2020 a etapa
                    nacional foi virtual e as inscrições caíram cerca de 39%, para 125.527.
                    <SourceRef id="obr-invista" />
                  </p>
                </li>
                <li className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-tl-lg rounded-br-lg bg-accent/20 text-[color-mix(in_oklab,var(--color-accent)_55%,var(--color-base-content))]">
                    <Trophy size={18} />
                  </span>
                  <p className="text-sm leading-6 text-base-content/70">
                    <strong className="text-base-content">Retomada:</strong> em 2023 foram
                    198.297 inscrições, cerca de 97% do recorde, com nacional em Salvador.
                    <SourceRef id="obr-invista" />
                  </p>
                </li>
              </ul>
              <p className="mt-8 text-xs leading-5 text-base-content/50">
                A organização publica a série completa até 2023. Os valores de 2007 e
                2008 são aproximados.
              </p>
              <Link
                href="/obr"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold transition-colors hover:text-primary"
              >
                Ferramentas do RoboStage para a OBR
                <ArrowRight size={16} />
              </Link>
            </RevealOnScroll>

            <RevealOnScroll delay={0.1}>
              <ObrChart />
            </RevealOnScroll>
          </div>
        </section>

        {/* ============================================================== MUNDO */}
        <section className="relative isolate overflow-hidden bg-secondary px-6 py-24 text-secondary-content">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(currentColor_1px,transparent_1px)] bg-[size:22px_22px] opacity-[0.08]" />
          <div aria-hidden="true" className="absolute -right-24 -top-24 -z-10 hidden size-72 rounded-full border-[32px] border-accent/90 sm:block" />
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <p className="font-mono text-xs tracking-[0.2em] text-secondary-content/60">/ O BRASIL NO MUNDO</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
                Uma comunidade global, com{" "}
                <span className="mt-2 inline-block -rotate-1 bg-accent px-3 py-1 italic text-accent-content">
                  sotaque brasileiro.
                </span>
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-secondary-content/80 sm:text-lg">
                Em julho de 2025 Salvador sediou a RoboCup, o mundial de robótica e
                inteligência artificial, e o Brasil levou a maior delegação: 45
                equipes.
                <a
                  href={`#fonte-${sourceIndex["robocup-2025"]}`}
                  className="ml-1 align-super font-mono text-[10px] text-secondary-content/60 hover:text-white"
                >
                  [{sourceIndex["robocup-2025"]}]
                </a>
              </p>
            </RevealOnScroll>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {worldStats.map((s, i) => (
                <RevealOnScroll key={s.label} delay={i * 0.08} className="h-full">
                  <article className="flex h-full flex-col rounded-tl-2xl rounded-br-2xl border border-secondary-content/20 bg-secondary-content/10 p-6 backdrop-blur-sm">
                    <p className="font-bold tracking-tight">
                      <span className="text-4xl tabular-nums">{s.value}</span>
                      {s.unit && <span className="ml-1.5 text-lg opacity-80">{s.unit}</span>}
                    </p>
                    <p className="mt-1 text-sm font-bold">{s.label}</p>
                    <p className="mt-3 flex-1 text-sm leading-6 text-secondary-content/75">
                      {s.detail}
                      <a
                        href={`#fonte-${sourceIndex[s.source]}`}
                        className="ml-1 align-super font-mono text-[10px] text-secondary-content/60 hover:text-white"
                      >
                        [{sourceIndex[s.source]}]
                      </a>
                    </p>
                  </article>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================== INICIATIVAS */}
        <section id="iniciativas" className="scroll-mt-20 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionTitle
                  kicker="/ INICIATIVAS"
                  title="Quem está construindo"
                  highlight="junto."
                  description="Sites, ferramentas, guias e comunidades criados por equipes e organizações. Todos os links abrem o site original."
                />
                <a
                  href={SUGGEST_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-tl-lg rounded-br-lg border border-base-300 bg-base-100 px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
                >
                  <Megaphone size={16} />
                  Sugerir iniciativa
                  <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.08}>
              <div className="mt-12">
                <InitiativesExplorer />
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ========================================================= DIVULGUE */}
        <section className="px-6 pb-24">
          <RevealOnScroll>
            <div className="relative mx-auto grid max-w-6xl gap-8 overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] border border-base-300 bg-base-200/60 px-8 py-12 sm:px-12 md:grid-cols-[1.3fr_1fr] md:items-center">
              <div aria-hidden="true" className="absolute -right-16 -top-16 size-48 rounded-full border border-secondary/20" />
              <div className="relative">
                <p className="font-mono text-xs tracking-[0.2em] text-base-content/45">/ SUA EQUIPE AQUI</p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-4xl">
                  Sua equipe criou algo que{" "}
                  <span className="inline-block -rotate-1 bg-primary px-2 italic text-primary-content">
                    ajuda outras?
                  </span>
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-base-content/65">
                  Um site, um simulador, um guia, um canal ou um projeto de
                  inovação aberto. Mande o link e uma descrição curta: a página é
                  atualizada com as sugestões da comunidade.
                </p>
              </div>
              <ol className="relative space-y-3 text-sm">
                {[
                  "Abra uma sugestão no GitHub do RoboStage",
                  "Conte o nome, o link e quem criou",
                  "Diga para quais competições serve",
                ].map((t, i) => (
                  <li key={t} className="flex items-center gap-3 rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 px-4 py-3">
                    <span className="font-mono text-xs font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-base-content/75">{t}</span>
                  </li>
                ))}
                <li>
                  <a
                    href={SUGGEST_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn btn-primary mt-2 w-full ${cornerBtn} shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5`}
                  >
                    <Megaphone size={18} />
                    Divulgar minha iniciativa
                  </a>
                </li>
              </ol>
            </div>
          </RevealOnScroll>
        </section>

        {/* ============================================================ FONTES */}
        <section id="fontes" className="scroll-mt-20 border-t border-base-300 bg-base-200/40 px-6 py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.6fr] [&>*]:min-w-0">
            <div>
              <SectionTitle kicker="/ FONTES" title="De onde vêm" highlight="os dados." />
              <p className="mt-6 flex items-start gap-3 text-sm leading-6 text-base-content/60">
                <BookOpenCheck size={18} className="mt-0.5 shrink-0 text-success" />
                Cada número da página aponta para a fonte original. Encontrou algo
                desatualizado? Avise pelo GitHub.
              </p>
            </div>
            <ol className="space-y-3">
              {sources.map((s, i) => (
                <li key={s.id} id={`fonte-${i + 1}`} className="scroll-mt-24">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 px-4 py-3 transition-colors hover:border-primary/50 target:border-primary"
                  >
                    <span className="font-mono text-xs font-bold text-base-content/45">[{i + 1}]</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold leading-snug group-hover:text-primary">{s.label}</span>
                      <span className="mt-0.5 block text-xs text-base-content/55">
                        {s.publisher} · {s.date}
                      </span>
                    </span>
                    <ArrowUpRight size={15} className="mt-0.5 shrink-0 text-base-content/35" />
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* =========================================================== CTA */}
        <section className="px-6 py-24">
          <RevealOnScroll>
            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] bg-neutral px-8 py-14 text-neutral-content sm:px-14">
              <div aria-hidden="true" className="absolute -bottom-10 right-24 size-24 rotate-12 rounded-tl-2xl rounded-br-2xl bg-primary" />
              <div aria-hidden="true" className="absolute -right-12 -top-12 size-48 rounded-full border-[22px] border-accent/90" />
              <div className="relative max-w-2xl">
                <p className="font-mono text-xs tracking-[0.2em] text-neutral-content/65">/ E A SUA EQUIPE?</p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
                  Faça parte desses números.
                </h2>
                <p className="mt-5 max-w-xl text-neutral-content/80">
                  Treine, pontue e registre a evolução da equipe com as ferramentas
                  do RoboStage para FLL e OBR.
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Link
                    href="/fll"
                    className={`btn btn-primary btn-lg ${cornerBtn} shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5`}
                  >
                    Começar na FLL
                  </Link>
                  <Link
                    href="/obr"
                    className={`btn btn-secondary btn-lg ${cornerBtn} shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5`}
                  >
                    Começar na OBR
                  </Link>
                  <Link href="/news" className="btn btn-ghost btn-lg text-neutral-content hover:bg-neutral-content/10">
                    Notícias
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>
      </main>
      <Footer />
    </>
  );
}
