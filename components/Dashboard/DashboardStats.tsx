interface StatItem {
  label: string;
  value: number;
  description?: string;
}

export function DashboardStats({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl bg-base-100 border border-base-300 p-4"
        >
          <p className="text-sm opacity-60">{stat.label}</p>
          <p className="text-2xl font-semibold mt-1">{stat.value}</p>
          {stat.description && (
            <p className="text-xs opacity-50 mt-1">{stat.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
