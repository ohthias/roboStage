"use client";

import { useEffect, useMemo, useState } from "react";
import { eventService } from "@/services/event.service";

export interface EventData {
  id_evento: number;
  id_responsavel: string;
  name_event: string;
  code_volunteer: string;
  code_visit: string;
  code_event: string;
  created_at: string;
  last_acess: string;
  event_active: boolean;
}

export interface EventConfig {
  id_event: number;
  config: {
    base: string;
    rodadas: string[];
    temporada?: string;
    preset?: {
      colors: [string, string, string];
      url_background: string;
    };
  };
}

export interface Team {
  id_team: number;
  id_event: number;
  name_team: string;
  created_at: string;
  points: Record<string, any>;
  data_extra: Record<string, any>;
}

export interface RankedTeam extends Team {
  totalPoints: number;
}

interface EventStats {
  totalTeams: number;
  highestScore: number;
  averageScore: number;
  bestTeam: RankedTeam | null;
  topTeams: RankedTeam[];
}

interface UseEventReturn {
  loading: boolean;
  error: string | null;
  eventData: EventData | null;
  eventConfig: EventConfig | null;
  teams: Team[];
  ranking: RankedTeam[];
  stats: EventStats;
}

function calculateTeamScore(points: Record<string, any>) {
  return Object.values(points || {}).reduce((acc, value) => {
    const numeric = typeof value === "number" ? value : Number(value);
    return acc + (isNaN(numeric) ? 0 : numeric);
  }, 0);
}

export function useEvent(codeEvent: string): UseEventReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    if (!codeEvent) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await eventService.getCompleteEvent(codeEvent);
        setEventData(data.event);
        setEventConfig(data.config);
        setTeams(data.teams);
      } catch (err: any) {
        console.error(err);

        setError(err.message || "Erro ao carregar evento");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [codeEvent]);

  const ranking = useMemo<RankedTeam[]>(() => {
    return [...teams]
      .map((team) => ({
        ...team,

        totalPoints: calculateTeamScore(team.points),
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }, [teams]);

  const stats = useMemo<EventStats>(() => {
    const totalTeams = ranking.length;
    const highestScore = ranking[0]?.totalPoints ?? 0;
    const totalScore = ranking.reduce((acc, team) => acc + team.totalPoints, 0);
    const averageScore = totalTeams > 0 ? Math.round(totalScore / totalTeams) : 0;

    return {
      totalTeams,
      highestScore,
      averageScore,
      bestTeam: ranking.length > 0 ? ranking[0] : null,
      topTeams: ranking.slice(0, 3),
    };
  }, [ranking]);

  return {
    loading,
    error,
    eventData,
    eventConfig,
    teams,
    ranking,
    stats,
  };
}