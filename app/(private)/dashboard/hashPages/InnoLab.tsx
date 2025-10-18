"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import CreateDiagramModal from "@/components/ui/Modal/CreateDiagramModal";
import { BookOpenIcon } from "@heroicons/react/24/outline";

interface Document {
  id: string;
  title: string;
  diagram_type: string;
  created_at: string;
}

export default function InnoLab() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega documentos do Supabase
  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("id, title, diagram_type, created_at")
      .order("created_at", { ascending: false });

    if (!error && data) setDocuments(data as Document[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Cria novo diagrama
  const handleCreateDiagram = async (data: { title: string; type: string }) => {
    if (!data.title || !data.type) return;
    try {
      const user = (await supabase.auth.getUser()).data.user;
      const { data: inserted, error } = await supabase
        .from("documents")
        .insert([
          {
            title: data.title,
            diagram_type: data.type,
            content: {},
            user_id: user?.id || null,
          },
        ])
        .select();

      if (error) throw error;

      await fetchDocuments(); // Atualiza lista
      console.log("Novo diagrama criado:", inserted);
    } catch (error) {
      console.error("Erro ao criar diagrama:", error);
    }
  };

  // Filtros e busca
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter ? doc.diagram_type === filter : true;
    return matchesSearch && matchesFilter;
  });

  // Cores/ícones por tipo de diagrama
  const typeStyles: Record<string, string> = {
    "5W2H": "bg-primary/10 text-primary",
    Ishikawa: "bg-secondary/10 text-secondary",
    "Mapa Mental": "bg-accent/10 text-accent",
  };

  return (
    <>
      {/* 🔹 Cabeçalho */}
      <section className="bg-base-100 p-4 rounded-lg flex justify-between items-start shadow-md border border-base-300 mb-6">
        <div className="flex items-center gap-4">
          <BookOpenIcon className="size-16 text-secondary/75" />
          <div>
            <h2 className="text-base-content font-bold mb-2 text-3xl">
              Inno<span className="text-secondary">Lab</span>
            </h2>
            <p className="text-sm text-base-content">
              Dê vida às suas ideias: crie diagramas diversos para impulsionar seu projeto!
            </p>
          </div>
        </div>
        <CreateDiagramModal onCreate={handleCreateDiagram} />
      </section>

      {/* 🔹 Barra de busca e filtros */}
      <section className="flex flex-col md:flex-row justify-between gap-4 mb-6 align-center">
        <div className="flex items-center w-full gap-2">
          <input
            type="text"
            placeholder="Buscar diagramas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full flex-1 p-2"
          />
        </div>

        <div className="flex flex-wrap gap-2 flex-shrink-0 items-center">
          {["5W2H", "Ishikawa", "Mapa Mental"].map((t) => (
            <button
              key={t}
              className={`btn btn-sm ${
                filter === t ? "btn-secondary" : "btn-outline"
              }`}
              onClick={() => setFilter(filter === t ? null : t)}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* 🔹 Cards de diagramas */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-10">
            <span className="loading loading-spinner text-primary"></span>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="col-span-full text-center py-10 text-base-content/70">
            Nenhum diagrama encontrado.
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => router.push(`/dashboard/innolab/${doc.id}/${doc.diagram_type}`)}
              className="card bg-base-100 border border-base-300 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="card-body">
                <h3 className="card-title">{doc.title}</h3>
                <div className={`badge ${typeStyles[doc.diagram_type]}`}>
                  {doc.diagram_type}
                </div>
                <p className="text-xs text-base-content/60 mt-2">
                  Criado em {new Date(doc.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          ))
        )}
      </section>
    </>
  );
}