"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ACCENT_STYLES, type AccentKey } from "@/utils/labtest/modes";

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TREND_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus };
const TREND_COLOR = {
  up: "text-success",
  down: "text-error",
  flat: "text-base-content/40",
};

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trendDir,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.FC<{ className?: string }>;
  trendDir?: "up" | "down" | "flat";
  accent?: AccentKey;
}) {
  const TIcon = trendDir ? TREND_ICON[trendDir] : null;
  const style = ACCENT_STYLES[accent];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-base-content/10 bg-base-100 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-base-content/45">
          {label}
        </span>
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${style.bgSoft}`}
        >
          <Icon className={`h-3.5 w-3.5 ${style.text}`} />
        </div>
      </div>
      <div>
        <p className={`text-3xl font-bold tracking-tight ${style.text}`}>
          {value}
        </p>
        {sub && (
          <p className="mt-1 flex items-center gap-1 text-xs text-base-content/40">
            {TIcon && (
              <TIcon
                className={`h-3 w-3 ${trendDir ? TREND_COLOR[trendDir] : ""}`}
              />
            )}
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

export function SectionHeader({
  label,
  action,
}: {
  label: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-base-content/60">
        {label}
      </h3>
      {action}
    </div>
  );
}

export const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-base-content/15 bg-base-100 px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="my-1 flex items-center gap-3">
      <div className="h-px flex-1 bg-base-content/10" />
      <span className="text-xs font-medium uppercase tracking-widest text-base-content/40">
        {label}
      </span>
      <div className="h-px flex-1 bg-base-content/10" />
    </div>
  );
}

export function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-r-lg border-l-2 border-primary/40 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-base-content/60">
      {children}
    </div>
  );
}
