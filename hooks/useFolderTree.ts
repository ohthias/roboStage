"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { FolderRow } from "@/repositories/folders.repository";

const supabase = createClient();

export type FolderTreeNode = FolderRow & {
  children: FolderTreeNode[];
};

function buildTree(
  folders: FolderRow[],
  parentId: number | null = null,
): FolderTreeNode[] {
  return folders
    .filter((folder) => folder.parent_id === parentId)
    .sort((a, b) => a.position - b.position)
    .map((folder) => ({
      ...folder,
      children: buildTree(folders, folder.id),
    }));
}

export function useFolderTree() {
  const [tree, setTree] = useState<FolderTreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTree() {
      setLoading(true);

      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("is_deleted", false)
        .order("position", { ascending: true });

      if (!error && data) {
        setTree(buildTree(data));
      }

      setLoading(false);
    }

    fetchTree();
  }, []);

  return {
    tree,
    loading,
  };
}
