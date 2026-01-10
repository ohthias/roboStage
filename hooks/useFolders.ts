"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Folder } from "@/types/Folders";

interface UseFoldersProps {
  parentId?: number | null;
  teamId?: number | null;
}

export function useFolders({ parentId = null, teamId = null }: UseFoldersProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchFolders() {
    setLoading(true);

    const query = supabase
      .from("folders")
      .select("*")
      .eq("parent_id", parentId)
      .order("name", { ascending: true });

    if (teamId) query.eq("team_id", teamId);
    else query.is("team_id", null);

    const { data, error } = await query;

    if (error) {
      setError(error.message);
    } else {
      setFolders(data ?? []);
    }

    setLoading(false);
  }

  async function createFolder(name: string) {
    const { error } = await supabase.from("folders").insert({
      name,
      parent_id: parentId,
      team_id: teamId ?? null,
    });

    if (!error) fetchFolders();
    return error;
  }

  async function renameFolder(folderId: number, name: string) {
    return supabase
      .from("folders")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("id", folderId);
  }

  async function moveFolder(folderId: number, targetParentId: number | null) {
    return supabase
      .from("folders")
      .update({ parent_id: targetParentId })
      .eq("id", folderId);
  }

  async function deleteFolder(folderId: number) {
    return supabase
      .from("folders")
      .delete()
      .eq("id", folderId);
  }

  useEffect(() => {
    fetchFolders();
  }, [parentId, teamId]);

  return {
    folders,
    loading,
    error,
    refetch: fetchFolders,
    createFolder,
    renameFolder,
    moveFolder,
    deleteFolder,
  };
}