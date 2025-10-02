"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import GeneralPage from "@/components/showLive/subpages/GeneralPage";
import { useEvent } from "@/hooks/useEvent";
import TeamsSection from "@/components/showLive/subpages/TeamsSection";
import RankingSection from "@/components/showLive/subpages/RankingSection";
import VisualizationSection from "@/components/showLive/subpages/VisualizationSection";
import ConfiguracoesSection from "@/components/showLive/subpages/ConfiguracoesSection";
import Loader from "@/components/loader";
import Sidebar from "@/components/showLive/Sidebar";
import ThemeSection from "@/components/showLive/subpages/ThemePage";

export default function EventAdminPage() {
  const params = useParams<{ code_event: string }>();
  const codeEvent = params.code_event;
  const { loading, error, eventData, eventConfig, teams } = useEvent(codeEvent);

  const [currentSection, setCurrentSection] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const renderSection = () => {
    switch (currentSection) {
      case "equipes":
        return (
          <TeamsSection
            event={
              eventData?.id_evento && eventConfig?.config.rodadas
                ? {
                  id_event: eventData.id_evento,
                  points: eventConfig.config.rodadas,
                }
                : null
            }
          />
        );
      case "ranking":
        return <RankingSection idEvent={eventData?.id_evento || null} />;
      case "visualizacao":
        return <VisualizationSection idEvent={eventData?.id_evento || null} />;
      case "personalizacao":
        return <ThemeSection eventId={eventData?.id_evento ? String(eventData.id_evento) : ""} />;
      case "configuracoes":
        return <ConfiguracoesSection idEvent={eventData?.id_evento ?? null} />;
      case "gracious-professionalism":
        return <div>Gracious Professionalism Section - Em desenvolvimento</div>;
      case "brackets":
        return <div>Brackets Section - Em desenvolvimento</div>;
      case "pre-round-inspection":
        return <div>Inspeção Pré-Rodada Section - Em desenvolvimento</div>;
      case "advanced-view":
        return <div>Visualização Avançada Section - Em desenvolvimento</div>;
      default:
        return (
          <GeneralPage
            name_event={eventData?.name_event ?? ""}
            event_data={eventData}
            event_config={eventConfig?.config || null}
          />
        );
    }
  };

   return (
    <div className="flex w-full">
      {/* Sidebar */}
      <Sidebar
        code_volunteer={eventData?.code_volunteer ?? ""}
        code_visitor={eventData?.code_visit ?? ""}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        eventId={eventData?.id_evento || 0}
      />

      <div
        className={`
          flex-1 p-4 sm:p-2 transition-all duration-300
          ${sidebarOpen ? "lg:ml-72" : "lg:ml-72"}
        `}
      >
        {loading ? (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
            <Loader />
          </div>
        ) : (
          <main className="flex-1 overflow-y-auto pt-4 mt-8 sm:mt-0">
            {renderSection()}
          </main>
        )}
      </div>
    </div>
   )
}
