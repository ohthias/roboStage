"use client";

import { FOLDER_ICONS } from "@/config/folder-icons";
import FolderIcon from "./FolderIcon";

type Props = {
  value?: string | null;
  onChange: (icon: string) => void;
};

export default function IconPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {Object.entries(FOLDER_ICONS).map(([key]) => {
        const active = value === key;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`
              flex h-12 w-12 items-center justify-center rounded-2xl border transition-all
              ${
                active
                  ? "border-primary bg-primary text-primary-content"
                  : "border-base-300 bg-base-100 hover:border-primary/30"
              }
            `}
          >
            <FolderIcon icon={key} size={20} />
          </button>
        );
      })}
    </div>
  );
}
