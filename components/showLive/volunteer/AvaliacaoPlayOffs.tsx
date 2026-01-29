"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { sumAllMissions } from "@/utils/scores";
import FormMission from "@/components/FormMission/FormMission";
import Loader from "@/components/Loader";

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

        // ⚙️ Buscar configurações e dados do evento em paralelo
        const [
          { data: settings },
          { data: eventConfig, error: configError },
          { data: teamsData, error: teamsError },
          missionsRes,
        ] = await Promise.all([
          supabase
            .from("event_settings")
            .select("enable_playoffs, auto_semifinals")
            .eq("id_evento", idEvento)
            .single(),

          supabase
            .from("typeEvent")
            .select("config")
            .eq("id_event", idEvento)
            .maybeSingle(),

          supabase
            .from("view_team_json")
            .select("id_team, name_team, rounds")
            .eq("id_event", idEvento),

          fetch("/api/data/missions"),
        ]);

        if (configError) throw configError;
        if (teamsError) throw teamsError;

        // ⚙️ Verificar se playoffs estão habilitados
        if (!settings || !settings.enable_playoffs) {
          setLabel("Playoffs não habilitados");
          return;
        }

        // 🏁 Definir fase e rótulo
        const isSemi = settings.auto_semifinals;
        setFase(isSemi ? "Semi-final" : "Final");
        setLabel(isSemi ? "Modo: Semi-finais" : "Modo: Finais");

        // 🧩 Configuração do evento
        const config = eventConfig?.config || {};
        const visibleRounds = config.rodadas || [];
        setRoundsOrder(visibleRounds);

        const season = (config.temporada || "").toLowerCase();

        // 📂 Missões da temporada
        const missionsData = await missionsRes.json();
        if (missionsData[season]) {
          setMissions(missionsData[season]);
        } else {
          console.warn(`⚠️ Temporada '${season}' não encontrada em missions.json`);
          setMissions([]);
        }

        // 👥 Equipes
        const formattedTeams = (teamsData || []).map((t) => ({
          ...t,
          points: t.rounds || Object.fromEntries(visibleRounds.map((r: any) => [r, -1])),
        }));

        // 🏆 Ranking pela melhor pontuação
        const rankedTeams = formattedTeams
          .map((t) => {
            const scores = Object.values(t.points || {}) as number[];
            const validScores = scores.filter((s) => typeof s === "number" && s >= 0);
            const maxScore = validScores.length > 0 ? Math.max(...validScores) : 0;
            return { ...t, bestScore: maxScore };
          })
          .sort((a, b) => b.bestScore - a.bestScore);

        const topTeams = isSemi ? rankedTeams.slice(0, 4) : rankedTeams.slice(0, 2);
        setTeams(topTeams);

        // ✅ Verificar se todas as rodadas estão completas
        const allCompleted = formattedTeams.every((team) =>
          visibleRounds.every((round: string | number) => team.points[round] !== -1)
        );
        setAllRoundsCompleted(allCompleted);

        if (isSemi) {
          // ✅ Semi-final concluída
          const semiCompleted = topTeams.every(
            (t) => t.points?.["Semi-final"] !== undefined && t.points?.["Semi-final"] !== -1
          );

          if (semiCompleted) {
            // 🏁 Selecionar finalistas
            const top2 = topTeams
              .sort((a, b) => (b.points?.["Semi-final"] ?? 0) - (a.points?.["Semi-final"] ?? 0))
              .slice(0, 2);

            setTeams(top2);
            setFase("Final");
            setLabel("Modo: Finais");

            const finalCompleted = top2.every(
              (t) => t.points?.["Final"] !== undefined && t.points?.["Final"] !== -1
            );
            setPlayoffState(finalCompleted ? "encerrado" : "andamento");
          } else {
            setPlayoffState("andamento");
          }
        } else {
          // ⚙️ Finais diretas
          const finalCompleted = topTeams.every(
            (t) => t.points?.["Final"] !== undefined && t.points?.["Final"] !== -1
          );
          setPlayoffState(finalCompleted ? "encerrado" : "andamento");
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    if (idEvento) loadData();
  }, [idEvento]);

  const handleSelectMission = (missionId: string, index: number, value: string | number) => {
    setResponses((prev) => ({
      ...prev,
      [missionId]: { ...prev[missionId], [index]: value },
    }));
  };

  const totalPoints = useMemo(() => sumAllMissions(
    missions.filter((m) => m.id !== "GP"),
    responses
  ), [missions, responses]);


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

  if (!allRoundsCompleted) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <div className="alert bg-warning/25 border border-warning/50 shadow-lg flex flex-col items-center max-w-3xl">
          <h1 className="text-3xl font-bold text-warning">
            Até o momento, a avaliação dos playoffs não está disponível! ⏳
          </h1>
          <p className="text-base-content text-lg font-semibold">
            Aguarde até que todas as equipes tenham suas rodadas avaliadas.
          </p>
          <p className="text-base-content/75 mt-2 font-italic text-center">
            A avaliação dos playoffs será liberada automaticamente assim que todas as equipes tiverem suas rodadas avaliadas. Fique atento!
          </p>
        </div>
      </main>
    )
  }

  if (fase && playoffState === "encerrado") {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <div className="alert bg-success/25 border border-success/50 shadow-lg flex flex-col items-center max-w-3xl">
          <h1 className="text-3xl font-bold text-success">
            Avaliação dos Playoffs Encerrada! 🎉
          </h1>
          <p className="text-base-content text-lg font-semibold">
            A fase de playoffs foi concluída com sucesso.
          </p>
          <p className="text-base-content/75 mt-2 font-italic text-center">
            Parabéns a todos os participantes e à equipe vencedora! Obrigado por fazerem parte deste evento. Os resultados finais já estão disponíveis para o administrador do evento.
          </p>
        </div>
      </main>
    );
  }

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