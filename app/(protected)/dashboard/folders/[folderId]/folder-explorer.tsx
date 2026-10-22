"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  ArrowDownAZ,
  ArrowLeft,
  ArrowUpAZ,
  ChevronLeft,
  ChevronRight,
  FileText,
  FilterX,
  FlaskConical,
  Folder,
  FolderPlus,
  LayoutGrid,
  List,
  Network,
  Plus,
  Search,
  Tag,
  X,
} from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { DocIcon } from "@/components/editor/doc-icon";
import { TagChip } from "@/components/stagebook/labels/tag-chip";
import { folderColorStyles } from "@/utils/stagebook/folder-colors";
import type { TagDTO } from "@/types/labels";
import { createDocument, createFolder } from "../../documents/actions";
import { FolderAppearanceMenu, type FolderAppearance } from "../folder-appearance-menu";
import { ExplorerContentSkeleton } from "./explorer-skeleton";
import {
  PAGE_SIZE,
  VIEW_STORAGE_KEY,
  type Crumb,
  type EntryKind,
  type ExplorerEntry,
  type ViewMode,
} from "./explorer-types";

type TypeFilter = "all" | Exclude<EntryKind, "folder">;
type SortKey = "name" | "updated";
type SortDir = "asc" | "desc";

const KIND_META: Record<
  EntryKind,
  { label: string; Icon: typeof Folder; tone: string }
> = {
  folder: { label: "Pasta", Icon: Folder, tone: "bg-primary/10 text-primary" },
  document: {
    label: "Documento",
    Icon: FileText,
    tone: "bg-base-200/70 text-base-content/60",
  },
  labtest: {
    label: "LabTest",
    Icon: FlaskConical,
    tone: "bg-primary/10 text-primary",
  },
  thinklab: {
    label: "ThinkLab",
    Icon: Network,
    tone: "bg-secondary/10 text-secondary",
  },
};

const TYPE_TABS: { key: TypeFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "document", label: "Documentos" },
  { key: "labtest", label: "LabTest" },
  { key: "thinklab", label: "ThinkLab" },
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

export function FolderExplorer({
  folderId,
  folderName,
  folderIcon,
  folderColor,
  parentId,
  crumbs,
  entries: serverEntries,
  availableTags,
}: {
  folderId: string;
  folderName: string;
  folderIcon: string | null;
  folderColor: string | null;
  parentId: string | null;
  crumbs: Crumb[];
  entries: ExplorerEntry[];
  availableTags: TagDTO[];
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [view, setView] = useState<ViewMode>("grid");
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  // Personalização otimista das subpastas (por cima dos dados do servidor).
  const [folderOverrides, setFolderOverrides] = useState<Record<string, FolderAppearance>>({});
  const entries = useMemo(
    () =>
      serverEntries.map((entry) =>
        entry.kind === "folder" && folderOverrides[entry.id]
          ? { ...entry, ...folderOverrides[entry.id] }
          : entry,
      ),
    [serverEntries, folderOverrides],
  );
  const changeSubfolder = (id: string, next: FolderAppearance) =>
    setFolderOverrides((prev) => ({ ...prev, [id]: next }));

  // Aparência da pasta atual (otimista); sincroniza quando o servidor reenvia.
  const [appearance, setAppearance] = useState({ icon: folderIcon, color: folderColor });
  useEffect(() => {
    setAppearance({ icon: folderIcon, color: folderColor });
  }, [folderIcon, folderColor]);
  const headerColor = folderColorStyles(appearance.color);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
      if (saved === "grid" || saved === "list") setView(saved);
    } catch {
      /* ignora */
    }
  }, []);

  function changeView(next: ViewMode) {
    setView(next);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      /* ignora */
    }
  }

  const counts = useMemo(() => {
    const base = { all: entries.length, document: 0, labtest: 0, thinklab: 0 };
    for (const entry of entries) {
      if (entry.kind !== "folder") base[entry.kind] += 1;
    }
    return base;
  }, [entries]);

  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    const list = entries.filter((entry) => {
      if (type !== "all" && entry.kind !== type) return false;
      if (needle && !normalize(entry.name).includes(needle)) return false;
      if (selectedTags.length > 0) {
        // Pastas não têm tags: ficam de fora quando há filtro por tag.
        if (entry.kind === "folder") return false;
        const ids = new Set(entry.tags.map((t) => t.id));
        if (!selectedTags.some((id) => ids.has(id))) return false;
      }
      return true;
    });

    const dir = sortDir === "asc" ? 1 : -1;
    return list.sort((a, b) => {
      // Como em um explorador de arquivos: pastas sempre primeiro.
      if ((a.kind === "folder") !== (b.kind === "folder")) {
        return a.kind === "folder" ? -1 : 1;
      }
      if (sortKey === "updated") {
        const diff =
          new Date(a.updatedAt ?? 0).getTime() -
          new Date(b.updatedAt ?? 0).getTime();
        if (diff !== 0) return diff * dir;
      }
      return (
        a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }) *
        (sortKey === "name" ? dir : 1)
      );
    });
  }, [entries, query, type, selectedTags, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const hasFilters = query !== "" || type !== "all" || selectedTags.length > 0;

  function clearFilters() {
    setQuery("");
    setType("all");
    setSelectedTags([]);
    setPage(1);
  }

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
    setPage(1);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "updated" ? "desc" : "asc");
    }
    setPage(1);
  }

  function addSubfolder() {
    startTransition(async () => {
      try {
        await createFolder(folderId);
        addToast("Subpasta criada.", "success");
        router.refresh();
      } catch (error) {
        addToast(
          error instanceof Error ? error.message : "Não foi possível criar a subpasta.",
          "error",
        );
      }
    });
  }

  function addDocument() {
    startTransition(async () => {
      try {
        const created = await createDocument(folderId);
        router.push(`/dashboard/documents/${created.id}`);
      } catch (error) {
        addToast(
          error instanceof Error ? error.message : "Não foi possível criar a página.",
          "error",
        );
      }
    });
  }

  const SortIcon = sortDir === "asc" ? ArrowDownAZ : ArrowUpAZ;
  const backHref = parentId ? `/dashboard/folders/${parentId}` : "/dashboard/folders";

  return (
    <section className="min-h-full space-y-6 bg-base-100 px-4 py-8 text-base-content sm:px-6 lg:px-8">
      {/* Barra de endereço: voltar + caminho */}
      <div className="flex items-center gap-2">
        <Link
          href={backHref}
          className="btn btn-ghost btn-sm btn-square"
          title="Subir um nível"
          aria-label="Subir um nível"
        >
          <ArrowLeft size={16} />
        </Link>
        <nav
          aria-label="Caminho da pasta"
          className="breadcrumbs min-w-0 flex-1 overflow-x-auto rounded-lg border border-base-300 bg-base-200/40 px-3 py-1 text-sm"
        >
          <ul>
            <li>
              <Link href="/dashboard/folders">Pastas</Link>
            </li>
            {crumbs.map((crumb) => (
              <li key={crumb.id}>
                <Link href={`/dashboard/folders/${crumb.id}`}>{crumb.name}</Link>
              </li>
            ))}
            <li>
              <span className="font-semibold text-base-content">{folderName}</span>
            </li>
          </ul>
        </nav>
      </div>

      <header
        className="flex flex-col justify-between gap-4 rounded-2xl border border-transparent p-4 sm:flex-row sm:items-center"
        style={headerColor?.card}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
            style={headerColor?.tile}
          >
            {appearance.icon ? (
              <DocIcon value={appearance.icon} size={26} />
            ) : (
              <Folder size={26} strokeWidth={1.7} />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-black tracking-tight sm:text-3xl">
              {folderName}
            </h1>
            <p className="mt-0.5 text-sm text-base-content/55">
              {entries.length === 0
                ? "Pasta vazia"
                : `${entries.length} ${entries.length === 1 ? "item" : "itens"}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
        <FolderAppearanceMenu
          folderId={folderId}
          icon={appearance.icon}
          color={appearance.color}
          onChange={setAppearance}
          triggerClassName="btn btn-ghost btn-sm gap-2 border-base-300"
          triggerLabel="Personalizar"
        />
        <div className="dropdown dropdown-end">
          <button
            type="button"
            tabIndex={0}
            className="btn btn-primary btn-sm gap-2"
            disabled={isPending}
          >
            <Plus size={16} strokeWidth={2} />
            Novo
          </button>
          <ul
            tabIndex={0}
            className="menu dropdown-content z-30 mt-2 w-52 rounded-xl border border-base-300 bg-base-100 p-2 shadow-lg"
          >
            <li>
              <button type="button" onClick={addSubfolder}>
                <FolderPlus size={16} /> Subpasta
              </button>
            </li>
            <li>
              <button type="button" onClick={addDocument}>
                <FileText size={16} /> Documento
              </button>
            </li>
            <li>
              <Link href={`/dashboard/labtest/new?folderId=${folderId}`}>
                <FlaskConical size={16} /> LabTest
              </Link>
            </li>
            <li>
              <Link href={`/dashboard/thinklab?folderId=${folderId}`}>
                <Network size={16} /> ThinkLab
              </Link>
            </li>
          </ul>
        </div>
        </div>
      </header>

      <div className="h-px bg-gradient-to-r from-primary/30 via-base-300 to-transparent" />

      {/* Toolbar: busca, tipo, tags, ordenação, visualização */}
      <div className="space-y-3 rounded-xl border border-base-300 bg-base-100 p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <label className="input input-sm flex w-full items-center gap-2 border-base-300 sm:w-64">
            <Search size={15} className="shrink-0 text-base-content/45" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nome…"
              aria-label="Buscar por nome"
              className="grow"
            />
          </label>

          <div className="gap-1 flex flex-wrap" role="group" aria-label="Filtrar por tipo">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                aria-pressed={type === tab.key}
                onClick={() => {
                  setType(tab.key);
                  setPage(1);
                }}
                className={`btn btn-sm join-item gap-1.5 ${
                  type === tab.key ? "btn-primary" : "btn-ghost border-base-300"
                }`}
              >
                {tab.label}
                <span
                  className={`text-[10px] font-semibold ${
                    type === tab.key ? "opacity-80" : "text-base-content/45"
                  }`}
                >
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="dropdown">
            <button
              type="button"
              tabIndex={0}
              className={`btn btn-sm gap-2 ${
                selectedTags.length > 0 ? "btn-primary btn-outline" : "btn-ghost border-base-300"
              }`}
              disabled={availableTags.length === 0}
              title={availableTags.length === 0 ? "Nenhuma tag em uso nesta pasta" : undefined}
            >
              <Tag size={15} />
              Tags
              {selectedTags.length > 0 && (
                <span className="badge badge-primary badge-xs">{selectedTags.length}</span>
              )}
            </button>
            <div
              tabIndex={0}
              className="dropdown-content z-30 mt-2 max-h-72 w-64 overflow-y-auto rounded-xl border border-base-300 bg-base-100 p-2 shadow-lg"
            >
              <p className="px-2 pb-1 pt-0.5 text-[11px] font-semibold uppercase tracking-wide text-base-content/50">
                Mostrar itens com qualquer tag
              </p>
              {availableTags.map((tag) => {
                const checked = selectedTags.includes(tag.id);
                return (
                  <label
                    key={tag.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-base-200/60"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={checked}
                      onChange={() => toggleTag(tag.id)}
                    />
                    <TagChip tag={tag} size="xs" />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="dropdown dropdown-end">
              <button
                type="button"
                tabIndex={0}
                className="btn btn-ghost btn-sm gap-2 border-base-300"
                title="Ordenar"
              >
                <SortIcon size={15} />
                <span className="hidden sm:inline">
                  {sortKey === "name" ? "Nome" : "Modificado"}
                </span>
              </button>
              <ul
                tabIndex={0}
                className="menu dropdown-content z-30 mt-2 w-48 rounded-xl border border-base-300 bg-base-100 p-2 shadow-lg"
              >
                <li>
                  <button
                    type="button"
                    className={sortKey === "name" ? "menu-active" : ""}
                    onClick={() => toggleSort("name")}
                  >
                    Nome {sortKey === "name" && (sortDir === "asc" ? "(A–Z)" : "(Z–A)")}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={sortKey === "updated" ? "menu-active" : ""}
                    onClick={() => toggleSort("updated")}
                  >
                    Modificado{" "}
                    {sortKey === "updated" && (sortDir === "desc" ? "(recentes)" : "(antigos)")}
                  </button>
                </li>
              </ul>
            </div>

            <div className="gap-1 flex flex-wrap" role="group" aria-label="Modo de visualização">
              <button
                type="button"
                aria-pressed={view === "grid"}
                aria-label="Visualização em grade"
                title="Grade"
                onClick={() => changeView("grid")}
                className={`btn btn-sm btn-square join-item ${
                  view === "grid" ? "btn-primary" : "btn-ghost border-base-300"
                }`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                aria-pressed={view === "list"}
                aria-label="Visualização em lista"
                title="Lista"
                onClick={() => changeView("list")}
                className={`btn btn-sm btn-square join-item ${
                  view === "list" ? "btn-primary" : "btn-ghost border-base-300"
                }`}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {selectedTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-base-content/50">Tags:</span>
            {availableTags
              .filter((t) => selectedTags.includes(t.id))
              .map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className="inline-flex items-center gap-1 rounded-full"
                  title="Remover filtro"
                  aria-label={`Remover filtro da tag ${tag.name}`}
                >
                  <TagChip tag={tag} size="xs" />
                  <X size={12} className="text-base-content/50" />
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      {isPending ? (
        <ExplorerContentSkeleton view={view} count={Math.min(paginated.length || 6, PAGE_SIZE)} />
      ) : entries.length === 0 ? (
        <EmptyFolder folderId={folderId} onSubfolder={addSubfolder} onDocument={addDocument} />
      ) : filtered.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 px-6 py-10 text-center">
          <Search size={26} className="mb-3 text-base-content/30" />
          <h2 className="font-semibold">Nada encontrado</h2>
          <p className="mt-1 text-sm text-base-content/55">
            Nenhum item corresponde aos filtros atuais.
          </p>
          <button type="button" className="btn btn-outline btn-sm mt-4 gap-2" onClick={clearFilters}>
            <FilterX size={15} />
            Limpar filtros
          </button>
        </div>
      ) : view === "grid" ? (
        <GridView items={paginated} onAppearance={changeSubfolder} />
      ) : (
        <ListView
          items={paginated}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={toggleSort}
          onAppearance={changeSubfolder}
        />
      )}

      {/* Barra de status + paginação */}
      {entries.length > 0 && filtered.length > 0 && (
        <footer className="flex flex-col items-center justify-between gap-3 text-xs text-base-content/55 sm:flex-row">
          <p>
            {filtered.length === entries.length
              ? `${filtered.length} ${filtered.length === 1 ? "item" : "itens"}`
              : `${filtered.length} de ${entries.length} itens`}
            {totalPages > 1 && ` · página ${currentPage} de ${totalPages}`}
            {hasFilters && (
              <button
                type="button"
                className="link link-primary ml-2"
                onClick={clearFilters}
              >
                limpar filtros
              </button>
            )}
          </p>

          {filtered.length > PAGE_SIZE && (
            <nav className="join" aria-label="Paginação">
              <button
                type="button"
                className="btn btn-sm join-item"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Página anterior"
              >
                <ChevronLeft size={15} />
              </button>
              {pageWindow(currentPage, totalPages).map((p, i) =>
                p === "…" ? (
                  <span key={`gap-${i}`} className="btn btn-sm btn-disabled join-item">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    aria-current={p === currentPage ? "page" : undefined}
                    className={`btn btn-sm join-item ${p === currentPage ? "btn-primary" : ""}`}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                type="button"
                className="btn btn-sm join-item"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Próxima página"
              >
                <ChevronRight size={15} />
              </button>
            </nav>
          )}
        </footer>
      )}
    </section>
  );
}

function EntryIcon({
  entry,
  size,
  box,
}: {
  entry: ExplorerEntry;
  size: number;
  box: string;
}) {
  const { Icon, tone } = KIND_META[entry.kind];
  const colored = entry.kind === "folder" ? folderColorStyles(entry.color) : null;
  return (
    <div
      className={`flex shrink-0 items-center justify-center ${box} ${tone}`}
      style={colored?.tile}
    >
      {entry.icon ? (
        <DocIcon value={entry.icon} size={size} />
      ) : (
        <Icon size={size} strokeWidth={1.7} />
      )}
    </div>
  );
}

function TagsInline({ tags, max = 3 }: { tags: TagDTO[]; max?: number }) {
  if (tags.length === 0) return null;
  const shown = tags.slice(0, max);
  const rest = tags.length - shown.length;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {shown.map((tag) => (
        <TagChip key={tag.id} tag={tag} size="xs" />
      ))}
      {rest > 0 && (
        <span className="text-[10px] font-medium text-base-content/45">+{rest}</span>
      )}
    </div>
  );
}

function SubfolderMenu({
  entry,
  onAppearance,
  triggerClassName,
}: {
  entry: ExplorerEntry;
  onAppearance: (id: string, next: FolderAppearance) => void;
  triggerClassName: string;
}) {
  return (
    <FolderAppearanceMenu
      folderId={entry.id}
      icon={entry.icon}
      color={entry.color ?? null}
      onChange={(next) => onAppearance(entry.id, next)}
      triggerClassName={triggerClassName}
    />
  );
}

function GridView({
  items,
  onAppearance,
}: {
  items: ExplorerEntry[];
  onAppearance: (id: string, next: FolderAppearance) => void;
}) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {items.map((entry) => (
        <li key={`${entry.kind}-${entry.id}`} className="group/item relative min-w-0">
          <Link
            href={entry.href}
            style={entry.kind === "folder" ? folderColorStyles(entry.color)?.card : undefined}
            className="group relative flex h-full min-h-[96px] min-w-0 items-center gap-3 overflow-hidden rounded-xl border border-base-300 bg-base-100 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-base-200/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {entry.kind === "folder" && (
              <div
                aria-hidden="true"
                className="absolute left-4 top-0 h-1 w-10 rounded-b-full bg-primary/50 transition-all duration-200 group-hover:w-14 group-hover:bg-primary"
                style={folderColorStyles(entry.color)?.accent}
              />
            )}
            <EntryIcon entry={entry} size={entry.icon ? 22 : 23} box="h-12 w-12 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <h2 className="truncate text-sm font-semibold transition-colors group-hover:text-primary">
                {entry.name}
              </h2>
              <p className="text-xs text-base-content/50">
                {KIND_META[entry.kind].label}
                <span suppressHydrationWarning> · {formatDate(entry.updatedAt)}</span>
              </p>
              <TagsInline tags={entry.tags} max={2} />
            </div>
            <ChevronRight
              size={17}
              className="shrink-0 text-base-content/30 transition-all group-hover:translate-x-0.5 group-hover:text-primary"
            />
          </Link>
          {entry.kind === "folder" && (
            // Fora do <Link> para não aninhar elementos interativos.
            <div className="absolute right-2 top-2 z-10 opacity-100 transition-opacity focus-within:opacity-100 sm:opacity-0 sm:group-hover/item:opacity-100">
              <SubfolderMenu
                entry={entry}
                onAppearance={onAppearance}
                triggerClassName="btn btn-ghost btn-xs btn-square bg-base-100/70 backdrop-blur"
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function ListView({
  items,
  sortKey,
  sortDir,
  onSort,
  onAppearance,
}: {
  items: ExplorerEntry[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  onAppearance: (id: string, next: FolderAppearance) => void;
}) {
  const arrow = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    // Sem overflow-hidden: o menu de personalizar abre para fora da tabela.
    <div className="rounded-xl border border-base-300 bg-base-100 [&_thead_th:first-child]:rounded-tl-xl [&_thead_th:last-child]:rounded-tr-xl">
      <table className="table table-sm md:table-md">
        <thead>
          <tr className="border-base-300 bg-base-200/40 text-xs uppercase tracking-wide text-base-content/55">
            <th>
              <button type="button" className="font-semibold uppercase" onClick={() => onSort("name")}>
                Nome{arrow("name")}
              </button>
            </th>
            <th className="hidden md:table-cell">Tipo</th>
            <th className="hidden lg:table-cell">Tags</th>
            <th className="hidden sm:table-cell">
              <button type="button" className="font-semibold uppercase" onClick={() => onSort("updated")}>
                Modificado{arrow("updated")}
              </button>
            </th>
            <th className="w-16" aria-hidden="true" />
          </tr>
        </thead>
        <tbody>
          {items.map((entry) => (
            <tr
              key={`${entry.kind}-${entry.id}`}
              className="group border-base-300/60 hover:bg-base-200/40"
              style={
                entry.kind === "folder" && entry.color
                  ? { backgroundColor: folderColorStyles(entry.color)?.card.backgroundColor }
                  : undefined
              }
            >
              <td className="max-w-0 w-full md:w-auto md:max-w-none">
                <Link
                  href={entry.href}
                  className="flex min-w-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <EntryIcon entry={entry} size={entry.icon ? 16 : 17} box="h-8 w-8 rounded-lg" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium transition-colors group-hover:text-primary">
                      {entry.name}
                    </span>
                    <span className="block text-[11px] text-base-content/45 md:hidden">
                      {KIND_META[entry.kind].label}
                    </span>
                  </span>
                </Link>
              </td>
              <td className="hidden text-xs text-base-content/60 md:table-cell">
                {KIND_META[entry.kind].label}
              </td>
              <td className="hidden lg:table-cell">
                <TagsInline tags={entry.tags} max={3} />
              </td>
              <td
                className="hidden whitespace-nowrap text-xs text-base-content/60 sm:table-cell"
                suppressHydrationWarning
              >
                {formatDate(entry.updatedAt)}
              </td>
              <td className="whitespace-nowrap text-right">
                {entry.kind === "folder" && (
                  <SubfolderMenu
                    entry={entry}
                    onAppearance={onAppearance}
                    triggerClassName="btn btn-ghost btn-xs btn-square"
                  />
                )}
                <ChevronRight
                  size={16}
                  className="ml-1 inline text-base-content/30 transition-colors group-hover:text-primary"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyFolder({
  folderId,
  onSubfolder,
  onDocument,
}: {
  folderId: string;
  onSubfolder: () => void;
  onDocument: () => void;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 bg-base-100 px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-base-300 bg-base-200/60 text-base-content/45">
        <Folder size={27} strokeWidth={1.5} />
      </div>
      <h2 className="text-base font-semibold">Nenhum conteúdo por aqui</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-base-content/55">
        Esta pasta ainda não possui subpastas, documentos, testes ou diagramas.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button type="button" className="btn btn-primary btn-sm gap-2" onClick={onDocument}>
          <FileText size={15} />
          Novo documento
        </button>
        <button type="button" className="btn btn-outline btn-sm gap-2 border-base-300" onClick={onSubfolder}>
          <FolderPlus size={15} />
          Nova subpasta
        </button>
        <Link
          href={`/dashboard/labtest/new?folderId=${folderId}`}
          className="btn btn-outline btn-sm gap-2 border-base-300"
        >
          <FlaskConical size={15} />
          Novo teste
        </Link>
        <Link
          href={`/dashboard/thinklab?folderId=${folderId}`}
          className="btn btn-outline btn-sm gap-2 border-base-300"
        >
          <Network size={15} />
          Novo diagrama
        </Link>
      </div>
    </div>
  );
}
