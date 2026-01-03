import React from "react";
import { Document, DocumentMap, Template } from "./types";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Search,
  Tag as TagIcon,
  X,
  LayoutGrid,
  FileText,
} from "lucide-react";
import { TEMPLATES } from "./constants";

interface SidebarProps {
  documents: DocumentMap;
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: (parentId: string | null, template?: Template) => void;
  onDelete: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onOpenSearch: () => void;
  tags: string[];
  filterTag: string | null;
  onFilterTag: (tag: string | null) => void;
}

const DocumentItem: React.FC<{
  doc: Document;
  allDocs: DocumentMap;
  activeId: string | null;
  depth: number;
  onSelect: (id: string) => void;
  onAdd: (parentId: string | null) => void;
  onDelete: (id: string) => void;
  onToggleExpand: (id: string) => void;
  filterTag: string | null;
}> = ({
  doc,
  allDocs,
  activeId,
  depth,
  onSelect,
  onAdd,
  onDelete,
  onToggleExpand,
  filterTag,
}) => {
  const children = (Object.values(allDocs) as Document[]).filter(
    (d) => d.parentId === doc.id
  );
  const isActive = activeId === doc.id;

  const matchesFilter = filterTag ? doc.tags?.includes(filterTag) : true;
  const hasMatchingChild = (d: Document): boolean => {
    if (filterTag && d.tags?.includes(filterTag)) return true;
    return (Object.values(allDocs) as Document[])
      .filter((child) => child.parentId === d.id)
      .some(hasMatchingChild);
  };

  if (filterTag && !hasMatchingChild(doc)) return null;

  return (
    <li>
      <div
        className={`group flex items-center justify-between gap-1 py-2 px-3 transition-all rounded-xl mb-0.5 cursor-pointer border border-transparent w-full ${
          isActive
            ? "active bg-primary text-primary-content font-bold shadow-sm"
            : "hover:bg-base-300/60 hover:text-base-content"
        }`}
        style={{ paddingLeft: `${depth > 0 ? depth * 12 + 12 : 12}px` }}
        onClick={() => onSelect(doc.id)}
      >
        <div className="flex items-center gap-2.5 flex-1">
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(doc.id);
            }}
            className="flex items-center justify-center w-4 h-4 rounded-md hover:bg-base-content/10 transition-colors"
          >
            {children.length > 0 ? (
              doc.isExpanded || filterTag ? (
                <ChevronDown size={14} className="opacity-60" />
              ) : (
                <ChevronRight size={14} className="opacity-60" />
              )
            ) : (
              <div className="w-3.5 h-3.5" />
            )}
          </div>

          <span className="text-lg leading-none shrink-0">
            {doc.icon || "📄"}
          </span>
          <span className="truncate text-[13px] font-medium tracking-tight">
            {doc.title}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(doc.id);
            }}
            className={`btn btn-ghost btn-xs btn-circle ${
              isActive
                ? "text-primary-content hover:bg-primary-focus"
                : "text-base-content/40 hover:text-base-content hover:bg-base-200"
            }`}
            title="Adicionar sub-página"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(doc.id);
            }}
            className={`btn btn-ghost btn-xs btn-circle ${
              isActive
                ? "text-primary-content hover:bg-primary-focus"
                : "text-error/40 hover:text-error hover:bg-error/10"
            }`}
            title="Excluir"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {(doc.isExpanded || filterTag) && children.length > 0 && (
        <ul className="menu menu-sm p-0 m-0 border-l border-base-300/40 ml-2">
          {children.map((child) => (
            <DocumentItem
              key={child.id}
              doc={child}
              allDocs={allDocs}
              activeId={activeId}
              depth={depth + 1}
              onSelect={onSelect}
              onAdd={onAdd}
              onDelete={onDelete}
              onToggleExpand={onToggleExpand}
              filterTag={filterTag}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  documents,
  activeId,
  onSelect,
  onAdd,
  onDelete,
  onToggleExpand,
  onOpenSearch,
  tags,
  filterTag,
  onFilterTag,
}) => {
  const rootDocs = (Object.values(documents) as Document[]).filter(
    (d) => !d.parentId
  );

  return (
    <div className="w-64 h-full bg-base-100 flex flex-col shrink-0 border-r border-base-300 shadow-sm z-50 rounded-lg px-2 py-4">
      {/* Quick Actions */}
      <div className="flex flex-col gap-4 mb-4">
        <button
          onClick={onOpenSearch}
          className="btn btn-xs btn-ghost justify-between border border-base-300 bg-base-200/20 hover:bg-base-200 font-medium rounded-xl h-10"
        >
          <div className="flex items-center gap-2">
            <Search size={16} className="opacity-40" />
            <span className="text-xs opacity-40">Buscar...</span>
          </div>
          <kbd className="kbd kbd-xs bg-base-100 border-base-300 opacity-50">
            ⌘
          </kbd>
        </button>

        <div className="join w-full rounded-xl overflow-hidden gap-2">
          <button
            onClick={() => onAdd(null)}
            className="btn btn-xs btn-primary join-item flex-1 gap-2 h-10 border-none"
          >
            <Plus size={16} /> Nova Página
          </button>

          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="btn btn-xs btn-primary join-item px-3 h-10 border-none border-l border-primary-focus"
            >
              <LayoutGrid size={16} />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-50 menu p-2 shadow-2xl bg-base-100 rounded-2xl w-60 border border-base-300 mt-2"
            >
              <li className="menu-title opacity-40 uppercase text-[9px] font-black tracking-widest p-4">
                RoboStage Templates
              </li>
              <div className="divider my-0 opacity-10"></div>
              {TEMPLATES.map((tpl) => (
                <li key={tpl.id} className="py-0.5 px-1">
                  <button
                    onClick={() => onAdd(null, tpl)}
                    className="hover:bg-primary hover:text-primary-content rounded-xl py-2.5"
                  >
                    <span className="text-lg">{tpl.icon}</span>
                    <span className="font-medium text-[13px]">{tpl.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {tags.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between px-3 mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                Tags
              </span>
              {filterTag && (
                <button
                  onClick={() => onFilterTag(null)}
                  className="btn btn-ghost btn-xs h-auto py-1 px-2 text-error hover:bg-error/10"
                >
                  Limpar
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 px-3">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onFilterTag(tag === filterTag ? null : tag)}
                  className={`px-3 py-1 rounded-full text-[7px] font-bold uppercase tracking-wider transition-all border ${
                    tag === filterTag
                      ? "bg-primary border-primary text-primary-content"
                      : "bg-base-200 border-base-300 opacity-60 hover:opacity-100 hover:border-primary/40"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 px-3 mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
            {filterTag
              ? `Resultados: #${filterTag}`
              : "Biblioteca de Páginas"}
          </span>
          <div className="h-[1px] flex-1 bg-base-300 opacity-20"></div>
        </div>

        <ul className="menu menu-sm w-full p-0">
          {rootDocs.map((doc) => (
            <DocumentItem
              key={doc.id}
              doc={doc}
              allDocs={documents}
              activeId={activeId}
              depth={0}
              onSelect={onSelect}
              onAdd={onAdd}
              onDelete={onDelete}
              onToggleExpand={onToggleExpand}
              filterTag={filterTag}
            />
          ))}
          {rootDocs.length === 0 && (
            <div className="p-8 text-center opacity-30 flex flex-col items-center">
              <FileText size={32} className="mb-4" />
              <p className="text-[11px] font-bold uppercase tracking-widest">
                Workspace Vazio
              </p>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
};
