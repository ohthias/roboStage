"use client";
import { useEffect, useState } from "react";
import Accordion from "@/components/UI/Accordion";
import { Navbar } from "@/components/UI/Navbar";
import { Footer } from "@/components/UI/Footer";
import Loader from "@/components/Loader";
import RevealOnScroll from "@/components/UI/RevealOnScroll";

interface ToolDetail {
  title: string;
  content: string;
}

interface Tool {
  name: string;
  description: string;
  details: ToolDetail[];
}

export default function HelpDesk() {
  const [search, setSearch] = useState("");
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/data/toolsAbout")
      .then((res) => res.json())
      .then((data) => setTools(data))
      .catch((err) => console.error("Erro ao carregar tools:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredTools = tools.filter(
    (t) => t.name && t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-base-100">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Header + Command Search */}
          <section className="relative mb-16 overflow-hidden rounded-3xl border border-base-200 bg-gradient-to-br from-base-100 via-base-100 to-base-200/40">
            {/* Decorative grid */}
            <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="relative px-6 py-12 md:px-12 md:py-16">
              <div className="max-w-3xl">
                <span className="inline-block mb-4 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1 text-sm font-medium text-red-500">
                  RoboStage
                </span>

                <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                  Central de Dúvidas <br />
                  <span className="text-red-500">RoboStage</span>
                </h1>

                <p className="mt-4 text-base-content/70 max-w-xl">
                  Explore, compreenda e utilize as ferramentas que sustentam o
                  planejamento, testes e engenharia do robô — do conceito à
                  execução.
                </p>

                {/* Command Search */}
                <div className="mt-8 max-w-xl">
                  <input
                    type="text"
                    placeholder="Digite um comando ou ferramenta…"
                    className="input input-bordered w-full h-12 text-base focus:outline-none focus:border-red-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  <p className="mt-2 text-xs text-base-content/50">
                    Busque por nomes de ferramentas ou funcionalidades.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : (
            <RevealOnScroll>
              <section className="space-y-6">
                {filteredTools.map((tool, idx) => (
                  <article
                    key={idx}
                    className="rounded-2xl border border-base-200 bg-base-100/60 backdrop-blur shadow-sm hover:shadow-md transition"
                  >
                    <div className="p-6 md:p-8">
                      <h2 className="text-2xl font-semibold mb-2">
                        {tool.name}
                      </h2>
                      <p className="text-base-content/70 mb-6">
                        {tool.description}
                      </p>

                      <Accordion items={tool.details || []} />
                    </div>
                  </article>
                ))}

                {filteredTools.length === 0 && (
                  <div className="text-center py-12 text-base-content/50">
                    Nenhuma ferramenta encontrada.
                  </div>
                )}
              </section>
            </RevealOnScroll>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
