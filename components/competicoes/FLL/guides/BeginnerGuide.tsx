import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Link2, ListChecks, TriangleAlert, type LucideIcon } from "lucide-react";

import RevealOnScroll from "@/components/UI/RevealOnScroll";
import { AnimatedBackground, SectionTitle, toneClasses, type Tone } from "@/components/home/shared";
import { CtaBlock, ToolGrid, cornerBtn, type ToolItem } from "@/components/competicoes/shared/CompetitionSections";
import GuideChecklist from "./GuideChecklist";
import "@/components/home/home.css";

export type BeginnerGuideData = {
  slug: string;
  program: string; // "FLL Challenge"
  title: string;
  highlight: string;
  intro: string;
  notice: string;
  facts: { label: string; value: string; detail?: string }[];
  pillarsTitle: { title: string; highlight: string; description: string };
  pillars: { icon: LucideIcon; title: string; text: string; tone: Tone }[];
  needs: { title: string; text: string }[];
  concepts: { icon: LucideIcon; title: string; text: string }[];
  prep: { title: string; highlight: string; description: string; items: { title: string; text: string }[] };
  videos: { icon: LucideIcon; title: string; text: string; href: string; badge: string }[];
  videosNote: string;
  channels: { icon: LucideIcon; title: string; text: string; href: string }[];
  checklist: string[];
  links: { label: string; href: string }[];
  tools: ToolItem[];
  faq: { q: string; a: string }[];
  next: { kicker: string; title: string; text: string; href: string; label: string };
};

const jump = [
  { href: "#visao-geral", label: "Visão geral" },
  { href: "#primeiros-passos", label: "Primeiros passos" },
  { href: "#preparacao", label: "Preparação" },
  { href: "#videos", label: "Vídeos" },
  { href: "#no-robostage", label: "No RoboStage" },
  { href: "#faq", label: "FAQ" },
];

function ExternalCard({
  icon: Icon,
  title,
  text,
  href,
  badge,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  href: string;
  badge?: string;
  tone: Tone;
}) {
  const c = toneClasses[tone];
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 ${c.hover}`}
    >
      <div aria-hidden="true" className={`pointer-events-none absolute -right-10 -top-10 size-28 rounded-full border border-base-300 transition-transform duration-500 group-hover:scale-125 ${c.ring}`} />
      <div className="relative flex items-center justify-between gap-3">
        <div className={`flex size-11 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}>
          <Icon size={20} strokeWidth={1.8} />
        </div>
        {badge && (
          <span className="rounded-tl-md rounded-br-md border border-base-300 px-2 py-0.5 font-mono text-[10px] tracking-[0.15em] text-base-content/55">
            {badge.toUpperCase()}
          </span>
        )}
      </div>
      <h3 className="relative mt-5 text-lg font-bold tracking-tight">{title}</h3>
      <p className="relative mt-2 flex-1 text-sm leading-6 text-base-content/60">{text}</p>
      <span className="relative mt-5 flex items-center justify-between border-t border-base-300 pt-4 font-mono text-xs text-base-content/50">
        {new URL(href).hostname.replace(/^www\./, "")}
        <ArrowUpRight size={16} className="text-base-content/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-base-content" />
      </span>
    </a>
  );
}

const tones: Tone[] = ["primary", "secondary", "accent"];

export default function BeginnerGuide({ data }: { data: BeginnerGuideData }) {
  return (
    <main className="overflow-x-clip bg-base-100 text-base-content">
      <section className="relative isolate overflow-hidden px-6 pb-16 pt-14 sm:pt-20">
        <AnimatedBackground />
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] [&>*]:min-w-0">
          <div>
            <nav aria-label="Trilha" className="font-mono text-xs tracking-[0.15em] text-base-content/45">
              <Link href="/fll" className="hover:text-primary">/FLL</Link>
              <span> / GUIA {data.program.toUpperCase()}</span>
            </nav>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
              {data.title}{" "}
              <span className="mt-2 inline-block -rotate-1 bg-accent px-3 py-1 italic text-accent-content">
                {data.highlight}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-base-content/65 sm:text-lg">{data.intro}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#primeiros-passos"
                className={`btn btn-primary btn-lg ${cornerBtn} shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-base-content)]`}
              >
                <ListChecks size={20} />
                Abrir checklist
              </a>
              <a href="#faq" className="btn btn-ghost btn-lg">
                Dúvidas comuns
                <ArrowDown size={18} />
              </a>
            </div>
          </div>

          {/* ficha rápida */}
          <div className="relative">
            <div aria-hidden="true" className="absolute -right-4 -top-4 size-24 rotate-12 rounded-tl-2xl rounded-br-2xl bg-accent" />
            <div aria-hidden="true" className="absolute -bottom-5 -left-5 size-20 rounded-full border-2 border-dashed border-secondary/50" />
            <div className="relative overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-secondary)]">
              <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
                <span className="inline-flex items-center gap-2 font-mono text-xs text-base-content/60">
                  <span className="size-2 rounded-full bg-primary" />
                  Ficha rápida · {data.program}
                </span>
                <span className="font-mono text-[10px] tracking-widest text-base-content/35">GUIA</span>
              </div>
              <dl className="divide-y divide-base-300">
                {data.facts.map(({ label, value, detail }, i) => (
                  <div key={label} className="flex items-baseline justify-between gap-4 px-5 py-4">
                    <dt className={`text-[10px] font-bold tracking-[0.15em] ${toneClasses[tones[i % 3]].tag}`}>
                      {label.toUpperCase()}
                    </dt>
                    <dd className="text-right">
                      <span className="block font-mono text-lg font-bold sm:text-xl">{value}</span>
                      {detail && <span className="block text-xs text-base-content/55">{detail}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== NAVEGAÇÃO */}
      <nav
        aria-label="Seções do guia"
        className="sticky top-0 z-20 border-y border-base-300 bg-base-100/85 px-6 py-3 backdrop-blur"
      >
        <ul className="mx-auto flex max-w-6xl gap-2 overflow-x-auto">
          {jump.map(({ href, label }) => (
            <li key={href} className="shrink-0">
              <a
                href={href}
                className="inline-block rounded-tl-md rounded-br-md border border-base-300 bg-base-100 px-3 py-1 font-mono text-xs text-base-content/70 transition-colors hover:border-base-content hover:bg-base-content hover:text-base-100"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ============================================================ AVISO */}
      <section className="px-6 pt-10">
        <div role="note" className="mx-auto flex max-w-6xl items-start gap-4 rounded-tl-2xl rounded-br-2xl border border-warning/50 bg-warning/10 p-5 sm:p-6">
          <span className="grid size-10 shrink-0 place-items-center rounded-tl-lg rounded-br-lg bg-warning text-warning-content">
            <TriangleAlert size={20} />
          </span>
          <div>
            <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-base-content/60">CONTEÚDO NÃO OFICIAL</p>
            <p className="mt-1.5 text-sm leading-6 text-base-content/75">{data.notice}</p>
          </div>
        </div>
      </section>

      {/* ====================================================== VISÃO GERAL */}
      <section id="visao-geral" className="scroll-mt-32 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <SectionTitle
              kicker="/ VISÃO GERAL"
              title={data.pillarsTitle.title}
              highlight={data.pillarsTitle.highlight}
              description={data.pillarsTitle.description}
            />
          </RevealOnScroll>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.pillars.map(({ icon: Icon, title, text, tone }, i) => {
              const c = toneClasses[tone];
              return (
                <RevealOnScroll key={title} delay={i * 0.06} className="h-full">
                  <article className={`group relative flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 ${c.hover}`}>
                    <div aria-hidden="true" className={`pointer-events-none absolute -right-10 -top-10 size-28 rounded-full border border-base-300 transition-transform duration-500 group-hover:scale-125 ${c.ring}`} />
                    <div className="relative flex items-center justify-between">
                      <div className={`flex size-12 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}>
                        <Icon size={22} strokeWidth={1.8} />
                      </div>
                      <span className="font-mono text-xs text-base-content/35">/{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="relative mt-7 text-xl font-bold tracking-tight">{title}</h3>
                    <p className="relative mt-3 text-sm leading-6 text-base-content/60">{text}</p>
                  </article>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================== PRIMEIROS PASSOS */}
      <section id="primeiros-passos" className="scroll-mt-32 border-y border-base-300 bg-base-200/40 px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-start [&>*]:min-w-0">
          <div>
            <RevealOnScroll>
              <SectionTitle
                kicker="/ PRIMEIROS PASSOS"
                title="O que a equipe"
                highlight="precisa ter."
                highlightClass="bg-secondary text-secondary-content"
                description="A estrutura mínima para começar a temporada com segurança."
              />
            </RevealOnScroll>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {data.needs.map(({ title, text }, i) => (
                <RevealOnScroll key={title} delay={(i % 2) * 0.06} className="h-full">
                  <article className="flex h-full flex-col rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5">
                    <span className="font-mono text-xs text-base-content/40">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="mt-2 font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-base-content/65">{text}</p>
                  </article>
                </RevealOnScroll>
              ))}
            </div>

            <RevealOnScroll>
              <h3 className="mt-14 font-mono text-xs tracking-[0.2em] text-base-content/45">/ CONCEITOS ESSENCIAIS</h3>
            </RevealOnScroll>
            <div className="mt-5 grid gap-4">
              {data.concepts.map(({ icon: Icon, title, text }, i) => (
                <RevealOnScroll key={title} delay={i * 0.06}>
                  <article className="flex gap-4 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5">
                    <span className={`flex size-11 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl ${toneClasses[tones[i % 3]].icon}`}>
                      <Icon size={20} strokeWidth={1.8} />
                    </span>
                    <div>
                      <h4 className="font-bold">{title}</h4>
                      <p className="mt-1.5 text-sm leading-6 text-base-content/65">{text}</p>
                    </div>
                  </article>
                </RevealOnScroll>
              ))}
            </div>
          </div>

          <aside className="grid gap-6 lg:sticky lg:top-32">
            <div id="checklist" className="scroll-mt-32 rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-6 shadow-[8px_8px_0_0_var(--color-primary)]">
              <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-primary">CHECKLIST INICIAL</p>
              <h3 className="mt-1 text-xl font-bold">Um resumo para a primeira fase</h3>
              <div className="mt-5">
                <GuideChecklist items={data.checklist} storageKey={`robostage:guia:${data.slug}`} />
              </div>
            </div>

            <div className="rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6">
              <p className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.18em] text-base-content/55">
                <Link2 size={12} />
                RECURSOS OFICIAIS
              </p>
              <ul className="mt-4 divide-y divide-base-300">
                {data.links.map(({ label, href }) => (
                  <li key={href}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 py-2.5 text-sm font-medium transition-colors hover:text-primary"
                    >
                      {label}
                      <ArrowUpRight size={15} className="shrink-0 text-base-content/35 group-hover:text-primary" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* ========================================================= PREPARAÇÃO */}
      <section id="preparacao" className="scroll-mt-32 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <SectionTitle
              kicker="/ PREPARAÇÃO"
              title={data.prep.title}
              highlight={data.prep.highlight}
              highlightClass="bg-accent text-accent-content"
              description={data.prep.description}
            />
          </RevealOnScroll>
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {data.prep.items.map(({ title, text }, i) => {
              const c = toneClasses[tones[i % 3]];
              return (
                <RevealOnScroll key={title} delay={(i % 2) * 0.06} className="h-full">
                  <article className={`flex h-full gap-5 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-0.5 ${c.hover}`}>
                    <span className={`font-mono text-3xl font-bold ${c.tag}`}>{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="text-lg font-bold">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-base-content/65">{text}</p>
                    </div>
                  </article>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ VÍDEOS */}
      <section id="videos" className="scroll-mt-32 border-y border-base-300 bg-base-200/40 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <SectionTitle
              kicker="/ VÍDEOS E CANAIS"
              title="Comece pelo que"
              highlight="mais importa."
              description="Uma seleção prática de vídeos e os canais oficiais para acompanhar a operação no Brasil."
            />
          </RevealOnScroll>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.videos.map((v, i) => (
              <RevealOnScroll key={v.title} delay={(i % 4) * 0.06} className="h-full">
                <ExternalCard icon={v.icon} title={v.title} text={v.text} href={v.href} badge={v.badge} tone={tones[i % 3]} />
              </RevealOnScroll>
            ))}
          </div>
          <p className="mt-5 text-xs leading-6 text-base-content/50">{data.videosNote}</p>

          <RevealOnScroll>
            <h3 className="mt-14 font-mono text-xs tracking-[0.2em] text-base-content/45">/ CANAIS OFICIAIS BRASILEIROS</h3>
          </RevealOnScroll>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {data.channels.map((ch, i) => (
              <RevealOnScroll key={ch.title} delay={i * 0.06} className="h-full">
                <ExternalCard icon={ch.icon} title={ch.title} text={ch.text} href={ch.href} tone={tones[(i + 1) % 3]} />
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================= NO ROBOSTAGE */}
      <section id="no-robostage" className="scroll-mt-32 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <SectionTitle
              kicker="/ NO ROBOSTAGE"
              title="Ferramentas para"
              highlight="a primeira temporada."
              highlightClass="bg-secondary text-secondary-content"
              description="Gratuitas e feitas para o dia a dia de quem está começando."
            />
          </RevealOnScroll>
          <ToolGrid tools={data.tools} columns={data.tools.length % 3 === 0 ? 3 : 4} />
        </div>
      </section>

      {/* ================================================================ FAQ */}
      <section id="faq" className="scroll-mt-32 border-t border-base-300 bg-base-200/40 px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
          <RevealOnScroll>
            <div className="lg:sticky lg:top-32">
              <SectionTitle kicker="/ FAQ" title="Dúvidas de" highlight="equipes novas." />
              <p className="mt-6 text-sm leading-6 text-base-content/60">
                Respostas diretas para as perguntas mais comuns. Na dúvida,
                confira sempre os documentos da temporada vigente.
              </p>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <div className="space-y-3">
              {data.faq.map(({ q, a }, i) => (
                <div key={q} className="collapse collapse-plus rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100">
                  <input type="radio" name={`faq_${data.slug}`} defaultChecked={i === 0} aria-label={q} />
                  <div className="collapse-title pr-12 font-semibold">{q}</div>
                  <div className="collapse-content text-sm leading-7 text-base-content/70">
                    <p>{a}</p>
                  </div>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <CtaBlock
        kicker={data.next.kicker}
        icon={ArrowRight}
        title={data.next.title}
        text={data.next.text}
        actions={[
          { label: data.next.label, href: data.next.href, variant: "accent" },
          { label: "Voltar para a FLL", href: "/fll", variant: "ghost" },
          { label: "Criar conta grátis", href: "/sign-up", variant: "ghost" },
        ]}
      />
    </main>
  );
}
