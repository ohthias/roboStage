"use client";
import { ShieldAlert } from "lucide-react";
import { Starburst, Stepper, cn } from "@/components/stage";
import { PenaltyBlock, PenaltyTier } from "@/features/scoring/future-edition/types";

interface PenaltyCardProps {
  penalties: PenaltyBlock;
  count: number;
  tier: PenaltyTier;
  onChange: (count: number) => void;
}

export default function PenaltyCard({ penalties, count, tier, onChange }: PenaltyCardProps) {
  const maxCount = Math.max(...penalties.table.map((t) => t.count));
  const hit = count > 0;

  return (
    <article
      className={cn(
        "stage-paper relative flex h-full flex-col rounded-2xl border p-5 transition-[border-color,box-shadow] duration-300",
        hit ? "border-error/50 bg-error/[0.06] shadow-[4px_4px_0_0_var(--color-error)]" : "border-dashed border-base-300 bg-base-100",
      )}
    >
      <div className="absolute -right-4 -top-5 z-10" aria-label={tier.zeroesTotal ? "Zera a partida" : `${tier.points} pontos`}>
        <Starburst size={60} tone={hit ? "primary" : "paper"} shadow={false}>
          <span className="text-lg leading-none tabular-nums">{tier.zeroesTotal ? "0!" : tier.points}</span>
        </Starburst>
      </div>

      <header className="flex items-start gap-3 pr-12">
        <span className="grid h-10 min-w-12 shrink-0 place-items-center rounded-tl-lg rounded-br-lg bg-error px-2 font-mono text-sm font-bold tracking-wider text-error-content">
          {penalties.code}
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-black uppercase leading-tight tracking-tight">{penalties.title}</h3>
          <span className="stage-label mt-1.5 inline-flex items-center gap-1 text-base-content/50">
            <ShieldAlert size={11} strokeWidth={3} /> Penalidades recebidas
          </span>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Stepper value={count} min={0} max={maxCount + 5} onChange={onChange} label="Penalidades" />
        <ul className="flex flex-wrap gap-1">
          {penalties.table.map((t) => (
            <li
              key={t.count}
              className={cn(
                "rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                tier.count === t.count && hit ? "bg-error text-error-content" : "bg-base-200 text-base-content/55",
              )}
            >
              {t.count}× {t.zeroesTotal ? "zera" : t.points}
            </li>
          ))}
        </ul>
      </div>

      {tier.zeroesTotal && (
        <p role="alert" className="mt-3 text-xs font-semibold text-error">
          A partir de {maxCount} penalidades, a pontuação total da partida é zerada.
        </p>
      )}
    </article>
  );
}
