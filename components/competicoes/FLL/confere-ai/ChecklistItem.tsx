"use client";

import { Star, X } from "lucide-react";
import { EffectiveItem } from "@/utils/competitions/fll/confere-ai/utils";

interface ChecklistItemProps {
  item: EffectiveItem;
  checked: boolean;
  onToggle: (itemId: string) => void;
  onRemove?: (itemId: string) => void;
  compact?: boolean;
}

export default function ChecklistItem({
  item,
  checked,
  onToggle,
  onRemove,
  compact = false,
}: ChecklistItemProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border border-base-300 bg-base-100 px-3 transition-colors hover:bg-base-200 ${
        compact ? "py-2" : "py-3"
      }`}
    >
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        aria-pressed={checked}
        aria-label={checked ? `Desmarcar "${item.text}"` : `Marcar "${item.text}" como concluído`}
        className="flex flex-1 items-center gap-3 text-left focus:outline-none"
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(item.id)}
          tabIndex={-1}
          aria-hidden="true"
          className={`checkbox pointer-events-none checkbox-sm ${
            item.important ? "checkbox-primary" : ""
          }`}
        />
        <span
          className={`flex-1 text-sm sm:text-base ${
            checked ? "text-base-content/50 line-through" : "text-base-content"
          }`}
        >
          {item.text}
        </span>
        {item.important && !checked && (
          <span title="Item importante">
            <Star className="h-4 w-4 shrink-0 fill-primary text-primary" aria-hidden="true" />
          </span>
        )}
      </button>

      {item.custom && onRemove && (
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`Remover item personalizado "${item.text}"`}
          className="btn btn-ghost btn-xs btn-circle shrink-0"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
