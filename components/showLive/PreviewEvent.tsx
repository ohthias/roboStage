"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

interface Team {
  id_team: number;
  name_team: string | null;
  points: number[] | Record<string, number> | null;
}

interface EventPreviewProps {
  eventId: string;
  backgroundUrl?: string | null;
  colors: string[];
}

export default function PreviewEvent({
  eventId,
  backgroundUrl,
  colors,
}: EventPreviewProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [titleEvent, setTitleEvent] = useState<string>("Evento");

  useEffect(() => {
    console.log(colors);
    const fetchTeams = async () => {
      const { data, error } = await supabase
        .from("team")
        .select("*")
        .eq("id_event", parseInt(eventId))
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Erro ao buscar equipes:", error.message);
      } else {
        setTeams(data || []);
      }
      setLoading(false);
    };

    const fetchNameEvent = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("name_event")
        .eq("id_evento", parseInt(eventId))
        .single();

      if (error) {
        console.error("Erro ao buscar nome do evento:", error.message);
      } else {
        setTitleEvent(data?.name_event || "Evento");
      }
    };

    fetchTeams();
    fetchNameEvent();
  }, [eventId]);

  // Obter todas as categorias de pontos para cabeçalho
  const getPointCategories = () => {
    const categories = new Set<string>();
    teams.forEach((team) => {
      if (Array.isArray(team.points)) {
        team.points.forEach((_, i) => categories.add(`Ponto ${i + 1}`));
      } else if (team.points && typeof team.points === "object") {
        Object.keys(team.points).forEach((k) => categories.add(k));
      }
    });
    return Array.from(categories);
  };

  const pointCategories = getPointCategories();

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center p-8 relative rounded-lg"
      style={{
        backgroundImage: `url(${
          backgroundUrl || "/images/showLive/banners/banner_default.webp"
        })`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* overlay escura */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none rounded-lg" />

      <div className="relative z-10 w-full max-w-5xl text-center">
        <h1
          className={`text-4xl md:text-6xl font-bold text-white drop-shadow mb-8 text-[${colors[0]}]`}
          style={{ color: colors[0] }}
        >
          {titleEvent}
        </h1>

        {loading ? (
          <p className="text-white text-xl">Carregando equipes...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full bg-base-100">
              <thead
                className="bg-primary text-primary-content"
                style={{ backgroundColor: colors[1], color: colors[2] }}
              >
                <tr>
                  <th className="text-center">Posição</th>
                  <th>Equipe</th>
                  {pointCategories.map((cat) => (
                    <th key={cat} className="text-center">
                      {cat}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teams.map((team, index) => (
                  <tr key={team.id_team}>
                    <td className="text-center">{index + 1}</td>
                    <td className="truncate">{team.name_team}</td>
                    {pointCategories.map((cat, i) => {
                      let value: number | undefined;
                      if (Array.isArray(team.points)) {
                        value = team.points[i];
                      } else if (
                        team.points &&
                        typeof team.points === "object"
                      ) {
                        value = team.points[cat];
                      }
                      return (
                        <td
                          key={`${team.id_team}-${cat}`}
                          className="text-center"
                        >
                          {value ?? "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
