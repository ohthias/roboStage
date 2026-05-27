// components/FolderTreeNode.tsx

"use client";

import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FolderTreeNode } from "@/hooks/useFolderTree";

type Props = {
  node: FolderTreeNode;
  currentFolderId?: number;
  level?: number;
};

export default function FolderTreeNodeComponent({
  node,
  currentFolderId,
  level = 0,
}: Props) {
  const router = useRouter();

  const hasChildren = node.children.length > 0;

  const [open, setOpen] = useState(currentFolderId === node.id || level < 1);

  const isActive = currentFolderId === node.id;

  return (
    <div>
      <div
        className={`
          group flex items-center gap-2 rounded-xl px-2 py-2 text-sm transition-all
          hover:bg-base-200
          ${isActive ? "bg-primary/10 text-primary" : ""}
        `}
        style={{
          paddingLeft: `${level * 12 + 4}px`,
        }}
      >
        {hasChildren ? (
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-5 w-5 items-center justify-center rounded-md hover:bg-base-300"
          >
            <ChevronRight
              size={14}
              className={`transition-transform ${open ? "rotate-90" : ""}`}
            />
          </button>
        ) : (
          <div className="w-5" />
        )}

        <button
          onClick={() => router.push(`/dashboard/folders/${node.id}`)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white"
            style={{
              background: node.color || "var(--fallback-p,oklch(var(--p)))",
            }}
          >
            {open ? <FolderOpen size={14} /> : <Folder size={14} />}
          </div>

          <span className="truncate font-medium">{node.name}</span>
        </button>
      </div>

      {hasChildren && open && (
        <div className="mt-1 space-y-1">
          {node.children.map((child) => (
            <FolderTreeNodeComponent
              key={child.id}
              node={child}
              currentFolderId={currentFolderId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
