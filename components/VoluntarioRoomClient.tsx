import { useState } from "react";
import HeroVoluntario from "./ui/HeroVoluntario";
import AvaliacaoRounds from "./AvaRound";
import robo from "@/public/robo.gif";
import AvaliacaoRoundFinal from "./componentsVoluntario/AvaFinalRound";
import DiscursosPremiacao from "./componentsVoluntario/DiscursosPremiacao";

export default function DashboardVoluntario({
  codigoSala,
}: {
  codigoSala: string;
}) {
  const [view, setView] = useState<
    | "default"
    | "Hub"
    | "AvaliacaoRounds"
    | "SemiFinal"
    | "EventosRounds"
    | "Discursos"
  >("default");

  const renderContent = () => {
    switch (view) {
      case "Hub":
        return (
          <>
            <div className="flex items-center justify-center h-[calc(100vh-200px)] w-full gap-12 bg-gradient-to-t from-white to-light-smoke animate-fade-in">
              <div className="flex flex-col items-start max-w-xl">
                <h2 className="text-4xl font-extrabold mb-4 flex items-center gap-3 text-details-primary">
                  Bem-vindo ao Hub de Voluntário!
                </h2>
                <p className="text-md mb-3 text-foreground max-w-md">
                  Estamos felizes em tê-lo aqui. Explore as funções disponíveis
                  usando a barra de navegação acima e participe das atividades
                  como voluntário!
                </p>
              </div>
              <div className="flex items-end animate-bounce-slow">
                <img
                  src={robo.src}
                  alt="Voluntário"
                  className="w-96 h-auto object-cover"
                />
              </div>
              <style jsx global>{`
                @keyframes bounce-slow {
                  0%,
                  100% {
                    transform: translateY(0);
                  }
                  50% {
                    transform: translateY(-20px);
                  }
                }
                .animate-bounce-slow {
                  animation: bounce-slow 2s infinite;
                }
              `}</style>
            </div>
          </>
        );
      case "AvaliacaoRounds":
        return (
          <>
            <AvaliacaoRounds codigo_sala={codigoSala} />
          </>
        );
      case "SemiFinal":
        return (
          <div className="flex flex-col items-center justify-center w-full animate-fade-in">
            <h2 className="text-4xl font-extrabold text-details-primary">
              Avaliação de Semi-Final e Final
            </h2>
            <AvaliacaoRoundFinal codigo_sala={codigoSala} />
          </div>
        );
      case "EventosRounds":
        return (
          <div className="flex items-center justify-center h-[calc(100vh-200px)] w-full gap-12 bg-gradient-to-t from-white to-light-smoke animate-fade-in">
            <div className="flex flex-col items-start max-w-xl">
              <h2 className="text-4xl font-extrabold mb-4 flex items-center gap-3 text-details-primary">
                Em breve
              </h2>
              <p className="text-md mb-3 text-foreground max-w-md">
                Esta funcionalidade estará disponível em breve. Fique atento
                para mais atualizações!
              </p>
            </div>
            <div className="flex items-end animate-bounce-slow">
              <img
                src={robo.src}
                alt="Voluntário"
                className="w-96 h-auto object-cover"
              />
            </div>
            <style jsx global>{`
              @keyframes bounce-slow {
                0%,
                100% {
                  transform: translateY(0);
                }
                50% {
                  transform: translateY(-20px);
                }
              }
              .animate-bounce-slow {
                animation: bounce-slow 2s infinite;
              }
            `}</style>
          </div>
        );
      case "Discursos":
        return (
          <div className="flex flex-col items-center justify-center w-full animate-fade-in">
            <h2 className="text-4xl font-extrabold text-details-primary">
              Premiação e Discursos
            </h2>
            <DiscursosPremiacao codigo_sala={codigoSala} />
          </div>
        );

      default:
        return (
          <>
            <div className="flex flex-col-reverse lg:flex-row items-center justify-center min-h-screen w-full gap-12 px-6 py-16 bg-gradient-to-t from-white to-light-smoke animate-fade-in">
              {/* Texto */}
              <div className="flex flex-col items-start max-w-xl text-center lg:text-left">
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 flex items-center gap-3 text-details-primary">
                  Bem-vindo ao Hub de Voluntário!
                </h2>
                <p className="text-sm sm:text-base text-foreground mb-3 max-w-md mx-auto lg:mx-0">
                  Estamos felizes em tê-lo aqui. Explore as funções disponíveis
                  usando a barra de navegação acima e participe das atividades
                  como voluntário!
                </p>
              </div>

              {/* Imagem */}
              <div className="flex items-end animate-bounce-slow">
                <img
                  src={robo.src}
                  alt="Voluntário"
                  className="w-64 sm:w-80 md:w-96 h-auto object-cover"
                />
              </div>
            </div>

            <style jsx global>{`
              @keyframes bounce-slow {
                0%,
                100% {
                  transform: translateY(0);
                }
                50% {
                  transform: translateY(-20px);
                }
              }
              .animate-bounce-slow {
                animation: bounce-slow 2s infinite;
              }
            `}</style>
          </>
        );
    }
  };

  return (
    <>
      <HeroVoluntario codigo_sala={codigoSala} setView={setView} view={view} />
      <main className="p-6">{renderContent()}</main>
    </>
  );
}
