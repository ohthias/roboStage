import { useState } from "react";
import HeroVoluntario from "./ui/HeroVoluntario";
import AvaliacaoRounds from "./AvaRound";
import robo from "@/public/robo.gif";
import AvaliacaoRoundFinal from "./componentsVoluntario/AvaFinalRound";

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
            <div className="flex items-center justify-center h-[calc(100vh-100px)] w-full gap-12 bg-gradient-to-t from-white to-light-smoke animate-fade-in">
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
          <div className="flex flex-col items-center justify-center w-full bg-gradient-to-t from-white to-light-smoke animate-fade-in">
            <h2 className="text-4xl font-extrabold text-details-primary">
              Avaliação de Semi-Final e Final
            </h2>
            <AvaliacaoRoundFinal codigo_sala={codigoSala} />
          </div>
        );
      case "EventosRounds":
        return (
          <div className="flex items-center justify-center h-[calc(100vh-100px)] w-full bg-gradient-to-t from-white to-light-smoke animate-fade-in">
            <h2 className="text-4xl font-extrabold text-details-primary">
              Avaliação de Eventos Extras de Rounds
            </h2>
          </div>
        );
      case "Discursos":
        return (
          <div className="flex items-center justify-center h-[calc(100vh-100px)] w-full bg-gradient-to-t from-white to-light-smoke animate-fade-in">
            <h2 className="text-4xl font-extrabold text-details-primary">
              Discursos de premiação
            </h2>
          </div>
        );

      default:
        return (
          <>
            <div className="flex items-center justify-center h-[calc(100vh-100px)] w-full gap-12 bg-gradient-to-t from-white to-light-smoke animate-fade-in">
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
    }
  };

  return (
    <>
      <HeroVoluntario
        codigo_sala={codigoSala}
        setView={setView}
        view={view}
      />
      <main className="p-6">{renderContent()}</main>
    </>
  );
}
