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
  points: Record<string, number>;
  data_extra: Record<string, ExtraData>;
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

      // 🔹 Separar rodadas normais, semi e final
      const normalRounds = new Set<string>();
      let hasSemi = false;
      let hasFinal = false;

      teamsData.forEach((team) => {
        if (team.points) {
          Object.keys(team.points).forEach((round) => {
            if (round === "Semi-final") hasSemi = true;
            else if (round === "Final") hasFinal = true;
            else normalRounds.add(round);
          });
        }
      });

      const orderedRounds = [
        ...Array.from(normalRounds).sort(),
        ...(hasSemi ? ["Semi-final"] : []),
        ...(hasFinal ? ["Final"] : []),
      ];

      setRounds(orderedRounds);
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
    return (
      <p className="text-red-500 text-center py-4">
        Nenhuma equipe encontrada para este evento.
      </p>
    );

  return (
    <section className="space-y-6 px-2 md:px-6 lg:px-8">
      {/* 🔹 Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-xl md:text-2xl font-bold text-primary text-center md:text-left">
          Gracious Professionalism® Visualização
        </h2>

        <div className="alert alert-default text-sm md:text-base shadow-md px-4 py-3 rounded-lg w-full md:w-auto">
          <span className="font-bold">Info:</span>
          <span>
            <strong> GP </strong> = Gracious Professionalism® |{" "}
            <strong> PT </strong> = Discos de Precisão
          </span>
        </div>
      </div>

      {/* 🔹 Tabela responsiva */}
      <div className="overflow-x-auto rounded-lg shadow-lg border border-base-300">
        <table className="table table-sm md:table-md table-zebra w-full min-w-[500px] text-sm md:text-base">
          <thead className="bg-primary text-primary-content sticky top-0 z-10">
            <tr>
              <th className="whitespace-nowrap">Equipe</th>
              {rounds.map((round) => (
                <th key={round} className="whitespace-nowrap text-center">
                  {round}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.id_team}>
                <td className="font-semibold">{team.name_team}</td>
                {rounds.map((round) => {
                  const extra = team.data_extra?.[round];
                  const points = team.points?.[round] ?? -1;
                  return (
                    <td key={round} className="align-top text-center">
                      {extra || points !== -1 ? (
                        <div className="flex flex-col items-center md:items-start gap-1 text-xs md:text-sm">
                          <span>
                            <TrophyIcon className="w-4 h-4 inline-block mr-1 text-primary" />
                            Discos: <span className="font-medium">{extra?.PT?.value ?? "-"}</span>
                          </span>
                          <span>
                            <UserGroupIcon className="w-4 h-4 inline-block mr-1 text-secondary" />
                            GP: <span className="font-medium">{extra?.GP?.value ?? "-"}</span>
                          </span>
                        </div>
                      ) : (
                        <div className="text-gray-400">-</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}