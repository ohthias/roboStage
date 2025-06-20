"use client";
import { useEffect, useState } from "react";
import FormMission from "./FormMission";
import { calculateTotalPoints } from "@/utils/calculateTotalPoints";
import Loader from "./loader";

type MissionType = {
  id: string;
  name: string;
  mission?: string;
  type: string[];
  points: number[] | number;
  "sub-mission"?: {
    submission: string;
    type: string[];
  }[];
};

type ResponseType = {
  [missionId: string]: {
    [index: number]: string | number;
  };
};

type TeamType = {
  id: string;
  nome_equipe: string;
  round1?: number;
  round2?: number;
  round3?: number;
  locked_round?: string;
  [key: string]: any;
};

export default function AvaliacaoRounds({
  codigo_sala,
}: {
  codigo_sala: string;
}) {
  const [selectedRound, setSelectedRound] = useState<string>("");
  const [selectedEquipe, setSelectedEquipe] = useState<string>("");
  const [missions, setMissions] = useState<MissionType[]>([]);
  const [responses, setResponses] = useState<ResponseType>({});
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [availableRounds, setAvailableRounds] = useState<string[]>([
    "round1",
    "round2",
    "round3",
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [allRoundsCompleted, setAllRoundsCompleted] = useState<boolean>(false);
  const codigoSala = codigo_sala;

  useEffect(() => {
    setLoading(true);

    fetch("/data/missions.json")
      .then((res) => res.json())
      .then((data) => setMissions(data.missions))
      .catch((error) => console.error("Erro ao carregar missões:", error));

    fetch(`/rooms/${codigoSala}/get`)
      .then((res) => res.json())
      .then((data) => {
        const equipes = data.teams;
        setTeams(equipes);
        console.log("Equipes carregadas:", equipes);

        const allCompleted = equipes.every(
          (team: { round1: number; round2: number; round3: number }) =>
            team.round1 !== -1 && team.round2 !== -1 && team.round3 !== -1
        );
        console.log(
          "Todas as equipes completaram todos os rounds:",
          allCompleted
        );
        setAllRoundsCompleted(allCompleted);
      })
      .catch((err) => console.error("Erro ao carregar equipes:", err))
      .finally(() => setLoading(false));
  }, [codigoSala]);

  useEffect(() => {
    if (!selectedEquipe) {
      setAvailableRounds(["round1", "round2", "round3"]);
      return;
    }

    const equipe = teams.find((team) => team.nome_equipe === selectedEquipe);
    if (!equipe) return;

    const roundsDisponiveis = ["round1", "round2", "round3"].filter(
      (round) => equipe[round] === -1
    );

    setAvailableRounds(roundsDisponiveis);
    setSelectedRound("");
  }, [selectedEquipe, teams]);

  const handleSelectMission = (
    missionId: string,
    index: number,
    value: string | number
  ) => {
    setResponses((prev) => ({
      ...prev,
      [missionId]: {
        ...prev[missionId],
        [index]: value,
      },
    }));
  };

  const totalPoints = calculateTotalPoints(missions, responses);

  const handleSubmit = async () => {
    if (!selectedRound || !selectedEquipe) {
      alert("Selecione o round e a equipe!");
      return;
    }

    const confirm = window.confirm("Deseja realmente enviar a avaliação?");
    if (!confirm) return;

    setLoading(true);

    try {
      const resCheck = await fetch(`/rooms/${codigoSala}/get`);
      const dataCheck = await resCheck.json();
      const equipeAtualizada = dataCheck.teams.find(
        (team: TeamType) => team.nome_equipe === selectedEquipe
      );

      if (equipeAtualizada[selectedRound] !== -1) {
        alert("Essa equipe já foi avaliada nesse round por outro avaliador.");
        setLoading(false);
        return;
      }

      const updatedEquipe = {
        nome_equipe: selectedEquipe,
        [`${selectedRound}`]: totalPoints,
      };

      const res = await fetch(`/rooms/${codigoSala}/put/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEquipe),
      });

      if (res.ok) {
        alert("Avaliação salva com sucesso!");
        alert(
          `Pontuação total para ${selectedEquipe} no ${selectedRound}: ${totalPoints} pontos`
        );
        window.location.reload();
      } else {
        alert("Erro ao salvar avaliação.");
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      alert("Erro ao atualizar equipe.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 backdrop-blur">
        <Loader />
      </div>
    );
  }

  if (allRoundsCompleted) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4 text-red-600">
          Avaliação Encerrada
        </h1>
        <p className="text-gray-700 text-lg">
          Todas as equipes já foram avaliadas em todos os rounds.
        </p>
        <p className="text-gray-500 mt-2">
          Entre em contato com o administrador caso haja necessidade de revisão.
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-start min-h-screen py-12 px-2">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
        Avaliação de Rounds
      </h1>

      <div className="text-left mb-6 w-full max-w-4xl">
        <p className="text-gray-600">
          Selecione a equipe e o round para avaliar.
        </p>
        <p className="text-gray-600">
          A pontuação total será atualizada automaticamente com base nas missões
          avaliadas.
        </p>
        <p className="text-gray-600">
          Após enviar, a pontuação não poderá ser alterada.
        </p>
      </div>

      <div className="w-full max-w-4xl bg-light-smoke rounded-lg mb-8 p-4 flex flex-col gap-4 sm:flex-row sm:gap-8">
        {/* Equipe */}
        <div className="flex flex-col gap-2 w-full">
          <label
            htmlFor="equipe-select"
            className="font-medium text-gray-700 text-sm"
          >
            Equipe
          </label>
          <select
            id="equipe-select"
            className="border p-2 rounded-md shadow-sm bg-white text-gray-700"
            value={selectedEquipe}
            onChange={(e) => setSelectedEquipe(e.target.value)}
          >
            <option value="">Selecione a equipe</option>
            {teams.map((team) => (
              <option key={team.id} value={team.nome_equipe}>
                {team.nome_equipe}
              </option>
            ))}
          </select>
        </div>

        {/* Round */}
        <div className="flex flex-col gap-2 w-full">
          <label
            htmlFor="round-select"
            className="font-medium text-gray-700 text-sm"
          >
            Round
          </label>
          <select
            id="round-select"
            className="border p-2 rounded-md shadow-sm bg-white text-gray-700"
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            disabled={availableRounds.length === 0}
          >
            <option value="">Selecione o round</option>
            {["round1", "round2", "round3"].map((round) => {
              const avaliavel = availableRounds.includes(round);
              return (
                <option key={round} value={round} disabled={!avaliavel}>
                  {round.charAt(0).toUpperCase() + round.slice(1)}{" "}
                  {!avaliavel ? " (já avaliado)" : ""}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <FormMission
        missions={missions}
        responses={responses}
        onSelect={handleSelectMission}
      />

      <button
        className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark mt-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!selectedRound || !selectedEquipe || loading}
        onClick={handleSubmit}
      >
        Enviar pontuação
      </button>
    </main>
  );
}
