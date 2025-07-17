import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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
    return <p className="text-red-500">Evento inválido.</p>;
  }

  if (loading) {
    return <p>Carregando ranking...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (teams.length === 0) {
    return <p className="text-gray-600 p-4 text-center">Nenhuma equipe cadastrada.</p>;
  }

  // Ordenar pela maior pontuação atingida em qualquer rodada
  const sortedTeams = [...teams].sort((a, b) => {
    const maxA = Math.max(...Object.values(a.points));
    const maxB = Math.max(...Object.values(b.points));
    return maxB - maxA; // decrescente
  });

  // Obter todas as rodadas (nomes das chaves dos points)
  const allRounds = Array.from(
    new Set(
      sortedTeams.flatMap((team) => Object.keys(team.points))
    )
  );

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-500 text-3xl">Ranking</h2>

      <div className="overflow-x-auto p-4 bg-neutral-50 rounded shadow">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-red-50">
              <th className="text-center text-red-600 px-4 py-2 border-b border-gray-300">Posição</th>
              <th className="text-left text-red-600 px-4 py-2 border-b border-gray-300 w-2/4">Equipe</th>
              {allRounds.map((round) => (
                <th key={round} className="text-center text-red-600 px-4 py-2 border-b border-gray-300">
                  {round}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, index) => (
              <tr key={team.id_team} className="border border-gray-300 hover:bg-gray-100 text-gray-600">
                <td className="px-4 py-2 text-center">{index + 1}</td>
                <td className="px-4 py-2 w-2/4">{team.name_team}</td>
                {allRounds.map((round) => (
                  <td key={round} className="px-4 py-2 text-center">
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
