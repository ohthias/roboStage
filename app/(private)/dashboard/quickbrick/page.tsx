"use client";
import { Cuboid, Search } from "lucide-react";
import { useState } from "react";

type Category =
  | "all"
  | "estrategia"
  | "swot"
  | "matrizes"
  | "simulacoes"
  | "tabelas";
type SortOption = "recente" | "az" | "pontos";
type Season = "season" | "offseason";

const categories: { id: Category; label: string; icon: string }[] = [
  { id: "all", label: "Tudo", icon: "layout-grid" },
  { id: "estrategia", label: "Estratégia", icon: "chess" },
  { id: "swot", label: "SWOT", icon: "chart-radar" },
  { id: "matrizes", label: "Matrizes", icon: "table" },
  { id: "simulacoes", label: "Simulações", icon: "cpu" },
  { id: "tabelas", label: "Tabelas", icon: "spreadsheet" },
];

interface QuickBrickHeaderProps {
  onFilterChange?: (params: {
    category: Category;
    query: string;
    sort: SortOption;
  }) => void;
  onSeasonChange?: (season: Season) => void;
  onNewProject?: () => void;
}

export default function QuickBrickHeader() {
  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("recente");
  const [season, setSeason] = useState<Season>("season");

  function update(cat: Category, q: string, s: SortOption) {
    onFilterChange?.({ category: cat, query: q, sort: s });
  }

  function handleCategory(cat: Category) {
    setCategory(cat);
    update(cat, query, sort);
  }

  function handleQuery(q: string) {
    setQuery(q);
    update(category, q, sort);
  }

  function handleSort(s: SortOption) {
    setSort(s);
    update(category, query, s);
  }

  function handleSeasonChange(value: Season) {
    setSeason(value);
    onSeasonChange?.(value);
  }

  const activeLabel = [
    category !== "all" && `categoria: ${category}`,
    query && `busca: "${query}"`,
    sort !== "recente" && `ordem: ${sort}`,
  ]
    .filter(Boolean)
    .join(" · ");

  function onNewProject(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <header className="space-y-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 flex items-center justify-center rounded-lg border border-primary/20 bg-primary/10 shrink-0">
            <Cuboid className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold leading-tight text-base-content">
              QuickBrick
            </h1>
            <p className="text-sm text-base-content/70">
              Planejamento visual de missões FLL
            </p>
            <select
              value={season}
              onChange={(e) => handleSeasonChange(e.target.value as Season)}
              className="select select-xs select-bordered mt-1 rounded-full px-3 max-w-xs"
              aria-label="Selecionar temporada"
            >
              <option value="season" disabled>Temporada</option>
              <option value="unearthed">UNEARTHED</option>
              <option value="bioglow" disabled>BIOGLOW</option>
            </select>
          </div>
        </div>
        <button
          onClick={onNewProject}
          className="shrink-0 btn btn-sm btn-outline btn-accent"
        >
          + Novo projeto
        </button>
      </div>

      <hr className="border-base-300" />

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* search */}
        <div className="form-control flex-1 min-w-40">
          <label className="input input-sm input-bordered w-full rounded-lg">
            <Search className="w-4 h-4 text-neutral" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQuery(e.target.value)}
              placeholder="Buscar função ou missão…"
              className="grow"
            />
          </label>
        </div>

        <div className="w-px h-5 bg-base-300 shrink-0" />

        {/* category pills */}
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategory(cat.id)}
            aria-pressed={category === cat.id}
            className={`btn btn-xs btn-outline mr-2 ${category === cat.id ? "btn-active btn-accent" : ""}`}
          >
            {cat.label}
          </button>
        ))}

        <div className="w-px h-5 bg-base-300 shrink-0" />

        {/* sort */}
        <select
          value={sort}
          onChange={(e) => handleSort(e.target.value as SortOption)}
          className="select select-sm select-bordered px-2 rounded-lg"
        >
          <option value="recente">Mais recente</option>
          <option value="az">A → Z</option>
          <option value="pontos">Maior pontuação</option>
        </select>
      </div>

      {/* active filter label */}
      {activeLabel && (
        <p className="text-sm text-neutral text-end opacity-75">Filtrando por {activeLabel}</p>
      )}
    </header>
  );
}
function onFilterChange(arg0: { category: Category; query: string; sort: SortOption; }) {
  throw new Error("Function not implemented.");
}

function onSeasonChange(value: string) {
  throw new Error("Function not implemented.");
}

