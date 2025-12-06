import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Info } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
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

  // 🔹 Filtrar rodadas válidas (excluindo "Semi-final" e "Final")
  const excludedRounds = ["Semi-final", "Final"];

  const getFilteredPoints = (points: { [key: string]: number }) => {
    return Object.fromEntries(
      Object.entries(points).filter(
        ([key]) => !excludedRounds.includes(key)
      )
    );
  };

  // 🔹 Ordenar pela maior pontuação nas rodadas válidas
  const sortedTeams = [...teams].sort((a, b) => {
    const validA = getFilteredPoints(a.points);
    const validB = getFilteredPoints(b.points);
    const maxA = Math.max(...Object.values(validA), 0);
    const maxB = Math.max(...Object.values(validB), 0);
    return maxB - maxA;
  });

  // 🔹 Obter todas as rodadas (sem semifinais/finais)
  const allRounds = Array.from(
    new Set(
      sortedTeams.flatMap((team) =>
        Object.keys(getFilteredPoints(team.points))
      )
    )
  );

  return (
    <div className="space-y-4 overlay-hidden px-4 md:px-8">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-3xl font-bold text-primary">Ranking</h2>
        <div
          className="tooltip tooltip-left tooltip-custom"
          data-tip="As pontuações estão -1 porque nenhuma foi lançada por voluntários."
        >
          <button className="btn btn-circle btn-sm btn-primary">
            <Info className="text-primary-content" size={24} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-base-100 rounded-lg shadow-md border border-base-200">
        <table className="table table-zebra w-full overflow-x-auto">
          <thead className="bg-primary/50 border border-primary/50">
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
            {sortedTeams.map((team, index) => {
              const filteredPoints = getFilteredPoints(team.points);
              return (
                <tr key={team.id_team}>
                  <td className="text-center font-bold">{index + 1}</td>
                  <td className="font-medium">{team.name_team}</td>
                  {allRounds.map((round) => (
                    <td key={round} className="text-center">
                      {filteredPoints[round] ?? 0}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}