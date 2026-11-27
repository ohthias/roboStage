"use client";
import { useState, useEffect } from "react";
import { Column, Mission } from "@/features/scoring/types";
import {
  INITIAL_COLUMNS,
  INITIAL_MISSIONS,
} from "@/features/quickbrick/tabela-de-missoes/lib/constants";
import { RotateCcw, Table } from "lucide-react";
import { MissionTable } from "@/features/quickbrick/tabela-de-missoes/components/MissionTable";
import { useParams } from "next/navigation";
import { useToast } from "@/components/providers/ToastContext";
import Loader from "@/components/stage/core/Loader";
import { ToolButton, useToolConfirm } from "@/components/stage";
import HeaderTool from "@/features/quickbrick/shared/components/HeaderTool";
import {
  missionsFromRaw,
  RawMission,
} from "@/features/scoring/lib/mission-scoring";
import { loadSeasonMissions } from "@/lib/data/missions-client";

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
  const { confirm, dialog } = useToolConfirm();

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

        const seasonData = (
          await loadSeasonMissions<RawMission>(season)
        ).filter((mission) => mission.id?.includes("M"));

        const built =
          seasonData.length > 0
            ? missionsFromRaw(seasonData)
            : INITIAL_MISSIONS;

        if (!cancelled) setMissions(built);
      } catch (err) {
        console.error("Erro ao carregar missões:", err);
        if (!cancelled) {
          setMissions(INITIAL_MISSIONS);
          addToast(
            "Não foi possível carregar as missões dessa temporada.",
            "error",
          );
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

  const handleReset = async () => {
    if (
      !(await confirm({
        title: "Restaurar a tabela?",
        message:
          "Isso apaga todas as suas alterações e volta aos dados da temporada.",
        confirmLabel: "Restaurar",
      }))
    )
      return;
    try {
      const seasonData = (await loadSeasonMissions<RawMission>(season)).filter(
        (mission) => mission.id?.includes("M"),
      );

      const built =
        seasonData.length > 0 ? missionsFromRaw(seasonData) : INITIAL_MISSIONS;

      setMissions(built);
      setColumns(INITIAL_COLUMNS);
      localStorage.removeItem(`fll_missions_${season}`);
      addToast("Dados restaurados!", "success");
    } catch (err) {
      console.error("Erro ao restaurar missões:", err);
      addToast(
        "Não foi possível restaurar os dados. Tente novamente.",
        "error",
      );
    }
  };

  if (!missions) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-30 flex justify-center items-center z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-16 md:px-8">
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

      <div className="flex justify-end">
        <ToolButton variant="ghost" icon={<RotateCcw />} onClick={handleReset}>
          Restaurar dados da temporada
        </ToolButton>
      </div>
      {dialog}
    </div>
  );
}

export default MissionTablePage;
