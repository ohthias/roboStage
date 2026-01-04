"use client";
import { useEffect, useState } from "react";
import Accordion from "@/components/UI/Accordion";
import { Navbar } from "@/components/UI/Navbar";
import { Footer } from "@/components/UI/Footer";
import Loader from "@/components/Loader";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import Header from "@/components/UI/Header";

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

  const filteredTools = tools.filter(
    (t) => t.name && t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-base-100">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <Header
            type="Help Desk"
            name="Encontre"
            highlight="a ajuda que você precisa"
            description="Explore nossas ferramentas e recursos para tirar suas dúvidas e aprimorar sua experiência com o RoboStage."
          />

          {/* Search Bar */}
          <div className="my-8">
            <input
              type="text"
              placeholder="Buscar ferramentas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-base-300 bg-base-200/50 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : (
            <RevealOnScroll>
              <section className="space-y-6">
                {filteredTools.map((tool, idx) => (
                  <article
                    key={idx}
                    className="rounded-2xl border border-base-200 bg-base-100/60 backdrop-blur shadow-sm hover:shadow-md transition"
                  >
                    <div className="p-6 md:p-8">
                      <h2 className="text-2xl font-semibold mb-2">
                        {tool.name}
                      </h2>
                      <p className="text-base-content/70 mb-6">
                        {tool.description}
                      </p>

                      <Accordion items={tool.details || []} />
                    </div>
                  </article>
                ))}

                {filteredTools.length === 0 && (
                  <div className="text-center py-12 text-base-content/50">
                    Nenhuma ferramenta encontrada.
                  </div>
                )}
              </section>
            </RevealOnScroll>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
