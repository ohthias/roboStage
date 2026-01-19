"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { LogOut } from "lucide-react";

type VolunteerTab = "hub" | "avalia" | "playoffs";

interface EventSettings {
  enable_playoffs: boolean;
}

interface Props {
  eventId: number;
  activeTab: VolunteerTab;
  onTabChange: (tab: VolunteerTab) => void;
}

export function NavigationBar({ eventId, activeTab, onTabChange }: Props) {
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!eventId) return;

    const fetchSettings = async () => {
      const { data } = await supabase
        .from("event_settings")
        .select("enable_playoffs")
        .eq("id_evento", eventId)
        .single();

      setSettings(data);
    };

    fetchSettings();
  }, [eventId]);

  const showPlayoffs = settings?.enable_playoffs ?? false;

  const handleLogout = () => {
    sessionStorage.removeItem("event_access");
    document.cookie =
      "event_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/universe");
  };

  return (
    <>
      <nav className="sticky top-4 z-50 max-w-7xl mx-auto">
        <div className="bg-base-100/70 backdrop-blur-xl border border-base-300 rounded-2xl px-6 py-4 shadow-md flex items-center justify-between text-base-content">
          <div className="flex items-end gap-3">
            <h1 className="font-black uppercase italic tracking-tight text-2xl">
              Show<span className="text-primary">Live</span>
            </h1>
            <span className="text-sm font-medium opacity-70">Voluntário</span>
          </div>

          {/* Tabs Desktop */}
          <div
            role="tablist"
            aria-label="Seções do voluntário"
            className="hidden md:flex gap-2 bg-base-200/60 rounded-full p-1"
          >
            <Tab
              label="Hub"
              active={activeTab === "hub"}
              onClick={() => onTabChange("hub")}
            />
            <Tab
              label="Avaliar"
              active={activeTab === "avalia"}
              onClick={() => onTabChange("avalia")}
            />
            {showPlayoffs && (
              <Tab
                label="Playoffs"
                active={activeTab === "playoffs"}
                onClick={() => onTabChange("playoffs")}
              />
            )}
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-sm btn-error btn-outline"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </nav>
      {/* Bottom Navigation – Mobile */}
      <div
        role="tablist"
        aria-label="Navegação inferior do voluntário"
        className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50
             bg-base-100/80 backdrop-blur-xl border border-base-300
             rounded-full shadow-lg px-2 py-2 flex gap-1"
      >
        <MobileTab
          label="Hub"
          active={activeTab === "hub"}
          onClick={() => onTabChange("hub")}
        />

        <MobileTab
          label="Avaliar"
          active={activeTab === "avalia"}
          onClick={() => onTabChange("avalia")}
        />

        {showPlayoffs && (
          <MobileTab
            label="Playoffs"
            active={activeTab === "playoffs"}
            onClick={() => onTabChange("playoffs")}
          />
        )}
      </div>
    </>
  );
}

function MobileTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex flex-col items-center justify-center
        px-4 py-2 rounded-full text-xs font-medium transition-all
        ${active
          ? "bg-primary text-primary-content shadow"
          : "opacity-70 hover:opacity-100"
        }`}
    >
      {label}
    </button>
  );
}

function Tab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300
        ${
          active
            ? "bg-primary text-primary-content shadow"
            : "hover:bg-base-300"
        }`}
    >
      {label}
    </button>
  );
}
