"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

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

      // 1. Pegar equipes
      const { data: teamsData, error: teamsError } = await supabase
        .from("team")
        .select("*")
        .eq("id_event", eventId);

      if (teamsError) {
        console.error("Erro ao buscar equipes:", teamsError);
        setLoading(false);
        return;
      }

      // 2. Pegar configurações do evento
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
        // Ordenar pelo melhor score registrado (qualquer rodada)
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

  if (loading) return <div>Carregando equipes...</div>;
  if (!settings) return <div>Erro ao carregar configurações do evento</div>;

  const showSemifinals = settings.auto_semifinals;

  // Semi-final: top 4
  const semiFinal = showSemifinals
    ? teams
        .filter((t) => t.points?.["Semi-final"] !== undefined) // só equipes avaliadas
        .slice(0, 4)
    : [];

  // Final: top 2
  const final = showSemifinals
    ? semiFinal
        .filter((t) => t.points?.["Final"] !== undefined) // se já avaliadas
        .slice(0, 2)
    : teams
        .filter((t) => t.points?.["Final"] !== undefined)
        .slice(0, 2);

  return (
    <div className="p-4">
      {showSemifinals && (
        <>
          <h2 className="text-xl font-bold mb-4">Semi-Final</h2>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {semiFinal.map((team) => (
              <div key={team.id_team} className="p-4 border rounded shadow bg-blue-100">
                <p className="font-semibold">{team.name_team}</p>
                <p>Pontos: {team.points?.["Semi-final"] ?? 0}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="text-xl font-bold mb-4">Final</h2>
      <div className="grid grid-cols-2 gap-4">
        {final.map((team) => (
          <div key={team.id_team} className="p-4 border rounded shadow bg-yellow-100">
            <p className="font-semibold">{team.name_team}</p>
            <p>Pontos: {team.points?.["Final"] ?? 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}