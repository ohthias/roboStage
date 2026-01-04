"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import FormMission from "../FormMission/FormMission";
import Loader from "../Loader";
import { useRouter } from "next/navigation";
import { sumAllMissions } from "@/utils/scores";

interface SubMission {
  submission: string;
  points: number | number[];
  type: ["switch" | "range", ...(string | number | null)[]];
}

interface MissionType {
  id: string;
  name: string;
  mission: string;
  points: number | number[];
  equipaments: boolean;
  type: ["switch" | "range", ...(string | number | null)[]];
  image?: string;
  ["sub-mission"]?: SubMission[];
}

type ResponseType = {
  [missionId: string]: {
    [index: number]: string | number;
  };
};

type TeamType = {
  id_team: number;
  name_team: string;
  points: Record<string, number>;
};

export default function AvaliacaoRounds({ idEvento }: { idEvento: string }) {
  const [selectedRound, setSelectedRound] = useState("");
  const [selectedEquipe, setSelectedEquipe] = useState("");
  const [missions, setMissions] = useState<MissionType[]>([]);
  const [responses, setResponses] = useState<ResponseType>({});
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [availableRounds, setAvailableRounds] = useState<string[]>([]);
  const [roundsOrder, setRoundsOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [allRoundsCompleted, setAllRoundsCompleted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { data: eventConfig, error: configError } = await supabase
          .from("typeEvent")
          .select("config")
          .eq("id_event", idEvento)
          .maybeSingle();

        if (configError) throw configError;

        const config = eventConfig?.config || {};
        const visibleRounds = config.rodadas || [];
        setRoundsOrder(visibleRounds);

        const season = (config.temporada || "").toLowerCase();
        const missionsRes = await fetch("/api/data/missions");
        const missionsData = await missionsRes.json();

        if (missionsData[season]) {
          setMissions(missionsData[season]);
        } else {
          console.warn(
            `Temporada '${season}' não encontrada no arquivo missions.json`
          );
          setMissions([]);
        }

        const { data: teamsData, error: teamsError } = await supabase
          .from("view_team_json")
          .select("id_team, name_team, rounds")
          .eq("id_event", idEvento);

        if (teamsError) throw teamsError;

        const formattedTeams = teamsData.map((t) => ({
          ...t,
          points:
            t.rounds ||
            Object.fromEntries(visibleRounds.map((r: any) => [r, -1])),
        }));

        setTeams(formattedTeams);

        const allCompleted = formattedTeams.every((team) =>
          visibleRounds.every(
            (round: string | number) => team.points[round] !== -1
          )
        );

        setAllRoundsCompleted(allCompleted);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [idEvento]);

  useEffect(() => {
    if (!selectedEquipe) {
      setAvailableRounds(roundsOrder);
      return;
    }
    const equipe = teams.find((t) => t.name_team === selectedEquipe);
    if (!equipe) return;

    const roundsDisponiveis = roundsOrder.filter(
      (round) => equipe.points?.[round] === -1
    );
    setAvailableRounds(roundsDisponiveis);
    setSelectedRound("");
  }, [selectedEquipe, teams, roundsOrder]);

  const handleSelectMission = (
    missionId: string,
    index: number,
    value: string | number
  ) => {
    setResponses((prev) => ({
      ...prev,
      [missionId]: { ...prev[missionId], [index]: value },
    }));
  };

  const totalPoints = sumAllMissions(
    missions.filter((m) => m.id !== "GP"),
    responses
  );

  const handleSubmit = async () => {
    if (!selectedRound || !selectedEquipe) {
      alert("Selecione o round e a equipe!");
      return;
    }

    const confirm = window.confirm("Deseja realmente enviar a avaliação?");
    if (!confirm) return;

    try {
      setLoading(true);

      const equipe = teams.find((t) => t.name_team === selectedEquipe);
      if (!equipe) throw new Error("Equipe não encontrada");

      if (equipe.points[selectedRound] !== -1) {
        alert("Essa equipe já foi avaliada nesse round.");
        return;
      }

      const updatedPoints = { ...equipe.points, [selectedRound]: totalPoints };

      // 🔎 GP e PT armazenados no data_extra
      const roundExtra: Record<string, any> = {};
      ["GP", "PT"].forEach((id) => {
        const mission = missions.find((m) => m.id === id);
        const response = responses[id];

        if (mission && response) {
          const index = Object.values(response)[0];
          let value: string | number = index;
          let points = 0;

          // Calcula pontos
          if (Array.isArray(mission.points)) {
            points = mission.points[index as number] ?? 0;
          } else {
            points = mission.points as number;
          }

          // Ajusta o "value" de acordo com o tipo
          if (typeof index === "number") {
            if (mission.type[0] === "range") {
              // para range → pega label (mission.type[index+1]) ou mantém index
              value = mission.type[index + 1] ?? index;
            } else if (mission.type[0] === "switch") {
              // para switch → pega label (mission.type[index+1]) ou mantém index
              value = mission.type[index + 1] ?? index;
            }
          }

          roundExtra[id] = { value, points };
        }
      });

      // 🔎 Pega data_extra atual para não sobrescrever
      const { data: current, error: fetchError } = await supabase
        .from("team")
        .select("data_extra")
        .eq("id_team", equipe.id_team)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const currentExtra = current?.data_extra || {};

      // Mescla com round atual
      const newExtra = {
        ...currentExtra,
        [selectedRound]: roundExtra,
      };

      // 🔄 Atualiza no banco
      const { error } = await supabase
        .from("team")
        .update({
          points: updatedPoints,
          data_extra: newExtra,
        })
        .eq("id_team", equipe.id_team);

      if (error) throw error;

      alert(
        `Pontuação salva para ${selectedEquipe} no ${selectedRound}: ${totalPoints}`
      );

      // Atualiza estado local
      setTeams((prev) =>
        prev.map((t) =>
          t.id_team === equipe.id_team
            ? { ...t, points: updatedPoints, data_extra: newExtra }
            : t
        )
      );
      router.refresh();
    } catch (err) {
      console.error("Erro ao salvar avaliação:", err);
      alert("Erro ao atualizar equipe.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (allRoundsCompleted) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4 text-primary">
          Avaliação Encerrada
        </h1>
        <p className="text-base-content text-lg">
          Todas as equipes já foram avaliadas em todos os rounds.
        </p>
        <p className="text-base-content mt-2">
          Entre em contato com o administrador caso haja necessidade de revisão.
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-start min-h-screen py-12 px-2">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-primary">
        Avaliação de Rounds
      </h1>

      <div className="text-left mb-6 w-full max-w-4xl">
        <p className="text-base-content">
          Selecione a equipe e o round para avaliar.
        </p>
        <p className="text-base-content">
          A pontuação total será atualizada automaticamente com base nas missões
          avaliadas.
        </p>
        <p className="text-base-content">
          Após enviar, a pontuação não poderá ser alterada.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-start gap-4 relative w-full max-w-4xl bg-base-200 px-8 py-4 rounded-md animate-fade-in-down mb-8">
        <img src="/images/icons/NoEquip.png" className="w-16 h-16 mr-4" />
        <p className="text-base-content text-sm">
          <b>Sem restrição de equipamento:</b> Quando este símbolo aparece,
          aplica-se a seguinte regra:{" "}
          <i className="text-secondary">
            “Um modelo de missão não pode ganhar pontos se estiver tocando no
            equipamento no final da partida.”
          </i>
        </p>
      </div>

      {/* Seletor de equipe e round */}
      <div className="w-full max-w-4xl bg-light-smoke rounded-lg mb-8 p-4 flex flex-col gap-4 sm:flex-row sm:gap-8">
        <div className="flex flex-col w-full">
          <label className="font-medium text-primary text-md mb-2">
            Equipe
          </label>
          <select
            className="input w-full"
            value={selectedEquipe}
            onChange={(e) => setSelectedEquipe(e.target.value)}
          >
            <option value="">Selecione a equipe</option>
            {teams.map((team) => (
              <option key={team.id_team} value={team.name_team}>
                {team.name_team}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col w-full">
          <label className="font-medium text-primary text-md mb-2">Round</label>
          <select
            className="input w-full"
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            disabled={availableRounds.length === 0}
          >
            <option value="">Selecione o round</option>
            {roundsOrder.map((round) => (
              <option
                key={round}
                value={round}
                disabled={!availableRounds.includes(round)}
              >
                {round} {!availableRounds.includes(round) && "(já avaliado)"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <FormMission
        missions={missions.map((mission) => ({
          ...mission,
          ["sub-mission"]: mission["sub-mission"]
            ? mission["sub-mission"].map((sub) => ({
              ...sub,
              points: sub.points ?? 0,
            }))
            : undefined,
        }))}
        responses={responses}
        onSelect={handleSelectMission}
      />
      <button
        className="btn btn-accent"
        disabled={!selectedRound || !selectedEquipe || loading}
        onClick={handleSubmit}
      >
        Enviar pontuação
      </button>
    </main>
  );
}
