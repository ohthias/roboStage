"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderOpen,
  Menu,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useFolderTree } from "@/hooks/useFolderTree";
import type { FolderTreeNode } from "@/hooks/useFolderTree";

// ─── types ───────────────────────────────────────────────────────────────────

type SidebarProps = {
  currentFolderId?: number;
};

type NodeProps = {
  node: FolderTreeNode;
  currentFolderId?: number;
  level?: number;
  expanded: Record<number, boolean>;
  toggleExpand: (id: number) => void;
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── TreeNode ────────────────────────────────────────────────────────────────

function TreeNode({
  node,
  currentFolderId,
  level = 0,
  expanded,
  toggleExpand,
}: NodeProps) {
  const router = useRouter();

  const hasChildren = node.children.length > 0;
  const isActive = currentFolderId === node.id;
  const isOpen =
    expanded[node.id] ||
    currentFolderId === node.id ||
    node.children.some((c) => c.id === currentFolderId);

  const color = node.color || "#6366f1";
  const iconBg = hexToRgba(color, isActive ? 0.18 : 0.1);

  return (
    <div>
      <div
        className={`
          group flex items-center gap-1.5 rounded-xl px-2 py-1.5 transition-colors
          ${isActive ? "bg-base-200" : "hover:bg-base-200/60"}
        `}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {/* expand toggle */}
        {hasChildren ? (
          <button
            onClick={() => toggleExpand(node.id)}
            className="btn btn-ghost btn-xs btn-square shrink-0 rounded-lg"
            aria-label={isOpen ? "Recolher" : "Expandir"}
          >
            {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
        ) : (
          <div className="w-6 shrink-0" />
        )}

        {/* navigate */}
        <button
          onClick={() => router.push(`/dashboard/folders/${node.id}`)}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          {/* icon */}
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
            style={{ backgroundColor: iconBg, color }}
          >
            {isOpen ? <FolderOpen size={14} /> : <Folder size={14} />}
          </div>

          {/* text */}
          <div className="min-w-0 flex-1">
            <p
              className={`truncate text-[13px] leading-tight ${
                isActive
                  ? "font-medium text-base-content"
                  : "text-base-content/75"
              }`}
            >
              {node.name}
            </p>
            <p className="text-[11px] text-base-content/40">
              {node.file_count} arq.
              {node.subfolder_count > 0 && ` · ${node.subfolder_count} pastas`}
            </p>
          </div>
        </button>
      </div>

      {/* children */}
      {hasChildren && isOpen && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              currentFolderId={currentFolderId}
              level={level + 1}
              expanded={expanded}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── tree content ─────────────────────────────────────────────────────────────

function TreeContent({
  tree,
  loading,
  currentFolderId,
  expanded,
  toggleExpand,
}: {
  tree: FolderTreeNode[];
  loading: boolean;
  currentFolderId?: number;
  expanded: Record<number, boolean>;
  toggleExpand: (id: number) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-2 p-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-10 rounded-xl" />
        ))}
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-base-300 m-3 p-8 text-center">
        <FolderOpen size={32} className="mb-3 opacity-25" />
        <p className="text-sm font-medium text-base-content">Nenhuma pasta</p>
        <p className="mt-1 text-xs text-base-content/50">
          Sua estrutura aparecerá aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 p-2">
      {tree.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          currentFolderId={currentFolderId}
          expanded={expanded}
          toggleExpand={toggleExpand}
        />
      ))}
    </div>
  );
}

// ─── sidebar ─────────────────────────────────────────────────────────────────

export default function FolderSidebar({ currentFolderId }: SidebarProps) {
  const { tree, loading } = useFolderTree();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const stored = localStorage.getItem("folder-tree-expanded");
    if (stored) {
      try {
        setExpanded(JSON.parse(stored));
      } catch {}
    }
  }, []);

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem("folder-tree-expanded", JSON.stringify(next));
      return next;
    });
  }

  const treeContent = useMemo(
    () => (
      <TreeContent
        tree={tree}
        loading={loading}
        currentFolderId={currentFolderId}
        expanded={expanded}
        toggleExpand={toggleExpand}
      />
    ),
    [tree, loading, currentFolderId, expanded],
  );

  return (
    <>
      {/* ── Mobile trigger ─────────────────────────────────────────── */}
      <div className="xl:hidden">
        <button
          className="btn btn-outline btn-sm w-full justify-start gap-2 rounded-xl"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={15} />
          Hierarquia de pastas
        </button>
      </div>

      {/* ── Mobile drawer ──────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-50 xl:hidden ${
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* overlay */}
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* panel */}
        <aside
          className={`absolute left-0 top-0 h-full w-[80%] max-w-xs border-r border-base-300 bg-base-100 shadow-2xl transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-base-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-base-content">
                Hierarquia
              </p>
              <p className="text-xs text-base-content/45">
                Navegação estrutural
              </p>
            </div>
            <button
              className="btn btn-ghost btn-sm btn-square rounded-xl"
              onClick={() => setMobileOpen(false)}
              aria-label="Fechar"
            >
              <X size={15} />
            </button>
          </div>
          <div className="h-[calc(100vh-57px)] overflow-y-auto">
            {treeContent}
          </div>
        </aside>
      </div>

      {/* ── Desktop sidebar ────────────────────────────────────────── */}
      <aside
        className={`sticky top-0 hidden h-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 transition-[width] duration-200 xl:flex ${
          collapsed ? "w-14" : "w-56"
        }`}
      >
        {/* header */}
        <div className="flex shrink-0 items-center justify-between border-b border-base-200 px-3 py-3">
          {!collapsed && (
            <div>
              <p className="text-[13px] font-medium text-base-content">
                Hierarquia
              </p>
              <p className="text-[11px] text-base-content/45">
                Navegação estrutural
              </p>
            </div>
          )}
          <button
            className="btn btn-ghost btn-sm btn-square rounded-xl"
            onClick={() => setCollapsed((s) => !s)}
            title={collapsed ? "Expandir" : "Recolher"}
            aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* body */}
        {collapsed ? (
          /* icon-only mode */
          <div className="flex flex-col items-center gap-1.5 overflow-y-auto py-2">
            {tree.map((node) => {
              const color = node.color || "#6366f1";
              const isActive = currentFolderId === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() =>
                    window.location.assign(`/dashboard/folders/${node.id}`)
                  }
                  className={`tooltip tooltip-right flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                    isActive ? "bg-base-200" : "hover:bg-base-200/60"
                  }`}
                  data-tip={node.name}
                  aria-label={node.name}
                >
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: hexToRgba(color, 0.12),
                      color,
                    }}
                  >
                    <Folder size={14} />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">{treeContent}</div>
        )}
      </aside>
    </>
  );
}