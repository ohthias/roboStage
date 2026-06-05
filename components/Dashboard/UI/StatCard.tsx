import { DashboardStats } from "@/types/dashboard.types"
import { Calendar, ClipboardCheck, FileText, Palette } from "lucide-react"

const statLabels: Record<string, { label: string; icon: React.FC<{ className?: string }> }> = {
  testsCount: { label: "Testes Criados", icon: ClipboardCheck },
  documentsCount: { label: "Documentos", icon: FileText },
  eventsCount: { label: "Eventos Criados", icon: Calendar },
  stylesCount: { label: "Estilos Personalizados", icon: Palette },
}

export default function StatCard({
  statKey,
  value,
}: {
  statKey: keyof DashboardStats
  value: number
}) {
  const meta = statLabels[statKey]
  if (!meta) return null
  const Icon = meta.icon
  return (
    <div className="card bg-base-100 border border-base-200 shadow-none rounded-2xl">
      <div className="card-body p-5 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-base-200 rounded-xl">
            <Icon className="w-4 h-4 text-base-content/60" />
          </div>
          <span className="text-3xl font-bold tabular-nums">{value}</span>
        </div>
        <p className="text-sm text-base-content/50 mt-1">{meta.label}</p>
      </div>
    </div>
  )
}