"use client";

import { useState } from "react";
import {
  Archive,
  ArrowLeft,
  Clock,
  File,
  FileText,
  Folder,
  FolderOpen,
  Plus,
  Pencil,
  Search,
  Star,
  TestTube2,
  Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { useFolder } from "@/hooks/useFolder";
import type { DocumentRow, FolderRow } from "@/server/repositories/folders.repository";
import FolderSidebar from "@/components/Dashboard/folders/FolderSidebar";
import EditModal from "@/components/Dashboard/folders/EditModal";

// ─── helpers ────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── sub-components ──────────────────────────────────────────────────────────

function StatPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-base-300 bg-base-200 px-2.5 py-1 text-[11px] text-base-content/60">
      {icon}
      {label}
    </span>
  );
}

function SubfolderCard({
  folder,
  onClick,
}: {
  folder: FolderRow;
  onClick: () => void;
}) {
  const color = folder.color || "#6366f1";
  const iconBg = hexToRgba(color, 0.1);

  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-3 text-left transition-colors hover:border-base-content/20"
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: iconBg, color }}
      >
        <Folder size={15} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-base-content">
          {folder.name}
        </p>
        <p className="text-[11px] text-base-content/45">
          {folder.file_count} arquivos
        </p>
      </div>
    </button>
  );
}

function DocumentItem({ doc }: { doc: DocumentRow }) {
  return (
    <div className="flex items-center gap-3 border-b border-base-200 py-2.5 last:border-b-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-base-200 text-base-content/50">
        <FileText size={13} />
      </div>
      <span className="flex-1 truncate text-[12px] text-base-content">
        {doc.title}
      </span>
      <span className="shrink-0 text-[11px] text-base-content/40">
        {doc.updated_at ? formatDate(doc.updated_at) : "—"}
      </span>
    </div>
  );
}

function PanelEmpty({ message }: { message: string }) {
  return (
    <p className="py-4 text-center text-[12px] text-base-content/40">
      {message}
    </p>
  );
}

function DeleteModal({
  folderName,
  onConfirm,
  onCancel,
}: {
  folderName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-base-300 bg-base-100 p-6 shadow-2xl">
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-error/10 text-error">
            <Trash2 size={16} />
          </div>
          <h2 className="text-base font-medium">Excluir pasta?</h2>
        </div>
        <p className="mb-5 mt-2 text-sm text-base-content/55">
          A pasta <strong>"{folderName}"</strong> será arquivada e não aparecerá
          mais na listagem. Esta ação pode ser desfeita.
        </p>
        <div className="flex justify-end gap-2">
          <button className="btn btn-ghost btn-sm rounded-xl" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn-error btn-sm rounded-xl" onClick={onConfirm}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function FolderDetailPage() {
  const router = useRouter();
  const params = useParams();

  const idFolder = Number(params.id);


  const {
    folder,
    children,
    breadcrumbs,
    documents,
    tests,
    loading,
    updateFolder,
    createSubfolder,
    deleteFolder,
    toggleFavorite,
    archiveFolder,
    unarchiveFolder,
  } = useFolder(idFolder);

  const [searchTerm, setSearchTerm] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (loading || !folder) {
    return (
      <div className="flex h-full gap-6 p-6">
        <div className="skeleton h-full w-56 shrink-0 rounded-2xl" />
        <div className="flex flex-1 flex-col gap-4">
          <div className="skeleton h-40 w-full rounded-2xl" />
          <div className="skeleton h-32 w-full rounded-2xl" />
          <div className="skeleton h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const color = folder.color || "#6366f1";
  const iconBg = hexToRgba(color, 0.12);

  const query = searchTerm.toLowerCase().trim();

  const filteredChildren = query
    ? children.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          (c.description ?? "").toLowerCase().includes(query)
      )
    : children;

  const hasContent =
    children.length > 0 || documents.length > 0 || tests.length > 0;

  return (
    <div className="flex h-full w-full gap-5 overflow-hidden p-6 transition-all flex-col md:flex-row">
      <FolderSidebar currentFolderId={folder.id} />
      <div className="flex min-w-0 flex-1 flex-col gap-5 overflow-auto">

        <header className="rounded-2xl border border-base-300 bg-base-100">
          <div className="flex items-center justify-between gap-4 border-b border-base-200 px-5 py-3">
            <nav className="flex items-center gap-1.5 text-[12px] text-base-content/50">
              <button
                className="btn btn-ghost btn-xs btn-circle"
                onClick={() => router.push("/dashboard/folders")}
                aria-label="Voltar"
              >
                <ArrowLeft size={14} />
              </button>
              <button
                onClick={() => router.push("/dashboard/folders")}
                className="hover:text-base-content"
              >
                Pastas
              </button>
              {breadcrumbs.slice(0, -1).map((crumb) => (
                <>
                  <span className="text-base-300">/</span>
                  <button
                    key={crumb.id}
                    onClick={() =>
                      router.push(`/dashboard/folders/${crumb.id}`)
                    }
                    className="max-w-[100px] truncate hover:text-base-content"
                  >
                    {crumb.name}
                  </button>
                </>
              ))}
              <span className="text-base-300">/</span>
              <span className="font-medium text-base-content">{folder.name}</span>
            </nav>

            {/* action buttons */}
            <div className="flex items-center gap-1.5">
              <button
                className="btn btn-ghost btn-sm btn-square rounded-xl"
                onClick={toggleFavorite}
                aria-label="Favoritar"
              >
                <Star
                  size={15}
                  className={folder.is_favorite ? "fill-warning text-warning" : ""}
                />
              </button>

              <button
                className="btn btn-ghost btn-sm btn-square rounded-xl"
                onClick={folder.is_archived ? unarchiveFolder : archiveFolder}
                aria-label={folder.is_archived ? "Desarquivar" : "Arquivar"}
                title={folder.is_archived ? "Desarquivar" : "Arquivar"}
              >
                <Archive size={15} />
              </button>

              <button
                className="btn btn-ghost btn-sm gap-1.5 rounded-xl"
                onClick={() => setShowEdit(true)}
              >
                <Pencil size={14} />
                <span className="hidden sm:inline">Editar</span>
              </button>

              <button
                className="btn btn-primary btn-sm gap-1.5 rounded-xl"
                onClick={() => setShowCreate(true)}
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Nova subpasta</span>
              </button>

              <button
                className="btn btn-ghost btn-sm btn-square rounded-xl text-error hover:bg-error/10"
                onClick={() => setConfirmDelete(true)}
                aria-label="Excluir pasta"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* folder identity */}
          <div className="flex items-start gap-4 p-5">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: iconBg, color }}
            >
              <Folder size={22} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-medium tracking-tight text-base-content">
                  {folder.name}
                </h1>
                {folder.is_archived && (
                  <span className="badge badge-outline badge-sm gap-1">
                    <Archive size={10} /> Arquivada
                  </span>
                )}
              </div>

              {folder.description && (
                <p className="mt-1 text-sm leading-relaxed text-base-content/55">
                  {folder.description}
                </p>
              )}

              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <StatPill
                  icon={<File size={11} />}
                  label={`${folder.file_count} arquivos`}
                />
                <StatPill
                  icon={<Folder size={11} />}
                  label={`${folder.subfolder_count} subpastas`}
                />
                <StatPill
                  icon={<Clock size={11} />}
                  label={formatDate(folder.updated_at || folder.created_at)}
                />
                {folder.visibility && (
                  <StatPill icon={null} label={folder.visibility} />
                )}
              </div>

              {folder.tags && folder.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {folder.tags.map((tag, i) => (
                    <span
                      key={`${tag}-${i}`}
                      className="rounded-full border border-base-300 px-2.5 py-0.5 text-[11px] text-base-content/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Search ──────────────────────────────────────────────── */}
        <label className="input input-bordered flex items-center gap-2 rounded-xl px-4 py-2">
          <Search size={14} className="shrink-0 opacity-40" />
          <input
            type="text"
            className="grow text-sm"
            placeholder="Buscar subpastas, documentos e testes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>

        {/* ── Empty state ──────────────────────────────────────────── */}
        {!hasContent && (
          <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 px-8 py-14 text-center">
            <FolderOpen size={36} className="mx-auto mb-3 opacity-25" />
            <h2 className="text-base font-medium">Pasta vazia</h2>
            <p className="mt-1 text-sm text-base-content/50">
              Crie subpastas ou adicione documentos para começar.
            </p>
            <button
              className="btn btn-primary btn-sm mt-5 gap-1.5 rounded-xl"
              onClick={() => setShowCreate(true)}
            >
              <Plus size={14} /> Nova subpasta
            </button>
          </div>
        )}

        {/* ── Subfolders ───────────────────────────────────────────── */}
        {children.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-medium text-base-content">
                <Folder size={14} className="text-base-content/50" />
                Subpastas
                <span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] text-base-content/50">
                  {filteredChildren.length}
                </span>
              </h2>
              {query && (
                <span className="text-[12px] text-base-content/40">
                  {filteredChildren.length} de {children.length}
                </span>
              )}
            </div>

            {filteredChildren.length === 0 ? (
              <div className="rounded-xl border border-dashed border-base-300 py-10 text-center">
                <p className="text-sm text-base-content/40">
                  Nenhum resultado para "{searchTerm}"
                </p>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredChildren.map((item) => (
                  <SubfolderCard
                    key={item.id}
                    folder={item}
                    onClick={() =>
                      router.push(`/dashboard/folders/${item.id}`)
                    }
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Documents + Tests ────────────────────────────────────── */}
        {(documents.length > 0 || tests.length > 0) && (
          <div className="grid gap-4 xl:grid-cols-2">
            {/* Documents */}
            <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
              <div className="mb-3 flex items-center gap-2 border-b border-base-200 pb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-info/10 text-info">
                  <FileText size={14} />
                </div>
                <h2 className="text-sm font-medium text-base-content">
                  Documentos
                </h2>
                {documents.length > 0 && (
                  <span className="ml-auto rounded-full bg-base-200 px-2 py-0.5 text-[11px] text-base-content/50">
                    {documents.length}
                  </span>
                )}
              </div>
              {documents.length === 0 ? (
                <PanelEmpty message="Nenhum documento nesta pasta" />
              ) : (
                documents.map((doc) => (
                  <DocumentItem key={doc.id} doc={doc} />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      {showEdit && (
        <EditModal
          initial={{
            name: folder.name,
            description: folder.description || "",
            color: folder.color || "",
            visibility: folder.visibility,
            icon: folder.icon || "",
            tags: Array.isArray(folder.tags)
              ? folder.tags.join(",")
              : folder.tags || "",
          }}
          onClose={() => setShowEdit(false)}
          onSave={async (data) => {
            await updateFolder({
              ...data,
              visibility: data.visibility as any,
              tags: data.tags
                ? data.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
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
        <DeleteModal
          folderName={folder.name}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={async () => {
            await deleteFolder();
            router.push("/dashboard/folders");
          }}
        />
      )}
    </div>
  );
}

function CreateSubfolderModal({
  onSave,
  onClose,
}: {
  onSave: (name: string, description?: string) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-base-300 bg-base-100 p-6 shadow-2xl">
        <h2 className="mb-4 text-base font-medium">Criar nova subpasta</h2>
        <label className="mb-3 block text-sm">       Nome <span className="text-error">*</span> </label>
        <input
          type="text"          className="input input-bordered w-full rounded-xl"
          placeholder="Ex: Documentação, Projetos, etc"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="mb-3 mt-4 block text-sm">Descrição</label>
        <textarea
          className="textarea textarea-bordered w-full rounded-xl"
          placeholder="Opcional - adicione uma descrição para esta pasta"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn btn-ghost btn-sm rounded-xl" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary btn-sm rounded-xl"
            onClick={() => onSave(name, description)}
            disabled={!name.trim()}
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
}