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
  nameEvent?: string;
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  backgroundUrl?: string;
  backgroundBlur?: boolean;
}

export default function TabelaEquipes({
  idEvent,
  nameEvent,
  primaryColor,
  secondaryColor,
  textColor,
  backgroundUrl,
  backgroundBlur,
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
  const [theme, setTheme] = useState({
    primary: primaryColor || "#111827",
    secondary: secondaryColor || "#2563eb",
    text: textColor || "#ffffff",
    background: backgroundUrl || "",
    blur: backgroundBlur ?? false,
  });

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
        const config = typeEventResponse.data?.config || {};
        const preset = config?.preset || {};
        const presetColors = Array.isArray(preset.colors) ? preset.colors : [];

        if (mounted) {
          setTheme({
            primary: primaryColor || presetColors[0] || "#111827",
            secondary: secondaryColor || presetColors[1] || "#2563eb",
            text: textColor || presetColors[2] || "#ffffff",
            background: backgroundUrl || preset.url_background || "",
            blur: backgroundBlur ?? preset.background_blur ?? false,
          });
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

        const visible =
          config?.visibleRounds?.length > 0
            ? config.visibleRounds.filter(
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
  }, [
    idEvent,
    primaryColor,
    secondaryColor,
    textColor,
    backgroundUrl,
    backgroundBlur,
  ]);

  const formatNota = (
    nota: number | null,
    round: string,
  ) => {
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
    <div className="relative min-h-screen overflow-hidden">
      <h1 className="text-3xl font-bold text-white mb-2 text-center" style={{color: primaryColor}}>{nameEvent}</h1>
      <p className="text-white/70 text-center uppercase tracking-wider">Ranking - Geral</p>
      <div className="relative z-10 p-4 md:p-8">
        {settings.show_brackets && (
          <div className="tabs tabs-box w-fit mb-6 bg-black/40 backdrop-blur-xl">
            <button
              onClick={() => setActiveTab("ranking")}
              className={`tab ${activeTab === "ranking" ? "tab-active" : ""}`}
            >
              Ranking
            </button>

            <button
              onClick={() => setActiveTab("playoffs")}
              className={`tab ${activeTab === "playoffs" ? "tab-active" : ""}`}
            >
              Playoffs
            </button>
          </div>
        )}

        {(!settings.show_brackets || activeTab === "ranking") && (
          <div className="overflow-x-auto rounded-3xl bg-base-300 shadow-2xl">
            <table className="table table-zebra">
              <thead
                style={{
                  backgroundColor: theme.secondary,

                  color: theme.text,
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
                          {formatNota(
                            eq.rounds[round] ?? null,

                            round,
                          )}
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
                    className="card bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl"
                  >
                    <div
                      className="card-body font-bold"
                      style={{
                        backgroundColor: theme.secondary,

                        color: theme.text,
                      }}
                    >
                      {eq.name_team}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-black mb-4 text-white">Final</h2>

              <div className="grid gap-4">
                {finais.map((eq) => (
                  <div
                    key={eq.id_team}
                    className="card bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl"
                  >
                    <div
                      className="card-body font-bold"
                      style={{
                        backgroundColor: theme.secondary,

                        color: theme.text,
                      }}
                    >
                      {eq.name_team}
                    </div>
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
