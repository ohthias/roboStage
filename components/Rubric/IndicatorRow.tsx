"use client";

import {
  RubricIndicator,
  LevelKey,
  LEVEL_LABELS,
} from "@/app/(public)/[competicao]/(fll)/rubric/rubric";
import { Settings } from "lucide-react";

interface IndicatorRowProps {
  indicator: RubricIndicator;
  selected?: LevelKey;
  comment: string;
  onSelect: (level: LevelKey) => void;
  onCommentChange: (value: string) => void;
}

const LEVELS: LevelKey[] = [1, 2, 3, 4];

export default function IndicatorRow({
  indicator,
  selected,
  comment,
  onSelect,
  onCommentChange,
}: IndicatorRowProps) {
  return (
    <div className="mb-2.5 last:mb-0">
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-4">
        {LEVELS.map((level) => {
          const isActive = selected === level;
          const isExcedente = level === 4;
          const text = isExcedente ? null : indicator.descriptions[level - 1];
          const Icon = indicator.gear ? Settings : null;

          return (
            <button
              key={level}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(level)}
              className={[
                "btn btn-outline h-auto min-h-0 w-full justify-start gap-2 rounded-box border px-2.5 py-2 normal-case text-left shadow-none",
                isActive
                  ? "btn-active border-secondary bg-secondary/10"
                  : "border-base-300 bg-base-100",
              ].join(" ")}
            >
              <span
                className={[
                  "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                  isActive
                    ? "border-secondary bg-secondary"
                    : "border-base-content/40 bg-base-100/40",
                ].join(" ")}
              >
                {indicator.gear ? (
                  <Settings
                    className={[
                      "h-3.5 w-3.5",
                      isActive ? "text-secondary-content" : "text-base-content/40",
                    ].join(" ")}
                    size={16}
                  />
                ) : (
                  <span
                    className={[
                      "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                      isActive
                        ? "border-secondary bg-secondary"
                        : "border-base-content/40 bg-base-100/40",
                    ].join(" ")}
                  >
                    {isActive ? (
                      <svg
                        viewBox="0 0 12 12"
                        className="h-3 w-3 text-secondary-content"
                        fill="none"
                      >
                        <path
                          d="M2 6.5L4.8 9L10 3"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </span>
                )}
              </span>
              <span className="text-[13px] leading-snug">
                {isExcedente ? (
                  <span className="italic text-base-content/60">
                    {LEVEL_LABELS[4]}*
                  </span>
                ) : (
                  <p className="text-base-content text-xs">{text}</p>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {selected === 4 && (
        <div className="mt-1.5">
          <textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            rows={2}
            maxLength={200}
            placeholder="De que maneiras a equipe demonstrou excelência? (200 caracteres)"
            className="textarea textarea-bordered w-full bg-base-100/70 text-sm text-base-content border-base-300/60 focus:border-secondary focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
