"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

import { Trophy, ShieldCheck, Swords, Crown, Medal } from "lucide-react";

import Loader from "@/components/Loader";
import FormMission from "@/components/FormMission/FormMission";

import { sumAllMissions } from "@/utils/scores";

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

interface Team {
  id_team: number;
  name_team: string;
  points: Record<string, number>;
  data_extra?: any;
  bestScore: number;
}

interface EventSettings {
  enable_playoffs: boolean;
  auto_semifinals: boolean;
}

type PlayoffPhase = "Semi-final" | "Final";

export default function AvaliacaoPlayOffs({ idEvento }: { idEvento: number }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState<EventSettings | null>(null);

  const [missions, setMissions] = useState<MissionType[]>([]);

  const [responses, setResponses] = useState<ResponseType>({});

  const [selectedTeam, setSelectedTeam] = useState("");

  const [fase, setFase] = useState<PlayoffPhase | null>(null);

  const [semiTeams, setSemiTeams] = useState<Team[]>([]);

  const [finalTeams, setFinalTeams] = useState<Team[]>([]);

  const [allRoundsCompleted, setAllRoundsCompleted] = useState(false);

  const [seasonLabel, setSeasonLabel] = useState("");

  useEffect(() => {
    loadData();
  }, [idEvento]);

  async function loadData() {
    try {
      setLoading(true);

      const [
        { data: settingsData, error: settingsError },
        { data: configData, error: configError },
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
          .single(),

        supabase.from("team").select("*").eq("id_event", idEvento),

        fetch("/api/data/missions"),
      ]);

      if (settingsError) throw settingsError;
      if (configError) throw configError;
      if (teamsError) throw teamsError;

      setSettings(settingsData);

      if (!settingsData.enable_playoffs) {
        setLoading(false);
        return;
      }

      const config = configData?.config || {};

      const rounds: string[] = config.rodadas || [];

      const season = (config.temporada || "").toLowerCase();

      setSeasonLabel(config.temporada || "");

      const missionsJson = await missionsRes.json();

      setMissions(missionsJson?.[season] || []);

      const formattedTeams: Team[] = (teamsData || []).map((team) => {
        const points = team.points || {};

        const validScores = Object.entries(points)
          .filter(
            ([round, value]) =>
              !["Semi-final", "Final"].includes(round) &&
              typeof value === "number" &&
              value >= 0,
          )
          .map(([, value]) => Number(value));

        const bestScore = validScores.length > 0 ? Math.max(...validScores) : 0;

        return {
          ...team,
          points,
          bestScore,
        };
      });

      const ranking = [...formattedTeams].sort(
        (a, b) => b.bestScore - a.bestScore,
      );

      const roundsCompleted = formattedTeams.every((team) =>
        rounds.every((round) => {
          const value = team.points?.[round];

          return typeof value === "number" && value >= 0;
        }),
      );

      setAllRoundsCompleted(roundsCompleted);

      // SEMIFINAIS
      if (settingsData.auto_semifinals) {
        const top4 = ranking.slice(0, 4);

        setSemiTeams(top4);

        const semiCompleted = top4.every((team) => {
          const value = team.points?.["Semi-final"];

          return typeof value === "number" && value >= 0;
        });

        if (!semiCompleted) {
          setFase("Semi-final");
          setFinalTeams([]);
        } else {
          const finalists = [...top4]
            .sort(
              (a, b) =>
                (b.points?.["Semi-final"] ?? 0) -
                (a.points?.["Semi-final"] ?? 0),
            )
            .slice(0, 2);

          setFinalTeams(finalists);

          const finalCompleted = finalists.every((team) => {
            const value = team.points?.["Final"];

            return typeof value === "number" && value >= 0;
          });

          if (!finalCompleted) {
            setFase("Final");
          } else {
            setFase(null);
          }
        }
      }

      // FINAL DIRETA
      else {
        const top2 = ranking.slice(0, 2);

        setFinalTeams(top2);

        const finalCompleted = top2.every((team) => {
          const value = team.points?.["Final"];

          return typeof value === "number" && value >= 0;
        });

        if (!finalCompleted) {
          setFase("Final");
        } else {
          setFase(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const teamsToEvaluate = useMemo(() => {
    if (fase === "Semi-final") {
      return semiTeams;
    }

    if (fase === "Final") {
      return finalTeams;
    }

    return [];
  }, [fase, semiTeams, finalTeams]);

  const totalPoints = useMemo(() => {
    return sumAllMissions(
      missions.filter((m) => m.id !== "GP"),
      responses,
    );
  }, [missions, responses]);

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

  async function handleSubmit() {
    if (!selectedTeam || !fase) {
      alert("Selecione uma equipe.");
      return;
    }

    const team = teamsToEvaluate.find(
      (t) => t.id_team === Number(selectedTeam),
    );

    if (!team) {
      alert("Equipe inválida.");
      return;
    }

    const alreadyScored = team.points?.[fase];

    if (typeof alreadyScored === "number" && alreadyScored >= 0) {
      alert(`Equipe já avaliada na ${fase}.`);
      return;
    }

    const confirmSubmit = window.confirm(
      `Deseja enviar a pontuação da ${fase}?`,
    );

    if (!confirmSubmit) return;

    try {
      setLoading(true);

      const updatedPoints = {
        ...team.points,
        [fase]: totalPoints,
      };

      const extraData: Record<string, any> = {};

      ["GP", "PT"].forEach((id) => {
        const mission = missions.find((m) => m.id === id);

        const response = responses[id];

        if (!mission || !response) return;

        const index = Object.values(response)[0];

        let points = 0;

        if (Array.isArray(mission.points)) {
          points = mission.points[index as number] ?? 0;
        } else {
          points = mission.points;
        }

        extraData[id] = {
          value: index,
          points,
        };
      });

      const updatedExtra = {
        ...(team.data_extra || {}),
        [fase]: extraData,
      };

      const { error } = await supabase
        .from("team")
        .update({
          points: updatedPoints,
          data_extra: updatedExtra,
        })
        .eq("id_team", team.id_team);

      if (error) throw error;

      alert(`Pontuação enviada com sucesso para ${team.name_team}.`);

      setResponses({});
      setSelectedTeam("");

      await loadData();

      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar pontuação.");
    } finally {
      setLoading(false);
    }
  }

  const playoffLevel = fase === "Semi-final" ? "Semifinais" : "Grande Final";

  const playoffIcon =
    fase === "Semi-final" ? (
      <ShieldCheck className="w-8 h-8 text-info" />
    ) : (
      <Crown className="w-8 h-8 text-warning" />
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!settings?.enable_playoffs) {
    return (
      <div className="alert alert-warning">
        Playoffs desativadas neste evento.
      </div>
    );
  }

  if (!allRoundsCompleted) {
    return (
      <main className="flex items-center justify-center min-h-screen px-4">
        <div className="alert bg-warning/20 border border-warning/40 max-w-3xl shadow-xl">
          <div>
            <h2 className="font-bold text-xl">
              Rodadas principais ainda em andamento
            </h2>

            <p className="mt-2 text-sm opacity-80">
              As playoffs serão liberadas automaticamente quando todas as
              equipes tiverem pontuações válidas em todas as rodadas.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!fase) {
    return (
      <main className="flex items-center justify-center min-h-screen px-4">
        <div className="alert bg-success/20 border border-success/40 max-w-3xl shadow-xl">
          <div>
            <h2 className="font-bold text-2xl">Playoffs encerradas 🎉</h2>

            <p className="mt-2 opacity-80">
              Todas as avaliações já foram concluídas.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-xl mb-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="badge badge-primary badge-lg">{seasonLabel}</div>

              <div className="badge badge-secondary badge-lg">Playoffs</div>

              {settings.auto_semifinals && (
                <div className="badge badge-outline">Sistema automático</div>
              )}
            </div>

            <h1 className="text-4xl font-black flex items-center gap-3">
              <Swords className="w-9 h-9 text-error" />
              Avaliação dos Playoffs
            </h1>

            <p className="opacity-70 mt-2 text-base">
              Área exclusiva para avaliação das equipes classificadas.
            </p>
          </div>

          <div className="bg-base-200 rounded-2xl px-6 py-5 border border-base-300 min-w-[260px]">
            <div className="flex items-center gap-3 mb-2">
              {playoffIcon}

              <div>
                <p className="text-sm opacity-70">Fase atual</p>

                <h2 className="text-2xl font-black">{playoffLevel}</h2>
              </div>
            </div>

            <p className="text-sm opacity-70">
              {fase === "Semi-final"
                ? "Top 4 equipes disputando vaga na final."
                : "As 2 melhores equipes disputam o título."}
            </p>
          </div>
        </div>
      </div>

      {/* EQUIPES */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {teamsToEvaluate.map((team) => {
          const score = team.points?.[fase];

          const evaluated = typeof score === "number" && score >= 0;

          return (
            <div
              key={team.id_team}
              className={`rounded-3xl border p-5 transition-all ${
                evaluated
                  ? "border-success bg-success/10"
                  : "border-base-300 bg-base-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Medal className="w-5 h-5 text-warning" />

                    <h2 className="text-xl font-bold">{team.name_team}</h2>
                  </div>

                  <p className="text-sm opacity-70 mt-1">
                    Equipe classificada para{" "}
                    {fase === "Semi-final" ? "as semifinais" : "a grande final"}
                  </p>
                </div>

                {evaluated ? (
                  <div className="badge badge-success">Avaliada</div>
                ) : (
                  <div className="badge badge-outline">Pendente</div>
                )}
              </div>

              <div className="mt-5 rounded-2xl bg-base-200 px-4 py-3 border border-base-300">
                <div className="text-sm opacity-70">Status da avaliação</div>

                <div className="text-lg font-bold mt-1">
                  {evaluated ? "Pontuação registrada" : "Aguardando avaliação"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FORM */}
      <div className="card bg-base-100 border border-base-300 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-2">
            {playoffIcon}

            <div>
              <h2 className="card-title text-3xl">Registrar avaliação</h2>

              <p className="text-sm opacity-70">
                Fase atual: <b>{playoffLevel}</b>
              </p>
            </div>
          </div>

          <div className="alert bg-info/10 border border-info/30 my-4">
            <div>
              <p className="font-semibold">
                As pontuações das playoffs não são exibidas para os voluntários.
              </p>

              <p className="text-sm opacity-70">
                Apenas o status da avaliação é mostrado nesta interface.
              </p>
            </div>
          </div>

          <select
            className="select select-bordered w-full mb-6"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <option value="">Selecione uma equipe</option>

            {teamsToEvaluate.map((team) => {
              const alreadyScored =
                typeof team.points?.[fase] === "number" &&
                team.points?.[fase] >= 0;

              return (
                <option
                  key={team.id_team}
                  value={team.id_team}
                  disabled={alreadyScored}
                >
                  {team.name_team}
                  {alreadyScored ? " • Avaliada" : ""}
                </option>
              );
            })}
          </select>

          {selectedTeam && missions.length > 0 && (
            <>
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

              <div className="mt-8 flex items-center justify-between flex-wrap gap-4">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleSubmit}
                >
                  Enviar avaliação da {playoffLevel}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}