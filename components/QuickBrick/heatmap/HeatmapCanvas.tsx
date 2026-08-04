"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  HeatPoint,
  HeatmapConfig,
  HeatmapMode,
  SeasonKey,
} from "@/types/heatmap";
import {
  renderHeatmap,
  renderTable,
  getLocalIntensity,
} from "@/utils/heatmap/heatmap";
import { getMissions } from "@/utils/heatmap/missions";
import { SEASONS } from "@/utils/heatmap/seasons";

type Ripple = { id: string; x: number; y: number; color: string };

type Props = {
  points: HeatPoint[];
  config: HeatmapConfig;
  mode: HeatmapMode;
  season: SeasonKey;
  onAddPoint: (x: number, y: number) => void;
  onRemoveNearest: (x: number, y: number) => void;
  imagePath: string | null;
};

export type HeatmapCanvasRef = {
  tableCanvas: HTMLCanvasElement | null;
  heatmapCanvas: HTMLCanvasElement | null;
};

function computeCanvasSize(containerEl: HTMLElement): { w: number; h: number } {
  const { width, height } = containerEl.getBoundingClientRect();
  const maxW = width - 24;
  const maxH = height - 48;
  const ratio = 2 / 1;

  let w = maxW;
  let h = maxW / ratio;

  if (h > maxH) {
    h = maxH;
    w = maxH * ratio;
  }

  return { w: Math.floor(w), h: Math.floor(h) };
}

const HeatmapCanvas = forwardRef<HeatmapCanvasRef, Props>(
  function HeatmapCanvas(
    { points, config, mode, season, onAddPoint, onRemoveNearest, imagePath },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const tableRef = useRef<HTMLCanvasElement>(null);
    const heatRef = useRef<HTMLCanvasElement>(null);

    const [size, setSize] = useState({ w: 800, h: 400 });
    const [ripples, setRipples] = useState<Ripple[]>([]);

    const applySize = useCallback(() => {
      if (!containerRef.current) return;
      const { w, h } = computeCanvasSize(containerRef.current);
      setSize({ w, h });
    }, []);

    useLayoutEffect(() => {
      applySize();
      const ro = new ResizeObserver(applySize);
      if (containerRef.current) ro.observe(containerRef.current);
      return () => ro.disconnect();
    }, [applySize]);

    useEffect(() => {
      const canvas = tableRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { accentColor, tableColor, name } = SEASONS[season];
      renderTable(
        ctx,
        size.w,
        size.h,
        accentColor,
        tableColor,
        name,
        getMissions(season),
      );
    }, [season, size]);

    useEffect(() => {
      const canvas = heatRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      renderHeatmap(
        ctx,
        points,
        config.brushRadius,
        config.opacity,
        size.w,
        size.h,
      );
    }, [points, config.brushRadius, config.opacity, size]);

    useImperativeHandle(ref, () => ({
      tableCanvas: tableRef.current,
      heatmapCanvas: heatRef.current,
    }));

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!wrapperRef.current) return;

        const rect = wrapperRef.current.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width;
        const ny = (e.clientY - rect.top) / rect.height;

        if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return;
        if (mode === "view") return;

        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;
        const color = mode === "remove" ? "#ff4d6a" : "#00e532";

        if (mode === "remove") {
          onRemoveNearest(nx, ny);
        } else {
          onAddPoint(nx, ny);
        }

        const rippleId = `${Date.now()}-${Math.random()}`;
        setRipples((prev) => [
          ...prev,
          { id: rippleId, x: localX, y: localY, color },
        ]);

        setTimeout(
          () => setRipples((prev) => prev.filter((r) => r.id !== rippleId)),
          520,
        );
      },
      [mode, onAddPoint, onRemoveNearest],
    );

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (mode !== "view" || !wrapperRef.current) return;

        const rect = wrapperRef.current.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width;
        const ny = (e.clientY - rect.top) / rect.height;

        if (nx < 0 || nx > 1 || ny < 0 || ny > 1) {
          return;
        }

        const intensity = getLocalIntensity(
          points,
          nx,
          ny,
          config.brushRadius,
          size.w,
        );

        if (intensity > 0) {
          
        } else {
        }
      },
      [mode, points, config.brushRadius, size.w],
    );

    const cursor =
      mode === "remove"
        ? "cursor-cell"
        : mode === "view"
          ? "cursor-default"
          : "cursor-crosshair";

    return (
      <>
        <div
          ref={containerRef}
          className={`relative flex-1 h-full flex items-center justify-center bg-surface border border-white/7 rounded-2xl overflow-hidden ${cursor}`}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
        >
          <div
            ref={wrapperRef}
            className="relative"
            style={{
              width: size.w,
              height: size.h,
              backgroundImage: imagePath ? `url(${imagePath})` : undefined,
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <canvas
              ref={tableRef}
              width={size.w}
              height={size.h}
              className="block rounded-md"
            />

            <canvas
              ref={heatRef}
              width={size.w}
              height={size.h}
              className="absolute top-0 left-0 pointer-events-none rounded-md"
            />

            <AnimatePresence>
              {ripples.map((r) => (
                <motion.div
                  key={r.id}
                  className="absolute pointer-events-none rounded-full"
                  style={{
                    width: 30,
                    height: 30,
                    left: r.x - 15,
                    top: r.y - 15,
                    background: r.color + "30",
                    border: `1px solid ${r.color}60`,
                  }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 4, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </>
    );
  },
);

HeatmapCanvas.displayName = "HeatmapCanvas";

export default HeatmapCanvas;
