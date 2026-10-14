"use client";

import { useRef, useState } from "react";
import { collides, rotateBoard, rotatedIndex, emptyBoard } from "@/utils/quickbrick/ArenaBuilder/project";
import { roomCols, roomRows, roomH, roomW, WALL_T } from "@/utils/quickbrick/ArenaBuilder/rescue";
import {
  canHaveMarks,
  CELL,
  isCross,
  COLS,
  emptyTile,
  HAZARDS,
  hazardAllowed,
  ROWS,
  rotateTile,
  setShape,
  SHAPES,
  toggleHazard,
} from "@/utils/quickbrick/ArenaBuilder/tiles";
import type { Project, Tile } from "@/utils/quickbrick/ArenaBuilder/types";
import RescueArt from "./RescueArt";
import { SvgDefs, TileArt, TilePreview } from "./TileSvg";

export interface Selection {
  boardId: number;
  idx: number;
}
export type Mode = "select" | "paint";

interface Props {
  project: Project;
  commit: (p: Project) => void;
  live: (p: Project) => void;
  checkpoint: () => void;
  selection: Selection | null;
  setSelection: (s: Selection | null) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  brush: Tile;
  setBrush: (t: Tile) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  onEditRescue: () => void;
}

const PAD_TOP = 8;

export default function PathEditor(props: Props) {
  const { project, commit, live, checkpoint, selection, setSelection, mode, setMode, brush, setBrush, svgRef, onEditRescue } = props;
  const drag = useRef<{ key: string; dx: number; dy: number } | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const selTile =
    selection &&
    project.boards.find((b) => b.id === selection.boardId)?.tiles[selection.idx];
  const target: Tile | null = mode === "paint" ? brush : selTile ?? null;

  /* ------------------------------ edição ------------------------------ */

  function patchTarget(fn: (t: Tile) => Tile) {
    if (mode === "paint") {
      setBrush(fn(brush));
      return;
    }
    if (!selection) return;
    commit({
      ...project,
      boards: project.boards.map((b) =>
        b.id !== selection.boardId
          ? b
          : { ...b, tiles: b.tiles.map((t, i) => (i === selection.idx ? fn(t) : t)) },
      ),
    });
  }

  function paintCell(boardId: number, idx: number) {
    commit({
      ...project,
      boards: project.boards.map((b) =>
        b.id !== boardId
          ? b
          : { ...b, tiles: b.tiles.map((t, i) => (i === idx ? { ...brush, hazards: [...brush.hazards] } : t)) },
      ),
    });
  }

  function clearBoard(id: number) {
    commit({ ...project, boards: project.boards.map((b) => (b.id === id ? emptyBoard(b.id, b.col, b.row) : b)) });
  }

  function turnBoard(id: number) {
    commit({
      ...project,
      boards: project.boards.map((b) => (b.id === id ? { ...rotateBoard(b), } : b)),
    });
    if (selection?.boardId === id) setSelection({ boardId: id, idx: rotatedIndex(selection.idx) });
  }

  const rW = roomCols(project.rescue);
  const rH = roomRows(project.rescue);

  /** posição válida (dentro do espaço e sem colidir) para uma peça? */
  function canPlace(key: string, col: number, row: number) {
    if (key === "room") {
      if (col < 0 || row < 0 || col + rW > COLS || row + rH > ROWS) return false;
      return !collides(project, { col, row, w: rW, h: rH });
    }
    if (col < 0 || row < 0 || col + 3 > COLS || row + 3 > ROWS) return false;
    return !collides(project, { col, row, w: 3, h: 3 }, { ignoreBoard: Number(key.slice(1)), checkRoom: true });
  }

  function place(key: string, col: number, row: number): Project {
    if (key === "room") return { ...project, roomPos: { col, row } };
    const id = Number(key.slice(1));
    return { ...project, boards: project.boards.map((x) => (x.id === id ? { ...x, col, row } : x)) };
  }

  const posOf = (key: string) =>
    key === "room" ? project.roomPos : project.boards.find((x) => x.id === Number(key.slice(1)))!;

  function nudge(key: string, dc: number, dr: number) {
    const cur = posOf(key);
    if (!canPlace(key, cur.col + dc, cur.row + dr)) return;
    commit(place(key, cur.col + dc, cur.row + dr));
  }

  /* ------------------------------ arrastar ------------------------------ */

  function svgPoint(e: React.PointerEvent) {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM()!.inverse());
  }

  function onHandleDown(e: React.PointerEvent, key: string) {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const cur = posOf(key);
    const p = svgPoint(e);
    checkpoint();
    drag.current = { key, dx: p.x - cur.col * CELL, dy: p.y - cur.row * CELL };
    setDragging(key);
  }

  function onHandleMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const p = svgPoint(e);
    const w = d.key === "room" ? rW : 3;
    const h = d.key === "room" ? rH : 3;
    const col = Math.min(COLS - w, Math.max(0, Math.round((p.x - d.dx) / CELL)));
    const row = Math.min(ROWS - h, Math.max(0, Math.round((p.y - d.dy) / CELL)));
    const cur = posOf(d.key);
    if (cur.col === col && cur.row === row) return;
    if (!canPlace(d.key, col, row)) return;
    live(place(d.key, col, row));
  }

  function onHandleUp() {
    drag.current = null;
    setDragging(null);
  }

  /* ------------------------------ teclado ------------------------------ */

  function onKeyDown(e: React.KeyboardEvent) {
    const k = e.key.toLowerCase();
    if (k === "r") {
      e.preventDefault();
      patchTarget((t) => rotateTile(t, e.shiftKey ? -1 : 1));
    } else if (k === "delete" || k === "backspace") {
      e.preventDefault();
      patchTarget(() => emptyTile());
    } else if (k === "escape") {
      setSelection(null);
    }
  }

  const W = COLS * CELL;
  const H = ROWS * CELL;

  const showHandle = (key: string) => hover === key || dragging === key;

  /** alça de arraste + legenda: aparece só ao passar o mouse sobre a peça */
  function Handle(props: {
    k: string;
    y: number;
    width: number;
    title: string;
    sub: string;
    action?: { label: string; run: () => void };
  }) {
    const { k, y, width, title, sub, action } = props;
    return (
      <g
        className="transition-opacity duration-150"
        opacity={showHandle(k) ? 1 : 0}
        pointerEvents={showHandle(k) ? "auto" : "none"}
      >
        <rect
          x="0"
          y={y}
          width={width}
          height="7.4"
          rx="1.6"
          fill="#334155"
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => onHandleDown(e, k)}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}
          onPointerCancel={onHandleUp}
        />
        <text x="3" y={y + 5} fontSize="4" fontWeight="700" fill="#fff" pointerEvents="none">
          ⠿ {title}
        </text>
        <text x={action ? width - 22 : width - 3} y={y + 4.9} fontSize="3" textAnchor="end" fill="#cbd5e1" pointerEvents="none">
          {sub}
        </text>
        {action && (
          <g
            className="cursor-pointer"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={action.run}
          >
            <rect x={width - 20} y={y + 1} width="19" height="5.4" rx="1.2" fill="#0ea5e9" />
            <text x={width - 10.5} y={y + 4.9} fontSize="3.1" fontWeight="700" textAnchor="middle" fill="#fff">
              {action.label}
            </text>
          </g>
        )}
      </g>
    );
  }

  return (
    <div ref={rootRef} className="grid gap-4 outline-none xl:grid-cols-[280px_1fr]" onKeyDown={onKeyDown} tabIndex={0}>
      {/* ----------------------------- caixa de ferramentas ----------------------------- */}
      <aside className="card card-border bg-base-100 h-fit">
        <div className="card-body gap-3 p-4">
          <div className="tabs tabs-box w-full bg-base-200 tabs-sm">
            <button
              className={`tab flex-1 ${mode === "select" ? "tab-active" : ""}`}
              onClick={() => setMode("select")}
            >
              Selecionar
            </button>
            <button
              className={`tab flex-1 ${mode === "paint" ? "tab-active" : ""}`}
              onClick={() => setMode("paint")}
            >
              Pincel
            </button>
          </div>
          <p className="text-xs opacity-70">
            {mode === "paint"
              ? "Escolha a peça abaixo e clique (ou arraste) sobre os ladrilhos para pintar."
              : selection
                ? `Editando: Tablado ${selection.boardId} · linha ${Math.floor(selection.idx / 3) + 1}, coluna ${(selection.idx % 3) + 1}`
                : "Clique em um ladrilho para editá-lo. Duplo clique gira 90°."}
          </p>

          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-60">Linha</div>
            <div className="grid grid-cols-3 gap-2">
              {SHAPES.map((s) => {
                const active = target?.shape === s.id;
                return (
                  <button
                    key={s.id}
                    title={`${s.label} — ${s.hint}`}
                    disabled={!target}
                    onClick={() => patchTarget((t) => setShape(t, s.id))}
                    className={`flex flex-col items-center gap-1 rounded-box border-2 p-1.5 text-[10px] leading-tight transition ${
                      active ? "border-primary bg-primary/10" : "border-base-300 hover:border-primary/50"
                    } disabled:opacity-40`}
                  >
                    <TilePreview
                      className="h-10 w-10"
                      tile={{ shape: s.id, rot: 0, hazards: [], markL: false, markR: false }}
                    />
                    <span className="text-center">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="join w-full">
            <button className="btn btn-sm join-item flex-1" disabled={!target || target.shape === "empty"} onClick={() => patchTarget((t) => rotateTile(t, -1))}>
              ↺ Girar
            </button>
            <button className="btn btn-sm join-item flex-1" disabled={!target || target.shape === "empty"} onClick={() => patchTarget((t) => rotateTile(t, 1))}>
              Girar ↻
            </button>
          </div>
          <p className="-mt-1 text-[11px] opacity-60">Atalhos: <kbd className="kbd kbd-xs">R</kbd> gira · <kbd className="kbd kbd-xs">Del</kbd> apaga</p>

          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-60">Perigos</div>
            <ul className="flex flex-col gap-1">
              {HAZARDS.map((h) => {
                const ok = !!target && hazardAllowed(target.shape, h.id);
                return (
                  <li key={h.id}>
                    <label
                      title={h.hint}
                      className={`flex cursor-pointer items-center gap-2 rounded-field px-1 py-0.5 text-sm ${ok ? "" : "opacity-40"}`}
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-primary"
                        disabled={!ok}
                        checked={!!target?.hazards.includes(h.id)}
                        onChange={() => patchTarget((t) => toggleHazard(t, h.id))}
                      />
                      <span className="flex-1">{h.label}</span>
                      <span className="badge badge-ghost badge-sm">{h.points} pts</span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <p className="mt-1 text-[11px] opacity-60">
              Gap e lombada valem em retas, curvas, interseções e ladrilhos de entrada/saída da sala. Obstáculo, rampa, gangorra e passagem, só em retas.
            </p>
          </div>

          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-60">Marcações verdes</div>
            {target && isCross(target.shape) ? (
              <div className="grid w-fit grid-cols-2 gap-x-4 gap-y-1">
                {(
                  [
                    ["markTL", "↖ Sup. esq."],
                    ["markTR", "↗ Sup. dir."],
                    ["markL", "↙ Inf. esq."],
                    ["markR", "↘ Inf. dir."],
                  ] as const
                ).map(([m, label]) => (
                  <label key={m} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-success"
                      checked={!!target[m]}
                      onChange={() => patchTarget((t) => ({ ...t, [m]: !t[m] }))}
                    />
                    {label}
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex gap-3">
                {(["markL", "markR"] as const).map((m) => (
                  <label key={m} className={`flex items-center gap-2 text-sm ${target && canHaveMarks(target.shape) ? "" : "opacity-40"}`}>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-success"
                      disabled={!target || !canHaveMarks(target.shape)}
                      checked={!!target?.[m]}
                      onChange={() => patchTarget((t) => ({ ...t, [m]: !t[m] }))}
                    />
                    {m === "markL" ? "Esquerda" : "Direita"}
                  </label>
                ))}
              </div>
            )}
            <p className="mt-1 text-[11px] opacity-60">
              Só em interseções. No “T”, vistas de quem chega pelo ramo de baixo (as duas = beco sem saída). No “+”, um marcador em cada quadrante (até 4).
            </p>
          </div>
        </div>
      </aside>

      {/* ----------------------------- espaço de trabalho ----------------------------- */}
      <div className="flex min-w-0 flex-col gap-3">
        <div className="card card-border overflow-auto bg-base-100">
          <div className="relative">
            <svg
              ref={svgRef}
              viewBox={`-2 ${-PAD_TOP} ${W + 4} ${H + PAD_TOP + 2}`}
              className="arena-canvas mx-auto block w-full min-w-[720px] max-w-[1500px]"
              role="img"
              aria-label="Espaço de trabalho com 3 tablados de 3 por 3 ladrilhos e a sala de resgate"
            >
              <SvgDefs />
              <rect x="-2" y={-PAD_TOP} width={W + 4} height={H + PAD_TOP + 2} fill="#f3f3f3" />
              {/* grade do chão: 1 ladrilho = 30 cm */}
              <g stroke="#cbd5e1" strokeWidth=".3">
                {Array.from({ length: COLS + 1 }, (_, i) => (
                  <line key={`v${i}`} x1={i * CELL} y1="0" x2={i * CELL} y2={H} />
                ))}
                {Array.from({ length: ROWS + 1 }, (_, i) => (
                  <line key={`h${i}`} x1="0" y1={i * CELL} x2={W} y2={i * CELL} />
                ))}
              </g>
              <text x={W} y={H + 1.2} textAnchor="end" fontSize="3" fill="#64748b" className="pointer-events-none">
                quadrícula = 30 cm
              </text>

              {/* sala de resgate */}
              <g
                transform={`translate(${project.roomPos.col * CELL} ${project.roomPos.row * CELL})`}
                onPointerEnter={() => setHover("room")}
                onPointerLeave={() => setHover((h) => (h === "room" ? null : h))}
              >
                <RescueArt rescue={project.rescue} level={project.level} />
                <rect
                  x={-WALL_T}
                  y={-WALL_T}
                  width={roomW(project.rescue) + WALL_T * 2}
                  height={roomH(project.rescue) + WALL_T * 2}
                  fill="transparent"
                  onDoubleClick={onEditRescue}
                />
                <Handle
                  k="room"
                  y={-WALL_T - 7.4}
                  width={roomW(project.rescue) + WALL_T * 2}
                  title="Sala de resgate"
                  sub={`${roomW(project.rescue)}×${roomH(project.rescue)} cm`}
                  action={{ label: "✎ editar", run: onEditRescue }}
                />
              </g>

              {project.boards.map((b) => {
                const key = `b${b.id}`;
                return (
                  <g
                    key={b.id}
                    transform={`translate(${b.col * CELL} ${b.row * CELL})`}
                    onPointerEnter={() => setHover(key)}
                    onPointerLeave={() => setHover((h) => (h === key ? null : h))}
                  >
                    <rect width="90" height="90" fill="#fff" stroke="#334155" strokeWidth=".8" />
                    <g stroke="#94a3b8" strokeWidth=".3" strokeDasharray="1.5 1.5">
                      <path d="M30 0V90M60 0V90M0 30H90M0 60H90" />
                    </g>
                    {b.tiles.map((t, i) => {
                      const c = i % 3;
                      const r = Math.floor(i / 3);
                      const selected = selection?.boardId === b.id && selection.idx === i && mode === "select";
                      return (
                        <g key={i} transform={`translate(${c * CELL} ${r * CELL})`}>
                          <TileArt tile={t} />
                          <rect
                            width="30"
                            height="30"
                            className="cursor-pointer fill-transparent hover:fill-sky-500/10"
                            onPointerDown={() => {
                              if (mode === "paint") paintCell(b.id, i);
                              else setSelection({ boardId: b.id, idx: i });
                              rootRef.current?.focus();
                            }}
                            onPointerEnter={(e) => {
                              if (mode === "paint" && e.buttons === 1) paintCell(b.id, i);
                            }}
                            onDoubleClick={() => {
                              if (mode === "select") {
                                setSelection({ boardId: b.id, idx: i });
                                if (t.shape !== "empty")
                                  commit({
                                    ...project,
                                    boards: project.boards.map((bb) =>
                                      bb.id !== b.id
                                        ? bb
                                        : { ...bb, tiles: bb.tiles.map((tt, k) => (k === i ? rotateTile(tt, 1) : tt)) },
                                    ),
                                  });
                              }
                            }}
                          />
                          {selected && (
                            <rect
                              className="no-export"
                              x=".6"
                              y=".6"
                              width="28.8"
                              height="28.8"
                              fill="none"
                              stroke="#2563eb"
                              strokeWidth="1"
                              strokeDasharray="3 1.5"
                              pointerEvents="none"
                            />
                          )}
                        </g>
                      );
                    })}
                    <g className="no-export">
                      <Handle k={key} y={-7.4} width={90} title={`Tablado ${b.id}`} sub={`${b.col * 30}, ${b.row * 30} cm`} />
                    </g>
                  </g>
                );
              })}
            </svg>
            <p className="text-center text-[11px] absolute bottom-2 left-0 w-full pointer-events-none z-10 text-slate-500">
              Passe o mouse sobre um tablado ou sobre a sala para ver a legenda e arrastá-lo (encaixa a cada 30 cm).
            </p>
          </div>
        </div>

        {/* ----------------------------- controles das peças ----------------------------- */}
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
          {project.boards.map((b) => (
            <div key={b.id} className="card card-border bg-base-100">
              <div className="card-body gap-2 p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">Tablado {b.id} · 3×3</h3>
                  <span className="badge badge-ghost badge-sm">
                    {b.col * 30}, {b.row * 30} cm
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <NudgePad onMove={(dc, dr) => nudge(`b${b.id}`, dc, dr)} />
                  <div className="flex flex-1 flex-col gap-1">
                    <button className="btn btn-xs" onClick={() => turnBoard(b.id)}>
                      Girar tablado 90° ↻
                    </button>
                    <button className="btn btn-xs btn-ghost text-error" onClick={() => clearBoard(b.id)}>
                      Limpar tablado
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="card card-border bg-base-100">
            <div className="card-body gap-2 p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Sala de resgate</h3>
                <span className="badge badge-ghost badge-sm">
                  {project.roomPos.col * 30}, {project.roomPos.row * 30} cm
                </span>
              </div>
              <div className="flex items-center gap-2">
                <NudgePad onMove={(dc, dr) => nudge("room", dc, dr)} />
                <div className="flex flex-1 flex-col gap-1">
                  <button className="btn btn-xs btn-info" onClick={onEditRescue}>
                    ✎ Editar sala
                  </button>
                  <span className="text-[11px] opacity-60">
                    {roomW(project.rescue)} × {roomH(project.rescue)} cm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NudgePad({ onMove }: { onMove: (dc: number, dr: number) => void }) {
  return (
    <div className="grid grid-cols-3 gap-0.5">
      <span />
      <button className="btn btn-xs btn-square" aria-label="Mover para cima" onClick={() => onMove(0, -1)}>↑</button>
      <span />
      <button className="btn btn-xs btn-square" aria-label="Mover para a esquerda" onClick={() => onMove(-1, 0)}>←</button>
      <button className="btn btn-xs btn-square" aria-label="Mover para baixo" onClick={() => onMove(0, 1)}>↓</button>
      <button className="btn btn-xs btn-square" aria-label="Mover para a direita" onClick={() => onMove(1, 0)}>→</button>
    </div>
  );
}
