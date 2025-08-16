"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

interface PropsVisualizationSection {
  idEvent: number | null;
}

interface Team {
  id_team: number;
  name_team: string;
  points: { [key: string]: number };
}

export default function VisualizationSection({ idEvent }: PropsVisualizationSection) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [visibleRounds, setVisibleRounds] = useState<string[]>([]);

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

        // Pega todas as rodadas inicialmente visíveis
        const allRounds = Array.from(
          new Set(data.flatMap((team: Team) => Object.keys(team.points)))
        );
        setVisibleRounds(allRounds);

        // Busca config existente
        const { data: existingData } = await supabase
          .from("typeEvent")
          .select("id, config")
          .eq("id_event", idEvent)
          .single();

        const mergedConfig = {
          ...(existingData?.config || {}),
          visibleRounds: allRounds,
        };

        if (existingData) {
          await supabase
            .from("typeEvent")
            .update({ config: mergedConfig })
            .eq("id", existingData.id);
        } else {
          await supabase
            .from("typeEvent")
            .insert({ id_event: idEvent, config: mergedConfig });
        }
      }
      setLoading(false);
    };

    fetchTeams();
  }, [idEvent]);

  if (!idEvent) return <p className="text-red-500">Evento inválido.</p>;
  if (loading) return <p>Carregando visualização...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (teams.length === 0) return <p className="text-gray-600">Nenhuma equipe cadastrada.</p>;

  const sortedTeams = [...teams].sort((a, b) => {
    const maxA = Math.max(...Object.values(a.points));
    const maxB = Math.max(...Object.values(b.points));
    return maxB - maxA;
  });

  const allRounds = Array.from(new Set(sortedTeams.flatMap((team) => Object.keys(team.points))));

  const toggleRound = async (round: string) => {
    const newVisibleRounds = visibleRounds.includes(round)
      ? visibleRounds.filter((r) => r !== round)
      : [...visibleRounds, round];

    setVisibleRounds(newVisibleRounds);

    // Buscar o JSON atual
    const { data: existingData } = await supabase
      .from("typeEvent")
      .select("id, config")
      .eq("id_event", idEvent)
      .single();

    const mergedConfig = {
      ...(existingData?.config || {}),
      visibleRounds: newVisibleRounds,
    };

    if (existingData) {
      const { error: updateError } = await supabase
        .from("typeEvent")
        .update({ config: mergedConfig })
        .eq("id", existingData.id);

      if (updateError)
        console.error("Erro ao atualizar rodadas visíveis:", updateError.message);
    } else {
      const { error: insertError } = await supabase
        .from("typeEvent")
        .insert({ id_event: idEvent, config: mergedConfig });

      if (insertError)
        console.error("Erro ao inserir rodadas visíveis:", insertError.message);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Visualização do Ranking</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {allRounds.map((round) => (
          <button
            key={round}
            onClick={() => toggleRound(round)}
            className={`px-3 py-1 rounded border text-sm ${
              visibleRounds.includes(round)
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {visibleRounds.includes(round) ? "Ocultar" : "Mostrar"} {round}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left px-4 py-2 border-b">Posição</th>
              <th className="text-left px-4 py-2 border-b">Equipe</th>
              {visibleRounds.map((round) => (
                <th key={round} className="text-left px-4 py-2 border-b">
                  {round}
                </th>
              ))}
              <th className="text-left px-4 py-2 border-b">Maior Pontuação</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, index) => (
              <tr key={team.id_team} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{index + 1}</td>
                <td className="px-4 py-2 border-b">{team.name_team}</td>
                {visibleRounds.map((round) => (
                  <td key={round} className="px-4 py-2 border-b">
                    {team.points[round] ?? 0}
                  </td>
                ))}
                <td className="px-4 py-2 border-b">
                  {Math.max(...Object.values(team.points))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}