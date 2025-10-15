"use client";
import { useParams } from "next/navigation";
import { NavigationBar } from "../components/NavigationBar";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import AvaliacaoRounds from "@/components/AvaRound";
import robo from "@/public/robo.gif";
import Loader from "@/components/loader";
import AvaliacaoPlayOffs from "@/components/showLive/volunteer/AvaliacaoPlayOffs";

export default function VolunteerPage() {
  const params = useParams();
  const code_event = params?.code_event as string;

  const [id_evento, setId_event] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState<string>("");

  useEffect(() => {
    const fetchEvent = async () => {
      if (!code_event) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("events")
        .select("id_evento")
        .eq("code_event", code_event)
        .single();

      if (data) {
        setId_event(data.id_evento);
      }

      setLoading(false);
    };

    fetchEvent();
  }, [code_event]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    setCurrentSection(hash);

    const handleHashChange = () => {
      const newHash = window.location.hash.replace("#", "");
      setCurrentSection(newHash);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const currentSectionContent = () => {
    switch (currentSection) {
      case "avalia":
        return id_evento ? (
          <AvaliacaoRounds idEvento={id_evento} />
        ) : (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
            <Loader />
          </div>
        );
      case "playoffs":
        return <AvaliacaoPlayOffs idEvento={Number(id_evento)} />;
      default:
        return (
          <div className="w-full bg-gradient-to-tr from-base-100 to-base-300 rounded-2xl shadow-lg p-6 md:p-12 flex flex-col-reverse md:flex-row items-center justify-between gap-8 animate-fade-in">
            {/* Texto */}
            <div className="flex flex-col items-start text-center md:text-left max-w-lg">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 flex items-center gap-2 text-info">
                Bem-vindo ao Hub de Voluntário!
              </h2>
              <p className="text-base md:text-lg mb-6 text-base-content">
                Estamos felizes em tê-lo aqui. Explore as funções disponíveis
                usando a barra de navegação acima e participe das atividades
                como voluntário!
              </p>
              <a
                href="#avalia"
                className="btn btn-info btn-wide shadow-md hover:scale-105 transition-transform"
              >
                Avalie Agora!
              </a>
            </div>

            {/* Imagem */}
            <div className="flex items-center justify-center md:justify-end animate-bounce-slow">
              <img
                src={robo.src}
                alt="Voluntário"
                className="w-48 md:w-72 lg:w-96 h-auto drop-shadow-lg"
              />
            </div>

            {/* Animação */}
            <style jsx global>{`
              @keyframes bounce-slow {
                0%,
                100% {
                  transform: translateY(0);
                }
                50% {
                  transform: translateY(-15px);
                }
              }
              .animate-bounce-slow {
                animation: bounce-slow 3s infinite;
              }
            `}</style>
          </div>
        );
    }
  };

  return (
    <div className="p-4">
      <NavigationBar eventId={Number(id_evento)} />
      <main className="pt-4 px-4">
        {loading ? <p>Carregando evento...</p> : currentSectionContent()}
      </main>
    </div>
  );
}