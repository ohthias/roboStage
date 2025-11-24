"use client";

import React, { useEffect, useRef } from "react";
import { ChartPie, Palette, RadioIcon, Book, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/utils/supabase/client";

export default function HubHero({ session }: { session: any }) {
  const [userStats, setUserStats] = React.useState({
    total_tests: 0,
    total_eventos: 0,
    total_themes: 0,
    total_documents: 0,
  });

  const tips = [
    "QuickBrick Studio: Planeje suas estratégias como um verdadeiro engenheiro da FLL. Documente, simule e ajuste seu robô antes das partidas.",
    "LabTest: Teste e valide suas missões. Acompanhe estatísticas detalhadas de cada lançamento e descubra onde ganhar segundos preciosos.",
    "InnoLab: Transforme ideias em diagramas. Organize o processo do projeto de inovação da equipe e surpreenda os jurados.",
    "ShowLive: Crie campeonatos e torneios. Defina rodadas, equipes e acompanhe a evolução da competição em tempo real.",
    "StyleLab: Personalize cores e temas para tornar cada evento memorável.",
    "Combine QuickBrick e LabTest para experimentar estratégias ousadas antes do torneio real.",
    "Compartilhe insights do InnoLab com a equipe para soluções mais criativas e eficientes.",
    "Revise resultados no ShowLive para ajustar estratégias e melhorar o desempenho em rodadas futuras.",
    "Lembre-se: pequenas correções no robô podem fazer a diferença na competição.",
    "Verifique sempre se o giroscópio do robô está calibrado para evitar desvios nas missões.",
  ];

  const stats = [
    { title: "Eventos Criados", percent: userStats.total_eventos },
    { title: "Testes Feitos", percent: userStats.total_tests },
    { title: "Documentos Criados", percent: userStats.total_documents },
    { title: "Temas Criados", percent: userStats.total_themes },
  ];

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("user_activity_summary")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (!error && data) {
        setUserStats({
          total_tests: data.total_tests || 0,
          total_eventos: data.total_eventos || 0,
          total_themes: data.total_themes || 0,
          total_documents: data.total_documents || 0,
        });
      }
    };
    fetchUserStats();
  }, [session]);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (!carouselRef.current) return;

      const items = carouselRef.current.children;
      const total = items.length;

      index = (index + 1) % total;

      const element = items[index] as HTMLElement;
      element.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }, 10000); // 10s por slide

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-screen bg-base-200 space-y-6">
      {/* HERO - Banner do usuário */}
      <div className="hero bg-gradient-to-r from-red-600 to-red-900 text-primary-content rounded-3xl shadow-xl border border-primary/40 h-48">
        <div className="hero-content flex-col md:flex-row w-full justify-between p-8">
          <div>
            <h1 className="text-4xl font-bold">Olá, Matheus 👋</h1>
            <p className="text-sm md:text-md max-w-2xl leading-relaxed opacity-90 mt-2">
              Seu hub para <span className="font-semibold">gerenciar</span>,{" "}
              <span className="font-semibold">testar</span> e{" "}
              <span className="font-semibold">criar</span> seus robôs, projetos
              e eventos. Tudo para facilitar sua jornada na robótica 🚀
            </p>
          </div>
        </div>
      </div>

      {/* CARROSSEL DE DICAS */}
      <div className="w-full rounded-2xl" aria-label="Carrossel de dicas">
        {/* container com scroll horizontal e snap para melhor experiência mobile */}
        <div
          ref={carouselRef}
          role="list"
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory touch-pan-x px-4 py-4 md:px-6 md:py-6"
          style={{
            WebkitOverflowScrolling: "touch",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {tips.map((tip, index) => (
            <div
              id={`tip-${index}`}
              key={index}
              role="listitem"
              className="snap-center flex-shrink-0 w-[85%] sm:w-3/4 md:w-full max-w-2xl bg-warning/40 border border-warning rounded-xl p-4 md:p-8 text-center"
            >
              <p className="text-sm md:text-lg font-medium text-warning-content leading-relaxed">
                {tip}
              </p>
            </div>
          ))}
        </div>

        {/* indicadores simples (visuais) — ocupam pouco espaço no mobile */}
        <div className="flex justify-center gap-2 mt-3">
          {tips.map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-6 rounded-full bg-warning/40"
              aria-hidden
            />
          ))}
        </div>
      </div>

      {/* STATS MODERNOS */}
      <div className="stats stats-vertical md:stats-horizontal shadow-xl w-full bg-base-100 border border-base-300 rounded-3xl">
        {stats.map((s, i) => (
          <div key={i} className="stat place-items-center p-6">
            <div className="stat-title">{s.title}</div>
            <div className="stat-value text-primary">{s.percent}</div>
          </div>
        ))}
      </div>

      {/* BLOCO DE FUNÇÕES */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "ShowLive", icon: <RadioIcon size={26} /> },
          { label: "LabTest", icon: <ChartPie size={26} /> },
          { label: "InnoLab", icon: <Book size={26} /> },
          { label: "StyleLab", icon: <Palette size={26} /> },
        ].map((item, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.06 }}
            className="btn btn-outline flex flex-col gap-2 h-28 rounded-2xl shadow bg-base-100 border-base-300 hover:bg-base-200"
          >
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </motion.button>
        ))}
      </div>

      {/* ACESSO RÁPIDO */}
      <div className="card bg-base-100 shadow-xl border border-base-300 p-6 rounded-3xl">
        <h2 className="text-xl font-semibold mb-4">Acesso Rápido ⚡</h2>
        <div className="flex gap-4 overflow-x-auto pb-1">
          {[
            { name: "QuickBrick Studio", url: "/quickbrick" },
            { name: "FLL Score", url: "/fll-score#unearthed" },
            { name: "FLL Docs", url: "/fll-docs" },
            { name: "Flash QA", url: "/flash-qa" },
            { name: "Timers", url: "/timers" },
          ].map((tool, i) => (
            <a
              key={i}
              href={tool.url}
              target="_blank"
              className="btn btn-primary btn-sm rounded-xl"
            >
              <Rocket size={16} />
              {tool.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
