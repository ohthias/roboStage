"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import Loader from "../Loader";
import { TrophyIcon } from "@heroicons/react/24/solid";

interface Equipe {
  id_team: number;
  name_team: string;
  rounds: { [key: string]: number | null };
}

interface EventSettings {
  highlight_winner: boolean;
  show_scores_after_round: boolean;
  show_brackets: boolean;
  auto_semifinals: boolean;
}

interface TabelaEquipesProps {
  idEvent: string;
  primaryColor: string;
  secondaryColor: string;
  textColor?: string;
}

export default function TabelaEquipes({ idEvent, primaryColor, secondaryColor, textColor }: TabelaEquipesProps) {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [visibleRounds, setVisibleRounds] = useState<string[]>([]);
  const [rodadas, setRodadas] = useState<string[]>([]);
  const [settings, setSettings] = useState<EventSettings>({
    highlight_winner: false,
    show_scores_after_round: false,
    show_brackets: false,
    auto_semifinals: false,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ranking" | "playoffs">("ranking");

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchEquipes = async (showLoader = false) => {
      if (showLoader) setLoading(true);

      try {
        const { data: teamsData, error: teamsError } = await supabase
          .from("view_team_json")
          .select("*")
          .eq("id_event", idEvent);

        if (teamsError) throw teamsError;

        const { data: typeEvent } = await supabase
          .from("typeEvent")
          .select("*")
          .eq("id_event", idEvent)
          .maybeSingle();

        const { data: eventSettings } = await supabase
          .from("event_settings")
          .select("highlight_winner, show_scores_after_round, show_brackets, auto_semifinals")
          .eq("id_evento", idEvent)
          .maybeSingle();

        if (eventSettings) setSettings(eventSettings);

        const equipesFormatadas: Equipe[] = (teamsData || []).map((team: any) => ({
          id_team: team.id_team,
          name_team: team.name_team,
          rounds: team.rounds || {},
        }));

        const allRounds = new Set<string>();
        equipesFormatadas.forEach(team =>
          Object.keys(team.rounds).forEach(r => allRounds.add(r))
        );

        let roundsArray = Array.from(allRounds).filter(r => r !== "Semi-final" && r !== "Final");

        const roundsToShow =
          typeEvent?.config?.visibleRounds && typeEvent.config.visibleRounds.length > 0
            ? typeEvent.config.visibleRounds.filter((r: string) => r !== "Semi-final" && r !== "Final")
            : roundsArray;

        const equipesOrdenadas = equipesFormatadas.sort((a, b) => {
          const maxA = Math.max(...roundsToShow.map((r: string | number) => a.rounds[r] ?? 0));
          const maxB = Math.max(...roundsToShow.map((r: string | number) => b.rounds[r] ?? 0));
          return maxB - maxA;
        });

        setVisibleRounds(roundsToShow);
        setRodadas(roundsArray);
        setEquipes(equipesOrdenadas);
      } catch (err) {
        console.error(err);
      } finally {
        if (showLoader) setLoading(false);
      }
    };

    if (idEvent) {
      fetchEquipes(true);
      intervalId = setInterval(() => fetchEquipes(false), 10000);
    }

    return () => clearInterval(intervalId);
  }, [idEvent]);

  const formatNota = (nota: number | null, round: string) => {
    if (settings.show_scores_after_round) {
      const allEvaluated = equipes.every(eq => eq.rounds[round] !== -1 && eq.rounds[round] !== null);
      if (!allEvaluated) return "-";
    }
    if (nota === -1) return "0";
    if (nota === null || nota === undefined) return "-";
    return nota;
  };

  const renderRanking = () => (
    <table className="table table-zebra w-full bg-base-100">
      <thead className="bg-primary text-primary-content" style={{ backgroundColor: secondaryColor, color: textColor }}>
        <tr>
          <th className="text-center">Posição</th>
          <th>Equipe</th>
          {visibleRounds.map((round, idx) => (
            <th key={idx} className="text-center">{round}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {equipes.map((eq, idx) => {
          const isWinner = settings.highlight_winner && idx === 0;
          return (
            <tr key={eq.id_team} className={isWinner ? "bg-yellow-100 border-2 border-yellow-400 shadow-md font-bold" : ""}>
              <td className="text-center">{idx + 1}</td>
              <td className="truncate flex items-center gap-1">
                {eq.name_team} {isWinner && <TrophyIcon className="w-5 h-5 text-yellow-500" />}
              </td>
              {visibleRounds.map((round, i) => (
                <td key={i} className="text-center">{formatNota(eq.rounds[round] ?? null, round)}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  const renderPlayoffs = () => {

    const semifinais = equipes.filter(eq => eq.rounds["Semi-final"] !== undefined);
    const finais = equipes.filter(eq => eq.rounds["Final"] !== undefined);

    const roundsOpen = semifinais.concat(finais).some(eq =>
      ["Semi-final", "Final"].some(r => eq.rounds[r] === -1 || eq.rounds[r] === null)
    );

    if (roundsOpen) {
      return <p className="text-red-500 font-bold">Os resultados da semifinal/final só estarão disponíveis quando todas as equipes forem avaliadas.</p>;
    }

    const campeao = equipes[0];

    // Estilo mata-mata simples
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-bold mb-2" style={{ color: textColor }}>Semifinal</h3>
          <div className="grid grid-cols-2 gap-4">
            {semifinais.map(eq => (
              <div
                key={eq.id_team}
                className="p-2 rounded shadow-md flex justify-center"
                style={{ backgroundColor: secondaryColor, color: textColor }}
              >
                {eq.name_team}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-2" style={{ color: textColor }}>Final</h3>
          <div className="grid grid-cols-1 gap-4 justify-items-center">
            {finais.map(eq => (
              <div
                key={eq.id_team}
                className="p-2 rounded shadow-md flex justify-center"
                style={{ backgroundColor: secondaryColor, color: textColor }}
              >
                {eq.name_team}
              </div>
            ))}
          </div>
        </div>

        <h3 className="text-lg font-bold mt-4 flex items-center gap-1" style={{ color: textColor }}>
          Campeão: {campeao.name_team} <TrophyIcon className="w-5 h-5 text-yellow-500" />
        </h3>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full p-4">
      {settings.show_brackets && (
        <div className="tabs mb-4">
          <button
            className={`tab tab-lifted ${activeTab === "ranking" ? "tab-active" : ""}`}
            style={{ color: textColor, backgroundColor: secondaryColor }}
            onClick={() => setActiveTab("ranking")}
          >
            Ranking
          </button>
          <button
            className={`tab tab-lifted ${activeTab === "playoffs" ? "tab-active" : ""}`}
            style={{ color: textColor, backgroundColor: secondaryColor }}
            onClick={() => setActiveTab("playoffs")}
          >
            Playoffs
          </button>
        </div>
      )}

      {(!settings.show_brackets || activeTab === "ranking") && renderRanking()}
      {settings.show_brackets && activeTab === "playoffs" && renderPlayoffs()}
    </div>
  );
}