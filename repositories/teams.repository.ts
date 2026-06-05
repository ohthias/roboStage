import { createClient } from "@/utils/supabase/client";
import { validateUUID, validateNonEmptyString, validatePositiveInteger } from "@/utils/validation";

const supabase = createClient();

// Optimized team columns
const TEAM_SPACE_COLUMNS = `
  id,
  name,
  description,
  join_code,
  owner_id,
  created_at,
  updated_at
`;

const TEAM_MEMBER_COLUMNS = `
  team_id,
  user_id,
  role,
  joined_at
`;

export const teamsRepository = {
  async getTeams(userId: string) {
    const validUserId = validateUUID(userId, "userId");

    return await supabase
      .from("team_members")
      .select(
        `
        ${TEAM_MEMBER_COLUMNS},
        team_spaces (
          ${TEAM_SPACE_COLUMNS}
        )
      `,
      )
      .eq("user_id", validUserId);
  },

  async createTeam(data: {
    owner_id: string;
    name: string;
    description?: string;
  }) {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid team data");
    }

    const validOwnerId = validateUUID(data.owner_id, "owner_id");
    const validName = validateNonEmptyString(data.name, "name", 255);

    return await supabase
      .from("team_spaces")
      .insert({
        owner_id: validOwnerId,
        name: validName,
        description: data.description || null,
      })
      .select(TEAM_SPACE_COLUMNS)
      .single();
  },

  async addMember(data: {
    team_id: number;
    user_id: string;
    role?: "owner" | "admin" | "member";
  }) {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid member data");
    }

    const validTeamId = validatePositiveInteger(data.team_id, "team_id");
    const validUserId = validateUUID(data.user_id, "user_id");
    const validRole = data.role ?? "member";

    if (!["owner", "admin", "member"].includes(validRole)) {
      throw new Error("Invalid role");
    }

    return await supabase.from("team_members").insert({
      team_id: validTeamId,
      user_id: validUserId,
      role: validRole,
    });
  },

  async removeMember(teamId: number, userId: string) {
    const validTeamId = validatePositiveInteger(teamId, "teamId");
    const validUserId = validateUUID(userId, "userId");

    return await supabase
      .from("team_members")
      .delete()
      .eq("team_id", validTeamId)
      .eq("user_id", validUserId);
  },

  async getTeamByCode(code: string) {
    const validCode = validateNonEmptyString(code, "code", 50);

    return await supabase
      .from("team_spaces")
      .select(TEAM_SPACE_COLUMNS)
      .eq("join_code", validCode)
      .single();
  },
};
