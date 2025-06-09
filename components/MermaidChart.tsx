"use client"; // Se estiver usando App Router (Next 13+)

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidChartProps {
  chart: string;
}

export default function MermaidChart({ chart }: MermaidChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: "default" });

    if (chartRef.current) {
      chartRef.current.innerHTML = `<div class="mermaid">${chart}</div>`;
      mermaid.init(undefined, chartRef.current);
    }
  }, [chart]);

  return <div ref={chartRef} />;
}
