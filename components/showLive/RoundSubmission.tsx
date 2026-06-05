"use client";

import { useEffect, useRef, useState } from "react";

import { createClient } from "@/utils/supabase/client";

import FormMission from "../FormMission/FormMission";
import Loader from "../Loader";

import { sumAllMissions } from "@/utils/scores";

import ModalConfirm, { ModalConfirmRef } from "../UI/Modal/ModalConfirm";

import ModalAlert, { ModalAlertRef } from "../UI/Modal/ModalAlert";

const supabase = createClient();

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

interface EventSettings {
  show_only_current_round: boolean;
}

export default function AvaliacaoRounds({ idEvento }: { idEvento: string }) {
  const [selectedRound, setSelectedRound] = useState("");

  const [selectedEquipe, setSelectedEquipe] = useState("");

  const [missions, setMissions] = useState<MissionType[]>([]);

  const [responses, setResponses] = useState<ResponseType>({});

  const [teams, setTeams] = useState<TeamType[]>([]);

  const [availableRounds, setAvailableRounds] = useState<string[]>([]);

  const [roundsOrder, setRoundsOrder] = useState<string[]>([]);

  const [currentRound, setCurrentRound] = useState("");

  const [settings, setSettings] = useState<EventSettings | null>(null);

  const [loading, setLoading] = useState(true);

  const [allRoundsCompleted, setAllRoundsCompleted] = useState(false);

  const modalConfirmRef = useRef<ModalConfirmRef>(null);

  const modalAlertRef = useRef<ModalAlertRef>(null);

  useEffect(() => {
    loadData();
  }, [idEvento]);

  async function loadData() {
    try {
      setLoading(true);

      const [
        { data: eventConfig, error: configError },
        { data: settingsData, error: settingsError },
        { data: teamsData, error: teamsError },
      ] = await Promise.all([
        supabase
          .from("typeEvent")
          .select("config")
          .eq("id_event", idEvento)
          .maybeSingle(),

        supabase
          .from("event_settings")
          .select("show_only_current_round")
          .eq("id_evento", idEvento)
          .single(),

        supabase
          .from("view_team_json")
          .select("id_team, name_team, rounds")
          .eq("id_event", idEvento),
      ]);

      if (configError) throw configError;

      if (settingsError) throw settingsError;

      if (teamsError) throw teamsError;

      setSettings(settingsData);

      const config = eventConfig?.config || {};

      const visibleRounds = config.rodadas || [];

      setRoundsOrder(visibleRounds);

      const season = (config.temporada || "").toLowerCase();

      const missionsRes = await fetch("/api/data/missions");

      const missionsData = await missionsRes.json();

      if (missionsData[season]) {
        setMissions(missionsData[season]);
      } else {
        setMissions([]);
      }

      const formattedTeams: TeamType[] = (teamsData || []).map((team: any) => ({
        ...team,
        points:
          team.rounds ||
          Object.fromEntries(visibleRounds.map((r: string) => [r, -1])),
      }));

      setTeams(formattedTeams);

      const allCompleted = formattedTeams.every((team) =>
        visibleRounds.every((round: string) => {
          const value = team.points?.[round];

          return typeof value === "number" && value >= 0;
        }),
      );

      setAllRoundsCompleted(allCompleted);

      // ROUND ATUAL
      let detectedCurrentRound = visibleRounds[0] || "";

      for (const round of visibleRounds) {
        const roundFinished = formattedTeams.every((team) => {
          const value = team.points?.[round];

          return typeof value === "number" && value >= 0;
        });

        if (!roundFinished) {
          detectedCurrentRound = round;
          break;
        }
      }

      setCurrentRound(detectedCurrentRound);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedEquipe) {
      if (settings?.show_only_current_round) {
        setAvailableRounds(currentRound ? [currentRound] : []);
      } else {
        setAvailableRounds(roundsOrder);
      }

      return;
    }

    const equipe = teams.find((t) => t.name_team === selectedEquipe);

    if (!equipe) return;

    let roundsDisponiveis: string[] = [];

    // MOSTRAR SOMENTE ROUND ATUAL
    if (settings?.show_only_current_round) {
      if (currentRound && equipe.points?.[currentRound] === -1) {
        roundsDisponiveis = [currentRound];
      }
    }

    // MODO NORMAL
    else {
      roundsDisponiveis = roundsOrder.filter(
        (round) => equipe.points?.[round] === -1,
      );
    }

    setAvailableRounds(roundsDisponiveis);

    setSelectedRound(roundsDisponiveis[0] || "");
  }, [selectedEquipe, teams, roundsOrder, currentRound, settings]);

  const handleSelectMission = (
    missionId: string,
    index: number,
    value: string | number,
  ) => {
    setResponses((prev) => ({
      ...prev,
      [missionId]: {
        ...prev[missionId],
        [index]: value,
      },
    }));
  };

  const totalPoints = sumAllMissions(
    missions.filter((m) => m.id !== "GP"),
    responses,
  );

  const handleSubmit = async () => {
    if (!selectedRound || !selectedEquipe) {
      alert("Selecione o round e a equipe!");

      return;
    }

    modalConfirmRef.current?.open(
      "A pontuação será final e não poderá ser alterada.",
      async () => {
        try {
          setLoading(true);

          const equipe = teams.find((t) => t.name_team === selectedEquipe);

          if (!equipe) {
            throw new Error("Equipe não encontrada");
          }

          if (equipe.points[selectedRound] !== -1) {
            alert("Essa equipe já foi avaliada.");

            return;
          }

          const updatedPoints = {
            ...equipe.points,
            [selectedRound]: totalPoints,
          };

          const roundExtra: Record<string, any> = {};

          ["GP", "PT"].forEach((id) => {
            const mission = missions.find((m) => m.id === id);

            const response = responses[id];

            if (!mission || !response) return;

            const index = Object.values(response)[0];

            let value: string | number = index;

            let points = 0;

            if (Array.isArray(mission.points)) {
              points = mission.points[index as number] ?? 0;
            } else {
              points = mission.points as number;
            }

            if (typeof index === "number") {
              value = mission.type[index + 1] ?? index;
            }

            roundExtra[id] = {
              value,
              points,
            };
          });

          const { data: current } = await supabase
            .from("team")
            .select("data_extra")
            .eq("id_team", equipe.id_team)
            .maybeSingle();

          const currentExtra = current?.data_extra || {};

          const newExtra = {
            ...currentExtra,
            [selectedRound]: roundExtra,
          };

          const { error } = await supabase
            .from("team")
            .update({
              points: updatedPoints,
              data_extra: newExtra,
            })
            .eq("id_team", equipe.id_team);

          if (error) throw error;

          setTeams((prev) =>
            prev.map((t) =>
              t.id_team === equipe.id_team
                ? {
                    ...t,
                    points: updatedPoints,
                  }
                : t,
            ),
          );

          setResponses({});

          modalAlertRef.current?.open(
            `Pontuação enviada com sucesso para ${selectedEquipe}.`,
          );

          await loadData();
        } catch (err) {
          console.error(err);

          alert("Erro ao atualizar equipe.");
        } finally {
          setLoading(false);
        }
      },
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (allRoundsCompleted) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="alert alert-success max-w-2xl shadow-xl">
          <div>
            <h1 className="font-bold text-2xl">Avaliações encerradas</h1>

            <p className="mt-2 opacity-80">
              Todas as equipes já foram avaliadas em todos os os rounds.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-start min-h-screen mt-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-primary">
        Avaliação de Rounds
      </h1>

      {settings?.show_only_current_round && (
        <div className="alert alert-info mb-6 max-w-4xl shadow-md">
          <div>
            <h2 className="font-bold">Rodada atual liberada</h2>

            <p className="text-sm mt-1">
              Apenas o round <b>{currentRound}</b> está disponível no momento. O
              próximo round será liberado automaticamente após todas as equipes
              serem avaliadas.
            </p>
          </div>
        </div>
      )}

      <div className="text-left mb-6 w-full max-w-4xl">
        <p className="text-base-content">
          Selecione a equipe e o round para avaliar.
        </p>

        <p className="text-base-content">
          A pontuação total será atualizada automaticamente.
        </p>

        <p className="text-base-content">
          Após enviar, a pontuação não poderá ser alterada.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-start gap-4 relative w-full max-w-4xl bg-base-300 px-8 py-4 rounded-md mb-8">
        <img src="/images/icons/NoEquip.png" className="w-16 h-16 mr-4" />

        <p className="text-base-content text-sm">
          <b>Sem restrição de equipamento:</b> Um modelo de missão não pode
          ganhar pontos se estiver tocando no equipamento no final da partida.
        </p>
      </div>

      <div className="card w-full max-w-4xl bg-base-100 shadow-md mb-8">
        <div className="card-body p-4 flex flex-col gap-4 sm:flex-row sm:gap-8">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium text-primary">
                Equipe
              </span>
            </label>

            <select
              className="select select-bordered w-full"
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

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium text-primary">Round</span>
            </label>

            <select
              className="select select-bordered w-full"
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              disabled={availableRounds.length === 0 || !selectedEquipe}
            >
              <option value="">Selecione o round</option>

              {availableRounds.map((round) => (
                <option key={round} value={round}>
                  {round}
                </option>
              ))}
            </select>
          </div>
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
        imagesEnabled={false}
        isBadgeEnabled={false}
      />

      <button
        className="btn btn-accent rounded-md mt-8 w-full max-w-4xl"
        disabled={!selectedRound || !selectedEquipe || loading}
        onClick={handleSubmit}
      >
        Enviar pontuação
      </button>

      <ModalConfirm
        ref={modalConfirmRef}
        title="Confirmar avaliação"
        cancelLabel="Cancelar"
        confirmLabel="Enviar"
      />

      <ModalAlert
        ref={modalAlertRef}
        title="Avaliação enviada"
        confirmLabel="OK"
      />
    </main>
  );
}
