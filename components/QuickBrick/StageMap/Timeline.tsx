"use client";

import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Pause,
  Play,
  Plus,
  Repeat,
  SkipBack,
  SkipForward,
  Trash2,
  ListVideo,
} from "lucide-react";
import { clonePoses, fmtClock, newFrame, newScene, OBR, sceneDuration, showDuration, uid, type Issue } from "@/utils/quickbrick/StageMap/stage";
import type { Scene, StageDoc } from "@/utils/quickbrick/StageMap/types";

interface Props {
  doc: StageDoc;
  commit: (d: StageDoc) => void;
  live: (d: StageDoc) => void;
  checkpoint: () => void;
  sceneIdx: number;
  goTo: (sceneIdx: number, t: number) => void;
  t: number;
  frameIdx: number | null;
  playing: boolean;
  togglePlay: () => void;
  playAll: boolean;
  setPlayAll: (v: boolean) => void;
  loop: boolean;
  setLoop: (v: boolean) => void;
  issues: Issue[];
}

const move = <T,>(arr: T[], from: number, to: number) => {
  const a = [...arr];
  const [x] = a.splice(from, 1);
  a.splice(to, 0, x);
  return a;
};

export default function Timeline(props: Props) {
  const { doc, commit, live, checkpoint, sceneIdx, goTo, t, frameIdx, playing, togglePlay, playAll, setPlayAll, loop, setLoop, issues } =
    props;
  const scene = doc.scenes[sceneIdx];
  const n = scene.frames.length;
  const fi = frameIdx ?? Math.round(t);

  const patchScene = (fn: (s: Scene) => Scene, mode: "commit" | "live" = "commit") => {
    const next = { ...doc, scenes: doc.scenes.map((s, i) => (i === sceneIdx ? fn(s) : s)) };
    if (mode === "commit") commit(next);
    else live(next);
  };

  /* ------------------------------ cenas ------------------------------ */

  function addScene() {
    const last = scene.frames[n - 1];
    const s = newScene(doc.scenes.length + 1, last?.poses ?? {});
    const scenes = [...doc.scenes];
    scenes.splice(sceneIdx + 1, 0, s);
    commit({ ...doc, scenes });
    goTo(sceneIdx + 1, 0);
  }

  function duplicateScene() {
    const s: Scene = {
      ...scene,
      id: uid(),
      name: `${scene.name} (cópia)`,
      frames: scene.frames.map((f) => ({ ...f, id: uid(), poses: clonePoses(f.poses) })),
    };
    const scenes = [...doc.scenes];
    scenes.splice(sceneIdx + 1, 0, s);
    commit({ ...doc, scenes });
    goTo(sceneIdx + 1, 0);
  }

  function deleteScene() {
    if (doc.scenes.length <= 1) return;
    if (!window.confirm(`Excluir a cena “${scene.name}”?`)) return;
    commit({ ...doc, scenes: doc.scenes.filter((_, i) => i !== sceneIdx) });
    goTo(Math.max(0, sceneIdx - 1), 0);
  }

  function moveScene(dir: -1 | 1) {
    const to = sceneIdx + dir;
    if (to < 0 || to >= doc.scenes.length) return;
    commit({ ...doc, scenes: move(doc.scenes, sceneIdx, to) });
    goTo(to, t);
  }

  /* ------------------------------ quadros ------------------------------ */

  function addFrame() {
    const src = scene.frames[fi];
    const frames = [...scene.frames];
    frames.splice(fi + 1, 0, newFrame(src?.poses ?? {}));
    patchScene((s) => ({ ...s, frames }));
    goTo(sceneIdx, fi + 1);
  }

  function deleteFrame() {
    if (n <= 1 || frameIdx === null) return;
    patchScene((s) => ({ ...s, frames: s.frames.filter((_, i) => i !== frameIdx) }));
    goTo(sceneIdx, Math.max(0, frameIdx - 1));
  }

  function moveFrame(dir: -1 | 1) {
    if (frameIdx === null) return;
    const to = frameIdx + dir;
    if (to < 0 || to >= n) return;
    patchScene((s) => ({ ...s, frames: move(s.frames, frameIdx, to) }));
    goTo(sceneIdx, to);
  }

  const sceneIssues = issues.filter((i) => i.sceneId === scene.id && i.level !== "info");
  const frameFlag = (i: number) => {
    const hit = sceneIssues.filter((x) => x.t >= i - 0.5 && x.t < i + 0.5);
    if (hit.some((x) => x.level === "error")) return "error";
    if (hit.length) return "warn";
    return null;
  };
  const sceneFlag = (s: Scene) => {
    const hit = issues.filter((x) => x.sceneId === s.id);
    if (hit.some((x) => x.level === "error")) return "error";
    if (hit.some((x) => x.level === "warn")) return "warn";
    return null;
  };

  const time = t * scene.frameDuration;
  const total = sceneDuration(scene);
  const allTotal = showDuration(doc);
  // posição do início da cena atual dentro da apresentação
  const sceneStart = doc.scenes.slice(0, sceneIdx).reduce((acc, s) => acc + sceneDuration(s), 0);
  const scaleMax = Math.max(OBR.maxTime + 30, allTotal + 10);
  const pct = (sec: number) => `${Math.min(100, (sec / scaleMax) * 100)}%`;
  const TONE = {
    error: { text: "text-error", bar: "bg-error", soft: "bg-error/50" },
    warning: { text: "text-warning", bar: "bg-warning", soft: "bg-warning/50" },
    success: { text: "text-success", bar: "bg-success", soft: "bg-success/50" },
  } as const;
  const timeTone: keyof typeof TONE = allTotal < OBR.minTime || allTotal > OBR.maxTime ? "error" : allTotal < OBR.minTime + 10 || allTotal > OBR.maxTime - 20 ? "warning" : "success";

  return (
    <div className="card card-border bg-base-100">
      <div className="card-body gap-3 p-3">
        {/* cenas */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide opacity-60">Cenas</span>
          <div className="flex flex-1 flex-wrap gap-1">
            {doc.scenes.map((s, i) => {
              const flag = sceneFlag(s);
              return (
                <button
                  key={s.id}
                  className={`btn btn-xs gap-1 ${i === sceneIdx ? "btn-primary" : "btn-ghost bg-base-200"}`}
                  onClick={() => goTo(i, 0)}
                  title={`${s.frames.length} quadros · ${sceneDuration(s).toFixed(1)} s`}
                >
                  {flag && <span className={`inline-block size-1.5 rounded-full ${flag === "error" ? "bg-error" : "bg-warning"}`} />}
                  {i + 1}. {s.name}
                </button>
              );
            })}
          </div>
          <div className="join">
            <button className="btn btn-xs join-item" onClick={() => moveScene(-1)} disabled={sceneIdx === 0} title="Mover cena para a esquerda">
              <ChevronLeft size={14} />
            </button>
            <button
              className="btn btn-xs join-item"
              onClick={() => moveScene(1)}
              disabled={sceneIdx === doc.scenes.length - 1}
              title="Mover cena para a direita"
            >
              <ChevronRight size={14} />
            </button>
            <button className="btn btn-xs join-item" onClick={duplicateScene} title="Duplicar cena">
              <Copy size={14} />
            </button>
            <button className="btn btn-xs join-item text-error" onClick={deleteScene} disabled={doc.scenes.length <= 1} title="Excluir cena">
              <Trash2 size={14} />
            </button>
          </div>
          <button className="btn btn-xs btn-primary btn-outline" onClick={addScene} title="Nova cena começando onde esta termina">
            <Plus size={14} /> Cena
          </button>
        </div>

        {/* ajustes da cena */}
        <div className="flex flex-wrap items-end gap-3">
          <label className="floating-label">
            <span>Nome da cena</span>
            <input
              className="input input-sm w-48"
              value={scene.name}
              onFocus={checkpoint}
              onChange={(e) => patchScene((s) => ({ ...s, name: e.target.value }), "live")}
            />
          </label>
          <label className="floating-label">
            <span>Segundos por quadro</span>
            <input
              type="number"
              min={0.1}
              max={120}
              step={0.5}
              className="input input-sm w-32"
              value={scene.frameDuration}
              onFocus={checkpoint}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isFinite(v) && v >= 0.1) patchScene((s) => ({ ...s, frameDuration: Math.min(120, v) }), "live");
              }}
            />
          </label>
          <label className="flex h-8 cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="toggle toggle-sm toggle-primary"
              checked={scene.smooth}
              onChange={() => patchScene((s) => ({ ...s, smooth: !s.smooth }))}
            />
            Trajetórias suaves
          </label>
          <span className="ml-auto text-xs opacity-60">Cena: {fmtClock(total)}</span>
        </div>

        {/* duração total x limites da OBR */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-semibold">
              Apresentação: <span className={TONE[timeTone].text}>{fmtClock(allTotal)}</span>
            </span>
            <span className="opacity-60">
              mín. {fmtClock(OBR.minTime)} · máx. {fmtClock(OBR.maxTime)} (com recomeços)
            </span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-base-200" aria-hidden>
            <div className="absolute inset-y-0 bg-error/15" style={{ left: 0, width: pct(OBR.minTime) }} />
            <div className="absolute inset-y-0 bg-success/15" style={{ left: pct(OBR.minTime), width: `calc(${pct(OBR.maxTime)} - ${pct(OBR.minTime)})` }} />
            <div className="absolute inset-y-0 bg-error/15" style={{ left: pct(OBR.maxTime), right: 0 }} />
            {doc.scenes.map((s, i) => {
              const start = doc.scenes.slice(0, i).reduce((acc, x) => acc + sceneDuration(x), 0);
              return (
                <div
                  key={s.id}
                  className={`absolute inset-y-0.5 rounded-full ${i === sceneIdx ? TONE[timeTone].bar : TONE[timeTone].soft}`}
                  style={{ left: pct(start), width: `calc(${pct(sceneDuration(s))} - 2px)` }}
                  title={`${s.name}: ${fmtClock(sceneDuration(s))}`}
                />
              );
            })}
            <div className="absolute inset-y-0 w-0.5 bg-base-content" style={{ left: pct(sceneStart + time) }} />
          </div>
        </div>

        {/* reprodução */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="join">
            <button className="btn btn-sm join-item" onClick={() => goTo(sceneIdx, Math.max(0, Math.ceil(t) - 1))} title="Quadro anterior (,)">
              <SkipBack size={16} />
            </button>
            <button className="btn btn-sm btn-primary join-item w-20" onClick={togglePlay} title="Reproduzir/pausar (espaço)">
              {playing ? <Pause size={16} /> : <Play size={16} />}
              {playing ? "Pausar" : "Tocar"}
            </button>
            <button className="btn btn-sm join-item" onClick={() => goTo(sceneIdx, Math.min(n - 1, Math.floor(t) + 1))} title="Próximo quadro (.)">
              <SkipForward size={16} />
            </button>
          </div>
          <button
            className={`btn btn-sm btn-square ${playAll ? "btn-active btn-secondary" : "btn-ghost"}`}
            onClick={() => setPlayAll(!playAll)}
            title="Tocar todas as cenas em sequência"
          >
            <ListVideo size={16} />
          </button>
          <button
            className={`btn btn-sm btn-square ${loop ? "btn-active btn-secondary" : "btn-ghost"}`}
            onClick={() => setLoop(!loop)}
            title="Repetir"
          >
            <Repeat size={16} />
          </button>
          <input
            type="range"
            className="range range-xs range-primary min-w-40 flex-1"
            min={0}
            max={Math.max(0, n - 1)}
            step={0.01}
            value={t}
            disabled={n < 2}
            onChange={(e) => goTo(sceneIdx, Number(e.target.value))}
            aria-label="Linha do tempo da cena"
          />
          <span className="w-24 text-right font-mono text-xs tabular-nums">
            {fmtClock(time)} / {fmtClock(total)}
          </span>
        </div>

        {/* quadros */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide opacity-60">Quadros</span>
          <div className="flex flex-1 flex-wrap gap-1">
            {scene.frames.map((f, i) => {
              const flag = frameFlag(i);
              const active = frameIdx === i;
              return (
                <button
                  key={f.id}
                  onClick={() => goTo(sceneIdx, i)}
                  className={`relative flex h-11 w-12 flex-col items-center justify-center rounded-field border-2 text-xs transition ${
                    active ? "border-primary bg-primary/10 font-bold" : "border-base-300 hover:border-primary/50"
                  }`}
                  title={f.note || `Quadro ${i + 1}`}
                >
                  <span>{i + 1}</span>
                  <span className="text-[10px] opacity-60">{fmtClock(i * scene.frameDuration)}</span>
                  {flag && (
                    <span className={`absolute -right-1 -top-1 size-2.5 rounded-full ${flag === "error" ? "bg-error" : "bg-warning"}`} />
                  )}
                  {f.note && <span className="absolute bottom-0.5 left-1 size-1 rounded-full bg-info" />}
                  {f.resources.length > 0 && (
                    <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-accent">★{f.resources.length}</span>
                  )}
                </button>
              );
            })}
            <button
              onClick={addFrame}
              className="flex h-11 w-12 items-center justify-center rounded-field border-2 border-dashed border-base-300 hover:border-primary"
              title="Novo quadro (copia o atual)"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="join">
            <button className="btn btn-xs join-item" onClick={() => moveFrame(-1)} disabled={frameIdx === null || frameIdx === 0} title="Mover quadro para trás">
              <ChevronLeft size={14} />
            </button>
            <button className="btn btn-xs join-item" onClick={() => moveFrame(1)} disabled={frameIdx === null || frameIdx === n - 1} title="Mover quadro para frente">
              <ChevronRight size={14} />
            </button>
            <button className="btn btn-xs join-item text-error" onClick={deleteFrame} disabled={n <= 1 || frameIdx === null} title="Excluir quadro">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {frameIdx !== null && doc.resources.some((r) => r.name.trim()) && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide opacity-60">Recursos neste quadro</span>
            {doc.resources
              .filter((r) => r.name.trim())
              .map((r) => {
                const on = scene.frames[frameIdx].resources.includes(r.id);
                return (
                  <button
                    key={r.id}
                    className={`badge cursor-pointer gap-1 ${on ? "badge-accent" : "badge-ghost"}`}
                    onClick={() =>
                      patchScene((s) => ({
                        ...s,
                        frames: s.frames.map((f, i) =>
                          i !== frameIdx
                            ? f
                            : { ...f, resources: on ? f.resources.filter((x) => x !== r.id) : [...f.resources, r.id] },
                        ),
                      }))
                    }
                    title="Marque quando este recurso é demonstrado"
                  >
                    {on ? "✓" : "+"} {r.name}
                  </button>
                );
              })}
          </div>
        )}

        {frameIdx !== null ? (
          <label className="floating-label">
            <span>Nota do quadro {frameIdx + 1} (deixa, luz, música…)</span>
            <input
              className="input input-sm w-full"
              placeholder={`Nota do quadro ${frameIdx + 1} (deixa, luz, música…)`}
              value={scene.frames[frameIdx].note}
              onFocus={checkpoint}
              onChange={(e) =>
                patchScene(
                  (s) => ({ ...s, frames: s.frames.map((f, i) => (i === frameIdx ? { ...f, note: e.target.value } : f)) }),
                  "live",
                )
              }
            />
          </label>
        ) : (
          <div className="flex items-center gap-2 text-xs opacity-70">
            Você está entre dois quadros: as posições só podem ser editadas num quadro.
            <button className="btn btn-xs" onClick={() => goTo(sceneIdx, Math.round(t))}>
              Ir ao quadro {Math.round(t) + 1}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
