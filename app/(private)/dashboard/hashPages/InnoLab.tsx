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
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("id, title, diagram_type, created_at, updated_at")
      .order("created_at", { ascending: false });

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

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter = filter ? doc.diagram_type === filter : true;
    return matchesSearch && matchesFilter;
  });

  // Ícones por tipo de diagrama
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
          <BookOpenIcon className="w-12 h-12 text-secondary/70" />
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

      {/* Busca e filtros */}
      <section className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <input
          type="text"
          placeholder="Buscar diagramas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered flex-1 px-4 py-2 w-full md:w-auto"
        />
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {["5W2H", "Ishikawa", "Mapa Mental", "Flowchart", "SWOT"].map((t) => (
            <button
              key={t}
              className={`btn btn-sm transition-all ${
                filter === t ? "btn-secondary" : "btn-outline btn-default"
              }`}
              onClick={() => setFilter(filter === t ? null : t)}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* Grid de diagramas */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-10">
            <Loader />
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="col-span-full text-center py-10 text-base-content/60">
            <FileStack className="w-10 h-10 mx-auto mb-4" />
            Nenhum diagrama encontrado.
          </div>
        ) : (
          filteredDocs.map((doc) => {
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
              >
                {/* Título */}
                <h3 className="text-lg font-semibold text-base-content mb-2">
                  {doc.title}
                </h3>

                {/* Badge com ícone à esquerda */}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`badge ${typeStyles[doc.diagram_type]}`}>
                    {Icon && <Icon className={`w-5 h-5`} />}
                    {doc.diagram_type}
                  </div>
                </div>

                {/* Datas */}
                <p className="text-xs text-base-content/50 mt-1">
                  Última atualização:{" "}
                  {doc.updated_at
                    ? new Date(doc.updated_at).toLocaleDateString("pt-BR")
                    : new Date(doc.created_at).toLocaleDateString("pt-BR")}
                </p>

                {/* Footer com botão de deletar */}
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
    </div>
  );
}
