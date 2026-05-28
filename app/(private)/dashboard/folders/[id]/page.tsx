"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  ArrowLeft,
  Clock3,
  FileText,
  Folder,
  FolderOpen,
  Pencil,
  Plus,
  Search,
  Star,
  TestTube2,
  Trash2,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import type {
  FolderRow,
  DocumentRow,
  TestRow,
} from "@/repositories/folders.repository";
import { useFolder } from "@/hooks/useFolder";
import FolderSidebar from "../components/FolderSidebar";
import EditModal from "../components/EditModal";

function formatDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SubfolderCard({
  item,
  onClick,
}: {
  item: FolderRow;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-3xl border border-base-300 bg-base-100 p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-13 w-13 items-center justify-center rounded-2xl text-white shadow-sm transition-transform group-hover:scale-105"
          style={{
            background: item.color || "var(--fallback-p,oklch(var(--p)))",
          }}
        >
          <Folder size={26} />
        </div>
        {item.is_favorite && (
          <Star size={15} className="fill-warning text-warning" />
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-black tracking-tight transition-colors group-hover:text-primary">
          {item.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-base-content/55">
          {item.description || "Sem descrição"}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-base-300 pt-3.5 text-xs text-base-content/45">
        <span>{item.file_count} arquivos</span>
        <div className="flex items-center gap-1">
          <Clock3 size={11} />
          {formatDate(item.updated_at)}
        </div>
      </div>
    </button>
  );
}

function DocumentItem({ doc }: { doc: DocumentRow }) {
  return (
    <button className="flex w-full items-center justify-between rounded-2xl border border-base-300 bg-base-100 p-4 text-left transition-colors hover:bg-base-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <div className="min-w-0">
        <h3 className="truncate font-bold">{doc.title}</h3>
        <p className="text-xs text-base-content/50">
          {doc.diagram_type || "Documento"} · {formatDate(doc.updated_at)}
        </p>
      </div>
      {doc.is_favorite && (
        <Star size={13} className="shrink-0 fill-warning text-warning" />
      )}
    </button>
  );
}

function TestItem({ test }: { test: TestRow }) {
  return (
    <button className="flex w-full items-center justify-between rounded-2xl border border-base-300 bg-base-100 p-4 text-left transition-colors hover:bg-base-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <div className="min-w-0">
        <h3 className="truncate font-bold">{test.name_test || "Sem nome"}</h3>
        <p className="text-xs text-base-content/50">
          {test.test_types?.name || "Teste"} · {formatDate(test.created_at)}
        </p>
      </div>
      <Clock3 size={13} className="shrink-0 opacity-40" />
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-base-300 p-6 text-center text-sm text-base-content/50">
      {message}
    </div>
  );
}

// ─── Subfolder creation modal ─────────────────────────────────────────────────

function CreateSubfolderModal({
  onSave,
  onClose,
}: {
  onSave: (name: string, description: string) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(name, description);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-base-300 bg-base-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-base-300 px-6 py-4">
          <h2 className="text-xl font-black">Nova subpasta</h2>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-3 p-6">
          <div>
            <label className="label label-text text-xs">Nome</label>
            <input
              className="input input-bordered w-full"
              placeholder="Nome da subpasta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="label label-text text-xs">
              Descrição (opcional)
            </label>
            <textarea
              className="textarea textarea-bordered w-full resize-none"
              placeholder="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-base-300 px-6 py-4">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            disabled={saving || name.trim().length < 2}
            onClick={handleSave}
          >
            {saving && <span className="loading loading-spinner loading-xs" />}
            Criar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FolderViewPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = Number(params.id);

  const {
    folder,
    children,
    loading,
    error,
    breadcrumbs,
    archiveFolder,
    createSubfolder,
    deleteFolder,
    documents,
    tests,
    toggleFavorite,
    unarchiveFolder,
    updateFolder,
  } = useFolder(folderId);

  const [searchTerm, setSearchTerm] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const filteredChildren = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return children;
    return children.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.description ?? "").toLowerCase().includes(q),
    );
  }, [children, searchTerm]);

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-52 rounded-3xl" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error / not found ──
  if (error || !folder) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <FolderOpen size={52} className="mx-auto mb-4 opacity-35" />
          <h1 className="text-3xl font-black">
            {error ? "Erro ao carregar pasta" : "Pasta não encontrada"}
          </h1>
          <p className="mt-2 text-base-content/55">
            {error ??
              "Esta pasta pode ter sido removida ou você não possui acesso."}
          </p>
          <button
            className="btn btn-primary mt-6"
            onClick={() => router.push("/dashboard/folders")}
          >
            Voltar para pastas
          </button>
        </div>
      </div>
    );
  }

  const hasContent =
    folder.subfolder_count > 0 || folder.file_count > 0 || tests.length > 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[250px_minmax(0,1fr)] h-full overflow-hidden">
      <FolderSidebar currentFolderId={folder.id} />

      <div className="space-y-6 overflow-auto">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <header className="relative overflow-hidden rounded-3xl border border-base-300 bg-base-100">
          {folder.cover_url && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-[0.06]"
              style={{ backgroundImage: `url(${folder.cover_url})` }}
            />
          )}

          <div className="relative flex flex-col gap-5 p-5 md:p-7">
            {/* Topbar */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/dashboard/folders")}
                  className="btn btn-ghost btn-sm btn-circle"
                  aria-label="Voltar"
                >
                  <ArrowLeft size={16} />
                </button>

                <nav className="breadcrumbs p-0 text-sm text-base-content/55">
                  <ul>
                    <li>
                      <button onClick={() => router.push("/dashboard/folders")}>
                        Pastas
                      </button>
                    </li>
                    {breadcrumbs.slice(0, -1).map((crumb) => (
                      <li key={crumb.id}>
                        <button
                          onClick={() =>
                            router.push(`/dashboard/folders/${crumb.id}`)
                          }
                          className="max-w-[100px] truncate"
                        >
                          {crumb.name}
                        </button>
                      </li>
                    ))}
                    <li className="font-semibold text-base-content">
                      {folder.name}
                    </li>
                  </ul>
                </nav>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  className="btn btn-ghost btn-sm btn-circle"
                  onClick={toggleFavorite}
                  aria-label="Favoritar"
                >
                  <Star
                    size={15}
                    className={
                      folder.is_favorite ? "fill-warning text-warning" : ""
                    }
                  />
                </button>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowEdit(true)}
                >
                  <Pencil size={15} />
                  <span className="hidden sm:inline">Editar</span>
                </button>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowCreate(true)}
                >
                  <Plus size={15} />
                  <span className="hidden sm:inline">Nova subpasta</span>
                </button>
              </div>
            </div>

            {/* Folder info */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-md"
                  style={{
                    background:
                      folder.color || "var(--fallback-p,oklch(var(--p)))",
                  }}
                >
                  <Folder size={28} />
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                      {folder.name}
                    </h1>
                    {folder.is_archived && (
                      <span className="badge badge-outline gap-1 text-xs">
                        <Archive size={11} />
                        Arquivada
                      </span>
                    )}
                  </div>

                  {folder.description && (
                    <p className="max-w-2xl text-sm leading-relaxed text-base-content/55">
                      {folder.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/50">
                    <span className="badge badge-ghost">
                      {folder.file_count} arquivos
                    </span>
                    <span className="badge badge-ghost">
                      {folder.subfolder_count} subpastas
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock3 size={11} />
                      {formatDate(folder.updated_at)}
                    </span>
                  </div>

                  {folder.tags && folder.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {folder.tags.map((tag, i) => (
                        <span
                          key={`${tag}-${i}`}
                          className="badge badge-outline badge-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={folder.is_archived ? unarchiveFolder : archiveFolder}
                >
                  <Archive size={14} />
                  {folder.is_archived ? "Desarquivar" : "Arquivar"}
                </button>

                <button
                  className="btn btn-ghost btn-sm text-error"
                  onClick={() => setConfirmDelete(true)}
                  aria-label="Excluir pasta"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ── Search bar ─────────────────────────────────────────────── */}
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-base-content/40"
          />
          <input
            type="text"
            placeholder="Buscar subpastas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-full rounded-2xl pl-10 shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none"
          />
        </div>

        {/* ── Empty state ─────────────────────────────────────────────── */}
        {!hasContent && (
          <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 px-8 py-16 text-center">
            <FolderOpen size={44} className="mx-auto mb-3 opacity-35" />
            <h2 className="text-xl font-black">Pasta vazia</h2>
            <p className="mt-1 text-sm text-base-content/50">
              Crie subpastas ou adicione documentos para começar.
            </p>
            <button
              className="btn btn-primary btn-sm mt-5"
              onClick={() => setShowCreate(true)}
            >
              <Plus size={15} />
              Nova subpasta
            </button>
          </div>
        )}

        {/* ── Subfolders ──────────────────────────────────────────────── */}
        {folder.subfolder_count > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">Subpastas</h2>
              <span className="text-sm text-base-content/50">
                {filteredChildren.length} de {children.length}
              </span>
            </div>

            {filteredChildren.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 px-8 py-14 text-center">
                <FolderOpen size={40} className="mx-auto mb-3 opacity-35" />
                <h3 className="font-black">
                  Nenhum resultado para "{searchTerm}"
                </h3>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredChildren.map((item) => (
                  <SubfolderCard
                    key={item.id}
                    item={item}
                    onClick={() => router.push(`/dashboard/folders/${item.id}`)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Documents + Tests ───────────────────────────────────────── */}
        {(documents.length > 0 || tests.length > 0) && (
          <section className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-3xl border border-base-300 bg-base-100 p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText size={18} />
                </div>
                <h2 className="text-xl font-black">Documentos</h2>
                {documents.length > 0 && (
                  <span className="badge badge-ghost ml-auto">
                    {documents.length}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {documents.length === 0 ? (
                  <EmptyState message="Nenhum documento nesta pasta" />
                ) : (
                  documents.map((doc) => (
                    <DocumentItem key={doc.id} doc={doc} />
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-base-300 bg-base-100 p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <TestTube2 size={18} />
                </div>
                <h2 className="text-xl font-black">Testes</h2>
                {tests.length > 0 && (
                  <span className="badge badge-ghost ml-auto">
                    {tests.length}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {tests.length === 0 ? (
                  <EmptyState message="Nenhum teste nesta pasta" />
                ) : (
                  tests.map((test) => <TestItem key={test.id} test={test} />)
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Modals ──────────────────────────────────────────────────── */}
        {showEdit && (
          <EditModal
            initial={{
              name: folder.name,
              description: folder.description || "",
              color: folder.color || "",
              visibility: folder.visibility,
              icon: folder.icon || "",
              tags: Array.isArray(folder.tags) ? folder.tags.join(",") : folder.tags || "",
            }}
            onClose={() => setShowEdit(false)}
            onSave={async (data) => {
              // ensure visibility has the correct union type for updateFolder
              await updateFolder({
                ...data,
                visibility: data.visibility as any,
                tags: data.tags
                  ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
                  : [],
              });
              setShowEdit(false);
            }}
          />
        )}

        {showCreate && (
          <CreateSubfolderModal
            onSave={async (name, description) => {
              await createSubfolder({
                owner_id: folder.owner_id,
                team_id: folder.team_id,
                parent_id: folder.id,
                name,
                description,
                visibility: folder.visibility,
                position: children.length,
              });
            }}
            onClose={() => setShowCreate(false)}
          />
        )}

        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl border border-base-300 bg-base-100 p-6 shadow-2xl">
              <div className="mb-1 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-error/10 text-error">
                  <Trash2 size={18} />
                </div>
                <h2 className="text-lg font-black">Excluir pasta?</h2>
              </div>
              <p className="mb-5 mt-2 text-sm text-base-content/60">
                A pasta <strong>"{folder.name}"</strong> será arquivada e não
                aparecerá mais na listagem. Esta ação pode ser desfeita.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="btn btn-ghost"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-error"
                  onClick={async () => {
                    await deleteFolder();
                    router.push("/dashboard/folders");
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
