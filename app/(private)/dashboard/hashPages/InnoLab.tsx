"use client";

type DiagramType = "5W2H" | "Ishikawa" | "Mapa Mental" | "Flowchart" | "SWOT";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { LayoutGrid, Lightbulb, List } from "lucide-react";

import ModalConfirm, {
  ModalConfirmRef,
} from "@/components/ui/Modal/ModalConfirm";

import DiagramCard, {
  Document,
} from "@/components/ui/dashboard/innolab/DiagramCard";
import CreateDiagramModal from "@/components/ui/Modal/CreateDiagramModal";
import { useToast } from "@/app/context/ToastContext";
import DiagramCardSkeleton from "@/components/ui/dashboard/innolab/DiagramCardSkeleton";

export default function InnoLab() {
  const router = useRouter();
  const { addToast } = useToast();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  const modalDeleteRef = useRef<ModalConfirmRef>(null);

  const [search, setSearch] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [typeFilter, setTypeFilter] = useState<DiagramType | "all">("all");

  /* ================= FETCH ================= */
  const fetchDocuments = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("updated_at", { ascending: false, nullsFirst: true });

    if (!error && data) {
      setDocuments(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  /* ================= FILTERS ================= */

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFavorite = onlyFavorites ? doc.is_favorite : true;

    const matchesType =
      typeFilter === "all" ? true : doc.diagram_type === typeFilter;

    return matchesSearch && matchesFavorite && matchesType;
  });

  /* ================= ACTIONS ================= */
  const openDeleteModal = (doc: Document) => {
    modalDeleteRef.current?.open(
      `Deseja deletar o diagrama "${doc.title}"?`,
      () => handleDelete(doc)
    );
  };

  const handleDelete = async (doc: Document) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        addToast("Usuário não autenticado", "error");
        return;
      }

      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", doc.id)
        .eq("user_id", user.id);

      if (error) throw error;

      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));

      addToast("Diagrama deletado com sucesso!", "success");
    } catch (error) {
      console.error(error);
      addToast("Erro ao deletar diagrama", "error");
    }
  };

  const toggleFavorite = async (doc: Document) => {
    const updated = { ...doc, is_favorite: !doc.is_favorite };

    setDocuments((prev) => prev.map((d) => (d.id === doc.id ? updated : d)));

    await supabase
      .from("documents")
      .update({ is_favorite: updated.is_favorite })
      .eq("id", doc.id);
    addToast("Favorito atualizado!", "info");
  };

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
      addToast("Diagrama criado com sucesso!", "success");
    } catch (error) {
      addToast("Erro ao criar diagrama", "error");
      console.error(error);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="px-6 pt-4 space-y-6 flex flex-col h-full">
      {/* Banner Criar Diagrama */}
      <div className="rounded-2xl border border-base-300 bg-gradient-to-br from-primary/10 via-base-100 to-base-300/10 p-6 flex flex-col sm:flex-row  items-start sm:items-center justify-between gap-4">
        {/* Info */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Lightbulb className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-xl font-semibold leading-tight">InnoLab</h1>
            <p className="text-sm text-base-content/70 max-w-md">
              Crie, organize e evolua seus diagramas de engenharia e ideação.
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="shrink-0">
          <CreateDiagramModal onCreate={handleCreateDiagram} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-base-100/60 border border-base-300 rounded-xl p-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Buscar diagrama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-sm input-bordered w-full sm:max-w-xs"
        />

        {/* Type */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="select select-sm select-bordered w-full sm:max-w-xs px-2 rounded-box"
        >
          <option value="all">Todos os tipos</option>
          <option value="5W2H">5W2H</option>
          <option value="Ishikawa">Ishikawa</option>
          <option value="Mapa Mental">Mapa Mental</option>
          <option value="Flowchart">Flowchart</option>
          <option value="SWOT">SWOT</option>
        </select>

        {/* Favorites */}
        <label className="label cursor-pointer gap-2">
          <input
            type="checkbox"
            checked={onlyFavorites}
            onChange={(e) => setOnlyFavorites(e.target.checked)}
            className="checkbox checkbox-sm checkbox-primary"
          />
          <span className="label-text text-sm">Somente favoritos</span>
        </label>
      </div>

      {/* Header ViewMode */}
      <div className="flex justify-end">
        <div className="flex bg-base-100/50 p-1 rounded-xl gap-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`btn btn-sm ${
              viewMode === "grid" ? "btn-primary" : "btn-ghost"
            }`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`btn btn-sm ${
              viewMode === "list" ? "btn-primary" : "btn-ghost"
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Grid / List */}
      <section
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-3"
        }
      >
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <DiagramCardSkeleton key={i} viewMode={viewMode} />
          ))}

        {!loading &&
          documents.map((doc) => (
            <DiagramCard
              key={doc.id}
              doc={doc}
              viewMode={viewMode}
              onOpen={() =>
                router.push(`/dashboard/innolab/${doc.id}/${doc.diagram_type}`)
              }
              onToggleFavorite={() => toggleFavorite(doc)}
              onDelete={() => openDeleteModal(doc)}
            />
          ))}

        {!loading && documents.length === 0 && (
          <div className="col-span-full text-center text-base-content/60 py-12">
            Nenhum diagrama criado ainda.
          </div>
        )}
      </section>

      {/* Modais */}
      <ModalConfirm
        ref={modalDeleteRef}
        title="Confirmar delete"
        confirmLabel="Deletar"
        cancelLabel="Cancelar"
      />
    </div>
  );
}
