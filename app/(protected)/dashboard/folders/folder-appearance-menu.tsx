"use client";

import { useState, useTransition } from "react";
import { Check, Palette, Smile } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { DocIcon } from "@/components/editor/doc-icon";
import { DocIconPicker } from "@/components/editor/doc-icon-picker";
import { FOLDER_COLORS } from "@/utils/stagebook/folder-colors";
import { updateFolderAppearance } from "../documents/actions";

import { unwrapAction } from "@/utils/stagebook/action-result";
export type FolderAppearance = { icon: string | null; color: string | null };

/**
 * Menu "Personalizar pasta": ícone (mesmo seletor das páginas) e cor de fundo
 * (paleta do Stagebook). Aplica de forma otimista e reverte se a action falhar.
 */
export function FolderAppearanceMenu({
  folderId,
  icon,
  color,
  onChange,
  triggerClassName = "btn btn-ghost btn-xs btn-square",
  align = "end",
  triggerLabel,
}: {
  folderId: string;
  icon: string | null;
  color: string | null;
  onChange: (next: FolderAppearance) => void;
  triggerClassName?: string;
  align?: "start" | "end";
  triggerLabel?: string;
}) {
  const { addToast } = useToast();
  const [, startTransition] = useTransition();
  const [pickerOpen, setPickerOpen] = useState(false);

  function apply(patch: Partial<FolderAppearance>) {
    const previous = { icon, color };
    const next = { ...previous, ...patch };
    onChange(next);
    startTransition(async () => {
      try {
        unwrapAction(await updateFolderAppearance(folderId, patch));
      } catch (error) {
        onChange(previous);
        addToast(
          error instanceof Error ? error.message : "Não foi possível personalizar a pasta.",
          "error",
        );
      }
    });
  }

  return (
    <div className={`dropdown ${align === "end" ? "dropdown-end" : ""}`}>
      <button
        type="button"
        tabIndex={0}
        className={triggerClassName}
        title="Personalizar pasta"
        aria-label="Personalizar pasta"
      >
        <Palette size={15} />
        {triggerLabel}
      </button>

      <div
        tabIndex={0}
        className="dropdown-content z-30 mt-2 w-64 space-y-4 rounded-xl border border-base-300 bg-base-100 p-4 shadow-lg"
      >
        <section className="space-y-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-base-content/60">
            Ícone
          </h3>
          <div className="relative flex items-center gap-2">
            <button
              type="button"
              data-icon-trigger
              onClick={() => setPickerOpen((open) => !open)}
              aria-expanded={pickerOpen}
              className="btn btn-outline btn-sm flex-1 justify-start gap-2 border-base-300"
            >
              {icon ? <DocIcon value={icon} size={18} /> : <Smile size={16} />}
              {icon ? "Trocar ícone" : "Escolher ícone"}
            </button>
            {icon && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => apply({ icon: null })}
              >
                Remover
              </button>
            )}
            {pickerOpen && (
              <DocIconPicker
                value={icon}
                onChange={(next: string | null) => apply({ icon: next })}
                onClose={() => setPickerOpen(false)}
              />
            )}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-base-content/60">
            Cor de fundo
          </h3>
          <div className="flex flex-wrap gap-2">
            {FOLDER_COLORS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                title={label}
                aria-label={`Usar cor ${label}`}
                aria-pressed={color === value}
                onClick={() => apply({ color: value })}
                className="flex size-7 items-center justify-center rounded-full border border-base-300 transition-transform hover:scale-110"
                style={{ backgroundColor: value }}
              >
                {color === value && <Check size={14} className="text-white" />}
              </button>
            ))}
          </div>
          {color && (
            <button
              type="button"
              className="text-xs text-base-content/60 underline"
              onClick={() => apply({ color: null })}
            >
              Voltar à cor padrão
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
