"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";

export type TestRow = any;

export function useLabTests() {
  const [tests, setTests] = useState<TestRow[]>([]);
  const [testTypes, setTestTypes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: typesData, error: typesError } = await supabase
        .from("test_types")
        .select("*");
      if (typesError) throw typesError;
      const typesMap: Record<string, string> = {};
      typesData?.forEach((t: any) => (typesMap[t.id] = t.name));
      setTestTypes(typesMap);

      const { data: testsData, error: testsError } = await supabase
        .from("tests")
        .select(`*, test_parameters(*), test_missions(*)`);
      if (testsError) throw testsError;
      setTests(testsData || []);
    } catch (err: any) {
      console.error("useLabTests:", err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { tests, setTests, testTypes, loading, error, refetch: fetchAll };
}
