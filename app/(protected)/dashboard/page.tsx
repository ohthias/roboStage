import { sanitizeNewsSlug } from "@/app/(public)/news/page";
import DashboardBanner from "@/components/dashboard/banner";
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

const quickAccess = [
  {
    href: "/dashboard/organizations",
    title: "Organizações",
    description:
      "Gerencie equipes, membros, funções e permissões do seu workspace.",
    icon: Building2,
    color: "text-primary",
  },
  {
    href: "/dashboard/projects",
    title: "Projetos",
    description:
      "Organize tarefas, acompanhe o progresso e colabore com sua equipe.",
    icon: FolderKanban,
    color: "text-secondary",
  },
  {
    href: "/dashboard/labtest",
    title: "LabTest",
    description:
      "Execute testes, registre resultados e acompanhe métricas de desempenho.",
    icon: Activity,
    color: "text-success",
  },
  {
    href: "/dashboard/documents",
    title: "Documentos",
    description:
      "Centralize arquivos, documentos técnicos e materiais compartilhados.",
    icon: Folder,
    color: "text-warning",
  },
];

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="space-y-8">
      <DashboardBanner nomeUsuario={user?.firstName || "Usuário"} />
      {/* Acesso Rápido */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Acesso rápido</h2>
            <p className="text-sm text-base-content/60">
              Navegue rapidamente pelos principais módulos do seu workspace.
            </p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {quickAccess.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
              >
                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-primary/5 blur-3xl transition-opacity group-hover:opacity-100" />
                <div className="relative flex h-full flex-col">
                  <div
                    className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-base-200 transition-all group-hover:scale-110 ${item.color}`}
                  >
                    <Icon size={28} />
                  </div>
                  <h3 className="text-lg font-semibold transition-colors group-hover:text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-base-content/65">
                    {item.description}
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">
                      Ir para {item.title}
                    </span>
                    <div className="rounded-full bg-base-200 p-2 transition-all group-hover:bg-primary group-hover:text-primary-content">
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

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
            {hasCover(article) ? (
              <div className="relative h-52 overflow-hidden">
                <img
                  src={article.cover}
                  alt={article.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                <span className="absolute left-4 top-4 badge badge-primary badge-sm">
                  Novidade
                </span>
              </div>
            ) : (
              <div className="flex h-52 items-center justify-center bg-gradient-to-br from-primary/10 via-base-200 to-base-300">
                <Newspaper className="size-12 text-primary/60" />
              </div>
            )}

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
