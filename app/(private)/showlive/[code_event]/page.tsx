"use client";

import { useParams } from "next/navigation";

import {
  useEffect,
  useState,
  useCallback,
  lazy,
  Suspense,
  useMemo,
} from "react";

import { Menu, Trophy, CalendarDays, Radio } from "lucide-react";

import { useEvent } from "@/hooks/useEvent";

import Loader from "@/components/Loader";

import Sidebar from "@/components/showLive/Sidebar";

import GeneralPage from "@/components/showLive/subpages/GeneralPage";

// Lazy loading
const TeamsSection = lazy(
  () => import("@/components/showLive/subpages/TeamsSection"),
);

const RankingSection = lazy(
  () => import("@/components/showLive/subpages/RankingSection"),
);

const VisualizationSection = lazy(
  () => import("@/components/showLive/subpages/VisualizationSection"),
);

const ConfiguracoesSection = lazy(
  () => import("@/components/showLive/subpages/ConfiguracoesSection"),
);

const ThemeSection = lazy(
  () => import("@/components/showLive/subpages/ThemePage"),
);

const TabelaGracious = lazy(
  () => import("@/components/showLive/subpages/TabelaGracious"),
);

const Brackets = lazy(
  () => import("@/components/showLive/subpages/BracketsSection"),
);

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
  const getHash = () =>
    (window.location.hash.replace("#", "") as Section) || "";

  const [section, setSection] = useState<Section>("");

  useEffect(() => {
    setSection(getHash());

    const onHashChange = () => setSection(getHash());

    window.addEventListener("hashchange", onHashChange);

    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((key: string) => {
    const hash = key ? `#${key}` : "#";

    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }

    setSection((key as Section) || "");
  }, []);

  return {
    section,
    navigate,
  };
}

function SectionLoader() {
  return (
    <div className="flex justify-center items-center h-48">
      <span className="loading loading-spinner loading-md text-primary" />
    </div>
  );
}

export default function EventAdminPage() {
  const params = useParams<{
    code_event: string;
  }>();

  const { loading, eventData, eventConfig, teams, stats, ranking } = useEvent(
    params.code_event,
  );

  const { section, navigate } = useHashSection();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const idEvent = eventData?.id_evento ?? 0;

  // Fecha sidebar ao navegar
  const handleNavigate = useCallback(
    (key: string) => {
      navigate(key);

      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    },
    [navigate],
  );

  // Desktop reset
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const content = useMemo(() => {
    switch (section) {
      case "equipes":
        return (
          <TeamsSection
            event={
              idEvent && eventConfig?.config?.rodadas
                ? {
                    id_event: idEvent,

                    points: eventConfig.config.rodadas,
                  }
                : null
            }
          />
        );

      case "ranking":
        return <RankingSection idEvent={idEvent} />;

      case "visualizacao":
        return <VisualizationSection idEvent={idEvent} />;

      case "personalizacao":
        return <ThemeSection eventId={String(idEvent)} />;

      case "configuracoes":
        return <ConfiguracoesSection idEvent={idEvent} />;

      case "gracious-professionalism":
        return <TabelaGracious eventId={idEvent} />;

      case "brackets":
        return <Brackets eventId={idEvent} />;

      case "pre-round-inspection":
        return (
          <div className="px-4 md:px-6 py-4 text-sm text-base-content/50">
            Inspeção Pré-Rodada — em desenvolvimento
          </div>
        );

      case "advanced-view":
        return (
          <div className="px-4 md:px-6 py-4 text-sm text-base-content/50">
            Visualização Avançada — em desenvolvimento
          </div>
        );

      default:
        return (
          <GeneralPage
            name_event={eventData?.name_event ?? ""}
            event_config={eventConfig?.config ?? null}
            stats={stats}
            ranking={ranking}
          />
        );
    }
  }, [section, idEvent, eventData, eventConfig, teams, stats, ranking]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-100">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200/40">
      {/* MOBILE HEADER */}
      <header
        className="
          lg:hidden
          sticky top-0 z-40
          border-b border-base-300
          bg-base-100/90
          backdrop-blur-xl
        "
      >
        <div
          className="
            h-16
            px-4
            flex items-center justify-between
            gap-3
          "
        >
          <div className="min-w-0">
            <h1
              className="
                font-bold
                truncate
              "
            >
              {eventData?.name_event}
            </h1>

            <p className="text-xs text-base-content/50">ShowLive Dashboard</p>
          </div>

          <button
            onClick={() => setSidebarOpen(true)}
            className="
              btn btn-square
              btn-ghost
              rounded-2xl
            "
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* QUICK STATS */}
        <div
          className="
            grid grid-cols-3
            gap-2
            px-4 pb-4
          "
        >
          <QuickStat
            icon={<Trophy className="w-4 h-4" />}
            label="Equipes"
            value={String(teams?.length ?? 0)}
          />

          <QuickStat
            icon={<CalendarDays className="w-4 h-4" />}
            label="Rodadas"
            value={String(eventConfig?.config?.rodadas?.length ?? 0)}
          />

          <QuickStat
            icon={<Radio className="w-4 h-4" />}
            label="Status"
            value="Ativo"
          />
        </div>
      </header>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          aria-label="Fechar menu"
          onClick={() => setSidebarOpen(false)}
          className="
            fixed inset-0 z-40
            bg-black/60
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      {/* SIDEBAR */}
      <Sidebar
        code_volunteer={eventData?.code_volunteer ?? ""}
        code_visitor={eventData?.code_visit ?? ""}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        currentSection={section}
        onNavigate={handleNavigate}
        eventId={idEvent}
      />

      {/* PAGE */}
      <div
        className="
          lg:ml-72
          min-h-screen
          transition-all duration-300
        "
      >
        {/* DESKTOP HEADER */}
        <div
          className="
            hidden lg:flex
            sticky top-0 z-30
            h-20
            border-b border-base-300
            bg-base-100/80
            backdrop-blur-xl
            items-center justify-between
            px-8
          "
        >
          <div>
            <h1 className="text-xl font-bold">{eventData?.name_event}</h1>

            <p className="text-sm text-base-content/50">
              Painel administrativo do evento
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DesktopBadge label="Equipes" value={String(teams?.length ?? 0)} />

            <DesktopBadge
              label="Rodadas"
              value={String(eventConfig?.config?.rodadas?.length ?? 0)}
            />

            <DesktopBadge label="Status" value="Ativo" />
          </div>
        </div>

        {/* CONTENT */}
        <main
          className="
            w-full
            px-3 sm:px-4 md:px-6 lg:px-8
            py-4 md:py-6
          "
        >
          <Suspense fallback={<SectionLoader />}>{content}</Suspense>
        </main>
      </div>
    </div>
  );
}

interface QuickStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function QuickStat({ icon, label, value }: QuickStatProps) {
  return (
    <div
      className="
        rounded-2xl
        border border-base-300
        bg-base-100
        px-3 py-2
      "
    >
      <div
        className="
          flex items-center gap-2
          text-base-content/50
          text-xs
        "
      >
        {icon}

        <span>{label}</span>
      </div>

      <p className="font-bold mt-1">{value}</p>
    </div>
  );
}

interface DesktopBadgeProps {
  label: string;
  value: string;
}

function DesktopBadge({ label, value }: DesktopBadgeProps) {
  return (
    <div
      className="
        rounded-2xl
        border border-base-300
        bg-base-100
        px-4 py-2
        min-w-[110px]
      "
    >
      <p className="text-xs text-base-content/50">{label}</p>

      <p className="font-bold">{value}</p>
    </div>
  );
}
