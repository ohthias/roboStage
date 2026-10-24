import Link from "next/link";
import { ArrowRight, ArrowUpRight, Wrench, type LucideIcon } from "lucide-react";

import RevealOnScroll from "@/components/UI/RevealOnScroll";
import { toneClasses, type Tone } from "@/components/home/shared";

export const cornerBtn =
  "rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none";

/* ------------------------------------------------------------- ToolCard */

export type ToolItem = {
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
  href: string;
  tone: Tone;
  status?: string;
  external?: boolean;
};

export function ToolCard({ tool, index }: { tool: ToolItem; index: number }) {
  const { icon: Icon, tag, title, description, href, tone, status, external } = tool;
  const c = toneClasses[tone];
  const cls = `group relative flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-base-content/[0.04] ${c.hover}`;
  const inner = (
    <>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-10 -top-10 size-32 rounded-full border border-base-300 transition-transform duration-500 group-hover:scale-125 ${c.ring}`}
      />
      <div className="relative flex items-center justify-between">
        <div
          className={`flex size-12 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}
        >
          <Icon size={22} strokeWidth={1.8} />
        </div>
        <span className="font-mono text-xs text-base-content/35">
          /{String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <p className={`relative mt-7 text-[10px] font-bold tracking-[0.18em] ${c.tag}`}>{tag}</p>
      <h3 className="relative mt-2 flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight">
        {title}
        {status && (
          status === "Novo" ? (
            <span className="badge badge-primary badge-xs font-mono font-normal">NOVO</span>
          ) : (
            <span className="badge badge-warning badge-outline badge-xs gap-1 font-normal">
              <Wrench size={10} />
              {status}
            </span>
          )
        )}
      </h3>
      <p className="relative mt-3 flex-1 text-sm leading-6 text-base-content/60">{description}</p>
      <div className="relative mt-6 flex items-center justify-between gap-3">
        <code className="truncate rounded-md bg-base-200 px-2 py-1 font-mono text-xs text-base-content/70">
          {external ? new URL(href).hostname.replace(/^www\./, "") : href}
        </code>
        {external ? (
          <ArrowUpRight size={16} className="shrink-0 text-base-content/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-base-content" />
        ) : (
          <ArrowRight size={16} className="shrink-0 text-base-content/40 transition-all group-hover:translate-x-1 group-hover:text-base-content" />
        )}
      </div>
    </>
  );

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

export function ToolGrid({ tools, columns = 4 }: { tools: ToolItem[]; columns?: 3 | 4 }) {
  return (
    <div
      className={`mt-14 grid gap-5 sm:grid-cols-2 ${columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
    >
      {tools.map((tool, i) => (
        <RevealOnScroll key={tool.title} delay={(i % columns) * 0.06} className="h-full">
          <ToolCard tool={tool} index={i} />
        </RevealOnScroll>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ StepsRow */

export type StepItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  detail: string;
  href?: string;
  link?: string;
};

export function StepsRow({ steps, tone = "secondary" }: { steps: StepItem[]; tone?: Tone }) {
  const c = toneClasses[tone];
  return (
    <div className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-12">
      <div
        aria-hidden="true"
        className="absolute left-[16.66%] right-[16.66%] top-6 hidden border-t-2 border-dashed border-base-300 md:block"
      />
      {steps.map(({ icon: Icon, title, description, detail, href, link }, i) => (
        <RevealOnScroll key={title} delay={i * 0.1}>
          <article className="group relative">
            <div className="flex items-center gap-4 md:block">
              <div
                className={`relative z-10 flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 transition-all duration-300 ${c.tag} ${
                  tone === "primary"
                    ? "group-hover:border-primary group-hover:bg-primary group-hover:text-primary-content"
                    : "group-hover:border-secondary group-hover:bg-secondary group-hover:text-secondary-content"
                }`}
              >
                <Icon size={21} strokeWidth={1.8} />
              </div>
              <span className="font-mono text-xs tracking-widest text-base-content/40 md:mt-4 md:block">
                ETAPA {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="mt-5 text-xl font-bold tracking-tight">{title}</h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-base-content/60">{description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className={`inline-flex items-center gap-2 text-xs font-bold ${c.tag}`}>
                <span className={`size-1.5 rounded-full ${c.dot}`} />
                {detail}
              </span>
              {href && link && (
                <Link
                  href={href}
                  className="inline-flex items-center gap-1 text-xs font-bold text-base-content/70 transition-colors hover:text-primary"
                >
                  {link}
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </article>
        </RevealOnScroll>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ CtaBlock */

export function CtaBlock({
  kicker,
  title,
  text,
  actions,
  icon: Icon,
}: {
  kicker: string;
  title: string;
  text: string;
  icon?: LucideIcon;
  actions: { label: string; href: string; variant: "accent" | "primary" | "ghost" }[];
}) {
  return (
    <section className="px-6 py-24">
      <RevealOnScroll>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] bg-secondary px-8 py-14 text-secondary-content sm:px-14">
          <div aria-hidden="true" className="absolute -right-16 -top-16 size-64 rounded-full border-[28px] border-accent/90" />
          <div aria-hidden="true" className="absolute -bottom-10 right-40 size-24 rotate-12 rounded-tl-2xl rounded-br-2xl bg-primary" />
          <div aria-hidden="true" className="absolute bottom-8 right-12 size-10 rounded-full border-2 border-dashed border-secondary-content/40" />
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] bg-[size:22px_22px] opacity-[0.08]" />

          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-secondary-content/70">
              {Icon && <Icon size={14} />}
              {kicker}
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">{title}</h2>
            <p className="mt-5 max-w-xl text-secondary-content/80">{text}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              {actions.map(({ label, href, variant }) => (
                <Link
                  key={href}
                  href={href}
                  className={
                    variant === "ghost"
                      ? "btn btn-ghost btn-lg text-secondary-content hover:bg-secondary-content/10"
                      : `btn btn-${variant} btn-lg ${cornerBtn} shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5`
                  }
                >
                  {label}
                  {variant === "ghost" && <ArrowRight size={18} />}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
