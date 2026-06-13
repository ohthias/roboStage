// hooks/useFolder.ts

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { foldersService } from "@/server/services/folders.service";
import type {
  FolderRow,
  DocumentRow,
  TestRow,
  FolderBreadcrumb,
  UpdateFolderPayload,
  CreateSubfolderPayload,
} from "@/server/repositories/folders.repository";

type FolderState = {
  folder: FolderRow | null;
  children: FolderRow[];
  documents: DocumentRow[];
  tests: TestRow[];
  breadcrumbs: FolderBreadcrumb[];
  loading: boolean;
  error: string | null;
};

const INITIAL_STATE: FolderState = {
  folder: null,
  children: [],
  documents: [],
  tests: [],
  breadcrumbs: [],
  loading: true,
  error: null,
};

export function useFolder(folderId: number) {
  const [state, setState] = useState<FolderState>(INITIAL_STATE);

  const fetchIdRef = useRef(0);

  // ─────────────────────────────────────────────────────────────
  // Fetch folder
  // ─────────────────────────────────────────────────────────────

  const fetchFolder = useCallback(async () => {
    if (isNaN(folderId)) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "ID da pasta inválido",
      }));
      return;
    }

    const currentFetch = ++fetchIdRef.current;

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const [data, breadcrumbs] = await Promise.all([
        foldersService.getFolderPageData(folderId),
        foldersService.getBreadcrumbs(folderId),
      ]);

      // ignora respostas antigas
      if (currentFetch !== fetchIdRef.current) return;

      setState({
        folder: data.folder,
        children: data.children,
        documents: data.documents,
        // map incoming tests to the TestRow shape
        tests: (data.tests || []).map((t: any) => ({
          id: t.id,
          name_test: t.name ?? "",
          last_acess: t.last_access_at ?? t.last_access ?? null,
          type_id: t.type_id ?? t.mode ?? null,
          test_types: t.test_types ?? t.season ?? null,
        } as unknown as TestRow)),
        breadcrumbs,
        loading: false,
        error: null,
      });
    } catch (err) {
      if (currentFetch !== fetchIdRef.current) return;

      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Erro ao carregar pasta",
      }));
    }
  }, [folderId]);

  useEffect(() => {
    fetchFolder();
  }, [fetchFolder]);

  // ─────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────

  const updateFolder = useCallback(
    async (data: UpdateFolderPayload) => {
      const updated = await foldersService.updateFolder(folderId, data);

      setState((prev) => ({
        ...prev,
        folder: updated,
      }));

      return updated;
    },
    [folderId],
  );

  const toggleFavorite = useCallback(async () => {
    if (!state.folder) return;

    return updateFolder({
      is_favorite: !state.folder.is_favorite,
    });
  }, [state.folder, updateFolder]);

  const archiveFolder = useCallback(
    () => updateFolder({ is_archived: true }),
    [updateFolder],
  );

  const unarchiveFolder = useCallback(
    () => updateFolder({ is_archived: false }),
    [updateFolder],
  );

  const createSubfolder = useCallback(
    async (data: CreateSubfolderPayload) => {
      await foldersService.createSubfolder(data);
      await fetchFolder();
    },
    [fetchFolder],
  );

  const deleteFolder = useCallback(async () => {
    await foldersService.deleteFolder(folderId);
  }, [folderId]);

  return {
    ...state,
    refresh: fetchFolder,
    updateFolder,
    toggleFavorite,
    archiveFolder,
    unarchiveFolder,
    createSubfolder,
    deleteFolder,
  };
}
