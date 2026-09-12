"use client";

import { useEffect, useMemo, useState } from "react";
import Accordion from "@/components/UI/Accordion";
import { Footer } from "@/components/UI/Footer";
import Loader from "@/components/Loader";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import Header from "@/components/UI/Header";
import { Navbar } from "@/components/UI/Navbar";
import { Search, ToolCase, X } from "lucide-react";

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
    let mounted = true;

    const loadTools = async () => {
      try {
        const response = await fetch("/api/data/toolsAbout", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Falha ao carregar ferramentas");
        }

        const data: Tool[] = await response.json();

        if (mounted) {
          setTools(data);
        }
      } catch (error) {
        console.error("Erro ao carregar tools:", error);

        if (mounted) {
          setTools([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTools();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredTools = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return tools;
    }

    return tools.filter((tool) => {
      const name = tool.name?.toLowerCase() ?? "";
      const description = tool.description?.toLowerCase() ?? "";

      return (
        name.includes(normalizedSearch) ||
        description.includes(normalizedSearch)
      );
    });
  }, [tools, search]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-base-100">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-base-100 to-base-100" />
        <section className="relative overflow-hidden">
          <div className="relative mx-auto max-w-5xl px-4 pb-8 pt-12 sm:pt-16">
            <Header
              type="Help Desk FLL"
              name="Encontre"
              highlight="a ajuda que você precisa"
              description="Explore nossas ferramentas e recursos para tirar suas dúvidas e aprimorar sua experiência com o RoboStage."
            />

            {/* Search */}
            <div className="mx-auto mt-8 max-w-2xl">
              <label htmlFor="tool-search" className="sr-only">
                Buscar ferramentas
              </label>

              <div className="join w-full shadow-sm">
                  <label className="input input-bordered input-lg join-item flex w-full items-center gap-3 bg-base-100 focus-within:outline-primary">
                  <Search className="h-5 w-5 shrink-0 text-base-content/50" />
                  <input
                    id="tool-search"
                    type="search"
                    placeholder="Buscar ferramentas..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="grow"
                    autoComplete="off"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="btn btn-ghost btn-circle btn-sm"
                      aria-label="Limpar busca"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </label>
              </div>

              {!loading && (
                <div className="mt-3 flex items-center justify-between px-1 text-sm text-base-content/50">
                  <span>
                    {filteredTools.length}{" "}
                    {filteredTools.length === 1
                      ? "ferramenta encontrada"
                      : "ferramentas encontradas"}
                  </span>

                  {search && (
                    <span>
                      Busca por{" "}
                      <strong className="text-base-content">"{search}"</strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-5xl px-4 pb-16">
          {loading ? (
              <div className="flex min-h-[320px] items-center justify-center" role="status" aria-label="Carregando ferramentas">
              <div className="flex flex-col items-center gap-4">
                <Loader />
                <span className="text-sm text-base-content/50">
                  Carregando ferramentas...
                </span>
              </div>
            </div>
          ) : filteredTools.length > 0 ? (
            <RevealOnScroll>
              <div className="space-y-5">
                {filteredTools.map((tool) => (
                  <article
                    key={tool.name}
                    className="card border border-base-300 bg-base-100 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="card-body p-5 sm:p-7 md:p-8">
                      <div className="mb-5">
                        <div className="mb-3 flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <ToolCase className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                              {tool.name}
                            </h2>

                            <p className="mt-1 text-sm leading-relaxed text-base-content/65 sm:text-base">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {tool.details?.length > 0 && (
                        <Accordion items={tool.details} />
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </RevealOnScroll>
          ) : (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="card w-full max-w-md border border-base-300 bg-base-100 shadow-sm">
                <div className="card-body items-center p-8 text-center">
                  <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-base-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-7 w-7 text-base-content/40"
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-3.5-3.5" />
                    </svg>
                  </div>

                  <h2 className="card-title">Nenhuma ferramenta encontrada</h2>

                  <p className="text-sm text-base-content/60">
                    Não encontramos resultados para <strong>"{search}"</strong>.
                  </p>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm mt-3"
                    onClick={() => setSearch("")}
                  >
                    Limpar busca
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
