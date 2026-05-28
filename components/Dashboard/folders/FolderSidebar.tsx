// components/FolderSidebar.tsx

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

function TreeNode({
  node,
  currentFolderId,
  level = 0,
  expanded,
  toggleExpand,
}: NodeProps) {
  const router = useRouter();

  const hasChildren = node.children.length > 0;

  const isOpen =
    expanded[node.id] ||
    currentFolderId === node.id ||
    node.children.some((c) => c.id === currentFolderId);

  const isActive = currentFolderId === node.id;

  return (
    <div className="space-y-1">
      <div
        className={`
          group flex items-center gap-1 rounded-2xl px-2 py-1.5 transition-all
          hover:bg-base-200
          ${isActive ? "bg-primary/10 text-primary" : ""}
        `}
        style={{
          paddingLeft: `${level * 14 + 8}px`,
        }}
      >
        {hasChildren ? (
          <button
            onClick={() => toggleExpand(node.id)}
            className="btn btn-ghost btn-xs btn-square"
          >
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <div className="w-7" />
        )}

        <button
          onClick={() => router.push(`/dashboard/folders/${node.id}`)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-1 text-left"
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
            style={{
              background: node.color || "var(--fallback-p,oklch(var(--p)))",
            }}
          >
            {isOpen ? <FolderOpen size={15} /> : <Folder size={15} />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{node.name}</div>

            <div className="flex items-center gap-1 text-[10px] text-base-content/45">
              <span>{node.file_count} arquivos</span>

              {node.subfolder_count > 0 && (
                <>
                  <span>•</span>
                  <span>{node.subfolder_count} pastas</span>
                </>
              )}
            </div>
          </div>
        </button>
      </div>

      {hasChildren && isOpen && (
        <div className="space-y-1">
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

export default function FolderSidebar({ currentFolderId }: SidebarProps) {
  const { tree, loading } = useFolderTree();

  const [mobileOpen, setMobileOpen] = useState(false);

  // desktop collapsed state
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
      const next = {
        ...prev,
        [id]: !prev[id],
      };

      localStorage.setItem("folder-tree-expanded", JSON.stringify(next));

      return next;
    });
  }

  const treeContent = useMemo(() => {
    if (loading) {
      return (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="skeleton h-12 rounded-2xl" />
          ))}
        </div>
      );
    }

    if (tree.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-base-300 p-8 text-center">
          <FolderOpen size={36} className="mb-3 opacity-30" />

          <h3 className="font-black">Nenhuma pasta</h3>

          <p className="mt-1 text-sm text-base-content/50">
            Sua estrutura aparecerá aqui.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
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
  }, [tree, loading, currentFolderId, expanded]);

  return (
    <>
      {/* MOBILE TOPBAR */}
      <div className="xl:hidden">
        <button
          className="btn btn-outline w-full justify-start rounded-2xl"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={16} />
          Hierarquia de pastas
        </button>
      </div>

      {/* MOBILE DRAWER */}
      <div
        className={`
          fixed inset-0 z-50 xl:hidden
          ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}
        `}
      >
        {/* overlay */}
        <div
          onClick={() => setMobileOpen(false)}
          className={`
            absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity
            ${mobileOpen ? "opacity-100" : "opacity-0"}
          `}
        />

        {/* panel */}
        <aside
          className={`
            absolute left-0 top-0 h-full w-[88%] max-w-sm
            border-r border-base-300 bg-base-100 shadow-2xl
            transition-transform duration-300
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="flex items-center justify-between border-b border-base-300 p-5">
            <div>
              <h2 className="text-lg font-black">Hierarquia</h2>

              <p className="text-xs text-base-content/50">
                Navegação estrutural
              </p>
            </div>

            <button
              className="btn btn-ghost btn-circle btn-sm"
              onClick={() => setMobileOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="h-[calc(100vh-81px)] overflow-y-auto p-3">
            {treeContent}
          </div>
        </aside>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside
        className={`sticky hidden h-full overflow-hidden rounded-3xl border border-base-300 bg-base-100 xl:flex flex-col transition-[width] duration-200 items-stretch`
        }
        style={{ width: collapsed ? 64 : undefined }}
      >
        <div className="flex items-center justify-between border-b border-base-300 p-3">
          {!collapsed ? (
            <div>
              <h2 className="text-lg font-black">Hierarquia</h2>

              <p className="text-xs text-base-content/50">Navegação estrutural</p>
            </div>
          ) : (
            <div className="pl-1" />
          )}

          <button
            className="btn btn-ghost btn-square btn-sm"
            onClick={() => setCollapsed((s) => !s)}
            title={collapsed ? "Expandir" : "Recolher"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {collapsed ? (
          <div className="flex flex-col items-center gap-2 py-3">
            {tree.map((node) => (
              <button
                key={node.id}
                onClick={() => window.location.assign(`/dashboard/folders/${node.id}`)}
                className="tooltip tooltip-right btn btn-ghost btn-square"
                data-tip={node.name}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-white"
                  style={{ background: node.color || "var(--fallback-p,oklch(var(--p)))" }}
                >
                  <Folder size={14} />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="h-[calc(100%-81px)] overflow-y-auto p-3">{treeContent}</div>
        )}
      </aside>
    </>
  );
}
