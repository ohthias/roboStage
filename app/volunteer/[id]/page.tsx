"use client";
import { useParams } from "next/navigation";
import { NavigationBar } from "../components/NavigationBar";
import { useState, useEffect } from "react";
import AvaliacaoRounds from "@/components/AvaRound";
import robo from "@/public/robo.gif";

export default function VolunteerPage() {
  const params = useParams();
  const id_evento = params?.id as string;

  const [currentSection, setCurrentSection] = useState<string>("");
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
        return <AvaliacaoRounds idEvento={id_evento} />;
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
              <a href="#avaliar" className="btn btn-info btn-wide shadow-md hover:scale-105 transition-transform">
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
      <NavigationBar />
      <main className="pt-4 px-4">{currentSectionContent()}</main>
    </div>
  );
}
