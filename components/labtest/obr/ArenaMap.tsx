"use client";

// ---------------------------------------------------------------------------
// Mapa da arena (cópia do Criador de Arenas) para o LabTest.
// - Na execução: toque no ladrilho onde o robô falhou.
// - Na análise: mapa de calor com as falhas somadas de todas as rodadas.
// Desenha os 3 tablados e a sala de resgate com as mesmas peças do Criador.
// ---------------------------------------------------------------------------

import { CELL } from "@/utils/quickbrick/ArenaBuilder/tiles";
import {
  WALL_T,
  roomCols,
  roomRows,
} from "@/utils/quickbrick/ArenaBuilder/rescue";
import type { Project } from "@/utils/quickbrick/ArenaBuilder/types";
import { SvgDefs, TileArt } from "@/components/QuickBrick/ArenaBuilder/TileSvg";
import RescueArt from "@/components/QuickBrick/ArenaBuilder/RescueArt";
import { tileKey, type TileRef } from "@/utils/labtest/obr";

const PAD = 6;

export default function ArenaMap({
  arena,
  heat,
  selected,
  onTileClick,
  className = "",
  label = "Mapa da arena",
}: {
  arena: Project;
  /** falhas por ladrilho ("tablado:célula" → quantidade) */
  heat?: Map<string, number>;
  selected?: TileRef | null;
  onTileClick?: (tile: TileRef) => void;
  className?: string;
  label?: string;
}) {
  // Recorta só a área usada (tablados + sala), em ladrilhos.
  const rects = [
    ...arena.boards.map((b) => ({
      c0: b.col,
      r0: b.row,
      c1: b.col + 3,
      r1: b.row + 3,
    })),
    {
      c0: arena.roomPos.col,
      r0: arena.roomPos.row,
      c1: arena.roomPos.col + roomCols(arena.rescue),
      r1: arena.roomPos.row + roomRows(arena.rescue),
    },
  ];
  const c0 = Math.min(...rects.map((r) => r.c0));
  const r0 = Math.min(...rects.map((r) => r.r0));
  const c1 = Math.max(...rects.map((r) => r.c1));
  const r1 = Math.max(...rects.map((r) => r.r1));
  const vb = `${c0 * CELL - PAD} ${r0 * CELL - PAD} ${(c1 - c0) * CELL + PAD * 2} ${(r1 - r0) * CELL + PAD * 2}`;

  const max = heat ? Math.max(0, ...heat.values()) : 0;

  return (
    <svg
      viewBox={vb}
      className={`block h-auto w-full ${className}`}
      role="img"
      aria-label={label}
    >
      <SvgDefs />
      <rect
        x={c0 * CELL - PAD}
        y={r0 * CELL - PAD}
        width={(c1 - c0) * CELL + PAD * 2}
        height={(r1 - r0) * CELL + PAD * 2}
        fill="#f3f3f3"
      />

      <g
        transform={`translate(${arena.roomPos.col * CELL} ${arena.roomPos.row * CELL})`}
      >
        <RescueArt rescue={arena.rescue} level={arena.level} bg="#f3f3f3" />
        <text
          x={(roomCols(arena.rescue) * CELL) / 2}
          y={-WALL_T - 1.5}
          textAnchor="middle"
          fontSize="4"
          fill="#64748b"
        >
          Sala de resgate
        </text>
      </g>

      {arena.boards.map((b) => (
        <g key={b.id} transform={`translate(${b.col * CELL} ${b.row * CELL})`}>
          <rect
            width="90"
            height="90"
            fill="#fff"
            stroke="#334155"
            strokeWidth=".8"
          />
          <g stroke="#94a3b8" strokeWidth=".3" strokeDasharray="1.5 1.5">
            <path d="M30 0V90M60 0V90M0 30H90M0 60H90" />
          </g>
          {b.tiles.map((t, i) => {
            const ref = { board: b.id, cell: i };
            const count = heat?.get(tileKey(ref)) ?? 0;
            const isSel = selected?.board === b.id && selected.cell === i;
            const clickable = !!onTileClick && t.shape !== "empty";
            return (
              <g
                key={i}
                transform={`translate(${(i % 3) * CELL} ${Math.floor(i / 3) * CELL})`}
              >
                <TileArt tile={t} />
                {count > 0 && max > 0 && (
                  <>
                    <rect
                      width="30"
                      height="30"
                      fill="#dc2626"
                      fillOpacity={0.18 + 0.55 * (count / max)}
                    />
                    <circle cx="24" cy="6" r="4.6" fill="#dc2626" />
                    <text
                      x="24"
                      y="7.7"
                      textAnchor="middle"
                      fontSize="5"
                      fontWeight="700"
                      fill="#fff"
                    >
                      {count}
                    </text>
                  </>
                )}
                {isSel && (
                  <rect
                    x=".8"
                    y=".8"
                    width="28.4"
                    height="28.4"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="1.6"
                  />
                )}
                {clickable && (
                  <rect
                    width="30"
                    height="30"
                    fill="transparent"
                    className="cursor-pointer hover:fill-red-500/15"
                    role="button"
                    tabIndex={0}
                    aria-label={`Tablado ${b.id}, ladrilho ${i + 1}`}
                    onClick={() => onTileClick?.(ref)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onTileClick?.(ref);
                      }
                    }}
                  />
                )}
              </g>
            );
          })}
          <text x="1.5" y="-1.5" fontSize="4" fill="#64748b">
            Tablado {b.id}
          </text>
        </g>
      ))}
    </svg>
  );
}
