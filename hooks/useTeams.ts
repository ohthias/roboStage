"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export interface Team {
  id_team: number;
  id_event: number;
  name_team: string;
  points: Record<string, number>;
  data_extra?: Record<string, any>;
  created_at?: string;
}

export function useTeams(initialTeams: Team[], eventLoading: boolean) {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!eventLoading) {
      setTeams(initialTeams);
    }
  }, [initialTeams]);

  const addLoadingId = (id: number) =>
    setLoadingIds((prev) => new Set(prev).add(id));

  const removeLoadingId = (id: number) =>
    setLoadingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  const createTeam = useCallback(
    async (name: string, eventId: number, rounds: string[]) => {
      const pointsObject = rounds.reduce<Record<string, number>>(
        (acc, round) => {
          acc[round] = -1;
          return acc;
        },
        {},
      );

      const { data, error } = await supabase
        .from("team")
        .insert([
          { id_event: eventId, name_team: name.trim(), points: pointsObject },
        ])
        .select()
        .single();

      if (error) throw error;

      setTeams((prev) => [...prev, data]);
    },
    [],
  );

  const deleteTeam = useCallback(async (id: number) => {
    addLoadingId(id);

    try {
      const { error } = await supabase.from("team").delete().eq("id_team", id);

      if (error) throw error;

      setTeams((prev) => prev.filter((t) => t.id_team !== id));
    } finally {
      removeLoadingId(id);
    }
  }, []);

  const editTeam = useCallback(async (id: number, newName: string) => {
    addLoadingId(id);

    try {
      const { error } = await supabase
        .from("team")
        .update({ name_team: newName.trim() })
        .eq("id_team", id);

      if (error) throw error;

      setTeams((prev) =>
        prev.map((t) =>
          t.id_team === id ? { ...t, name_team: newName.trim() } : t,
        ),
      );
    } finally {
      removeLoadingId(id);
    }
  }, []);

  const updatePoints = useCallback(
    async (id: number, newPoints: Record<string, number>) => {
      addLoadingId(id);

      try {
        const { error } = await supabase
          .from("team")
          .update({ points: newPoints })
          .eq("id_team", id);

        if (error) throw error;

        setTeams((prev) =>
          prev.map((t) => (t.id_team === id ? { ...t, points: newPoints } : t)),
        );
      } finally {
        removeLoadingId(id);
      }
    },
    [],
  );

  return { teams, loadingIds, createTeam, deleteTeam, editTeam, updatePoints };
}