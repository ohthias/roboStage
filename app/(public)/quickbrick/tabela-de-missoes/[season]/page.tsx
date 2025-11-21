"use client";
import React, { useState, useEffect } from "react";
import { Column, Mission, ViewMode } from "@/types/TableAnalytics";
import { INITIAL_COLUMNS, INITIAL_MISSIONS } from "./constants";
import { ImageDown, Table as TableIcon, RotateCcw } from "lucide-react";
import { MissionTable } from "@/components/QuickBrick/Tabela-de-analise-de-missoes/MissionTable";
import { Analytics } from "@/components/QuickBrick/Tabela-de-analise-de-missoes/Analytics";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/ui/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { useToast } from "@/app/context/ToastContext";
import Loader from "@/components/loader";

function MissionTablePage() {
  const params = useParams();
  const selectedSeason =
    typeof params?.season === "string"
      ? params.season
      : Array.isArray(params?.season)
      ? params.season[0] || ""
      : "";

  const season = selectedSeason || "unearthed"; // Default season
  const [missions, setMissions] = useState<Mission[] | null>(null);
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);

  const [viewMode, setViewMode] = useState(ViewMode.TABLE);
  const { addToast } = useToast();

  // Carrega missões baseado na season
  useEffect(() => {
    async function load() {
      // 1. Verifica localStorage
      const saved = localStorage.getItem(`fll_missions_${season}`);
      if (saved) {
        setMissions(JSON.parse(saved));
        return;
      }

      const res = await fetch(`/api/data/missions`);
      const data = await res.json();
      const seasonData = data?.[season] || INITIAL_MISSIONS;

      const filteredMissions = seasonData.filter((mission: any) => {
        return mission.id && mission.id !== "GP" && mission.id !== "PT";
      });

      setMissions(filteredMissions);

      console.log("Missões carregadas da API para a season:", filteredMissions);
    }

    load();
  }, [season]);

  // Salva no localStorage
  useEffect(() => {
    if (missions) {
      localStorage.setItem(`fll_missions_${season}`, JSON.stringify(missions));
    }
  }, [missions, season]);

  const handleReset = async () => {
    if (!confirm("Restaurar valores padrão?")) return;

    const res = await fetch(`/api/data/missions/`);
    const data = await res.json();
    const seasonData = data?.[season] || INITIAL_MISSIONS;

    const filteredMissions = seasonData.filter((mission: any) => {
      return mission.id && mission.id !== "GP" && mission.id !== "PT";
    });
    setMissions(filteredMissions);
    localStorage.removeItem(`fll_missions_${season}`);
    addToast("Dados restaurados!", "success");
  };

  // Enquanto as missões carregam
  if (!missions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <Breadcrumbs />
      <section className="w-full flex flex-col items-center text-center px-4 py-8">
        <article className="max-w-3xl">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Tabela de Missões
          </h1>
          <p className="text-base-content/75 text-lg leading-relaxed">
            Analise as missões da temporada {season.toUpperCase()} usando esta
            tabela interativa. Avalie pontos, dificuldades e status de cada
            missão para otimizar o desempenho do seu robô.
          </p>
        </article>
      </section>
      <header className="sticky top-0 z-30 bg-base-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">
              Tabela de Missões - {season.toUpperCase()}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="btn-group">
              <button
                onClick={() => setViewMode(ViewMode.TABLE)}
                className={`btn btn-sm gap-2 ${
                  viewMode === ViewMode.TABLE ? "btn-primary" : "btn-ghost"
                }`}
                aria-pressed={viewMode === ViewMode.TABLE}
              >
                <TableIcon size={16} />
                <span>Tabela</span>
              </button>
            </div>

            <button
              onClick={handleReset}
              className="btn btn-sm btn-ghost tooltip tooltip-bottom text-error"
              title="Resetar Dados"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        <div className="flex-1 min-h-0">
          <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
              {viewMode === ViewMode.TABLE ? (
                <MissionTable
                  missions={missions}
                  setMissions={setMissions}
                  columns={columns}
                  setColumns={setColumns}
                  season={season}
                />
              ) : (
                <Analytics missions={missions} columns={columns} />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default MissionTablePage;
