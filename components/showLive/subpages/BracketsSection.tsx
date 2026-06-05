"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Loader from "@/components/Loader";
import { Trophy, Medal, ChevronRight, AlertTriangle } from "lucide-react";

const supabase = createClient();

interface Team {
  id_team: number;
  name_team: string;
  points: Record<string, number> | null;
}

interface EventSettings {
  auto_semifinals: boolean;
  enable_playoffs: boolean;
  highlight_winner?: boolean;
}

interface BracketsProps {
  eventId: number;
}

const INVALID_SCORE = -1;

export default function Brackets({ eventId }: BracketsProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const [
        { data: teamsData, error: teamsError },
        { data: settingsData, error: settingsError },
      ] = await Promise.all([
        supabase
          .from("team")
          .select("id_team, name_team, points")
          .eq("id_event", eventId),

        supabase
          .from("event_settings")
          .select(
            `
            auto_semifinals,
            enable_playoffs,
            highlight_winner
          `,
          )
          .eq("id_evento", eventId)
          .maybeSingle(),
      ]);

      if (teamsError) {
        console.error("Erro ao buscar equipes:", teamsError);
        setLoading(false);
        return;
      }

      if (settingsError) {
        console.error("Erro ao buscar configurações:", settingsError);
        setLoading(false);
        return;
      }

      setTeams((teamsData as Team[]) || []);

      setSettings({
        auto_semifinals: settingsData?.auto_semifinals ?? false,
        enable_playoffs: settingsData?.enable_playoffs ?? false,
        highlight_winner: settingsData?.highlight_winner ?? true,
      });

      setLoading(false);
    }

    fetchData();
  }, [eventId]);

  const getBestScore = (team: Team) => {
    if (!team.points) return 0;

    const validScores = Object.entries(team.points)
      .filter(
        ([round, value]) =>
          round !== "Semi-final" &&
          round !== "Final" &&
          typeof value === "number" &&
          value > INVALID_SCORE,
      )
      .map(([, value]) => value);

    return validScores.length ? Math.max(...validScores) : 0;
  };

  // Ranking geral
  const rankedTeams = useMemo(() => {
    return [...teams].sort((a, b) => getBestScore(b) - getBestScore(a));
  }, [teams]);

  const playoffsEnabled = settings?.enable_playoffs;

  // Semi-final automática = TOP 4 geral
  const semifinalists = useMemo(() => {
    if (!playoffsEnabled || !settings?.auto_semifinals) {
      return [];
    }

    return rankedTeams.slice(0, 4);
  }, [rankedTeams, playoffsEnabled, settings]);

  // Todas as equipes precisam ter score da semi
  const semifinalsFinished = useMemo(() => {
    if (!settings?.auto_semifinals) return false;

    if (semifinalists.length < 4) return false;

    return semifinalists.every((team) => {
      const score = team.points?.["Semi-final"];

      return typeof score === "number" && score !== INVALID_SCORE;
    });
  }, [semifinalists, settings]);

  // Ranking da semi
  const semifinalRanking = useMemo(() => {
    return [...semifinalists].sort(
      (a, b) =>
        (b.points?.["Semi-final"] ?? INVALID_SCORE) -
        (a.points?.["Semi-final"] ?? INVALID_SCORE),
    );
  }, [semifinalists]);

  // Finalistas
  const finalists = useMemo(() => {
    // Playoffs desativados
    if (!playoffsEnabled) return [];

    // Com semifinal automática
    if (settings?.auto_semifinals) {
      if (!semifinalsFinished) return [];

      return semifinalRanking.slice(0, 2);
    }

    // Somente final
    return rankedTeams.slice(0, 2);
  }, [
    playoffsEnabled,
    settings,
    semifinalsFinished,
    semifinalRanking,
    rankedTeams,
  ]);

  // Final concluída
  const finalsFinished = useMemo(() => {
    if (finalists.length < 2) return false;

    return finalists.every((team) => {
      const score = team.points?.["Final"];

      return typeof score === "number" && score !== INVALID_SCORE;
    });
  }, [finalists]);

  // Campeão
  const winner = useMemo(() => {
    if (!finalsFinished) return null;

    return [...finalists].sort(
      (a, b) =>
        (b.points?.["Final"] ?? INVALID_SCORE) -
        (a.points?.["Final"] ?? INVALID_SCORE),
    )[0];
  }, [finalists, finalsFinished]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <Loader />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="alert alert-error">
        Erro ao carregar configurações do evento.
      </div>
    );
  }

  if (!playoffsEnabled) {
    return (
      <div className="alert alert-info">
        Playoffs desativados para este evento.
      </div>
    );
  }

  return (
    <section className="space-y-10 px-4 md:px-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black text-primary">Playoffs</h1>

        <p className="text-base-content/70 mt-1">
          Acompanhe a classificação das equipes durante as fases eliminatórias.
        </p>
      </div>

      {/* SEMI-FINAL */}
      {settings.auto_semifinals && (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Medal className="w-5 h-5 text-primary" />

            <h2 className="text-2xl font-bold">Semi-final</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {semifinalRanking.map((team, index) => {
              const advanced = finalists.some(
                (f) => f.id_team === team.id_team,
              );

              return (
                <div
                  key={team.id_team}
                  className={`
                    rounded-2xl border p-5 transition-all shadow-sm
                    ${
                      advanced
                        ? "border-success bg-success/10"
                        : "border-base-300 bg-base-100"
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-base-content/50">
                        #{index + 1} Classificação
                      </p>

                      <h3 className="text-xl font-black">{team.name_team}</h3>
                    </div>

                    {advanced && (
                      <div className="badge badge-success gap-1">
                        Finalista
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  <div className="mt-5">
                    <p className="text-sm text-base-content/60">
                      Pontuação Semi-final
                    </p>

                    <p className="text-4xl font-black text-primary">
                      {team.points?.["Semi-final"] ?? "-"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {!semifinalsFinished && (
            <div className="alert alert-warning">
              <AlertTriangle className="w-5 h-5" />

              <span>
                A final será liberada apenas após todas as equipes
                semifinalistas receberem pontuação.
              </span>
            </div>
          )}
        </div>
      )}

      {/* FINAL */}
      {(!settings.auto_semifinals || semifinalsFinished) && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <Trophy className="w-5 h-5 text-warning" />

            <h2 className="text-2xl font-bold">Final</h2>

            {!settings.auto_semifinals && (
              <div className="badge badge-primary">TOP 2 Geral</div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {finalists.map((team) => {
              const isWinner = winner?.id_team === team.id_team;

              return (
                <div
                  key={team.id_team}
                  className={`
                    rounded-2xl border p-6 transition-all shadow-sm
                    ${
                      isWinner
                        ? "border-warning bg-warning/20"
                        : "border-base-300 bg-base-100"
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-base-content/50">
                        Finalista
                      </p>

                      <h3 className="text-2xl font-black">{team.name_team}</h3>
                    </div>

                    {isWinner && settings.highlight_winner && (
                      <div className="badge badge-warning badge-lg gap-2">
                        <Trophy className="w-4 h-4" />
                        Campeão
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <p className="text-sm text-base-content/60">
                      Pontuação Final
                    </p>

                    <p className="text-5xl font-black text-warning">
                      {team.points?.["Final"] ?? "-"}
                    </p>
                  </div>

                  {!settings.auto_semifinals && (
                    <div className="mt-4 text-xs text-base-content/60">
                      Classificação geral: #
                      {rankedTeams.findIndex(
                        (t) => t.id_team === team.id_team,
                      ) + 1}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!finalsFinished && (
            <div className="alert alert-info">
              Aguardando lançamento de todas as pontuações da final.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
