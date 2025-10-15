"use client";
import { useEffect, useState } from "react";
import Card from "@/components/Card";
import Accordion from "@/components/Accordion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/ui/Footer";
import Loader from "@/components/loader";

interface ToolDetail {
  title: string;
  content: string;
}

interface Tool {
  name: string;
  description: string;
  details: ToolDetail[];
}

export default function HelpDesk() {
  const [search, setSearch] = useState("");
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/data/toolsAbout")
      .then((res) => res.json())
      .then((data) => setTools(data))
      .catch((err) => console.error("Erro ao carregar tools:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredTools = tools.filter((t) =>
    t.name && t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="p-8 max-w-4xl mx-auto min-h-screen">
        <h1 className="text-3xl font-bold text-center mb-2">
          Sobre as ferramentas do Robo<span className="text-red-500">Stage</span>
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Aqui você encontra uma introdução e explicações sobre as principais
          ferramentas disponíveis no RoboStage. Explore os recursos, tire dúvidas
          e aproveite para conhecer melhor cada uma delas.
        </p>

        {/* Loading screen */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : (
          <>
            {/* Barra de busca */}
            <div className="form-control mb-8">
              <input
                type="text"
                placeholder="Buscar ferramenta..."
                className="input input-bordered w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Cards das ferramentas */}
            <div className="grid gap-6">
              {filteredTools.map((tool, idx) => (
                <Card key={idx} title={tool.name} description={tool.description}>
                  <Accordion items={tool.details} />
                </Card>
              ))}

              {filteredTools.length === 0 && (
                <p className="text-center text-gray-500">
                  Nenhuma ferramenta encontrada.
                </p>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}