// hooks/useFolders.ts

"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { FolderRow } from "@/repositories/folders.repository";

const supabase = createClient();

type CreateFolderPayload = {
  name: string;
  parent_id?: number | null;
  description?: string | null;
  visibility?: string;
  owner_id?: string;
  color?: string | null;
  icon?: string | null;
  tags?: string[];
};

/**
 * Fetches top-level folders (parent_id IS NULL) for the authenticated user.
 *
 * The original code passed `parent_id: 0` which caused a 406 because no row
 * has id = 0. Root folders have parent_id = NULL in the schema.
 */
export function useFolders(_scope?: string) {
  const [folders, setFolders] = useState<FolderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFolders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: sbError } = await supabase
        .from("folders")
        .select("*")
        .is("parent_id", null) // ← root folders: parent_id IS NULL
        .eq("is_deleted", false)
        .order("position", { ascending: true })
        .order("created_at", { ascending: false })
        .returns<FolderRow[]>();

      if (sbError) throw sbError;

      setFolders(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar pastas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const createFolder = useCallback(async (payload: CreateFolderPayload) => {
    if (!payload.name || payload.name.trim().length < 2) {
      throw new Error("Nome da pasta muito curto");
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error: sbError } = await supabase
      .from("folders")
      .insert({
        name: payload.name.trim(),
        parent_id: payload.parent_id ?? null, // ← null, not 0
        description: payload.description ?? null,
        visibility: payload.visibility ?? "private",
        owner_id: payload.owner_id || user?.id,
        color: payload.color ?? null,
        icon: payload.icon ?? null,
        tags: payload.tags ?? [],
      })
      .select()
      .single<FolderRow>();

    if (sbError) throw sbError;

    // Optimistic prepend so the UI updates instantly
    if (data) setFolders((prev) => [data, ...prev]);

    return data;
  }, []);

  return { folders, loading, error, createFolder, refresh: fetchFolders };
}
