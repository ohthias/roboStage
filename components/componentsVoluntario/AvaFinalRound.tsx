"use client";
import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useState,
} from "react";
import FormMission from "@/components/FormMission";
import { calculateTotalPoints } from "@/utils/calculateTotalPoints";
import Loader from "@/components/loader";

interface AvaliacaoRoundFinalProps {
  codigo_sala: string;
}

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

interface TeamType {
  id: string;
  nome_equipe: string;
  round1?: number;
  round2?: number;
  round3?: number;
  locked_round?: string;
  semiFinal?: number;
  final?: number;
  [key: string]: any;
}

export default function AvaliacaoRoundFinal({
  codigo_sala,
}: AvaliacaoRoundFinalProps) {
  const [equipes, setEquipes] = useState<TeamType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [missions, setMissions] = useState<any[]>([]);
  const [responses, setResponses] = useState<ResponseType>({});
  const [selectedModo, setSelectedModo] = useState<
    "semifinal1" | "semifinal2" | "final" | ""
  >("");
  const [selectedEquipe, setSelectedEquipe] = useState<string>("");
  const [semifinaisConcluidas, setSemifinaisConcluidas] =
    useState<boolean>(false);

  const modos = ["semifinal1", "semifinal2", "final"];

  useEffect(() => {
    const fetchEquipes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/rooms/${codigo_sala}/get`);
        if (!response.ok) throw new Error("Erro ao buscar equipes");

        const data = await response.json();
        const equipesComNotas = data.teams.map((equipe: any) => {
          const notaTotal =
            (equipe.round1?.nota || 0) +
            (equipe.round2?.nota || 0) +
            (equipe.round3?.nota || 0);
          return { ...equipe, notaTotal };
        });

        const top4Equipes = equipesComNotas
          .sort((a, b) => b.notaTotal - a.notaTotal)
          .slice(0, 4);

        // Verifica se semifinais foram avaliadas
        const semi1Done =
          top4Equipes[0]?.semiFinal && top4Equipes[1]?.semiFinal;
        const semi2Done =
          top4Equipes[2]?.semiFinal && top4Equipes[3]?.semiFinal;
        setSemifinaisConcluidas(Boolean(semi1Done && semi2Done));

        setEquipes(top4Equipes);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipes();

    fetch("/data/missions.json")
      .then((res) => res.json())
      .then((data) => setMissions(data.missions))
      .catch((error) => console.error("Erro ao carregar missões:", error));
  }, [codigo_sala]);

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
    const equipeObj = equipes.find((e) => e.nome_equipe === selectedEquipe);
    if (!equipeObj) return;

    try {
      const response = await fetch(
        `/rooms/${codigo_sala}/rounds/semiFinaisFinais/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            [`round_${}`]: {
              nota: Number(),
            },
          }),
        }
      );

      if (!response.ok) throw new Error("Erro ao enviar pontuação.");

      alert("Pontuação enviada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar pontuação.");
    }
  };

  const equipesPorModo = {
    semifinal1: equipes.slice(0, 2),
    semifinal2: equipes.slice(2, 4),
    final: equipes
      .filter((e) => e.semiFinal !== undefined) // considera só as que têm semifinal feita
      .sort((a, b) => (b.semiFinal ?? 0) - (a.semiFinal ?? 0))
      .slice(0, 2),
  };

  const equipesDisponiveis = selectedModo
    ? equipesPorModo[selectedModo as keyof typeof equipesPorModo] || []
    : [];

  const finalBloqueada = selectedModo === "final" && !semifinaisConcluidas;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <div className="mb-6 text-left max-w-4xl">
        <p className="text-gray-600">
          Selecione o modo e a equipe para avaliar.
        </p>
        <p className="text-gray-600">
          A pontuação total será atualizada automaticamente com base nas missões
          avaliadas.
        </p>
        <p className="text-gray-600">
          As equipes disponíveis são as 4 melhores classificadas da semifinal.
        </p>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="w-full bg-light-smoke rounded-lg mb-8 max-w-4xl flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-2 w-full">
              <label
                htmlFor="modo-select"
                className="font-medium text-gray-700"
              >
                Modo
              </label>
              <select
                id="modo-select"
                className="border p-2 rounded-md bg-white text-gray-700"
                value={selectedModo}
                onChange={(e) => {
                  setSelectedModo(e.target.value as typeof selectedModo);
                  setSelectedEquipe("");
                }}
              >
                <option value="">Selecione o modo</option>
                {modos.map((modo) => (
                  <option
                    key={modo}
                    value={modo}
                    disabled={modo === "final" && !semifinaisConcluidas}
                  >
                    {modo === "final" && !semifinaisConcluidas
                      ? "Final (bloqueada)"
                      : modo.charAt(0).toUpperCase() + modo.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {finalBloqueada && (
              <div className="bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500 p-4 rounded">
                A final ainda não está liberada. Avalie primeiro as duas
                semifinais.
              </div>
            )}

            {!finalBloqueada && (
              <div className="flex flex-col gap-2 w-full">
                <label
                  htmlFor="equipe-select"
                  className="font-medium text-gray-700"
                >
                  Equipe
                </label>
                <select
                  id="equipe-select"
                  className="border p-2 rounded-md bg-white text-gray-700"
                  value={selectedEquipe}
                  onChange={(e) => setSelectedEquipe(e.target.value)}
                  disabled={!selectedModo}
                >
                  <option value="">Selecione a equipe</option>
                  {equipesDisponiveis.map((team) => (
                    <option key={team.id} value={String(team.nome_equipe)}>
                      {team.nome_equipe}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {!finalBloqueada && (
            <>
              <FormMission
                missions={missions}
                responses={responses}
                onSelect={handleSelectMission}
              />

              <button
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedModo || !selectedEquipe || loading}
                onClick={handleSubmit}
              >
                Enviar pontuação
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
