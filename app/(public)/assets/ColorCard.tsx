"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/app/context/ToastContext";

export type BrandColor = {
  name: string;
  token: string;
  value: string;
  description: string;
  dark: boolean; // texto escuro sobre a cor
};

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

function useCopy() {
  const { addToast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      addToast(`${label} copiado!`, "success");
      setTimeout(() => setCopied(null), 1500);
    } catch {
      addToast("Não foi possível copiar.", "error");
    }
  };
  return { copied, copy };
}

export default function ColorCard({ color, index }: { color: BrandColor; index: number }) {
  const { copied, copy } = useCopy();
  const rgb = hexToRgb(color.value);
  const rows = [
    { label: "HEX", value: color.value.toUpperCase() },
    { label: "RGB", value: rgb },
    { label: "CSS", value: `var(--color-${color.token})` },
  ];

  return (
    <article className="group overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--color-base-content)]">
      <button
        type="button"
        onClick={() => copy(color.value.toUpperCase(), `HEX de ${color.name}`)}
        className={`flex h-36 w-full items-end justify-between p-5 text-left ${color.dark ? "text-black" : "text-white"}`}
        style={{ backgroundColor: color.value }}
        aria-label={`Copiar ${color.value} (${color.name})`}
      >
        <span className="font-mono text-xs opacity-80">/{String(index + 1).padStart(2, "0")}</span>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-black/15 px-2 py-1 font-mono text-[11px] opacity-0 transition-opacity group-hover:opacity-100">
          <Copy size={12} /> copiar
        </span>
      </button>
      <div className="p-5">
        <h3 className="text-lg font-bold">{color.name}</h3>
        <p className="mt-1 text-sm leading-6 text-base-content/60">{color.description}</p>
        <dl className="mt-4 divide-y divide-base-300 rounded-tl-lg rounded-br-lg border border-base-300">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-2 px-3 py-1.5">
              <dt className="font-mono text-[10px] tracking-[0.15em] text-base-content/45">{label}</dt>
              <dd className="flex min-w-0 items-center gap-1">
                <code className="truncate font-mono text-xs">{value}</code>
                <button
                  type="button"
                  onClick={() => copy(value, `${label} de ${color.name}`)}
                  className="btn btn-ghost btn-xs btn-square"
                  aria-label={`Copiar ${label} de ${color.name}`}
                >
                  {copied === value ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                </button>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}

export function CopyPaletteButton({ colors }: { colors: BrandColor[] }) {
  const { copied, copy } = useCopy();
  const css = `:root {\n${colors.map((c) => `  --robostage-${c.token}: ${c.value.toUpperCase()}; /* ${c.name} */`).join("\n")}\n}`;
  return (
    <button
      type="button"
      onClick={() => copy(css, "Paleta em CSS")}
      className="btn rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none border-base-300 bg-base-100"
    >
      {copied === css ? <Check size={16} className="text-success" /> : <Copy size={16} />}
      Copiar paleta em CSS
    </button>
  );
}
