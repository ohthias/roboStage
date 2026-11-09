"use client";

import type { ImageEmbedSize } from "./embed-types";

const SIZES: { id: ImageEmbedSize; label: string; title: string }[] = [
  { id: "small", label: "P", title: "Imagem pequena" },
  { id: "medium", label: "M", title: "Imagem média" },
  { id: "full", label: "G", title: "Largura inteira" },
];

/** Classes de largura da imagem para cada tamanho. */
export const IMAGE_SIZE_CLASS: Record<ImageEmbedSize, string> = {
  small: "mx-auto max-w-xs",
  medium: "mx-auto max-w-lg",
  full: "w-full",
};

/** Botões P / M / G na barra do embed. */
export function ImageSizeToggle({
  value,
  onChange,
}: {
  value: ImageEmbedSize;
  onChange: (size: ImageEmbedSize) => void;
}) {
  return (
    <div className="join mr-1" role="radiogroup" aria-label="Tamanho da imagem">
      {SIZES.map((size) => (
        <button
          key={size.id}
          type="button"
          role="radio"
          aria-checked={value === size.id}
          title={size.title}
          onClick={() => onChange(size.id)}
          className={`btn join-item btn-xs h-6 min-h-6 w-6 px-0 text-[10px] ${
            value === size.id ? "btn-active" : "btn-ghost"
          }`}
        >
          {size.label}
        </button>
      ))}
    </div>
  );
}
