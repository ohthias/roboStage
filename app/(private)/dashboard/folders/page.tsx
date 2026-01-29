"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Folder } from "lucide-react";
import { useRouter } from "next/navigation";
import NewFolderButton from "./ModalCreateFolder";

type FolderType = {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  team_id: number | null;
  created_at: string;
};

export default function FoldersPage() {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  async function fetchFolders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("folders")
      .select("id, name, description, parent_id, team_id, created_at")
      .order("created_at", { ascending: false })
      .is("parent_id", null);

    if (!error) setFolders(data ?? []);
    setLoading(false);
  }

  async function createFolder(name: string) {
    if (!name.trim()) return;

    const { error } = await supabase.from("folders").insert({
      name,
      parent_id: null,
      team_id: null,
    });

    if (!error) fetchFolders();
  }

  useEffect(() => {
    fetchFolders();
  }, []);

  // Filtragem
  const filteredFolders = folders.filter(
    (folder) =>
      folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (folder.description &&
        folder.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-base-100 to-base-200 text-base-content rounded-3xl">
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Suas pastas
          </h1>
          <p className="mt-3 max-w-2xl text-base md:text-lg opacity-90">
            Organize seus testes e documentos em pastas para facilitar o acesso
            e a gestão.
          </p>
        </div>
      </header>

      {/* Criar pasta */}
      <div className="flex flex-row sm:items-center sm:justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar pastas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-md input-bordered flex-1"
        />
        <NewFolderButton createFolder={createFolder} />
      </div>

      {/* Lista de pastas */}
      {loading ? (
        <p className="text-sm text-base-content/60">Carregando pastas...</p>
      ) : filteredFolders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-base-300 p-8 text-center text-sm text-base-content/60">
          Nenhuma pasta encontrada.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFolders.map((folder) => (
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
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold truncate group-hover:underline">
                      {folder.name}
                    </h3>
                    {folder.team_id && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                        Equipe {folder.team_id}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-base-content/60">
                    {folder.description || "Sem descrição"}
                  </p>

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
