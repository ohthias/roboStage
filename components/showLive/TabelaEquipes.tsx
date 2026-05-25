"use client";

import { useEffect, useMemo, useState } from "react";

import { TrophyIcon } from "@heroicons/react/24/solid";

import { createClient } from "@/utils/supabase/client";

import Loader from "../Loader";

const supabase = createClient();

interface Equipe {
  id_team: number;
  name_team: string;

  rounds: Record<string, number | null>;
}

interface EventSettings {
  highlight_winner: boolean;
  show_scores_after_round: boolean;
  show_brackets: boolean;
  auto_semifinals: boolean;
}

interface Props {
  idEvent: string;

  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;

  backgroundUrl?: string;
  backgroundBlur?: boolean;
}

export default function TabelaEquipes({
  idEvent,

  primaryColor = "#111827",
  secondaryColor = "#2563eb",
  textColor = "#ffffff",

  backgroundUrl,
  backgroundBlur = false,
}: Props) {
  const [loading, setLoading] = useState(true);

  const [equipes, setEquipes] = useState<Equipe[]>([]);

  const [visibleRounds, setVisibleRounds] = useState<string[]>([]);

  const [settings, setSettings] = useState<EventSettings>({
    highlight_winner: false,
    show_scores_after_round: false,
    show_brackets: false,
    auto_semifinals: false,
  });

  const [activeTab, setActiveTab] = useState<"ranking" | "playoffs">("ranking");

  useEffect(() => {
    let mounted = true;

    const fetchData = async (showLoader = false) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        const [teamsResponse, typeEventResponse, settingsResponse] =
          await Promise.all([
            supabase.from("view_team_json").select("*").eq("id_event", idEvent),

            supabase
              .from("typeEvent")
              .select("config")
              .eq("id_event", idEvent)
              .maybeSingle(),

            supabase
              .from("event_settings")
              .select(
                `
              highlight_winner,
              show_scores_after_round,
              show_brackets,
              auto_semifinals
            `,
              )
              .eq("id_evento", idEvent)
              .maybeSingle(),
          ]);

        if (teamsResponse.error) {
          throw teamsResponse.error;
        }

        const teams = (teamsResponse.data || []).map((team: any) => ({
          id_team: team.id_team,
          name_team: team.name_team,
          rounds: team.rounds || {},
        }));

        const roundsSet = new Set<string>();

        teams.forEach((team) => {
          Object.keys(team.rounds).forEach((round) => {
            if (round !== "Semi-final" && round !== "Final") {
              roundsSet.add(round);
            }
          });
        });

        const allRounds = Array.from(roundsSet);

        const visible = typeEventResponse.data?.config?.visibleRounds?.length
          ? typeEventResponse.data.config.visibleRounds.filter(
              (r: string) => r !== "Semi-final" && r !== "Final",
            )
          : allRounds;

        const sortedTeams = [...teams].sort((a, b) => {
          const maxA = Math.max(
            ...visible.map((r: string) => a.rounds[r] ?? 0),
          );

          const maxB = Math.max(
            ...visible.map((r: string) => b.rounds[r] ?? 0),
          );

          return maxB - maxA;
        });

        if (!mounted) return;

        setEquipes(sortedTeams);

        setVisibleRounds(visible);

        if (settingsResponse.data) {
          setSettings(settingsResponse.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    };

    fetchData(true);

    const interval = setInterval(() => {
      fetchData(false);
    }, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [idEvent]);

  const formatNota = (nota: number | null, round: string) => {
    if (settings.show_scores_after_round) {
      const allEvaluated = equipes.every(
        (eq) => eq.rounds[round] !== -1 && eq.rounds[round] !== null,
      );

      if (!allEvaluated) {
        return "-";
      }
    }

    if (nota === -1) {
      return "0";
    }

    if (nota === null || nota === undefined) {
      return "-";
    }

    return nota;
  };

  const semifinais = useMemo(
    () => equipes.filter((eq) => eq.rounds["Semi-final"] !== undefined),
    [equipes],
  );

  const finais = useMemo(
    () => equipes.filter((eq) => eq.rounds["Final"] !== undefined),
    [equipes],
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        backgroundColor: primaryColor,

        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,

        backgroundSize: "cover",

        backgroundPosition: "center",
      }}
    >
      {backgroundBlur && (
        <div className="absolute inset-0 backdrop-blur-md bg-black/40" />
      )}

      <div className="relative z-10 p-4">
        {settings.show_brackets && (
          <div className="tabs mb-6">
            <button
              onClick={() => setActiveTab("ranking")}
              className={`tab tab-lg ${
                activeTab === "ranking" ? "tab-active" : ""
              }`}
            >
              Ranking
            </button>

            <button
              onClick={() => setActiveTab("playoffs")}
              className={`tab tab-lg ${
                activeTab === "playoffs" ? "tab-active" : ""
              }`}
            >
              Playoffs
            </button>
          </div>
        )}

        {(!settings.show_brackets || activeTab === "ranking") && (
          <div className="overflow-x-auto rounded-2xl border border-white/10 backdrop-blur-xl bg-black/30">
            <table className="table table-zebra">
              <thead
                style={{
                  backgroundColor: secondaryColor,

                  color: textColor,
                }}
              >
                <tr>
                  <th className="text-center">#</th>

                  <th>Equipe</th>

                  {visibleRounds.map((round) => (
                    <th key={round} className="text-center">
                      {round}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {equipes.map((eq, idx) => {
                  const isWinner = settings.highlight_winner && idx === 0;

                  return (
                    <tr
                      key={eq.id_team}
                      className={isWinner ? "bg-yellow-500/20 font-bold" : ""}
                    >
                      <td className="text-center">{idx + 1}</td>

                      <td className="flex items-center gap-2">
                        {eq.name_team}

                        {isWinner && (
                          <TrophyIcon className="w-5 h-5 text-yellow-400" />
                        )}
                      </td>

                      {visibleRounds.map((round) => (
                        <td key={round} className="text-center">
                          {formatNota(eq.rounds[round] ?? null, round)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {settings.show_brackets && activeTab === "playoffs" && (
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-black mb-4 text-white">Semifinal</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {semifinais.map((eq) => (
                  <div
                    key={eq.id_team}
                    className="p-5 rounded-2xl shadow-xl backdrop-blur-xl bg-black/40 border border-white/10"
                    style={{
                      color: textColor,

                      backgroundColor: secondaryColor,
                    }}
                  >
                    {eq.name_team}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-black mb-4 text-white">Final</h2>

              <div className="grid grid-cols-1 gap-4">
                {finais.map((eq) => (
                  <div
                    key={eq.id_team}
                    className="p-5 rounded-2xl shadow-xl backdrop-blur-xl bg-black/40 border border-white/10"
                    style={{
                      color: textColor,

                      backgroundColor: secondaryColor,
                    }}
                  >
                    {eq.name_team}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
