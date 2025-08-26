"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import Loader from "./loader";

interface Equipe {
  id_team: number;
  name_team: string;
  rounds: { [key: string]: number | null };
}

interface TabelaEquipesProps {
  idEvent: string;
  primaryColor: string;
  secondaryColor: string;
  textColor?: string;
}

export default function TabelaEquipes({ idEvent, primaryColor, secondaryColor, textColor }: TabelaEquipesProps) {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [visibleRounds, setVisibleRounds] = useState<string[]>([]);
  const [rodadas, setRodadas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchEquipes = async (showLoader = false) => {
      if (showLoader) setLoading(true);

      try {
        const { data: teamsData, error: teamsError } = await supabase
          .from("view_team_json")
          .select("*")
          .eq("id_event", idEvent);

        if (teamsError) throw teamsError;

        const { data: typeEvent, error: typeEventError } = await supabase
          .from("typeEvent")
          .select("*")
          .eq("id_event", idEvent)
          .maybeSingle();

        if (typeEventError) throw typeEventError;

        const equipesFormatadas: Equipe[] = (teamsData || []).map((team: any) => ({
          id_team: team.id_team,
          name_team: team.name_team,
          rounds: team.rounds || {},
        }));

        const allRounds = new Set<string>();
        equipesFormatadas.forEach(team =>
          Object.keys(team.rounds).forEach(r => allRounds.add(r))
        );

        const roundsArray = Array.from(allRounds);

        const roundsToShow =
          typeEvent.config.visibleRounds && typeEvent.config.visibleRounds.length > 0
            ? typeEvent.config.visibleRounds
            : roundsArray;

        const equipesOrdenadas = equipesFormatadas.sort((a, b) => {
          const maxA = Math.max(...roundsToShow.map((r: string | number) => a.rounds[r] ?? 0));
          const maxB = Math.max(...roundsToShow.map((r: string | number) => b.rounds[r] ?? 0));
          return maxB - maxA;
        });

        setVisibleRounds(roundsToShow);
        setRodadas(roundsArray);
        setEquipes(equipesOrdenadas);
      } catch (err) {
        console.error(err);
      } finally {
        if (showLoader) setLoading(false);
      }
    };

    if (idEvent) {
      fetchEquipes(true);
      intervalId = setInterval(() => fetchEquipes(false), 10000);
    }

    return () => clearInterval(intervalId);
  }, [idEvent]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
        <Loader />
      </div>
    );
  }

  const formatNota = (nota: number | null) => {
    if (nota === -1) return "0";
    if (nota === null || nota === undefined) return "-";
    return nota;
  };

  return (
    <div className="overflow-x-auto w-full p-4">
      <table className="table table-zebra w-full bg-base-100">
        <thead className="bg-primary text-primary-content" style={{ backgroundColor: secondaryColor, color: textColor }}>
          <tr>
            <th className="text-center">Posição</th>
            <th>Equipe</th>
            {visibleRounds.map((round, idx) => (
              <th key={idx} className="text-center">
                {round}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {equipes.map((eq, idx) => (
            <tr key={eq.id_team}>
              <td className="text-center">{idx + 1}</td>
              <td className="truncate">{eq.name_team}</td>
              {visibleRounds.map((round, i) => (
                <td key={i} className="text-center">
                  {formatNota(eq.rounds[round] ?? null)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}