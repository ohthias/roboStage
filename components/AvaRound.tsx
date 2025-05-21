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
  const [teams, setTeams] = useState<{ id: string; nome_equipe: string }[]>([]);
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
        }}
      >
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Avaliação de Rounds</h1>
        <p className="text-gray-600">Aqui você pode avaliar os rounds.</p>
        <p className="text-gray-600">
          Selecione o round e equipe que deseja avaliar.
        </p>
        <p className="text-gray-600">
          Após selecionar o round, as missões serão liberadas para avaliação.
        </p>
        <p className="text-gray-600">
          Após avaliar a missão, você poderá enviar a avaliação.
        </p>
        <p className="text-gray-600">
          O resultado será salvo, não podendo ser alterado.
        </p>
        <p className="text-gray-600">
          Após ver o resultado da avaliação, você poderá ver o feedback e
          mostrar para a equipe.
        </p>
      </div>

      <div className="p-6 space-y-8">
        <select
          className="border p-2 rounded"
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

        <select
          className="border p-2 rounded"
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

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleSubmit}
        >
          Enviar pontuação
        </button>

        <span className="block font-bold text-lg">
          Pontuação Total: {totalPoints}
        </span>
      </div>

      <FormMission
        missions={missions}
        responses={responses}
        onSelect={handleSelectMission}
      />
    </>
  );
}
