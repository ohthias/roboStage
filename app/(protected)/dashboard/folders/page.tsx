"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  Clock3,
  Folder,
  FolderOpen,
  ListFilter,
  Search,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useFolders } from "@/hooks/useFolders";
import type { FolderRow } from "@/server/repositories/folders.repository";

import FolderIcon from "@/components/Dashboard/folders/FolderIcon";
import CreateFolderModal from "../../../../components/Dashboard/folders/ModalCreateFolder";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function FolderCard({
  folder,
  onClick,
}: {
  folder: FolderRow;
  onClick: () => void;
}) {
  const folderColor = folder.color || "oklch(var(--p))";

  return (
    <button
      onClick={onClick}
      className="group relative w-full overflow-visible text-left transition-all duration-300 hover:-translate-y-1"
    >
      {/* ABA DA PASTA */}
      <div
        className="absolute left-6 top-0 z-0 h-10 w-28 rounded-t-2xl rounded-b-md shadow-sm"
        style={{
          backgroundColor: folderColor,
        }}
      />

      {/* CORPO */}
      <div
        className="relative mt-6 overflow-hidden rounded-[32px] rounded-tl-xl border border-base-300 bg-base-200 shadow-lg transition-all duration-300 group-hover:shadow-2xl"
      >
        {/* TOPO COLORIDO */}
        <div
          className="relative h-14 w-full"
          style={{
            backgroundColor: folderColor,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
        </div>

        {/* CONTEÚDO */}
        <div className="relative flex items-center gap-4 p-5">
          {/* ÍCONE */}
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-105"
            style={{
              backgroundColor: folderColor,
            }}
          >
            <FolderIcon icon={folder.icon} size={30} className="text-white" />
          </div>

          {/* TEXTO */}
          <div className="min-w-0 flex-1">
            <h2
              className="truncate text-xl font-black leading-tight text-base-content"
            >
              {folder.name}
            </h2>

            <p
              className="mt-1 line-clamp-2 text-sm leading-relaxed text-base-content/65"
            >
              {folder.description || "Sem descrição"}
            </p>
          </div>

          {/* STATUS */}
          <div className="flex flex-col items-end gap-2">
            {folder.is_favorite && (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/15"
              >
                <Star size={16} className="fill-warning text-warning" />
              </div>
            )}

            {folder.is_archived && (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-base-300"
              >
                <Archive size={15} className="text-base-content/50" />
              </div>
            )}
          </div>
        </div>

        {/* RODAPÉ */}
        <div
          className="flex items-center justify-between border-t border-base-300 bg-base-100/40 px-5 py-3 text-xs text-base-content/55"
        >
          <div className="flex items-center gap-1.5">
            <Clock3 size={12} />
            {folder.updated_at ? formatDate(folder.updated_at) : "-"}
          </div>

          <div className="flex items-center gap-2">
            <span className="badge badge-ghost badge-sm">
              {folder.file_count} arquivos
            </span>

            {folder.visibility && (
              <span className="badge badge-outline badge-sm">
                {folder.visibility}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

type CreateFolderData = {
  name: string;
  description: string;
  color: string;
  icon: string;
  visibility: string;
  tags: string[];
};

export default function FoldersPage() {
  const router = useRouter();

  const { folders = [], loading, createFolder } = useFolders("folders");

  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filteredFolders = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    if (!query) return folders as FolderRow[];

    return (folders as FolderRow[]).filter((folder) => {
      const tags = folder.tags?.join(" ").toLowerCase() ?? "";

      return (
        folder.name.toLowerCase().includes(query) ||
        (folder.description ?? "").toLowerCase().includes(query) ||
        tags.includes(query)
      );
    });
  }, [folders, searchTerm]);

  async function handleCreateFolder(data: CreateFolderData) {
    await createFolder({
      ...data,
      parent_id: null,
    });

    setShowCreateModal(false);
  }

  return (
    <div className="space-y-6 p-6">
      <header className="flex justify-between items-center">
        <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight">
          <Folder size={28} className="text-base-content" />
          Pastas
        </h1>
        <div className="flex items-center gap-2">
          <button
            className={`btn btn-square btn-sm ${showFilters ? "btn-info" : "btn-default"}`}
            onClick={() => setShowFilters(!showFilters)}
            title="Filtros"
          >
            <ListFilter />
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreateModal(true)}
          >
            Nova pasta
          </button>
        </div>
      </header>

      {/* Search */}
      <section
        className={`flex flex-col md:flex-row items-center gap-3 rounded-2xl border border-base-300 bg-base-100 p-3 w-full overflow-hidden transition-all duration-300 ease-in-out ${
          showFilters
            ? "max-h-64 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2 pointer-events-none p-0 border-0 hidden"
        }`}
      >
        <label className="input input-bordered flex w-full items-center gap-2 rounded-2xl px-4 py-2">
          <Search size={16} className="shrink-0 opacity-50" />
          <input
            type="text"
            className="grow"
            placeholder="Buscar por nome, descrição ou tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>
      </section>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="skeleton h-56 rounded-3xl" />
          ))}
        </div>
      ) : filteredFolders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 px-8 py-20 text-center">
          <FolderOpen size={48} className="mx-auto mb-4 opacity-35" />

          <h2 className="text-2xl font-black">
            {searchTerm ? "Nenhuma pasta encontrada" : "Sem pastas ainda"}
          </h2>

          <p className="mt-2 text-base-content/55">
            {searchTerm
              ? `Nenhum resultado para "${searchTerm}".`
              : "Crie sua primeira pasta para começar a organizar conteúdos."}
          </p>

          {!searchTerm && (
            <div className="mt-6">
              <button
                className="btn btn-primary rounded-2xl"
                onClick={() => setShowCreateModal(true)}
              >
                Nova pasta
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {searchTerm && (
            <p className="text-sm text-base-content/50">
              {filteredFolders.length}{" "}
              {filteredFolders.length === 1 ? "resultado" : "resultados"} para{" "}
              <span className="font-semibold text-base-content/70">
                "{searchTerm}"
              </span>
            </p>
          )}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onClick={() => router.push(`/dashboard/folders/${folder.id}`)}
              />
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {showCreateModal && (
        <CreateFolderModal
          onCreate={handleCreateFolder}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
