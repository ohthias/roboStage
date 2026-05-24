import { QuickAction } from "@/types/dashboard.types"

import {
  CalendarPlus,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Palette,
} from "lucide-react"

const iconMap: Record<
  string,
  React.FC<{ className?: string }>
> = {
  "clipboard-check": ClipboardCheck,
  "file-text": FileText,
  "calendar-event": CalendarPlus,
  palette: Palette,
}

interface ActionCardProps {
  action: QuickAction
  onClick: () => void
}

export default function ActionCard({
  action,
  onClick,
}: ActionCardProps) {
  const Icon = iconMap[action.icon] ?? FileText

  return (
    <button
      onClick={onClick}
      className="
        card bg-base-100 border border-base-300
        hover:border-primary/40 hover:shadow-md
        transition-all duration-200
        rounded-2xl group
        text-left w-full
      "
    >
      <div className="card-body p-5 flex flex-row items-center gap-4">
        <div
          className="
            p-3 rounded-2xl
            bg-base-200
            group-hover:bg-primary/10
            transition-colors
          "
        >
          <Icon
            className={`w-5 h-5 ${action.colorClass}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">
            {action.label}
          </h3>

          <p className="text-xs text-base-content/60 line-clamp-2">
            {action.description}
          </p>
        </div>

        <ChevronRight
          className="
            w-4 h-4 shrink-0
            text-base-content/30
            group-hover:text-primary
            group-hover:translate-x-0.5
            transition-all
          "
        />
      </div>
    </button>
  )
}