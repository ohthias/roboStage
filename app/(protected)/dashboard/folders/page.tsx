"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  Book,
  Clock,
  File,
  FolderOpen,
  Megaphone,
  Palette,
  Plus,
  Search,
  Star,
  Tag,
  TrafficCone,
  Unlock,
  Users,
  Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useFolders } from "@/hooks/useFolders";
import type { FolderRow } from "@/server/repositories/folders.repository";

import CreateFolderModal from "@/components/Dashboard/folders/ModalCreateFolder";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── types ───────────────────────────────────────────────────────────────────

type FilterKey = "all" | "fav" | "archive" | "public" | "private";

type CreateFolderData = {
  name: string;
  description: string;
  color: string;
  icon: string;
  visibility: string;
  tags: string[];
};

// ─── sub-components ──────────────────────────────────────────────────────────

function FilterChip({
  label,
  count,
  active,
  icon,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border transition-all duration-150
        ${
          active
            ? "bg-base-content text-base-100 border-base-content"
            : "border-base-300 text-base-content/60 hover:border-base-content/40 hover:text-base-content"
        }
      `}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span
          className={`
            inline-block rounded-full px-1.5 py-px text-[11px] leading-none
            ${active ? "bg-base-100/20" : "bg-base-content/10"}
          `}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function FolderCard({
  folder,
  onClick,
}: {
  folder: FolderRow;
  onClick: () => void;
}) {
  const color = folder.color || "#6366f1";
  const iconBg = hexToRgba(color, 0.12);

  return (
    <button
      onClick={onClick}
      className="group flex w-full overflow-hidden rounded-2xl border border-base-300 bg-base-100 text-left transition-all duration-150 hover:-translate-y-px hover:border-base-content/20"
    >
      {/* barra lateral colorida */}
      <div className="w-1 shrink-0" style={{ backgroundColor: color }} />

      {/* conteúdo */}
      <div className="flex flex-1 flex-col p-4 min-w-0">
        {/* topo */}
        <div className="flex items-start justify-between gap-2 mb-3">
          {/* ícone */}
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: iconBg, color }}
          >
            <FolderIconFromString icon={folder.icon} size={18} />
          </div>

          {/* badges */}
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap justify-end">
            {folder.is_favorite && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-600">
                <Star size={10} className="fill-amber-500 text-amber-500" />
              </span>
            )}
            {folder.is_archived && (
              <span className="badge badge-ghost badge-sm gap-1">
                <Archive size={10} />
              </span>
            )}
            {folder.visibility && (
              <span className="badge badge-ghost badge-sm text-[11px]">
                {folder.visibility}
              </span>
            )}
          </div>
        </div>

        {/* nome e descrição */}
        <p className="truncate text-[15px] font-medium text-base-content leading-snug">
          {folder.name}
        </p>
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-base-content/55">
          {folder.description || "Sem descrição"}
        </p>

        {/* rodapé */}
        <div className="mt-3 flex items-center justify-between border-t border-base-200 pt-3">
          <span className="flex items-center gap-1 text-[12px] text-base-content/40">
            <Clock size={12} />
            {folder.updated_at ? formatDate(folder.updated_at) : "—"}
          </span>
          <span className="flex items-center gap-1 text-[12px] text-base-content/40">
            <File size={12} />
            {folder.file_count} arquivos
          </span>
        </div>
      </div>
    </button>
  );
}

/** Mapeia a string do ícone salva no banco para um componente Lucide. */
function FolderIconFromString({
  icon,
  size,
}: {
  icon?: string | null;
  size?: number;
}) {
  const s = size ?? 18;
  const map: Record<string, React.ReactNode> = {
    palette: <Palette size={s} />,
    users: <Users size={s} />,
    road: <TrafficCone size={s} />,
    speakerphone: <Megaphone size={s} />,
    archive: <Archive size={s} />,
    book: <Book size={s} />,
    lock: <Lock size={s} />,
  };
  return <>{map[icon ?? ""] ?? <FolderOpen size={s} />}</>;
}

function EmptyState({
  query,
  onNew,
}: {
  query: string;
  onNew: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 px-8 py-16 text-center">
      <FolderOpen size={40} className="mx-auto mb-4 opacity-25" />

      <h2 className="text-base font-medium text-base-content">
        {query ? "Nenhum resultado encontrado" : "Nenhuma pasta ainda"}
      </h2>

      <p className="mt-1.5 text-sm text-base-content/50 max-w-xs mx-auto leading-relaxed">
        {query
          ? `Nenhuma pasta corresponde a "${query}". Tente outro termo.`
          : "Pastas agrupam conteúdos relacionados. Crie uma para começar a organizar."}
      </p>

      {!query && (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {[
              { icon: <Palette size={12} />, label: "Escolha uma cor" },
              { icon: <Tag size={12} />, label: "Adicione tags" },
              { icon: <Unlock size={12} />, label: "Defina visibilidade" },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-base-200 px-3 py-1 text-[12px] text-base-content/60"
              >
                {icon}
                {label}
              </span>
            ))}
          </div>

          <div className="mt-5">
            <button
              className="btn btn-primary btn-sm rounded-xl gap-1.5"
              onClick={onNew}
            >
              <Plus size={14} />
              Nova pasta
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function FoldersPage() {
  const router = useRouter();
  const { folders = [], loading, createFolder } = useFolders("folders");

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const allFolders = folders as FolderRow[];

  const counts = useMemo(
    () => ({
      all: allFolders.length,
      fav: allFolders.filter((f) => f.is_favorite).length,
      archive: allFolders.filter((f) => f.is_archived).length,
    }),
    [allFolders]
  );

  const filteredFolders = useMemo(() => {
    let items = allFolders;

    if (activeFilter === "fav") items = items.filter((f) => f.is_favorite);
    else if (activeFilter === "archive")
      items = items.filter((f) => f.is_archived);
    else if (activeFilter === "public")
      items = items.filter((f) => f.visibility === "public");
    else if (activeFilter === "private")
      items = items.filter((f) => f.visibility === "private");

    const query = searchTerm.toLowerCase().trim();
    if (!query) return items;

    return items.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        (f.description ?? "").toLowerCase().includes(query) ||
        (f.tags?.join(" ").toLowerCase() ?? "").includes(query)
    );
  }, [allFolders, activeFilter, searchTerm]);

  async function handleCreateFolder(data: CreateFolderData) {
    await createFolder({ ...data, parent_id: null });
    setShowCreateModal(false);
  }

  const filters: {
    key: FilterKey;
    label: string;
    count?: number;
    icon?: React.ReactNode;
  }[] = [
    { key: "all", label: "Todas", count: counts.all },
    {
      key: "fav",
      label: "Favoritas",
      count: counts.fav,
      icon: <Star size={12} />,
    },
    {
      key: "archive",
      label: "Arquivadas",
      count: counts.archive,
      icon: <Archive size={12} />,
    },
    { key: "public", label: "Públicas", icon: <Unlock size={12} /> },
    { key: "private", label: "Privadas", icon: <Lock size={12} /> },
  ];

  return (
    <div className="space-y-5 p-6">
      {/* cabeçalho */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-medium tracking-tight text-base-content">
            <FolderOpen size={22} className="text-base-content/70" />
            Pastas
          </h1>
          <p className="mt-0.5 text-sm text-base-content/50">
            Organize seus conteúdos em coleções
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            className="btn btn-primary btn-sm gap-1.5 rounded-xl"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={15} />
            Nova pasta
          </button>
        </div>
      </header>

      {/* busca */}
      <label className="input input-bordered flex items-center gap-2 rounded-xl px-4 py-2 w-full">
        <Search size={15} className="shrink-0 opacity-40" />
        <input
          type="text"
          className="grow text-sm"
          placeholder="Buscar por nome, descrição ou tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </label>

      {/* filtros */}
      <div className="flex flex-wrap gap-2 w-full" role="group" aria-label="Filtros">
        {filters.map((f) => (
          <FilterChip
            key={f.key}
            label={f.label}
            count={f.count}
            active={activeFilter === f.key}
            icon={f.icon}
            onClick={() => setActiveFilter(f.key)}
          />
        ))}
      </div>

      {/* label de resultados */}
      {searchTerm && !loading && (
        <p className="text-sm text-base-content/40">
          {filteredFolders.length}{" "}
          {filteredFolders.length === 1 ? "resultado" : "resultados"} para{" "}
          <span className="font-medium text-base-content/60">
            "{searchTerm}"
          </span>
        </p>
      )}

      {/* grid */}
      {loading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      ) : filteredFolders.length === 0 ? (
        <EmptyState
          query={searchTerm}
          onNew={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredFolders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onClick={() => router.push(`/dashboard/folders/${folder.id}`)}
            />
          ))}
        </div>
      )}

      {/* modal */}
      {showCreateModal && (
        <CreateFolderModal
          onCreate={handleCreateFolder}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}