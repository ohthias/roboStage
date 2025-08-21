"use client";

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

export function useEvents(userId?: string) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);

      try {
        // Busca eventos e configs em paralelo
        const [{ data: eventsData, error: eventsError }, { data: configsData, error: configsError }] = await Promise.all([
          supabase
            .from("events")
            .select("id_evento, name_event, code_event")
            .eq("id_responsavel", userId)
            .order("created_at", { ascending: false }),
          supabase.from("typeEvent").select("id_event, config"),
        ]);

        if (eventsError) throw eventsError;
        if (configsError) throw configsError;

        const merged =
          eventsData?.map((ev) => {
            const cfg = configsData?.find((c) => c.id_event === ev.id_evento);
            return { ...ev, config: cfg?.config || null };
          }) || [];

        setEvents(merged);
      } catch (err) {
        console.error(err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [userId]);

  return { events, loading };
}
