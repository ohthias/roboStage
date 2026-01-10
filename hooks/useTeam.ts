"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

export interface Team {
  id: number;
  name: string;
  description: string | null;
  role: "owner" | "admin" | "member";
}

/**
 * Lista todas as equipes do usuário autenticado
 */
export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("Usuário não autenticado");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("team_members")
      .select(
        `
        role,
        team_spaces (
          id,
          name,
          description
        )
      `
      )
      .eq("user_id", user.id);

    if (error) {
      setError(error.message);
      setTeams([]);
    } else {
      setTeams(
        data?.map((item: any) => ({
          id: item.team_spaces.id,
          name: item.team_spaces.name,
          description: item.team_spaces.description,
          role: item.role,
        })) ?? []
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return {
    teams,
    loading,
    error,
    refetch: fetchTeams,
  };
}

/**
 * Busca uma equipe específica do usuário (com validação de acesso)
 */
export function useTeam(teamId?: number) {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeam = useCallback(async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Usuário não autenticado");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("team_members")
      .select(
        `
        role,
        team_spaces (
          id,
          name,
          description
        )
      `
      )
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single();

    if (error || !data || !data.team_spaces) {
      setError("Equipe não encontrada ou acesso negado");
      setTeam(null);
    } else {
      const teamSpaces = Array.isArray(data.team_spaces) ? data.team_spaces[0] : data.team_spaces;
      setTeam({
        id: teamSpaces.id,
        name: teamSpaces.name,
        description: teamSpaces.description,
        role: data.role,
      });
    }

    setLoading(false);
  }, [teamId]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return {
    team,
    loading,
    error,
    refetch: fetchTeam,
  };
}