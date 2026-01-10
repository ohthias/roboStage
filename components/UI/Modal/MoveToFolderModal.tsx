"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

type Folder = {
  id: number;
  name: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  documentId: string;
  onMoved?: () => void;
}

export default function MoveToFolderModal({
  open,
  onClose,
  documentId,
  onMoved,
}: Props) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchFolders() {
    const { data } = await supabase
      .from("folders")
      .select("id, name")
      .order("name");

    setFolders(data ?? []);
  }

  async function moveToFolder(folderId: number | null) {
    setLoading(true);

    const { error } = await supabase
      .from("documents")
      .update({ folder_id: folderId })
      .eq("id", documentId);

    setLoading(false);

    if (!error) {
      onMoved?.();
      onClose();
    }
  }

  useEffect(() => {
    if (open) fetchFolders();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-base-100 rounded-xl p-5 w-full max-w-sm space-y-4">
        <h3 className="font-semibold text-lg">Mover para pasta</h3>

        <div className="space-y-2 max-h-64 overflow-auto">
          <button
            onClick={() => moveToFolder(null)}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-base-200 text-sm"
          >
            Sem pasta
          </button>

          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => moveToFolder(folder.id)}
              disabled={loading}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-base-200 text-sm"
            >
              📁 {folder.name}
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}