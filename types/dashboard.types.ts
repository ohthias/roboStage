export interface DashboardStats {
  testsCount: number
  documentsCount: number
  eventsCount: number
  stylesCount: number
}

export interface RecentItem {
  id: string
  title: string
  type: "Evento" | "Teste" | "Documento" | "Estilo"
  accessedAt: string
}

export interface QuickAction {
  id: string
  label: string
  description: string
  icon: string
  colorClass: string
  modal: "event" | "test" | "content" | "theme"
}

export type UserRole = "student" | "teacher" | "organizer" | "researcher" | string | null
export type PlatformGoal = "compete" | "organize" | "learn" | "evaluate" | string | null

export interface DashboardConfig {
  greeting: string
  subtitle: string
  primaryActions: QuickAction[]
  statsToShow: Array<keyof DashboardStats>
}