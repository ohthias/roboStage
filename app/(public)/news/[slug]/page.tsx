import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getNews } from "@/utils/news";

export default async function Article({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  try {
    const { content, data } = getNews(slug);

    return (
      <main className="min-h-screen bg-base-200/60">
        <section className="border-b border-base-300 bg-base-100">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="breadcrumbs text-sm">
              <ul>
                <li>
                  <Link href="/">Início</Link>
                </li>
                <li>
                  <Link href="/news">Notícias</Link>
                </li>
                <li className="truncate">{data.title}</li>
              </ul>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {data.category && (
                <span className="badge badge-primary badge-outline">
                  {data.category}
                </span>
              )}
              {data.featured && (
                <span className="badge badge-secondary">Destaque</span>
              )}
              {data.draft && (
                <span className="badge badge-warning">Rascunho</span>
              )}
            </div>

            <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {data.title}
            </h1>

            {data.description && (
              <p className="mt-4 max-w-3xl text-base-content/70 sm:text-lg">
                {data.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-base-content/70">
              {data.author && (
                <div className="flex items-center gap-2">
                  <div className="avatar placeholder">
                    <div className="w-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
                      <span className="text-xs font-bold">
                        {String(data.author).slice(0, 1).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <span>{data.author}</span>
                </div>
              )}

              {data.date && <span>Publicado em {data.date}</span>}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <article className="card border border-base-300 bg-base-100 shadow-xl">
            {data.cover && (
              <figure className="relative aspect-[16/7] overflow-hidden">
                <img
                  src={data.cover}
                  alt={data.title}
                  className="h-full w-full object-cover"
                />
              </figure>
            )}

            <div className="card-body px-4 py-8 sm:px-8 lg:px-12">
              <div className="prose prose-base max-w-none sm:prose-lg prose-headings:scroll-mt-24">
                <MDXRemote source={content} />
              </div>

              {Array.isArray(data.tags) && data.tags.length > 0 && (
                <>
                  <div className="divider my-8" />
                  <div className="flex flex-wrap gap-2">
                    {data.tags.map((tag: string) => (
                      <span key={tag} className="badge badge-outline">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </article>
        </section>
      </main>
    );
  } catch {
    notFound();
  }
}
