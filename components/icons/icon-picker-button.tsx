"use client";

import { useState, type ReactNode } from "react";
import { EmojiPicker } from "./emoji-picker";

export function IconPickerButton({
  icon,
  fallback,
  onChange,
  className = "",
  emojiClassName = "text-lg",
  title = "Escolher ícone",
}: {
  icon?: string | null;
  fallback: ReactNode;
  onChange: (icon: string | null) => void;
  className?: string;
  emojiClassName?: string;
  title?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        title={title}
        aria-label={title}
        className={[
          "flex items-center justify-center rounded-lg transition hover:bg-base-200",
          className,
        ].join(" ")}
      >
        {icon ? <span className={emojiClassName}>{icon}</span> : fallback}
      </button>

      {open && (
        <EmojiPicker
          onSelect={(emoji) => {
            onChange(emoji);
            setOpen(false);
          }}
          onRemove={
            icon
              ? () => {
                  onChange(null);
                  setOpen(false);
                }
              : undefined
          }
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
