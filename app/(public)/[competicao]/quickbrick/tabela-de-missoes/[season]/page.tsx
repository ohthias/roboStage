"use client";
import { useState, useEffect, useRef } from "react";
import { Column, Mission } from "@/types/TableAnalytics";
import { INITIAL_COLUMNS, INITIAL_MISSIONS } from "./constants";
import { RotateCcw, Table } from "lucide-react";
import { MissionTable } from "@/components/QuickBrick/Tabela-de-analise-de-missoes/MissionTable";
import { useParams } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import Loader from "@/components/Loader";
import ModalConfirm, {
  ModalConfirmRef,
} from "@/components/UI/Modal/ModalConfirm";
import HeaderTool from "@/components/QuickBrick/HeaderTool";
import { missionsFromRaw, RawMission } from "@/utils/quickbrick/scoring";

const MISSIONS_ENDPOINT = "/api/data/missions";

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

  // Loads missions for the current season, preferring anything the user
  // already edited (localStorage) over the pristine season dataset.
  useEffect(() => {
    let cancelled = false;

    // Reset to the loading state immediately so we never flash the
    // previous season's table while the new one is being fetched.
    setMissions(null);

    async function load() {
      try {
        const saved = localStorage.getItem(`fll_missions_${season}`);
        if (saved) {
          const parsed = JSON.parse(saved) as Mission[];
          if (!cancelled) setMissions(parsed);
          return;
        }

        const res = await fetch(MISSIONS_ENDPOINT);
        if (!res.ok) throw new Error(`Falha ao buscar missões (${res.status})`);
        const data = await res.json();
        const seasonData: RawMission[] = (data?.[season] || []).filter(
          (mission: RawMission) => mission.id?.includes("M")
        );

        const built =
          seasonData.length > 0 ? missionsFromRaw(seasonData) : INITIAL_MISSIONS;

        if (!cancelled) setMissions(built);
      } catch (err) {
        console.error("Erro ao carregar missões:", err);
        if (!cancelled) {
          setMissions(INITIAL_MISSIONS);
          addToast("Não foi possível carregar as missões dessa temporada.", "error");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season]);

  // Persist whenever missions actually change (but not on the initial null state)
  useEffect(() => {
    if (missions) {
      localStorage.setItem(`fll_missions_${season}`, JSON.stringify(missions));
    }
  }, [missions, season]);

  const handleReset = () => {
    modalClearAll.current?.open(
      "Tem certeza que deseja restaurar os dados da tabela? Isso irá apagar todas as suas alterações.",
      async () => {
        try {
          const res = await fetch(MISSIONS_ENDPOINT);
          if (!res.ok) throw new Error(`Falha ao buscar missões (${res.status})`);
          const data = await res.json();
          const seasonData: RawMission[] = (data?.[season] || []).filter(
            (mission: RawMission) => mission.id?.includes("M")
          );

          const built =
            seasonData.length > 0 ? missionsFromRaw(seasonData) : INITIAL_MISSIONS;

          setMissions(built);
          setColumns(INITIAL_COLUMNS);
          localStorage.removeItem(`fll_missions_${season}`);
          addToast("Dados restaurados!", "success");
        } catch (err) {
          console.error("Erro ao restaurar missões:", err);
          addToast("Não foi possível restaurar os dados. Tente novamente.", "error");
        }
      }
    );
  };

  if (!missions) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-30 flex justify-center items-center z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="">
      <div className="px-4 md:px-8 space-y-4">
        <HeaderTool
          NameTool="Tabela de Missões"
          DescriptionTool="Documente e analise as missões da temporada. Preencha a pontuação obtida em cada missão (incluindo sub-missões e bônus) e crie colunas personalizadas para acompanhar sua estratégia."
          IconTool={Table}
        />

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