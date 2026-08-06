import { sanitizeNewsSlug } from "@/app/(public)/news/page";
import DashboardBanner from "@/components/dashboard/banner";
import OrganizationsQuickAccess from "@/components/dashboard/organizations-quick-access";
import RecentProjects from "@/components/dashboard/recent-projects";
import { getAllNews } from "@/utils/institutional/news";
import { currentUser } from "@clerk/nextjs/server";
import {
  FolderKanban,
  Building2,
  Folder,
  Activity,
  ArrowRight,
  ExternalLink,
  Newspaper,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="space-y-8">
      <DashboardBanner nomeUsuario={user?.firstName || "Usuário"} />

      {/* Organizações (Clerk) */}
      <OrganizationsQuickAccess />

      {/* Projetos recentes + criação */}
      <RecentProjects />

      {/* Últimas Notícias */}
      <LastNews />
    </div>
  );
}

function LastNews() {
  const news = getAllNews();

  const hasCover = (article: any) => Boolean(article?.cover);
  const toSafeNewsHref = (slug: unknown) => {
    const safeSlug = sanitizeNewsSlug(slug);
    return safeSlug ? `/news/${encodeURIComponent(safeSlug)}` : "/news";
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Últimas notícias</h2>
          <p className="text-sm text-base-content/60">
            Fique por dentro das novidades, atualizações e anúncios da
            plataforma.
          </p>
        </div>
        <Link href="/news" className="btn btn-sm btn-outline">
          Ver todas
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {news.slice(0, 3).map((article: any) => (
          <Link
            key={article.slug}
            href={toSafeNewsHref(article.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="group overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
          >
            <div className="flex h-52 items-center justify-center bg-gradient-to-br from-primary/10 via-base-200 to-base-300">
              <Newspaper className="size-12 text-primary/60" />
            </div>

            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between text-xs text-base-content/50">
                <span>
                  {new Date(article.date).toLocaleDateString("pt-BR")}
                </span>

                <ExternalLink
                  size={15}
                  className="opacity-0 transition group-hover:opacity-100"
                />
              </div>

              <h3 className="line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
                {article.title}
              </h3>

              <p className="line-clamp-3 text-sm leading-relaxed text-base-content/70">
                {article.description}
              </p>

              <div className="flex items-center gap-2 pt-2 text-sm font-medium text-primary">
                Ler artigo
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}