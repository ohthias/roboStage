import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock,
  Github,
  Hash,
  ListTree,
  Newspaper,
} from "lucide-react";

import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import { AnimatedBackground, SectionTitle, toneClasses } from "@/components/home/shared";
import { NewsCard, NewsCover, categorySlug, categoryStyle } from "@/components/news/NewsUI";
import { ReadingProgress, ShareArticle } from "@/components/news/ArticleClient";
import "@/components/home/home.css";
import {
  extractHeadings,
  formatNewsDate,
  getAdjacentNews,
  getNews,
  getPublishedNews,
  getRelatedNews,
  headingId,
  newsHref,
  readingMinutes,
  type NewsSummary,
} from "@/utils/institutional/news";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPublishedNews().map((n) => ({ slug: n.slug }));
}

function load(slug: string) {
  const file = getNews(decodeURIComponent(slug));
  if (!file || file.data.draft || !file.data.title) return null;
  return { content: file.content, data: { ...file.data, slug } as NewsSummary };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = load(slug);
  if (!article) return { title: "Notícia não encontrada" };
  const { data } = article;
  return {
    title: data.title,
    description: data.description,
    alternates: { canonical: newsHref(slug) },
    openGraph: {
      type: "article",
      title: data.title,
      description: data.description,
      publishedTime: data.date,
      authors: data.author ? [data.author] : undefined,
      tags: data.tags,
      images: data.cover ? [data.cover] : undefined,
    },
  };
}

/* --------------------------------------------------------- componentes MDX */

const textOf = (node: ReactNode): string =>
  typeof node === "string" || typeof node === "number"
    ? String(node)
    : Array.isArray(node)
      ? node.map(textOf).join("")
      : node && typeof node === "object" && "props" in node
        ? textOf((node as { props: { children?: ReactNode } }).props.children)
        : "";

function Heading({ as: Tag, children }: { as: "h2" | "h3"; children?: ReactNode }) {
  const id = headingId(textOf(children));
  return (
    <Tag id={id} className="group scroll-mt-28">
      <a href={`#${id}`} className="!font-[inherit] !text-base-content no-underline">
        {children}
        <Hash size={16} aria-hidden="true" className="ml-2 inline align-baseline text-base-content/20 opacity-0 transition-opacity group-hover:opacity-100" />
      </a>
    </Tag>
  );
}

const mdx = {
  h1: ({ children }: { children?: ReactNode }) => <Heading as="h2">{children}</Heading>,
  h2: ({ children }: { children?: ReactNode }) => <Heading as="h2">{children}</Heading>,
  h3: ({ children }: { children?: ReactNode }) => <Heading as="h3">{children}</Heading>,
  a: ({ href = "", children }: { href?: string; children?: ReactNode }) =>
    href.startsWith("http") ? (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
        <ArrowUpRight size={13} aria-hidden="true" className="ml-0.5 inline align-text-top" />
      </a>
    ) : (
      <a href={href}>{children}</a>
    ),
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="not-italic rounded-tl-xl rounded-br-xl border-l-4 border-accent bg-accent/10 px-5 py-1 [&_p]:before:content-none [&_p]:after:content-none">
      {children}
    </blockquote>
  ),
  pre: ({ children }: { children?: ReactNode }) => (
    <pre className="rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none bg-[#1f1c18] text-[#f3ecdc]">{children}</pre>
  ),
  img: ({ src = "", alt = "" }: { src?: string; alt?: string }) => (
    <img src={src} alt={alt} loading="lazy" className="rounded-tl-2xl rounded-br-2xl border border-base-300" />
  ),
  table: ({ children }: { children?: ReactNode }) => (
    <div className="not-prose my-6 overflow-x-auto rounded-tl-xl rounded-br-xl border border-base-300">
      <table className="table table-sm">{children}</table>
    </div>
  ),
  hr: () => <hr className="border-dashed border-base-300" />,
};

/* ------------------------------------------------------------------- página */

export default async function Article({ params }: Params) {
  const { slug } = await params;
  const article = load(slug);
  if (!article) notFound();

  const { content, data } = article;
  const minutes = readingMinutes(content);
  const headings = extractHeadings(content);
  const { newer, older } = getAdjacentNews(data.slug);
  const related = getRelatedNews(data);
  const { tone, icon: CatIcon } = categoryStyle(data.category);
  const c = toneClasses[tone];

  return (
    <>
      <ReadingProgress targetId="artigo" />
      <Navbar />
      <main className="overflow-x-clip bg-base-100 text-base-content">
        {/* ======================================================== TOPO */}
        <header className="relative isolate overflow-hidden px-6 pb-14 pt-10 sm:pt-14">
          <AnimatedBackground />
          <div className="mx-auto max-w-6xl">
            <nav aria-label="Trilha" className="flex flex-wrap items-center gap-2 font-mono text-xs text-base-content/45">
              <Link href="/" className="hover:text-primary">início</Link>
              <span>/</span>
              <Link href="/news" className="hover:text-primary">notícias</Link>
              {data.category && (
                <>
                  <span>/</span>
                  <Link href={`/news?categoria=${categorySlug(data.category)}#lista`} className="hover:text-primary">
                    {data.category.toLowerCase()}
                  </Link>
                </>
              )}
            </nav>

            <div className="mt-8 max-w-4xl">
              {data.category && (
                <span className={`inline-flex items-center gap-2 rounded-tl-lg rounded-br-lg px-3 py-1 text-[11px] font-bold tracking-[0.18em] ${c.icon}`}>
                  <CatIcon size={13} />
                  {data.category.toUpperCase()}
                </span>
              )}
              <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                {data.title}
                <span className="text-primary">.</span>
              </h1>
              {data.description && (
                <p className="mt-6 max-w-3xl text-lg leading-8 text-base-content/65 sm:text-xl">{data.description}</p>
              )}
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-dashed border-base-300 pt-6 text-sm text-base-content/60">
              {data.author && (
                <span className="inline-flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-tl-lg rounded-br-lg bg-base-content font-mono text-xs font-bold text-base-100">
                    {String(data.author).slice(0, 2).toUpperCase()}
                  </span>
                  <span className="font-semibold text-base-content">{data.author}</span>
                </span>
              )}
              {data.date && (
                <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                  <CalendarDays size={14} />
                  <time dateTime={data.date}>{formatNewsDate(data.date, "long")}</time>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                <Clock size={14} />
                {minutes} min de leitura
              </span>
              <ShareArticle
                title={data.title}
                className="btn btn-sm ml-auto rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none border-base-300 bg-base-100"
              />
            </div>
          </div>
        </header>

        {data.cover && (
          <div className="px-6">
            <div className="mx-auto max-w-6xl">
              <NewsCover
                news={data}
                big
                className="aspect-[16/7] rounded-tl-[2rem] rounded-br-[2rem] border border-base-300 shadow-[10px_10px_0_0_var(--color-secondary)]"
              />
            </div>
          </div>
        )}

        {/* ====================================================== CORPO */}
        <section className="px-6 py-16">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_17rem]">
            <article
              id="artigo"
              className="prose prose-base max-w-none sm:prose-lg prose-headings:font-bold prose-headings:tracking-tight prose-h2:mt-14 prose-h2:border-b prose-h2:border-base-300 prose-h2:pb-3 prose-a:font-semibold prose-a:text-primary prose-a:underline-offset-4 prose-strong:text-base-content prose-code:rounded prose-code:bg-base-200 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-li:marker:text-primary"
            >
              <MDXRemote source={content} components={mdx} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />

              {Array.isArray(data.tags) && data.tags.length > 0 && (
                <div className="not-prose mt-14 flex flex-wrap items-center gap-2 border-t border-dashed border-base-300 pt-6">
                  <span className="mr-1 font-mono text-[10px] font-bold tracking-[0.2em] text-base-content/40">TAGS</span>
                  {data.tags.map((tag) => (
                    <span key={tag} className="rounded-tl-md rounded-br-md bg-base-200 px-2.5 py-1 font-mono text-xs text-base-content/70">
                      #{String(tag).toLowerCase()}
                    </span>
                  ))}
                </div>
              )}
            </article>

            {/* ------------------------------------------------ LATERAL */}
            <aside className="order-first lg:order-none">
              <div className="space-y-4 lg:sticky lg:top-24">
                {headings.length > 1 && (
                  <details open className="group rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 lg:[&>summary]:pointer-events-none">
                    <summary className="flex cursor-pointer list-none items-center justify-between border-b border-base-300 px-5 py-3 font-mono text-[10px] font-bold tracking-[0.2em] text-base-content/50">
                      <span className="inline-flex items-center gap-2">
                        <ListTree size={13} className="text-primary" />
                        NESTA NOTÍCIA
                      </span>
                      <span className="text-base-content/30 lg:hidden">{headings.length}</span>
                    </summary>
                    <ol className="max-h-[50vh] space-y-0.5 overflow-y-auto p-2">
                      {headings.map((h) => (
                        <li key={h.id}>
                          <a
                            href={`#${h.id}`}
                            className={`block rounded-tl-md rounded-br-md px-3 py-1.5 text-sm leading-5 text-base-content/65 transition-colors hover:bg-base-200 hover:text-primary ${h.level === 3 ? "pl-6 text-xs" : ""}`}
                          >
                            {h.text}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </details>
                )}

                <div className="hidden rounded-tl-2xl rounded-br-2xl border border-dashed border-base-content/25 p-5 lg:block">
                  <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-base-content/45">ACHOU ALGO?</p>
                  <p className="mt-2 text-sm leading-6 text-base-content/60">
                    Sugestões e problemas viram issues no GitHub e guiam as próximas versões.
                  </p>
                  <a
                    href="https://github.com/ohthias/roboStage/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold hover:text-primary"
                  >
                    <Github size={15} />
                    Abrir issue
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* =================================================== ANTERIOR / PRÓXIMA */}
        {(older || newer) && (
          <nav aria-label="Outras notícias" className="px-6 pb-16">
            <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2">
              {older ? (
                <Link
                  href={newsHref(older.slug)}
                  className="group flex flex-col rounded-tl-2xl rounded-br-2xl border border-base-300 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-base-content/45">
                    <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-1" />
                    ANTERIOR
                  </span>
                  <span className="mt-3 font-bold leading-snug group-hover:text-primary">{older.title}</span>
                </Link>
              ) : (
                <span className="hidden sm:block" />
              )}
              {newer && (
                <Link
                  href={newsHref(newer.slug)}
                  className="group flex flex-col rounded-tl-2xl rounded-br-2xl border border-base-300 p-6 text-right transition-all hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <span className="inline-flex items-center justify-end gap-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-base-content/45">
                    PRÓXIMA
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="mt-3 font-bold leading-snug group-hover:text-primary">{newer.title}</span>
                </Link>
              )}
            </div>
          </nav>
        )}

        {/* ========================================================= RELACIONADAS */}
        {related.length > 0 && (
          <section className="border-t border-base-300 bg-base-200/40 px-6 py-20">
            <div className="mx-auto max-w-6xl">
              <RevealOnScroll>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <SectionTitle kicker="/ CONTINUE LENDO" title="Sobre o" highlight="mesmo assunto." highlightClass="bg-secondary text-secondary-content" />
                  <Link
                    href="/news"
                    className="inline-flex items-center gap-2 rounded-tl-lg rounded-br-lg border border-base-300 bg-base-100 px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
                  >
                    <Newspaper size={16} />
                    Todas as notícias
                  </Link>
                </div>
              </RevealOnScroll>
              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((n, i) => (
                  <RevealOnScroll key={n.slug} delay={i * 0.06} className="h-full">
                    <NewsCard news={n} />
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
