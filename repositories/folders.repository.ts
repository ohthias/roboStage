// repositories/folders.repository.ts

import { createClient } from "@/utils/supabase/client";
import { validateUUID, validateNonEmptyString, validatePositiveInteger } from "@/utils/validation";

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

// Optimized column selection
const FOLDER_COLUMNS = `
  id,
  name,
  description,
  color,
  icon,
  cover_url,
  visibility,
  tags,
  is_favorite,
  is_archived,
  is_deleted,
  parent_id,
  owner_id,
  team_id,
  file_count,
  subfolder_count,
  total_size,
  depth,
  position,
  slug,
  path,
  stats,
  created_at,
  updated_at,
  last_access_at
`;

const DOCUMENT_COLUMNS_FOLDER = `id, title, created_at, updated_at, diagram_type, is_favorite`;

const TEST_COLUMNS_FOLDER = `
  id,
  name_test,
  created_at,
  updated_at,
  last_acess,
  type_id,
  test_types (id, name)
`;

export const foldersRepository = {
  async getFolderById(id: number) {
    const validId = validatePositiveInteger(id, "id");

    return supabase
      .from("folders")
      .select(FOLDER_COLUMNS)
      .eq("id", validId)
      .single<FolderRow>();
  },

  async getFolderChildren(folderId: number) {
    const validId = validatePositiveInteger(folderId, "folderId");

    return supabase
      .from("folders")
      .select(FOLDER_COLUMNS)
      .eq("parent_id", validId)
      .eq("is_deleted", false)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true })
      .returns<FolderRow[]>();
  },

  async getFolderDocuments(folderId: number) {
    const validId = validatePositiveInteger(folderId, "folderId");

    return supabase
      .from("documents")
      .select(DOCUMENT_COLUMNS_FOLDER)
      .eq("folder_id", validId)
      .order("updated_at", { ascending: false })
      .returns<DocumentRow[]>();
  },

  async getFolderTests(folderId: number) {
    const validId = validatePositiveInteger(folderId, "folderId");

    return supabase
      .from("tests")
      .select(TEST_COLUMNS_FOLDER)
      .eq("folder_id", validId)
      .order("created_at", { ascending: false });
  },

  async updateFolder(id: number, data: UpdateFolderPayload) {
    const validId = validatePositiveInteger(id, "id");

    if (!data || typeof data !== "object") {
      throw new Error("Invalid folder data");
    }

    if (data.name) {
      data.name = validateNonEmptyString(data.name, "name", 255);
    }

    return supabase
      .from("folders")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", validId)
      .select(FOLDER_COLUMNS)
      .single<FolderRow>();
  },

  async createSubfolder(payload: CreateSubfolderPayload) {
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid subfolder data");
    }

    const validPayload = {
      owner_id: validateUUID(payload.owner_id, "owner_id"),
      team_id: payload.team_id ?? null,
      parent_id: validatePositiveInteger(payload.parent_id, "parent_id"),
      name: validateNonEmptyString(payload.name, "name", 255),
      description: payload.description || null,
      visibility: payload.visibility || "private",
      position: payload.position ?? 0,
    };

    return supabase
      .from("folders")
      .insert(validPayload)
      .select(FOLDER_COLUMNS)
      .single<FolderRow>();
  },

  async markFolderAsDeleted(id: number) {
    const validId = validatePositiveInteger(id, "id");

    return supabase
      .from("folders")
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq("id", validId);
  },

  async updateLastAccess(id: number) {
    const validId = validatePositiveInteger(id, "id");

    return supabase
      .from("folders")
      .update({ last_access_at: new Date().toISOString() })
      .eq("id", validId);
  },

  async getFolderBreadcrumb(folderId: number) {
    const validId = validatePositiveInteger(folderId, "folderId");

    return supabase
      .from("folders")
      .select("id, name, parent_id")
      .eq("id", validId)
      .single<FolderBreadcrumb>();
  },
};
