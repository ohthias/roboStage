import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

interface PropsRankingSection {
  idEvent: number | null;
}

interface Team {
  id_team: number;
  name_team: string;
  points: { [key: string]: number };
}

export default function RankingSection({ idEvent }: PropsRankingSection) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchTeams = async () => {
      if (!idEvent) return;

      const { data, error } = await supabase
        .from("team")
        .select("*")
        .eq("id_event", idEvent);

      if (error) {
        setError("Erro ao buscar equipes: " + error.message);
      } else {
        setTeams(data as Team[]);
      }
      setLoading(false);
    };

    fetchTeams();
  }, [idEvent]);

  if (!idEvent) {
    return (
      <div className="alert alert-error shadow-lg">
        <span>Evento inválido.</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg">
        <span>{error}</span>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        Nenhuma equipe cadastrada.
      </p>
    );
  }

  // Ordenar pela maior pontuação atingida em qualquer rodada
  const sortedTeams = [...teams].sort((a, b) => {
    const maxA = Math.max(...Object.values(a.points));
    const maxB = Math.max(...Object.values(b.points));
    return maxB - maxA;
  });

  // Obter todas as rodadas
  const allRounds = Array.from(
    new Set(sortedTeams.flatMap((team) => Object.keys(team.points)))
  );

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold text-primary">Ranking</h2>

      <div className="overflow-x-auto bg-base-100 rounded-lg shadow-md">
        <table className="table table-zebra w-full">
          <thead className="bg-primary/25 border border-primary/50">
            <tr>
              <th className="text-center text-primary-content">Posição</th>
              <th className="text-primary-content">Equipe</th>
              {allRounds.map((round) => (
                <th key={round} className="text-center text-primary-content">
                  {round}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, index) => (
              <tr key={team.id_team}>
                <td className="text-center font-bold">{index + 1}</td>
                <td className="font-medium">{team.name_team}</td>
                {allRounds.map((round) => (
                  <td key={round} className="text-center">
                    {team.points[round] ?? 0}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}