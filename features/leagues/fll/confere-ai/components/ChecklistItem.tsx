"use client";

import { Check, Star, X } from "lucide-react";
import { IconButton, cn } from "@/components/stage";
import { EffectiveItem } from "@/features/leagues/fll/confere-ai/lib/utils";

interface ChecklistItemProps {
  item: EffectiveItem;
  checked: boolean;
  onToggle: (itemId: string) => void;
  onRemove?: (itemId: string) => void;
  compact?: boolean;
}

export default function ChecklistItem({ item, checked, onToggle, onRemove, compact = false }: ChecklistItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-md px-2 transition-colors hover:bg-base-content/[0.04]",
        compact ? "py-1" : "py-1.5",
      )}
    >
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        aria-pressed={checked}
        aria-label={checked ? `Desmarcar "${item.text}"` : `Marcar "${item.text}" como concluído`}
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span
          aria-hidden="true"
          className={cn(
            "grid size-5 shrink-0 place-items-center rounded-tl-md rounded-br-md border transition-colors",
            checked
              ? "border-success bg-success text-success-content"
              : item.important
                ? "border-primary"
                : "border-base-content/30",
          )}
        >
          {checked && <Check size={12} strokeWidth={3} />}
        </span>
        <span
          className={cn(
            "flex-1 text-[13px] sm:text-sm",
            checked ? "text-base-content/45 line-through" : "text-base-content",
          )}
        >
          {item.text}
        </span>
        {item.important && !checked && (
          <span title="Item importante">
            <Star className="size-3.5 shrink-0 fill-primary text-primary" aria-hidden="true" />
          </span>
        )}
      </button>

      {item.custom && onRemove && (
        <IconButton
          label={`Remover item personalizado "${item.text}"`}
          icon={<X />}
          size="xs"
          className="opacity-60 group-hover:opacity-100"
          onClick={() => onRemove(item.id)}
        />
      )}
    </div>
  );
}
