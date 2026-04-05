"use client";

import { Footer } from "@/components/UI/Footer";
import { useEffect, useState } from "react";
import { FileText, ExternalLink, BookOpen, Bot } from "lucide-react";
import { useParams } from "next/navigation";
import { COMPETICOES } from "@/config/competicoes";

interface DocCard {
  title: string;
  description: string;
  url: string;
}

export default function DocsPage() {
  const { competicao } = useParams() as { competicao: keyof typeof COMPETICOES };

  const config = COMPETICOES[competicao];

  const [docs, setDocs] = useState<DocCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!competicao) return;

    fetch(`/api/data/${competicao}Docs`)
      .then((res) => res.json())
      .then((data) => setDocs(data))
      .catch((err) => console.error("Erro ao carregar documentos:", err))
      .finally(() => setLoading(false));
  }, [competicao]);

  if (!config) {
    return <p className="p-8">Competição não encontrada.</p>;
  }

  return (
    <>
      <main className="p-8 max-w-6xl mx-auto min-h-screen">
        {/* HEADER */}
        <header className="mb-16 flex flex-row items-start gap-6 md:gap-8 justify-center">
          <div className="p-4 rounded-2xl bg-primary/10 text-primary shrink-0">
            <BookOpen size={36} strokeWidth={2.2} />
          </div>

          <div className="flex flex-col gap-3 text-left">
            <h1 className="text-3xl md:text-5xl font-extrabold text-base-content">
              Central de Documentações {config.nome}
            </h1>

            <p className="max-w-2xl text-base md:text-lg text-base-content/70">
              Reúna em um único lugar os documentos oficiais da temporada,
              incluindo regras, guias técnicos e atualizações importantes.
            </p>
          </div>
        </header>

        {/* LOADING */}
        {loading && (
          <p className="text-center text-base-content/60">
            Carregando documentos...
          </p>
        )}

        {!loading && docs.length === 0 && (
          <p className="text-center text-base-content/60">
            <Bot size={20} className="inline mb-1 mr-2" />
            Nenhum documento encontrado para esta competição.
          </p>
        )}

        {/* GRID */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc, idx) => (
            <div
              key={idx}
              className="card bg-base-100 border border-base-300 
              hover:border-primary hover:shadow-lg 
              transition-all duration-200"
            >
              <div className="card-body gap-5">
                {/* Cabeçalho */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <FileText size={24} strokeWidth={2} />
                  </div>

                  <div className="flex-1">
                    <h2 className="font-semibold text-lg text-base-content leading-tight">
                      {doc.title}
                    </h2>
                    <p className="mt-1 text-sm text-base-content/70 line-clamp-3">
                      {doc.description}
                    </p>
                  </div>
                </div>

                <div className="divider my-0" />

                {/* Ação */}
                <div className="card-actions justify-between items-center">
                  <span className="text-xs text-base-content/50">
                    Documento oficial
                  </span>

                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm gap-2"
                  >
                    Abrir
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </>
  );
}