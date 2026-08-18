"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  FieldDefinition,
  FieldValue,
  ModeId,
  TestEntry,
  TestRecord,
} from "@/types/labtest.types";

// ---------------------------------------------------------------------------
// useTests — lista de testes do usuário (equivalente ao hook original)
// ---------------------------------------------------------------------------

export interface TestListItem extends TestRecord {
  executionsCount: number;
}

export function useTests() {
  const [tests, setTests] = useState<TestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/labtest");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao carregar testes");
      setTests(
        data as TestListItem[],
      );
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao carregar testes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  return { tests, loading, error, refresh: fetchTests };
}

// ---------------------------------------------------------------------------
// useTest — um teste + seus campos (genéricos) + seus lançamentos
// ---------------------------------------------------------------------------

export function useTest(testId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [test, setTest] = useState<TestRecord | null>(null);
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [entries, setEntries] = useState<TestEntry[]>([]);

  const load = useCallback(async () => {
    if (!testId) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/labtest?testId=${encodeURIComponent(testId)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao carregar o teste");
      setTest(data.test);
      setFields(data.fields);
      setEntries(data.entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar o teste");
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    load();
  }, [load]);

  return { test, fields, entries, loading, error, refresh: load };
}

// ---------------------------------------------------------------------------
// useCreateTest — cria teste + campos, funciona para qualquer modo
// ---------------------------------------------------------------------------

export interface CreateTestInput {
  name: string;
  description?: string | null;
  mode: ModeId;
  season?: string | null;
  fields: FieldDefinition[];
  config?: Record<string, unknown>;
}

export function useCreateTest() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTest = useCallback(async (input: CreateTestInput) => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/labtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...input }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Não foi possível salvar o teste.");
      return data.id as string;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível salvar o teste.",
      );
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { createTest, submitting, error };
}

// ---------------------------------------------------------------------------
// useSaveEntries — grava um lote de lançamentos (execuções) de qualquer modo
// ---------------------------------------------------------------------------

export interface EntryInput {
  values: FieldValue[];
  notes?: string | null;
}

export function useSaveEntries(testId: string | undefined) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveEntries = useCallback(
    async (entries: EntryInput[], startingExecutionNumber: number) => {
      if (!testId) return;
      setSubmitting(true);
      setError(null);
      try {
        const response = await fetch("/api/labtest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "entries",
            testId,
            entries,
            startingExecutionNumber,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Não foi possível salvar os resultados.");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível salvar os resultados.",
        );
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [testId],
  );

  return { saveEntries, submitting, error };
}

// ---------------------------------------------------------------------------
// useMissionCatalog — busca o catálogo fixo de missões (modos "runs"/"individual")
// ---------------------------------------------------------------------------

export function useMissionCatalog(season: string | null) {
  const [missions, setMissions] = useState<FieldDefinition[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMissions = useCallback(async (s: string | null) => {
    if (!s) {
      setMissions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/data/missions");
      const data = await res.json();
      const raw: any[] = data[s] || [];
      const filtered: FieldDefinition[] = raw
        .filter((m) => !["EL", "PT", "GP"].includes(m.id))
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((m, index) => ({
          fieldKey: m.id,
          label: m.name,
          type: "number" as const,
          targetValue: m.maxValue ?? null,
          order: index,
          source: "manual" as const,
        }));
      setMissions(filtered);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMissions(season);
  }, [season, fetchMissions]);

  return useMemo(() => ({ missions, loading }), [missions, loading]);
}
