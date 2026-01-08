"use client";

import { useState } from "react";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRightLeft,
  BookText,
  Puzzle,
  Scale,
  TestTube,
  Wrench,
} from "lucide-react";

interface FerramentasSectionProps {
  seasons: string[];
  seasonLogos: Record<string, { name: string; image: string }>;
}

interface Ferramenta {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  icon: React.ReactNode;
  image?: string;
  link?: string;
  badge?: string;
  feitoPor?: string;
  customContent?:
    | null
    | ((
        seasons: string[],
        seasonLogos: { [x: string]: any },
        router: any
      ) => React.ReactNode);
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
      icon: <Puzzle className="w-5 h-5" />,
      image: "/images/QuickBrick/Estrategia.png",
      link: "/quickbrick/estrategia",
      customContent: null,
    },
    {
      id: 2,
      titulo: "Matriz SWOT das Missões",
      descricao:
        "Escolha uma temporada para organizar as missões em Forças, Fraquezas, Oportunidades e Ameaças.",
      categoria: "Documentar",
      icon: <BookText className="w-5 h-5" />,
      customContent: (
        seasons: string[],
        seasonLogos: { [x: string]: any },
        router: any
      ) => (
        <div className="flex flex-col gap-2 mt-2 w-full mx-auto">
          {seasons.map((s: string) => {
            const season = seasonLogos[s];

            return (
              <button
                key={s}
                onClick={() => router.push(`/quickbrick/matriz-swot/${s}`)}
                className="
          group
          w-full
          flex items-center gap-4
          px-4 py-3
          rounded-xl
          border border-base-300/60
          bg-base-100
          hover:border-primary
          hover:bg-base-200/50
          transition-all duration-300
        "
              >
                {/* Ícone / Logo */}
                <div
                  className="
          w-10 h-10
          flex items-center justify-center
          rounded-lg
          bg-base-200/70
          group-hover:bg-primary/10
          transition-colors
          shrink-0
        "
                >
                  <Image
                    src={season?.image || "/images/icons/default-season.png"}
                    alt={season?.name || s}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>

                {/* Texto */}
                <div className="flex flex-col text-left flex-1">
                  <span className="text-sm font-semibold leading-tight">
                    {season?.name}
                  </span>
                  <span className="text-xs opacity-60">Temporada FLL</span>
                </div>

                {/* Ação */}
                <span
                  className="
          text-xs font-semibold
          text-primary
          opacity-0
          group-hover:opacity-100
          transition-opacity
        "
                >
                  Abrir →
                </span>
              </button>
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
      icon: <TestTube className="w-5 h-5" />,
      image: "/images/QuickBrick/SharksSimulator.png",
      link: "/quickbrick/robot-track",
      feitoPor: "Sharks",
    },
    {
      id: 4,
      titulo: "Matriz de Risco",
      descricao:
        "Identifique e avalie os riscos potenciais para o sucesso do seu robô.",
      categoria: "Documentar",
      icon: <BookText className="w-5 h-5" />,
      link: "/quickbrick/matriz-de-risco",
      image: "/images/QuickBrick/MatrizRisco.png",
      customContent: null,
    },
    {
      id: 5,
      titulo: "Matriz SWOT",
      descricao:
        "Análise seu robô usando a ferramenta SWOT para identificar pontos de força, fraquezas, oportunidades e ameaças.",
      categoria: "Documentar",
      icon: <BookText className="w-5 h-5" />,
      link: "/quickbrick/swot",
      image: "/images/QuickBrick/MatrizSWOT.png",
      customContent: null,
    },
    {
      id: 6,
      titulo: "Tabela de análise de missões",
      descricao:
        "Organize e Analise as missões da temporada UNEARTHED de forma prática.",
      categoria: "Documentar",
      icon: <BookText className="w-5 h-5" />,
      customContent: (
        seasons: string[],
        seasonLogos: { [x: string]: any },
        router: any
      ) => (
        <div className="flex flex-col gap-2 mt-2 w-full mx-auto">
          {seasons.map((s: string) => {
            const season = seasonLogos[s];

            return (
              <button
                key={s}
                onClick={() =>
                  router.push(`/quickbrick/tabela-de-missoes/${s}`)
                }
                className="
          group
          w-full
          flex items-center gap-4
          px-4 py-3
          rounded-xl
          border border-base-300/60
          bg-base-100
          hover:border-primary
          hover:bg-base-200/50
          transition-all duration-300
        "
              >
                {/* Ícone / Logo */}
                <div
                  className="
          w-10 h-10
          flex items-center justify-center
          rounded-lg
          bg-base-200/70
          group-hover:bg-primary/10
          transition-colors
          shrink-0
        "
                >
                  <Image
                    src={season?.image || "/images/icons/default-season.png"}
                    alt={season?.name || s}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>

                {/* Texto */}
                <div className="flex flex-col text-left flex-1">
                  <span className="text-sm font-semibold leading-tight">
                    {season?.name}
                  </span>
                  <span className="text-xs opacity-60">Temporada FLL</span>
                </div>

                {/* Ação */}
                <span
                  className="
          text-xs font-semibold
          text-primary
          opacity-0
          group-hover:opacity-100
          transition-opacity
        "
                >
                  Abrir →
                </span>
              </button>
            );
          })}
        </div>
      ),
    },
    {
      id: 7,
      titulo: "Comparador de Estratégias",
      descricao:
        "Compare duas ou mais estratégias por pontuação estimada, tempo, risco operacional e consistência.",
      categoria: "Simular",
      icon: <Scale className="w-5 h-5" />,
      link: "/quickbrick/comparador-estrategias",
      customContent: (
        seasons: string[],
        seasonLogos: { [x: string]: any },
        router: any
      ) => (
        <div className="flex flex-col gap-2 mt-2 w-full mx-auto">
          {seasons.map((s: string) => {
            const season = seasonLogos[s];

            return (
              <button
                key={s}
                onClick={() =>
                  router.push(`/quickbrick/tabela-de-missoes/${s}`)
                }
                className="
          group
          w-full
          flex items-center gap-4
          px-4 py-3
          rounded-xl
          border border-base-300/60
          bg-base-100
          hover:border-primary
          hover:bg-base-200/50
          transition-all duration-300
        "
              >
                {/* Ícone / Logo */}
                <div
                  className="
          w-10 h-10
          flex items-center justify-center
          rounded-lg
          bg-base-200/70
          group-hover:bg-primary/10
          transition-colors
          shrink-0
        "
                >
                  <Image
                    src={season?.image || "/images/icons/default-season.png"}
                    alt={season?.name || s}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>

                {/* Texto */}
                <div className="flex flex-col text-left flex-1">
                  <span className="text-sm font-semibold leading-tight">
                    {season?.name}
                  </span>
                  <span className="text-xs opacity-60">Temporada FLL</span>
                </div>

                {/* Ação */}
                <span
                  className="
          text-xs font-semibold
          text-primary
          opacity-0
          group-hover:opacity-100
          transition-opacity
        "
                >
                  Abrir →
                </span>
              </button>
            );
          })}
        </div>
      ),
      badge: "Em breve",
    },
    {
      id: 8,
      titulo: "Planejador de Anexos",
      descricao:
        "Organize estrategicamente os anexos do robô, relacionando missões, rodadas, risco operacional e tempo de troca.",
      categoria: "Documentar",
      icon: <Wrench className="w-5 h-5" />,
      link: "/quickbrick/planejador-de-anexos",
      image: "/images/QuickBrick/Estrategia.png",
      customContent: null,
      badge: "Em breve",
    },
    {
      id: 9,
      titulo: "Inspiração de Robôs e Conceitos",
      descricao:
        "Explore uma coleção de designs e conceitos de robôs para inspirar suas criações.",
      categoria: "Criar",
      icon: <TestTube className="w-5 h-5" />,
      link: "/quickbrick/inspiracao-de-robos-e-conceitos",
      image: "/images/QuickBrick/Inspiracao.jpg",
      customContent: null,
      badge: "Em breve",
    },
    {
      id: 10,
      titulo: "Estratégia em Saída",
      descricao:
        "Crie e organize as saídas do robô com suas missões e exporte os dados para análise comparativa.",
      categoria: "Criar",
      icon: <ArrowRightLeft className="w-5 h-5" />,
      link: "/quickbrick/geradorsaidas",
      image: "/images/QuickBrick/Estrategia.png",
      customContent: (
        seasons: string[],
        seasonLogos: { [x: string]: any },
        router: any
      ) => (
        <div className="flex flex-col gap-2 mt-2 w-full mx-auto">
          {seasons.map((s: string) => {
            const season = seasonLogos[s];

            return (
              <button
                key={s}
                onClick={() =>
                  router.push(`/quickbrick/tabela-de-missoes/${s}`)
                }
                className="
          group
          w-full
          flex items-center gap-4
          px-4 py-3
          rounded-xl
          border border-base-300/60
          bg-base-100
          hover:border-primary
          hover:bg-base-200/50
          transition-all duration-300
        "
              >
                {/* Ícone / Logo */}
                <div
                  className="
          w-10 h-10
          flex items-center justify-center
          rounded-lg
          bg-base-200/70
          group-hover:bg-primary/10
          transition-colors
          shrink-0
        "
                >
                  <Image
                    src={season?.image || "/images/icons/default-season.png"}
                    alt={season?.name || s}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>

                {/* Texto */}
                <div className="flex flex-col text-left flex-1">
                  <span className="text-sm font-semibold leading-tight">
                    {season?.name}
                  </span>
                  <span className="text-xs opacity-60">Temporada FLL</span>
                </div>

                {/* Ação */}
                <span
                  className="
          text-xs font-semibold
          text-primary
          opacity-0
          group-hover:opacity-100
          transition-opacity
        "
                >
                  Abrir →
                </span>
              </button>
            );
          })}
        </div>
      ),
      badge: "Em breve",
    },
  ] as Ferramenta[];

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.25,
        ease: easeInOut,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      transition: { duration: 0.2 },
    },
  };

  const filtradas =
    filtro === "Todos"
      ? ferramentas
      : ferramentas.filter((f) => f.categoria === filtro);

  return (
    <section className="w-full flex flex-col items-center">
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
              variants={cardVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              whileHover={{ scale: 1.015 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="group relative card bg-base-100 border border-base-300 rounded-2xl overflow-hidden hover:border-primary hover:shadow-xl transition-colors cursor-pointer"
              onClick={() => {
                if (ferramenta.link) router.push(ferramenta.link);
              }}
            >
              {/* Badge */}
              {ferramenta.badge && (
                <div className="absolute top-4 right-4 z-10 badge badge-secondary badge-sm">
                  {ferramenta.badge}
                </div>
              )}

              {/* Imagem */}
              {ferramenta.image && (
                <figure className="relative">
                  <Image
                    src={ferramenta.image}
                    alt={ferramenta.titulo}
                    width={400}
                    height={225}
                    className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Overlay suave */}
                  <div className="absolute inset-0 bg-gradient-to-t from-base-100/70 via-transparent to-transparent" />
                </figure>
              )}

              {/* Corpo */}
              <div className="card-body gap-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-primary/10 text-primary">
                    {ferramenta.icon}
                  </span>

                  <span className="text-xs font-semibold uppercase tracking-wider text-primary/70">
                    {ferramenta.categoria}
                  </span>
                </div>

                <h2 className="text-lg font-bold leading-tight">
                  {ferramenta.titulo}
                </h2>

                <p className="text-sm opacity-80 leading-relaxed">
                  {ferramenta.descricao}
                </p>

                {/* Conteúdo customizado */}
                {ferramenta.customContent &&
                  ferramenta.customContent(seasons, seasonLogos, router)}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 pb-5 pt-0">
                {ferramenta.feitoPor ? (
                  <span className="text-xs font-semibold text-secondary">
                    Desenvolvido por {ferramenta.feitoPor}
                  </span>
                ) : (
                  <span />
                )}

                {ferramenta.customContent ? null : (
                  <span className="text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-primary">
                    Abrir ferramenta →
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
