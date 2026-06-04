"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export interface Test {
  id: string;
  user_id: string;
  team_id: number | null;
  folder_id: number | null;
  name: string;
  description: string | null;
  mode: string;
  season: string | null;
  status: string;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
  last_access_at: string;

  executions?: {
    count: number;
  }[];
}

export function useTests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase
        .from("tests")
        .select(
          `
            *,
            executions:test_executions(count)
          `
        )
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      setTests(data || []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao carregar testes"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  return {
    tests,
    loading,
    error,
    refresh: fetchTests,
  };
}