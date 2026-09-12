import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Newspaper,
  Sparkles,
} from "lucide-react";

import { getAllNews } from "@/utils/institutional/news";
import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import Header from "@/components/UI/Header";

export const metadata = {
  title: "Notícias",
  description:
    "Fique por dentro das últimas novidades, atualizações e anúncios importantes relacionados à nossa plataforma. Acompanhe as notícias para se manter informado sobre os recursos mais recentes, melhorias e eventos relevantes.",
};

interface NewsArticle {
  slug: string;
  title: string;
  description?: string;
  cover?: string;
  category?: string;
  date?: string;
  tags?: string[];
  featured?: boolean;
  draft?: boolean;
}

export const sanitizeNewsSlug = (slug: unknown): string => {
  if (typeof slug !== "string") return "";

  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const toSafeNewsHref = (slug: unknown) => {
  const safeSlug = sanitizeNewsSlug(slug);

  return safeSlug
    ? `/news/${encodeURIComponent(safeSlug)}`
    : "/news";
};

function formatDate(date?: string) {
  if (!date) return "";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function NewsCard({
  article,
  featured = false,
}: {
  article: NewsArticle;
  featured?: boolean;
}) {
  const safeHref = toSafeNewsHref(article.slug);

  return (
    <Link
      href={safeHref}
      className="group block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <article
        className={`card h-full overflow-hidden border border-base-300 bg-base-100 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-xl ${featured ? "lg:flex-row" : ""}`}
      >
        {/* Cover */}
        {article.cover ? (
          <figure
            className={`relative overflow-hidden bg-base-200 ${featured ? "aspect-video lg:aspect-auto lg:w-1/2" : "aspect-video"}`}
          >
            <Image
              src={article.cover}
              alt={article.title}
              fill
              sizes={
                featured
                  ? "(max-width: 1024px) 100vw, 50vw"
                  : "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              }
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

            {featured && (
              <div className="absolute left-4 top-4">
                <span className="badge badge-primary gap-1.5 border-none text-primary-content">
                  <Sparkles size={13} aria-hidden="true" />
                  Em destaque
                </span>
              </div>
            )}
          </figure>
        ) : (
          <div
            className={`flex items-center justify-center bg-gradient-to-br from-primary/10 via-base-200 to-base-300 ${featured ? "aspect-video lg:aspect-auto lg:w-1/2" : "aspect-video"}`}
          >
            <Newspaper
              size={featured ? 48 : 42}
              strokeWidth={1.5}
              className="text-primary/40"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Content */}
        <div
          className={`card-body gap-4 p-5 sm:p-6 ${featured ? "lg:p-8" : ""}`}
        >
          {/* Meta */}
          <div className="flex min-h-6 items-center justify-between gap-3">
            {article.category ? (
              <span className="badge badge-primary badge-outline">
                {article.category}
              </span>
            ) : (
              <span />
            )}

            {article.date && (
              <span className="flex shrink-0 items-center gap-1.5 text-xs text-base-content/50">
                <CalendarDays size={13} aria-hidden="true" />
                {formatDate(article.date)}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className={`card-title leading-snug transition-colors group-hover:text-primary ${featured ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"}`}
          >
            {article.title}
          </h3>

          {/* Description */}
          {article.description && (
            <p
              className={`text-base-content/65 leading-6 ${featured ? "line-clamp-4 text-base" : "line-clamp-3 text-sm sm:text-base"}`}
            >
              {article.description}
            </p>
          )}

          {/* Tags */}
          {Array.isArray(article.tags) && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {article.tags.slice(0, featured ? 5 : 3).map((tag) => (
                <span
                  key={tag}
                  className="badge badge-ghost badge-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action */}
          <div className="card-actions mt-auto pt-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Ler mais

              <ArrowRight
                size={16}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function NewsPage() {
  const allNews = getAllNews() as NewsArticle[];

  // Não exibe rascunhos no site público
  const news = allNews.filter((article) => !article.draft);

  // Notícias marcadas como featured
  const featuredNews = news.filter((article) => article.featured);

  // Notícias normais
  const regularNews = news.filter((article) => !article.featured);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-base-100">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-base-100 to-base-100" />

          <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-12 sm:pt-16 md:px-8">
            <Header
              type="News"
              name="Notícias da"
              highlight="Plataforma"
              description="Fique por dentro das últimas novidades, atualizações e anúncios importantes relacionados à nossa plataforma. Acompanhe as notícias para se manter informado sobre os recursos mais recentes, melhorias e eventos relevantes."
            />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
          {/* =========================
              EM DESTAQUE
          ========================== */}
          {featuredNews.length > 0 && (
            <section className="mb-16">
              <div className="mb-7 flex items-end justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-primary">
                    <Sparkles
                      size={20}
                      aria-hidden="true"
                    />

                    <span className="text-sm font-semibold uppercase tracking-wider">
                      Destaques
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Em destaque
                  </h2>

                  <p className="mt-1 text-sm text-base-content/60">
                    Confira as principais novidades da plataforma.
                  </p>
                </div>

                <div className="badge badge-primary badge-outline hidden sm:flex">
                  {featuredNews.length}{" "}
                  {featuredNews.length === 1
                    ? "destaque"
                    : "destaques"}
                </div>
              </div>

              <div className="grid gap-6">
                {featuredNews.map((article) => (
                  <NewsCard
                    key={toSafeNewsHref(article.slug)}
                    article={article}
                    featured
                  />
                ))}
              </div>
            </section>
          )}

          {/* =========================
              ÚLTIMAS PUBLICAÇÕES
          ========================== */}
          <section>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-primary">
                  <Newspaper
                    size={20}
                    aria-hidden="true"
                  />

                  <span className="text-sm font-semibold uppercase tracking-wider">
                    Atualizações
                  </span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Últimas publicações
                </h2>
              </div>

              <div className="badge badge-outline gap-2 px-4 py-3 text-sm">
                <Newspaper
                  size={14}
                  aria-hidden="true"
                />

                {regularNews.length}{" "}
                {regularNews.length === 1
                  ? "notícia"
                  : "notícias"}
              </div>
            </div>

            {regularNews.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {regularNews.map((article) => (
                  <NewsCard
                    key={toSafeNewsHref(article.slug)}
                    article={article}
                  />
                ))}
              </div>
            ) : (
              <div className="card border border-base-300 bg-base-100 shadow-sm">
                <div className="card-body items-center py-16 text-center">
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-base-200">
                    <Newspaper
                      size={28}
                      className="text-base-content/40"
                      aria-hidden="true"
                    />
                  </div>

                  <h2 className="card-title">
                    Nenhuma publicação disponível
                  </h2>

                  <p className="max-w-md text-sm text-base-content/60">
                    Ainda não há outras publicações disponíveis.
                    Volte novamente em breve para conferir as novidades.
                  </p>
                </div>
              </div>
            )}
          </section>
        </section>
      </main>

      <Footer />
    </>
  );
}