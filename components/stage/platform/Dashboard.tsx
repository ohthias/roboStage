import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { cn, toneFill, toneSoft, type Tone } from "../lib";
import { AvatarStack, ChunkyProgress } from "../core/Data";
import { Flower, Mascot, Sparkle, Squiggle } from "../decor/Stickers";

/* ------------------------------------------------------------------ */
/*  Peças do dashboard                                                 */
/* ------------------------------------------------------------------ */

/** Banner de boas-vindas (substitui dashboard/banner.tsx). */
export function DashboardBanner({
  greeting,
  name,
  phrase,
  stats,
  action,
}: {
  greeting: string;
  name: string;
  phrase: string;
  stats?: { label: string; value: ReactNode }[];
  action?: ReactNode;
}) {
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  return (
    <section className="stage-paper overflow-hidden rounded-3xl border border-base-300 bg-base-100 p-8 shadow-sm">
      <div className="stage-dots absolute inset-0 opacity-60 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <Flower size={64} tone="accent" motion="spin" className="absolute right-8 top-6 hidden sm:block" />
      <Mascot size={92} className="absolute bottom-6 right-10 hidden md:block" rotate={6} />
      <div className="relative max-w-2xl">
        <p className="stage-kicker flex items-center gap-2 text-base-content/50">
          <CalendarDays size={14} /> {today}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
          {greeting},{" "}
          <span className="text-primary">{name}</span>.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-base-content/70 md:text-lg">{phrase}</p>
        {stats && (
          <div className="mt-6 flex flex-wrap gap-3">
            {stats.map((s, i) => (
              <div key={s.label} className={cn("rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100/80 px-4 py-2.5 backdrop-blur", i === 0 && "stage-shadow border-transparent bg-primary text-primary-content")}>
                <p className="text-2xl font-black leading-none tracking-tight">{s.value}</p>
                <p className="stage-label mt-1 opacity-70">{s.label}</p>
              </div>
            ))}
          </div>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
    </section>
  );
}

export type Tool = {
  title: string;
  description: string;
  href: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  tone: Tone;
  tag?: string;
};

/**
 * Leque de ferramentas (QuickBrick, LabTest, ThinkLab…) — os cards
 * coloridos sobrepostos da seção "CREATIVE SKILLS" da referência.
 */
export function ToolFan({ tools }: { tools: Tool[] }) {
  const rot = [-6, -2, 3, -3, 5, -1];
  return (
    <div className="flex flex-wrap justify-center gap-y-6 sm:flex-nowrap sm:pt-6">
      {tools.map((t, i) => {
        const Icon = t.icon;
        return (
          <Link
            key={t.title}
            href={t.href}
            className={cn(
              "group stage-texture stage-shadow-lg flex min-h-64 w-52 shrink-0 flex-col justify-end rounded-tl-[2rem] rounded-br-[2rem] p-5 transition-all duration-500 ease-out hover:z-20 hover:-translate-y-4 hover:rotate-0 hover:shadow-[10px_10px_0_0_var(--stage-shadow)] sm:-mx-1.5",
              toneFill[t.tone],
            )}
            style={{ rotate: `${rot[i % rot.length]}deg`, zIndex: i }}
          >
            <span className="absolute left-5 top-5 grid size-11 place-items-center rounded-full border border-white/30 bg-white/10 transition-all duration-300 group-hover:-rotate-12 group-hover:bg-base-100 group-hover:text-base-content">
              <Icon size={20} />
            </span>
            {t.tag && (
              <span className="stage-label absolute right-4 top-6 rounded-tl-md rounded-br-md bg-base-100 px-2 py-1 text-base-content">
                {t.tag}
              </span>
            )}
            <h3 className="text-2xl font-black tracking-tight">{t.title}</h3>
            <p className="mt-2 text-sm leading-snug opacity-85">{t.description}</p>
          </Link>
        );
      })}
    </div>
  );
}

/** Card de ferramenta em grade (para listas maiores). */
export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <Link
      href={tool.href}
      className="group stage-paper stage-ink flex items-start gap-4 rounded-2xl bg-base-100 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40"
    >
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-tl-lg rounded-br-lg transition-colors duration-300", toneSoft[tool.tone])}>
        <Icon size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-bold tracking-tight">{tool.title}</span>
          {tool.tag && <span className="stage-label stage-corner-sm bg-accent/20 px-1.5 py-0.5">{tool.tag}</span>}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-base-content/60">{tool.description}</span>
      </span>
      <ArrowUpRight size={18} className="shrink-0 text-base-content/35 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

/** Card de projeto recente (StageBook, Notebook, Estratégia…). */
export function ProjectCard({
  title,
  kind,
  updated,
  progress,
  members,
  tone = "secondary",
  href = "#",
}: {
  title: string;
  kind: string;
  updated: string;
  progress: number;
  members: string[];
  tone?: Tone;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="group stage-paper stage-ink flex flex-col overflow-hidden rounded-2xl bg-base-100 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[6px_6px_0_0_var(--stage-shadow)]"
    >
      <div className={cn("stage-noise h-24 overflow-hidden border-b border-[var(--stage-line)]", toneFill[tone])}>
        <div className="stage-grid-on-color absolute inset-0" />
        <Squiggle size={140} tone="paper" className="absolute -bottom-3 -right-4 opacity-30" />
        <Sparkle size={30} tone="accent" className="absolute left-4 top-4" shadow={false} />
        <span className="stage-label absolute bottom-3 left-4 rounded-tl-md rounded-br-md bg-base-100 px-2 py-1 text-base-content">
          {kind}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
          <p className="mt-1 text-xs text-base-content/55">Editado {updated}</p>
        </div>
        <ChunkyProgress value={progress} tone={tone} label="Progresso" />
        <AvatarStack names={members} size={30} />
      </div>
    </Link>
  );
}
