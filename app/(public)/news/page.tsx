import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllNews } from "@/utils/institutional/news";
import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import Header from "@/components/UI/Header";

export const metadata = {
  title: "Notícias",
  description:
    "Fique por dentro das últimas novidades, atualizações e anúncios importantes relacionados à nossa plataforma. Acompanhe as notícias para se manter informado sobre os recursos mais recentes, melhorias e eventos relevantes.",
};

const sanitizeNewsSlug = (slug: unknown): string => {
  if (typeof slug !== "string") return "";

  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

export default function NewsPage() {
  const news = getAllNews();

  const hasCover = (article: any) => Boolean(article?.cover);
  const toSafeNewsHref = (slug: unknown) => {
    const safeSlug = sanitizeNewsSlug(slug);
    return safeSlug ? `/news/${encodeURIComponent(safeSlug)}` : "/news";
  };

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto py-12 px-4 md:px-8">
        <Header
          type="News"
          name="Notícias da"
          highlight="Plataforma"
          description="Fique por dentro das últimas novidades, atualizações e anúncios importantes relacionados à nossa plataforma. Acompanhe as notícias para se manter informado sobre os recursos mais recentes, melhorias e eventos relevantes."
        />

        <div className="mx-auto px-6">
          <section className="mt-16">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-primary">
                Últimas publicações
              </h2>

              <div className="badge badge-outline">{news.length} notícias</div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {news.map((article: any) => (
                <Link
                  key={article.slug}
                  href={toSafeNewsHref(article.slug)}
                  className="group"
                >
                  <article className="card h-full overflow-hidden border border-base-300 bg-base-200 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-xl">
                    {hasCover(article) && (
                      <figure className="aspect-video overflow-hidden">
                        <img
                          src={article.cover}
                          alt={article.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </figure>
                    )}
                    <div className="card-body">
                      <div className="flex items-center justify-between">
                        {article.category ? (
                          <div className="badge badge-primary badge-outline">
                            {article.category}
                          </div>
                        ) : (
                          <span />
                        )}

                        <span className="text-xs opacity-60">
                          {article.date}
                        </span>
                      </div>

                      <h3 className="card-title text-xl leading-snug transition-colors group-hover:text-primary">
                        {article.title}
                      </h3>

                      <p className="line-clamp-3 text-base-content/70">
                        {article.description}
                      </p>

                      {Array.isArray(article.tags) &&
                        article.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {article.tags.slice(0, 3).map((tag: string) => (
                              <span
                                key={tag}
                                className="badge badge-ghost badge-sm"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                      <div className="card-actions mt-6 justify-end">
                        <span className="flex items-center gap-2 font-medium text-primary">
                          Ler mais
                          <ArrowRight
                            size={16}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
