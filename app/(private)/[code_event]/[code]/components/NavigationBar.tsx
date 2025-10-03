"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";

interface EventSettings {
  enable_playoffs: boolean;
}

export function NavigationBar({eventId} : {eventId: number}) {
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const router = useRouter();

  useEffect(() => {
      if (!eventId) return;

      const fetchSettings = async () => {
        const { data, error } = await supabase
          .from("event_settings")
          .select("enable_playoffs")
          .eq("id_evento", eventId)
          .single();
        console.log("Configurações carregadas:", data, error);

        if (error) {
          console.error("Erro ao buscar configurações:", error);
          return;
        }

        setSettings(data);
      };

      fetchSettings();
  }, [eventId]);

  const handleLogout = async () => {
    sessionStorage.removeItem("event_access");
    document.cookie =
      "event_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/universe");
  };

  const showPlayoffsButton = settings?.enable_playoffs ?? false;

  return (
    <nav className="navbar bg-base-200 border-b border-base-300 rounded-lg px-4">
      {/* Esquerda */}
      <div className="navbar-start">
        <div className="flex items-end">
          <h5 className="text-2xl font-bold text-base-content ml-2">
            Show<span className="text-primary">Live</span>
          </h5>
          <p className="text-md font-bold text-base-content ml-3 hidden sm:block">
            Voluntário
          </p>
        </div>
      </div>

      {/* Direita */}
      <div className="navbar-end">
        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <a href="#" className="btn btn-default">
            Hub
          </a>

          <a href="#avalia" className="btn btn-primary">
              Avaliar
            </a>

          {showPlayoffsButton && (
            <a href="#playoffs" className="btn btn-default">
              Playoffs
            </a>
          )}

          <button onClick={handleLogout} className="btn btn-error">
            <i className="fi fi-br-sign-out-alt"></i> Sair
          </button>
        </div>

        {/* Menu Mobile */}
        <div className="dropdown dropdown-end md:hidden">
          <label tabIndex={0} className="btn btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52 space-y-2"
          >
            <li>
              <a href="#" className="text-lg">
                Hub
              </a>
            </li>

            <li>
              <a href="#avalia" className="text-lg">
                Avaliar
              </a>
            </li>

            {showPlayoffsButton && (
              <li>
                <a href="#playoffs" className="text-lg">
                  Playoffs
                </a>
              </li>
            )}

            <li>
              <button
                onClick={handleLogout}
                className="text-error flex gap-2 text-lg"
              >
                <i className="fi fi-br-sign-out-alt"></i> Sair
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}