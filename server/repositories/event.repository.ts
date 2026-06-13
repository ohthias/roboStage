import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export const eventRepository = {
  async createEvent({
    userId,
    name,
  }: {
    userId: string;
    name: string;
  }) {
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
      .single();
  },

  async createTypeEvent({
    eventId,
    config,
  }: {
    eventId: number;
    config: any;
  }) {
    return await supabase
      .from("typeEvent")
      .insert({
        id_event: eventId,
        config,
      });
  },

  async createDefaultSettings(
    eventId: number
  ) {
    return await supabase
      .from("event_settings")
      .insert({
        id_evento: eventId,
      });
  },

  async updateLastAccess(
    eventId: number
  ) {
    return await supabase
      .from("events")
      .update({
        last_acess:
          new Date().toISOString(),
      })
      .eq("id_evento", eventId);
  },

  async getEventByCode(
    codeEvent: string
  ) {
    return await supabase
      .from("events")
      .select("*")
      .eq("code_event", codeEvent)
      .limit(1);
  },

  async getEventConfig(
    eventId: number
  ) {
    return await supabase
      .from("typeEvent")
      .select("*")
      .eq("id_event", eventId);
  },

  async getTeamsByEvent(
    eventId: number
  ) {
    return await supabase
      .from("team")
      .select("*")
      .eq("id_event", eventId);
  },

  async getEventSettings(
    eventId: number
  ) {
    return await supabase
      .from("event_settings")
      .select(`
        enable_playoffs,
        pre_round_inspection,
        advanced_view
      `)
      .eq("id_evento", eventId)
      .maybeSingle();
  },
};