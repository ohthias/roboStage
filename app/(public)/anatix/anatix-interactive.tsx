"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

/*
 * Partes interativas da página do Anatix (monitor ao vivo simulado e botões de
 * copiar). O resto da página é renderizado no servidor.
 */

const ACCENT_TEXT =
  "text-[color-mix(in_oklab,var(--color-accent)_55%,var(--color-base-content))]";

function checksum(body: string) {
  let ck = 0;
  for (let i = 0; i < body.length; i++) ck ^= body.charCodeAt(i);
  return ck.toString(16).toUpperCase().padStart(2, "0");
}

function frame(t: number, tipo: string, campos: (string | number)[]) {
  const body = `ANX,${tipo},${t},${campos.join(",")}`;
  return `$${body}*${checksum(body)}`;
}

function useLiveDemo() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    const id = setInterval(() => setTick((n) => n + 1), 700);
    return () => clearInterval(id);
  }, []);

  const t = 15200 + tick * 250;
  const dist = 24 + 9 * Math.sin(tick / 3);
  const hz = 528 + Math.round(6 * Math.sin(tick / 2));
  const modo = dist < 17 ? "desviando" : "seguindo_linha";
  const bars = Array.from({ length: 24 }, (_, i) => {
    const k = tick - 23 + i;
    return 24 + 9 * Math.sin(k / 3);
  });

  const lines = Array.from({ length: 6 }, (_, i) => {
    const k = tick - 5 + i;
    const tt = 15200 + k * 250;
    const d = (24 + 9 * Math.sin(k / 3)).toFixed(3);
    if (k % 4 === 0)
      return frame(tt, "L", [
        528 + Math.round(6 * Math.sin(k / 2)),
        1884,
        2310,
        812,
        0,
      ]);
    if (k % 4 === 2) return frame(tt, "T", ["pid", 132, 389, 431]);
    return frame(tt, "V", ["distancia_cm", d]);
  });

  return { t, dist, hz, modo, bars, lines };
}

export function LiveMonitor() {
  const { dist, hz, modo, bars, lines } = useLiveDemo();

  return (
    <div className="relative">
      {/* formas de fundo */}
      <div
        aria-hidden="true"
        className="absolute -right-4 -top-4 size-24 rotate-12 rounded-tl-2xl rounded-br-2xl bg-accent"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-5 -left-5 size-20 rounded-full border-2 border-dashed border-secondary/50"
      />

      <div className="relative overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-secondary)]">
        <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative size-2 rounded-full bg-success" />
            </span>
            <span className="font-mono text-xs text-base-content/60">
              MeuRobo · ao vivo
            </span>
          </div>
          <span className="font-mono text-[10px] tracking-widest text-base-content/35">
            115200 BAUD
          </span>
        </div>

        <div className="grid grid-cols-3 divide-x divide-base-300 border-b border-base-300">
          <div className="px-4 py-3">
            <p className="text-[10px] font-bold tracking-[0.15em] text-primary">
              DISTÂNCIA
            </p>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums">
              {dist.toFixed(1)}
              <span className="ml-1 text-xs font-normal text-base-content/50">
                cm
              </span>
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[10px] font-bold tracking-[0.15em] text-secondary">
              LOOP
            </p>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums">
              {hz}
              <span className="ml-1 text-xs font-normal text-base-content/50">
                /s
              </span>
            </p>
          </div>
          <div className="px-4 py-3">
            <p
              className={`text-[10px] font-bold tracking-[0.15em] ${ACCENT_TEXT}`}
            >
              MODO
            </p>
            <p className="mt-1 truncate font-mono text-sm font-bold">{modo}</p>
          </div>
        </div>

        <div className="flex h-24 items-end gap-1 px-5 pt-4" aria-hidden="true">
          {bars.map((v, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-sm transition-all duration-500 ${
                v < 17
                  ? "bg-primary"
                  : i === bars.length - 1
                    ? "bg-secondary"
                    : "bg-secondary/25"
              }`}
              style={{ height: `${((v - 12) / 24) * 100}%` }}
            />
          ))}
        </div>

        <div className="mt-4 bg-neutral px-5 py-4 font-mono text-[11px] leading-6 text-neutral-content sm:text-xs">
          {lines.map((l, i) => (
            <div
              key={l}
              className={`truncate ${i === lines.length - 1 ? "opacity-100" : "opacity-60"}`}
            >
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          /* sem permissão de área de transferência */
        }
      }}
      className="btn btn-ghost btn-xs btn-square"
      aria-label={copied ? "Copiado" : "Copiar comando"}
      title={copied ? "Copiado" : "Copiar"}
    >
      {copied ? (
        <Check size={14} className="text-success" />
      ) : (
        <Copy size={14} />
      )}
    </button>
  );
}

export function CodeBlock({ lines }: { lines: string[] }) {
  return (
    <div className="mockup-code w-full overflow-x-auto rounded-tl-2xl rounded-br-2xl rounded-tr-none rounded-bl-none text-sm">
      {lines.map((line, i) => {
        const anx = line.includes("ANX_") || line.includes("ANATIX_");
        return (
          <pre
            key={i}
            data-prefix={i + 1}
            className={anx ? "bg-primary/25 text-neutral-content" : undefined}
          >
            <code>{line || " "}</code>
          </pre>
        );
      })}
    </div>
  );
}
