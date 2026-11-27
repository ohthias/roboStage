"use client";

import { Check, Settings } from "lucide-react";
import { cn } from "@/components/stage";
import { RubricIndicator, LevelKey, LEVEL_LABELS } from "@/features/rubric/lib/fll";

interface IndicatorRowProps {
  indicator: RubricIndicator;
  selected?: LevelKey;
  comment: string;
  onSelect: (level: LevelKey) => void;
  onCommentChange: (value: string) => void;
}

const LEVELS: LevelKey[] = [1, 2, 3, 4];

// Mesmos tons do RubricLevelPicker da Stage UI.
const levelFill: Record<LevelKey, string> = {
  1: "bg-warning text-warning-content",
  2: "bg-accent text-accent-content",
  3: "bg-success text-success-content",
  4: "bg-secondary text-secondary-content",
};

export default function IndicatorRow({ indicator, selected, comment, onSelect, onCommentChange }: IndicatorRowProps) {
  return (
    <div>
      <div role="radiogroup" className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        {LEVELS.map((level) => {
          const isActive = selected === level;
          const isExcedente = level === 4;
          const text = isExcedente ? null : indicator.descriptions[level - 1];

          return (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={`${LEVEL_LABELS[level]}${text ? `: ${text}` : ""}`}
              onClick={() => onSelect(level)}
              className={cn(
                "stage-paper flex w-full flex-col gap-1.5 rounded-tl-xl rounded-br-xl border p-2.5 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                isActive
                  ? cn(levelFill[level], "stage-shadow-sm -translate-y-0.5 border-transparent")
                  : "border-base-300 bg-base-100 hover:border-secondary/40",
              )}
            >
              <span className="flex items-center justify-between">
                <span className="stage-display text-2xl leading-none">{level}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-5 place-items-center rounded-sm border",
                    isActive ? "border-transparent bg-base-100 text-base-content" : "border-base-content/30",
                  )}
                >
                  {indicator.gear ? <Settings className="size-3" /> : isActive ? <Check className="size-3" strokeWidth={4} /> : null}
                </span>
              </span>
              <span className="stage-label text-[10px] opacity-80">{LEVEL_LABELS[level]}</span>
              <span className="text-xs leading-snug opacity-90">
                {isExcedente ? "A equipe foi além do esperado — descreva no comentário." : text}
              </span>
            </button>
          );
        })}
      </div>

      {selected === 4 && (
        <textarea
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          rows={2}
          maxLength={200}
          placeholder="De que maneiras a equipe demonstrou excelência? (200 caracteres)"
          className="mt-1.5 w-full resize-none rounded-md border border-warning/50 bg-base-100 px-2.5 py-1.5 text-[13px] placeholder:text-base-content/40 focus:border-warning focus:outline-none focus:ring-2 focus:ring-warning/20"
        />
      )}
    </div>
  );
}
