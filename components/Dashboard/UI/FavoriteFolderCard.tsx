"use client";

import { Folder, Star } from "lucide-react";
import { useRouter } from "next/navigation";

import type { FolderRow } from "@/server/repositories/folders.repository";

type Props = {
  folder: FolderRow;
};

export default function FavoriteFolderCard({ folder }: Props) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/dashboard/folders/${folder.id}`)}
      className="
        group flex w-full items-center gap-3 rounded-2xl
        border border-base-200 bg-base-100 p-3 text-left
        transition-all hover:border-primary/20
        hover:bg-base-200/50
      "
    >
      <div
        className="
          flex h-11 w-11 shrink-0 items-center
          justify-center rounded-2xl text-white shadow-sm
        "
        style={{
          background: folder.color || "var(--fallback-p,oklch(var(--p)))",
        }}
      >
        <Folder size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <h3 className="truncate font-bold">{folder.name}</h3>

          <Star size={12} className="fill-warning text-warning" />
        </div>

        <p className="truncate text-xs text-base-content/50">
          {folder.description || "Sem descrição"}
        </p>

        <div className="mt-1 flex items-center gap-2 text-[10px] text-base-content/40">
          <span>{folder.file_count} arquivos</span>

          <span>•</span>

          <span>{folder.subfolder_count} pastas</span>
        </div>
      </div>
    </button>
  );
}
