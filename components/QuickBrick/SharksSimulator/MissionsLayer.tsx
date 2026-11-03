"use client";
import React from "react";
import { Coordinate, Mission } from "@/types/SharksSimulator.types";
import { TAPETE_HEIGHT_CM, TAPETE_WIDTH_CM } from "./constants";
import { cmToPct } from "./engine.service";
import { polygonCenter } from "./missions.service";

export const MISSION_COLORS = {
  pending: "#fbbf24",
  done: "#10b981",
  selected: "#38bdf8",
};

interface MissionsLayerProps {
  missions: Mission[];
  completed: Set<string>;
  touching?: Set<string>;
  selectedId?: string | null;
  /** Zona sendo desenhada no mapa (substitui os vértices da missão selecionada). */
  draftVertices?: Coordinate[] | null;
  showActivation?: boolean;
  compact?: boolean;
}

const toPoints = (vertices: Coordinate[]) =>
  vertices.map((p) => { const q = cmToPct(p.x, p.y); return `${q.x},${q.y}`; }).join(" ");

/**
 * Camada visual das missões sobre o tapete. Usa o mesmo sistema de
 * coordenadas (viewBox 0–100 esticado) das trajetórias, então fica alinhada
 * em qualquer zoom. Os rótulos são HTML para não distorcer o texto.
 */
const MissionsLayer: React.FC<MissionsLayerProps> = ({
  missions,
  completed,
  touching,
  selectedId,
  draftVertices,
  showActivation = true,
  compact = false,
}) => {
  return (
    <>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 pointer-events-none"
        style={{ overflow: "visible" }}
        aria-hidden
      >
        {missions.map((m) => {
          const isDone = completed.has(m.id);
          const isSelected = selectedId === m.id;
          const isTouching = touching?.has(m.id) ?? false;
          const color = isDone ? MISSION_COLORS.done : MISSION_COLORS.pending;
          const vertices = isSelected && draftVertices ? draftVertices : m.vertices;
          const act = cmToPct(m.activation.x, m.activation.y);

          return (
            <g key={m.id}>
              {showActivation && !isDone && (
                <>
                  <ellipse
                    cx={act.x}
                    cy={act.y}
                    rx={(m.radius / TAPETE_WIDTH_CM) * 100}
                    ry={(m.radius / TAPETE_HEIGHT_CM) * 100}
                    fill={color}
                    fillOpacity={isSelected ? 0.15 : 0.07}
                    stroke={isSelected ? MISSION_COLORS.selected : color}
                    strokeOpacity={isSelected ? 0.9 : 0.5}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle cx={act.x} cy={act.y} r="0.35" fill={color} vectorEffect="non-scaling-stroke" />
                </>
              )}

              {vertices.length >= 3 && (
                <polygon
                  points={toPoints(vertices)}
                  fill={color}
                  fillOpacity={isDone ? 0.45 : 0.3}
                  stroke={isSelected ? MISSION_COLORS.selected : isTouching ? "#ffffff" : color}
                  strokeWidth={isSelected || isTouching ? 2.5 : 1.5}
                  strokeDasharray={isSelected && draftVertices ? "4 3" : undefined}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  className="transition-[fill,fill-opacity] duration-300"
                />
              )}

              {/* Desenho em andamento com menos de 3 pontos */}
              {isSelected && draftVertices && draftVertices.length > 0 && draftVertices.length < 3 && (
                <polyline
                  points={toPoints(draftVertices)}
                  fill="none"
                  stroke={MISSION_COLORS.selected}
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              {isSelected && draftVertices?.map((p, i) => {
                const q = cmToPct(p.x, p.y);
                return <circle key={i} cx={q.x} cy={q.y} r="0.5" fill={MISSION_COLORS.selected} vectorEffect="non-scaling-stroke" />;
              })}
            </g>
          );
        })}
      </svg>

      {/* Rótulos */}
      {missions.map((m) => {
        if (m.vertices.length === 0) return null;
        const c = polygonCenter(m.vertices);
        const pos = cmToPct(c.x, c.y);
        const isDone = completed.has(m.id);
        return (
          <div
            key={`label-${m.id}`}
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 whitespace-nowrap"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, zIndex: 5 }}
          >
            <span
              className={`rounded px-1 font-mono font-bold text-white shadow ${compact ? "text-[8px]" : "text-[10px]"}`}
              style={{ background: `${isDone ? MISSION_COLORS.done : "#0f172a"}cc` }}
            >
              {isDone ? "✓ " : ""}
              {m.name}
            </span>
          </div>
        );
      })}
    </>
  );
};

export default MissionsLayer;
