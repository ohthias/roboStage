"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { dashboardService } from "@/server/services/dashboard.service"
import type { DashboardStats, DashboardConfig, RecentItem } from "@/types/dashboard.types"

interface UseDashboardReturn {
  stats: DashboardStats | null
  recentItems: RecentItem[]
  config: DashboardConfig
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useDashboard(): UseDashboardReturn {
  const { user, profile } = useAuth()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentItems, setRecentItems] = useState<RecentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const config = dashboardService.getDashboardConfig(
    profile?.user_role ?? null,
    profile?.platform_goal ?? null,
  )

  useEffect(() => {
    if (!user?.id) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [s, r] = await Promise.all([
          dashboardService.getStats(user!.id),
          dashboardService.getRecentItems(user!.id),
        ])
        if (!cancelled) {
          setStats(s)
          setRecentItems(r)
        }
      } catch (err) {
        if (!cancelled) setError("Não foi possível carregar os dados.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [user?.id, tick])

  function refresh() {
    setTick((t) => t + 1)
  }

  return { stats, recentItems, config, loading, error, refresh }
}