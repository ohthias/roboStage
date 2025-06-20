"use client";
import { useEffect, useState } from "react";
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
  round1?: { nota: number };
  round2?: { nota: number };
  round3?: { nota: number };
  locked_round?: string;
  semiFinal?: number;
  final?: number;
  avaliadoTop2?: boolean;
  avaliadoMataMata?: boolean;
  [key: string]: any;
}

export default function AvaliacaoRoundFinal({
  codigo_sala,
}: AvaliacaoRoundFinalProps) {
  const [equipes, setEquipes] = useState<TeamType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [missions, setMissions] = useState<any[]>([]);
  const [responses, setResponses] = useState<ResponseType>({});
  const [selectedModoUso, setSelectedModoUso] = useState<"mata-mata" | "top2" | "">("");
  const [selectedModoRound, setSelectedModoRound] = useState<"semifinal1" | "semifinal2" | "final" | "">("");
  const [selectedEquipe, setSelectedEquipe] = useState<string>("");
  const [semifinaisConcluidas, setSemifinaisConcluidas] = useState<boolean>(false);
  const [modoLimitado, setModoLimitado] = useState(false);
  const [allRoundsCompleted, setAllRoundsCompleted] = useState(false);

  const modosRound = ["semifinal1", "semifinal2", "final"];

  useEffect(() => {
    const fetchEquipes = async () => {
      try {
        const response = await fetch(`/rooms/${codigo_sala}/get`);
        if (!response.ok) throw new Error("Erro ao buscar equipes");

        const data = await response.json();

        // Remove equipes com notas -1
        const equipesValidas = data.teams.filter(
          (team: any) =>
            team.round1?.nota !== -1 &&
            team.round2?.nota !== -1 &&
            team.round3?.nota !== -1
        );

        setAllRoundsCompleted(equipesValidas.length === 0);

        setModoLimitado(equipesValidas.length < 4);

        const equipesComNotas = equipesValidas.map((equipe: any) => {
          const notaTotal =
            (equipe.round1?.nota || 0) +
            (equipe.round2?.nota || 0) +
            (equipe.round3?.nota || 0);

          const avaliadoTop2 = equipe.avaliadoTop2 === true;
          const avaliadoMataMata =
            equipe.semiFinal === true ||
            equipe.final === true ||
            equipe.avaliadoMataMata === true;

          return { ...equipe, notaTotal, avaliadoTop2, avaliadoMataMata };
        });

        const top4Equipes = equipesComNotas
          .sort((a: { notaTotal: number; }, b: { notaTotal: number; }) => b.notaTotal - a.notaTotal)
          .slice(0, 4);

        const semi1Done = top4Equipes[0]?.semiFinal && top4Equipes[1]?.semiFinal;
        const semi2Done = top4Equipes[2]?.semiFinal && top4Equipes[3]?.semiFinal;
        setSemifinaisConcluidas(Boolean(semi1Done && semi2Done));

        setEquipes(top4Equipes);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetch("/data/missions.json")
      .then((res) => res.json())
      .then((data) => setMissions(data.missions))
      .catch((error) => console.error("Erro ao carregar missões:", error));

    fetchEquipes();
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

  const equipeJaAvaliada = (team: TeamType) => {
    if (!selectedModoRound) return false;
    return (
      team[selectedModoRound] !== undefined && team[selectedModoRound] !== null
    );
  };

  const handleSubmit = async () => {
    const equipeObj = equipes.find((e) => e.nome_equipe === selectedEquipe);
    if (!equipeObj) return;

    if (equipeJaAvaliada(equipeObj)) {
      alert("Essa equipe já foi avaliada neste modo.");
      return;
    }

    try {
      const response = await fetch(
        `/rooms/${codigo_sala}/rounds/semiFinaisFinais/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            team_id: equipeObj.id,
            [`round_${selectedModoRound}`]: {
              nota: Number(totalPoints),
            },
          }),
        }
      );
      if (!response.ok) throw new Error("Erro ao enviar pontuação.");

      alert("Pontuação enviada com sucesso!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar pontuação.");
    }
  };

  const equipesPorModo = {
    semifinal1: equipes.slice(0, 2),
    semifinal2: equipes.slice(2, 4),
    final: equipes
      .filter((e) => e.semiFinal !== undefined)
      .sort((a, b) => (b.semiFinal ?? 0) - (a.semiFinal ?? 0))
      .slice(0, 2),
  };

  const equipesDisponiveis = selectedModoRound
    ? equipesPorModo[selectedModoRound as keyof typeof equipesPorModo] || []
    : [];

  const finalBloqueada = selectedModoRound === "final" && !semifinaisConcluidas;

  const equipesTop2 = equipes
    .sort((a, b) => (b.notaTotal ?? 0) - (a.notaTotal ?? 0))
    .slice(0, 2);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 backdrop-blur-sm">
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
          Todas as equipes já foram avaliadas no modo.
        </p>
        <p className="text-gray-500 mt-2">
          Entre em contato com o administrador caso haja necessidade de revisão.
        </p>
      </main>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <div className="mb-6 text-left max-w-4xl">
        <p className="text-gray-600">Escolha o modo de uso da avaliação:</p>
      </div>

      <div className="flex gap-2 mb-8 max-w-4xl">
        {modoLimitado && (
          <button
            className={`px-4 py-2 rounded ${
              selectedModoUso === "mata-mata"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => !modoLimitado && setSelectedModoUso("mata-mata")}
            disabled={modoLimitado}
            title={
              modoLimitado
                ? "Modo mata-mata indisponível para menos de 4 equipes"
                : ""
            }
          >
            Mata-mata
          </button>
        )}
        <button
          className={`px-4 py-2 rounded ${
            selectedModoUso === "top2"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setSelectedModoUso("top2")}
        >
          Top 2
        </button>
      </div>

      {modoLimitado && (
        <p className="text-sm text-red-500 max-w-4xl mb-6">
          Modo "Mata-mata" indisponível — é necessário ter pelo menos 4 equipes
          no evento.
        </p>
      )}

      {selectedModoUso && (
        <>
          <div className="mb-6 text-left max-w-4xl">
            <p className="text-gray-600">
              Selecione o modo da rodada e a equipe para avaliar.
            </p>
            <p className="text-gray-600">
              A pontuação total será atualizada automaticamente com base nas
              missões avaliadas.
            </p>
          </div>

          {selectedModoUso === "mata-mata" && (
            <div className="w-full bg-light-smoke rounded-lg mb-8 max-w-4xl flex flex-col gap-4 p-4">
              <div className="flex flex-col gap-2 w-full">
                <label htmlFor="modo-select" className="font-medium text-gray-700">
                  Modo da rodada
                </label>
                <select
                  id="modo-select"
                  className="border p-2 rounded-md bg-white text-gray-700"
                  value={selectedModoRound}
                  onChange={(e) => {
                    setSelectedModoRound(
                      e.target.value as typeof selectedModoRound
                    );
                    setSelectedEquipe("");
                    setResponses({});
                  }}
                >
                  <option value="">Selecione o modo</option>
                  {modosRound.map((modo) => (
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

                {finalBloqueada && (
                  <div className="bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500 p-4 rounded mt-2">
                    A final ainda não está liberada. Avalie primeiro as duas semifinais.
                  </div>
                )}
              </div>
            </div>
          )}

          {(selectedModoRound || selectedModoUso === "top2") && (
            <div className="flex flex-col gap-2 w-full max-w-4xl mb-6">
              <label htmlFor="equipe-select" className="font-medium text-gray-700">
                Equipe
              </label>
              <select
                id="equipe-select"
                className="border p-2 rounded-md bg-white text-gray-700"
                value={selectedEquipe}
                onChange={(e) => setSelectedEquipe(e.target.value)}
                disabled={selectedModoUso === "mata-mata" && !selectedModoRound}
              >
                <option value="">Selecione uma equipe</option>
                {(selectedModoUso === "mata-mata"
                  ? equipesDisponiveis
                  : equipesTop2
                ).map((equipe) => (
                  <option
                    key={equipe.id}
                    value={equipe.nome_equipe}
                    disabled={equipeJaAvaliada(equipe)}
                  >
                    {equipe.nome_equipe}{" "}
                    {equipeJaAvaliada(equipe) ? "(Já avaliada)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedEquipe && (
            <>
              <FormMission
                missions={missions}
                responses={responses}
                onSelect={handleSelectMission}
              />
              <button
                onClick={handleSubmit}
                disabled={equipeJaAvaliada(
                  equipes.find((eq) => eq.nome_equipe === selectedEquipe)!
                )}
                className={`px-6 py-3 rounded font-bold text-white max-w-4xl ${
                  equipeJaAvaliada(
                    equipes.find((eq) => eq.nome_equipe === selectedEquipe)!
                  )
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Enviar Avaliação
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}