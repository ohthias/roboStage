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
import ComingSoon from "@/components/ComingSoon";
import Sidebar from "@/components/showLive/Sidebar";

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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
        <Loader />
      </div>
    );
  }

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
        return <ComingSoon />;
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
    <div className="flex w-full">
      <Sidebar code_volunteer={eventData?.code_volunteer ?? ""} code_visitor={eventData?.code_visit ?? ""} />

      <div className="flex-1 ml-72 p-4">
        {loading ? (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
            <Loader />
          </div>
        ) : (
          <main className="flex flex-col gap-4 w-full flex-1 overflow-y-auto pt-4">
            {renderSection()}
          </main>
        )}
      </div>
    </div>
  );
}
