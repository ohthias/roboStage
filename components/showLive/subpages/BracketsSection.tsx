"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import Loader from "@/components/Loader";

interface Team {
  id_team: number;
  name_team: string;
  points: { [key: string]: number } | null;
}

interface EventSettings {
  auto_semifinals: boolean;
}

interface BracketsProps {
  eventId: number;
}

export default function Brackets({ eventId }: BracketsProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const { data: teamsData, error: teamsError } = await supabase
        .from("team")
        .select("*")
        .eq("id_event", eventId);

      if (teamsError) {
        console.error("Erro ao buscar equipes:", teamsError);
        setLoading(false);
        return;
      }

      const { data: settingsData, error: settingsError } = await supabase
        .from("event_settings")
        .select("auto_semifinals")
        .eq("id_evento", eventId)
        .single();

      if (settingsError) {
        console.error("Erro ao buscar configurações:", settingsError);
        setLoading(false);
        return;
      }

      setSettings(settingsData);

      if (teamsData) {
        // Ordenar pelo melhor score registrado em qualquer rodada
        const sortedTeams = teamsData.sort((a: Team, b: Team) => {
          const aScore = Math.max(...Object.values(a.points || {}));
          const bScore = Math.max(...Object.values(b.points || {}));
          return bScore - aScore;
        });
        setTeams(sortedTeams);
      }

      setLoading(false);
    }

    fetchData();
  }, [eventId]);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader /></div>;
  if (!settings) return <div className="alert alert-error">Erro ao carregar configurações do evento</div>;

  const showSemifinals = settings.auto_semifinals;

  // Semi-final: top 4 baseados na pontuação da semi-final
  const semiFinal = showSemifinals
    ? teams
        .filter(t => t.points && t.points["Semi-final"] !== undefined)
        .sort((a, b) => (b.points!["Semi-final"] - a.points!["Semi-final"]))
        .slice(0, 4)
    : [];

  // Final
  const finalTeams = showSemifinals
    ? semiFinal
        .sort((a, b) => (b.points?.["Semi-final"] ?? 0) - (a.points?.["Semi-final"] ?? 0))
        .slice(0, 2)
    : teams
        .filter(t => t.points && t.points["Final"] !== undefined)
        .sort((a, b) => (b.points!["Final"] - a.points!["Final"]))
        .slice(0, 2);

  // Determinar vencedor da final
  const winnerTeam = finalTeams.length === 2
    ? (finalTeams[0].points!["Final"] >= finalTeams[1].points!["Final"] ? finalTeams[0] : finalTeams[1])
    : finalTeams[0];

  return (
    <div className="px-4 md:px-8">
      <h1 className="text-2xl font-bold mb-4 text-primary">Playoffs do Evento</h1>
      <p className="text-base-content/75 text-sm mb-4">As melhores equipes competem pelo título!</p>

      {showSemifinals && (
        <>
          <h2 className="text-xl font-bold mb-4">Semi-Final</h2>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {semiFinal.map((team) => {
              const advanced = finalTeams.includes(team);
              return (
                <div
                  key={team.id_team}
                  className={`p-4 border rounded shadow transition-all ${advanced ? "bg-green-200 border-green-500" : "bg-blue-100 border-blue-500"
                    }`}
                >
                  <p className="font-semibold text-base-content/75 text-sm">{team.name_team}</p>
                  <p className="text-base-content text-lg font-bold">Pontos: {team.points?.["Semi-final"] ?? 0}</p>
                  {advanced && <p className="text-sm text-green-700 font-bold">Avançou →</p>}
                </div>
              );
            })}
          </div>
        </>
      )}

      <h2 className="text-xl font-bold mb-4">Final</h2>
      <div className="grid grid-cols-2 gap-4">
        {finalTeams.map((team) => (
          <div
            key={team.id_team}
            className={`p-4 border rounded shadow transition-all ${team === winnerTeam ? "bg-yellow-300 border-yellow-500" : "bg-yellow-100 border-yellow-300"
              }`}
          >
            <p className="font-semibold text-base-content/75 text-sm">{team.name_team}</p>
            <p className="text-base-content text-lg font-bold">Pontos: {team.points?.["Final"] ?? 0}</p>
            {team === winnerTeam && <p className="text-sm text-red-700 font-bold">Vencedor 🏆</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
