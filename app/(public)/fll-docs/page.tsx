"use client";

import { Navbar } from "@/components/UI/Navbar";
import { Footer } from "@/components/UI/Footer";
import { useEffect, useState } from "react";
import { FileText, ExternalLink, BookOpen } from "lucide-react";

interface DocCard {
  title: string;
  description: string;
  url: string;
}

export default function FllDocs() {
  const [docs, setDocs] = useState<DocCard[]>([]);

  useEffect(() => {
    fetch("/api/data/fllDocs")
      .then((res) => res.json())
      .then((data) => setDocs(data))
      .catch((err) => console.error("Erro ao carregar documentos:", err));
  }, []);

  return (
    <>
      <Navbar />
      <main className="p-8 max-w-6xl mx-auto min-h-screen">
        <header className="mb-16 flex flex-row items-start gap-6 md:gap-8 justify-center">
          <div className="p-4 rounded-2xl bg-primary/10 text-primary shrink-0">
            <BookOpen size={36} strokeWidth={2.2} />
          </div>
          <div className="flex flex-col gap-3 text-left">
            <h1 className="text-3xl md:text-5xl font-extrabold text-base-content">
              Central de Documentações
            </h1>

            <p className="max-w-2xl text-base md:text-lg text-base-content/70">
              Reúna em um único lugar os documentos oficiais da temporada,
              incluindo regras, guias técnicos, caderno de engenharia e
              atualizações importantes.
            </p>
          </div>
        </header>

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

                {/* Divider */}
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
                    aria-label={`Abrir documento ${doc.title}`}
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
