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

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-base-100 shadow-md">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-sm"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex flex-col sm:gap-2">
            <h1 className="text-3xl font-bold truncate">{folderName}</h1>
            {folderDescription && (
              <p className="text-sm text-base-content/70 mt-1 sm:mt-0">
                {folderDescription}
              </p>
            )}
          </div>
          <button
            onClick={() => setEditingFolder(true)}
            className="btn btn-outline hover:bg-base-200 transition ml-auto"
          >
            <Pencil size={14} />
          </button>
        </div>

        {!editingFolder && (
          <button
            onClick={() => setCreatingSubfolder(true)}
            className="btn btn-primary flex items-center gap-2 shadow hover:shadow-lg transition"
          >
            <Plus size={16} />
            Nova Subpasta
          </button>
        )}
      </header>

      {editingFolder && (
        <div className="p-4 rounded-xl bg-base-100 shadow-md space-y-4 transition">
          <h2 className="text-lg font-semibold">Editar pasta</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              {editName ? (
                <input
                  className="input input-bordered w-full"
                  value={newName}
                  autoFocus
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateFolder({ name: newName });
                      setEditName(false);
                    }
                    if (e.key === "Escape") {
                      setEditName(false);
                      setNewName(folderName);
                    }
                  }}
                />
              ) : (
                <div
                  className="p-2 border border-base-300 rounded-lg cursor-pointer hover:bg-base-200 transition"
                  onClick={() => setEditName(true)}
                >
                  {folderName || "Sem nome"}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Descrição
              </label>
              {editDescription ? (
                <input
                  className="input input-bordered w-full"
                  value={newDescription}
                  autoFocus
                  onChange={(e) => setNewDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateFolder({ description: newDescription });
                      setEditDescription(false);
                    }
                    if (e.key === "Escape") {
                      setEditDescription(false);
                      setNewDescription(folderDescription);
                    }
                  }}
                />
              ) : (
                <div
                  className="p-2 border border-base-300 rounded-lg cursor-pointer hover:bg-base-200 transition"
                  onClick={() => setEditDescription(true)}
                >
                  {folderDescription || "Sem descrição"}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              className="btn btn-ghost"
              onClick={() => {
                setEditingFolder(false);
                setNewName(folderName);
                setNewDescription(folderDescription);
              }}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                updateFolder({
                  name: newName,
                  description: newDescription,
                });
                setEditingFolder(false);
              }}
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* Modal de criar subpasta */}
      {creatingSubfolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 bg-backdrop-blur-sm h-screen">
          <div className="bg-base-100 rounded-xl shadow-lg max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Folder size={18} />
              Criar subpasta
            </h2>

            <input
              className="input input-bordered w-full"
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
                className="btn btn-ghost"
                onClick={() => setCreatingSubfolder(false)}
              >
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={createSubfolder}>
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo */}
      {loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse h-28 rounded-xl bg-base-200"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 p-6 border border-dashed border-base-300 rounded-xl bg-base-100 text-base-content/60">
          <Folder size={32} />
          <p>Esta pasta está vazia</p>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <li
              key={`${item.type}-${item.item_id}`}
              onClick={() => handleOpen(item)}
              className="group cursor-pointer rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm transition hover:shadow-lg hover:scale-105 duration-200 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-base-200 flex-shrink-0">
                  {iconByType(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{item.title}</h3>
                  <p className="text-xs text-base-content/60 mt-1">
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
