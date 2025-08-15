import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

interface EventData {
  id_evento: number;
  id_responsavel: string;
  name_event: string;
  code_volunteer: string;
  code_visit: string;
  code_event: string;
  created_at: string;
}

interface EventConfig {
  id_event: number;
  config: {
    base: string;
    rodadas: string[];
    temporada?: string;
  };
}

interface Team {
  id_team: number;
  id_event: number;
  name_team: string;
  created_at: string;
  points: {};
  data_extra: {};
}

export function useEvent(codeEvent: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    if (!codeEvent) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Buscar o evento
        const { data: events, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("code_event", codeEvent)
          .limit(1);

        if (eventError) throw eventError;
        if (!events || events.length === 0) {
          setError("Evento não encontrado.");
          setLoading(false);
          return;
        }

        const event = events[0];
        setEventData(event);

        // Buscar config do evento
        const { data: configs, error: configError } = await supabase
          .from("typeEvent")
          .select("*")
          .eq("id_event", event.id_evento);

        if (configError) throw configError;
        setEventConfig(configs && configs[0]);

        // Buscar equipes
        const { data: teamsData, error: teamsError } = await supabase
          .from("team")
          .select("*")
          .eq("id_event", event.id_evento);

        if (teamsError) throw teamsError;
        setTeams(teamsData || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [codeEvent]);

  return {
    loading,
    error,
    eventData,
    eventConfig,
    teams,
  };
}
