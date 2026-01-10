"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import {
  Folder,
  FileText,
  FlaskConical,
  ArrowLeft,
  Pencil,
  Plus,
} from "lucide-react";

type FolderItem = {
  item_id: string;
  folder_id: number;
  type: "folder" | "document" | "test";
  title: string;
  created_at: string;
  updated_at: string;
};

export default function FolderPage() {
  const { id } = useParams();
  const router = useRouter();
  const folderId = Number(id);

  const [items, setItems] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");

  const [editingFolder, setEditingFolder] = useState(false);
  const [editName, setEditName] = useState(false);
  const [editDescription, setEditDescription] = useState(false);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [creatingSubfolder, setCreatingSubfolder] = useState(false);
  const [subfolderName, setSubfolderName] = useState("");

  /* ================= FETCH ================= */

  async function fetchFolder() {
    const { data } = await supabase
      .from("folders")
      .select("name, description")
      .eq("id", folderId)
      .single();

    if (data) {
      setFolderName(data.name);
      setNewName(data.name);
      setFolderDescription(data.description ?? "");
      setNewDescription(data.description ?? "");
    }
  }

  async function fetchItems() {
    setLoading(true);

    const { data } = await supabase
      .from("folder_items")
      .select("*")
      .eq("folder_id", folderId)
      .order("type")
      .order("title");

    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchFolder();
    fetchItems();
  }, [folderId]);

  /* ================= ACTIONS ================= */

  async function updateFolder(payload: {
    name?: string;
    description?: string;
  }) {
    await supabase.from("folders").update(payload).eq("id", folderId);
    fetchFolder();
  }

  async function createSubfolder() {
    if (!subfolderName.trim()) return;

    await supabase.from("folders").insert({
      name: subfolderName.trim(),
      parent_id: folderId,
    });

    setSubfolderName("");
    setCreatingSubfolder(false);
    fetchItems();
  }

  function handleOpen(item: FolderItem) {
    if (item.type === "folder") {
      router.push(`/dashboard/folders/${item.item_id}`);
    }
    if (item.type === "document") {
      router.push(`/innolab/${item.item_id}`);
    }
    if (item.type === "test") {
      router.push(`/dashboard/labtest/${item.item_id}`);
    }
  }

  function iconByType(type: FolderItem["type"]) {
    if (type === "folder") return <Folder className="text-primary" />;
    if (type === "document") return <FileText className="text-secondary" />;
    return <FlaskConical className="text-accent" />;
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-start gap-4">
        <button onClick={() => router.back()} className="btn btn-sm btn-ghost">
          <ArrowLeft size={16} />
        </button>

        <div className="flex-1 space-y-2">
          {editingFolder ? (
            <div className="space-y-2 max-w-xl">
              <input
                className="input input-sm input-bordered w-full"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome da pasta"
                autoFocus
              />

              <textarea
                className="textarea textarea-bordered textarea-sm w-full"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Descrição da pasta (opcional)"
                rows={3}
              />

              <div className="flex gap-2">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={async () => {
                    await updateFolder({
                      name: newName.trim(),
                      description: newDescription.trim(),
                    });
                    setEditingFolder(false);
                  }}
                >
                  Salvar
                </button>

                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    setNewName(folderName);
                    setNewDescription(folderDescription);
                    setEditingFolder(false);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{folderName}</h1>
                <button
                  onClick={() => setEditingFolder(true)}
                  className="btn btn-xs btn-outline"
                >
                  <Pencil size={14} />
                </button>
              </div>

              <p className="text-sm text-base-content/60">
                {folderDescription || "Sem descrição"}
              </p>
            </>
          )}
        </div>

        {!editingFolder && (
          <button
            onClick={() => setCreatingSubfolder(true)}
            className="btn btn-sm btn-primary"
          >
            <Plus size={16} />
            Subpasta
          </button>
        )}
      </header>

      {creatingSubfolder && (
        <div className="max-w-md rounded-xl border border-base-300 bg-base-100 p-4 space-y-3">
          <h3 className="font-semibold text-sm">Nova subpasta</h3>

          <input
            className="input input-sm input-bordered w-full"
            placeholder="Nome da subpasta"
            value={subfolderName}
            autoFocus
            onChange={(e) => setSubfolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") createSubfolder();
              if (e.key === "Escape") setCreatingSubfolder(false);
            }}
          />

          <div className="flex justify-end gap-2">
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setCreatingSubfolder(false)}
            >
              Cancelar
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={createSubfolder}
            >
              Criar
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo */}
      {loading ? (
        <p className="text-sm text-base-content/60">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-base-content/60">Esta pasta está vazia.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <li
              key={`${item.type}-${item.item_id}`}
              onClick={() => handleOpen(item)}
              className="group cursor-pointer rounded-xl border border-base-300 bg-base-100 p-4 hover:shadow transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-base-200">
                  {iconByType(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{item.title}</h3>
                  <p className="text-xs text-base-content/60">
                    Atualizado em{" "}
                    {new Date(item.updated_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
