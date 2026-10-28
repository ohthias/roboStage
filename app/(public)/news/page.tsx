import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, History, Newspaper, Sparkles, Star } from "lucide-react";

import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import PageHero, { heroBtn } from "@/components/UI/PageHero";
import { CtaBlock } from "@/components/competicoes/shared/CompetitionSections";
import { NewsCard, NewsCover, NewsMeta, categorySlug } from "@/components/news/NewsUI";
import { getPublishedNews, newsHref, type NewsSummary } from "@/utils/institutional/news";

export const metadata: Metadata = {
  title: "Notícias",
  description:
    "Novidades, atualizações, avisos de infraestrutura e bastidores do desenvolvimento do RoboStage.",
};

const monthLabel = (date?: string) => {
  if (!date) return "Sem data";
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "Sem data";
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};

function groupByMonth(list: NewsSummary[]) {
  const groups: { label: string; items: NewsSummary[] }[] = [];
  for (const n of list) {
    const label = monthLabel(n.date);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.items.push(n);
    else groups.push({ label, items: [n] });
  }
  return groups;
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string | string[] }>;
}) {
  const { categoria } = await searchParams;
  const active = typeof categoria === "string" ? categoria : "";

  const all = getPublishedNews();
  const categories = Array.from(
    all.reduce((m, n) => {
      if (n.category) m.set(n.category, (m.get(n.category) ?? 0) + 1);
      return m;
    }, new Map<string, number>()),
  ).sort((a, b) => b[1] - a[1]);

  const filtered = active ? all.filter((n) => n.category && categorySlug(n.category) === active) : all;
  const activeName = categories.find(([c]) => categorySlug(c) === active)?.[0];

  // Destaque: a marcada como featured ou, sem ela, a mais recente.
  const highlight = filtered.find((n) => n.featured) ?? filtered[0];
  const rest = filtered.filter((n) => n !== highlight);
  const latest = all[0];

  return (
    <>
      <Navbar />
      <main className="overflow-x-clip bg-base-100 text-base-content">
        <PageHero
          kicker="/ NOTÍCIAS"
          title="Notícias"
          highlight="o que está mudando por aqui."
          description="Novidades da plataforma, avisos de infraestrutura e os bastidores do desenvolvimento, contados por quem constrói o RoboStage."
          actions={
            <>
              {latest && (
                <Link href={newsHref(latest.slug)} className={heroBtn}>
                  <Sparkles size={20} />
                  Ler a mais recente
                </Link>
              )}
              <Link href="/changelog" className="btn btn-ghost btn-lg">
                <History size={18} />
                Changelog
              </Link>
            </>
          }
          aside={
            <>
              <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
                <span className="inline-flex items-center gap-2 font-mono text-xs text-base-content/60">
                  <Newspaper size={13} className="text-primary" /> feed.log
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-base-content/35">
                  <span className="size-1.5 animate-pulse rounded-full bg-success" />
                  AO VIVO
                </span>
              </div>
              <ul className="divide-y divide-base-300">
                {all.slice(0, 4).map((n) => (
                  <li key={n.slug}>
                    <Link href={newsHref(n.slug)} className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-base-200/60">
                      <time dateTime={n.date} className="w-10 shrink-0 font-mono text-[11px] text-base-content/45">
                        {n.date ? n.date.slice(8, 10) + "/" + n.date.slice(5, 7) : "—"}
                      </time>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold group-hover:text-primary">{n.title}</span>
                      <ArrowRight size={14} className="shrink-0 text-base-content/30 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="bg-[#1f1c18] px-5 py-3 font-mono text-[11px] leading-6 text-[#f3ecdc] sm:text-xs">
                <span className="opacity-60">{all.length}</span> publicações <span className="text-[#fabd32]">·</span>{" "}
                <span className="opacity-60">{categories.length}</span> categorias
              </div>
            </>
          }
        />

        {/* ========================================================= FILTRO */}
        <nav
          aria-label="Filtrar por categoria"
          className="sticky top-0
           z-20 border-y border-base-300 bg-base-100/85 px-6 py-3 backdrop-blur"
        >
          <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto [scrollbar-width:none]">
            <span className="mr-2 shrink-0 font-mono text-[10px] font-bold tracking-[0.2em] text-base-content/40">FILTRO</span>
            {[["", "Todas", all.length] as const, ...categories.map(([c, count]) => [categorySlug(c), c, count] as const)].map(
              ([slug, label, count]) => {
                const on = slug === active;
                return (
                  <Link
                    key={slug || "all"}
                    href={slug ? `/news?categoria=${slug}#lista` : "/news#lista"}
                    scroll={false}
                    aria-current={on ? "page" : undefined}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-tl-lg rounded-br-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                      on
                        ? "border-base-content bg-base-content text-base-100"
                        : "border-base-300 bg-base-100 text-base-content/70 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {label}
                    <span className={`font-mono text-[10px] ${on ? "text-base-100/60" : "text-base-content/35"}`}>{count}</span>
                  </Link>
                );
              },
            )}
          </div>
        </nav>

        <section id="lista" className="scroll-mt-32 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            {!highlight ? (
              <div className="rounded-tl-3xl rounded-br-3xl border-2 border-dashed border-base-content/20 p-12 text-center">
                <Newspaper size={32} className="mx-auto text-base-content/30" />
                <p className="mt-4 text-lg font-bold">Nada publicado {activeName ? `em ${activeName}` : "ainda"}.</p>
                <p className="mt-2 text-sm text-base-content/60">Volte em breve ou veja todas as categorias.</p>
                <Link href="/news" className="btn btn-sm mt-6 rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none">
                  Ver todas
                </Link>
              </div>
            ) : (
              <>
                {/* ------------------------------------------- DESTAQUE */}
                <RevealOnScroll>
                  <Link
                    href={newsHref(highlight.slug)}
                    className="group grid overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] border border-base-300 bg-base-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_var(--color-primary)] lg:grid-cols-[1.15fr_1fr]"
                  >
                    <NewsCover news={highlight} big className="aspect-[16/9] lg:aspect-auto lg:min-h-[22rem]" />
                    <div className="flex flex-col p-7 sm:p-10">
                      <p className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.2em] text-primary">
                        <Star size={12} className="fill-current" />
                        {highlight.featured ? "EM DESTAQUE" : "MAIS RECENTE"}
                      </p>
                      <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{highlight.title}</h2>
                      {highlight.description && (
                        <p className="mt-4 line-clamp-4 leading-7 text-base-content/65">{highlight.description}</p>
                      )}
                      <NewsMeta news={highlight} className="mt-6" />
                      <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-bold">
                        Ler notícia completa
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </RevealOnScroll>

                {/* -------------------------------------------- POR MÊS */}
                {groupByMonth(rest).map(({ label, items }) => (
                  <section key={label} className="mt-16" aria-label={label}>
                    <RevealOnScroll>
                      <div className="flex items-center gap-4">
                        <h2 className="shrink-0 font-mono text-xs font-bold uppercase tracking-[0.2em] text-base-content/50">
                          {label}
                        </h2>
                        <div className="h-px flex-1 border-t border-dashed border-base-300" />
                        <span className="shrink-0 font-mono text-xs text-base-content/35">
                          {items.length} {items.length === 1 ? "post" : "posts"}
                        </span>
                      </div>
                    </RevealOnScroll>
                    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((n, i) => (
                        <RevealOnScroll key={n.slug} delay={(i % 3) * 0.06} className="h-full">
                          <NewsCard news={n} />
                        </RevealOnScroll>
                      ))}
                    </div>
                  </section>
                ))}
              </>
            )}
          </div>
        </section>

        <CtaBlock
          kicker="ACOMPANHE"
          icon={ArrowUpRight}
          title="Quer os detalhes técnicos de cada versão?"
          text="O changelog lista tudo o que mudou, versão por versão. As releases e o código ficam abertos no GitHub."
          actions={[
            { label: "Ver changelog", href: "/changelog", variant: "accent" },
            { label: "Releases no GitHub", href: "https://github.com/ohthias/roboStage/releases", variant: "ghost" },
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
