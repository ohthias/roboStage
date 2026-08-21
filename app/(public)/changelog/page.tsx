import type { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUpRight, CalendarDays, GitBranch, GitCommitHorizontal, Sparkles, Tag, } from "lucide-react";
import { getGithubReleases } from "@/utils/institutional/github";
import Header from "@/components/UI/Header";
import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Acompanhe as novidades, melhorias, correções e mudanças do RoboStage.",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatVersion(tag: string) {
  return tag.replace(/^v/, "");
}

export default async function ChangelogPage() {
  const releases = await getGithubReleases();

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
          <Header
            name="Changelog"
            description="Acompanhe a evolução do RoboStage, versão por versão."
            type="Atualizações"
            highlight=""
          />
          <section className="mx-auto mt-10 max-w-4xl">
            <div className="rounded-2xl border border-base-300 bg-base-200 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-content">
                  <GitCommitHorizontal className="size-5" />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    O que há de novo?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-base-content/70">
                    Esta página reúne o histórico de versões do RoboStage,
                    incluindo novos recursos, melhorias, correções e mudanças
                    importantes na plataforma.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-16 max-w-5xl">
            {releases.length === 0 ? (
              <div className="rounded-2xl border border-base-300 bg-base-200 p-10 text-center">
                <GitBranch className="mx-auto size-10 text-base-content/40" />
                <h2 className="mt-4 text-xl font-bold">
                  Nenhuma versão encontrada
                </h2>
                <p className="mt-2 text-sm text-base-content/60">
                  Ainda não há releases disponíveis para exibição.
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-5 top-5 hidden h-[calc(100%-2rem)] w-px bg-base-300 md:block" />
                <div className="space-y-16">
                  {releases.map((release, index) => {
                    const version = formatVersion(release.tag_name);
                    return (
                      <article
                        key={release.id}
                        className="relative md:pl-16"
                      >
                        <div className="absolute left-0 top-0 hidden md:flex">
                          <div
                            className={`flex size-10 items-center justify-center rounded-full border-4 border-base-100 ${
                              index === 0
                                ? "bg-primary text-primary-content"
                                : "bg-base-300 text-base-content/60"
                            }`}
                          >
                            {index === 0 ? (
                              <Sparkles className="size-4" />
                            ) : (
                              <Tag className="size-4" />
                            )}
                          </div>
                        </div>
                        <div
                          className={`overflow-hidden rounded-2xl border ${
                            index === 0
                              ? "border-primary/40 bg-base-100 shadow-lg"
                              : "border-base-300 bg-base-100"
                          }`}
                        >
                          <div className="border-b border-base-300 p-6 md:p-8">
                            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                              <div>
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                  <span
                                    className={`badge ${
                                      index === 0
                                        ? "badge-primary"
                                        : "badge-outline"
                                    }`}
                                  >
                                    {index === 0
                                      ? "Versão atual"
                                      : "Release"}
                                  </span>
                                  <span className="badge badge-ghost font-mono">
                                    {version}
                                  </span>
                                </div>
                                <h2 className="text-2xl font-black tracking-tight md:text-3xl">
                                  {release.name || version}
                                </h2>
                                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-base-content/60">
                                  <span className="inline-flex items-center gap-2">
                                    <CalendarDays className="size-4" />
                                    {formatDate(release.published_at)}
                                  </span>
                                  <span className="inline-flex items-center gap-2">
                                    <GitBranch className="size-4" />
                                    {release.tag_name}
                                  </span>
                                </div>
                              </div>
                              <Link
                                href={release.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline btn-sm shrink-0"
                              >
                                GitHub
                                <ArrowUpRight className="size-4" />
                              </Link>
                            </div>
                          </div>
                          <div className="p-6 md:p-8">
                            {release.body ? (
                              <div className="prose prose-sm max-w-none dark:prose-invert md:prose-base">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    h1: ({ children }) => (
                                      <h3 className="mb-4 mt-8 flex items-center gap-2 border-b border-base-300 pb-2 text-xl font-bold first:mt-0">
                                        <Sparkles className="size-5 text-primary" />
                                        {children}
                                      </h3>
                                    ),
                                    h2: ({ children }) => (
                                      <h3 className="mb-4 mt-8 flex items-center gap-2 border-b border-base-300 pb-2 text-lg font-bold first:mt-0">
                                        <span className="size-2 rounded-full bg-primary" />
                                        {children}
                                      </h3>
                                    ),
                                    h3: ({ children }) => (
                                      <h4 className="mb-3 mt-6 text-base font-bold">
                                        {children}
                                      </h4>
                                    ),
                                    ul: ({ children }) => (
                                      <ul className="my-4 space-y-2 pl-0">
                                        {children}
                                      </ul>
                                    ),
                                    li: ({ children }) => (
                                      <li className="flex gap-3 rounded-lg border border-base-300 bg-base-200/50 p-3">
                                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                                        <span>{children}</span>
                                      </li>
                                    ),
                                    a: ({ href, children }) => (
                                      <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="link link-primary"
                                      >
                                        {children}
                                      </a>
                                    ),
                                    code: ({ children }) => (
                                      <code className="rounded bg-base-300 px-1.5 py-0.5 font-mono text-sm">
                                        {children}
                                      </code>
                                    ),
                                    blockquote: ({ children }) => (
                                      <blockquote className="border-l-4 border-primary bg-base-200 px-4 py-3">
                                        {children}
                                      </blockquote>
                                    ),
                                    hr: () => (
                                      <div className="my-8 border-t border-base-300" />
                                    ),
                                  }}
                                >
                                  {release.body}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className="text-sm text-base-content/60">
                                Esta versão não possui descrição.
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-3 border-t border-base-300 bg-base-200/50 px-6 py-4 text-sm md:flex-row md:items-center md:justify-between md:px-8">
                            <span className="font-mono text-base-content/50">
                              {release.tag_name}
                            </span>
                            <Link
                              href={release.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link link-hover inline-flex items-center gap-1 font-medium"
                            >
                              Ver release completo no GitHub
                              <ArrowUpRight className="size-3.5" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
          <section className="mx-auto mt-20 max-w-5xl border-t border-base-300 pt-8">
            <div className="flex flex-col gap-3 text-sm text-base-content/50 sm:flex-row sm:items-center sm:justify-between">
              <p>
                As informações desta página são obtidas diretamente das
                releases públicas do RoboStage.
              </p>

              <Link
                href="https://github.com/ohthias/roboStage/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-hover inline-flex items-center gap-2"
              >
                Todas as releases
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}