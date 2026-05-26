"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { HeatPoint, HeatmapStats } from "@/types/heatmap";

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat px-3 py-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={String(value)}
          className="stat-value text-base font-semibold tabular-nums"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.18 }}
        >
          {value}
        </motion.div>
      </AnimatePresence>
      <div className="stat-title text-[11px] uppercase tracking-wide text-base-content/60">
        {label}
      </div>
    </div>
  );
}

// ── Point row ─────────────────────────────────────────────────────────────────

function intensityColor(intensity: number): string {
  if (intensity > 8) return "#ff4d6a";
  if (intensity > 4) return "#ffd166";
  return "#06d6a0";
}

type PointRowProps = {
  point: HeatPoint;
  onDelete: (id: string) => void;
};

function PointRow({ point, onDelete }: PointRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 6 }}
      className="flex items-center justify-between gap-3 rounded-lg border border-base-300 bg-base-100/80 px-3 py-2 shadow-sm"
    >
      <span className="font-mono text-xs text-base-content/70">
        {Math.round(point.x * 100)},{Math.round(point.y * 100)}
      </span>
      <span
        className="badge badge-outline badge-sm font-semibold"
        style={{
          color: intensityColor(point.intensity),
          borderColor: intensityColor(point.intensity),
        }}
      >
        {point.intensity}
      </span>
      <button
        className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10"
        onClick={() => onDelete(point.id)}
        aria-label="Excluir ponto"
      >
        ✕
      </button>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

type Props = {
  stats: HeatmapStats;
  points: HeatPoint[];
  onDeletePoint: (id: string) => void;
};

export default function StatsPanel({ stats, points, onDeletePoint }: Props) {
  const top10 = [...points]
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 10);

  const hotspotLabel = stats.hotspot
    ? `${stats.hotspot.x},${stats.hotspot.y}`
    : "—";

  return (
    <>
      <div className="card bg-base-100/80 border border-base-300 shadow-xl backdrop-blur">
        <div className="card-body p-4 gap-4">
          <p className="text-sm font-semibold text-base-content/80">
            Estatísticas
          </p>
          <div className="stats stats-vertical sm:stats-horizontal bg-base-200/70 shadow-sm w-full">
            <StatCard label="Pontos" value={stats.totalPoints} />
            <StatCard label="Hotspot" value={hotspotLabel} />
            <StatCard label="Int. Máx" value={stats.maxIntensity} />
            <StatCard label="Zonas" value={stats.zoneCount} />
          </div>
        </div>
      </div>

      <div className="card bg-base-100/80 border border-base-300 shadow-xl backdrop-blur flex-1 min-h-0 overflow-hidden">
        <div className="card-body p-4 gap-4 flex flex-col">
          <p className="text-sm font-semibold text-base-content/80">
            Últimos pontos
          </p>
          <div className="points-list overflow-y-auto space-y-2 pr-1">
            <AnimatePresence>
              {top10.length === 0 ? (
                <p className="empty-state text-center text-xs font-mono text-base-content/40 py-3">
                  nenhum ponto
                </p>
              ) : (
                top10.map((p) => (
                  <PointRow key={p.id} point={p} onDelete={onDeletePoint} />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
