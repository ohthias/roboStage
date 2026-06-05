import { createClient } from "@/utils/supabase/client";
import { validateUUID, validateNonEmptyString, validatePositiveInteger } from "@/utils/validation";

const supabase = createClient();

// Safe column selections
const EVENT_COLUMNS = `
  id_evento,
  code_event,
  name_event,
  id_responsavel,
  last_acess,
  created_at,
  updated_at
`;

const EVENT_SETTINGS_COLUMNS = `
  id_evento,
  enable_playoffs,
  pre_round_inspection,
  advanced_view
`;

const TEAM_COLUMNS = `
  id,
  name,
  description,
  id_event,
  created_at,
  updated_at
`;

export const eventRepository = {
  async createEvent({
    userId,
    name,
  }: {
    userId: string;
    name: string;
  }) {
    const validUserId = validateUUID(userId, "userId");
    const validName = validateNonEmptyString(name, "name", 255);

    return await supabase
      .from("events")
      .insert({
        id_responsavel: validUserId,
        name_event: validName,
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
    const validEventId = validatePositiveInteger(eventId, "eventId");

    if (!config || typeof config !== "object") {
      throw new Error("Invalid config data");
    }

    return await supabase
      .from("typeEvent")
      .insert({
        id_event: validEventId,
        config,
      });
  },

  async createDefaultSettings(
    eventId: number
  ) {
    const validEventId = validatePositiveInteger(eventId, "eventId");

    return await supabase
      .from("event_settings")
      .insert({
        id_evento: validEventId,
      });
  },

  async updateLastAccess(
    eventId: number
  ) {
    const validEventId = validatePositiveInteger(eventId, "eventId");

    return await supabase
      .from("events")
      .update({
        last_acess: new Date().toISOString(),
      })
      .eq("id_evento", validEventId);
  },

  async getEventByCode(
    codeEvent: string
  ) {
    const validCode = validateNonEmptyString(codeEvent, "codeEvent", 50);

    return await supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .eq("code_event", validCode)
      .limit(1);
  },

  async getEventConfig(
    eventId: number
  ) {
    const validEventId = validatePositiveInteger(eventId, "eventId");

    return await supabase
      .from("typeEvent")
      .select("*")
      .eq("id_event", validEventId);
  },

  async getTeamsByEvent(
    eventId: number
  ) {
    const validEventId = validatePositiveInteger(eventId, "eventId");

    return await supabase
      .from("team")
      .select(TEAM_COLUMNS)
      .eq("id_event", validEventId);
  },

  async getEventSettings(
    eventId: number
  ) {
    const validEventId = validatePositiveInteger(eventId, "eventId");

    return await supabase
      .from("event_settings")
      .select(EVENT_SETTINGS_COLUMNS)
      .eq("id_evento", validEventId)
      .maybeSingle();
  },
};