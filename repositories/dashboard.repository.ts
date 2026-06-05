import { createClient } from "@/utils/supabase/client"
import { validateUUID, validatePositiveInteger } from "@/utils/validation"

const supabase = createClient()

export const dashboardRepository = {
  async getTestsCount(userId: string, teamId?: number) {
    const validUserId = validateUUID(userId, "userId")

    const query = supabase
      .from("tests")
      .select("id", { count: "exact", head: true })

    if (teamId) {
      const validTeamId = validatePositiveInteger(teamId, "teamId")
      query.eq("team_id", validTeamId)
    } else {
      query.eq("user_id", validUserId)
    }

    return query
  },

  async getDocumentsCount(userId: string, teamId?: number) {
    const validUserId = validateUUID(userId, "userId")

    const query = supabase
      .from("documents")
      .select("id", { count: "exact", head: true })

    if (teamId) {
      const validTeamId = validatePositiveInteger(teamId, "teamId")
      query.eq("team_id", validTeamId)
    } else {
      query.eq("user_id", validUserId)
    }

    return query
  },

  async getEventsCount(userId: string) {
    const validUserId = validateUUID(userId, "userId")

    return await supabase
      .from("events")
      .select("id_evento", { count: "exact", head: true })
      .eq("id_responsavel", validUserId)
  },

  async getStylesCount(userId: string) {
    const validUserId = validateUUID(userId, "userId")

    return await supabase
      .from("styleLab")
      .select("id_theme", { count: "exact", head: true })
      .eq("id_user", validUserId)
  },

  async getRecentTests(userId: string, limit = 3) {
    const validUserId = validateUUID(userId, "userId")
    const validLimit = validatePositiveInteger(limit, "limit", 1)

    if (validLimit > 50) {
      throw new Error("limit cannot exceed 50")
    }

    return await supabase
      .from("tests")
      .select("id, name_test, last_acess")
      .eq("user_id", validUserId)
      .order("last_acess", { ascending: false })
      .limit(validLimit)
  },

  async getRecentDocuments(userId: string, limit = 3) {
    const validUserId = validateUUID(userId, "userId")
    const validLimit = validatePositiveInteger(limit, "limit", 1)

    if (validLimit > 50) {
      throw new Error("limit cannot exceed 50")
    }

    return await supabase
      .from("documents")
      .select("id, title, updated_at")
      .eq("user_id", validUserId)
      .order("updated_at", { ascending: false })
      .limit(validLimit)
  },

  async getRecentEvents(userId: string, limit = 2) {
    const validUserId = validateUUID(userId, "userId")
    const validLimit = validatePositiveInteger(limit, "limit", 1)

    if (validLimit > 50) {
      throw new Error("limit cannot exceed 50")
    }

    return await supabase
      .from("events")
      .select("id_evento, code_event, name_event, last_acess")
      .eq("id_responsavel", validUserId)
      .order("last_acess", { ascending: false })
      .limit(validLimit)
  },
}