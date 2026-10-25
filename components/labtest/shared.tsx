
// ---------------------------------------------------------------------------
// Peças pequenas reaproveitadas pelo LabTest (lista, detalhe, gráficos).
// ---------------------------------------------------------------------------

import type { LucideIcon } from "lucide-react";
import type { AccentColor } from "@/utils/labtest/modes";

export function fmtDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

// Classes estáticas (o Tailwind precisa enxergá-las por inteiro).
const TONES: Record<
  AccentColor,
  { card: string; chip: string; text: string }
> = {
  primary: { card: "bg-primary/10", chip: "bg-primary/20 text-primary", text: "text-primary" },
  secondary: { card: "bg-secondary/10", chip: "bg-secondary/20 text-secondary", text: "text-secondary" },
  accent: { card: "bg-accent/15", chip: "bg-accent/30 text-accent-content", text: "text-accent-content" },
  info: { card: "bg-info/10", chip: "bg-info/20 text-info", text: "text-info" },
};

/** Card de métrica em tom pastel, no estilo do dashboard de referência. */
export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  accent: AccentColor;
}) {
  const tone = TONES[accent];
  return (
    <div
      className={`flex flex-col gap-3 rounded-tl-3xl rounded-tr-lg rounded-br-3xl rounded-bl-lg p-4 sm:p-5 ${tone.card}`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`flex size-8 items-center justify-center rounded-full ${tone.chip}`}>
          <Icon className="size-4" />
        </span>
        <p className="truncate text-xs font-semibold text-base-content/70">{label}</p>
      </div>
      <p className="text-2xl font-black tracking-tight sm:text-3xl">{value}</p>
      {sub && <p className="-mt-1 truncate text-xs text-base-content/50">{sub}</p>}
    </div>
  );
}

export function SectionHeader({ label }: { label: string }) {
  return (
    <h3 className="mb-4 text-sm font-bold tracking-tight text-base-content/80">
      {label}
    </h3>
  );
}

export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-base-content/40">
        {label}
      </span>
      <div className="h-px flex-1 bg-base-content/10" />
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 px-5 py-10 text-center text-sm text-base-content/50">
      {children}
    </div>
  );
}

export function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name?: string; value?: number | string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-base-content/10 bg-base-100 px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-base-content/70">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-base-content/50">
          {p.name}: <span className="font-semibold text-base-content">{p.value}</span>
        </p>
      ))}
    </div>
  );
}