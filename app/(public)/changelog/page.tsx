import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowDown, ArrowUpRight, CalendarDays, GitBranch, Newspaper, Sparkles, Tag } from "lucide-react";

import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import PageHero, { heroBtn } from "@/components/UI/PageHero";
import { SectionTitle } from "@/components/home/shared";
import { CtaBlock } from "@/components/competicoes/shared/CompetitionSections";
import { getChangelog, RELEASES_URL } from "@/utils/institutional/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Acompanhe as novidades, melhorias, correções e mudanças do RoboStage.",
};

export const revalidate = 1800;

function formatDate(iso: string | null, style: "long" | "short" = "long") {
  if (!iso) return null;
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: style === "long" ? "long" : "short",
    year: "numeric",
  });
}

const anchor = (v: string) => `v-${v.replace(/[^a-z0-9]+/gi, "-")}`;

const md = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mb-4 mt-10 flex items-center gap-2 text-xl font-bold first:mt-0">
      <Sparkles className="size-5 text-primary" />
      {children}
    </h3>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mb-4 mt-10 text-lg font-bold first:mt-0">{children}</h3>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="mb-3 mt-8 flex items-center gap-2 border-b border-base-300 pb-2 font-mono text-xs font-bold uppercase tracking-[0.15em] text-primary first:mt-0">
      <span className="size-1.5 rounded-full bg-primary" />
      {children}
    </h4>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="my-3 text-sm leading-7 text-base-content/75 sm:text-base">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="my-3 space-y-1.5">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="my-3 list-decimal space-y-1.5 pl-5">{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="flex gap-3 text-sm leading-6 text-base-content/75">
      <span className="mt-2 size-1.5 shrink-0 rounded-sm bg-base-content/30" />
      <span className="min-w-0">{children}</span>
    </li>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline-offset-2 hover:underline">
      {children}
    </a>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-base-200 px-1.5 py-0.5 font-mono text-[0.85em]">{children}</code>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="my-4 overflow-x-auto rounded-tl-xl rounded-br-xl bg-[#1f1c18] p-4 text-xs text-[#f3ecdc]">{children}</pre>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-4 rounded-tl-xl rounded-br-xl border-l-4 border-accent bg-accent/10 px-4 py-2">{children}</blockquote>
  ),
  hr: () => <div className="my-8 border-t border-dashed border-base-300" />,
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold text-base-content">{children}</strong>,
};

export default async function ChangelogPage() {
  const { source, entries } = await getChangelog();
  const [latest] = entries;
  const totalChanges = entries.reduce((a, e) => a + e.changes, 0);
  const sinceYear = entries.at(-1)?.date?.slice(0, 4);

  return (
    <>
      <Navbar />
      <main className="overflow-x-clip bg-base-100 text-base-content">
        <PageHero
          kicker="/ ATUALIZAÇÕES"
          title="Changelog"
          highlight="versão por versão."
          description="O histórico do RoboStage: novos recursos, melhorias, correções e mudanças importantes na plataforma, do primeiro beta até hoje."
          actions={
            <>
              {latest && (
                <a href={`#${anchor(latest.version)}`} className={heroBtn}>
                  <Sparkles size={20} />
                  Ver a versão {latest.version}
                </a>
              )}
              <a href="#versoes" className="btn btn-ghost btn-lg">
                Todas as versões
                <ArrowDown size={18} />
              </a>
            </>
          }
          aside={
            latest ? (
              <>
                <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
                  <span className="inline-flex items-center gap-2 font-mono text-xs text-base-content/60">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
                      <span className="relative size-2 rounded-full bg-success" />
                    </span>
                    versão atual
                  </span>
                  <span className="font-mono text-[10px] tracking-widest text-base-content/35">
                    {source === "github" ? "GITHUB" : "CHANGELOG.MD"}
                  </span>
                </div>
                <div className="px-5 py-5">
                  <p className="font-mono text-5xl font-bold tracking-tight">{latest.version}</p>
                  <p className="mt-2 text-lg font-bold">{latest.title}</p>
                  {latest.date && (
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-base-content/55">
                      <CalendarDays size={14} /> {formatDate(latest.date)}
                    </p>
                  )}
                </div>
                <dl className="grid grid-cols-3 divide-x divide-base-300 border-t border-base-300">
                  {[
                    { l: "VERSÕES", v: entries.length, c: "text-primary" },
                    { l: "MUDANÇAS", v: totalChanges, c: "text-secondary" },
                    { l: "DESDE", v: sinceYear ?? "—", c: "text-[color-mix(in_oklab,var(--color-accent)_55%,var(--color-base-content))]" },
                  ].map(({ l, v, c }) => (
                    <div key={l} className="px-4 py-3">
                      <dt className={`text-[10px] font-bold tracking-[0.15em] ${c}`}>{l}</dt>
                      <dd className="mt-1 font-mono text-xl font-bold tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="bg-[#1f1c18] px-5 py-3 font-mono text-[11px] leading-6 text-[#f3ecdc] sm:text-xs">
                  <span className="opacity-60">versionamento:</span> <span className="text-[#fabd32]">AAAA.N</span>{" "}
                  <span className="opacity-60">· ex.</span> 2026.1 = 1ª atualização de 2026
                </div>
              </>
            ) : undefined
          }
        />

        <section id="versoes" className="scroll-mt-20 border-t border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <SectionTitle
              kicker="/ HISTÓRICO"
              title="Tudo o que"
              highlight="já mudou."
              highlightClass="bg-secondary text-secondary-content"
              description={
                source === "local"
                  ? "Lido do arquivo CHANGELOG.md do projeto, porque as releases do GitHub não puderam ser carregadas agora."
                  : "Lido diretamente das releases públicas do RoboStage no GitHub."
              }
            />

            {entries.length === 0 ? (
              <div className="mt-12 rounded-tl-2xl rounded-br-2xl border border-dashed border-base-300 bg-base-100 p-10 text-center">
                <GitBranch className="mx-auto size-10 text-base-content/40" />
                <h2 className="mt-4 text-xl font-bold">Nenhuma versão encontrada</h2>
                <p className="mt-2 text-sm text-base-content/60">
                  Não foi possível carregar o histórico agora. Veja as releases direto no GitHub.
                </p>
                <a href={RELEASES_URL} target="_blank" rel="noopener noreferrer" className="btn btn-sm mt-5">
                  Abrir releases <ArrowUpRight size={15} />
                </a>
              </div>
            ) : (
              <div className="mt-14 grid gap-10 lg:grid-cols-[220px_1fr]">
                {/* índice */}
                <nav aria-label="Versões" className="lg:sticky lg:top-24 lg:self-start">
                  <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-base-content/45">VERSÕES</p>
                  <ul className="mt-3 flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
                    {entries.map((e, i) => (
                      <li key={e.version} className="shrink-0">
                        <a
                          href={`#${anchor(e.version)}`}
                          className={`flex items-center justify-between gap-3 rounded-tl-md rounded-br-md border px-3 py-1.5 font-mono text-xs transition-colors ${
                            i === 0
                              ? "border-primary bg-primary text-primary-content"
                              : "border-base-300 bg-base-100 text-base-content/70 hover:border-base-content/40"
                          }`}
                        >
                          {e.version}
                          {e.date && <span className="hidden opacity-60 lg:inline">{e.date.slice(0, 7)}</span>}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* linha do tempo */}
                <div className="relative min-w-0">
                <div aria-hidden="true" className="absolute bottom-6 left-5 top-6 hidden w-px border-l-2 border-dashed border-base-300 md:block" />
                <ol className="relative space-y-10">
                  {entries.map((e, i) => (
                    <li key={e.version} id={anchor(e.version)} className="relative scroll-mt-24 md:pl-16">
                      <span
                        className={`absolute left-0 top-6 z-10 hidden size-10 place-items-center rounded-tl-lg rounded-br-lg md:grid ${
                          i === 0 ? "bg-primary text-primary-content" : "border border-base-300 bg-base-100 text-base-content/50"
                        }`}
                      >
                        {i === 0 ? <Sparkles size={16} /> : <Tag size={16} />}
                      </span>

                      <article
                        className={`overflow-hidden rounded-tl-3xl rounded-br-3xl border bg-base-100 ${
                          i === 0 ? "border-base-300 shadow-[8px_8px_0_0_var(--color-primary)]" : "border-base-300"
                        }`}
                      >
                        <header className="flex flex-col gap-4 border-b border-base-300 p-6 sm:flex-row sm:items-start sm:justify-between md:p-8">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`rounded-tl-md rounded-br-md px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.15em] ${i === 0 ? "bg-primary text-primary-content" : "border border-base-300 text-base-content/60"}`}>
                                {i === 0 ? "VERSÃO ATUAL" : "RELEASE"}
                              </span>
                              <span className="rounded-md bg-base-200 px-2 py-0.5 font-mono text-xs">{e.version}</span>
                              {e.changes > 0 && (
                                <span className="font-mono text-[11px] text-base-content/45">{e.changes} mudanças</span>
                              )}
                            </div>
                            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">{e.title}</h2>
                            {e.date && (
                              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-base-content/55">
                                <CalendarDays size={14} /> {formatDate(e.date)}
                              </p>
                            )}
                          </div>
                          {e.url && (
                            <a
                              href={e.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm shrink-0 rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none border-base-300 bg-base-100"
                            >
                              GitHub <ArrowUpRight size={14} />
                            </a>
                          )}
                        </header>

                        {e.body ? (
                          i === 0 ? (
                            <div className="p-6 md:p-8">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
                                {e.body}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <details className="group">
                              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-4 font-mono text-xs font-bold tracking-[0.12em] text-base-content/60 hover:text-primary md:px-8">
                                VER DETALHES DA VERSÃO
                                <ArrowDown size={14} className="transition-transform group-open:rotate-180" />
                              </summary>
                              <div className="border-t border-base-300 p-6 md:p-8">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
                                  {e.body}
                                </ReactMarkdown>
                              </div>
                            </details>
                          )
                        ) : (
                          <p className="p-6 text-sm text-base-content/60 md:p-8">Esta versão não possui descrição.</p>
                        )}
                      </article>
                    </li>
                  ))}
                </ol>
                </div>
              </div>
            )}
          </div>
        </section>

        <CtaBlock
          kicker="ACOMPANHE O PROJETO"
          icon={Newspaper}
          title="Quer saber o que vem na próxima versão?"
          text="As notícias contam o que está em desenvolvimento, e as releases no GitHub trazem cada mudança em detalhe."
          actions={[
            { label: "Ver notícias", href: "/news", variant: "accent" },
            { label: "Releases no GitHub", href: RELEASES_URL, variant: "ghost" },
            { label: "Sugerir uma melhoria", href: "https://github.com/ohthias/roboStage/issues/new/choose", variant: "ghost" },
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
