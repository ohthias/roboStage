import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Lock,
  Mail,
  MessageSquare,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cn, toneFill, toneSoft, toneText, toneVar, type Tone } from "../lib";
import { StatusBadge, type Status } from "../core/Tag";
import { AvatarStack, ChunkyProgress, TeamAvatar } from "../core/Data";
import { Gear, Sparkle, Starburst } from "../decor/Stickers";
import { CoverArt, coverFromSeed } from "../covers/Covers";

/* ------------------------------------------------------------------ */
/*  Mais cards: partida, conquista, robô, membro, notícia, chamada,    */
/*  meta, comparação de runs, atividade, tarefa, missão e credencial.  */
/*  Base comum: papel + borda base-300, canto recortado de 30px nos    */
/*  cards de destaque, sombra dura só onde há ação ou celebração.      */
/* ------------------------------------------------------------------ */

const card = "stage-paper stage-ink relative bg-base-100";

/* ===================================================== PROGRESS RING */

/** ProgressRing — anel de progresso com valor no centro (metas, taxa de acerto). */
export function ProgressRing({
  value,
  max = 100,
  size = 88,
  stroke = 9,
  tone = "primary",
  label,
  className,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  tone?: Tone;
  /** Texto do centro; padrão: porcentagem. */
  label?: ReactNode;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className={cn("relative grid shrink-0 place-items-center", className)} style={{ width: size, height: size }} role="img" aria-label={`${Math.round(pct * 100)}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-base-300)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={toneVar[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-center font-black leading-none tracking-tight" style={{ fontSize: size * 0.24 }}>
        {label ?? `${Math.round(pct * 100)}%`}
      </span>
    </div>
  );
}

/* ============================================================= MATCH */

export type MatchSide = { team: string; score?: number; avatar?: string };

/** MatchCard — partida da agenda: mesa, horário, equipes e placar. */
export function MatchCard({
  round,
  table,
  time,
  status = "soon",
  home,
  away,
  href,
  className,
}: {
  round: string;
  table: string;
  time: string;
  status?: Extract<Status, "live" | "soon" | "done">;
  home: MatchSide;
  away: MatchSide;
  href?: string;
  className?: string;
}) {
  const live = status === "live";
  const done = status === "done";
  const winner = done && home.score != null && away.score != null ? (home.score === away.score ? null : home.score > away.score ? "home" : "away") : null;
  const Row = ({ side, which }: { side: MatchSide; which: "home" | "away" }) => {
    const win = winner === which;
    return (
      <div className="flex items-center gap-3">
        <TeamAvatar name={side.team} src={side.avatar} size={34} />
        <span className={cn("min-w-0 flex-1 truncate font-semibold", winner && !win && "text-base-content/50")}>{side.team}</span>
        {win && <span className="stage-label rounded-tl-md rounded-br-md bg-success/15 px-1.5 py-0.5 text-success">Venceu</span>}
        <span className={cn("w-12 text-right text-2xl font-black tabular-nums tracking-tight", side.score == null && "text-base-content/25")}>{side.score ?? "–"}</span>
      </div>
    );
  };
  return (
    <article
      className={cn(
        card,
        "rounded-2xl p-4 transition-all duration-200",
        live ? "border-primary/50 shadow-[4px_4px_0_0_var(--color-primary)]" : "hover:-translate-y-0.5 hover:border-primary/40",
        className,
      )}
    >
      <header className="mb-4 flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-base-content/55">
          {round} · {table}
        </span>
        {status === "soon" ? (
          <span className="inline-flex items-center gap-1 font-mono text-xs font-bold">
            <Clock size={12} /> {time}
          </span>
        ) : (
          <StatusBadge status={status} />
        )}
      </header>
      <div className="space-y-2.5">
        <Row side={home} which="home" />
        <div className="ml-11 border-t border-dashed border-base-300" />
        <Row side={away} which="away" />
      </div>
      {href && (
        <Link href={href} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary after:absolute after:inset-0 hover:underline">
          {live ? "Acompanhar ao vivo" : done ? "Ver súmula" : "Detalhes da partida"} <ArrowRight size={12} />
        </Link>
      )}
    </article>
  );
}

/* ============================================================= AWARD */

/** AwardCard — conquista/medalha. Bloqueada mostra o progresso até liberar. */
export function AwardCard({
  title,
  description,
  icon,
  tone = "accent",
  unlocked = true,
  progress,
  date,
  className,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  tone?: Tone;
  unlocked?: boolean;
  /** Para conquista bloqueada: [atual, meta]. */
  progress?: [number, number];
  date?: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "stage-paper relative flex flex-col items-center rounded-tl-[30px] rounded-br-[30px] border p-6 text-center transition-all duration-300",
        unlocked ? "border-base-300 bg-base-100 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--stage-shadow)]" : "border-dashed border-base-content/25 bg-base-200/40",
        className,
      )}
    >
      <div className={cn("relative", !unlocked && "opacity-45 grayscale")}>
        <Starburst size={92} tone={tone} points={14} motion={unlocked ? "spin" : undefined} />
        <span className="absolute inset-0 grid place-items-center text-base-content [&>svg]:size-8">{icon}</span>
        {!unlocked && (
          <span className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-base-content text-base-100">
            <Lock size={14} />
          </span>
        )}
      </div>
      <h3 className="mt-4 text-lg font-black leading-tight tracking-tight">{title}</h3>
      <p className="mt-1 text-sm leading-snug text-base-content/65">{description}</p>
      {unlocked ? (
        date && <p className="stage-label mt-4 text-base-content/45">Conquistado em {date}</p>
      ) : (
        progress && (
          <div className="mt-4 w-full">
            <ChunkyProgress value={progress[0]} max={progress[1]} tone={tone} showValue={false} />
            <p className="mt-1.5 font-mono text-xs text-base-content/55">
              {progress[0]} de {progress[1]}
            </p>
          </div>
        )
      )}
    </article>
  );
}

/* ============================================================= ROBOT */

/** RobotCard — ficha do robô: foto, versão, especificações e taxa de acerto. */
export function RobotCard({
  name,
  version,
  image,
  specs,
  accuracy,
  tags = [],
  href,
  className,
}: {
  name: string;
  version: string;
  image?: string;
  specs: { label: string; value: ReactNode }[];
  /** 0–100 */
  accuracy?: number;
  tags?: string[];
  href?: string;
  className?: string;
}) {
  return (
    <article className={cn(card, "group overflow-hidden rounded-tl-[30px] rounded-br-[30px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--stage-shadow)]", className)}>
      <div className="stage-dots relative aspect-[16/10] overflow-hidden border-b border-base-300 bg-base-200/60 [background-size:16px_16px]">
        {image ? (
          <Image src={image} alt={`Robô ${name}`} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center">
            <Gear size={80} tone="accent" motion="spin" />
          </div>
        )}
        <span className="stage-label absolute left-4 top-4 rounded-tl-md rounded-br-md bg-base-100 px-2 py-1">{version}</span>
      </div>
      <div className="relative p-5 pt-6">
        {accuracy != null && (
          <div className="absolute right-4 top-0 z-10 -translate-y-1/2 rounded-full bg-base-100 p-1 shadow-sm" title="Taxa de acerto">
            <ProgressRing value={accuracy} size={64} stroke={7} tone={accuracy >= 80 ? "success" : accuracy >= 60 ? "accent" : "primary"} />
          </div>
        )}
        <p className="stage-label text-base-content/45">Robô</p>
        <h3 className="mt-1 text-xl font-black tracking-tight">
          {href ? (
            <Link href={href} className="after:absolute after:inset-0">
              {name}
            </Link>
          ) : (
            name
          )}
        </h3>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
          {specs.map((s) => (
            <div key={s.label}>
              <dt className="stage-label text-base-content/45">{s.label}</dt>
              <dd className="text-sm font-bold">{s.value}</dd>
            </div>
          ))}
        </dl>
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="rounded-tl-md rounded-br-md bg-base-200 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/* ============================================================ MEMBER */

/** MemberCard — pessoa da equipe: papel, habilidades e contato. */
export function MemberCard({
  name,
  role,
  roleTone = "secondary",
  avatar,
  skills = [],
  since,
  email,
  className,
}: {
  name: string;
  role: string;
  roleTone?: Tone;
  avatar?: string;
  skills?: string[];
  since?: string;
  email?: string;
  className?: string;
}) {
  return (
    <article className={cn(card, "flex flex-col items-center rounded-tl-[30px] rounded-br-[30px] p-6 text-center", className)}>
      <div className="relative">
        <TeamAvatar name={name} src={avatar} size={84} className="ring-4" />
        <span className={cn("stage-noise stage-label absolute -bottom-2 left-1/2 -translate-x-1/2 -rotate-3 whitespace-nowrap rounded-tl-md rounded-br-md px-2 py-1", toneFill[roleTone])}>
          {role}
        </span>
      </div>
      <h3 className="mt-6 text-lg font-black tracking-tight">{name}</h3>
      {since && <p className="text-xs text-base-content/55">Na equipe desde {since}</p>}
      {skills.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {skills.map((s) => (
            <span key={s} className="rounded-full border border-base-content/15 px-2.5 py-0.5 text-xs font-semibold">
              {s}
            </span>
          ))}
        </div>
      )}
      <div className="mt-5 flex w-full gap-2 border-t border-base-300 pt-4">
        <button type="button" className="btn btn-ghost btn-sm flex-1 gap-1.5">
          <MessageSquare size={14} /> Mensagem
        </button>
        {email && (
          <a href={`mailto:${email}`} className="btn btn-ghost btn-sm flex-1 gap-1.5" aria-label={`Enviar e-mail para ${name}`}>
            <Mail size={14} /> E-mail
          </a>
        )}
      </div>
    </article>
  );
}

/* ============================================================== NEWS */

/** NewsCard — notícia/post. Layouts: vertical, horizontal e destaque (texto sobre a imagem). */
export function NewsCard({
  title,
  excerpt,
  image,
  tag,
  date,
  readingTime,
  href,
  layout = "vertical",
  className,
}: {
  title: string;
  excerpt?: string;
  image: string;
  tag?: string;
  date: string;
  readingTime?: string;
  href: string;
  layout?: "vertical" | "horizontal" | "featured";
  className?: string;
}) {
  const fallbackCover = coverFromSeed(title);
  const coverFallback = (
    <CoverArt
      pattern={fallbackCover.pattern}
      tone={fallbackCover.tone}
      seed={title}
      className="absolute inset-0 size-full"
    />
  );
  const meta = (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em] opacity-60">
      <span className="inline-flex items-center gap-1">
        <CalendarDays size={11} /> {date}
      </span>
      {readingTime && (
        <span className="inline-flex items-center gap-1">
          <Clock size={11} /> {readingTime}
        </span>
      )}
    </p>
  );
  const tagEl = tag && <span className="stage-noise stage-label rounded-tl-md rounded-br-md bg-primary px-2 py-1 text-primary-content">{tag}</span>;
  const titleLink = (
    <Link href={href} className="outline-none after:absolute after:inset-0 after:z-10 focus-visible:underline">
      {title}
    </Link>
  );

  if (layout === "featured")
    return (
      <article className={cn("group relative isolate flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-tl-[30px] rounded-br-[30px] p-6 text-white stage-shadow-lg", className)}>
        {image ? (
          <Image src={image} alt="" fill sizes="(min-width: 768px) 66vw, 100vw" className="-z-20 object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 -z-20 transition-transform duration-700 group-hover:scale-105">{coverFallback}</div>
        )}
        <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        <div className="max-w-xl space-y-3">
          {tagEl}
          <h3 className="text-2xl font-black leading-tight tracking-tight sm:text-4xl">{titleLink}</h3>
          {excerpt && <p className="line-clamp-2 text-sm text-white/80 sm:text-base">{excerpt}</p>}
          {meta}
        </div>
      </article>
    );

  if (layout === "horizontal")
    return (
      <article className={cn(card, "group flex gap-4 rounded-2xl p-3 transition-colors hover:border-primary/40", className)}>
        <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-tl-xl rounded-br-xl bg-base-200 sm:w-32">
          {image ? (
            <Image src={image} alt="" fill sizes="128px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">{coverFallback}</div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1.5 py-1">
          {tag && <p className="stage-label text-primary">{tag}</p>}
          <h3 className="line-clamp-2 font-black leading-snug tracking-tight">{titleLink}</h3>
          {meta}
        </div>
      </article>
    );

  return (
    <article className={cn(card, "group flex flex-col overflow-hidden rounded-tl-[30px] rounded-br-[30px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--stage-shadow)]", className)}>
      <div className="relative aspect-video overflow-hidden border-b border-base-300 bg-base-200">
        {image ? (
          <Image src={image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">{coverFallback}</div>
        )}
        <span className="absolute left-4 top-4 z-10">{tagEl}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-lg font-black leading-snug tracking-tight">{titleLink}</h3>
        {excerpt && <p className="line-clamp-3 text-sm leading-relaxed text-base-content/65">{excerpt}</p>}
        <div className="mt-auto pt-2">{meta}</div>
      </div>
    </article>
  );
}

/* ============================================================ ACTION */

/** ActionCard — chamada para ação dentro de uma tela (convite, próximo passo, novidade). */
export function ActionCard({
  kicker,
  title,
  description,
  action,
  tone = "secondary",
  className,
}: {
  kicker?: string;
  title: string;
  description?: string;
  action: { label: string; href: string };
  tone?: Tone;
  className?: string;
}) {
  return (
    <article className={cn("stage-texture stage-grid-on-color stage-shadow-lg relative overflow-hidden rounded-tl-[30px] rounded-br-[30px] p-7", toneFill[tone], className)}>
      <Gear size={120} tone="accent" motion="spin" className="absolute -bottom-8 -right-8 opacity-90" />
      <Sparkle size={30} tone="paper" className="absolute right-24 top-6" shadow={false} />
      <div className="relative max-w-sm">
        {kicker && <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-75">/ {kicker}</p>}
        <h3 className="mt-2 text-3xl font-black leading-[1] tracking-tight">{title}</h3>
        {description && <p className="mt-3 text-sm leading-relaxed opacity-85">{description}</p>}
        <Link
          href={action.href}
          className="stage-press stage-shadow-sm group mt-6 inline-flex items-center gap-2 rounded-tl-xl rounded-br-xl bg-base-100 px-4 py-2.5 text-sm font-bold text-base-content"
        >
          {action.label}
          <ArrowUpRight size={15} className="transition-transform group-hover:rotate-45" />
        </Link>
      </div>
    </article>
  );
}

/* ============================================================== GOAL */

/** GoalCard — meta da equipe com anel de progresso e prazo. */
export function GoalCard({
  title,
  value,
  max,
  unit,
  deadline,
  tone = "primary",
  className,
}: {
  title: string;
  value: number;
  max: number;
  unit?: string;
  deadline?: string;
  tone?: Tone;
  className?: string;
}) {
  const done = value >= max;
  return (
    <article className={cn(card, "flex items-center gap-5 rounded-2xl p-5", className)}>
      <ProgressRing value={value} max={max} tone={done ? "success" : tone} label={done ? <CheckCircle2 size={28} className="text-success" /> : undefined} />
      <div className="min-w-0">
        <p className="stage-label text-base-content/45">Meta</p>
        <h3 className="font-black leading-snug tracking-tight">{title}</h3>
        <p className="mt-1 text-sm text-base-content/65">
          <strong className="text-base-content">{value}</strong> de {max}
          {unit && ` ${unit}`}
          {!done && <span className="text-base-content/45"> · faltam {max - value}</span>}
        </p>
        {deadline && (
          <p className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-base-content/50">
            <CalendarDays size={11} /> até {deadline}
          </p>
        )}
      </div>
    </article>
  );
}

/* ======================================================= RUN COMPARE */

type RunSide = { label: string; score: number; time: string; success: number };

/** RunCompareCard — antes × depois de um ajuste no robô (LabTest). */
export function RunCompareCard({ title, before, after, className }: { title: string; before: RunSide; after: RunSide; className?: string }) {
  const delta = (a: number, b: number, betterHigher = true) => {
    const d = b - a;
    const good = betterHigher ? d > 0 : d < 0;
    const Icon = d === 0 ? Minus : d > 0 ? TrendingUp : TrendingDown;
    return (
      <span className={cn("inline-flex items-center gap-0.5 font-mono text-[11px] font-bold", d === 0 ? "text-base-content/45" : good ? "text-success" : "text-error")}>
        <Icon size={12} /> {d > 0 ? "+" : ""}
        {d}
      </span>
    );
  };
  const toSec = (t: string) => {
    const [m, s] = t.split(":").map(Number);
    return m * 60 + s;
  };
  const rows: { label: string; a: ReactNode; b: ReactNode; d: ReactNode }[] = [
    { label: "Pontos", a: before.score, b: after.score, d: delta(before.score, after.score) },
    { label: "Tempo", a: before.time, b: after.time, d: delta(toSec(before.time), toSec(after.time), false) },
    { label: "Acerto", a: `${before.success}%`, b: `${after.success}%`, d: delta(before.success, after.success) },
  ];
  return (
    <article className={cn(card, "overflow-hidden rounded-tl-[30px] rounded-br-[30px]", className)}>
      <header className="border-b border-base-300 px-5 py-4">
        <p className="stage-label text-base-content/45">Comparar runs</p>
        <h3 className="font-black tracking-tight">{title}</h3>
      </header>
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-x-3 px-5 py-3 text-sm">
        <span />
        <span className="stage-label text-center text-base-content/45">{before.label}</span>
        <span className="stage-label text-center text-secondary">{after.label}</span>
        <span />
        {rows.map((r) => (
          <div key={r.label} className="contents">
            <span className="border-t border-dashed border-base-300 py-2.5 text-base-content/60">{r.label}</span>
            <span className="border-t border-dashed border-base-300 py-2.5 text-center font-semibold text-base-content/55 tabular-nums">{r.a}</span>
            <span className="border-t border-dashed border-base-300 bg-secondary/5 py-2.5 text-center text-lg font-black tabular-nums">{r.b}</span>
            <span className="border-t border-dashed border-base-300 py-2.5 text-right">{r.d}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

/* ========================================================== ACTIVITY */

export type Activity = { who: string; action: string; target?: string; time: string; icon?: ReactNode; tone?: Tone };

/** ActivityCard — feed do que a equipe fez (runs, projetos, eventos). */
export function ActivityCard({ title = "Atividade da equipe", items, className }: { title?: string; items: Activity[]; className?: string }) {
  return (
    <section className={cn(card, "rounded-2xl p-5", className)}>
      <h3 className="mb-4 font-black tracking-tight">{title}</h3>
      <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[17px] before:top-2 before:w-px before:bg-base-300">
        {items.map((it, i) => (
          <li key={i} className="relative flex gap-3">
            <span className={cn("relative z-10 grid size-9 shrink-0 place-items-center rounded-tl-lg rounded-br-lg ring-4 ring-base-100 [&>svg]:size-4", toneSoft[it.tone ?? "primary"])}>
              {it.icon ?? <TeamAvatar name={it.who} size={36} />}
            </span>
            <p className="min-w-0 pt-1 text-sm leading-snug">
              <strong>{it.who}</strong> <span className="text-base-content/70">{it.action}</span>
              {it.target && <strong className="text-base-content"> {it.target}</strong>}
              <span className="block font-mono text-[11px] uppercase tracking-wider text-base-content/45">{it.time}</span>
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ============================================================== TASK */

const priorityMeta = {
  alta: { tone: "primary" as Tone, bar: "bg-primary" },
  média: { tone: "accent" as Tone, bar: "bg-accent" },
  baixa: { tone: "info" as Tone, bar: "bg-info" },
};

/** TaskCard — tarefa do quadro da equipe: prioridade, responsáveis, prazo e subtarefas. */
export function TaskCard({
  title,
  priority = "média",
  assignees = [],
  due,
  tags = [],
  subtasks,
  late,
  className,
}: {
  title: string;
  priority?: keyof typeof priorityMeta;
  assignees?: string[];
  due?: string;
  tags?: string[];
  /** [feitas, total] */
  subtasks?: [number, number];
  late?: boolean;
  className?: string;
}) {
  const p = priorityMeta[priority];
  return (
    <article className={cn(card, "group overflow-hidden rounded-xl pl-1.5 transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--stage-shadow)]", className)}>
      <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1.5", p.bar)} />
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cn("stage-label rounded-tl-md rounded-br-md px-1.5 py-0.5", toneSoft[p.tone])}>{priority}</span>
          {tags.map((t) => (
            <span key={t} className="rounded-tl-md rounded-br-md bg-base-200 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-base-content/70">
              {t}
            </span>
          ))}
        </div>
        <h3 className="mt-2.5 font-bold leading-snug">{title}</h3>
        {subtasks && (
          <div className="mt-3 flex items-center gap-2">
            <ChunkyProgress value={subtasks[0]} max={subtasks[1]} tone={subtasks[0] === subtasks[1] ? "success" : "secondary"} showValue={false} className="flex-1" />
            <span className="font-mono text-[11px] text-base-content/55">
              {subtasks[0]}/{subtasks[1]}
            </span>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between gap-2">
          {assignees.length > 0 ? <AvatarStack names={assignees} size={26} max={3} /> : <span />}
          {due && (
            <span className={cn("inline-flex items-center gap-1 font-mono text-[11px] font-bold", late ? "text-error" : "text-base-content/55")}>
              <CalendarDays size={11} /> {due}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/* =========================================================== MISSION */

/** MissionCard — resumo de missão para estratégia: código, pontos, dificuldade e tempo. */
export function MissionCard({
  code,
  name,
  points,
  difficulty,
  time,
  image,
  tags = [],
  selected,
  className,
}: {
  code: string;
  name: string;
  points: number;
  /** 1 (fácil) a 3 (difícil) */
  difficulty: 1 | 2 | 3;
  time?: string;
  image?: string;
  tags?: string[];
  selected?: boolean;
  className?: string;
}) {
  const diffLabel = ["Fácil", "Média", "Difícil"][difficulty - 1];
  return (
    <article
      className={cn(
        card,
        "flex gap-4 rounded-2xl p-3 transition-all",
        selected ? "border-secondary shadow-[4px_4px_0_0_var(--color-secondary)]" : "hover:border-secondary/40",
        className,
      )}
    >
      <div className="relative grid aspect-square w-20 shrink-0 place-items-center overflow-hidden rounded-tl-xl rounded-br-xl bg-base-200">
        {image ? <Image src={image} alt="" fill sizes="80px" className="object-cover" /> : <span className="font-mono text-lg font-black text-secondary">{code}</span>}
        {image && <span className="stage-label absolute left-1.5 top-1.5 rounded-tl-md rounded-br-md bg-secondary px-1.5 py-0.5 text-secondary-content">{code}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-black uppercase leading-tight tracking-tight">{name}</h3>
          <span className="shrink-0 rounded-tl-md rounded-br-md bg-accent px-1.5 py-0.5 font-mono text-xs font-black text-accent-content">{points} pts</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/60">
          <span className="inline-flex items-center gap-1" title={`Dificuldade: ${diffLabel}`}>
            {[1, 2, 3].map((d) => (
              <span key={d} className={cn("size-2 rounded-full", d <= difficulty ? (difficulty === 3 ? "bg-primary" : difficulty === 2 ? "bg-accent" : "bg-success") : "bg-base-300")} />
            ))}
            <span className="ml-0.5">{diffLabel}</span>
          </span>
          {time && (
            <span className="inline-flex items-center gap-1">
              <Clock size={11} /> {time}
            </span>
          )}
        </div>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((t) => (
              <span key={t} className="rounded-full border border-base-content/15 px-2 py-0.5 text-[10px] font-semibold">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/* ======================================================== CREDENTIAL */

/** Grade decorativa estável a partir do código (não é um QR Code legível). */
function CodePattern({ code, size = 72 }: { code: string; size?: number }) {
  const n = 9;
  let h = 0;
  for (const ch of code) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < n * n; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push(((h >>> 16) & 1) === 1);
  }
  const s = size / n;
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x * s} y={y * s} width={s * 3} height={s * 3} fill="currentColor" />
      <rect x={x * s + s * 0.6} y={y * s + s * 0.6} width={s * 1.8} height={s * 1.8} fill="var(--color-base-100)" />
      <rect x={x * s + s} y={y * s + s} width={s} height={s} fill="currentColor" />
    </g>
  );
  const inFinder = (x: number, y: number) => (x < 3 && y < 3) || (x > n - 4 && y < 3) || (x < 3 && y > n - 4);
  return (
    <svg width={size} height={size} aria-hidden className="text-base-content">
      {cells.map((on, i) => {
        const x = i % n;
        const y = Math.floor(i / n);
        return on && !inFinder(x, y) ? <rect key={i} x={x * s} y={y * s} width={s} height={s} fill="currentColor" /> : null;
      })}
      {finder(0, 0)}
      {finder(n - 3, 0)}
      {finder(0, n - 3)}
    </svg>
  );
}

/**
 * CredentialCard — crachá do participante do evento.
 * O padrão no canto é decorativo: troque por um QR Code real (ex.: biblioteca `qrcode`) para check-in.
 */
export function CredentialCard({
  name,
  team,
  role,
  event,
  code,
  tone = "primary",
  className,
}: {
  name: string;
  team: string;
  role: string;
  event: string;
  code: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <article className={cn("relative mx-auto w-full max-w-[17rem] pt-6", className)}>
      {/* cordão */}
      <span aria-hidden className={cn("absolute left-1/2 top-0 h-8 w-10 -translate-x-1/2 rounded-b-md", toneFill[tone])} />
      <div className="stage-paper stage-ink stage-shadow-lg relative overflow-hidden rounded-[1.25rem] bg-base-100">
        <div className={cn("stage-texture stage-grid-on-color relative px-5 pb-10 pt-6", toneFill[tone])}>
          <span aria-hidden className="absolute left-1/2 top-3 h-2 w-12 -translate-x-1/2 rounded-full bg-base-100/90" />
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] opacity-80">Credencial</p>
          <p className="mt-1 text-lg font-black leading-tight tracking-tight">{event}</p>
        </div>
        <div className="relative z-10 -mt-8 flex justify-center">
          <TeamAvatar name={name} size={72} className="ring-4" />
        </div>
        <div className="px-5 pb-5 pt-3 text-center">
          <h3 className="text-xl font-black leading-tight tracking-tight">{name}</h3>
          <p className="text-sm text-base-content/65">{team}</p>
          <span className={cn("stage-label mt-3 inline-block rounded-tl-md rounded-br-md px-2 py-1", toneSoft[tone])}>{role}</span>
          <div className="mt-4 flex items-end justify-between border-t border-dashed border-base-300 pt-4">
            <div className="text-left">
              <p className="stage-label text-base-content/45">Código</p>
              <p className="font-mono text-sm font-bold tracking-wider">{code}</p>
            </div>
            <CodePattern code={code} size={64} />
          </div>
        </div>
      </div>
    </article>
  );
}
