"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/app/context/ToastContext";
import { Folder as FolderIcon, Check, X } from "lucide-react";
import { Folder } from "@/types/Folders";

type ResourceType = "documents" | "tests";

interface Props {
  open: boolean;
  onClose: () => void;
  resourceId: string;
  resourceType: ResourceType;
  onMoved?: () => void;
}

export default function MoveToFolderModal({
  open,
  onClose,
  resourceId,
  resourceType,
  onMoved,
}: Props) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  async function fetchFolders() {
    const { data } = await supabase
      .from("folders")
      .select("id, name, parent_id, team_id, owner_id, created_at, updated_at")
      .order("name");

    setFolders(data ?? []);
  }

  async function fetchCurrentFolder() {
    if (!resourceType || !resourceId) return;

    const { data, error } = await supabase
      .from(resourceType)
      .select("folder_id")
      .eq("id", resourceId)
      .single();

    if (error) {
      console.error("Erro ao buscar pasta atual:", error);
      return;
    }

    setCurrentFolderId(data?.folder_id ?? null);
  }

  function buildTree(
    parentId: number | null = null,
    level: number = 0
  ): (Folder & { level: number })[] {
    return folders
      .filter((folder) => folder.parent_id === parentId)
      .flatMap((folder) => [
        { ...folder, level },
        ...buildTree(folder.id, level + 1),
      ]);
  }

  async function moveToFolder(folderId: number | null) {
    if (!resourceType || !resourceId) return;
    if (folderId === currentFolderId) return;

    setLoading(true);

    const { error } = await supabase
      .from(resourceType)
      .update({ folder_id: folderId })
      .eq("id", resourceId);

    setLoading(false);

    if (!error) {
      addToast("Movido para a pasta com sucesso!", "success");
      onMoved?.();
      onClose();
    }
  }

  useEffect(() => {
    if (!open || !resourceType || !resourceId) return;

    fetchFolders();
    fetchCurrentFolder();
  }, [open, resourceType, resourceId]);

  if (!open) return null;

  const tree = buildTree();

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center h-screen px-4"
      onClick={onClose}
    >
      <div
        className="bg-base-100 rounded-xl p-5 w-full max-w-sm space-y-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Mover para pasta</h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-1 max-h-72 overflow-auto">
          {/* Sem pasta */}
          <button
            onClick={() => moveToFolder(null)}
            disabled={loading || currentFolderId === null}
            className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition cursor-pointer
              ${
                currentFolderId === null
                  ? "bg-base-200 text-base-content/60 cursor-default"
                  : "hover:bg-primary/10"
              }`}
          >
            <FolderIcon size={16} />
            Sem pasta
            {currentFolderId === null && (
              <span className="badge badge-sm badge-primary ml-auto">
                Atual
              </span>
            )}
          </button>

          {tree.map((folder: Folder & { level: number }) => {
            const isCurrent = folder.id === currentFolderId;

            return (
              <button
                key={folder.id}
                onClick={() => moveToFolder(folder.id)}
                disabled={loading || isCurrent}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition cursor-pointer
                  ${
                    isCurrent
                      ? "bg-base-200 text-base-content/60 cursor-default cursor-default"
                      : "hover:bg-primary/10"
                  }`}
                style={{ paddingLeft: `${8 + folder.level * 12}px` }}
              >
                {folder.level > 0 && (
                  <hr className="w-2 transition-transform rotate-90 h-full" />
                )}
                <FolderIcon size={16} />
                {folder.name}

                {isCurrent && (
                  <span className="badge badge-sm badge-primary ml-auto flex items-center gap-1">
                    <Check size={12} /> Atual
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="btn btn-sm btn-soft">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
