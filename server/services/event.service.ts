import { eventRepository } from "@/server/repositories/event.repository";

interface CreateEventServicePayload {
  userId: string;
  name: string;
  competitionType: string;
  season: string;
  rounds: string[];
}

async function fetchWithRetry<T extends { data: any[] | null }>(
  fn: () => Promise<T>,
  maxAttempts = 5,
  delayMs = 600,
): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await fn();
    if (result.data && result.data.length > 0) return result;
    if (attempt < maxAttempts - 1) {
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  return fn(); // última tentativa, retorna o que vier
}

export const eventService = {
  async createEvent({
    userId,
    name,
    competitionType,
    season,
    rounds,
  }: CreateEventServicePayload) {
    if (!name.trim()) {
      throw new Error("Nome do evento obrigatório");
    }

    if (!competitionType) {
      throw new Error("Tipo da competição obrigatório");
    }

    if (!season) {
      throw new Error("Temporada obrigatória");
    }

    if (rounds.length === 0) {
      throw new Error("Adicione pelo menos uma rodada");
    }

    const { data, error } = await eventRepository.createEvent({
      userId,
      name,
    });

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error("Erro ao criar o evento");
    }

    const config = {
      base: competitionType,
      rodadas: rounds,
      temporada: season,
    };

    const { error: typeError } = await eventRepository.createTypeEvent({
      eventId: data.id_evento,
      config,
    });

    if (typeError) {
      throw typeError;
    }

    await eventRepository.createDefaultSettings(data.id_evento);

    return data;
  },

  async updateLastAccess(eventId: number) {
    const { error } = await eventRepository.updateLastAccess(eventId);

    if (error) {
      throw error;
    }
  },

  async getCompleteEvent(codeEvent: string) {
    const event = await eventRepository.getEventByCode(codeEvent);

    if (!event.data?.length) {
      throw new Error("Evento não encontrado");
    }

    const eventData = event.data[0];

    // Retry para aguardar propagação no Supabase nano
    const [config, teams] = await Promise.all([
      fetchWithRetry(() => eventRepository.getEventConfig(eventData.id_evento)),
      eventRepository.getTeamsByEvent(eventData.id_evento),
    ]);

    return {
      event: eventData,
      config: config.data?.[0] ?? null,
      teams: teams.data ?? [],
    };
  },

  async getEventSettings(eventId: number) {
    const { data, error } = await eventRepository.getEventSettings(eventId);

    if (error) {
      throw error;
    }

    if (Array.isArray(data)) {
      return data[0] ?? null;
    }

    return data ?? null;
  },
};
