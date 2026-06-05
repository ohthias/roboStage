import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export const teamsRepository = {
  async getTeams(userId: string) {
    return await supabase
      .from("team_members")
      .select(
        `
        role,
        joined_at,
        team_spaces (
          id,
          name,
          description,
          join_code,
          created_at
        )
      `,
      )
      .eq("user_id", userId);
  },

  async createTeam(data: {
    owner_id: string;
    name: string;
    description?: string;
  }) {
    return await supabase.from("team_spaces").insert(data).select().single();
  },

  async addMember(data: {
    team_id: number;
    user_id: string;
    role?: "owner" | "admin" | "member";
  }) {
    return await supabase.from("team_members").insert({
      ...data,
      role: data.role ?? "member",
    });
  },

  async removeMember(teamId: number, userId: string) {
    return await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("user_id", userId);
  },

  async getTeamByCode(code: string) {
    return await supabase
      .from("team_spaces")
      .select("*")
      .eq("join_code", code)
      .single();
  },
};
