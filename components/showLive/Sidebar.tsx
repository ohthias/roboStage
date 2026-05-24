"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { eventService } from "@/services/event.service";
import { useEvent } from "@/hooks/useEvent";

interface SidebarProps {
  code_volunteer: string;
  code_visitor: string;

  open: boolean;
  setOpen: (value: boolean) => void;

  eventId: number;

  currentSection: string;
  onNavigate: (section: string) => void;
}

interface EventSettings {
  enable_playoffs: boolean;
  pre_round_inspection: boolean;
  advanced_view: boolean;
}

const NAV_ITEMS = [
  {
    key: "",
    label: "Geral",
    icon: "fi-rr-apps",
    group: "principal",
  },

  {
    key: "equipes",
    label: "Equipes",
    icon: "fi-rr-employees-woman-man",
    group: "principal",
  },

  {
    key: "ranking",
    label: "Ranking",
    icon: "fi-rr-ranking-star",
    group: "principal",
  },

  {
    key: "visualizacao",
    label: "Visualização",
    icon: "fi-rr-eye",
    group: "principal",
  },

  {
    key: "gracious-professionalism",
    label: "Gracious Professionalism",
    icon: "fi-rr-star",
    group: "competicao",
  },

  {
    key: "personalizacao",
    label: "Personalização",
    icon: "fi-rr-customize-edit",
    group: "config",
  },

  {
    key: "configuracoes",
    label: "Configurações",
    icon: "fi-rr-settings",
    group: "config",
  },
] as const;

const DYNAMIC_ITEMS = [
  {
    key: "brackets",
    label: "Brackets",
    icon: "fi-rr-brackets",
    setting: "enable_playoffs",
  },

  {
    key: "pre-round-inspection",
    label: "Inspeção Pré-Rodada",
    icon: "fi-rr-clipboard-list-check",
    setting: "pre_round_inspection",
  },

  {
    key: "advanced-view",
    label: "Visualização Avançada",
    icon: "fi-rr-layers",
    setting: "advanced_view",
  },
] as const;

export default function Sidebar({
  code_volunteer,
  code_visitor,
  open,
  setOpen,
  eventId,
  currentSection,
  onNavigate,
}: SidebarProps) {
  const router = useRouter();

  const [settings, setSettings] = useState<EventSettings>({
    enable_playoffs: false,
    pre_round_inspection: false,
    advanced_view: false,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    const loadSettings = async () => {
      try {
        setLoading(true);

        const data = await eventService.getEventSettings(eventId);

        if (data) {
          setSettings({
            enable_playoffs: data.enable_playoffs,
            pre_round_inspection: data.pre_round_inspection,
            advanced_view: data.advanced_view,
          });
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [eventId]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(true);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [setOpen]);

  const handleNavigate = (section: string) => {
    onNavigate(section);

    if (window.innerWidth < 1024) {
      setOpen(false);
    }
  };

  const dynamicItems = useMemo(() => {
    return DYNAMIC_ITEMS.filter(
      (item) => settings[item.setting as keyof EventSettings],
    );
  }, [settings]);

  const principalItems = NAV_ITEMS.filter((item) => item.group === "principal");

  const competitionItems = NAV_ITEMS.filter(
    (item) => item.group === "competicao",
  );

  const configItems = NAV_ITEMS.filter((item) => item.group === "config");

  return (
    <>
      {/* MOBILE HEADER */}
      <header
        className="
          fixed top-0 left-0 right-0 z-40
          h-14
          flex items-center justify-between
          px-4
          border-b border-base-300
          bg-base-100/90 backdrop-blur
          lg:hidden
        "
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="
              btn btn-sm btn-square btn-ghost
            "
            aria-label="Abrir menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <h1 className="font-bold text-lg">
            Show
            <span className="text-primary">Live</span>
          </h1>
        </div>

        <button
          onClick={() => router.push("/dashboard#showLive")}
          className="btn btn-ghost btn-sm"
        >
          Voltar
        </button>
      </header>

      {/* BACKDROP */}
      <div
        onClick={() => setOpen(false)}
        className={`
          fixed inset-0 z-40
          bg-black/50 backdrop-blur-sm
          transition-opacity duration-300
          lg:hidden

          ${
            open
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
      />

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-[280px]
          bg-base-200
          border-r border-base-300
          flex flex-col

          transition-transform duration-300 ease-out

          ${open ? "translate-x-0" : "-translate-x-full"}

          lg:translate-x-0
        `}
      >
        {/* HEADER */}
        <div
          className="
            h-16 shrink-0
            px-5
            border-b border-base-300
            flex items-center justify-between
          "
        >
          <div>
            <h2 className="font-bold text-lg">
              Show
              <span className="text-primary">Live</span>
            </h2>

            <p className="text-xs text-base-content/50">Painel do evento</p>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="
              btn btn-sm btn-circle btn-ghost
              lg:hidden
            "
          >
            ✕
          </button>
        </div>

        {/* ACCESS CODES */}
        <div className="p-4 space-y-3">
          <AccessCard label="Voluntário" value={code_volunteer} />

          <AccessCard label="Visitante" value={code_visitor} />
        </div>

        {/* NAVIGATION */}
        <nav
          className="
            flex-1 overflow-y-auto
            px-3 pb-4
            space-y-5
          "
        >
          <SidebarGroup title="Principal">
            {principalItems.map((item) => (
              <NavButton
                key={item.key}
                item={item}
                active={currentSection === item.key}
                onClick={() => handleNavigate(item.key)}
              />
            ))}
          </SidebarGroup>

          <SidebarGroup title="Competição">
            {competitionItems.map((item) => (
              <NavButton
                key={item.key}
                item={item}
                active={currentSection === item.key}
                onClick={() => handleNavigate(item.key)}
              />
            ))}

            {dynamicItems.map((item) => (
              <NavButton
                key={item.key}
                item={item}
                active={currentSection === item.key}
                onClick={() => handleNavigate(item.key)}
              />
            ))}
          </SidebarGroup>

          <SidebarGroup title="Configurações">
            {configItems.map((item) => (
              <NavButton
                key={item.key}
                item={item}
                active={currentSection === item.key}
                onClick={() => handleNavigate(item.key)}
              />
            ))}
          </SidebarGroup>
        </nav>

        {/* FOOTER */}
        <div
          className="
            p-4
            border-t border-base-300
            bg-base-200/80 backdrop-blur
          "
        >
          <button
            onClick={() => router.push("/dashboard/showLive")}
            className="
              btn btn-outline btn-error
              w-full rounded-xl
              gap-2
            "
          >
            <i className="fi fi-rr-arrow-left" />
            Voltar ao Hub
          </button>
        </div>
      </aside>
    </>
  );
}

interface SidebarGroupProps {
  title: string;
  children: React.ReactNode;
}

function SidebarGroup({ title, children }: SidebarGroupProps) {
  return (
    <section className="space-y-2">
      <div className="px-2">
        <span
          className="
            text-[11px]
            uppercase tracking-wider
            text-base-content/40
            font-semibold
          "
        >
          {title}
        </span>
      </div>

      <div className="space-y-1">{children}</div>
    </section>
  );
}

interface AccessCardProps {
  label: string;
  value: string;
}

function AccessCard({ label, value }: AccessCardProps) {
  return (
    <div
      className="
        rounded-2xl
        border border-base-300
        bg-base-100
        px-4 py-3
      "
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-base-content/50">{label}</span>

        <span
          className="
            badge badge-outline
            font-mono
          "
        >
          {value || "----"}
        </span>
      </div>
    </div>
  );
}

interface NavButtonProps {
  item: {
    key: string;
    label: string;
    icon: string;
  };

  active: boolean;

  onClick: () => void;
}

function NavButton({ item, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`
        w-full
        flex items-center gap-3
        py-2 px-4
        rounded-2xl
        text-sm font-medium
        transition-all duration-200

        ${
          active
            ? `
              bg-primary text-primary-content
              shadow-sm
            `
            : `
              hover:bg-base-300
              text-base-content/70
              hover:text-base-content
            `
        }
      `}
    >
      <i className={`fi ${item.icon} text-base`} />

      <span className="truncate">{item.label}</span>
    </button>
  );
}
