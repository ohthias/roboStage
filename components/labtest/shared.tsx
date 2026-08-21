"use client";

// ---------------------------------------------------------------------------
// Peças pequenas reaproveitadas pelo Dashboard, pela View e pelo ResultForm.
// Ficavam faltando — LabTestView e LabTestDashboard importavam daqui mas o
// arquivo não existia, o que quebrava o build inteiro do módulo.
// ---------------------------------------------------------------------------

import type { LucideIcon } from "lucide-react";
import type { AccentColor } from "@/utils/labtest/modes";
import { ACCENT_STYLES } from "@/utils/labtest/modes";

export function fmtDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

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
  const style = ACCENT_STYLES[accent];
  return (
    <div className="rounded-2xl border border-base-content/10 bg-base-100 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-base-content/45">
          {label}
        </p>
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${style.bgSoft}`}>
          <Icon className={`h-3.5 w-3.5 ${style.text}`} />
        </div>
      </div>
      <p className="mt-2 text-xl font-bold tracking-tight">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-base-content/40">{sub}</p>}
    </div>
  );
}

export function SectionHeader({ label }: { label: string }) {
  return (
    <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-base-content/60">
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

export function CustomTooltip({
  active,
  payload,
  label,
}: {
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
