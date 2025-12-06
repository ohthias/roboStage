"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

interface NavigationBarProps {
  code_volunteer: string;
  code_visitor: string;
  open: boolean;
  setOpen: (value: boolean) => void;
  eventId: number;
}

export default function Sidebar({
  code_volunteer,
  code_visitor,
  open,
  setOpen,
  eventId,
}: NavigationBarProps) {
  const router = useRouter();
  const [settings, setSettings] = useState({
    enable_playoffs: false,
    pre_round_inspection: false,
    advanced_view: false,
  });

  // Função para carregar os settings iniciais
  const loadSettings = async () => {
    const { data, error } = await supabase
      .from("event_settings")
      .select("enable_playoffs, pre_round_inspection, advanced_view")
      .eq("id_evento", eventId)
      .maybeSingle();

    if (data) {
      setSettings({
        enable_playoffs: data.enable_playoffs,
        pre_round_inspection: data.pre_round_inspection,
        advanced_view: data.advanced_view,
      });
    } else if (error) {
      console.error(error);
    }
  };

  // Carregar settings inicialmente
  useEffect(() => {
    loadSettings();
  }, [eventId]);

  // Configurar Supabase Realtime para atualizar a sidebar em tempo real
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadSettings();
    }, 5000); // Poll every 5 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [eventId]);

  return (
    <>
      <div className="py-3 px-2 flex justify-start items-center bg-base-200 border-b border-base-300 rounded-lg">
        <button
          aria-label="Abrir menu"
          aria-expanded={open}
          aria-controls="rs-offcanvas"
          className="btn btn-square btn-ghost"
          onClick={() => setOpen(true)}
        >
          <svg
            className="w-6 h-6"
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
        <div className="text-2xl font-bold text-base-content ml-4">
          Show<span className="text-primary">Live</span>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-base-200/50 z-40 lg:hidden"
          style={{ backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)}
        ></div>
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-72 z-50
          bg-base-200 shadow-xl border-r border-base-300
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0
        `}
      >
        <div className="p-4 border-b border-base-300 flex justify-between items-center">
          <h3 className="font-bold text-lg">
            Show<span className="text-primary">Live</span>
          </h3>
          <button
            className="btn btn-sm btn-circle btn-ghost lg:hidden"
            onClick={() => setOpen(false)}
            style={{ lineHeight: 0 }}
          >
            <i className="fi fi-br-cross"></i>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="mb-2">
            <p className="menu-title">Códigos</p>
            <div className="bg-base-100 p-3 rounded-box flex justify-between items-center mb-2">
              <span className="text-xs text-base-content">Voluntário</span>
              <span className="badge badge-ghost">{code_volunteer}</span>
            </div>
            <div className="bg-base-100 p-3 rounded-box flex justify-between items-center">
              <span className="text-xs text-base-content">Visitante</span>
              <span className="badge badge-ghost">{code_visitor}</span>
            </div>
          </div>

          <ul className="menu gap-1 w-full">
            <li>
              <a href="#" className="btn btn-ghost justify-start">
                <i className="fi fi-rr-apps mr-2" />
                Geral
              </a>
            </li>
            <li>
              <a href="#equipes" className="btn btn-ghost justify-start">
                <i className="fi fi-rr-employees-woman-man mr-2" />
                Equipes
              </a>
            </li>
            <li>
              <a href="#ranking" className="btn btn-ghost justify-start">
                <i className="fi fi-rr-ranking-star mr-2" />
                Ranking
              </a>
            </li>
            <li>
              <a href="#visualizacao" className="btn btn-ghost justify-start">
                <i className="fi fi-rr-eye mr-2" />
                Visualização
              </a>
            </li>

            <hr className="my-2 border border-base-300" />
            <li>
              {" "}
              <a
                href="#gracious-professionalism"
                className="btn btn-ghost justify-start"
              >
                {" "}
                Gracious Professionalism{" "}
              </a>{" "}
            </li>
            {/* Itens dinâmicos */}
            {settings.enable_playoffs && (
              <li>
                <a href="#brackets" className="btn btn-ghost justify-start">
                  Brackets
                </a>
              </li>
            )}
            {settings.pre_round_inspection && (
              <li>
                <a
                  href="#pre-round-inspection"
                  className="btn btn-ghost justify-start"
                >
                  Inspeção Pré-Rodada
                </a>
              </li>
            )}
            {settings.advanced_view && (
              <li>
                <a
                  href="#advanced-view"
                  className="btn btn-ghost justify-start"
                >
                  Visualização Avançada
                </a>
              </li>
            )}

            <hr className="my-2 border border-base-300" />

            <li>
              <a href="#personalizacao" className="btn btn-ghost justify-start">
                <i className="fi fi-rr-customize-edit mr-2" />
                Personalização
              </a>
            </li>
            <li>
              <a href="#configuracoes" className="btn btn-ghost justify-start">
                <i className="fi fi-rr-settings mr-2" />
                Configurações
              </a>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-base-300">
          <button
            className="btn btn-outline btn-error btn-sm w-full"
            onClick={() => router.push("/dashboard#showLive")}
          >
            Voltar ao Hub
          </button>
        </div>
      </aside>
    </>
  );
}
