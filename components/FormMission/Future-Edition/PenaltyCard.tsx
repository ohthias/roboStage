"use client";
import { PenaltyBlock, PenaltyTier } from "@/app/(public)/[competicao]/(fll)/future-edition/score/scoring.type";

interface PenaltyCardProps {
  penalties: PenaltyBlock;
  count: number;
  tier: PenaltyTier;
  onChange: (count: number) => void;
}

export default function PenaltyCard({ penalties, count, tier, onChange }: PenaltyCardProps) {
  const maxCount = Math.max(...penalties.table.map((t) => t.count));

  return (
    <div className="border border-error/40 bg-error/5 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <span className="text-xs font-bold text-error/70">{penalties.code}</span>
          <h3 className="font-bold text-lg leading-tight text-error">{penalties.title}</h3>
        </div>
        <span className="text-2xl font-black text-error shrink-0">
          {tier.zeroesTotal ? "ZERA" : tier.points}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn btn-sm btn-circle btn-outline"
          onClick={() => onChange(Math.max(count - 1, 0))}
        >
          -
        </button>
        <span className="w-10 text-center font-bold text-lg">{count}</span>
        <button
          type="button"
          className="btn btn-sm btn-circle btn-outline"
          onClick={() => onChange(count + 1)}
        >
          +
        </button>
        <span className="text-xs text-base-content/60">penalidades recebidas</span>
      </div>

      {tier.zeroesTotal && (
        <p className="text-xs text-error font-semibold mt-2">
          A partir de {maxCount} penalidades, a pontuação total da partida é zerada.
        </p>
      )}
    </div>
  );
}