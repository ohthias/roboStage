"use client";
import React, { useState, useEffect, useRef } from "react";
import { Column, Mission } from "@/types/TableAnalytics";
import { INITIAL_COLUMNS, INITIAL_MISSIONS } from "./constants";
import { RotateCcw } from "lucide-react";
import { MissionTable } from "@/components/QuickBrick/Tabela-de-analise-de-missoes/MissionTable";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/UI/Navbar";
import { Footer } from "@/components/UI/Footer";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import { useToast } from "@/app/context/ToastContext";
import Loader from "@/components/Loader";
import ModalConfirm, {
  ModalConfirmRef,
} from "@/components/UI/Modal/ModalConfirm";

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
  const modalClearAll = useRef<ModalConfirmRef>(null);

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
    modalClearAll.current?.open(
      "Tem certeza que deseja restaurar os dados da tabela? Isso irá apagar todas as suas alterações.",
      async () => {
        const res = await fetch(`/api/data/missions/`);
        const data = await res.json();
        const seasonData = data?.[season] || INITIAL_MISSIONS;

        const filteredMissions = seasonData.filter((mission: any) => {
          return mission.id && mission.id !== "GP" && mission.id !== "PT";
        });
        setMissions(filteredMissions);
        setColumns(INITIAL_COLUMNS);
        localStorage.removeItem(`fll_missions_${season}`);
        addToast("Dados restaurados!", "success");
      }
    );
  };

  // Enquanto as missões carregam
  if (!missions) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-30 flex justify-center items-center z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <div className="px-4 md:px-8 space-y-4">
        <Breadcrumbs />
        <section className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
            Tabela de Missões - Temporada {season.toUpperCase()}
          </h1>
          <p className="text-base md:text-lg text-base-content/80 max-w-3xl leading-relaxed">
            Documente e analise as missões da temporada {season.toUpperCase()}.
            Utilize a tabela para registrar detalhes, pontuações e estratégias.
            Ou crie novas colunas e análises personalizadas para atender às suas
            necessidades.
          </p>
        </section>

        <MissionTable
          missions={missions}
          setMissions={setMissions}
          columns={columns}
          setColumns={setColumns}
          season={season}
        />

        <div className="flex items-center gap-2 justify-end mb-12">
          <button
            onClick={handleReset}
            className="btn btn-sm btn-soft btn-warning"
            title="Resetar Dados"
          >
            <RotateCcw size={18} />
            Limpar
          </button>
        </div>
      </div>
      <Footer />
      <ModalConfirm
        ref={modalClearAll}
        title="Restaurar tabela"
        confirmLabel="Sim"
        cancelLabel="Cancelar"
      />
    </div>
  );
}

export default MissionTablePage;
