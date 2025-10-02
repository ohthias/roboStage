"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { TrophyIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import Loader from "@/components/loader";

interface ExtraData {
  GP?: { value: string | number; points: number };
  PT?: { value: string | number; points: number };
}

interface Team {
  id_team: number;
  name_team: string;
  points: Record<string, number>; // Pontuação por round
  data_extra: Record<string, ExtraData>; // Detalhes GP/PT
}

export default function TabelaGracious({ eventId }: { eventId: number }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [rounds, setRounds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("team")
        .select("id_team, name_team, points, data_extra")
        .eq("id_event", eventId)
        .order("id_team", { ascending: true });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const teamsData = data as Team[];

      // Pegar todas as rodadas possíveis a partir de points
      const allRounds = new Set<string>();
      teamsData.forEach((team) => {
        if (team.points) {
          Object.keys(team.points).forEach((round) => allRounds.add(round));
        }
      });

      setRounds(Array.from(allRounds).sort());
      setTeams(teamsData);
      setLoading(false);
    };

    fetchTeams();
  }, [eventId]);

  if (loading)
    return (
      <div className="flex justify-center items-center py-8">
        <Loader />
      </div>
    );

    if (teams.length === 0)
    return <p className="text-red-500">Nenhuma equipe encontrada para este evento.</p>;

  return (
    <section className="space-y-6 px-2 md:px-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">
          Gracious Professionalism® Visualização
        </h2>
        <div
          className="tooltip tooltip-left"
          data-tip="GP: Gracious Professionalism®. PT: Discos de Precisão."
        >
          <button className="btn btn-sm btn-circle btn-primary">
            <span className="text-primary-content font-bold">i</span>
          </button>
        </div>
      </div>

      <table className="table table-zebra w-full rounded-lg shadow-lg border border-base-300">
        <thead className="bg-primary text-primary-content">
          <tr>
            <th>Equipe</th>
            {rounds.map((round) => (
              <th key={round}>{round}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id_team}>
              <td className="font-bold">{team.name_team}</td>
              {rounds.map((round) => {
                const extra = team.data_extra?.[round];
                const points = team.points?.[round] ?? -1; // ponto -1 = não avaliado
                return (
                  <td key={round} className="align-top">
                    {extra || points !== -1 ? (
                      <div className="flex flex-col gap-1">
                        <span>
                          <TrophyIcon className="w-4 h-4 inline-block mr-1" /> Discos:{" "}
                          {extra?.PT?.value ?? "-"}
                        </span>
                        <span>
                          <UserGroupIcon className="w-4 h-4 inline-block mr-1" /> GP:{" "}
                          {extra?.GP?.value ?? "-"}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">-</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}