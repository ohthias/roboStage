import { CheckCircle, FileText, Calendar, Palette } from "lucide-react";

type Stat = {
  label: string;
  value: number;
};

interface DashboardStatsProps {
  stats: Stat[];
}

const STAT_CONFIG = [
  {
    icon: CheckCircle,
    iconClass: "text-primary",
    bgClass: "bg-primary/10",
    borderClass: "border-primary/20",
  },
  {
    icon: FileText,
    iconClass: "text-accent",
    bgClass: "bg-accent/10",
    borderClass: "border-accent/20",
  },
  {
    icon: Calendar,
    iconClass: "text-secondary",
    bgClass: "bg-secondary/10",
    borderClass: "border-secondary/20",
  },
  {
    icon: Palette,
    iconClass: "text-warning",
    bgClass: "bg-warning/10",
    borderClass: "border-warning/20",
  },
] as const;

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat, i) => {
        const cfg = STAT_CONFIG[i % STAT_CONFIG.length];
        const Icon = cfg.icon;

        return (
          <div
            key={stat.label}
            className={`
              flex flex-col gap-3 p-4 rounded-2xl bg-base-100
              border ${cfg.borderClass}
              hover:shadow-sm hover:-translate-y-px
              transition-all duration-200
            `}
          >
            {/* Icon + value row */}
            <div className="flex items-start justify-between gap-2">
              <div
                className={`
                  flex items-center justify-center
                  w-9 h-9 rounded-xl shrink-0
                  ${cfg.bgClass}
                `}
              >
                <Icon size={17} className={cfg.iconClass} />
              </div>

              <span className="text-2xl font-bold tabular-nums leading-none mt-0.5">
                {stat.value}
              </span>
            </div>

            {/* Label */}
            <p className="text-xs font-medium text-base-content/50 leading-tight">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}