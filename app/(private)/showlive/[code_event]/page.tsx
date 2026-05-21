"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { useEvent } from "@/hooks/useEvent";
import Loader from "@/components/Loader";
import Sidebar from "@/components/showLive/Sidebar";
import GeneralPage from "@/components/showLive/subpages/GeneralPage";

// Lazy-load heavy subpages so the initial bundle stays small
const TeamsSection      = lazy(() => import("@/components/showLive/subpages/TeamsSection"));
const RankingSection    = lazy(() => import("@/components/showLive/subpages/RankingSection"));
const VisualizationSection = lazy(() => import("@/components/showLive/subpages/VisualizationSection"));
const ConfiguracoesSection = lazy(() => import("@/components/showLive/subpages/ConfiguracoesSection"));
const ThemeSection      = lazy(() => import("@/components/showLive/subpages/ThemePage"));
const TabelaGracious    = lazy(() => import("@/components/showLive/subpages/TabelaGracious"));
const Brackets          = lazy(() => import("@/components/showLive/subpages/BracketsSection"));

type Section =
  | ""
  | "equipes"
  | "ranking"
  | "visualizacao"
  | "personalizacao"
  | "configuracoes"
  | "gracious-professionalism"
  | "brackets"
  | "pre-round-inspection"
  | "advanced-view";

function useHashSection() {
  const getHash = () => (window.location.hash.replace("#", "") as Section) || "";

  const [section, setSection] = useState<Section>("");

  useEffect(() => {
    setSection(getHash());

    const onHashChange = () => setSection(getHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((key: string) => {
    window.location.hash = key ? `#${key}` : "#";
    setSection((key as Section) || "");
  }, []);

  return { section, navigate };
}

function SectionLoader() {
  return (
    <div className="flex justify-center items-center h-48">
      <span className="loading loading-spinner loading-md text-primary" />
    </div>
  );
}

export default function EventAdminPage() {
  const params = useParams<{ code_event: string }>();
  const { loading, eventData, eventConfig } = useEvent(params.code_event);
  const { section, navigate } = useHashSection();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const idEvent = eventData?.id_evento ?? null;

  const renderSection = () => {
    switch (section) {
      case "equipes":
        return (
          <TeamsSection
            event={
              idEvent && eventConfig?.config.rodadas
                ? { id_event: idEvent, points: eventConfig.config.rodadas }
                : null
            }
          />
        );
      case "ranking":
        return <RankingSection idEvent={idEvent} />;
      case "visualizacao":
        return <VisualizationSection idEvent={idEvent} />;
      case "personalizacao":
        return <ThemeSection eventId={idEvent ? String(idEvent) : ""} />;
      case "configuracoes":
        return <ConfiguracoesSection idEvent={idEvent} />;
      case "gracious-professionalism":
        return <TabelaGracious eventId={idEvent ?? 0} />;
      case "brackets":
        return <Brackets eventId={idEvent ?? 0} />;
      case "pre-round-inspection":
        return (
          <div className="px-4 md:px-6 text-base-content/50 text-sm pt-4">
            Inspeção Pré-Rodada — em desenvolvimento
          </div>
        );
      case "advanced-view":
        return (
          <div className="px-4 md:px-6 text-base-content/50 text-sm pt-4">
            Visualização Avançada — em desenvolvimento
          </div>
        );
      default:
        return (
          <GeneralPage
            name_event={eventData?.name_event ?? ""}
            event_config={eventConfig?.config ?? null}
          />
        );
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-base-300">
      <Sidebar
        code_volunteer={eventData?.code_volunteer ?? ""}
        code_visitor={eventData?.code_visit ?? ""}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        eventId={idEvent ?? 0}
        currentSection={section}
        onNavigate={navigate}
      />

      {/* Content shifts right on large screens to account for fixed sidebar (w-64) */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {loading ? (
          <div className="fixed inset-0 bg-base-300/80 flex items-center justify-center z-50">
            <Loader />
          </div>
        ) : (
          <main className="flex-1 overflow-y-auto pt-4 pb-8 mt-14 lg:mt-0">
            <Suspense fallback={<SectionLoader />}>{renderSection()}</Suspense>
          </main>
        )}
      </div>
    </div>
  );
}