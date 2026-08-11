"use client";

import { RubricCategory, LevelKey, LEVEL_LABELS } from "@/app/(public)/[competicao]/(fll)/rubric/rubric";
import IndicatorRow from "./IndicatorRow";
import { Settings } from "lucide-react";

interface RubricSheetProps {
  category: RubricCategory;
  scores: Record<string, LevelKey | undefined>;
  comments: Record<string, string>;
  onSelect: (indicatorId: string, level: LevelKey) => void;
  onComment: (indicatorId: string, value: string) => void;
}

export default function RubricSheet({
  category,
  scores,
  comments,
  onSelect,
  onComment,
}: RubricSheetProps) {
  return (
    <div className="paper-sheet relative rounded-box bg-base-200/50 border border-base-content/15 p-4 sm:p-6 mb-6">
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-secondary">{category.name}</h2>
        <p className="text-sm text-base-content/65 mt-1.5 max-w-2xl">{category.instructions}</p>
      </div>

      {/* Cabeçalho de colunas de nível, replicando o layout do PDF oficial */}
      <div className="hidden sm:grid grid-cols-4 gap-1.5 mb-3">
        {([1, 2, 3, 4] as LevelKey[]).map((lvl) => (
          <div
            key={lvl}
            className={[
              "rounded-t-box px-2.5 py-1.5 text-center border-b-2",
              lvl === 4
                ? "bg-warning/15 border-warning text-warning-content"
                : "bg-base-200 border-base-300 text-base-content/80",
            ].join(" ")}
          >
            <span className="font-mono-tech text-[11px] font-bold uppercase tracking-wide block text-secondary">
              {LEVEL_LABELS[lvl]}
            </span>
            <span className="font-mono-tech text-[10px] text-base-content/50">{lvl}</span>
          </div>
        ))}
      </div>

      {category.criteria.map((criterion, i) => (
        <div
          key={criterion.id}
          className="border-b border-base-300 last:border-b-0 py-4 first:pt-0"
        >
          <div className="mb-2.5">
            <div className="flex items-baseline gap-2.5">
              <span className="font-mono-tech text-xs text-base-content/40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display font-semibold text-[15px] sm:text-base uppercase tracking-wide">
                {criterion.code}
              </h3>
            </div>
            <p className="text-sm text-base-content/70 mt-1 max-w-2xl">{criterion.question}</p>
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

      <p className="text-[11px] text-base-content/50 mt-4 flex items-start gap-1.5">
        <Settings className="shrink-0 mt-0.5" size={14} />
        <span>
          Indicadores com este símbolo contam em dobro para a classificação de Core Values, que
          representa 25% da pontuação da equipe no Champion&apos;s Award.
        </span>
      </p>
    </div>
  );
}
