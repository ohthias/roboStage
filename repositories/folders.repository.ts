import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export const foldersRepository = {
  async getFolders(userId: string) {
    return await supabase
      .from("folders")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at");
  },

  async createFolder(data: {
    owner_id: string;
    name: string;
    description?: string;
    parent_id?: number | null;
    team_id?: number | null;
  }) {
    return await supabase.from("folders").insert(data).select().single();
  },

  async updateFolder(
    id: number,
    data: {
      name?: string;
      description?: string;
    },
  ) {
    return await supabase
      .from("folders")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
  },

  async deleteFolder(id: number) {
    return await supabase.from("folders").delete().eq("id", id);
  },
};
