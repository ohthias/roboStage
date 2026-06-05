// repositories/folders.repository.ts

import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export type FolderRow = {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  cover_url: string | null;
  visibility: "private" | "team" | "public" | "unlisted";
  tags: string[] | null;
  is_favorite: boolean;
  is_archived: boolean;
  is_deleted: boolean;
  parent_id: number | null; // NULL = root folder
  owner_id: string;
  team_id: number | null;
  file_count: number;
  subfolder_count: number;
  total_size: number;
  depth: number | null; // GENERATED from ltree path
  position: number;
  slug: string | null;
  path: string | null; // ltree stored as text
  stats: Record<string, unknown>;
  created_at: string;
  updated_at: string | null;
  last_access_at: string | null;
};

export type FolderBreadcrumb = Pick<FolderRow, "id" | "name" | "parent_id">;

export type DocumentRow = {
  id: number;
  title: string;
  created_at: string;
  updated_at: string | null;
  diagram_type: string | null;
  is_favorite: boolean;
};

export type TestRow = {
  id: number;
  name_test: string | null;
  created_at: string;
  last_acess: string | null;
  type_id: number | null;
  test_types: { id: number; name: string } | null;
};

export type CreateSubfolderPayload = {
  owner_id: string;
  team_id?: number | null;
  parent_id: number;
  name: string;
  description?: string | null;
  visibility?: string;
  position?: number;
};

export type UpdateFolderPayload = Partial<
  Pick<
    FolderRow,
    | "name"
    | "description"
    | "color"
    | "icon"
    | "cover_url"
    | "visibility"
    | "tags"
    | "is_favorite"
    | "is_archived"
    | "is_deleted"
  >
>;

export const foldersRepository = {
  async getFolderById(id: number) {
    return supabase
      .from("folders")
      .select("*")
      .eq("id", id)
      .single<FolderRow>();
  },

  async getFolderChildren(folderId: number) {
    return supabase
      .from("folders")
      .select("*")
      .eq("parent_id", folderId)
      .eq("is_deleted", false)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true })
      .returns<FolderRow[]>();
  },

  async getFolderDocuments(folderId: number) {
    return supabase
      .from("documents")
      .select("id, title, created_at, updated_at, diagram_type, is_favorite")
      .eq("folder_id", folderId)
      .order("updated_at", { ascending: false })
      .returns<DocumentRow[]>();
  },

  async getFolderTests(folderId: number) {
    return supabase
      .from("tests")
      .select(
        `
      id,
      name,
      description,
      mode,
      season,
      status,
      created_at,
      updated_at,
      last_access_at
    `,
      )
      .eq("folder_id", folderId)
      .order("created_at", { ascending: false });
  },

  async updateFolder(id: number, data: UpdateFolderPayload) {
    return supabase
      .from("folders")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single<FolderRow>();
  },

  async createSubfolder(payload: CreateSubfolderPayload) {
    return supabase
      .from("folders")
      .insert(payload)
      .select()
      .single<FolderRow>();
  },

  async markFolderAsDeleted(id: number) {
    return supabase
      .from("folders")
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq("id", id);
  },

  async updateLastAccess(id: number) {
    return supabase
      .from("folders")
      .update({ last_access_at: new Date().toISOString() })
      .eq("id", id);
  },

  async getFolderBreadcrumb(folderId: number) {
    return supabase
      .from("folders")
      .select("id, name, parent_id")
      .eq("id", folderId)
      .single<FolderBreadcrumb>();
  },
};
