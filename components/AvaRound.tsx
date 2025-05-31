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

type Responses = Response[];

export default function AvaliacaoRounds({
  codigo_sala,
}: {
  codigo_sala: string;
}) {
  const [selectedRound, setSelectedRound] = useState<string>("");
  const [selectedEquipe, setSelectedEquipe] = useState<string>("");
  const [missions, setMissions] = useState<MissionType[]>([]);
  const [responses, setResponses] = useState<ResponseType>({});
  type TeamType = {
    id: string;
    nome_equipe: string;
    round1?: number;
    round2?: number;
    round3?: number;
    [key: string]: any;
  };

  const [teams, setTeams] = useState<TeamType[]>([]);
  const [availableRounds, setAvailableRounds] = useState<string[]>([
    "round1",
    "round2",
    "round3",
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  const codigoSala = codigo_sala;

  useEffect(() => {
    fetch("/data/missions.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao buscar as missões");
        }
        return res.json();
      })
      .then((data) => {
        setMissions(data.missions);
      })
      .catch((error) => {
        console.error("Erro:", error);
      });

    fetch(`/rooms/${codigoSala}/get`)
      .then((res) => res.json())
      .then((data) => {
        const equipes = data.teams;
        setTeams(equipes);
        console.log(equipes);
      })
      .catch((err) => console.error("Erro ao carregar equipes:", err));
  }, [codigoSala]);

  useEffect(() => {
    if (!selectedEquipe) {
      setAvailableRounds(["round1", "round2", "round3"]);
      return;
    }

    const equipe = teams.find((team) => team.nome_equipe === selectedEquipe);

    if (!equipe) {
      setAvailableRounds(["round1", "round2", "round3"]);
      return;
    }

    const rounds = ["round1", "round2", "round3"];

    const roundsDisponiveis = rounds.filter((round) => !equipe[round]);

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

  const handleSubmit = async () => {
    if (!selectedRound || !selectedEquipe) {
      alert("Selecione o round e a equipe!");
      return;
    }

    const confirm = window.confirm("Deseja realmente enviar a avaliação?");
    if (!confirm) return;
    setLoading(true);
    const updatedEquipe = {
      nome_equipe: selectedEquipe,
      [`${selectedRound}`]: totalPoints,
    };

    try {
      console.log("Atualizando equipe:", updatedEquipe);
      const res = await fetch(`/rooms/${codigo_sala}/put/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEquipe),
      });

      if (res.ok) {
        alert("Avaliação salva com sucesso!");
        alert(
          `Pontuação total para ${selectedEquipe} no ${selectedRound}: ${totalPoints} pontos`)
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

  const totalPoints = calculateTotalPoints(missions, responses);

  if (loading) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          backdropFilter: "blur(5px)",
        }}
      >
        <Loader />
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Avaliação de Rounds</h1>
      <div className="text-left mb-6 max-w-4xl">
        <p className="text-gray-600">
          Selecione a equipe e o round para avaliar.
        </p>
        <p className="text-gray-600">
          Lembre-se de que a pontuação total será atualizada automaticamente com
          base nas missões avaliadas.
        </p>
        <p className="text-gray-600">
          A pontuação total será salva automaticamente ao enviar a avaliação.
          Sendo indisponível para edição posteriormente.
        </p>
      </div>
      <div className="p-6 w-full bg-light-smoke rounded-lg mb-8 max-w-4xl flex flex-row gap-8 justify-between">
        <div className="flex flex-col gap-2 w-full">
          <label
            htmlFor="equipe-select"
            className="font-medium text-gray-700 text-m"
          >
            Equipe
          </label>
          <select
            id="equipe-select"
            className="border border-gray-300 p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition bg-white disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 cursor-pointer"
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

        <div className="flex flex-col gap-2 w-full">
          <label
            htmlFor="round-select"
            className="font-medium text-gray-700 text-m"
          >
            Round
          </label>
          <select
            id="round-select"
            className="border border-gray-300 p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition bg-white disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 cursor-pointer"
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            disabled={availableRounds.length === 0}
          >
            <option value="">Selecione o round</option>
            {availableRounds.map((round) => (
              <option key={round} value={round}>
                {round.charAt(0).toUpperCase() + round.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {(missions.length === 0 || teams.length === 0) ? (
        <div className="flex justify-center items-center w-full h-64">
          <Loader />
        </div>
      ) : (
        <FormMission
          missions={missions}
          responses={responses}
          onSelect={handleSelectMission}
        />
      )}

      <button
        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        disabled={!selectedRound || !selectedEquipe || loading}
        onClick={handleSubmit}
      >
        Enviar pontuação
      </button>
    </main>
  );
}
