"use client";

// ---------------------------------------------------------------------------
// Lê as cores do tema daisyUI ativo (v5: --color-primary etc.) e entrega
// valores concretos (hex/rgba). Isso resolve dois problemas:
//  - a sintaxe antiga `oklch(var(--bc)/0.07)` não existe mais no daisyUI v5
//    (as linhas/barras ficavam pretas ou invisíveis);
//  - SVGs com var() não sobrevivem ao html2canvas na exportação em PDF.
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";

export interface ChartTheme {
  series: string[];
  grid: string;
  axis: string;
  text: string;
  surface: string;
}

const FALLBACK: ChartTheme = {
  series: [
    "#cf2a2a",
    "#1e459f",
    "#e0a100",
    "#2a8fbd",
    "#466421",
    "#de5017",
    "#7c3aed",
    "#0f766e",
  ],
  grid: "rgba(18,18,18,0.10)",
  axis: "rgba(18,18,18,0.55)",
  text: "#121212",
  surface: "#ffffff",
};

const SERIES_TOKENS = [
  "--color-primary",
  "--color-secondary",
  "--color-accent",
  "--color-info",
  "--color-success",
  "--color-warning",
  "--color-error",
  "--color-neutral",
];

function toRgb(value: string): [number, number, number] | null {
  if (!value) return null;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

const hex = (rgb: [number, number, number]) =>
  `#${rgb.map((n) => n.toString(16).padStart(2, "0")).join("")}`;

function readTheme(el: HTMLElement): ChartTheme {
  const style = getComputedStyle(el);
  const read = (token: string) => toRgb(style.getPropertyValue(token).trim());

  const series = SERIES_TOKENS.map((token, index) => {
    const rgb = read(token);
    return rgb ? hex(rgb) : FALLBACK.series[index];
  });

  const content = read("--color-base-content");
  const surface = read("--color-base-100");

  return {
    series,
    grid: content ? `rgba(${content.join(",")},0.12)` : FALLBACK.grid,
    axis: content ? `rgba(${content.join(",")},0.6)` : FALLBACK.axis,
    text: content ? hex(content) : FALLBACK.text,
    surface: surface ? hex(surface) : FALLBACK.surface,
  };
}

export function useChartTheme() {
  const ref = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<ChartTheme>(FALLBACK);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const next = readTheme(el);
      setTheme((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };

    update();

    const observer = new MutationObserver(update);
    const options = { attributes: true, attributeFilter: ["data-theme", "class"] };
    observer.observe(document.documentElement, options);
    const scope = el.closest("[data-theme]");
    if (scope && scope !== document.documentElement) observer.observe(scope, options);

    return () => observer.disconnect();
  }, []);

  return { ref, theme };
}
