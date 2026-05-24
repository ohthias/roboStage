import { eventRepository } from "@/repositories/event.repository"

interface CreateEventServicePayload {
  userId: string
  name: string
  competitionType: string
  season: string
  rounds: string[]
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
      throw new Error("Nome do evento obrigatório")
    }

    if (!competitionType) {
      throw new Error(
        "Tipo da competição obrigatório"
      )
    }

    if (!season) {
      throw new Error("Temporada obrigatória")
    }

    if (rounds.length === 0) {
      throw new Error(
        "Adicione pelo menos uma rodada"
      )
    }

    const { data, error } =
      await eventRepository.createEvent({
        userId,
        name,
      })

    if (error || !data) {
      throw error
    }

    const config = {
      base: competitionType,
      rodadas: rounds,
      temporada: season,
    }

    const { error: typeError } =
      await eventRepository.createTypeEvent({
        eventId: data.id_evento,
        config,
      })

    if (typeError) {
      throw typeError
    }

    await eventRepository.createDefaultSettings(
      data.id_evento
    )

    return data
  },
}