"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  Clock3,
  Folder,
  FolderOpen,
  Search,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useFolders } from "@/hooks/useFolders";
import type { FolderRow } from "@/repositories/folders.repository";

import FolderIcon from "@/components/Dashboard/folders/FolderIcon";
import CreateFolderModal from "../../../../components/Dashboard/folders/ModalCreateFolder";

function formatDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR");
}

function FolderCard({
  folder,
  onClick,
}: {
  folder: FolderRow;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl border border-base-300 bg-base-100 p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {folder.cover_url && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 transition-opacity group-hover:opacity-15"
          style={{
            backgroundImage: `url(${folder.cover_url})`,
          }}
        />
      )}

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md transition-transform duration-200 group-hover:scale-105"
            style={{
              background: folder.color || "var(--fallback-p,oklch(var(--p)))",
            }}
          >
            <FolderIcon icon={folder.icon} size={26} className="text-white" />
          </div>

          <div className="flex items-center gap-2 pt-1">
            {folder.is_favorite && (
              <Star size={15} className="fill-warning text-warning" />
            )}

            {folder.is_archived && (
              <Archive size={15} className="text-base-content/40" />
            )}
          </div>
        </div>

        <div className="mt-4">
          <h2 className="truncate text-lg font-black tracking-tight transition-colors group-hover:text-primary">
            {folder.name}
          </h2>

          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-base-content/55">
            {folder.description || "Sem descrição"}
          </p>
        </div>

        {folder.tags && folder.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {folder.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="badge badge-outline badge-xs">
                {tag}
              </span>
            ))}

            {folder.tags.length > 3 && (
              <span className="badge badge-ghost badge-xs">
                +{folder.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            {
              label: "Arquivos",
              value: folder.file_count,
            },
            {
              label: "Pastas",
              value: folder.subfolder_count,
            },
            {
              label: "Nível",
              value: folder.depth ?? 0,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-base-300 bg-base-200/50 p-2.5"
            >
              <div className="text-[10px] uppercase tracking-wide opacity-55">
                {label}
              </div>

              <div className="mt-0.5 text-base font-black">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-base-300 pt-3.5 text-xs text-base-content/45">
          <div className="flex items-center gap-1">
            <Clock3 size={11} />
            {formatDate(folder.updated_at)}
          </div>

          <span className="badge badge-ghost badge-xs">
            {folder.visibility}
          </span>
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

  const favoritesCount = (folders as FolderRow[]).filter(
    (f) => f.is_favorite,
  ).length;

  const archivedCount = (folders as FolderRow[]).filter(
    (f) => f.is_archived,
  ).length;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <header className="relative overflow-hidden rounded-3xl border border-base-300 bg-gradient-to-br from-base-100 to-base-200">
        <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative px-6 py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                Suas pastas
              </h1>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-base-content/60">
                Organize testes, estratégias, documentos e conteúdos da equipe
                em um ambiente moderno, hierárquico e preparado para grandes
                projetos.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Search */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        <button
          className="btn btn-primary rounded-2xl"
          onClick={() => setShowCreateModal(true)}
        >
          Nova pasta
        </button>
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
