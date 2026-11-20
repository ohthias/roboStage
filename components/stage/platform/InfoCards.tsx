import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Download, MapPin, Quote, Smartphone, Users } from "lucide-react";
import { cn, toneFill, toneSoft, toneText, type Tone } from "../lib";
import { TeamAvatar } from "../core/Data";

/* ------------------------------------------------------------------ */
/*  Cards de informação                                                */
/* ------------------------------------------------------------------ */

/* ======================================================== FEATURE */

export type FeatureCardProps = {
  title: string;
  description: string;
  category: string;
  icon: ReactNode;
  href?: string;
  image?: string;
  /** Número do card na grade ("01"). */
  index?: number;
  badge?: string;
  mobileSafe?: boolean;
  /** Crédito: [nome, url]. */
  credit?: [string, string];
  /** Conteúdo interativo extra (ex.: seletor de temporada), clicável sem abrir o card. */
  extra?: ReactNode;
  extraLabel?: string;
  ctaLabel?: string;
  /** Cor do destaque (sombra, aba, ícone). Padrão: primary. */
  tone?: "primary" | "secondary" | "accent" | "success" | "info";
  className?: string;
};

const featureTone = {
  primary: { hover: "hover:border-primary hover:shadow-[8px_8px_0_var(--color-primary)] has-[.card-link:focus-visible]:border-primary has-[.card-link:focus-visible]:shadow-[8px_8px_0_var(--color-primary)]", tab: "group-hover:border-primary group-hover:bg-primary group-hover:text-primary-content group-has-[.card-link:focus-visible]:bg-primary group-has-[.card-link:focus-visible]:text-primary-content", ring: "shadow-[4px_4px_0_var(--color-primary)] ring-primary/30 text-primary", cat: "text-primary/80" },
  secondary: { hover: "hover:border-secondary hover:shadow-[8px_8px_0_var(--color-secondary)] has-[.card-link:focus-visible]:border-secondary has-[.card-link:focus-visible]:shadow-[8px_8px_0_var(--color-secondary)]", tab: "group-hover:border-secondary group-hover:bg-secondary group-hover:text-secondary-content group-has-[.card-link:focus-visible]:bg-secondary group-has-[.card-link:focus-visible]:text-secondary-content", ring: "shadow-[4px_4px_0_var(--color-secondary)] ring-secondary/30 text-secondary", cat: "text-secondary/80" },
  accent: { hover: "hover:border-accent hover:shadow-[8px_8px_0_var(--color-accent)] has-[.card-link:focus-visible]:border-accent has-[.card-link:focus-visible]:shadow-[8px_8px_0_var(--color-accent)]", tab: "group-hover:border-accent group-hover:bg-accent group-hover:text-accent-content group-has-[.card-link:focus-visible]:bg-accent group-has-[.card-link:focus-visible]:text-accent-content", ring: "shadow-[4px_4px_0_var(--color-accent)] ring-accent/40 text-[color-mix(in_oklab,var(--color-accent)_55%,var(--color-base-content))]", cat: "text-[color-mix(in_oklab,var(--color-accent)_50%,var(--color-base-content))]" },
  success: { hover: "hover:border-success hover:shadow-[8px_8px_0_var(--color-success)] has-[.card-link:focus-visible]:border-success has-[.card-link:focus-visible]:shadow-[8px_8px_0_var(--color-success)]", tab: "group-hover:border-success group-hover:bg-success group-hover:text-success-content group-has-[.card-link:focus-visible]:bg-success group-has-[.card-link:focus-visible]:text-success-content", ring: "shadow-[4px_4px_0_var(--color-success)] ring-success/30 text-success", cat: "text-success/90" },
  info: { hover: "hover:border-info hover:shadow-[8px_8px_0_var(--color-info)] has-[.card-link:focus-visible]:border-info has-[.card-link:focus-visible]:shadow-[8px_8px_0_var(--color-info)]", tab: "group-hover:border-info group-hover:bg-info group-hover:text-info-content group-has-[.card-link:focus-visible]:bg-info group-has-[.card-link:focus-visible]:text-info-content", ring: "shadow-[4px_4px_0_var(--color-info)] ring-info/30 text-info", cat: "text-info/90" },
};

/**
 * FeatureCard — o card de ferramenta do QuickBrick, generalizado.
 * Cantos de 30px, capa (imagem ou pontilhado com ícone), link esticado no
 * título (teclado e leitor de tela), sombra dura colorida e a aba
 * "Abrir ferramenta" que abre no hover/foco.
 */
export function FeatureCard({
  title,
  description,
  category,
  icon,
  href,
  image,
  index,
  badge,
  mobileSafe,
  credit,
  extra,
  extraLabel = "Escolha a temporada",
  ctaLabel = "Abrir ferramenta",
  tone = "primary",
  className,
}: FeatureCardProps) {
  const t = featureTone[tone];
  const hasLink = !!href;
  const numero = index != null ? String(index).padStart(2, "0") : null;
  return (
    <article
      className={cn(
        "stage-paper group flex h-full flex-col overflow-hidden rounded-none rounded-tl-[30px] rounded-br-[30px] border border-base-300 bg-base-100 transition-[transform,box-shadow,border-color] duration-200 ease-out",
        hasLink
          ? cn("hover:-translate-x-1 hover:-translate-y-1 has-[.card-link:focus-visible]:-translate-x-1 has-[.card-link:focus-visible]:-translate-y-1 motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0", t.hover)
          : "hover:border-primary/60",
        className,
      )}
    >
      {image ? (
        <figure className="relative overflow-hidden border-b border-base-300 bg-base-200">
          <Image src={image} alt="" width={640} height={360} className="aspect-video w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100" />
          <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base-100/60 via-transparent to-transparent" />
        </figure>
      ) : !extra ? (
        <div aria-hidden className="stage-dots relative grid aspect-video place-items-center overflow-hidden border-b border-base-300 bg-base-200/60 [background-size:16px_16px]">
          <span className={cn("grid size-16 place-items-center rounded-none rounded-tl-2xl rounded-br-2xl bg-base-100 ring-1 transition-transform duration-300 group-hover:-rotate-6 motion-reduce:group-hover:rotate-0 [&>svg]:size-7", t.ring)}>
            {icon}
          </span>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider", t.cat)}>
            <span className={cn("grid size-8 place-items-center rounded-none rounded-tl-lg rounded-br-lg [&>svg]:size-4", toneSoft[tone])}>{icon}</span>
            {category}
          </span>
          <span className="flex items-center gap-1.5">
            {badge && <span className="badge badge-secondary badge-sm font-semibold">{badge}</span>}
            {mobileSafe && (
              <span className="badge badge-success badge-sm gap-1 md:hidden">
                <Smartphone className="size-3" /> Mobile
              </span>
            )}
            {numero && <span className="font-mono text-xs tabular-nums text-base-content/30">{numero}</span>}
          </span>
        </div>

        <h3 className="text-lg font-bold leading-tight">
          {hasLink ? (
            <Link href={href!} className="card-link outline-none after:absolute after:inset-0 after:z-0 after:content-['']">
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-base-content/70">{description}</p>

        {extra && (
          <div className="relative z-10 mt-1">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-base-content/40">{extraLabel}</p>
            {extra}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-3 pl-6">
        <div className="min-w-0 pb-5">
          {credit && (
            <a className="relative z-10 text-xs font-semibold text-secondary underline-offset-2 transition-colors hover:text-primary hover:underline" href={credit[1]} target="_blank" rel="noopener noreferrer">
              Desenvolvido por {credit[0]}
            </a>
          )}
        </div>
        {hasLink && (
          <span
            aria-hidden
            className={cn(
              "flex h-12 shrink-0 items-center gap-2 rounded-none rounded-tl-[18px] border-l border-t border-base-300 bg-base-200/60 pl-4 pr-5 text-xs font-semibold text-base-content/60 transition-colors duration-200",
              t.tab,
            )}
          >
            <span className="max-w-0 overflow-hidden whitespace-nowrap transition-[max-width] duration-300 group-hover:max-w-32 group-has-[.card-link:focus-visible]:max-w-32">{ctaLabel}</span>
            <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:rotate-45" />
          </span>
        )}
      </div>
    </article>
  );
}

/* =========================================================== STAT */

/** StatCard — indicador com variação e minigráfico (dashboard, LabTest). */
export function StatCard({
  label,
  value,
  unit,
  delta,
  deltaLabel = "vs. semana passada",
  trend,
  icon,
  tone = "primary",
  className,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  /** Variação em %: positivo = sobe (verde), negativo = cai (vermelho). */
  delta?: number;
  deltaLabel?: string;
  /** Série curta para o minigráfico. */
  trend?: number[];
  icon?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const up = (delta ?? 0) >= 0;
  const path = (() => {
    if (!trend || trend.length < 2) return null;
    const min = Math.min(...trend);
    const max = Math.max(...trend);
    const span = max - min || 1;
    return trend.map((v, i) => `${(i / (trend.length - 1)) * 100},${28 - ((v - min) / span) * 26}`).join(" ");
  })();
  return (
    <div className={cn("stage-paper stage-ink group rounded-2xl bg-base-100 p-5 transition-colors hover:border-primary/40", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-base-content/65">{label}</p>
        {icon && <span className={cn("grid size-9 place-items-center rounded-tl-lg rounded-br-lg transition-colors", toneSoft[tone])}>{icon}</span>}
      </div>
      <p className="mt-3 text-4xl font-black leading-none tracking-tight tabular-nums">
        {value}
        {unit && <span className="ml-1 text-base font-bold text-base-content/50">{unit}</span>}
      </p>
      <div className="mt-4 flex items-end justify-between gap-4">
        {delta != null ? (
          <p className="text-xs">
            <span className={cn("inline-flex items-center gap-0.5 rounded-tl-md rounded-br-md px-1.5 py-0.5 font-bold", up ? "bg-success/15 text-success" : "bg-error/15 text-error")}>
              {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(delta)}%
            </span>
            <span className="ml-2 text-base-content/50">{deltaLabel}</span>
          </p>
        ) : (
          <span />
        )}
        {path && (
          <svg viewBox="0 0 100 30" className={cn("h-8 w-24 shrink-0 overflow-visible", toneText[tone])} aria-hidden>
            <polyline points={path} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
        )}
      </div>
    </div>
  );
}

/* =========================================================== TEAM */

/** TeamCard — perfil de equipe (ranking, organizações, convites). */
export function TeamCard({
  name,
  number,
  city,
  avatar,
  tags = [],
  stats = [],
  members,
  href,
  tone = "secondary",
  className,
}: {
  name: string;
  number?: string;
  city?: string;
  avatar?: string;
  tags?: string[];
  stats?: { label: string; value: ReactNode }[];
  members?: number;
  href?: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <article className={cn("stage-paper stage-ink group overflow-hidden rounded-tl-[30px] rounded-br-[30px] bg-base-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--stage-shadow)]", className)}>
      <div className={cn("stage-texture stage-grid-on-color relative h-20", toneFill[tone])}>
        {number && <span className="absolute right-4 top-3 font-mono text-xs font-bold tracking-[0.15em] opacity-80">#{number}</span>}
      </div>
      <div className="relative px-5 pb-5">
        <TeamAvatar name={name} src={avatar} size={64} className="-mt-8 ring-4" />
        <h3 className="mt-3 text-lg font-black leading-tight tracking-tight">
          {href ? (
            <Link href={href} className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline">
              {name}
            </Link>
          ) : (
            name
          )}
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/60">
          {city && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} /> {city}
            </span>
          )}
          {members != null && (
            <span className="inline-flex items-center gap-1">
              <Users size={12} /> {members} membros
            </span>
          )}
        </p>
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="rounded-tl-md rounded-br-md border border-base-content/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-base-content/70">
                {t}
              </span>
            ))}
          </div>
        )}
        {stats.length > 0 && (
          <dl className="mt-4 grid grid-cols-3 divide-x divide-base-300 rounded-tl-xl rounded-br-xl border border-base-300 bg-base-200/40 py-2 text-center">
            {stats.map((s) => (
              <div key={s.label} className="px-1">
                <dd className="text-lg font-black tracking-tight tabular-nums">{s.value}</dd>
                <dt className="stage-label mt-0.5 text-base-content/45">{s.label}</dt>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
}

/* ============================================================ DOC */

const docKind: Record<string, { label: string; tone: Tone }> = {
  pdf: { label: "PDF", tone: "primary" },
  doc: { label: "DOC", tone: "secondary" },
  sheet: { label: "XLS", tone: "success" },
  link: { label: "LINK", tone: "info" },
  video: { label: "VÍDEO", tone: "accent" },
};

/** DocCard — documento/recurso em linha (regras, manuais, guias de missão). */
export function DocCard({
  title,
  meta,
  kind = "pdf",
  href,
  updated,
  isNew,
  className,
}: {
  title: string;
  meta?: string;
  kind?: keyof typeof docKind;
  href: string;
  updated?: string;
  isNew?: boolean;
  className?: string;
}) {
  const k = docKind[kind];
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn("stage-paper stage-ink group flex min-w-0 items-center gap-4 rounded-tl-xl rounded-br-xl bg-base-100 p-3 pr-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary", className)}
    >
      <span className={cn("stage-noise relative grid h-14 w-11 shrink-0 place-items-end rounded-tl-md rounded-br-md pb-1.5 [clip-path:polygon(0_0,70%_0,100%_22%,100%_100%,0_100%)]", toneFill[k.tone])}>
        <span className="absolute right-0 top-0 h-[22%] w-[30%] bg-black/20" aria-hidden />
        <span className="w-full text-center font-mono text-[9px] font-bold tracking-wider">{k.label}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-bold leading-tight">{title}</span>
          {isNew && <span className="stage-label shrink-0 rounded-tl-md rounded-br-md bg-accent px-1.5 py-0.5 text-accent-content">Novo</span>}
        </span>
        <span className="mt-0.5 block truncate text-xs text-base-content/55">
          {[meta, updated && `Atualizado ${updated}`].filter(Boolean).join(" · ")}
        </span>
      </span>
      <span className="grid size-9 shrink-0 place-items-center rounded-full border border-base-300 text-base-content/60 transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-primary-content">
        {kind === "link" || kind === "video" ? <ArrowUpRight size={16} /> : <Download size={16} />}
      </span>
    </a>
  );
}

/* ========================================================== QUOTE */

/** QuoteCard — depoimento de equipe/mentor (o "kind words" da referência). */
export function QuoteCard({
  quote,
  author,
  role,
  avatar,
  tone = "accent",
  tilt,
  className,
}: {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  tone?: Tone;
  tilt?: number;
  className?: string;
}) {
  return (
    <figure
      className={cn("stage-texture stage-shadow relative flex h-full flex-col rounded-tl-[30px] rounded-br-[30px] p-6", toneFill[tone], className)}
      style={{ rotate: tilt ? `${tilt}deg` : undefined }}
    >
      <Quote size={36} className="opacity-30" fill="currentColor" aria-hidden />
      <blockquote className="mt-3 flex-1 text-lg font-semibold leading-snug tracking-tight">“{quote}”</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <TeamAvatar name={author} src={avatar} size={40} tone="paper" />
        <span>
          <span className="block text-sm font-black">{author}</span>
          {role && <span className="block text-xs opacity-75">{role}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

