"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { LABEL_PALETTE, normalizeHexColor } from "@/utils/stagebook/label-colors";

/**
 * Seletor de cor de fundo: paleta pronta + qualquer cor (seletor nativo e
 * campo hexadecimal). `value` é o hex atual (ou null = automática).
 */
export function LabelColorPicker({
  value,
  onChange,
  onReset,
  compact = false,
}: {
  value: string | null;
  onChange: (hex: string) => void;
  /** Se informado, mostra "Cor automática". */
  onReset?: () => void;
  compact?: boolean;
}) {
  const [hex, setHex] = useState(value ?? "");
  const current = value?.toLowerCase() ?? null;

  function commitHex(raw: string) {
    setHex(raw);
    const normalized = normalizeHexColor(raw);
    if (normalized) onChange(normalized);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Cor de fundo">
        {LABEL_PALETTE.map((c) => {
          const active = current === c.value;
          return (
            <button
              key={c.value}
              type="button"
              role="radio"
              aria-checked={active}
              title={c.name}
              onClick={() => {
                setHex(c.value);
                onChange(c.value);
              }}
              className={`flex items-center justify-center rounded-full border border-black/10 transition-transform hover:scale-110 ${
                compact ? "h-5 w-5" : "h-6 w-6"
              } ${active ? "ring-2 ring-base-content/60 ring-offset-1 ring-offset-base-100" : ""}`}
              style={{ backgroundColor: c.value }}
            >
              {active && <Check size={12} className="text-white mix-blend-difference" />}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label="Escolher outra cor"
          value={current ?? "#64748b"}
          onChange={(e) => commitHex(e.target.value)}
          className="h-7 w-9 cursor-pointer rounded border border-base-300 bg-transparent p-0.5"
        />
        <input
          value={hex}
          onChange={(e) => commitHex(e.target.value)}
          placeholder="#rrggbb"
          maxLength={7}
          spellCheck={false}
          className="input input-bordered input-xs w-24 font-mono"
          aria-label="Código hexadecimal da cor"
        />
        {onReset && (
          <button type="button" className="btn btn-ghost btn-xs gap-1" onClick={onReset}>
            <RotateCcw size={11} /> Automática
          </button>
        )}
      </div>
    </div>
  );
}
