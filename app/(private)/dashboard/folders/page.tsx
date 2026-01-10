"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Folder, FolderPlus } from "lucide-react";
import { useRouter } from "next/navigation";

type Folder = {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  team_id: number | null;
  created_at: string;
};

export default function FoldersPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const router = useRouter();

  async function fetchFolders() {
    setLoading(true);

    const { data, error } = await supabase
      .from("folders")
      .select("id, name, description, parent_id, team_id, created_at")
      .order("created_at", { ascending: false })
      .is("parent_id", null);

    if (!error) {
      setFolders(data ?? []);
    }

    setLoading(false);
  }

  async function createFolder() {
    if (!newFolderName.trim()) return;

    const { error } = await supabase.from("folders").insert({
      name: newFolderName,
      parent_id: null,
      team_id: null,
    });

    if (!error) {
      setNewFolderName("");
      fetchFolders();
    }
  }

  useEffect(() => {
    fetchFolders();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pastas</h1>
          <p className="text-sm text-base-content/60">
            Organize seus documentos e testes em pastas
          </p>
        </div>
      </header>

      {/* Criar pasta */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-4">
        <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <FolderPlus size={16} />
          Nova pasta
        </h2>

        <div className="flex gap-2">
          <input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Nome da pasta"
            className="input input-sm input-bordered flex-1"
          />
          <button onClick={createFolder} className="btn btn-sm btn-primary">
            Criar
          </button>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-sm text-base-content/60">Carregando pastas...</p>
      ) : folders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-base-300 p-8 text-center text-sm text-base-content/60">
          Nenhuma pasta criada ainda.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <li
              key={folder.id}
              onClick={() => router.push(`/dashboard/folders/${folder.id}`)}
              className="group cursor-pointer rounded-xl border border-base-300 bg-base-100 p-4 transition hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Folder size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate group-hover:underline">
                    {folder.name}
                  </h3>

                  <p className="text-sm text-base-content/60">{folder.description || "Sem descrição"}</p>

                  <p className="mt-1 text-xs text-base-content/60">
                    Criada em{" "}
                    {new Date(folder.created_at).toLocaleDateString("pt-BR")}
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
