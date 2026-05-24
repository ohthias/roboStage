import { createClient } from "@/utils/supabase/client"

const supabase = createClient()

export const dashboardRepository = {
  async getTestsCount(userId: string, teamId?: number) {
    const query = supabase
      .from("tests")
      .select("id", { count: "exact", head: true })

    if (teamId) {
      query.eq("team_id", teamId)
    } else {
      query.eq("user_id", userId)
    }

    return query
  },

  async getDocumentsCount(userId: string, teamId?: number) {
    const query = supabase
      .from("documents")
      .select("id", { count: "exact", head: true })

    if (teamId) {
      query.eq("team_id", teamId)
    } else {
      query.eq("user_id", userId)
    }

    return query
  },

  async getEventsCount(userId: string) {
    return await supabase
      .from("events")
      .select("id_evento", { count: "exact", head: true })
      .eq("id_responsavel", userId)
  },

  async getStylesCount(userId: string) {
    return await supabase
      .from("styleLab")
      .select("id_theme", { count: "exact", head: true })
      .eq("id_user", userId)
  },

  async getRecentTests(userId: string, limit = 3) {
    return await supabase
      .from("tests")
      .select("id, name_test, last_acess")
      .eq("user_id", userId)
      .order("last_acess", { ascending: false })
      .limit(limit)
  },

  async getRecentDocuments(userId: string, limit = 3) {
    return await supabase
      .from("documents")
      .select("id, title, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(limit)
  },

  async getRecentEvents(userId: string, limit = 2) {
    return await supabase
      .from("events")
      .select("id_evento, name_event, last_acess")
      .eq("id_responsavel", userId)
      .order("last_acess", { ascending: false })
      .limit(limit)
  },
}