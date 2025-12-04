"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import CreateDiagramModal from "@/components/ui/Modal/CreateDiagramModal";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/app/context/ToastContext";

import {
  List,
  Fish,
  Brain,
  Workflow,
  CircleDashed,
  Trash2,
  FileStack,
  SortAsc,
  SortDesc,
  ChevronUp,
  ChevronDown,
  FolderKanban,
} from "lucide-react";

import Loader from "@/components/loader";

interface Document {
  id: string;
  title: string;
  diagram_type: string;
  created_at: string;
  updated_at?: string;
}

export default function InnoLab() {
  const router = useRouter();
  const { addToast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [sort, setSort] = useState("recent");
  const [loading, setLoading] = useState(true);

  // PAGINAÇÃO
  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("id, title, diagram_type, created_at, updated_at")
      .order("updated_at", { ascending: false, nullsFirst: true });

    if (!error && data) setDocuments(data as Document[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleCreateDiagram = async (data: { title: string; type: string }) => {
    if (!data.title || !data.type) return;
    try {
      const user = (await supabase.auth.getUser()).data.user;
      const { error } = await supabase.from("documents").insert([
        {
          title: data.title,
          diagram_type: data.type,
          content: {},
          user_id: user?.id || null,
        },
      ]);

      if (error) throw error;
      await fetchDocuments();
    } catch (error) {
      console.error("Erro ao criar diagrama:", error);
    }
  };

  // Normaliza strings para buscas sem acento
  const normalize = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // FILTRO + BUSCA + ORDENAR
  const filteredDocs = documents
    .filter((doc) => {
      const searchTerm = normalize(search);

      const matchesSearch =
        normalize(doc.title).includes(searchTerm) ||
        normalize(doc.diagram_type).includes(searchTerm) ||
        normalize(
          new Date(doc.updated_at || doc.created_at).toLocaleDateString("pt-BR")
        ).includes(searchTerm);

      const matchesFilter = filter ? doc.diagram_type === filter : true;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();

      switch (sort) {
        case "oldest":
          return dateA - dateB;
        case "atoz":
          return a.title.localeCompare(b.title);
        case "ztoa":
          return b.title.localeCompare(a.title);
        case "type":
          return a.diagram_type.localeCompare(b.diagram_type);
        default:
          return dateB - dateA; // recent (updated first)
      }
    });

  // PAGINAÇÃO REAL
  const paginatedDocs = filteredDocs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredDocs.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, sort]);

  // Ícones por tipo
  const typeIcons: Record<string, React.ElementType> = {
    "5W2H": List,
    Ishikawa: Fish,
    "Mapa Mental": Brain,
    Flowchart: Workflow,
    SWOT: CircleDashed,
  };

  const typeStyles: Record<string, string> = {
    "5W2H": "bg-primary/10 text-primary",
    Ishikawa: "bg-secondary/10 text-secondary",
    "Mapa Mental": "bg-accent/10 text-accent",
    Flowchart: "bg-success/10 text-success",
    SWOT: "bg-warning/10 text-warning",
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-base-100 p-6 rounded-xl shadow-md border border-base-300">
        <div className="flex items-center gap-4">
          <BookOpenIcon className="w-12 h-12 text-secondary/70 hidden md:block" />
          <div>
            <h2 className="text-3xl font-bold text-base-content">
              Inno<span className="text-secondary">Lab</span>
            </h2>
            <p className="text-sm text-base-content/80 mt-1">
              Dê vida às suas ideias: crie diagramas diversos para impulsionar
              seu projeto!
            </p>
          </div>
        </div>
        <CreateDiagramModal onCreate={handleCreateDiagram} />
      </section>

      {/* Busca + Filtros + Ordenação */}
      <section className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        {/* Campo de busca */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-1">
          <input
            type="text"
            placeholder="Buscar diagramas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="btn btn-circle btn-ghost btn-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Ordenação */}
        <div className="flex flex-wrap gap-2">
          <button
            className={`btn btn-sm ${
              sort === "recent" ? "btn-secondary" : "btn-outline"
            }`}
            onClick={() => setSort("recent")}
          >
            <SortDesc className="w-4 h-4" /> Recentes
          </button>

          <button
            className={`btn btn-sm ${
              sort === "oldest" ? "btn-secondary" : "btn-outline"
            }`}
            onClick={() => setSort("oldest")}
          >
            <SortAsc className="w-4 h-4" /> Antigos
          </button>

          <button
            className={`btn btn-sm ${
              sort === "atoz" ? "btn-secondary" : "btn-outline"
            }`}
            onClick={() => setSort("atoz")}
          >
            <ChevronUp className="w-4 h-4" /> A–Z
          </button>

          <button
            className={`btn btn-sm ${
              sort === "ztoa" ? "btn-secondary" : "btn-outline"
            }`}
            onClick={() => setSort("ztoa")}
          >
            <ChevronDown className="w-4 h-4" /> Z–A
          </button>
          {/* Dropdown de tipos */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-outline btn-sm">
              Tipos
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              {["5W2H", "Ishikawa", "Mapa Mental", "Flowchart", "SWOT"].map(
                (t) => (
                  <li key={t}>
                    <button onClick={() => setFilter(filter === t ? null : t)}>
                      {t}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Reset */}
        {(filter || search || sort !== "recent") && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setFilter(null);
              setSearch("");
              setSort("recent");
            }}
          >
            Limpar filtros
          </button>
        )}
      </section>

      {/* GRID PAGINADO */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-10">
            <Loader />
          </div>
        ) : paginatedDocs.length === 0 ? (
          <div className="col-span-full text-center py-10 text-base-content/60">
            <FileStack className="w-10 h-10 mx-auto mb-4" />
            Nenhum diagrama encontrado.
          </div>
        ) : (
          paginatedDocs.map((doc) => {
            const Icon = typeIcons[doc.diagram_type];

            const handleDelete = async () => {
              if (
                !confirm(`Deseja realmente deletar o diagrama "${doc.title}"?`)
              )
                return;

              try {
                const { error } = await supabase
                  .from("documents")
                  .delete()
                  .eq("id", doc.id);

                if (error) throw error;
                addToast("Diagrama deletado com sucesso!", "success");
                await fetchDocuments();
              } catch (error) {
                console.error("Erro ao deletar diagrama:", error);
                addToast("Erro ao deletar diagrama", "error");
              }
            };

            return (
              <div
                key={doc.id}
                className="bg-base-100 border border-base-300 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-transform transform hover:scale-105 flex flex-col justify-between"
                onClick={() => {
                  if (window.innerWidth < 640) {
                    alert(
                      "Diagrama em dispositivos móveis está em desenvolvimento!"
                    );
                    return;
                  }
                  router.push(
                    `/dashboard/innolab/${doc.id}/${doc.diagram_type}`
                  );
                }}
              >
                <h3 className="text-lg font-semibold text-base-content mb-2">
                  {doc.title}
                </h3>

                <div className="flex items-center gap-2 mb-2">
                  <div className={`badge ${typeStyles[doc.diagram_type]}`}>
                    {Icon && <Icon className="w-5 h-5" />}
                    {doc.diagram_type}
                  </div>
                </div>

                <p className="text-xs text-base-content/50 mt-1">
                  Última atualização:{" "}
                  {new Date(
                    doc.updated_at || doc.created_at
                  ).toLocaleDateString("pt-BR")}
                </p>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="btn btn-error btn-square btn-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* PAGINAÇÃO DAISYUI */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="join">
            <button
              className={`join-item btn btn-sm ${
                currentPage === 1 ? "btn-disabled" : ""
              }`}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              «
            </button>

            <button className="join-item btn btn-sm">
              Página {currentPage} / {totalPages}
            </button>

            <button
              className={`join-item btn btn-sm ${
                currentPage === totalPages ? "btn-disabled" : ""
              }`}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
