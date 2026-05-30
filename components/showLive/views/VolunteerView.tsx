"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

import { ClipboardCheck, LogOut, Trophy, Swords } from "lucide-react";

import AvaliacaoRounds from "../RoundSubmission";
import AvaliacaoPlayOffs from "../volunteer/AvaliacaoPlayOffs";
import TabelaEquipes from "../TabelaEquipes";
import Loader from "@/components/Loader";

interface Props {
  event: any;
}

interface EventSettings {
  enable_playoffs: boolean;
  show_brackets: boolean;
  auto_semifinals: boolean;
}

type TabType = "avaliacao" | "ranking" | "playoffs";

export default function VolunteerView({ event }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("avaliacao");

  const [settings, setSettings] = useState<EventSettings | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("event_settings")
          .select(
            `
              enable_playoffs,
              show_brackets,
              auto_semifinals
            `,
          )
          .eq("id_evento", event.id_evento)
          .maybeSingle();

        if (error) {
          console.error("Erro ao carregar configurações:", error);
          return;
        }

        setSettings(
          data || {
            enable_playoffs: false,
            show_brackets: false,
            auto_semifinals: false,
          },
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [event.id_evento]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <Loader />
      </div>
    );
  }

  const playoffsEnabled = settings?.enable_playoffs;

  return (
    <div className="min-h-screen bg-base-200">
      {/* HEADER */}
      <div className="navbar bg-base-100 border-b border-base-300 px-4 md:px-8 sticky top-0 z-50 backdrop-blur">
        <div className="flex-1">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {event.name_event}
            </h1>

            <p className="text-sm opacity-70 mt-1">Painel do voluntário</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/" className="btn btn-outline gap-2">
            <LogOut className="w-4 h-4" />
            Sair
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* STATUS PLAYOFFS */}
        {playoffsEnabled && (
          <div className="alert border border-warning/30 bg-warning/10 mb-6">
            <Swords className="w-5 h-5" />

            <div>
              <h3 className="font-bold">Sistema de Playoffs ativo</h3>

              <div className="text-xs opacity-80">
                {settings?.auto_semifinals
                  ? "Modo semifinal + final habilitado."
                  : "Modo final direta habilitado."}
              </div>
            </div>
          </div>
        )}

        {/* TABS */}
        <div
          role="tablist"
          className="tabs tabs-boxed bg-base-100 w-fit mb-6 shadow-sm border border-base-300"
        >
          <button
            role="tab"
            onClick={() => setActiveTab("avaliacao")}
            className={`tab gap-2 ${
              activeTab === "avaliacao" ? "tab-active" : ""
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            Avaliação
          </button>

          {playoffsEnabled && (
            <button
              role="tab"
              onClick={() => setActiveTab("playoffs")}
              className={`tab gap-2 ${
                activeTab === "playoffs" ? "tab-active" : ""
              }`}
            >
              <Swords className="w-4 h-4" />
              Playoffs
            </button>
          )}

          <button
            role="tab"
            onClick={() => setActiveTab("ranking")}
            className={`tab gap-2 ${
              activeTab === "ranking" ? "tab-active" : ""
            }`}
          >
            <Trophy className="w-4 h-4" />
            Ranking
          </button>
        </div>

        {/* ABA AVALIAÇÃO */}
        {activeTab === "avaliacao" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="w-full col-span-3">
              <div className="card bg-base-100 shadow-md border border-base-300">
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-2">
                    <ClipboardCheck className="w-6 h-6 text-primary" />

                    <h2 className="card-title text-2xl">Lançar pontuação</h2>
                  </div>

                  <p className="text-sm opacity-70 mb-4">
                    Selecione a equipe e o round para registrar a avaliação.
                  </p>

                  <AvaliacaoRounds idEvento={String(event.id_evento)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA PLAYOFFS */}
        {activeTab === "playoffs" && playoffsEnabled && (
          <div className="card bg-base-100 shadow-md border border-base-300">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4">
                <Swords className="w-6 h-6 text-error" />

                <div>
                  <h2 className="card-title text-2xl">
                    Avaliação dos Playoffs
                  </h2>

                  <p className="text-sm opacity-70">
                    Gerencie semifinais e finais do evento.
                  </p>
                </div>
              </div>

              <AvaliacaoPlayOffs idEvento={event.id_evento} />
            </div>
          </div>
        )}

        {/* ABA RANKING */}
        {activeTab === "ranking" && (
          <div className="card bg-base-100 shadow-md border border-base-300">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6 text-warning" />

                <div>
                  <h2 className="card-title text-2xl">Ranking ao vivo</h2>

                  <p className="text-sm opacity-70">
                    Acompanhe a classificação das equipes em tempo real.
                  </p>
                </div>
              </div>

              <TabelaEquipes
                idEvent={String(event.id_evento)}
                primaryColor="#ffffff"
                secondaryColor="#570df8"
                textColor="#ffffff"
                backgroundUrl=""
                backgroundBlur={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
