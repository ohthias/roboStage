"use client";

import { Settings } from "lucide-react";
import { RubricCategory, LevelKey } from "@/features/rubric/lib/fll";
import IndicatorRow from "./IndicatorRow";

interface RubricSheetProps {
  category: RubricCategory;
  scores: Record<string, LevelKey | undefined>;
  comments: Record<string, string>;
  onSelect: (indicatorId: string, level: LevelKey) => void;
  onComment: (indicatorId: string, value: string) => void;
}

export default function RubricSheet({ category, scores, comments, onSelect, onComment }: RubricSheetProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-base-300 bg-base-100">
      <header className="border-b border-base-300 px-4 py-3 sm:px-5">
        <p className="font-mono text-[11px] font-semibold tracking-wider text-secondary">{category.code}</p>
        <h2 className="text-lg font-black tracking-tight">{category.name}</h2>
        <p className="mt-1 max-w-3xl text-[13px] leading-6 text-base-content/65">{category.instructions}</p>
      </header>

      <div className="divide-y divide-base-300">
        {category.criteria.map((criterion, i) => (
          <div key={criterion.id} className="px-4 py-4 sm:px-5">
            <div className="mb-2.5">
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-xs text-base-content/40">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-sm font-bold uppercase tracking-wide text-secondary">{criterion.code}</h3>
              </div>
              <p className="mt-1 max-w-3xl text-[13px] text-base-content/70">{criterion.question}</p>
            </div>

            <div className="space-y-2">
              {criterion.indicators.map((indicator) => (
                <IndicatorRow
                  key={indicator.id}
                  indicator={indicator}
                  selected={scores[indicator.id]}
                  comment={comments[indicator.id] ?? ""}
                  onSelect={(level) => onSelect(indicator.id, level)}
                  onCommentChange={(value) => onComment(indicator.id, value)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer className="flex items-start gap-1.5 border-t border-base-300 bg-base-200/40 px-4 py-2.5 text-[11px] text-base-content/55 sm:px-5">
        <Settings className="mt-0.5 shrink-0" size={14} />
        <span>
          Indicadores com este símbolo contam em dobro para a classificação de Core Values, que representa 25% da
          pontuação da equipe no Champion&apos;s Award.
        </span>
      </footer>
    </section>
  );
}
