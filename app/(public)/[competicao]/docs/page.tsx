"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, ExternalLink, Bot } from "lucide-react";
import { useParams } from "next/navigation";
import { COMPETICOES } from "@/utils/competitions/competicoes";

interface DocCard {
  title: string;
  description: string;
  url: string;
  category?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  challenge: "Challenge",
  explore: "Explore",
  "future-edition": "Future Edition",
  geral: "Geral",
};

function formatCategory(category?: string) {
  if (!category) return "Geral";
  return CATEGORY_LABELS[category] ?? category;
}

export default function DocsPage() {
  const params = useParams();
  const competicao = params?.competicao as keyof typeof COMPETICOES;
  const config = COMPETICOES[competicao];

  const [docs, setDocs] = useState<Record<string, DocCard[]>>({});
  const [seasons, setSeasons] = useState<string[]>([]);
  const [season, setSeason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedSeasonDocs = season ? (docs[season] ?? []) : [];

  const groupedDocs = useMemo(() => {
    const groups: Record<string, DocCard[]> = {};

    selectedSeasonDocs.forEach((doc) => {
      const key = doc.category?.trim() || "geral";
      if (!groups[key]) groups[key] = [];
      groups[key].push(doc);
    });

    return groups;
  }, [selectedSeasonDocs]);

  const categories = useMemo(() => {
    return Object.keys(groupedDocs).sort((a, b) => {
      const order = ["challenge", "explore", "future-edition", "geral"];
      return order.indexOf(a) - order.indexOf(b);
    });
  }, [groupedDocs]);

  useEffect(() => {
    if (!competicao) return;

    setLoading(true);

    fetch(`/api/data/${competicao}Docs`)
      .then((res) => res.json())
      .then((data) => {
        setDocs(data);
        const seasonKeys = Object.keys(data);
        setSeasons(seasonKeys);
        setSeason(seasonKeys[0] ?? null);
      })
      .catch((err) => console.error("Erro ao carregar documentos:", err))
      .finally(() => setLoading(false));
  }, [competicao]);

  if (!config) {
    return <p className="p-8">Competição não encontrada.</p>;
  }

  return (
    <main className="p-8 max-w-6xl mx-auto w-full">
      <header className="mb-8 md:p-8">
        <div className="flex items-start gap-5">
          <div className="flex flex-col gap-2 items-start">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-content bg-primary w-max px-2">
              Documentação oficial
            </span>

            <h1 className="text-3xl font-extrabold leading-tight text-base-content md:text-5xl">
              Central de documentações{" "}
              <span className="text-black bg-accent px-2">{config.nome}</span>
            </h1>

            <p className="max-w-2xl text-base text-base-content/70 md:text-lg">
              Reúna em um único lugar os documentos oficiais da temporada,
              incluindo regras, guias técnicos e atualizações importantes.
            </p>

            {seasons.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-base-content/60">
                  Temporadas disponíveis:
                </span>

                <div className="flex flex-wrap gap-2">
                  {seasons.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeason(s)}
                      className={`uppercase rounded-0 rounded-tl-[10px] rounded-br-[10px] border px-4 py-2 text-sm cursor-pointer hover:shadow-[4px_4px_0_theme(colors.primary))] transition ${
                        season === s
                          ? "bg-primary text-primary-content shadow-[4px_4px_0_theme(colors.base-300))]"
                          : "border-base-content/20 text-base-content/70"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {loading && (
        <p className="text-center text-base-content/60">
          Carregando documentos...
        </p>
      )}

      {!loading && seasons.length === 0 && (
        <p className="text-center text-base-content/60">
          <Bot size={20} className="inline mb-1 mr-2" />
          Nenhum documento encontrado para esta competição.
        </p>
      )}

      {!loading && seasons.length > 0 && selectedSeasonDocs.length === 0 && (
        <p className="text-center text-base-content/60">
          <Bot size={20} className="inline mb-1 mr-2" />
          Nenhum documento encontrado para a temporada selecionada.
        </p>
      )}

      {!loading &&
        categories.map((category) => {
          const docsInCategory = groupedDocs[category] ?? [];
          return (
            <section key={category} className="mb-10">
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-xl font-bold text-base-content">
                  {formatCategory(category)}
                </h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {docsInCategory.map((doc, idx) => (
                  <div
                    key={`${doc.title}-${idx}`}
                    className="card bg-base-100 border border-base-300 hover:border-primary hover:shadow-lg transition-all duration-200"
                  >
                    <div className="card-body gap-5">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                          <FileText size={24} strokeWidth={2} />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-base-content leading-tight">
                            {doc.title}
                          </h3>
                          <p className="mt-1 text-sm text-base-content/70 line-clamp-3">
                            {doc.description}
                          </p>
                        </div>
                      </div>

                      <div className="divider my-0" />

                      <div className="card-actions justify-between items-center">
                        <span className="text-xs text-base-content/50">
                          Documento oficial
                        </span>

                        {doc.url ? (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm gap-2"
                          >
                            Abrir
                            <ExternalLink size={16} />
                          </a>
                        ) : (
                          <button
                            className="btn btn-disabled btn-sm gap-2"
                            disabled
                          >
                            Sem link
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
    </main>
  );
}