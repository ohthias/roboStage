"use client";

import { useRef } from "react";
import {
  clampVictim,
  CORNER_LABEL,
  CORNERS,
  doorBlocksCorner,
  randomVictims,
  roomH,
  roomW,
  WALL_LABEL,
  wallCells,
  defaultRescue,
} from "@/utils/quickbrick/ArenaBuilder/rescue";
import { findRoomSpot } from "@/utils/quickbrick/ArenaBuilder/project";
import type { Door, Project, Rescue, Wall } from "@/utils/quickbrick/ArenaBuilder/types";
import RescueArt from "./RescueArt";
import { SvgDefs } from "./TileSvg";

interface Props {
  project: Project;
  commit: (p: Project) => void;
  live: (p: Project) => void;
  checkpoint: () => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
}

const PAD = 22;
const PAD_X = 40;
const WALLS: Wall[] = ["N", "E", "S", "W"];

export default function RescueEditor({ project, commit, live, checkpoint, svgRef }: Props) {
  const r = project.rescue;
  const W = roomW(r);
  const H = roomH(r);
  const dragId = useRef<string | null>(null);

  const setRescue = (next: Rescue) => commit({ ...project, rescue: next });

  function svgPoint(e: React.PointerEvent) {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM()!.inverse());
  }

  function onVictimDown(e: React.PointerEvent, id: string) {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    checkpoint();
    dragId.current = id;
  }
  function onVictimMove(e: React.PointerEvent) {
    const id = dragId.current;
    if (!id) return;
    const p = svgPoint(e);
    const c = clampVictim(r, p.x, p.y);
    live({
      ...project,
      rescue: { ...r, victims: r.victims.map((v) => (v.id === id ? { ...v, x: c.x, y: c.y } : v)) },
    });
  }
  function onVictimUp() {
    dragId.current = null;
  }

  function changeSize(size: Rescue["size"]) {
    const next: Rescue = { ...r, size };
    // ajusta portas e vítimas ao novo tamanho
    const fix = (d: Door): Door => ({ ...d, cell: Math.min(d.cell, wallCells(next, d.wall) - 1) });
    next.entrance = fix(next.entrance);
    next.exit = fix(next.exit);
    next.victims = next.victims.map((v) => ({ ...v, ...clampVictim(next, v.x, v.y) }));
    const roomPos = findRoomSpot({ ...project, rescue: next }, next, project.roomPos);
    commit({ ...project, rescue: next, roomPos });
  }

  function setDoor(which: "entrance" | "exit", patch: Partial<Door>) {
    const d = { ...r[which], ...patch };
    d.cell = Math.min(d.cell, wallCells(r, d.wall) - 1);
    setRescue({ ...r, [which]: d });
  }

  function setZone(which: "green" | "red", corner: Rescue["green"]) {
    const other = which === "green" ? "red" : "green";
    const next = { ...r, [which]: corner };
    if (next[other] === corner) next[other] = CORNERS.find((c) => c !== corner && c !== r[which]) ?? r[which];
    setRescue(next);
  }

  const cornerBlocked = (c: Rescue["green"]) =>
    doorBlocksCorner(r, r.entrance, c) || doorBlocksCorner(r, r.exit, c);

  function DoorControl({ label, which }: { label: string; which: "entrance" | "exit" }) {
    const d = r[which];
    return (
      <fieldset className="fieldset">
        <legend className="fieldset-legend">{label}</legend>
        <div className="flex gap-2">
          <select
            className="select select-sm flex-1"
            value={d.wall}
            onChange={(e) => setDoor(which, { wall: e.target.value as Wall })}
          >
            {WALLS.map((w) => (
              <option key={w} value={w}>
                Parede: {WALL_LABEL[w]}
              </option>
            ))}
          </select>
          <div className="join">
            {Array.from({ length: wallCells(r, d.wall) }, (_, i) => (
              <button
                key={i}
                className={`btn btn-sm join-item ${d.cell === i ? "btn-primary" : ""}`}
                onClick={() => setDoor(which, { cell: i })}
                title={`Ladrilho ${i + 1} da parede`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </fieldset>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
      <aside className="card card-border bg-base-100 h-fit">
        <div className="card-body gap-2 p-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Tamanho da sala</legend>
            <div className="join w-full">
              {(["3x3", "3x4"] as const).map((s) => (
                <button
                  key={s}
                  className={`btn btn-sm join-item flex-1 ${r.size === s ? "btn-primary" : ""}`}
                  onClick={() => changeSize(s)}
                >
                  {s === "3x3" ? "90 × 90 cm (3×3)" : "120 × 90 cm (3×4)"}
                </button>
              ))}
            </div>
          </fieldset>

          <DoorControl label="Entrada (fita prata)" which="entrance" />
          <DoorControl label="Saída (fita preta)" which="exit" />

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Largura do vão: {r.doorWidth} cm</legend>
            <input
              type="range"
              min={25}
              max={30}
              step={0.5}
              value={r.doorWidth}
              onChange={(e) => setRescue({ ...r, doorWidth: Number(e.target.value) })}
              className="range range-xs range-primary"
            />
            <p className="label text-[11px]">O manual prevê de 25 a 30 cm.</p>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Área de resgate verde (vivas)</legend>
            <select className="select select-sm w-full" value={r.green} onChange={(e) => setZone("green", e.target.value as Rescue["green"])}>
              {CORNERS.map((c) => (
                <option key={c} value={c} disabled={cornerBlocked(c)}>
                  {CORNER_LABEL[c]}
                  {cornerBlocked(c) ? " (porta)" : ""}
                </option>
              ))}
            </select>
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Área de resgate vermelha (mortas)</legend>
            <select className="select select-sm w-full" value={r.red} onChange={(e) => setZone("red", e.target.value as Rescue["green"])}>
              {CORNERS.map((c) => (
                <option key={c} value={c} disabled={cornerBlocked(c)}>
                  {CORNER_LABEL[c]}
                  {cornerBlocked(c) ? " (porta)" : ""}
                </option>
              ))}
            </select>
          </fieldset>

          <div className="divider my-1" />
          <div className="flex gap-2">
            <button
              className="btn btn-sm flex-1"
              onClick={() => setRescue({ ...r, victims: randomVictims(r) })}
            >
              🎲 Sortear vítimas
            </button>
            <button
              className="btn btn-sm btn-ghost flex-1"
              onClick={() => setRescue({ ...r, victims: defaultRescue().victims.map((v) => ({ ...v, ...clampVictim(r, v.x, v.y) })) })}
            >
              Reposicionar
            </button>
          </div>
          <p className="text-[11px] opacity-70">
            Arraste as vítimas no mapa. As áreas ficam nos cantos sem entrada/saída; no Nível 2 a borda é uma barreira de 6 cm.
          </p>
        </div>
      </aside>

      <div className="card card-border bg-base-100">
        <div className="p-3">
          <svg
            ref={svgRef}
            viewBox={`${-PAD_X} ${-PAD} ${W + PAD_X * 2} ${H + PAD * 2}`}
            className="arena-canvas mx-auto block w-full max-w-[860px]"
            role="img"
            aria-label="Sala de resgate"
          >
            <SvgDefs />
            <rect x={-PAD_X} y={-PAD} width={W + PAD_X * 2} height={H + PAD * 2} fill="#e8edf3" />

            <RescueArt rescue={r} level={project.level} labels victimHandlers={{ onDown: onVictimDown, onMove: onVictimMove, onUp: onVictimUp }} />
          </svg>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full border border-slate-500 bg-slate-300" /> Vítima viva (prata) ×2
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-slate-900" /> Vítima morta (preta) ×1
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-5 border border-slate-500 bg-slate-300" /> Fita prata (entrada)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-5 bg-slate-900" /> Fita preta (saída)
            </span>
            <span className="opacity-70">Sala: {W} × {H} cm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
