import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Link2, ListChecks, UserPlus, type LucideIcon } from "lucide-react";

import {
  Accordion,
  ButtonLink,
  Callout,
  FeatureCard,
  Flower,
  Gear,
  Kicker,
  Reveal,
  Section,
  SectionTitle,
  Sparkle,
  Starburst,
  StickerTag,
  cn,
  toneSoft,
  toneText,
  type Tone,
} from "@/components/stage";
import type { ToolItem } from "@/features/leagues/shared/components/CompetitionSections";
import GuideChecklist from "./GuideChecklist";

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

const tones: Tone[] = ["primary", "secondary", "accent"];

const hoverShadow: Record<string, string> = {
  primary: "hover:border-primary hover:shadow-[6px_6px_0_0_var(--color-primary)]",
  secondary: "hover:border-secondary hover:shadow-[6px_6px_0_0_var(--color-secondary)]",
  accent: "hover:border-accent hover:shadow-[6px_6px_0_0_var(--color-accent)]",
};

const cardBase =
  "stage-paper group relative flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 transition-[transform,box-shadow,border-color] duration-200 motion-reduce:hover:translate-y-0";

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
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(cardBase, "p-6 hover:-translate-y-1", hoverShadow[tone])}
    >
      <div className="flex items-center justify-between gap-3">
        <span className={cn("grid size-11 place-items-center rounded-tl-xl rounded-br-xl transition-colors duration-300", toneSoft[tone])}>
          <Icon size={20} strokeWidth={1.8} />
        </span>
        {badge && (
          <span className="rounded-tl-md rounded-br-md bg-base-content px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.15em] text-base-100">
            {badge.toUpperCase()}
          </span>
        )}
      </div>
      <h3 className="mt-5 text-lg font-black tracking-tight">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-base-content/60">{text}</p>
      <span className="mt-5 flex items-center justify-between border-t border-dashed border-base-300 pt-4 font-mono text-xs text-base-content/50">
        {new URL(href).hostname.replace(/^www\./, "")}
        <ArrowUpRight size={16} className="transition-transform group-hover:rotate-45 group-hover:text-base-content" />
      </span>
    </a>
  );
}

const featureTones = ["primary", "secondary", "accent", "success", "info"] as const;
type FeatureTone = (typeof featureTones)[number];
const asFeatureTone = (t: string): FeatureTone => ((featureTones as readonly string[]).includes(t) ? (t as FeatureTone) : "primary");

export default function BeginnerGuide({ data }: { data: BeginnerGuideData }) {
  return (
    <main className="overflow-x-clip bg-base-100 text-base-content">
      {/* ============================================================== HERO */}
      <Section tone="glow" innerClassName="pb-16 pt-14 sm:pt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] [&>*]:min-w-0">
          <Reveal>
            <nav aria-label="Trilha" className="stage-kicker text-base-content/45">
              <Link href="/fll" className="hover:text-primary">
                /FLL
              </Link>
              <span> / GUIA {data.program.toUpperCase()}</span>
            </nav>
            <h1 className="stage-display mt-5 text-4xl sm:text-6xl">
              {data.title}{" "}
              <span className="mt-2 inline-block -rotate-1 bg-accent px-3 py-1 italic text-accent-content">{data.highlight}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-base-content/65 sm:text-lg">{data.intro}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink href="#checklist" tone="primary" size="lg" iconLeft={<ListChecks size={20} />}>
                Abrir checklist
              </ButtonLink>
              <ButtonLink href="#faq" tone="ghost" size="lg" shape="rounded" iconRight={<ArrowDown size={18} />}>
                Dúvidas comuns
              </ButtonLink>
            </div>
          </Reveal>

          {/* ficha rápida */}
          <Reveal delay={120} effect="pop" className="relative">
            <Starburst size={76} tone="accent" motion="spin" className="absolute -right-5 -top-7 z-10" />
            <Flower size={48} tone="secondary" motion="float" className="absolute -bottom-6 -left-5 z-10 hidden sm:inline-grid" />
            <div className="stage-paper relative overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-secondary)]">
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
                    <dt className={cn("stage-kicker text-[10px] font-bold", toneText[tones[i % 3]])}>{label.toUpperCase()}</dt>
                    <dd className="text-right">
                      <span className="stage-display block text-xl sm:text-2xl">{value}</span>
                      {detail && <span className="block text-xs text-base-content/55">{detail}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ======================================================== NAVEGAÇÃO */}
      <nav aria-label="Seções do guia" className="sticky top-0 z-20 border-y border-base-300 bg-base-100/90 px-6 py-3 backdrop-blur">
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
      <div className="px-6 pt-10">
        <Callout type="warning" title="Conteúdo não oficial" className="mx-auto max-w-6xl">
          {data.notice}
        </Callout>
      </div>

      {/* ====================================================== VISÃO GERAL */}
      <Section id="visao-geral" className="scroll-mt-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionTitle
              kicker="/ VISÃO GERAL"
              title={data.pillarsTitle.title}
              highlight={data.pillarsTitle.highlight}
              description={data.pillarsTitle.description}
            />
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.pillars.map(({ icon: Icon, title, text, tone }, i) => (
              <Reveal key={title} delay={i * 60} className="h-full">
                <article className={cn(cardBase, "p-6 hover:-translate-y-1", hoverShadow[tone])}>
                  <div className="flex items-center justify-between">
                    <span className={cn("grid size-12 place-items-center rounded-tl-xl rounded-br-xl transition-colors duration-300", toneSoft[tone])}>
                      <Icon size={22} strokeWidth={1.8} />
                    </span>
                    <span className="font-mono text-xs text-base-content/35">/{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-7 text-xl font-black tracking-tight">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-base-content/60">{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* ================================================== PRIMEIROS PASSOS */}
      <Section id="primeiros-passos" tone="muted" edgeTop="studs" className="scroll-mt-32">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-start [&>*]:min-w-0">
          <div>
            <Reveal>
              <SectionTitle
                kicker="/ PRIMEIROS PASSOS"
                title="O que a equipe"
                highlight="precisa ter."
                highlightTone="secondary"
                description="A estrutura mínima para começar a temporada com segurança."
              />
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {data.needs.map(({ title, text }, i) => (
                <Reveal key={title} delay={(i % 2) * 60} className="h-full">
                  <article className="stage-paper flex h-full flex-col rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5">
                    <span className="font-mono text-xs text-base-content/40">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="mt-2 font-black tracking-tight">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-base-content/65">{text}</p>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <Kicker className="mt-14">CONCEITOS ESSENCIAIS</Kicker>
            </Reveal>
            <div className="mt-5 grid gap-4">
              {data.concepts.map(({ icon: Icon, title, text }, i) => (
                <Reveal key={title} delay={i * 60}>
                  <article className="stage-paper group flex gap-4 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5">
                    <span className={cn("grid size-11 shrink-0 place-items-center rounded-tl-xl rounded-br-xl transition-colors", toneSoft[tones[i % 3]])}>
                      <Icon size={20} strokeWidth={1.8} />
                    </span>
                    <div>
                      <h4 className="font-black tracking-tight">{title}</h4>
                      <p className="mt-1.5 text-sm leading-6 text-base-content/65">{text}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>

          <aside className="grid gap-6 lg:sticky lg:top-32">
            <div
              id="checklist"
              className="stage-paper relative scroll-mt-36 rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-6 shadow-[8px_8px_0_0_var(--color-primary)]"
            >
              <StickerTag tone="accent" rotate={4} size="sm" className="absolute -top-3 right-5">
                Salvo aqui
              </StickerTag>
              <Kicker className="text-primary">CHECKLIST INICIAL</Kicker>
              <h3 className="mt-1 text-xl font-black tracking-tight">Um resumo para a primeira fase</h3>
              <div className="mt-5">
                <GuideChecklist items={data.checklist} storageKey={`robostage:guia:${data.slug}`} />
              </div>
            </div>

            <div className="stage-paper rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6">
              <p className="stage-kicker inline-flex items-center gap-2 text-base-content/55">
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
                      className="group flex items-center justify-between gap-3 py-2.5 text-sm font-semibold transition-colors hover:text-primary"
                    >
                      {label}
                      <ArrowUpRight size={15} className="shrink-0 text-base-content/35 transition-transform group-hover:rotate-45 group-hover:text-primary" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Section>

      {/* ========================================================= PREPARAÇÃO */}
      <Section id="preparacao" className="scroll-mt-32">
        <div className="relative mx-auto max-w-6xl">
          <Gear size={70} tone="secondary" motion="spin" className="absolute -top-6 right-0 hidden md:inline-block" />
          <Reveal>
            <SectionTitle
              kicker="/ PREPARAÇÃO"
              title={data.prep.title}
              highlight={data.prep.highlight}
              highlightTone="accent"
              description={data.prep.description}
            />
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {data.prep.items.map(({ title, text }, i) => {
              const tone = tones[i % 3];
              return (
                <Reveal key={title} delay={(i % 2) * 60} className="h-full">
                  <article className={cn(cardBase, "flex-row gap-5 p-6 hover:-translate-y-0.5", hoverShadow[tone])}>
                    <span className={cn("stage-display text-4xl", toneText[tone])}>{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="text-lg font-black tracking-tight">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-base-content/65">{text}</p>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ============================================================ VÍDEOS */}
      <Section id="videos" tone="muted" className="scroll-mt-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionTitle
              kicker="/ VÍDEOS E CANAIS"
              title="Comece pelo que"
              highlight="mais importa."
              description="Uma seleção prática de vídeos e os canais oficiais para acompanhar a operação no Brasil."
            />
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.videos.map((v, i) => (
              <Reveal key={v.title} delay={(i % 4) * 60} className="h-full">
                <ExternalCard icon={v.icon} title={v.title} text={v.text} href={v.href} badge={v.badge} tone={tones[i % 3]} />
              </Reveal>
            ))}
          </div>
          <p className="mt-5 text-xs leading-6 text-base-content/50">{data.videosNote}</p>

          <Reveal>
            <Kicker className="mt-14">CANAIS OFICIAIS BRASILEIROS</Kicker>
          </Reveal>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {data.channels.map((ch, i) => (
              <Reveal key={ch.title} delay={i * 60} className="h-full">
                <ExternalCard icon={ch.icon} title={ch.title} text={ch.text} href={ch.href} tone={tones[(i + 1) % 3]} />
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* ======================================================= NO ROBOSTAGE */}
      <Section id="no-robostage" className="scroll-mt-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionTitle
              kicker="/ NO ROBOSTAGE"
              title="Ferramentas para"
              highlight="a primeira temporada."
              highlightTone="secondary"
              description="Gratuitas e feitas para o dia a dia de quem está começando."
            />
          </Reveal>
          <div className={cn("mt-14 grid gap-5 sm:grid-cols-2", data.tools.length % 3 === 0 ? "lg:grid-cols-3" : "lg:grid-cols-4")}>
            {data.tools.map(({ icon: Icon, tag, title, description, href, tone, status }, i) => (
              <Reveal key={title} delay={(i % 4) * 60} className="h-full">
                <FeatureCard
                  title={title}
                  description={description}
                  category={tag}
                  icon={<Icon />}
                  href={href}
                  index={i + 1}
                  badge={status}
                  tone={asFeatureTone(tone)}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* ================================================================ FAQ */}
      <Section id="faq" tone="muted" className="scroll-mt-32">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
          <Reveal>
            <div className="lg:sticky lg:top-32">
              <SectionTitle kicker="/ FAQ" title="Dúvidas de" highlight="equipes novas." />
              <p className="mt-6 text-sm leading-6 text-base-content/60">
                Respostas diretas para as perguntas mais comuns. Na dúvida, confira sempre os documentos da temporada vigente.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <Accordion
              defaultOpen={0}
              items={data.faq.map(({ q, a }) => ({
                title: q,
                content: <p className="text-sm leading-7 text-base-content/70">{a}</p>,
              }))}
            />
          </Reveal>
        </div>
      </Section>

      {/* ============================================================ CTA */}
      <Section tone="secondary" edgeTop="wave" innerClassName="stage-grid-on-color relative overflow-hidden">
        <Starburst size={120} tone="accent" motion="spin" className="absolute -right-8 -top-8 hidden sm:inline-grid" />
        <Sparkle size={34} tone="paper" motion="float" className="absolute bottom-12 right-24 hidden md:inline-grid" />
        <Reveal>
          <div className="relative mx-auto max-w-6xl">
            <Kicker className="text-secondary-content/70">{data.next.kicker.replace(/^\/\s*/, "")}</Kicker>
            <h2 className="stage-display mt-4 max-w-3xl text-3xl sm:text-5xl">{data.next.title}</h2>
            <p className="mt-5 max-w-xl text-secondary-content/85">{data.next.text}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href={data.next.href} tone="accent" size="lg" iconRight={<ArrowRight size={18} />}>
                {data.next.label}
              </ButtonLink>
              <ButtonLink href="/fll" tone="ghost" size="lg" shape="rounded" className="text-secondary-content hover:bg-secondary-content/10">
                Voltar para a FLL
              </ButtonLink>
              <ButtonLink
                href="/sign-up"
                tone="ghost"
                size="lg"
                shape="rounded"
                iconLeft={<UserPlus size={18} />}
                className="text-secondary-content hover:bg-secondary-content/10"
              >
                Criar conta grátis
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </Section>
    </main>
  );
}
