"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

interface UserAchievement {
  unlocked_at: string;
  achievement: {
    id: number;
    code: string;
    title: string;
    description: string;
    icon: string;
    xp: number;
  };
}

export function useAchievements(userId?: string) {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setAchievements([]);
      setLoading(false);
      return;
    }

    let active = true;

    const fetchAchievements = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("user_achievements")
        .select(`*, achievement:achievements(*)
        `)
        .eq("user_id", userId)
        .order("unlocked_at", { ascending: true });
        console.log("Fetched achievements:", data, error);

      if (!active) return;

      if (error) {
        console.error("Erro ao buscar conquistas:", error);
        setError(error.message);
        setAchievements([]);
      } else {
        setAchievements(data as UserAchievement[]);
        setError(null);
      }

      setLoading(false);
    };

    fetchAchievements();

    return () => {
      active = false;
    };
  }, [userId]);

  return {
    achievements,
    loading,
    error,
    hasAchievements: achievements.length > 0,
  };
}