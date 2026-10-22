"use client";

import { X } from "lucide-react";
import { readableTextColor, resolveLabelColor } from "@/utils/stagebook/label-colors";
import type { TagDTO } from "@/types/labels";

/** Cor de fundo + cor de texto legível para uma tag. */
export function tagStyle(tag: Pick<TagDTO, "name" | "color">) {
  const bg = resolveLabelColor(tag.color, tag.name);
  return { backgroundColor: bg, color: readableTextColor(bg) };
}

const SIZES = {
  xs: "px-1.5 py-px text-[10px]",
  sm: "px-2.5 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
} as const;

/**
 * Etiqueta colorida — o mesmo visual em Kanban, Documentos, Calendário,
 * ThinkLab e LabTest. A cor de fundo é a escolhida para a tag.
 */
export function TagChip({
  tag,
  size = "sm",
  onRemove,
  onClick,
  className = "",
}: {
  tag: Pick<TagDTO, "name" | "color">;
  size?: keyof typeof SIZES;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}) {
  const style = tagStyle(tag);
  const base = `inline-flex max-w-full items-center gap-1 rounded-full font-medium leading-tight ${SIZES[size]} ${className}`;
  const label = <span className="truncate">{tag.name}</span>;

  return (
    <span className={base} style={style} data-tag-chip>
      {onClick ? (
        <button type="button" className="truncate" onClick={onClick}>
          {label}
        </button>
      ) : (
        label
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remover tag ${tag.name}`}
          className="-mr-0.5 rounded-full opacity-70 transition-opacity hover:opacity-100"
        >
          <X size={size === "xs" ? 9 : 11} />
        </button>
      )}
    </span>
  );
}

export function TagList({
  tags,
  size = "xs",
  max,
  className = "",
}: {
  tags: Pick<TagDTO, "name" | "color">[];
  size?: keyof typeof SIZES;
  max?: number;
  className?: string;
}) {
  if (tags.length === 0) return null;
  const shown = max ? tags.slice(0, max) : tags;
  const hidden = tags.length - shown.length;
  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {shown.map((tag) => (
        <TagChip key={tag.name} tag={tag} size={size} />
      ))}
      {hidden > 0 && <span className="text-[10px] text-base-content/45">+{hidden}</span>}
    </div>
  );
}
