import type { ReactNode } from "react";
import { AlertCircle, BookOpen, CheckCircle2, Clock, Info, Lightbulb, Quote, Scale, TriangleAlert } from "lucide-react";
import { cn, toneFill, toneSoft, toneText, type Tone } from "../lib";
import { TeamAvatar } from "./Data";
import { StageImage, type MediaFrame, type MediaRatio } from "./Media";

/* ------------------------------------------------------------------ */
/*  Tipografia e blocos de texto                                       */
/*  Escala em Roboto (black nos títulos, tracking fechado), texto      */
/*  corrido em 65–70 caracteres por linha e blocos prontos de layout.  */
/* ------------------------------------------------------------------ */

/* ========================================================== ESCALA */

const headingSize = {
  1: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight",
  2: "text-3xl sm:text-5xl font-black leading-[1] tracking-tight",
  3: "text-2xl sm:text-3xl font-black leading-tight tracking-tight",
  4: "text-xl font-bold leading-snug tracking-tight",
  5: "text-lg font-bold leading-snug",
  6: "font-mono text-xs uppercase tracking-[0.2em] text-base-content/50",
};

/** Heading — h1…h6 na escala da marca. `as` troca a tag sem trocar o visual. */
export function Heading({
  level = 2,
  as,
  children,
  className,
  id,
}: {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const Tag = as ?? (`h${level}` as const);
  return (
    <Tag id={id} className={cn(headingSize[level], className)}>
      {children}
    </Tag>
  );
}

const textSize = {
  lead: "text-lg sm:text-xl leading-relaxed text-base-content/75",
  body: "text-base leading-7 text-base-content/80",
  small: "text-sm leading-6 text-base-content/70",
  caption: "text-xs leading-5 text-base-content/55",
  mono: "font-mono text-xs uppercase tracking-[0.18em] text-base-content/50",
};

/** Text — parágrafos: lead, body, small, caption, mono. */
export function Text({
  variant = "body",
  as: As = "p",
  children,
  className,
}: {
  variant?: keyof typeof textSize;
  as?: "p" | "span" | "div";
  children: ReactNode;
  className?: string;
}) {
  return <As className={cn(textSize[variant], className)}>{children}</As>;
}

/**
 * Highlight — destaque dentro do texto.
 *  · block: bloco colorido inclinado (o do hero)
 *  · marker: marca-texto na metade de baixo
 *  · underline: sublinhado à mão (rabisco SVG)
 */
export function Highlight({
  children,
  variant = "marker",
  tone = "accent",
}: {
  children: ReactNode;
  variant?: "block" | "marker" | "underline";
  tone?: Tone;
}) {
  if (variant === "block")
    return <span className={cn("inline-block -rotate-1 px-2 italic", toneFill[tone])}>{children}</span>;
  if (variant === "underline")
    return (
      <span className="relative inline-block whitespace-nowrap">
        {children}
        <svg aria-hidden viewBox="0 0 120 12" preserveAspectRatio="none" className={cn("absolute -bottom-1.5 left-0 h-2.5 w-full", toneText[tone])}>
          <path d="M2 8 C 20 2, 35 11, 55 6 S 90 2, 118 7" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </span>
    );
  const color = tone === "primary" ? "var(--color-primary)" : tone === "secondary" ? "var(--color-secondary)" : `var(--color-${tone === "ink" ? "base-content" : tone === "paper" ? "base-200" : tone})`;
  return (
    <mark
      className="rounded-sm bg-transparent px-0.5 text-inherit [box-decoration-break:clone]"
      style={{ backgroundImage: `linear-gradient(transparent 55%, color-mix(in oklab, ${color} 45%, transparent) 55%)` }}
    >
      {children}
    </mark>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return <code className="rounded-tl-md rounded-br-md bg-base-200 px-1.5 py-0.5 font-mono text-[0.85em] text-base-content">{children}</code>;
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="inline-grid min-w-6 place-items-center rounded-md border border-b-2 border-base-content/25 bg-base-100 px-1.5 font-mono text-[0.8em] font-bold">{children}</kbd>;
}

/* =========================================================== PROSE */

/**
 * Prose — texto longo vindo do editor/markdown (notícias, docs, changelog).
 * Usa o @tailwindcss/typography (já registrado no globals.css do RoboStage)
 * com títulos em black, links vermelhos, citações com barra e tabelas finas.
 */
export function Prose({ children, size = "base", className }: { children: ReactNode; size?: "sm" | "base" | "lg"; className?: string }) {
  return (
    <div
      className={cn(
        "prose max-w-[68ch] text-base-content",
        size === "sm" && "prose-sm",
        size === "lg" && "prose-lg",
        "prose-headings:font-black prose-headings:tracking-tight prose-headings:text-base-content",
        "prose-h2:mt-12 prose-h2:text-3xl prose-h3:text-xl",
        "prose-p:text-base-content/80 prose-li:text-base-content/80 prose-li:marker:text-primary",
        "prose-strong:text-base-content prose-a:font-semibold prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:text-secondary",
        "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-base-200/50 prose-blockquote:py-1 prose-blockquote:font-semibold prose-blockquote:not-italic prose-blockquote:text-base-content",
        "prose-code:rounded-md prose-code:bg-base-200 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-base-content prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:rounded-tl-2xl prose-pre:rounded-br-2xl prose-pre:bg-[var(--stage-night)] prose-pre:text-white/90",
        "prose-hr:border-dashed prose-hr:border-base-300",
        "prose-img:rounded-tl-[2rem] prose-img:rounded-br-[2rem]",
        "prose-th:text-left prose-th:font-mono prose-th:text-xs prose-th:uppercase prose-th:tracking-wider prose-th:text-base-content/60 prose-td:text-base-content/80 prose-thead:border-base-300 prose-tr:border-base-300",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ================================================= BLOCOS DE LAYOUT */

/** TextBlock — kicker, título (com destaque), lead, conteúdo e ações. */
export function TextBlock({
  kicker,
  title,
  highlight,
  highlightTone = "primary",
  lead,
  children,
  actions,
  align = "left",
  width = "normal",
  level = 2,
  className,
}: {
  kicker?: string;
  title: ReactNode;
  highlight?: ReactNode;
  highlightTone?: Tone;
  lead?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  align?: "left" | "center";
  width?: "narrow" | "normal" | "wide";
  level?: 1 | 2 | 3;
  className?: string;
}) {
  const center = align === "center";
  const w = { narrow: "max-w-xl", normal: "max-w-3xl", wide: "max-w-5xl" }[width];
  return (
    <div className={cn(w, center && "mx-auto text-center", className)}>
      {kicker && <Text variant="mono">/ {kicker}</Text>}
      <Heading level={level} className={cn(kicker && "mt-3")}>
        {title}
        {highlight && (
          <>
            {" "}
            <span className={cn("mt-2 inline-block -rotate-1 px-3 py-1 italic", toneFill[highlightTone])}>{highlight}</span>
          </>
        )}
      </Heading>
      {lead && <Text variant="lead" className={cn("mt-6 max-w-2xl", center && "mx-auto")}>{lead}</Text>}
      {children && <div className={cn("mt-6 space-y-4", center && "mx-auto")}>{children}</div>}
      {actions && <div className={cn("mt-8 flex flex-wrap gap-3", center && "justify-center")}>{actions}</div>}
    </div>
  );
}

/** SplitText — título fixo à esquerda, texto à direita (manifesto, "sobre"). */
export function SplitText({ kicker, title, children, className }: { kicker?: string; title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-8 md:grid-cols-[1fr_1.6fr] md:gap-16", className)}>
      <div className="md:sticky md:top-24 md:self-start">
        {kicker && <Text variant="mono">/ {kicker}</Text>}
        <Heading level={3} className={cn("text-3xl sm:text-4xl", kicker && "mt-3")}>
          {title}
        </Heading>
      </div>
      <div className="space-y-5 text-base leading-7 text-base-content/80 sm:text-lg sm:leading-8">{children}</div>
    </div>
  );
}

/** Columns — texto corrido em 2 ou 3 colunas, com fio entre elas. */
export function Columns({ count = 2, children, className }: { count?: 2 | 3; children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "gap-10 text-base leading-7 text-base-content/80 [column-rule:1px_dashed_var(--color-base-300)] [&>*]:mb-4 [&>*]:break-inside-avoid",
        count === 2 ? "md:columns-2" : "md:columns-2 lg:columns-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** IconList — itens com ícone, título e texto (benefícios, recursos). */
export function IconList({
  items,
  columns = 3,
  className,
}: {
  items: { icon: ReactNode; title: string; text: ReactNode; tone?: Tone }[];
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const cols = { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3" }[columns];
  return (
    <ul className={cn("grid gap-x-8 gap-y-8", cols, className)}>
      {items.map((it) => (
        <li key={it.title} className="group flex gap-4">
          <span className={cn("grid size-11 shrink-0 place-items-center rounded-tl-xl rounded-br-xl transition-colors duration-300 [&>svg]:size-5", toneSoft[it.tone ?? "primary"])}>
            {it.icon}
          </span>
          <span>
            <span className="block font-bold leading-snug">{it.title}</span>
            <span className="mt-1 block text-sm leading-6 text-base-content/65">{it.text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Steps — passo a passo numerado (01, 02, 03…), horizontal ou vertical. */
export function Steps({
  items,
  direction = "horizontal",
  className,
}: {
  items: { title: string; text: ReactNode }[];
  direction?: "horizontal" | "vertical";
  className?: string;
}) {
  if (direction === "vertical")
    return (
      <ol className={cn("relative space-y-8 border-l-2 border-dashed border-base-300 pl-8", className)}>
        {items.map((it, i) => (
          <li key={it.title} className="relative">
            <span className="stage-noise absolute -left-[3.15rem] top-0 grid size-10 place-items-center rounded-tl-xl rounded-br-xl bg-primary font-mono text-sm font-bold text-primary-content">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h4 className="font-black tracking-tight">{it.title}</h4>
            <p className="mt-1 text-sm leading-6 text-base-content/65">{it.text}</p>
          </li>
        ))}
      </ol>
    );
  return (
    <ol className={cn("grid gap-8 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none", className)}>
      {items.map((it, i) => (
        <li key={it.title} className="relative border-t-2 border-base-content pt-5">
          <span className="font-mono text-5xl font-bold leading-none tracking-tight text-primary">{String(i + 1).padStart(2, "0")}</span>
          <h4 className="mt-4 text-lg font-black tracking-tight">{it.title}</h4>
          <p className="mt-1 text-sm leading-6 text-base-content/65">{it.text}</p>
        </li>
      ))}
    </ol>
  );
}

/** PullQuote — citação em destaque no meio do texto. */
export function PullQuote({ children, author, role, avatar, className }: { children: ReactNode; author?: string; role?: string; avatar?: string; className?: string }) {
  return (
    <figure className={cn("relative mx-auto max-w-3xl py-6 pl-10 sm:pl-14", className)}>
      <Quote aria-hidden size={44} className="absolute left-0 top-4 -scale-x-100 text-primary" fill="currentColor" />
      <blockquote className="text-2xl font-black leading-tight tracking-tight sm:text-3xl">{children}</blockquote>
      {author && (
        <figcaption className="mt-5 flex items-center gap-3">
          <TeamAvatar name={author} src={avatar} size={36} />
          <span className="text-sm">
            <span className="font-bold">{author}</span>
            {role && <span className="text-base-content/55"> · {role}</span>}
          </span>
        </figcaption>
      )}
    </figure>
  );
}

const calloutMeta = {
  info: { tone: "info" as Tone, icon: <Info size={18} />, label: "Para saber" },
  tip: { tone: "accent" as Tone, icon: <Lightbulb size={18} />, label: "Dica" },
  success: { tone: "success" as Tone, icon: <CheckCircle2 size={18} />, label: "Pronto" },
  warning: { tone: "warning" as Tone, icon: <TriangleAlert size={18} />, label: "Atenção" },
  danger: { tone: "primary" as Tone, icon: <AlertCircle size={18} />, label: "Importante" },
  rule: { tone: "secondary" as Tone, icon: <Scale size={18} />, label: "Regra oficial" },
};

/** Callout — caixa de nota no meio do texto (dica, regra, atenção…). */
export function Callout({
  type = "info",
  title,
  children,
  className,
}: {
  type?: keyof typeof calloutMeta;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const m = calloutMeta[type];
  return (
    <aside
      className={cn("stage-paper flex gap-4 rounded-tl-2xl rounded-br-2xl border border-l-4 border-base-300 bg-base-100 p-5", className)}
      style={{ borderLeftColor: `var(--color-${m.tone === "accent" ? "accent" : m.tone})` }}
    >
      <span className={cn("stage-noise grid size-9 shrink-0 place-items-center rounded-tl-lg rounded-br-lg", toneFill[m.tone])}>{m.icon}</span>
      <div className="min-w-0 text-sm leading-6 text-base-content/80">
        <p className="font-black text-base-content">{title ?? m.label}</p>
        <div className="mt-1 space-y-2">{children}</div>
      </div>
    </aside>
  );
}

/** FactList — pares rótulo/valor (ficha técnica do robô, dados do evento). */
export function FactList({ items, columns = 1, className }: { items: { label: string; value: ReactNode }[]; columns?: 1 | 2; className?: string }) {
  return (
    <dl className={cn("grid gap-x-10", columns === 2 && "sm:grid-cols-2", className)}>
      {items.map((it) => (
        <div key={it.label} className="flex items-baseline justify-between gap-4 border-b border-dashed border-base-300 py-3">
          <dt className="font-mono text-xs uppercase tracking-[0.15em] text-base-content/50">{it.label}</dt>
          <dd className="text-right font-bold">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Timeline — programação do evento ou histórico do projeto. */
export function Timeline({
  items,
  className,
}: {
  items: { time: string; title: string; text?: ReactNode; tone?: Tone; current?: boolean }[];
  className?: string;
}) {
  return (
    <ol className={cn("relative", className)}>
      {items.map((it, i) => (
        <li key={`${it.time}-${it.title}`} className="relative grid grid-cols-[4.5rem_1fr] gap-4 pb-8 last:pb-0">
          <span className={cn("pt-0.5 text-right font-mono text-sm font-bold tabular-nums", it.current ? "text-primary" : "text-base-content/50")}>{it.time}</span>
          <div className="relative border-l-2 border-base-300 pl-6">
            {i === items.length - 1 && <span aria-hidden className="absolute -left-0.5 top-4 bottom-0 w-0.5 bg-base-100" />}
            <span
              aria-hidden
              className={cn(
                "absolute -left-[0.45rem] top-1 size-3 rounded-full ring-4 ring-base-100",
                it.current ? "bg-primary" : toneFill[it.tone ?? "paper"].split(" ")[0],
                !it.current && !it.tone && "border-2 border-base-content/30",
              )}
            >
              {it.current && <span className="absolute inset-0 animate-live rounded-full bg-primary" />}
            </span>
            <p className="font-bold leading-snug">
              {it.title}
              {it.current && <span className="stage-label ml-2 rounded-tl-md rounded-br-md bg-primary px-1.5 py-0.5 text-primary-content">Agora</span>}
            </p>
            {it.text && <p className="mt-1 text-sm leading-6 text-base-content/60">{it.text}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** MediaText — imagem e texto lado a lado (troca de lado com `reverse`). */
export function MediaText({
  image,
  alt,
  frame = "card",
  ratio = "4/3",
  reverse,
  children,
  className,
}: {
  image: string;
  alt: string;
  frame?: MediaFrame;
  ratio?: MediaRatio;
  reverse?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid items-center gap-10 md:grid-cols-2 md:gap-16", className)}>
      <StageImage src={image} alt={alt} frame={frame} ratio={ratio} className={cn(reverse && "md:order-2")} />
      <div>{children}</div>
    </div>
  );
}

/* ========================================================= ARTIGO */

/** ArticleHeader — topo de notícia/doc: tags, título, lead, autor, data, leitura. */
export function ArticleHeader({
  tags = [],
  title,
  lead,
  author,
  role,
  date,
  readingTime,
  className,
}: {
  tags?: string[];
  title: ReactNode;
  lead?: ReactNode;
  author?: string;
  role?: string;
  date?: string;
  readingTime?: string;
  className?: string;
}) {
  return (
    <header className={cn("max-w-3xl", className)}>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((t, i) => (
            <span key={t} className={cn("stage-label rounded-tl-md rounded-br-md px-2 py-1", i === 0 ? "bg-primary text-primary-content" : "border border-base-content/15 text-base-content/70")}>
              {t}
            </span>
          ))}
        </div>
      )}
      <Heading level={1} className="mt-5 text-4xl sm:text-5xl md:text-6xl">
        {title}
      </Heading>
      {lead && <Text variant="lead" className="mt-5">{lead}</Text>}
      {(author || date || readingTime) && (
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-base-300 py-4 text-sm">
          {author && (
            <span className="flex items-center gap-3">
              <TeamAvatar name={author} size={36} />
              <span>
                <span className="block font-bold leading-tight">{author}</span>
                {role && <span className="block text-xs text-base-content/55">{role}</span>}
              </span>
            </span>
          )}
          {date && <span className="font-mono text-xs uppercase tracking-[0.15em] text-base-content/55">{date}</span>}
          {readingTime && (
            <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.15em] text-base-content/55">
              <Clock size={13} /> {readingTime}
            </span>
          )}
        </div>
      )}
    </header>
  );
}

/** TableOfContents — sumário lateral fixo para docs longas. */
export function TableOfContents({
  items,
  activeId,
  className,
}: {
  items: { id: string; label: string; depth?: 1 | 2 }[];
  activeId?: string;
  className?: string;
}) {
  return (
    <nav aria-label="Nesta página" className={cn("stage-paper rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-4", className)}>
      <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-base-content/50">
        <BookOpen size={12} /> Nesta página
      </p>
      <ul className="space-y-0.5 text-sm">
        {items.map((it) => {
          const active = it.id === activeId;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                aria-current={active ? "location" : undefined}
                className={cn(
                  "block rounded-tl-md rounded-br-md border-l-2 py-1.5 pr-2 transition-colors",
                  it.depth === 2 ? "pl-6 text-[13px]" : "pl-3",
                  active ? "border-primary bg-primary/10 font-semibold text-primary" : "border-transparent text-base-content/65 hover:border-base-content/30 hover:text-base-content",
                )}
              >
                {it.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** ArticleLayout — artigo com sumário lateral (o sumário some no celular). */
export function ArticleLayout({ header, toc, children, className }: { header?: ReactNode; toc?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <article className={cn("mx-auto max-w-6xl", className)}>
      {header}
      <div className={cn("mt-10 grid gap-12", !!toc && "lg:grid-cols-[minmax(0,1fr)_16rem]")}>
        <div className="min-w-0">{children}</div>
        {toc && <aside className="hidden lg:block"><div className="sticky top-24">{toc}</div></aside>}
      </div>
    </article>
  );
}
