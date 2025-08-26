"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/app/context/ToastContext";

interface PropsVisualizationSection {
  idEvent: number | null;
}

interface Team {
  id_team: number;
  name_team: string;
  points: { [key: string]: number };
}

export default function VisualizationSection({
  idEvent,
}: PropsVisualizationSection) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleRounds, setVisibleRounds] = useState<string[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchTeams = async () => {
      if (!idEvent) return;

      const { data, error } = await supabase
        .from("team")
        .select("*")
        .eq("id_event", idEvent);

      if (error) {
        addToast("Erro ao buscar equipes: " + error.message);
      } else {
        setTeams(data as Team[]);

        const allRounds = Array.from(
          new Set(data.flatMap((team: Team) => Object.keys(team.points)))
        );
        setVisibleRounds(allRounds);

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
  if (loading)
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );

  if (teams.length === 0)
    return (
      <p className="text-gray-500 text-center py-4">
        Nenhuma equipe cadastrada.
      </p>
    );

  const sortedTeams = [...teams].sort((a, b) => {
    const maxA = Math.max(...Object.values(a.points));
    const maxB = Math.max(...Object.values(b.points));
    return maxB - maxA;
  });

  const allRounds = Array.from(
    new Set(sortedTeams.flatMap((team) => Object.keys(team.points)))
  );

  const toggleRound = async (round: string) => {
    const newVisibleRounds = visibleRounds.includes(round)
      ? visibleRounds.filter((r) => r !== round)
      : [...visibleRounds, round];

    setVisibleRounds(newVisibleRounds);

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
        addToast("Erro ao atualizar rodadas visíveis: " + updateError.message, "error");

      addToast("Configuração de rodadas visíveis atualizada.", "success");
    } else {
      const { error: insertError } = await supabase
        .from("typeEvent")
        .insert({ id_event: idEvent, config: mergedConfig });

      if (insertError)
        addToast("Erro ao inserir rodadas visíveis: " + insertError.message, "error");
      addToast("Configuração de rodadas visíveis salva.", "success");
    }
  };

  return (
    <div className="space-y-6 px-4 md:px-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">
          Visualização do Ranking
        </h2>
        <div
          className="tooltip tooltip-left"
          data-tip="Clique nas rodadas para mostrar/ocultar colunas para os visitantes."
        >
          <button className="btn btn-sm btn-circle btn-primary">
            <span className="text-primary-content font-bold">i</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {allRounds.map((round) => (
          <button
            key={round}
            onClick={() => toggleRound(round)}
            className={`btn btn-sm ${visibleRounds.includes(round) ? "btn-primary" : "btn-ghost"
              }`}
          >
            {round}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto bg-base-100 rounded-lg shadow-lg border border-base-300">
        <table className="table table-zebra w-full">
          <thead className="bg-primary text-primary-content">
            <tr>
              <th className="text-center">Posição</th>
              <th>Equipe</th>
              {visibleRounds.map((round) => (
                <th key={round} className="text-center">
                  {round}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, index) => (
              <tr key={team.id_team} className="hover:bg-base-200">
                <td className="text-center font-bold">{index + 1}</td>
                <td className="font-medium">{team.name_team}</td>
                {visibleRounds.map((round) => (
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
