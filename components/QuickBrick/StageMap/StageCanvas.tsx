"use client";

import { useMemo, useRef, useState } from "react";
import { SvgDefs, TileArt } from "@/components/QuickBrick/ArenaBuilder/TileSvg";
import { CELL } from "@/utils/quickbrick/ArenaBuilder/tiles";
import {
  actorRadius,
  normAngle,
  OBR,
  pathD,
  poseAt,
  simplify,
  smoothD,
  trajectory,
  translateDrawing,
  translateMarking,
  uid,
  type Issue,
} from "@/utils/quickbrick/StageMap/stage";
import type { Actor, Drawing, Marking, Pose, Pt, StageDoc } from "@/utils/quickbrick/StageMap/types";

export type Tool = "select" | "tape" | "rect" | "circle" | "cross" | "text" | "pen" | "eraser";

export type StageSelection = { type: "actor" | "marking" | "drawing"; id: string } | null;

export interface ViewOptions {
  grid: boolean;
  snap: boolean;
  trajectories: boolean;
  onion: boolean;
}

interface Props {
  doc: StageDoc;
  docRef: React.RefObject<StageDoc>;
  live: (d: StageDoc) => void;
  commit: (d: StageDoc) => void;
  checkpoint: () => void;
  sceneIdx: number;
  /** instante atual em quadros (pode ser fracionário durante a reprodução) */
  t: number;
  /** quadro editável (null quando entre quadros) */
  frameIdx: number | null;
  tool: Tool;
  ink: { color: string; width: number };
  view: ViewOptions;
  selection: StageSelection;
  setSelection: (s: StageSelection) => void;
  issues: Issue[];
  svgRef: React.RefObject<SVGSVGElement | null>;
}

const M = 24; // margem ao redor do palco (cm)
const AUDIENCE = 22; // faixa da frente (jurados e plateia)
const TOP = 26; // faixa do fundo (tela de projeção)

type Gesture =
  | { kind: "move-actor"; id: string; dx: number; dy: number }
  | { kind: "rotate-actor"; id: string }
  | { kind: "move-item"; type: "marking" | "drawing"; id: string; start: Pt; orig: Marking | Drawing }
  | { kind: "shape"; mk: "rect" | "circle"; start: Pt }
  | { kind: "pen"; pts: Pt[] }
  | { kind: "erase" };

export function setPose(doc: StageDoc, sceneIdx: number, frameIdx: number, actorId: string, pose: Pose | null): StageDoc {
  return {
    ...doc,
    scenes: doc.scenes.map((s, si) =>
      si !== sceneIdx
        ? s
        : {
            ...s,
            frames: s.frames.map((f, fi) => {
              if (fi !== frameIdx) return f;
              const poses = { ...f.poses };
              if (pose) poses[actorId] = pose;
              else delete poses[actorId];
              return { ...f, poses };
            }),
          },
    ),
  };
}

export default function StageCanvas(props: Props) {
  const { doc, docRef, live, commit, checkpoint, sceneIdx, t, frameIdx, tool, ink, view, selection, setSelection, issues, svgRef } =
    props;
  const W = doc.stage.width;
  const D = doc.stage.depth;
  const scene = doc.scenes[sceneIdx];

  const gesture = useRef<Gesture | null>(null);
  const [draft, setDraft] = useState<
    { kind: "shape"; mk: "rect" | "circle"; a: Pt; b: Pt } | { kind: "pen"; pts: Pt[] } | null
  >(null);
  const [tape, setTape] = useState<Pt[]>([]);
  const [cursor, setCursor] = useState<Pt | null>(null);

  const snapV = (v: number, e?: { altKey: boolean }) => (view.snap && !e?.altKey ? Math.round(v / 5) * 5 : Math.round(v * 10) / 10);

  function svgPoint(e: { clientX: number; clientY: number }): Pt {
    const svg = svgRef.current!;
    const p = svg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const r = p.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: r.x, y: r.y };
  }

  const snapPt = (p: Pt, e?: { altKey: boolean }) => ({ x: snapV(p.x, e), y: snapV(p.y, e) });

  /* --------------------------- estado da cena --------------------------- */

  const current = useMemo(() => {
    const out: { actor: Actor; pose: Pose; opacity: number }[] = [];
    if (!scene) return out;
    for (const a of doc.actors) {
      const r = poseAt(scene, a.id, t);
      if (r && r.opacity > 0.01) out.push({ actor: a, pose: r.pose, opacity: r.opacity });
    }
    return out;
  }, [doc.actors, scene, t]);

  /** atores que se sobrepõem agora */
  const clashing = useMemo(() => {
    const s = new Set<string>();
    for (let i = 0; i < current.length; i++)
      for (let j = i + 1; j < current.length; j++) {
        const A = current[i];
        const B = current[j];
        if (A.opacity < 0.5 || B.opacity < 0.5) continue;
        const gap = Math.hypot(A.pose.x - B.pose.x, A.pose.y - B.pose.y) - actorRadius(A.actor) - actorRadius(B.actor);
        if (gap < 0) {
          s.add(A.actor.id);
          s.add(B.actor.id);
        }
      }
    return s;
  }, [current]);

  const sceneIssues = issues.filter((i) => i.sceneId === scene?.id && i.at && i.level !== "info");

  /* ------------------------------ ponteiro ------------------------------ */

  function capture(e: React.PointerEvent) {
    svgRef.current?.setPointerCapture(e.pointerId);
  }

  function onBackgroundDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    const p = svgPoint(e);
    if (tool === "select") {
      setSelection(null);
      return;
    }
    if (tool === "eraser") {
      checkpoint();
      gesture.current = { kind: "erase" };
      capture(e);
      return;
    }
    if (tool === "pen") {
      gesture.current = { kind: "pen", pts: [p] };
      setDraft({ kind: "pen", pts: [p] });
      capture(e);
      return;
    }
    if (tool === "rect" || tool === "circle") {
      const s = snapPt(p, e);
      gesture.current = { kind: "shape", mk: tool, start: s };
      setDraft({ kind: "shape", mk: tool, a: s, b: s });
      capture(e);
      return;
    }
    if (tool === "tape") {
      const s = snapPt(p, e);
      const last = tape[tape.length - 1];
      if (last && Math.hypot(last.x - s.x, last.y - s.y) < 1) return;
      setTape([...tape, s]);
      return;
    }
    if (tool === "cross" || tool === "text") {
      const s = snapPt(p, e);
      const m: Marking = {
        id: uid(),
        kind: tool,
        points: [s],
        color: ink.color === "#ffffff" && tool === "text" ? "#111827" : ink.color,
        width: tool === "text" ? 10 : Math.max(2, ink.width),
        label: tool === "text" ? "Texto" : "",
      };
      commit({ ...doc, markings: [...doc.markings, m] });
      setSelection({ type: "marking", id: m.id });
    }
  }

  function finishTape() {
    if (tape.length >= 2) {
      const m: Marking = { id: uid(), kind: "tape", points: tape, color: ink.color, width: Math.max(1, ink.width), label: "" };
      commit({ ...doc, markings: [...doc.markings, m] });
      setSelection({ type: "marking", id: m.id });
    }
    setTape([]);
  }

  function onMove(e: React.PointerEvent) {
    const p = svgPoint(e);
    setCursor(p);
    const g = gesture.current;
    if (!g) return;
    const d = docRef.current;
    if (g.kind === "move-actor" && frameIdx !== null) {
      const cur = d.scenes[sceneIdx].frames[frameIdx].poses[g.id];
      if (!cur) return;
      const x = snapV(p.x - g.dx, e);
      const y = snapV(p.y - g.dy, e);
      if (x === cur.x && y === cur.y) return;
      live(setPose(d, sceneIdx, frameIdx, g.id, { ...cur, x, y }));
    } else if (g.kind === "rotate-actor" && frameIdx !== null) {
      const cur = d.scenes[sceneIdx].frames[frameIdx].poses[g.id];
      if (!cur) return;
      let a = (Math.atan2(-(p.x - cur.x), p.y - cur.y) * 180) / Math.PI;
      a = e.shiftKey ? a : Math.round(a / 15) * 15;
      live(setPose(d, sceneIdx, frameIdx, g.id, { ...cur, angle: normAngle(Math.round(a)) }));
    } else if (g.kind === "move-item") {
      const dx = snapV(p.x - g.start.x, e);
      const dy = snapV(p.y - g.start.y, e);
      if (g.type === "marking")
        live({ ...d, markings: d.markings.map((m) => (m.id === g.id ? translateMarking(g.orig as Marking, dx, dy) : m)) });
      else live({ ...d, drawings: d.drawings.map((m) => (m.id === g.id ? translateDrawing(g.orig as Drawing, dx, dy) : m)) });
    } else if (g.kind === "shape") {
      setDraft({ kind: "shape", mk: g.mk, a: g.start, b: snapPt(p, e) });
    } else if (g.kind === "pen") {
      const last = g.pts[g.pts.length - 1];
      if (Math.hypot(last.x - p.x, last.y - p.y) < 0.6) return;
      g.pts.push(p);
      setDraft({ kind: "pen", pts: [...g.pts] });
    }
  }

  function onUp() {
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    if (g.kind === "shape" && draft?.kind === "shape") {
      const { a, b } = draft;
      const big = g.mk === "rect" ? Math.abs(a.x - b.x) > 2 && Math.abs(a.y - b.y) > 2 : Math.hypot(a.x - b.x, a.y - b.y) > 2;
      if (big) {
        const m: Marking = { id: uid(), kind: g.mk, points: [a, b], color: ink.color, width: Math.max(1, ink.width), label: "" };
        commit({ ...doc, markings: [...doc.markings, m] });
        setSelection({ type: "marking", id: m.id });
      }
    } else if (g.kind === "pen" && g.pts.length > 1) {
      const dr: Drawing = { id: uid(), points: simplify(g.pts, 0.5), color: ink.color, width: ink.width };
      commit({ ...doc, drawings: [...doc.drawings, dr] });
    }
    setDraft(null);
  }

  function eraseItem(type: "marking" | "drawing", id: string) {
    const d = docRef.current;
    if (type === "marking") live({ ...d, markings: d.markings.filter((m) => m.id !== id) });
    else live({ ...d, drawings: d.drawings.filter((m) => m.id !== id) });
    if (selection?.id === id) setSelection(null);
  }

  function onItemDown(e: React.PointerEvent, type: "marking" | "drawing", item: Marking | Drawing) {
    if (e.button !== 0) return;
    if (tool === "eraser") {
      e.stopPropagation();
      checkpoint();
      gesture.current = { kind: "erase" };
      capture(e);
      eraseItem(type, item.id);
      return;
    }
    if (tool !== "select") return; // outras ferramentas desenham por cima
    e.stopPropagation();
    setSelection({ type, id: item.id });
    checkpoint();
    gesture.current = { kind: "move-item", type, id: item.id, start: svgPoint(e), orig: item };
    capture(e);
  }

  function onItemEnter(e: React.PointerEvent, type: "marking" | "drawing", id: string) {
    if (tool === "eraser" && gesture.current?.kind === "erase" && e.buttons === 1) eraseItem(type, id);
  }

  function onActorDown(e: React.PointerEvent, a: Actor, pose: Pose) {
    if (tool !== "select" || e.button !== 0) return;
    e.stopPropagation();
    setSelection({ type: "actor", id: a.id });
    if (frameIdx === null || !scene.frames[frameIdx].poses[a.id]) return;
    const p = svgPoint(e);
    checkpoint();
    gesture.current = { kind: "move-actor", id: a.id, dx: p.x - pose.x, dy: p.y - pose.y };
    capture(e);
  }

  function onRotateDown(e: React.PointerEvent, a: Actor) {
    e.stopPropagation();
    checkpoint();
    gesture.current = { kind: "rotate-actor", id: a.id };
    capture(e);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (tool === "tape") {
      if (e.key === "Enter") {
        e.preventDefault();
        finishTape();
      } else if (e.key === "Escape") setTape([]);
      else if (e.key === "Backspace") setTape(tape.slice(0, -1));
    }
  }

  /* ------------------------------ desenho ------------------------------ */

  const editableActors = frameIdx !== null;
  const cursorClass =
    tool === "select" ? "" : tool === "eraser" ? "cursor-cell" : tool === "pen" ? "cursor-crosshair" : "cursor-crosshair";

  const prevFrame = frameIdx !== null && frameIdx > 0 ? scene.frames[frameIdx - 1] : null;
  const nextFrame = frameIdx !== null ? scene.frames[frameIdx + 1] ?? null : null;

  return (
    <svg
      ref={svgRef}
      viewBox={`${-M} ${-TOP} ${W + 2 * M} ${D + TOP + M + AUDIENCE}`}
      className={`mx-auto block w-full min-w-[560px] max-w-[1100px] touch-none select-none outline-none ${cursorClass}`}
      role="img"
      aria-label={`Mapa do palco, ${W} por ${D} cm`}
      tabIndex={0}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerLeave={() => setCursor(null)}
      onDoubleClick={() => tool === "tape" && finishTape()}
      onKeyDown={onKeyDown}
    >
      <SvgDefs />
      <defs>
        <clipPath id="stage-clip">
          <rect x="0" y="0" width={W} height={D} />
        </clipPath>
      </defs>

      {/* fundo */}
      <rect x={-M} y={-TOP} width={W + 2 * M} height={D + TOP + M + AUDIENCE} fill="#e2e8f0" onPointerDown={onBackgroundDown} />
      {/* tela de projeção ao fundo do palco */}
      <rect x={W * 0.12} y={-TOP + 5} width={W * 0.76} height="9" rx="1.5" fill="#1e293b" pointerEvents="none" />
      <text x={W / 2} y={-TOP + 11.2} textAnchor="middle" fontSize="4.6" fontWeight="700" fill="#e2e8f0" pointerEvents="none" letterSpacing="1.5">
        TELA DE PROJEÇÃO · FUNDO DO PALCO
      </text>
      {/* piso: branco fosco, liso */}
      <rect x="0" y="0" width={W} height={D} fill="#fbfbf8" stroke="#cbd5e1" strokeWidth=".4" onPointerDown={onBackgroundDown} />
      <rect x="0" y={D + M * 0.6} width={W} height={AUDIENCE} rx="4" fill="#cbd5e1" pointerEvents="none" />
      <text
        x={W / 2}
        y={D + M * 0.6 + AUDIENCE / 2 + 2.4}
        textAnchor="middle"
        fontSize="6.5"
        fontWeight="700"
        fill="#334155"
        pointerEvents="none"
        letterSpacing="2"
      >
        FRENTE · JURADOS E PLATEIA ▼
      </text>
      <text x={-7} y={D / 2} textAnchor="middle" fontSize="4.6" fill="#64748b" pointerEvents="none" transform={`rotate(-90 ${-7} ${D / 2})`}>
        lado esquerdo (visto da plateia)
      </text>
      <text x={W + 7} y={D / 2} textAnchor="middle" fontSize="4.6" fill="#64748b" pointerEvents="none" transform={`rotate(90 ${W + 7} ${D / 2})`}>
        lado direito
      </text>

      <g clipPath="url(#stage-clip)">
        {/* grade de 30 cm e emendas dos painéis de 90 cm */}
        {view.grid && (
          <g pointerEvents="none">
            <g stroke="#94a3b8" strokeOpacity=".28" strokeWidth=".3">
              {Array.from({ length: Math.floor(W / 30) + 1 }, (_, i) => (
                <line key={`v${i}`} x1={i * 30} y1="0" x2={i * 30} y2={D} />
              ))}
              {Array.from({ length: Math.floor(D / 30) + 1 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 30} x2={W} y2={i * 30} />
              ))}
            </g>
            <g stroke="#64748b" strokeOpacity=".45" strokeWidth=".5" strokeDasharray="3 2">
              {Array.from({ length: Math.floor(W / OBR.panel) + 1 }, (_, i) => (
                <line key={`pv${i}`} x1={i * OBR.panel} y1="0" x2={i * OBR.panel} y2={D} />
              ))}
              {Array.from({ length: Math.floor(D / OBR.panel) + 1 }, (_, i) => (
                <line key={`ph${i}`} x1="0" y1={i * OBR.panel} x2={W} y2={i * OBR.panel} />
              ))}
            </g>
          </g>
        )}

        {/* pista de seguidor de linha (do editor de pista) */}
        {doc.trackVisible &&
          doc.track.boards
            .filter((b) => b.tiles.some((tl) => tl.shape !== "empty"))
            .map((b) => (
              <g key={b.id} transform={`translate(${b.col * CELL} ${b.row * CELL})`} pointerEvents="none">
                {b.tiles.map((tl, i) =>
                  tl.shape === "empty" ? null : (
                    <g key={i} transform={`translate(${(i % 3) * CELL} ${Math.floor(i / 3) * CELL})`}>
                      <TileArt tile={tl} />
                    </g>
                  ),
                )}
                <rect width="90" height="90" fill="none" stroke="#94a3b8" strokeWidth=".4" strokeDasharray="2 2" />
              </g>
            ))}

        {/* fita preta de 5 cm no contorno, delimitando o palco */}
        <rect
          x={OBR.borderTape / 2}
          y={OBR.borderTape / 2}
          width={W - OBR.borderTape}
          height={D - OBR.borderTape}
          fill="none"
          stroke="#111827"
          strokeWidth={OBR.borderTape}
          pointerEvents="none"
        />

        {/* marcações de chão */}
        {doc.markings.map((m) => (
          <MarkingArt
            key={m.id}
            m={m}
            selected={selection?.type === "marking" && selection.id === m.id}
            interactive={tool === "select" || tool === "eraser"}
            onDown={(e) => onItemDown(e, "marking", m)}
            onEnter={(e) => onItemEnter(e, "marking", m.id)}
          />
        ))}

        {/* desenhos livres */}
        {doc.drawings.map((d) => {
          const sel = selection?.type === "drawing" && selection.id === d.id;
          const dd = smoothD(d.points);
          return (
            <g key={d.id}>
              {sel && (
                <path className="no-export" d={dd} fill="none" stroke="#38bdf8" strokeWidth={d.width + 2} strokeLinecap="round" strokeLinejoin="round" opacity=".6" />
              )}
              <path d={dd} fill="none" stroke={d.color} strokeWidth={d.width} strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />
              <path
                className="no-export"
                d={dd}
                fill="none"
                stroke="transparent"
                strokeWidth={Math.max(6, d.width + 4)}
                strokeLinecap="round"
                pointerEvents={tool === "select" || tool === "eraser" ? "stroke" : "none"}
                style={{ cursor: tool === "select" ? "move" : undefined }}
                onPointerDown={(e) => onItemDown(e, "drawing", d)}
                onPointerEnter={(e) => onItemEnter(e, "drawing", d.id)}
              />
            </g>
          );
        })}
      </g>

      {/* trajetórias da cena */}
      {view.trajectories &&
        scene &&
        doc.actors.map((a) => {
          const segs = trajectory(scene, a.id);
          if (!segs.length) return null;
          return (
            <g key={a.id} pointerEvents="none" opacity={selection?.type === "actor" && selection.id !== a.id ? 0.35 : 0.9}>
              {segs.map((s, i) => (
                <path
                  key={i}
                  d={pathD(s)}
                  fill="none"
                  stroke={a.color}
                  strokeWidth="1.2"
                  strokeDasharray="3 2"
                />
              ))}
              {scene.frames.map((f, fi) => {
                const p = f.poses[a.id];
                if (!p) return null;
                return (
                  <g key={f.id}>
                    <circle cx={p.x} cy={p.y} r="2.6" fill="#ffffff" stroke={a.color} strokeWidth=".8" />
                    <text x={p.x} y={p.y + 1.3} textAnchor="middle" fontSize="3.4" fontWeight="700" fill={a.color}>
                      {fi + 1}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

      {/* papel-cebola: quadro anterior e seguinte */}
      {view.onion && frameIdx !== null && (
        <g pointerEvents="none">
          {prevFrame &&
            doc.actors.map((a) =>
              prevFrame.poses[a.id] ? (
                <ActorArt key={`p${a.id}`} actor={a} pose={prevFrame.poses[a.id]} ghost="prev" />
              ) : null,
            )}
          {nextFrame &&
            doc.actors.map((a) =>
              nextFrame.poses[a.id] ? (
                <ActorArt key={`n${a.id}`} actor={a} pose={nextFrame.poses[a.id]} ghost="next" />
              ) : null,
            )}
        </g>
      )}

      {/* pontos de colisão previstos */}
      {sceneIssues.map((i) => {
        const near = Math.abs(i.t - t) < 0.6;
        return (
          <g key={i.id} pointerEvents="none" opacity={near ? 1 : 0.55}>
            <circle cx={i.at!.x} cy={i.at!.y} r={near ? 7 : 4} fill="none" stroke={i.level === "error" ? "#ef4444" : "#f59e0b"} strokeWidth="1.2">
              {near && <animate attributeName="r" values="5;9;5" dur="1s" repeatCount="indefinite" />}
            </circle>
            <text x={i.at!.x} y={i.at!.y + 1.8} textAnchor="middle" fontSize="5" fontWeight="800" fill={i.level === "error" ? "#ef4444" : "#f59e0b"}>
              !
            </text>
          </g>
        );
      })}

      {/* atores */}
      {current.map(({ actor, pose, opacity }) => {
        const sel = selection?.type === "actor" && selection.id === actor.id;
        const r = actorRadius(actor);
        const canEdit = editableActors && tool === "select";
        return (
          <g key={actor.id} opacity={opacity}>
            {(sel || clashing.has(actor.id)) && (
              <circle
                className="no-export"
                cx={pose.x}
                cy={pose.y}
                r={r + doc.safety}
                fill={clashing.has(actor.id) ? "#ef444422" : "none"}
                stroke={clashing.has(actor.id) ? "#ef4444" : "#38bdf8"}
                strokeWidth=".6"
                strokeDasharray="2 1.5"
                pointerEvents="none"
              />
            )}
            <g
              onPointerDown={(e) => onActorDown(e, actor, pose)}
              style={{ cursor: tool === "select" ? (canEdit ? "grab" : "pointer") : undefined }}
              pointerEvents={tool === "select" ? "auto" : "none"}
            >
              <ActorArt actor={actor} pose={pose} clash={clashing.has(actor.id)} />
            </g>
            {sel && canEdit && (
              <g className="no-export">
                {(() => {
                  const rad = (pose.angle * Math.PI) / 180;
                  const hx = pose.x - Math.sin(rad) * (r + 9);
                  const hy = pose.y + Math.cos(rad) * (r + 9);
                  return (
                    <>
                      <line x1={pose.x} y1={pose.y} x2={hx} y2={hy} stroke="#38bdf8" strokeWidth=".6" pointerEvents="none" />
                      <circle
                        cx={hx}
                        cy={hy}
                        r="3.2"
                        fill="#0ea5e9"
                        stroke="#ffffff"
                        strokeWidth=".8"
                        style={{ cursor: "crosshair" }}
                        onPointerDown={(e) => onRotateDown(e, actor)}
                      >
                        <title>Arraste para girar (Shift = livre)</title>
                      </circle>
                    </>
                  );
                })()}
              </g>
            )}
          </g>
        );
      })}

      {/* rascunhos */}
      <g className="no-export" pointerEvents="none">
        {draft?.kind === "shape" &&
          (draft.mk === "rect" ? (
            <rect
              x={Math.min(draft.a.x, draft.b.x)}
              y={Math.min(draft.a.y, draft.b.y)}
              width={Math.abs(draft.a.x - draft.b.x)}
              height={Math.abs(draft.a.y - draft.b.y)}
              fill={`${ink.color}22`}
              stroke={ink.color}
              strokeWidth={ink.width}
              strokeDasharray="3 2"
            />
          ) : (
            <circle
              cx={draft.a.x}
              cy={draft.a.y}
              r={Math.hypot(draft.a.x - draft.b.x, draft.a.y - draft.b.y)}
              fill={`${ink.color}22`}
              stroke={ink.color}
              strokeWidth={ink.width}
              strokeDasharray="3 2"
            />
          ))}
        {draft?.kind === "pen" && (
          <path d={smoothD(draft.pts)} fill="none" stroke={ink.color} strokeWidth={ink.width} strokeLinecap="round" strokeLinejoin="round" />
        )}
        {tool === "tape" && tape.length > 0 && (
          <>
            <path
              d={pathD(cursor ? [...tape, snapPt(cursor)] : tape)}
              fill="none"
              stroke={ink.color}
              strokeWidth={Math.max(1, ink.width)}
              strokeDasharray="4 2"
              opacity=".85"
            />
            {tape.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="1.6" fill="#ffffff" stroke={ink.color} strokeWidth=".6" />
            ))}
          </>
        )}
        {cursor && tool !== "select" && cursor.x >= 0 && cursor.y >= 0 && cursor.x <= W && cursor.y <= D && (
          <text x={cursor.x + 4} y={cursor.y - 4} fontSize="4" fill="#334155">
            {Math.round(snapV(cursor.x))}, {Math.round(snapV(cursor.y))} cm
          </text>
        )}
      </g>

      <text x={W} y={D + 6} textAnchor="end" fontSize="4" fill="#64748b" pointerEvents="none">
        {W} × {D} cm{view.grid ? " · quadrícula 30 cm · painel 90 cm" : ""}
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */

function MarkingArt({
  m,
  selected,
  interactive,
  onDown,
  onEnter,
}: {
  m: Marking;
  selected: boolean;
  interactive: boolean;
  onDown: (e: React.PointerEvent) => void;
  onEnter: (e: React.PointerEvent) => void;
}) {
  const [a, b] = m.points;
  const hit = {
    className: "no-export",
    onPointerDown: onDown,
    onPointerEnter: onEnter,
    style: { cursor: interactive ? "move" : undefined },
  };
  const selStroke = selected ? { stroke: "#38bdf8", strokeWidth: m.width + 2.4, opacity: 0.6 } : null;
  const labelEl = (x: number, y: number, anchor: "start" | "middle" = "start") =>
    m.label ? (
      <text x={x} y={y} fontSize="5" fontWeight="600" fill={m.color} textAnchor={anchor} pointerEvents="none">
        {m.label}
      </text>
    ) : null;

  switch (m.kind) {
    case "tape": {
      const d = pathD(m.points);
      return (
        <g>
          {selStroke && <path className="no-export" d={d} fill="none" {...selStroke} strokeLinejoin="round" />}
          <path d={d} fill="none" stroke={m.color} strokeWidth={m.width} strokeLinejoin="round" pointerEvents="none" />
          {labelEl(a.x + 2, a.y - m.width / 2 - 2)}
          <path d={d} fill="none" stroke="transparent" strokeWidth={Math.max(6, m.width + 4)} pointerEvents={interactive ? "stroke" : "none"} {...hit} />
        </g>
      );
    }
    case "rect": {
      const x = Math.min(a.x, b.x);
      const y = Math.min(a.y, b.y);
      const w = Math.abs(a.x - b.x);
      const h = Math.abs(a.y - b.y);
      return (
        <g>
          {selStroke && <rect className="no-export" x={x} y={y} width={w} height={h} fill="none" {...selStroke} />}
          <rect x={x} y={y} width={w} height={h} fill={`${m.color}26`} stroke={m.color} strokeWidth={m.width} pointerEvents="none" />
          {labelEl(x + 3, y + 7)}
          <rect x={x} y={y} width={w} height={h} fill="transparent" pointerEvents={interactive ? "all" : "none"} {...hit} />
        </g>
      );
    }
    case "circle": {
      const r = Math.hypot(a.x - b.x, a.y - b.y);
      return (
        <g>
          {selStroke && <circle className="no-export" cx={a.x} cy={a.y} r={r} fill="none" {...selStroke} />}
          <circle cx={a.x} cy={a.y} r={r} fill={`${m.color}26`} stroke={m.color} strokeWidth={m.width} pointerEvents="none" />
          {labelEl(a.x, a.y + 2, "middle")}
          <circle cx={a.x} cy={a.y} r={r} fill="transparent" pointerEvents={interactive ? "all" : "none"} {...hit} />
        </g>
      );
    }
    case "cross": {
      const s = 6;
      const d = `M${a.x - s} ${a.y - s}L${a.x + s} ${a.y + s}M${a.x + s} ${a.y - s}L${a.x - s} ${a.y + s}`;
      return (
        <g>
          {selStroke && <path className="no-export" d={d} fill="none" {...selStroke} />}
          <path d={d} fill="none" stroke={m.color} strokeWidth={m.width} strokeLinecap="square" pointerEvents="none" />
          {labelEl(a.x, a.y + s + 6, "middle")}
          <rect x={a.x - s - 2} y={a.y - s - 2} width={2 * s + 4} height={2 * s + 4} fill="transparent" pointerEvents={interactive ? "all" : "none"} {...hit} />
        </g>
      );
    }
    case "text": {
      const fs = m.width;
      const approxW = Math.max(10, (m.label || " ").length * fs * 0.55);
      return (
        <g>
          {selected && (
            <rect className="no-export" x={a.x - 2} y={a.y - fs} width={approxW + 4} height={fs * 1.3} fill="none" stroke="#38bdf8" strokeWidth=".8" strokeDasharray="2 1.5" />
          )}
          <text x={a.x} y={a.y} fontSize={fs} fontWeight="700" fill={m.color} pointerEvents="none">
            {m.label || "Texto"}
          </text>
          <rect x={a.x - 2} y={a.y - fs} width={approxW + 4} height={fs * 1.3} fill="transparent" pointerEvents={interactive ? "all" : "none"} {...hit} />
        </g>
      );
    }
  }
}

export function ActorArt({
  actor,
  pose,
  ghost,
  clash,
}: {
  actor: Actor;
  pose: Pose;
  ghost?: "prev" | "next";
  clash?: boolean;
}) {
  const s = actor.size;
  const c = actor.color;
  const stroke = clash ? "#ef4444" : "#0f172a";
  const common = ghost
    ? { fill: "none", stroke: c, strokeWidth: 0.8, strokeDasharray: ghost === "prev" ? "2 1.5" : "0.8 1.2" }
    : { fill: c, stroke, strokeWidth: clash ? 1.4 : 0.8 };
  return (
    <g opacity={ghost ? 0.55 : 1}>
      <g transform={`translate(${pose.x} ${pose.y}) rotate(${pose.angle})`}>
        {actor.kind === "robot" && (
          <>
            {!ghost && (
              <>
                <rect x={-s / 2 - 2} y={-s / 2 + 3} width="3" height={s - 6} rx="1" fill="#111827" />
                <rect x={s / 2 - 1} y={-s / 2 + 3} width="3" height={s - 6} rx="1" fill="#111827" />
              </>
            )}
            <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={s * 0.18} {...common} />
            <path d={`M${-s * 0.22} ${s * 0.12}L0 ${s * 0.4}L${s * 0.22} ${s * 0.12}Z`} fill={ghost ? c : "#ffffff"} opacity={ghost ? 0.6 : 0.9} />
          </>
        )}
        {actor.kind === "human" && (
          <>
            <ellipse cx="0" cy="0" rx={s / 2} ry={s * 0.28} {...common} />
            <circle cx="0" cy={s * 0.02} r={s * 0.17} fill={ghost ? "none" : "#fde68a"} stroke={ghost ? c : stroke} strokeWidth=".7" />
            <path d={`M${-s * 0.07} ${s * 0.17}L0 ${s * 0.27}L${s * 0.07} ${s * 0.17}Z`} fill={ghost ? c : "#0f172a"} />
          </>
        )}
        {actor.kind === "prop" && (
          <>
            <rect
              x={-s / 2}
              y={-s / 2}
              width={s}
              height={s}
              rx="2"
              {...common}
              strokeDasharray={ghost ? (ghost === "prev" ? "2 1.5" : "0.8 1.2") : "3 1.5"}
            />
            <path d={`M0 ${s * 0.2}L0 ${s * 0.45}`} stroke={ghost ? c : "#ffffff"} strokeWidth="1.2" />
          </>
        )}
      </g>
      {!ghost && (
        <text
          x={pose.x}
          y={pose.y + (actor.kind === "human" ? s * 0.28 : s * 0.72) + 6}
          textAnchor="middle"
          fontSize="5"
          fontWeight="700"
          fill="#f8fafc"
          stroke="#0f172a"
          strokeWidth="1.4"
          paintOrder="stroke"
          pointerEvents="none"
        >
          {actor.name}
        </text>
      )}
    </g>
  );
}
