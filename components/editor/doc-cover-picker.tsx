"use client";

import { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";
import { DocCover, docCoverStyle } from "./doc-cover";
import { SWATCHES } from "./editor-colors";
import { GRADIENTS } from "@/utils/stagebook/doc-icon";
import {
  COVER_IMAGES,
  parseDocCover,
  serializeDocCover,
  type DocCoverValue,
} from "@/utils/stagebook/doc-cover";

const ringOn = "ring-2 ring-primary ring-offset-1 ring-offset-base-100";
const label = "mb-1.5 mt-3 text-[11px] font-medium uppercase tracking-wide text-base-content/40 first:mt-0";

/** Seletor de capa: 5 imagens prontas, cores da paleta (suave/sólida) e gradientes. */
export function DocCoverPicker({
  value,
  onChange,
  onClose,
}: {
  value: string | null;
  onChange: (next: string | null) => void;
  onClose: () => void;
}) {
  const current = parseDocCover(value);
  const rootRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"soft" | "solid">(current?.kind === "palette" ? current.mode : "soft");

  useEffect(() => {
    const down = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!rootRef.current?.contains(t) && !t.closest("[data-cover-trigger]")) onClose();
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", key);
    };
  }, [onClose]);

  const set = (v: DocCoverValue | null) => onChange(serializeDocCover(v));
  const is = (pred: (c: DocCoverValue) => boolean) => !!current && pred(current);

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-label="Escolher capa da página"
      className="absolute left-0 top-full z-50 mt-2 w-[24rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-base-300 bg-base-100 p-3 shadow-2xl"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">Capa da página</span>
        {current && (
          <button
            type="button"
            className="btn btn-ghost btn-xs gap-1 text-error"
            onClick={() => {
              onChange(null);
              onClose();
            }}
          >
            <ImageOff size={12} /> Remover capa
          </button>
        )}
      </div>

      <div className={label}>Imagens</div>
      <div className="grid grid-cols-3 gap-2">
        {COVER_IMAGES.map((img) => {
          const on = is((c) => c.kind === "image" && c.id === img.id);
          return (
            <button
              key={img.id}
              type="button"
              title={img.label}
              aria-label={`Imagem: ${img.label}`}
              aria-pressed={on}
              onClick={() => set({ kind: "image", id: img.id })}
              className={`group relative h-14 overflow-hidden rounded-lg border border-base-300 transition-transform hover:scale-[1.03] ${on ? ringOn : ""}`}
            >
              <DocCover value={{ kind: "image", id: img.id }} className="h-full" />
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className={label}>Cores</div>
        <div className="mt-3 flex gap-1">
          {(["soft", "solid"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => {
                setMode(m);
                if (current?.kind === "palette") set({ ...current, mode: m });
              }}
              className={`btn btn-xs h-6 min-h-6 px-2 font-normal ${mode === m ? "btn-primary" : "btn-ghost"}`}
            >
              {m === "soft" ? "Suave" : "Sólido"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SWATCHES.map((s) => {
          const on = is((c) => c.kind === "palette" && c.id === s.id);
          return (
            <button
              key={s.id}
              type="button"
              title={s.label}
              aria-label={`Cor ${s.label}`}
              aria-pressed={on}
              className={`h-7 w-7 rounded-lg border border-base-300 transition-transform hover:scale-110 ${on ? ringOn : ""}`}
              style={docCoverStyle({ kind: "palette", id: s.id, mode })}
              onClick={() => set({ kind: "palette", id: s.id, mode })}
            />
          );
        })}
      </div>

      <div className={label}>Gradientes</div>
      <div className="flex flex-wrap gap-1.5">
        {GRADIENTS.map((g) => {
          const on = is((c) => c.kind === "gradient" && c.id === g.id);
          return (
            <button
              key={g.id}
              type="button"
              title={g.label}
              aria-label={`Gradiente ${g.label}`}
              aria-pressed={on}
              className={`h-7 w-12 rounded-lg border border-base-300 transition-transform hover:scale-110 ${on ? ringOn : ""}`}
              style={docCoverStyle({ kind: "gradient", id: g.id })}
              onClick={() => set({ kind: "gradient", id: g.id })}
            />
          );
        })}
      </div>
    </div>
  );
}
