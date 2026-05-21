"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

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
  { key: "", label: "Geral", icon: "fi-rr-apps", group: "principal" },
  { key: "equipes", label: "Equipes", icon: "fi-rr-employees-woman-man", group: "principal" },
  { key: "ranking", label: "Ranking", icon: "fi-rr-ranking-star", group: "principal" },
  { key: "visualizacao", label: "Visualização", icon: "fi-rr-eye", group: "principal" },
  { key: "gracious-professionalism", label: "Gracious Professionalism", icon: "fi-rr-star", group: "competicao" },
  { key: "personalizacao", label: "Personalização", icon: "fi-rr-customize-edit", group: "config" },
  { key: "configuracoes", label: "Configurações", icon: "fi-rr-settings", group: "config" },
] as const;

const DYNAMIC_ITEMS = [
  { key: "brackets", label: "Brackets", icon: "fi-rr-brackets", setting: "enable_playoffs" },
  { key: "pre-round-inspection", label: "Inspeção Pré-Rodada", icon: "fi-rr-clipboard-list-check", setting: "pre_round_inspection" },
  { key: "advanced-view", label: "Visualização Avançada", icon: "fi-rr-layers", setting: "advanced_view" },
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

  const loadSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from("event_settings")
      .select("enable_playoffs, pre_round_inspection, advanced_view")
      .eq("id_evento", eventId)
      .maybeSingle();

    if (data) setSettings(data);
    else if (error) console.error("Error loading settings:", error);
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;
    loadSettings();
    const interval = setInterval(loadSettings, 5000);
    return () => clearInterval(interval);
  }, [loadSettings, eventId]);

  const handleNav = (key: string) => {
    onNavigate(key);
    setOpen(false);
  };

  const allDynamicItems = DYNAMIC_ITEMS.filter(
    (item) => settings[item.setting as keyof EventSettings]
  );

  return (
    <>
      {/* Mobile topbar trigger */}
      <div className="py-3 px-3 flex items-center gap-3 bg-base-200 border-b border-base-300 lg:hidden">
        <button
          aria-label="Abrir menu"
          aria-expanded={open}
          className="btn btn-square btn-ghost btn-sm"
          onClick={() => setOpen(true)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-xl font-bold">
          Show<span className="text-primary">Live</span>
        </span>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-50 flex flex-col
          bg-base-200 border-r border-base-300
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="px-4 py-4 border-b border-base-300 flex items-center justify-between">
          <span className="text-lg font-bold">
            Show<span className="text-primary">Live</span>
          </span>
          <button
            className="btn btn-sm btn-circle btn-ghost lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          >
            <i className="fi fi-br-cross text-xs" />
          </button>
        </div>

        {/* Access codes */}
        <div className="px-3 pt-3 flex flex-col gap-2">
          {[
            { label: "Voluntário", value: code_volunteer },
            { label: "Visitante", value: code_visitor },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between bg-base-100 rounded-lg px-3 py-2 border border-base-300"
            >
              <span className="text-xs text-base-content/60">{label}</span>
              <span className="badge badge-ghost font-mono text-xs">{value}</span>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
          {/* Main group */}
          {NAV_ITEMS.filter((i) => i.group === "principal").map((item) => (
            <NavButton
              key={item.key}
              item={item}
              active={currentSection === item.key}
              onClick={() => handleNav(item.key)}
            />
          ))}

          <div className="my-1.5 border-t border-base-300" />

          {/* Competition group */}
          {NAV_ITEMS.filter((i) => i.group === "competicao").map((item) => (
            <NavButton
              key={item.key}
              item={item}
              active={currentSection === item.key}
              onClick={() => handleNav(item.key)}
            />
          ))}
          {allDynamicItems.map((item) => (
            <NavButton
              key={item.key}
              item={item}
              active={currentSection === item.key}
              onClick={() => handleNav(item.key)}
            />
          ))}

          <div className="my-1.5 border-t border-base-300" />

          {/* Config group */}
          {NAV_ITEMS.filter((i) => i.group === "config").map((item) => (
            <NavButton
              key={item.key}
              item={item}
              active={currentSection === item.key}
              onClick={() => handleNav(item.key)}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-base-300">
          <button
            className="btn btn-outline btn-error btn-sm w-full gap-2"
            onClick={() => router.push("/dashboard#showLive")}
          >
            <i className="fi fi-rr-arrow-left" />
            Voltar ao Hub
          </button>
        </div>
      </aside>
    </>
  );
}

interface NavButtonProps {
  item: { key: string; label: string; icon: string };
  active: boolean;
  onClick: () => void;
}

function NavButton({ item, active, onClick }: NavButtonProps) {
  return (
    <button
      className={`
        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
        transition-colors duration-150 text-left
        ${active
          ? "bg-primary/10 text-primary"
          : "text-base-content/70 hover:bg-base-300 hover:text-base-content"
        }
      `}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
    >
      <i className={`fi ${item.icon} text-base leading-none`} aria-hidden="true" />
      {item.label}
    </button>
  );
}