"use client";

import { useEffect, useMemo, useState } from "react";
import { Trophy, Users, Disc3 } from "lucide-react";
import Loader from "@/components/Loader";
import { createClient } from "@/utils/supabase/client";
const supabase = createClient();

interface ExtraData {
  GP?: {
    value: string | number;

    points: number;
  };

  PT?: {
    value: string | number;

    points: number;
  };
}

interface Team {
  id_team: number;
  name_team: string;
  points: Record<string, number>;
  data_extra: Record<string, ExtraData>;
}

interface Props {
  eventId: number;
}

export default function ExtraRoundsSection({ eventId }: Props) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("team")
        .select("id_team, name_team, points, data_extra")
        .eq("id_event", eventId)
        .order("id_team", {
          ascending: true,
        });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setTeams(data || []);

      setLoading(false);
    };

    fetchTeams();
  }, [eventId]);

  const rounds = useMemo(() => {
    const roundsSet = new Set<string>();

    teams.forEach((team) => {
      Object.keys(team.points || {}).forEach((round) => {
        roundsSet.add(round);
      });
    });

    return Array.from(roundsSet);
  }, [teams]);

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-base-300 py-12 text-center">
        <Trophy size={40} className="mx-auto mb-3 text-base-content/30" />

        <h2 className="font-medium">Nenhuma equipe encontrada</h2>

        <p className="text-sm text-base-content/60 mt-1">
          Não existem dados extras cadastrados neste evento.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6 px-4 md:px-8 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Trophy size={22} className="text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">
              Informações Adicionais
            </h1>
          </div>

          <p className="text-sm text-base-content/60 mt-1">
            Dados extras das rodadas exibidos aos visitantes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-base-content/60">
          <div className="flex items-center gap-1">
            <Users size={14} />
            GP
          </div>
          <div className="flex items-center gap-1">
            <Disc3 size={14} />
            PT
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-base-200">
              <tr>
                <th>Equipe</th>
                {rounds.map((round) => (
                  <th key={round} className="text-center">
                    {round}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id_team} className="hover">
                  <td className="font-medium whitespace-nowrap">
                    {team.name_team}
                  </td>
                  {rounds.map((round) => {
                    const extra = team.data_extra?.[round];
                    const hasData = extra?.GP?.value || extra?.PT?.value;
                    return (
                      <td key={round} className="text-center">
                        {hasData ? (
                          <div className="flex flex-col items-center text-xs gap-1">
                            <div className="flex items-center gap-1">
                              <Disc3 size={12} className="text-primary" />
                              <span>{extra?.PT?.value || "-"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users size={12} className="text-secondary" />
                              <span>{extra?.GP?.value || "-"}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-base-content/30">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}