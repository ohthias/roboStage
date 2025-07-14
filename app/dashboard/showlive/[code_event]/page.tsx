"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import NavgationBar from "../components/NavgationBar";
import GeneralPage from "../subpages/GeneralPage";
import { useEvent } from "@/app/hooks/useEvent";
import TeamsSection from "../subpages/TeamsSection";
import RankingSection from "../subpages/RankingSection";
import VisualizationSection from "../subpages/VisualizationSection";
import ConfiguracoesSection from "../subpages/ConfiguracoesSection";

export default function EventAdminPage() {
  const params = useParams<{ code_event: string }>();
  const codeEvent = params.code_event;
  const { loading, error, eventData, eventConfig, teams } = useEvent(codeEvent);

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

  if (loading) return <p>Carregando...</p>;

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
        return "<p>Personalização em breve...</p>";
      case "configuracoes":
        return <ConfiguracoesSection idEvent={eventData?.id_evento ?? null} />;
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
    <div className="p-4 flex gap-4 overflow-y-hidden">
      <NavgationBar />
      <main className="flex gap-4 flex-col w-full flex-1 overflow-y-auto">
        {renderSection()}
      </main>
    </div>
  );
}
