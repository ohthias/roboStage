// hooks/useFavoriteFolders.ts

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { FolderRow } from "@/repositories/folders.repository";

const supabase = createClient();

export function useFavoriteFolders(limit = 5) {
  const [folders, setFolders] = useState<FolderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      setLoading(true);

      const { data } = await supabase
        .from("folders")
        .select("*")
        .eq("is_favorite", true)
        .eq("is_deleted", false)
        .order("updated_at", { ascending: false })
        .limit(limit);

      setFolders(data ?? []);
      setLoading(false);
    }

    fetchFavorites();
  }, [limit]);

  return {
    folders,
    loading,
  };
}
