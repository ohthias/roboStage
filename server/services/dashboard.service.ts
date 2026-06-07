import { dashboardRepository } from "@/server/repositories/dashboard.repository"
import type {
  DashboardStats,
  DashboardConfig,
  RecentItem,
  PlatformGoal,
  UserRole,
} from "@/types/dashboard.types"

function timeAgo(date: string): string {
  try {
    const input = new Date(date)
    if (Number.isNaN(input.getTime())) return "recentemente"

    const diffMs = Date.now() - input.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMinutes < 1) return "agora mesmo"
    if (diffMinutes < 60) return `há ${diffMinutes} minuto${diffMinutes === 1 ? "" : "s"}`
    if (diffHours < 24) return `há ${diffHours} hora${diffHours === 1 ? "" : "s"}`
    return `há ${diffDays} dia${diffDays === 1 ? "" : "s"}`
  } catch {
    return "recentemente"
  }
}

export const dashboardService = {
  async getStats(userId: string): Promise<DashboardStats> {
    const [tests, documents, events, styles] = await Promise.all([
      dashboardRepository.getTestsCount(userId),
      dashboardRepository.getDocumentsCount(userId),
      dashboardRepository.getEventsCount(userId),
      dashboardRepository.getStylesCount(userId),
    ])

    return {
      testsCount: tests.count ?? 0,
      documentsCount: documents.count ?? 0,
      eventsCount: events.count ?? 0,
      stylesCount: styles.count ?? 0,
    }
  },

  async getRecentItems(userId: string): Promise<RecentItem[]> {
    const [tests, documents, events] = await Promise.all([
      dashboardRepository.getRecentTests(userId, 3),
      dashboardRepository.getRecentDocuments(userId, 2),
      dashboardRepository.getRecentEvents(userId, 2),
    ])

    const items: RecentItem[] = [
      ...(events.data ?? []).map((e) => ({
        id: String(e.id_evento),
        title: e.name_event ?? "Evento",
        type: "Evento" as const,
        accessedAt: timeAgo(e.last_acess),
      })),
      ...(tests.data ?? []).map((t) => ({
        id: t.id,
        title: t.name_test ?? "Teste",
        type: "Teste" as const,
        accessedAt: timeAgo(t.last_acess),
      })),
      ...(documents.data ?? []).map((d) => ({
        id: d.id,
        title: d.title,
        type: "Documento" as const,
        accessedAt: timeAgo(d.updated_at),
      })),
    ]

    return items.slice(0, 6)
  },

  getDashboardConfig(role: UserRole, goal: PlatformGoal): DashboardConfig {
    const isOrganizer = role === "organizer" || goal === "organize"
    const isStudent = role === "student" || goal === "compete"
    const isTeacher = role === "teacher" || goal === "evaluate"

    if (isOrganizer) {
      return {
        greeting: "Pronto para organizar?",
        subtitle: "Gerencie seus eventos e acompanhe as equipes.",
        primaryActions: [
          {
            id: "showlive",
            label: "ShowLive",
            description: "Transmita ao vivo",
            icon: "broadcast",
            colorClass: "text-secondary",
            modal: "event"
          },
          {
            id: "style",
            label: "Novo Estilo",
            description: "Personalize o visual",
            icon: "palette",
            colorClass: "text-accent",
            modal: "theme"
          },
        ],
        statsToShow: ["eventsCount", "stylesCount", "testsCount", "documentsCount"],
      }
    }

    if (isTeacher) {
      return {
        greeting: "Bem-vindo de volta,",
        subtitle: "Crie avaliações e acompanhe o desempenho.",
        primaryActions: [
          {
            id: "test",
            label: "Novo Teste",
            description: "Crie uma avaliação",
            icon: "clipboard-check",
            colorClass: "text-primary",
            modal: "event"
          },
          {
            id: "document",
            label: "Novo Documento",
            description: "Escreva um conteúdo",
            icon: "file-text",
            colorClass: "text-secondary",
            modal: "event"
          },
          {
            id: "event",
            label: "Novo Evento",
            description: "Organize uma atividade",
            icon: "calendar-event",
            colorClass: "text-accent",
            modal: "event"
          },
        ],
        statsToShow: ["testsCount", "documentsCount", "eventsCount", "stylesCount"],
      }
    }

    if (isStudent) {
      return {
        greeting: "Bora competir,",
        subtitle: "Retome seus treinos e prepare-se para a próxima rodada.",
        primaryActions: [
          {
            id: "test",
            label: "Novo Teste",
            description: "Pratique uma missão",
            icon: "clipboard-check",
            colorClass: "text-primary",
            modal: "event"
          },
          {
            id: "document",
            label: "Novo Documento",
            description: "Documente seu projeto",
            icon: "file-text",
            colorClass: "text-secondary",
            modal: "event"
          },
        ],
        statsToShow: ["testsCount", "documentsCount", "eventsCount", "stylesCount"],
      }
    }

    // Default / researcher / learn
    return {
      greeting: "Boa tarde,",
      subtitle: "Retome suas atividades e acesse seus recursos rapidamente.",
      primaryActions: [
        {
          id: "test",
          label: "Novo Teste",
          description: "Crie uma avaliação",
          icon: "clipboard-check",
          colorClass: "text-primary",
          modal: "event"
        },
        {
          id: "event",
          label: "Novo Evento",
          description: "Agende uma atividade",
          icon: "calendar-event",
          colorClass: "text-secondary",
          modal: "event"
        },
        {
          id: "document",
          label: "Novo Documento",
          description: "Escreva um conteúdo",
          icon: "file-text",
          colorClass: "text-accent",
          modal: "event"
        },
        {
          id: "style",
          label: "Novo Estilo",
          description: "Personalize o visual",
          icon: "palette",
          colorClass: "text-neutral",
          modal: "event"
        },
      ],
      statsToShow: ["testsCount", "documentsCount", "eventsCount", "stylesCount"],
    }
  },
}