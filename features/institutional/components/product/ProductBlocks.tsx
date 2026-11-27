import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Check, type LucideIcon } from "lucide-react";
import {
  Accordion,
  ButtonLink,
  Card,
  Cover,
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
  type CoverPattern,
  type Tone,
} from "@/components/stage";

/* ------------------------------------------------------------------ */
/*  Blocos repetidos nas páginas de produto (LabTest, Stagebook,       */
/*  Equipes), todos montados com a Stage UI.                           */
/* ------------------------------------------------------------------ */

export type CycleStep = { icon: LucideIcon; title: string; text: string; tone: Tone };

/** Ciclo em 4 etapas com linha tracejada ligando os ícones. */
export function CycleSteps({ steps, className }: { steps: CycleStep[]; className?: string }) {
  return (
    <ol className={cn("relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4", className)}>
      <span
        aria-hidden
        className="absolute left-[12.5%] right-[12.5%] top-[2.9rem] hidden border-t-2 border-dashed border-base-300 lg:block"
      />
      {steps.map(({ icon: Icon, title, text, tone }, i) => (
        <li key={title} className="h-full">
          <Reveal delay={i * 70} className="h-full">
            <Card
              corner
              className="group flex h-full flex-col border border-base-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--stage-shadow)]"
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "relative z-10 grid size-12 place-items-center rounded-tl-xl rounded-br-xl transition-colors duration-300",
                    toneSoft[tone],
                  )}
                >
                  <Icon size={22} strokeWidth={1.8} />
                </span>
                <Kicker className="text-base-content/40">ETAPA {String(i + 1).padStart(2, "0")}</Kicker>
              </div>
              <h3 className="stage-display mt-6 text-2xl">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-base-content/60">{text}</p>
            </Card>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

/** FAQ: título fixo à esquerda e acordeão da Stage UI à direita. */
export function FaqBlock({
  kicker = "/ FAQ",
  title,
  highlight,
  description,
  items,
}: {
  kicker?: string;
  title: string;
  highlight: string;
  description?: string;
  items: { q: string; a: ReactNode }[];
}) {
  return (
    <Section tone="muted" className="[&>div]:border-b-0">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <SectionTitle kicker={kicker} title={title} highlight={highlight} />
            {description && <p className="mt-6 text-sm leading-6 text-base-content/60">{description}</p>}
          </div>
        </Reveal>
        <Reveal delay={100}>
          <Accordion items={items.map(({ q, a }) => ({ title: q, content: a }))} defaultOpen={0} />
        </Reveal>
      </div>
    </Section>
  );
}

/** CTA final: faixa colorida com grade, stickers e até três botões. */
export function ProductCta({
  kicker,
  icon: Icon,
  title,
  text,
  primary,
  links = [],
  tone = "secondary",
}: {
  kicker: string;
  icon: LucideIcon;
  title: string;
  text: string;
  primary: { label: string; href: string };
  links?: { label: string; href: string }[];
  tone?: "primary" | "secondary";
}) {
  const content = tone === "primary" ? "text-primary-content" : "text-secondary-content";
  return (
    <Section>
      <Reveal effect="pop">
        <Card
          tone={tone}
          featured
          className="stage-grid-on-color relative mx-auto max-w-6xl overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] px-8 py-14 sm:px-14"
        >
          <Gear size={190} tone="accent" motion="spin" className="absolute -right-12 -top-12 hidden sm:inline-block" />
          <Starburst size={70} tone={tone === "primary" ? "secondary" : "primary"} rotate={12} className="absolute bottom-8 right-16 hidden md:inline-grid" />
          <Sparkle size={28} tone="paper" shadow={false} className="absolute bottom-24 right-56 hidden md:inline-block" />

          <div className="relative max-w-2xl">
            <p className={cn("stage-kicker inline-flex items-center gap-2 opacity-75", content)}>
              <Icon size={14} />
              {kicker}
            </p>
            <h2 className="stage-display mt-4 text-3xl sm:text-5xl">{title}</h2>
            <p className="mt-5 max-w-xl opacity-80">{text}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href={primary.href} tone="accent" size="lg">
                {primary.label}
              </ButtonLink>
              {links.map((l) => (
                <ButtonLink
                  key={l.href}
                  href={l.href}
                  tone="ghost"
                  size="lg"
                  shape="rounded"
                  iconRight={<ArrowRight size={18} />}
                  className={cn(content, "hover:bg-white/10")}
                >
                  {l.label}
                </ButtonLink>
              ))}
            </div>
          </div>
        </Card>
      </Reveal>
    </Section>
  );
}

/**
 * Card com capa gerada (padrão SVG da Stage UI), etiqueta, título, texto e
 * lista de recursos. `featured` sobe o card e põe a sombra dura de 8px.
 */
export function CoverCard({
  index,
  icon: Icon,
  tag,
  title,
  text,
  features,
  tone,
  pattern,
  featured,
  ribbon,
  href,
  linkLabel,
}: {
  index: number;
  icon: LucideIcon;
  tag: string;
  title: string;
  text: string;
  features: string[];
  tone: "primary" | "secondary" | "accent";
  pattern: CoverPattern;
  featured?: boolean;
  ribbon?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <article
      className={cn(
        "stage-paper group relative flex h-full flex-col overflow-hidden rounded-tl-[30px] rounded-br-[30px] border bg-base-100 transition-all duration-300 hover:-translate-y-1",
        featured
          ? "border-primary stage-shadow-lg lg:-translate-y-3 lg:hover:-translate-y-4"
          : "border-base-300 hover:shadow-[6px_6px_0_0_var(--stage-shadow)]",
      )}
    >
      <div className="relative">
        <Cover pattern={pattern} tone={tone} ratio="3/1" corners="none" kicker={`/${String(index).padStart(2, "0")}`} icon={<Icon />} />
        {ribbon && (
          <StickerTag tone="accent" rotate={-4} className="absolute -bottom-3 right-5 z-10">
            {ribbon}
          </StickerTag>
        )}
      </div>
      <div className="flex flex-1 flex-col p-7">
        <p className={cn("text-xs font-bold uppercase tracking-[0.18em]", toneText[tone])}>{tag}</p>
        <h3 className="stage-display mt-2 text-2xl sm:text-3xl">
          {href ? (
            <Link href={href} className="outline-none after:absolute after:inset-0 after:z-0 focus-visible:underline">
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        <p className="mt-3 text-sm leading-6 text-base-content/65">{text}</p>
        <ul className="mt-6 flex-1 space-y-2.5 border-t border-base-300 pt-6 text-sm">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2.5">
              <span className={cn("grid size-5 shrink-0 place-items-center rounded-tl-md rounded-br-md", toneSoft[tone])}>
                <Check size={12} />
              </span>
              {f}
            </li>
          ))}
        </ul>
        {href && linkLabel && (
          <span className="mt-6 flex items-center justify-between border-t border-base-300 pt-4 text-sm font-bold">
            {linkLabel}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </span>
        )}
      </div>
    </article>
  );
}
