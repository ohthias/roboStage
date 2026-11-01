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

type C = { children?: React.ReactNode };

const md = {
  h1: ({ children }: C) => (
    <h3 className="mb-3 mt-8 flex items-start gap-2 text-lg font-bold first:mt-0 sm:mb-4 sm:mt-10 sm:text-xl">
      <Sparkles className="mt-1 size-5 shrink-0 text-primary" />
      <span className="min-w-0 break-words">{children}</span>
    </h3>
  ),
  h2: ({ children }: C) => (
    <h3 className="mb-3 mt-8 break-words text-base font-bold first:mt-0 sm:mb-4 sm:mt-10 sm:text-lg">{children}</h3>
  ),
  h3: ({ children }: C) => (
    <h4 className="mb-3 mt-6 flex items-center gap-2 border-b border-base-300 pb-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-primary first:mt-0 sm:mt-8 sm:text-xs sm:tracking-[0.15em]">
      <span className="size-1.5 shrink-0 rounded-full bg-primary" />
      <span className="min-w-0 break-words">{children}</span>
    </h4>
  ),
  p: ({ children }: C) => (
    <p className="my-3 text-sm leading-7 text-base-content/75 [overflow-wrap:anywhere] sm:text-base">{children}</p>
  ),
  ul: ({ children }: C) => <ul className="my-3 space-y-1.5">{children}</ul>,
  ol: ({ children }: C) => <ol className="my-3 list-decimal space-y-1.5 pl-5">{children}</ol>,
  li: ({ children }: C) => (
    <li className="flex gap-3 text-sm leading-6 text-base-content/75 sm:text-[15px] sm:leading-7">
      <span className="mt-2.5 size-1.5 shrink-0 rounded-sm bg-base-content/30" />
      <span className="min-w-0 [overflow-wrap:anywhere]">{children}</span>
    </li>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-primary underline-offset-2 [overflow-wrap:anywhere] hover:underline"
    >
      {children}
    </a>
  ),
  code: ({ children }: C) => (
    <code className="rounded bg-base-200 px-1.5 py-0.5 font-mono text-[0.85em] [overflow-wrap:anywhere]">{children}</code>
  ),
  pre: ({ children }: C) => (
    <pre className="-mx-5 my-4 overflow-x-auto bg-[#1f1c18] p-4 text-xs text-[#f3ecdc] sm:mx-0 sm:rounded-tl-xl sm:rounded-br-xl [&_code]:bg-transparent [&_code]:p-0 [&_code]:[overflow-wrap:normal]">
      {children}
    </pre>
  ),
  blockquote: ({ children }: C) => (
    <blockquote className="my-4 rounded-tl-xl rounded-br-xl border-l-4 border-accent bg-accent/10 px-4 py-2">{children}</blockquote>
  ),
  hr: () => <div className="my-6 border-t border-dashed border-base-300 sm:my-8" />,
  strong: ({ children }: C) => <strong className="font-semibold text-base-content">{children}</strong>,
  img: ({ src, alt }: { src?: string | Blob; alt?: string }) =>
    typeof src === "string" ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt ?? ""} loading="lazy" className="my-4 h-auto max-w-full rounded-tl-xl rounded-br-xl border border-base-300" />
    ) : null,
  table: ({ children }: C) => (
    <div className="-mx-5 my-4 overflow-x-auto sm:mx-0">
      <table className="w-full min-w-[480px] border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  th: ({ children }: C) => (
    <th className="border-b border-base-300 bg-base-200 px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider">{children}</th>
  ),
  td: ({ children }: C) => <td className="border-b border-base-300 px-3 py-2 align-top text-base-content/75">{children}</td>,
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
                <a href={`#${anchor(latest.version)}`} className={`${heroBtn} max-sm:w-full`}>
                  <Sparkles size={20} />
                  Ver a versão {latest.version}
                </a>
              )}
              <a href="#versoes" className="btn btn-ghost btn-lg max-sm:w-full">
                Todas as versões
                <ArrowDown size={18} />
              </a>
            </>
          }
          aside={
            latest ? (
              <>
                <div className="flex items-center justify-between gap-3 border-b border-base-300 px-4 py-3 sm:px-5">
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
                <div className="px-4 py-4 sm:px-5 sm:py-5">
                  <p className="break-all font-mono text-4xl font-bold tracking-tight sm:text-5xl">{latest.version}</p>
                  <p className="mt-2 break-words text-base font-bold sm:text-lg">{latest.title}</p>
                  {latest.date && (
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-base-content/55">
                      <CalendarDays size={14} className="shrink-0" /> {formatDate(latest.date)}
                    </p>
                  )}
                </div>
                <dl className="grid grid-cols-3 divide-x divide-base-300 border-t border-base-300">
                  {[
                    { l: "VERSÕES", v: entries.length, c: "text-primary" },
                    { l: "MUDANÇAS", v: totalChanges, c: "text-secondary" },
                    { l: "DESDE", v: sinceYear ?? "—", c: "text-[color-mix(in_oklab,var(--color-accent)_55%,var(--color-base-content))]" },
                  ].map(({ l, v, c }) => (
                    <div key={l} className="min-w-0 px-3 py-3 sm:px-4">
                      <dt className={`truncate text-[9px] font-bold tracking-[0.1em] sm:text-[10px] sm:tracking-[0.15em] ${c}`}>{l}</dt>
                      <dd className="mt-1 truncate font-mono text-lg font-bold tabular-nums sm:text-xl">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="bg-[#1f1c18] px-4 py-3 font-mono text-[11px] leading-6 text-[#f3ecdc] sm:px-5 sm:text-xs">
                  <span className="opacity-60">versionamento:</span> <span className="text-[#fabd32]">AAAA.N</span>{" "}
                  <span className="opacity-60">· ex.</span> 2026.1 = 1ª atualização de 2026
                </div>
              </>
            ) : undefined
          }
        />

        <section
          id="versoes"
          className="border-t border-base-300 bg-base-200/40 px-4 py-16 sm:px-6 sm:py-20 lg:py-24"
        >
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
              <div className="mt-10 rounded-tl-2xl rounded-br-2xl border border-dashed border-base-300 bg-base-100 p-6 text-center sm:mt-12 sm:p-10">
                <GitBranch className="mx-auto size-10 text-base-content/40" />
                <h2 className="mt-4 text-lg font-bold sm:text-xl">Nenhuma versão encontrada</h2>
                <p className="mt-2 text-sm text-base-content/60">
                  Não foi possível carregar o histórico agora. Veja as releases direto no GitHub.
                </p>
                <a href={RELEASES_URL} target="_blank" rel="noopener noreferrer" className="btn btn-sm mt-5">
                  Abrir releases <ArrowUpRight size={15} />
                </a>
              </div>
            ) : (
              <div className="mt-10 grid grid-cols-1 gap-8 sm:mt-14 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
                {/* índice */}
                <nav aria-label="Versões" className="min-w-0 lg:sticky lg:top-4 lg:self-start">
                  <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-base-content/45">VERSÕES</p>
                  <ul
                    className="-mx-4 mt-3 flex snap-x gap-2 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 [&::-webkit-scrollbar]:hidden
                      lg:mx-0 lg:block lg:max-h-[calc(100vh-9rem)] lg:space-y-1 lg:overflow-y-auto lg:overflow-x-visible lg:px-0 lg:pb-0 lg:pr-1 lg:[scrollbar-width:thin] lg:[&::-webkit-scrollbar]:block"
                  >
                    {entries.map((e, i) => (
                      <li key={e.version} className="shrink-0 snap-start">
                        <a
                          href={`#${anchor(e.version)}`}
                          className={`flex min-h-9 items-center justify-between gap-3 whitespace-nowrap rounded-tl-md rounded-br-md border px-3 py-1.5 font-mono text-xs transition-colors ${
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
                  <div
                    aria-hidden="true"
                    className="absolute bottom-6 left-5 top-6 hidden w-px border-l-2 border-dashed border-base-300 md:block"
                  />
                  <ol className="relative space-y-6 sm:space-y-8 md:space-y-10">
                    {entries.map((e, i) => (
                      <li key={e.version} id={anchor(e.version)} className="relative min-w-0 scroll-mt-24 md:pl-16">
                        <span
                          className={`absolute left-0 top-6 z-10 hidden size-10 place-items-center rounded-tl-lg rounded-br-lg md:grid ${
                            i === 0 ? "bg-primary text-primary-content" : "border border-base-300 bg-base-100 text-base-content/50"
                          }`}
                        >
                          {i === 0 ? <Sparkles size={16} /> : <Tag size={16} />}
                        </span>

                        <article
                          className={`overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 sm:rounded-tl-3xl sm:rounded-br-3xl ${
                            i === 0
                              ? "mr-1 shadow-[4px_4px_0_0_var(--color-primary)] sm:mr-2 sm:shadow-[8px_8px_0_0_var(--color-primary)]"
                              : ""
                          }`}
                        >
                          <header className="flex flex-col gap-4 border-b border-base-300 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6 md:p-8">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-tl-md rounded-br-md px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.15em] ${
                                    i === 0 ? "bg-primary text-primary-content" : "border border-base-300 text-base-content/60"
                                  }`}
                                >
                                  {i === 0 ? "VERSÃO ATUAL" : "RELEASE"}
                                </span>
                                <span className="rounded-md bg-base-200 px-2 py-0.5 font-mono text-xs">{e.version}</span>
                                {e.changes > 0 && (
                                  <span className="font-mono text-[11px] text-base-content/45">{e.changes} mudanças</span>
                                )}
                              </div>
                              <h2 className="mt-3 break-words text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">{e.title}</h2>
                              {e.date && (
                                <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-base-content/55">
                                  <CalendarDays size={14} className="shrink-0" /> {formatDate(e.date)}
                                </p>
                              )}
                            </div>
                            {e.url && (
                              <a
                                href={e.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm shrink-0 self-start rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none border-base-300 bg-base-100"
                              >
                                GitHub <ArrowUpRight size={14} />
                              </a>
                            )}
                          </header>

                          {e.body ? (
                            i === 0 ? (
                              <div className="p-5 sm:p-6 md:p-8">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
                                  {e.body}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <details className="group">
                                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-mono text-[11px] font-bold tracking-[0.1em] text-base-content/60 hover:text-primary sm:px-6 sm:text-xs sm:tracking-[0.12em] md:px-8 [&::-webkit-details-marker]:hidden">
                                  VER DETALHES DA VERSÃO
                                  <ArrowDown size={14} className="shrink-0 transition-transform group-open:rotate-180" />
                                </summary>
                                <div className="border-t border-base-300 p-5 sm:p-6 md:p-8">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
                                    {e.body}
                                  </ReactMarkdown>
                                </div>
                              </details>
                            )
                          ) : (
                            <p className="p-5 text-sm text-base-content/60 sm:p-6 md:p-8">Esta versão não possui descrição.</p>
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