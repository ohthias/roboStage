import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  FileText,
  Hash,
  Link2,
  ListTree,
  Map as MapIcon,
} from "lucide-react";

import RevealOnScroll from "@/components/UI/RevealOnScroll";
import PageHero, { heroBtn } from "@/components/UI/PageHero";
import { toneClasses, type Tone } from "@/components/home/shared";
import { CtaBlock } from "@/components/competicoes/shared/CompetitionSections";
import DocsSearch from "@/components/competicoes/shared/DocsSearch";
import { COMPETICOES } from "@/utils/competitions/competicoes";
import { getCompetitionDocs, isCompeticao, type DocItem } from "@/utils/competitions/docs";

type Params = { params: Promise<{ competicao: string }> };

const SITE = "https://robostage.com.br";

const GROUP_TONE: Record<string, Tone> = {
  challenge: "primary",
  explore: "accent",
  "future-edition": "secondary",
};

export function generateStaticParams() {
  return Object.keys(COMPETICOES).map((competicao) => ({ competicao }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { competicao } = await params;
  if (!isCompeticao(competicao)) return {};
  const { nome, full } = COMPETICOES[competicao];
  const seasons = await getCompetitionDocs(competicao);
  const names = seasons.map((s) => s.name).join(", ");
  const description = `Regras, rubricas, cadernos e guias oficiais da ${full} (${nome})${names ? `: temporadas ${names}` : ""}, reunidos em um só lugar.`;

  return {
    // O layout de [competicao] define um título simples, que desliga o template da raiz.
    title: { absolute: `Documentos da ${nome} | RoboStage` },
    description,
    keywords: [nome, full, "regras", "rubricas", "caderno de engenharia", "documentos", ...seasons.map((s) => s.name)],
    alternates: { canonical: `/${competicao}/docs` },
    openGraph: { title: `Documentos da ${nome} | RoboStage`, description, url: `/${competicao}/docs`, type: "website" },
  };
}

/* ----------------------------------------------------------------- card */

function DocCard({ doc, tone }: { doc: DocItem; tone: Tone }) {
  const c = toneClasses[tone];
  return (
    <article
      id={doc.id}
      data-doc={`${doc.title} ${doc.description}`}
      className={`group relative flex h-full scroll-mt-28 flex-col rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5 transition-all duration-300 hover:-translate-y-0.5 target:border-primary target:shadow-[6px_6px_0_0_var(--color-primary)] ${c.hover}`}
    >
      <div className="flex items-start gap-4">
        <span className={`grid size-11 shrink-0 place-items-center rounded-tl-lg rounded-br-lg transition-colors ${c.icon}`}>
          {doc.isPdf ? <FileText size={20} strokeWidth={1.8} /> : <Link2 size={20} strokeWidth={1.8} />}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="pr-6 font-bold leading-snug">{doc.title}</h4>
          <p className="mt-1.5 text-sm leading-6 text-base-content/60">{doc.description}</p>
        </div>
        <a
          href={`#${doc.id}`}
          aria-label={`Link para ${doc.title}`}
          title="Link direto para este documento"
          className="absolute right-4 top-4 text-base-content/25 opacity-0 transition-opacity hover:text-primary focus-visible:opacity-100 group-hover:opacity-100"
        >
          <Hash size={15} />
        </a>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-base-300 pt-4">
        <span className="min-w-0 truncate font-mono text-[11px] text-base-content/45">
          {doc.isPdf ? "pdf · " : ""}
          {doc.source}
        </span>
        {doc.href ? (
          <a
            href={doc.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-bold transition-colors hover:text-primary"
          >
            Abrir
            <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        ) : (
          <span className="shrink-0 text-xs text-base-content/40">Sem link</span>
        )}
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------- página */

export default async function DocsPage({ params }: Params) {
  const { competicao } = await params;
  if (!isCompeticao(competicao)) notFound();

  const { nome, full } = COMPETICOES[competicao];
  const seasons = await getCompetitionDocs(competicao);
  const total = seasons.reduce((s, x) => s + x.total, 0);
  const [current] = seasons;
  const exampleId = current?.groups[0]?.docs[0]?.id;

  // Dados estruturados: a lista de documentos como CollectionPage.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Documentos da ${full}`,
    url: `${SITE}/${competicao}/docs`,
    inLanguage: "pt-BR",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: total,
      itemListElement: seasons.flatMap((s) => s.groups.flatMap((g) => g.docs)).map((d, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE}/${competicao}/docs#${d.id}`,
        item: {
          "@type": "DigitalDocument",
          name: d.title,
          description: d.description,
          url: d.external ? d.href : `${SITE}${d.href}`,
          ...(d.isPdf ? { encodingFormat: "application/pdf" } : {}),
        },
      })),
    },
  };

  return (
    <main className="flex-1 overflow-x-clip bg-base-100 text-base-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHero
        kicker={`/ ${nome} · DOCUMENTAÇÃO`}
        title="Documentos"
        highlight={`tudo da ${nome} em um só lugar.`}
        description={`Regras, rubricas, cadernos e guias oficiais da ${full}, organizados por temporada. Cada documento tem um link próprio para compartilhar com a equipe.`}
        actions={
          <>
            {current && (
              <a href={`#${current.id}`} className={heroBtn}>
                <ArrowDown size={20} />
                Temporada {current.name.toUpperCase()}
              </a>
            )}
            {competicao === "fll" && (
              <Link href="/fll/docs/missions-guide" className="btn btn-ghost btn-lg">
                <MapIcon size={18} />
                Guia de missões
              </Link>
            )}
          </>
        }
        aside={
          <>
            <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
              <span className="inline-flex items-center gap-2 font-mono text-xs text-base-content/60">
                <BookOpen size={13} className="text-primary" /> {competicao}/docs
              </span>
              <span className="font-mono text-[10px] tracking-widest text-base-content/35">{total} DOCS</span>
            </div>
            <ul className="divide-y divide-base-300">
              {seasons.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-base-200/60">
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 font-bold uppercase tracking-tight">
                        {s.name}
                        {i === 0 && (
                          <span className="rounded-tl-md rounded-br-md bg-success/15 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-success">ATUAL</span>
                        )}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[11px] text-base-content/45">
                        {s.groups.map((g) => g.label.toLowerCase()).join(" · ")}
                      </span>
                    </span>
                    <span className="font-mono text-xs text-base-content/40">{s.total}</span>
                    <ArrowRight size={14} className="text-base-content/30 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </li>
              ))}
            </ul>
            {exampleId && (
              <div className="truncate bg-[#1f1c18] px-5 py-3 font-mono text-[11px] leading-6 text-[#f3ecdc] sm:text-xs">
                <span className="opacity-60">/{competicao}/docs</span>
                <span className="text-[#fabd32]">#{exampleId}</span>
              </div>
            )}
          </>
        }
      />

      <section className="border-t border-base-300 bg-base-200/40 px-6 py-16">
        {seasons.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-tl-3xl rounded-br-3xl border-2 border-dashed border-base-content/20 p-12 text-center">
            <FileText size={32} className="mx-auto text-base-content/30" />
            <p className="mt-4 text-lg font-bold">Nenhum documento publicado ainda.</p>
            <p className="mt-2 text-sm text-base-content/60">Assim que os documentos da {nome} saírem, eles aparecem aqui.</p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
            {/* -------------------------------------------- ÍNDICE */}
            <aside>
              <div className="space-y-5 lg:sticky lg:top-24">
                <DocsSearch total={total} />
                <nav aria-label="Índice dos documentos" className="hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 lg:block">
                  <p className="flex items-center gap-2 border-b border-base-300 px-5 py-3 font-mono text-[10px] font-bold tracking-[0.2em] text-base-content/50">
                    <ListTree size={13} className="text-primary" />
                    ÍNDICE
                  </p>
                  <ol className="max-h-[55vh] space-y-3 overflow-y-auto p-3">
                    {seasons.map((s) => (
                      <li key={s.id}>
                        <a href={`#${s.id}`} className="block rounded-tl-md rounded-br-md px-2 py-1 text-sm font-bold uppercase hover:bg-base-200 hover:text-primary">
                          {s.name}
                        </a>
                        {s.groups.length > 1 && (
                          <ol className="mt-1 border-l border-base-300 pl-2">
                            {s.groups.map((g) => (
                              <li key={g.id}>
                                <a href={`#${g.id}`} className="flex items-center justify-between rounded-tl-md rounded-br-md px-2 py-1 text-sm text-base-content/65 hover:bg-base-200 hover:text-primary">
                                  {g.label}
                                  <span className="font-mono text-[10px] text-base-content/35">{g.docs.length}</span>
                                </a>
                              </li>
                            ))}
                          </ol>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
            </aside>

            {/* ----------------------------------------- TEMPORADAS */}
            <div className="space-y-20">
              {seasons.map((s, i) => (
                <section key={s.id} id={s.id} data-doc-group aria-labelledby={`${s.id}-titulo`} className="scroll-mt-24">
                  <RevealOnScroll>
                    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-base-300 pb-5">
                      <div>
                        <p className="font-mono text-xs tracking-[0.2em] text-base-content/45">
                          / TEMPORADA {String(i + 1).padStart(2, "0")}
                        </p>
                        <h2 id={`${s.id}-titulo`} className="mt-2 text-3xl font-bold uppercase tracking-tight sm:text-4xl">
                          <a href={`#${s.id}`} className="group inline-flex items-center gap-3">
                            {i === 0 ? (
                              <span className="inline-block -rotate-1 bg-primary px-3 py-1 italic text-primary-content">{s.name}</span>
                            ) : (
                              s.name
                            )}
                            <Hash size={20} className="text-base-content/20 opacity-0 transition-opacity group-hover:opacity-100" />
                          </a>
                        </h2>
                      </div>
                      <span className="font-mono text-xs text-base-content/45">
                        {s.total} {s.total === 1 ? "documento" : "documentos"}
                        {i === 0 && <span className="ml-2 text-success">· atual</span>}
                      </span>
                    </div>
                  </RevealOnScroll>

                  <div className="mt-8 space-y-10">
                    {s.groups.map((g) => {
                      const tone = GROUP_TONE[g.key] ?? "primary";
                      return (
                        <div key={g.id} id={g.id} data-doc-group className="scroll-mt-24">
                          {s.groups.length > 1 && (
                            <h3 className="mb-4 flex items-center gap-3">
                              <a
                                href={`#${g.id}`}
                                className={`shrink-0 rounded-tl-md rounded-br-md bg-base-100 px-2.5 py-1 font-mono text-[11px] font-bold tracking-[0.18em] ring-1 ring-base-300 ${toneClasses[tone].tag}`}
                              >
                                {g.label.toUpperCase()}
                              </a>
                              <span className="h-px flex-1 border-t border-dashed border-base-300" />
                              <span className="font-mono text-[11px] text-base-content/35">{g.docs.length}</span>
                            </h3>
                          )}
                          <div className="grid gap-4 sm:grid-cols-2">
                            {g.docs.map((doc) => (
                              <DocCard key={doc.id} doc={doc} tone={tone} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}

              <p className="rounded-tl-xl rounded-br-xl border border-dashed border-base-content/25 px-5 py-4 text-sm leading-6 text-base-content/55">
                Os documentos pertencem aos organizadores da {full}. O RoboStage apenas reúne os links; confira sempre a
                versão mais recente no site oficial.
              </p>
            </div>
          </div>
        )}
      </section>

      <CtaBlock
        kicker="DA REGRA PARA A PRÁTICA"
        icon={BookOpen}
        title="Leu as regras? Hora de treinar."
        text={`Pontuador, timers e as outras ferramentas da ${nome} usam as mesmas regras destes documentos.`}
        actions={[
          { label: `Ferramentas da ${nome}`, href: `/${competicao}`, variant: "accent" },
          ...(competicao === "fll" ? [{ label: "Guia de missões", href: "/fll/docs/missions-guide", variant: "ghost" as const }] : []),
        ]}
      />
    </main>
  );
}
