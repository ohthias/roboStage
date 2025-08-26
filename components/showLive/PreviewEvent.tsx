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
  colors
}: EventPreviewProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [titleEvent, setTitleEvent] = useState<string>("Evento");

  useEffect(() => {
    console.log(colors)
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
        <h1 className={`text-4xl md:text-6xl font-bold text-white drop-shadow mb-8 text-[${colors[0]}]`}>
          {titleEvent}
        </h1>

        {loading ? (
          <p className="text-white text-xl">Carregando equipes...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-white border border-white/50 backdrop-blur-md">
              <thead>
                <tr className={`bg-[${colors[1]}]/20`}>
                  <th className={`p-3 border-b border-white/50 text-[${colors[2]}]`}>#</th>
                  <th className={`p-3 border-b border-white/50 text-[${colors[2]}]`}>Equipe</th>
                  {pointCategories.map((cat) => (
                    <th key={cat} className="p-3 border-b border-white/50">
                      {cat}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teams.map((team, index) => (
                  <tr key={team.id_team} className="hover:bg-white/20 transition">
                    <td className="p-3 border-b border-white/50 text-center">
                      {index + 1}
                    </td>
                    <td className="p-3 border-b border-white/50 text-center">
                      {team.name_team}
                    </td>
                    {pointCategories.map((cat, i) => {
                      let value: number | undefined;
                      if (Array.isArray(team.points)) {
                        value = team.points[i];
                      } else if (team.points && typeof team.points === "object") {
                        value = team.points[cat];
                      }
                      return (
                        <td
                          key={`${team.id_team}-${cat}`}
                          className="p-3 border-b border-white/50 text-center"
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