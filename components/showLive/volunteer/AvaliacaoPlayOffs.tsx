"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { sumAllMissions } from "@/utils/scores";
import FormMission from "@/components/FormMission/FormMission";
import Loader from "@/components/loader";

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

export default function AvaliacaoPlayOffs({ idEvento }: { idEvento: number }) {
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [missions, setMissions] = useState<MissionType[]>([]);
  const [responses, setResponses] = useState<ResponseType>({});
  const [fase, setFase] = useState<"Semi-final" | "Final" | null>(null);
  const [roundsOrder, setRoundsOrder] = useState<string[]>([]);
  const [allRoundsCompleted, setAllRoundsCompleted] = useState(false);
  const [playoffState, setPlayoffState] = useState<"andamento" | "encerrado" | "final">("andamento");

  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // ⚙️ Buscar configurações playoffs
        const { data: settings } = await supabase
          .from("event_settings")
          .select("enable_playoffs, auto_semifinals")
          .eq("id_evento", idEvento)
          .single();

        if (!settings || !settings.enable_playoffs) {
          setLabel("Playoffs não habilitados");
          setLoading(false);
          return;
        }

        setFase(settings.auto_semifinals ? "Semi-final" : "Final");
        setLabel(settings.auto_semifinals ? "Modo: Semi-finais" : "Modo: Finais");

        // ⚙️ Buscar config do evento (temporada e rodadas)
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

        // 📂 Missões da temporada
        const missionsRes = await fetch("/api/data/missions");
        const missionsData = await missionsRes.json();

        if (missionsData[season]) {
          setMissions(missionsData[season]);
        } else {
          console.warn(`⚠️ Temporada '${season}' não encontrada em missions.json`);
          setMissions([]);
        }

        // 👥 Buscar equipes
        const { data: teamsData, error: teamsError } = await supabase
          .from("view_team_json")
          .select("id_team, name_team, rounds")
          .eq("id_event", idEvento);

        if (teamsError) throw teamsError;

        const formattedTeams = teamsData.map((t) => ({
          ...t,
          points: t.rounds || Object.fromEntries(visibleRounds.map((r: any) => [r, -1])),
        }));

        // 🏆 Ranking pela maior pontuação registrada em qualquer rodada
        const rankedTeams = (formattedTeams || [])
          .map((t) => {
            const scores = Object.values(t.points || {}) as number[];
            const validScores = scores.filter((s) => typeof s === "number" && s >= 0);
            const maxScore = validScores.length > 0 ? Math.max(...validScores) : 0;
            return { ...t, bestScore: maxScore };
          })
          .sort((a, b) => b.bestScore - a.bestScore);

        setTeams(settings.auto_semifinals ? rankedTeams.slice(0, 4) : rankedTeams.slice(0, 2));

        // ✅ Verificar se todas rodadas estão preenchidas (sem -1)
        const allCompleted = formattedTeams.every((team) =>
          visibleRounds.every((round: string | number) => team.points[round] !== -1)
        );
        setAllRoundsCompleted(allCompleted);

        if (settings.auto_semifinals) {
          // ✅ Verifica se todas as 4 equipes da semi-final já foram avaliadas
          const semiCompleted = formattedTeams
            .slice(0, 4)
            .every((t) => t.points?.["Semi-final"] !== undefined && t.points?.["Semi-final"] !== -1);

          if (semiCompleted) {
            // Seleciona os 2 melhores da semi-final com base na pontuação da Semi-final
            const top2 = formattedTeams
              .slice(0, 4)
              .sort((a, b) => (b.points?.["Semi-final"] ?? 0) - (a.points?.["Semi-final"] ?? 0))
              .slice(0, 2);

            // Avança para Final
            setTeams(top2);
            setFase("Final");
            setLabel("Modo: Finais");
            setPlayoffState("final"); // estado "final" indica que a final está em andamento
            if (!top2.every((t) => t.points?.["Final"] !== undefined && t.points?.["Final"] !== -1)) {
              setPlayoffState("andamento"); // se a final ainda não foi preenchida, mantém como "andamento"
            } else {
              setPlayoffState("encerrado"); // se a final já foi preenchida, marca como encerrado
            }
          } else {
            // Se ainda não completaram, mantém as 4 equipes e estado "andamento"
            setTeams(formattedTeams.slice(0, 4));
            setPlayoffState("andamento");
          }
        } else {
          // Caso não haja semi-final, apenas verifica se a final já foi preenchida
          const finalCompleted = formattedTeams
            .slice(0, 2)
            .every((t) => t.points?.["Final"] !== undefined && t.points?.["Final"] !== -1);

          if (finalCompleted) {
            setPlayoffState("encerrado");
          } else {
            setTeams(formattedTeams.slice(0, 2));
            setPlayoffState("andamento");
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [idEvento]);

  const handleSelectMission = (missionId: string, index: number, value: string | number) => {
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
    if (!selectedTeam || !fase) {
      alert("Selecione uma equipe!");
      return;
    }

    const equipe = teams.find((t) => t.id_team === Number(selectedTeam));
    if (!equipe) {
      alert("Equipe não encontrada!");
      return;
    }

    // 🚫 Bloqueio de reavaliação
    if (equipe.points && equipe.points[fase]) {
      alert(`Equipe já avaliada na ${fase}.`);
      return;
    }

    const confirm = window.confirm("Deseja realmente enviar a avaliação?");
    if (!confirm) return;

    try {
      setLoading(true);

      const updatedPoints = {
        ...equipe.points,
        [fase]: totalPoints,
      };

      // Extra de GP/PT
      const roundExtra: Record<string, any> = {};
      ["GP", "PT"].forEach((id) => {
        const mission = missions.find((m) => m.id === id);
        const response = responses[id];
        if (mission && response) {
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
          roundExtra[id] = { value, points };
        }
      });

      const newExtra = {
        ...(equipe.data_extra || {}),
        [fase]: roundExtra,
      };

      await supabase
        .from("team")
        .update({ points: updatedPoints, data_extra: newExtra })
        .eq("id_team", equipe.id_team);

      alert(`✅ Pontuação salva para ${equipe.name_team} na ${fase}: ${totalPoints}`);

      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar avaliação.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <main className="flex flex-col items-center py-6">
      <section className="w-full max-w-4xl flex flex-row items-center justify-between mb-6">
        <div className="flex flex-col items-start">
          <h1 className="text-2xl font-bold text-primary mb-2">Avaliação Playoffs</h1>
          <div className="flex gap-2">
            <p className="badge badge-outline badge-secondary">{label}</p>
            {playoffState === "andamento" && (
              <p className="badge badge-outline badge-info">Fase em andamento</p>
            )}
            {playoffState === "encerrado" && (
              <p className="badge badge-outline badge-success">Fase encerrada</p>
            )}
            {playoffState === "final" && (
              <p className="badge badge-outline badge-warning">Final em andamento</p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {!allRoundsCompleted && (
            <div className="alert alert-warning shadow-lg">
              ⚠️ Nem todas as rodadas foram concluídas ainda.
            </div>
          )}

          {selectedTeam && missions.length === 0 && (
            <div className="alert alert-warning">
              ⚠️ Nenhuma missão encontrada para esta temporada.
            </div>
          )}

          {/* 🚀 Mensagem de estado da fase */}
          {fase && playoffState === "andamento" && (
            <div className="alert alert-info shadow-lg">
              ⏳ A fase <b>{fase}</b> está em andamento.
            </div>
          )}

          {fase && playoffState === "encerrado" && (
            <div className="alert alert-success shadow-lg">
              ✅ Todas as equipes da <b>{fase}</b> foram avaliadas. Pontuações encerradas!
            </div>
          )}

          {fase === "Final" && playoffState === "final" && (
            <div className="alert alert-warning shadow-lg">
              🏆 A grande <b>Final</b> está em andamento!
            </div>
          )}
        </div>
      </section>

      <div className="text-left my-4 w-full max-w-4xl bg-base-200 p-6 rounded-md shadow-md border border-base-300">
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

      <div className="w-full mb-6 max-w-4xl">
        <select
          className="select select-bordered w-full"
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
        >
          <option value="">Selecione uma equipe</option>
          {teams.map((team) => {
            const jaAvaliada = team.points?.[fase ?? ""];
            return (
              <option
                key={team.id_team}
                value={team.id_team}
                disabled={!!jaAvaliada} // 🚫 trava reavaliação
              >
                {team.name_team}
                {jaAvaliada ? " (Já avaliada)" : ` `}
              </option>
            );
          })}
        </select>
      </div>

      {selectedTeam && missions.length > 0 && (
        <>
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

          {(() => {
            const equipe = teams.find((t) => t.id_team === Number(selectedTeam));
            const jaAvaliada = equipe?.points?.[fase ?? ""];

            return (
              <button
                className="btn btn-accent mt-6"
                onClick={handleSubmit}
                disabled={!!jaAvaliada}
              >
                {jaAvaliada
                  ? `Equipe já avaliada na ${fase}`
                  : `Enviar pontuação ${fase}`}
              </button>
            );
          })()}
        </>
      )}
    </main>
  );
}