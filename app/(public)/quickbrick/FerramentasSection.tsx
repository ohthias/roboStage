"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DocumentTextIcon,
  BeakerIcon,
  PuzzlePieceIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface FerramentasSectionProps {
  seasons: string[];
  seasonLogos: Record<string, { name: string; image: string }>;
}

export default function FerramentasSection({
  seasons,
  seasonLogos,
}: FerramentasSectionProps) {
  const router = useRouter();
  const [filtro, setFiltro] = useState("Todos");

  const categorias = ["Todos", "Criar", "Documentar", "Simular"];

  const ferramentas = [
    {
      id: 1,
      titulo: "Estratégias",
      descricao:
        "Desenhe diretamente sobre a imagem do tapete e planeje cada movimento do seu robô.",
      categoria: "Criar",
      icon: <PuzzlePieceIcon className="w-5 h-5" />,
      image: "/images/quickbrick_unearthed.png",
      link: "/quickbrick/estrategia",
      customContent: null,
    },
    {
      id: 2,
      titulo: "Matriz SWOT das Missões",
      descricao:
        "Escolha uma temporada para organizar as missões em Forças, Fraquezas, Oportunidades e Ameaças.",
      categoria: "Documentar",
      icon: <DocumentTextIcon className="w-5 h-5" />,
      customContent: (
        seasons: string[],
        seasonLogos: { [x: string]: any },
        router: any
      ) => (
        <div className="flex flex-wrap gap-3 justify-center mt-3">
          {seasons.map((s: string) => {
            const season = seasonLogos[s];
            return (
              <div
                key={s}
                className="card w-24 aspect-square bg-base-200 hover:bg-base-300 border border-base-300 hover:border-secondary transition-all duration-200 cursor-pointer"
                onClick={() => router.push(`/quickbrick/matriz-swot/${s}`)}
              >
                <figure className="p-2">
                  <Image
                    src={season?.image || "/images/icons/default-season.png"}
                    alt={season?.name || s}
                    className="rounded-md object-contain"
                    width={80}
                    height={80}
                  />
                </figure>
                <div className="card-body p-1 text-center">
                  <p className="text-xs font-semibold">{season?.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      id: 3,
      titulo: "UNEARTHED Sharks Simulator",
      descricao:
        "Planeje e visualize o percurso do seu robô no tapete, ajustando ângulos e distâncias.",
      categoria: "Simular",
      icon: <BeakerIcon className="w-5 h-5" />,
      image: "/images/quickbrick_robottrack.png",
      link: "/quickbrick/robot-track",
      feitoPor: "Sharks",
    },
    {
      id: 4,
      titulo: "Matriz de Risco",
      descricao:
        "Identifique e avalie os riscos potenciais para o sucesso do seu robô.",
      categoria: "Documentar",
      icon: <DocumentTextIcon className="w-5 h-5" />,
      link: "/quickbrick/matriz-de-risco",
      image: "/images/matriz-de-risco.png",
      customContent: null,
    },
    {
      id: 5,
      titulo: "Matriz SWOT",
      descricao:
        "Análise seu robô usando a ferramenta SWOT para identificar pontos de força, fraquezas, oportunidades e ameaças.",
      categoria: "Documentar",
      icon: <DocumentTextIcon className="w-5 h-5" />,
      link: "/quickbrick/swot-template",
      image: "/images/quickbrick_matrizSWOT.png",
      customContent: null,
      badge: "Novo",
    },
    {
      id: 6,
      titulo: "Tabela de análise de missões",
      descricao:
        "Organize e Analise as missões da temporada UNEARTHED de forma prática.",
      categoria: "Documentar",
      icon: <DocumentTextIcon className="w-5 h-5" />,
      customContent: (
        seasons: string[],
        seasonLogos: { [x: string]: any },
        router: any
      ) => (
        <div className="flex flex-wrap gap-3 justify-center mt-3">
          {seasons.map((s: string) => {
            const season = seasonLogos[s];
            return (
              <div
                key={s}
                className="card w-24 aspect-square bg-base-200 hover:bg-base-300 border border-base-300 hover:border-secondary transition-all duration-200 cursor-pointer"
                onClick={() => router.push(`/quickbrick/tabela-de-missoes/${s}`)}
              >
                <figure className="p-2">
                  <Image
                    src={season?.image || "/images/icons/default-season.png"}
                    alt={season?.name || s}
                    className="rounded-md object-contain"
                    width={80}
                    height={80}
                  />
                </figure>
                <div className="card-body p-1 text-center">
                  <p className="text-xs font-semibold">{season?.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      ),
      badge: "Novo",
    }
  ];

  // Gera array de links (expande links dependentes de seasons, como Matriz SWOT)
  const links = ferramentas.flatMap((f) => {
    if (f.titulo === "Matriz SWOT") {
      return seasons.map((s) => `/quickbrick/matriz-swot/${s}`);
    }
    return f.link ? [f.link] : [];
  });

  const filtradas =
    filtro === "Todos"
      ? ferramentas
      : ferramentas.filter((f) => f.categoria === filtro);

  return (
    <section className="w-full px-4 py-10 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Ferramentas disponíveis
      </h1>

      {/* Filtros */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltro(cat)}
            className={`badge badge-lg border ${
              filtro === cat
                ? "badge-primary text-primary-content"
                : "badge-outline hover:bg-base-200"
            } cursor-pointer px-4 py-2 transition-all`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards */}
      <motion.div
        layout
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl"
      >
        <AnimatePresence>
          {filtradas.map((ferramenta) => (
            <motion.div
              key={ferramenta.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="card bg-base-100 shadow-sm border border-base-300 hover:shadow-xl hover:border-secondary transition-all duration-200 cursor-pointer relative"
              onClick={() => {
                if (ferramenta.link) router.push(ferramenta.link);
              }}
            >
              {ferramenta.badge && (
                <div className="absolute top-3 right-3 badge badge-secondary">
                  {ferramenta.badge}
                </div>
              )}

              {ferramenta.image && (
                <figure className="overflow-hidden rounded-t-2xl">
                  <Image
                    src={ferramenta.image}
                    alt={ferramenta.titulo}
                    className="aspect-[16/9] object-cover w-full"
                    width={300}
                    height={169}
                  />
                </figure>
              )}

              <div className="card-body text-left">
                <h2 className="card-title text-lg">{ferramenta.titulo}</h2>
                <p className="text-sm opacity-80">{ferramenta.descricao}</p>

                {/* Conteúdo customizado (para Matriz SWOT) */}
                {ferramenta.customContent &&
                  ferramenta.customContent(seasons, seasonLogos, router)}
              </div>

              {/* Footer com categoria e créditos */}
              <div className="card-footer flex items-center justify-between border-t border-base-300 px-4 py-3">
                <div
                  className={`flex items-center gap-2 text-primary/75 font-semibold text-sm`}
                >
                  {ferramenta.icon}
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {ferramenta.categoria}
                  </span>
                </div>

                {ferramenta.feitoPor && (
                  <span className="badge bg-secondary/20 text-secondary font-semibold text-xs">
                    Feito por: {ferramenta.feitoPor}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
