import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export const documentsRepository = {
  async getDocuments(userId: string) {
    return await supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", {
        ascending: false,
      });
  },

  async getDocument(id: string) {
    return await supabase.from("documents").select("*").eq("id", id).single();
  },

  async createDocument(data: any) {
    return await supabase.from("documents").insert(data).select().single();
  },

  async updateDocument(id: string, data: any) {
    return await supabase
      .from("documents")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
  },

  async deleteDocument(id: string) {
    return await supabase.from("documents").delete().eq("id", id);
  },
};
