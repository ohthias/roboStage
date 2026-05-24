import { createClient } from "@/utils/supabase/client"

const supabase = createClient()

interface CreateEventPayload {
  userId: string
  name: string
}

interface CreateTypeEventPayload {
  eventId: number
  config: {
    base: string
    rodadas: string[]
    temporada: string
  }
}

export const eventRepository = {
  async createEvent({
    userId,
    name,
  }: CreateEventPayload) {
    return await supabase
      .from("events")
      .insert({
        id_responsavel: userId,
        name_event: name,
        code_event: crypto
          .randomUUID()
          .slice(0, 6)
          .toUpperCase(),
        code_visit: crypto
          .randomUUID()
          .slice(0, 6)
          .toUpperCase(),
        code_volunteer: crypto
          .randomUUID()
          .slice(0, 6)
          .toUpperCase(),
      })
      .select("id_evento, code_event")
      .single()
  },

  async createTypeEvent({
    eventId,
    config,
  }: CreateTypeEventPayload) {
    return await supabase
      .from("typeEvent")
      .insert({
        id_event: eventId,
        config,
      })
  },

  async createDefaultSettings(eventId: number) {
    return await supabase
      .from("event_settings")
      .insert({
        id_evento: eventId,
      })
  },
}