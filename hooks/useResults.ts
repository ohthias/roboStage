"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

export type ResultRow = {
  id: number;
  test_id: string;
  value: Record<string, any>;
  created_at: string;
  season: string;
  description?: string | null;
};

export function useResults(testId?: string) {
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!testId) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const fetchResults = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("results")
          .select("*")
          .eq("test_id", testId);
        if (error) throw error;
        if (!controller.signal.aborted) setResults(data || []);
      } catch (err: any) {
        if (!controller.signal.aborted) {
          console.error("useResults:", err);
          setError(err.message || String(err));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchResults();
    return () => controller.abort();
  }, [testId]);

  return { results, loading, error };
}
