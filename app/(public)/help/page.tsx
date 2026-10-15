"use client";

import { useEffect, useMemo, useState } from "react";
import Accordion from "@/components/UI/Accordion";
import { Footer } from "@/components/UI/Footer";
import Loader from "@/components/Loader";
import Header from "@/components/UI/Header";
import { Navbar } from "@/components/UI/Navbar";
import {
  BookOpen,
  ClipboardCheck,
  Dumbbell,
  Search,
  Shapes,
  Trophy,
  ToolCase,
  X,
  Bot,
  ToyBrick,
} from "lucide-react";

interface ToolDetail {
  title: string;
  content: string;
}

type Competition = "all" | "fll" | "obr";
type ToolCategory =
  | "all"
  | "planning"
  | "training"
  | "competition"
  | "documentation"
  | "general";

interface Tool {
  name: string;
  description: string;
  details: ToolDetail[];
  competitions?: Exclude<Competition, "all">[];
  category?: Exclude<ToolCategory, "all">;
}

const competitions: {
  key: Competition;
  label: string;
  icon: typeof Trophy;
}[] = [
  { key: "all", label: "Todas", icon: Shapes },
  { key: "fll", label: "FLL", icon: ToyBrick },
  { key: "obr", label: "OBR", icon: Bot },
];

const categories: {
  key: ToolCategory;
  label: string;
  icon: typeof Trophy;
}[] = [
  { key: "all", label: "Todas", icon: Shapes },
  { key: "planning", label: "Planejamento", icon: ClipboardCheck },
  { key: "training", label: "Treino", icon: Dumbbell },
  { key: "competition", label: "Competição", icon: Trophy },
  { key: "documentation", label: "Documentação", icon: BookOpen },
  { key: "general", label: "Geral", icon: ToolCase },
];

export default function HelpDesk() {
  const [search, setSearch] = useState("");
  const [selectedCompetition, setSelectedCompetition] =
    useState<Competition>("all");
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>("all");
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

    return tools.filter((tool) => {
      const matchesCompetition =
        selectedCompetition === "all" ||
        tool.competitions?.includes(selectedCompetition);
      const matchesCategory =
        selectedCategory === "all" || tool.category === selectedCategory;
      const name = tool.name?.toLowerCase() ?? "";
      const description = tool.description?.toLowerCase() ?? "";

      return (
        matchesCompetition &&
        matchesCategory &&
        (!normalizedSearch ||
          name.includes(normalizedSearch) ||
          description.includes(normalizedSearch))
      );
    });
  }, [tools, search, selectedCompetition, selectedCategory]);

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden bg-base-100">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-primary/5 via-base-100 to-base-100 max-h-[400px] [mask-image:linear-gradient(180deg,white_80%,transparent)]"
        />

        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:px-8">
            <Header
              type="Help Desk"
              name="Encontre"
              highlight="a ajuda que você precisa"
              description="Escolha uma competição e uma categoria para encontrar rapidamente as ferramentas e os recursos do RoboStage."
            />

            <div className="mx-auto mt-10 max-w-5xl space-y-7">
              {/* Competição */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-base-content/50">
                  Selecione a competição
                </p>

                <div
                  className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                  role="tablist"
                  aria-label="Filtrar por competição"
                >
                  {competitions.map((competition) => {
                    const Icon = competition.icon;
                    const isActive = selectedCompetition === competition.key;

                    return (
                      <button
                        key={competition.key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => {
                          setSelectedCompetition(competition.key);
                          setSelectedCategory("all");
                        }}
                        className={`group flex min-h-14 items-center gap-3 rounded-tl-2xl rounded-br-2xl border px-4 py-3 text-left text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 ${
                          isActive
                            ? "border-primary bg-primary text-primary-content shadow-lg shadow-primary/15"
                            : "border-base-300 bg-base-100/80 text-base-content hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5"
                        }`}
                      >
                        <span
                          className={`grid size-9 shrink-0 place-items-center rounded-xl transition-colors ${
                            isActive
                              ? "bg-white/15"
                              : "bg-base-200 text-base-content/60 group-hover:text-primary"
                          }`}
                        >
                          <Icon className="size-4" />
                        </span>

                        <span className="min-w-0">{competition.label}</span>

                        <span
                          className={`ml-auto size-2 shrink-0 rounded-full ${
                            isActive ? "bg-primary-content" : "bg-base-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Categorias */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-base-content/50">
                  Explore por categoria
                </p>

                <div
                  className="flex gap-2 overflow-x-auto pb-3"
                  role="tablist"
                  aria-label="Filtrar por categoria"
                >
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isActive = selectedCategory === category.key;

                    return (
                      <button
                        key={category.key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setSelectedCategory(category.key)}
                        className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          isActive
                            ? "border-primary bg-primary/10 font-bold text-primary"
                            : "border-base-300 bg-base-100 text-base-content/70 hover:border-primary/40 hover:text-primary"
                        }`}
                      >
                        <Icon className="size-4" />
                        {category.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Busca */}
              <div>
                <label htmlFor="tool-search" className="sr-only">
                  Buscar ferramentas
                </label>

                <div className="flex min-h-14 items-center gap-3 rounded-lg border border-base-300 bg-base-100 px-4 shadow-sm transition-all duration-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
                  <Search className="size-5 shrink-0 text-base-content/40" />

                  <input
                    id="tool-search"
                    type="search"
                    placeholder="Buscar ferramentas e recursos..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent py-3 text-sm text-base-content outline-none placeholder:text-base-content/40 sm:text-base"
                    autoComplete="off"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="grid size-8 shrink-0 place-items-center rounded-full text-base-content/50 transition hover:bg-base-200 hover:text-base-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label="Limpar busca"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>

                {!loading && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
                    <p
                      className="text-sm text-base-content/60"
                      aria-live="polite"
                    >
                      <strong className="text-base-content">
                        {filteredTools.length}
                      </strong>{" "}
                      {filteredTools.length === 1
                        ? "ferramenta encontrada"
                        : "ferramentas encontradas"}
                    </p>

                    {(search ||
                      selectedCompetition !== "all" ||
                      selectedCategory !== "all") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setSelectedCompetition("all");
                          setSelectedCategory("all");
                        }}
                        className="text-xs font-bold text-primary transition-colors hover:text-primary/70"
                      >
                        Limpar filtros
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        <section className="relative mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
          {loading ? (
            <div
              className="flex min-h-[320px] items-center justify-center"
              role="status"
              aria-label="Carregando ferramentas"
            >
              <div className="flex flex-col items-center gap-4">
                <Loader />
                <span className="text-sm text-base-content/50">
                  Carregando ferramentas...
                </span>
              </div>
            </div>
          ) : filteredTools.length > 0 ? (
            <div className="space-y-4">
              {filteredTools.map((tool, index) => (
                <article
                  key={tool.name}
                  className="group relative overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300/80 bg-base-100 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-1 origin-bottom scale-y-0 bg-primary transition-transform duration-300 group-hover:scale-y-100"
                  />

                  <div className="p-5 sm:p-6 md:p-7">
                    <div className="mb-5 flex items-start gap-4">
                      <div className="grid size-12 shrink-0 place-items-center rounded-tl-xl rounded-br-xl border border-primary/10 bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-content sm:size-14">
                        <ToolCase className="size-5 sm:size-6" />
                      </div>

                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <h2 className="text-lg font-black tracking-tight text-base-content sm:text-xl">
                            {tool.name}
                          </h2>

                          <span className="font-mono text-[10px] font-bold tracking-wider text-base-content/35">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>

                        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-base-content/65 sm:text-base">
                          {tool.description}
                        </p>
                      </div>
                    </div>

                    {tool.details?.length > 0 && (
                      <div className="border-t border-base-300/70 pt-4">
                        <Accordion items={tool.details} />
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[320px] items-center justify-center py-8">
              <div className="relative w-full max-w-lg overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-8 text-center shadow-sm sm:p-10">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full border-[24px] border-primary/5"
                />

                <div className="relative mx-auto mb-5 grid size-16 place-items-center rounded-tl-2xl rounded-br-2xl bg-base-200 text-base-content/45">
                  <Search className="size-7" />
                </div>

                <h2 className="text-xl font-black tracking-tight text-base-content sm:text-2xl">
                  Nenhuma ferramenta encontrada
                </h2>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-base-content/60">
                  Não encontramos recursos para os filtros selecionados
                  {search && (
                    <>
                      {" "}
                      e para a busca{" "}
                      <strong className="break-words text-base-content">
                        &ldquo;{search}&rdquo;
                      </strong>
                    </>
                  )}
                  . Experimente alterar os critérios ou limpar os filtros.
                </p>

                <button
                  type="button"
                  className="btn btn-primary btn-sm mt-6 rounded-tl-lg rounded-br-lg"
                  onClick={() => {
                    setSearch("");
                    setSelectedCompetition("all");
                    setSelectedCategory("all");
                  }}
                >
                  Limpar filtros
                  <X className="size-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
