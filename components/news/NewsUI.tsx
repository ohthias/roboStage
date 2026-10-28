import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Code2,
  Megaphone,
  Newspaper,
  Server,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

import { toneClasses, type Tone } from "@/components/home/shared";
import { formatNewsDate, newsHref, type NewsSummary } from "@/utils/institutional/news";

/* ------------------------------------------------------------ categorias */

const CATEGORY: Record<string, { icon: LucideIcon; tone: Tone }> = {
  atualizações: { icon: Megaphone, tone: "primary" },
  novidades: { icon: Sparkles, tone: "accent" },
  desenvolvimento: { icon: Code2, tone: "secondary" },
  infraestrutura: { icon: Server, tone: "secondary" },
  comunidade: { icon: Users, tone: "accent" },
};

export function categoryStyle(category?: string) {
  return CATEGORY[(category ?? "").toLowerCase()] ?? { icon: Newspaper, tone: "primary" as Tone };
}

export function categorySlug(category: string) {
  return category
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ----------------------------------------------------------------- capa */

const coverBg: Record<Tone, string> = {
  primary: "bg-primary text-primary-content",
  secondary: "bg-secondary text-secondary-content",
  accent: "bg-accent text-accent-content",
};

export function NewsCover({
  news,
  className = "",
  big = false,
}: {
  news: NewsSummary;
  className?: string;
  big?: boolean;
}) {
  if (news.cover) {
    return (
      <div className={`overflow-hidden bg-base-200 ${className}`}>
        <img
          src={news.cover}
          alt=""
          loading={big ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
    );
  }

  // Sem capa: bloco gráfico na cor da categoria, no estilo das formas da home.
  const { icon: Icon, tone } = categoryStyle(news.category);
  return (
    <div aria-hidden="true" className={`relative overflow-hidden ${coverBg[tone]} ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] bg-[size:20px_20px] opacity-[0.12]" />
      <div className="absolute -right-10 -top-10 size-40 rounded-full border-[22px] border-current opacity-15 transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute -bottom-6 left-8 size-16 rotate-12 rounded-tl-2xl rounded-br-2xl bg-current opacity-10" />
      <Icon
        size={big ? 64 : 40}
        strokeWidth={1.4}
        className="absolute bottom-5 left-5 opacity-80 transition-transform duration-500 group-hover:-rotate-6"
      />
      {news.category && (
        <span className="absolute right-5 top-5 font-mono text-[10px] font-bold tracking-[0.2em] opacity-70">
          {news.category.toUpperCase()}
        </span>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- meta */

export function NewsMeta({ news, className = "" }: { news: NewsSummary; className?: string }) {
  const { tone } = categoryStyle(news.category);
  return (
    <div className={`flex flex-wrap items-center gap-3 font-mono text-[11px] text-base-content/50 ${className}`}>
      {news.category && (
        <span className={`rounded-tl-md rounded-br-md bg-base-200 px-2 py-0.5 font-bold tracking-wider ${toneClasses[tone].tag}`}>
          {news.category.toUpperCase()}
        </span>
      )}
      {news.date && (
        <span className="inline-flex items-center gap-1">
          <CalendarDays size={12} />
          <time dateTime={news.date}>{formatNewsDate(news.date)}</time>
        </span>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- card */

export function NewsCard({ news, index }: { news: NewsSummary; index?: number }) {
  const { tone } = categoryStyle(news.category);
  return (
    <Link
      href={newsHref(news.slug)}
      className={`group flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${toneClasses[tone].hover}`}
    >
      <NewsCover news={news} className="aspect-[16/8]" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <NewsMeta news={news} />
          {index !== undefined && (
            <span className="font-mono text-xs text-base-content/30">/{String(index + 1).padStart(2, "0")}</span>
          )}
        </div>
        <h3 className="mt-3 text-lg font-bold leading-snug tracking-tight transition-colors group-hover:text-primary">
          {news.title}
        </h3>
        {news.description && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-base-content/60">{news.description}</p>
        )}
        <span className="mt-5 inline-flex items-center gap-1 border-t border-base-300 pt-4 text-sm font-bold">
          Ler notícia
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
