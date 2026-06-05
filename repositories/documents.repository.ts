import { createClient } from "@/utils/supabase/client";
import { validateUUID, validateNonEmptyString, validatePositiveInteger } from "@/utils/validation";

const supabase = createClient();

// Optimized column selection for documents
const DOCUMENT_COLUMNS = `
  id,
  title,
  description,
  user_id,
  team_id,
  folder_id,
  diagram_type,
  is_favorite,
  created_at,
  updated_at
`;

export const documentsRepository = {
  async getDocuments(userId: string, limit = 50, offset = 0) {
    const validUserId = validateUUID(userId, "userId");
    const validLimit = validatePositiveInteger(limit, "limit", 1);
    const validOffset = validatePositiveInteger(offset, "offset", 0);

    if (validLimit > 100) {
      throw new Error("limit cannot exceed 100");
    }

    return await supabase
      .from("documents")
      .select(DOCUMENT_COLUMNS, { count: "exact" })
      .eq("user_id", validUserId)
      .order("updated_at", {
        ascending: false,
      })
      .range(validOffset, validOffset + validLimit - 1);
  },

  async getDocument(id: string) {
    const validId = validateNonEmptyString(id, "id", 100);

    return await supabase
      .from("documents")
      .select(DOCUMENT_COLUMNS)
      .eq("id", validId)
      .single();
  },

  async createDocument(data: any) {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid document data");
    }

    if (data.title) {
      data.title = validateNonEmptyString(data.title, "title", 500);
    }

    if (data.user_id) {
      data.user_id = validateUUID(data.user_id, "user_id");
    }

    return await supabase
      .from("documents")
      .insert(data)
      .select(DOCUMENT_COLUMNS)
      .single();
  },

  async updateDocument(id: string, data: any) {
    const validId = validateNonEmptyString(id, "id", 100);

    if (!data || typeof data !== "object") {
      throw new Error("Invalid document data");
    }

    if (data.title) {
      data.title = validateNonEmptyString(data.title, "title", 500);
    }

    return await supabase
      .from("documents")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validId)
      .select(DOCUMENT_COLUMNS)
      .single();
  },

  async deleteDocument(id: string) {
    const validId = validateNonEmptyString(id, "id", 100);

    return await supabase.from("documents").delete().eq("id", validId);
  },
};
