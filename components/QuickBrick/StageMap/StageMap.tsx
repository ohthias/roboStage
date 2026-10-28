"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Download, FileJson, Redo2, Undo2, Upload } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { useUndoable, useUndoShortcuts } from "@/hooks/useUndoable";
import PathEditor, { type Mode, type Selection } from "@/components/QuickBrick/ArenaBuilder/PathEditor";
import { download, svgToPng } from "@/utils/quickbrick/ArenaBuilder/export";
import { sanitizeProject } from "@/utils/quickbrick/ArenaBuilder/project";
import { emptyTile } from "@/utils/quickbrick/ArenaBuilder/tiles";
import type { Project, Tile } from "@/utils/quickbrick/ArenaBuilder/types";
import { analyze, defaultDoc, normAngle, sampleDoc, sanitizeDoc } from "@/utils/quickbrick/StageMap/stage";
import type { StageDoc } from "@/utils/quickbrick/StageMap/types";
import StageCanvas, { setPose, type StageSelection, type Tool, type ViewOptions } from "./StageCanvas";
import { SidePanel, ToolsPanel } from "./StagePanels";
import Timeline from "./Timeline";

const STORAGE_KEY = "obr-stage-map:v1";
const ARENA_KEY = "obr-arena-builder:v1";

/** o componente só é montado no navegador (a página espera detectar a tela), então dá para ler o armazenamento já na criação */
function loadDoc(): StageDoc {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) return sanitizeDoc(JSON.parse(raw)) ?? defaultDoc();
  } catch {
    /* armazenamento indisponível */
  }
  return defaultDoc();
}

export default function StageMap() {
  const { value: doc, ref: docRef, live, commit, checkpoint, undo, redo, canUndo, canRedo } = useUndoable<StageDoc>(loadDoc);
  const [tab, setTab] = useState<"stage" | "track">("stage");
  const { addToast } = useToast();

  /* ------------------------------ cabeça de leitura ------------------------------ */
  const [head, setHead] = useState({ scene: 0, t: 0 });
  const headRef = useRef(head);
  useLayoutEffect(() => {
    headRef.current = head;
  }, [head]);
  const [playing, setPlaying] = useState(false);
  const [playAll, setPlayAll] = useState(false);
  const [loop, setLoop] = useState(false);

  const sceneIdx = Math.min(head.scene, doc.scenes.length - 1);
  const scene = doc.scenes[sceneIdx];
  const t = Math.min(head.t, Math.max(0, scene.frames.length - 1));
  const frameIdx = Math.abs(t - Math.round(t)) < 1e-6 ? Math.round(t) : null;

  const goTo = useCallback((s: number, tt: number) => {
    setPlaying(false);
    setHead({ scene: s, t: Math.max(0, tt) });
  }, []);

  /* ------------------------------ edição do palco ------------------------------ */
  const [tool, setTool] = useState<Tool>("select");
  const [ink, setInk] = useState({ color: "#f59e0b", width: 3 });
  const [view, setView] = useState<ViewOptions>({ grid: true, snap: true, trajectories: true, onion: true });
  const [selection, setSelection] = useState<StageSelection>(null);
  const stageSvg = useRef<SVGSVGElement | null>(null);

  /* ------------------------------ editor de pista (PathEditor) ------------------------------ */
  const [trackSel, setTrackSel] = useState<Selection | null>(null);
  const [trackMode, setTrackMode] = useState<Mode>("select");
  const [brush, setBrush] = useState<Tile>({ ...emptyTile(), shape: "straight" });
  const trackSvg = useRef<SVGSVGElement | null>(null);
  const commitTrack = useCallback((p: Project) => commit({ ...docRef.current, track: p }), [commit, docRef]);
  const liveTrack = useCallback((p: Project) => live({ ...docRef.current, track: p }), [live, docRef]);

  /* ------------------------------ persistência ------------------------------ */
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
      } catch {
        /* ignora */
      }
    }, 300);
    return () => clearTimeout(id);
  }, [doc]);

  useUndoShortcuts(undo, redo);

  /* ------------------------------ reprodução ------------------------------ */
  const togglePlay = useCallback(() => {
    if (playing) {
      setPlaying(false);
      return;
    }
    const d = docRef.current;
    const h = headRef.current;
    const si = Math.min(h.scene, d.scenes.length - 1);
    // recomeça se estiver no fim
    if (h.t >= d.scenes[si].frames.length - 1 - 1e-6) {
      if (playAll && si < d.scenes.length - 1) setHead({ scene: si + 1, t: 0 });
      else setHead({ scene: playAll ? 0 : si, t: 0 });
    }
    setPlaying(true);
  }, [docRef, playAll, playing]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const d = docRef.current;
      const h = headRef.current;
      const si = Math.min(h.scene, d.scenes.length - 1);
      const s = d.scenes[si];
      const end = Math.max(0, s.frames.length - 1);
      let nt = h.t + dt / Math.max(0.1, s.frameDuration);
      let ns = si;
      if (nt >= end) {
        if (playAll && si < d.scenes.length - 1) {
          ns = si + 1;
          nt = 0;
        } else if (loop) {
          ns = playAll ? 0 : si;
          nt = 0;
        } else {
          setHead({ scene: si, t: end });
          setPlaying(false);
          return;
        }
      }
      setHead({ scene: ns, t: nt });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, playAll, loop, docRef]);

  /* ------------------------------ teclado ------------------------------ */
  useEffect(() => {
    if (tab !== "stage") return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)) return;
      if (el?.tagName === "BUTTON" && (e.key === " " || e.key === "Enter")) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const d = docRef.current;
      const h = headRef.current;
      const si = Math.min(h.scene, d.scenes.length - 1);
      const s = d.scenes[si];
      const fi = Math.abs(h.t - Math.round(h.t)) < 1e-6 ? Math.round(h.t) : null;
      const k = e.key;

      if (k === " ") {
        e.preventDefault();
        togglePlay();
        return;
      }
      if (k === ",") return goTo(si, Math.max(0, Math.ceil(h.t) - 1));
      if (k === ".") return goTo(si, Math.min(s.frames.length - 1, Math.floor(h.t) + 1));
      if (k === "Escape") {
        setSelection(null);
        return;
      }
      if (!selection) {
        if (k === "ArrowLeft") return goTo(si, Math.max(0, Math.ceil(h.t) - 1));
        if (k === "ArrowRight") return goTo(si, Math.min(s.frames.length - 1, Math.floor(h.t) + 1));
        return;
      }

      const step = e.shiftKey ? 10 : 1;
      const dir: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };

      if (selection.type === "actor") {
        const pose = fi !== null ? s.frames[fi].poses[selection.id] : undefined;
        if (k === "Delete" || k === "Backspace") {
          if (fi !== null && pose) {
            e.preventDefault();
            commit(setPose(d, si, fi, selection.id, null));
          }
          return;
        }
        if (!pose || fi === null) return;
        if (dir[k]) {
          e.preventDefault();
          commit(setPose(d, si, fi, selection.id, { ...pose, x: pose.x + dir[k][0], y: pose.y + dir[k][1] }));
        } else if (k === "q" || k === "Q" || k === "e" || k === "E") {
          const da = (k.toLowerCase() === "q" ? -1 : 1) * (e.shiftKey ? 5 : 15);
          commit(setPose(d, si, fi, selection.id, { ...pose, angle: normAngle(pose.angle + da) }));
        }
        return;
      }

      const listKey = selection.type === "marking" ? "markings" : "drawings";
      if (k === "Delete" || k === "Backspace") {
        e.preventDefault();
        if (listKey === "markings") commit({ ...d, markings: d.markings.filter((m) => m.id !== selection.id) });
        else commit({ ...d, drawings: d.drawings.filter((m) => m.id !== selection.id) });
        setSelection(null);
      } else if (dir[k]) {
        e.preventDefault();
        const [dx, dy] = dir[k];
        const mv = <T extends { id: string; points: { x: number; y: number }[] }>(arr: T[]) =>
          arr.map((m) => (m.id === selection.id ? { ...m, points: m.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) } : m));
        if (listKey === "markings") commit({ ...d, markings: mv(d.markings) });
        else commit({ ...d, drawings: mv(d.drawings) });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tab, selection, togglePlay, goTo, commit, docRef]);

  // ao trocar para uma ferramenta de desenho, solta marcações/desenhos selecionados
  const pickTool = useCallback((t: Tool) => {
    setTool(t);
    if (t !== "select") setSelection((s) => (s?.type === "actor" ? s : null));
  }, []);

  // seleção que deixou de existir (após desfazer, por exemplo)
  const validSelection: StageSelection =
    selection &&
    ((selection.type === "actor" && doc.actors.some((a) => a.id === selection.id)) ||
      (selection.type === "marking" && doc.markings.some((a) => a.id === selection.id)) ||
      (selection.type === "drawing" && doc.drawings.some((a) => a.id === selection.id)))
      ? selection
      : null;

  const issues = useMemo(() => analyze(doc), [doc]);

  /* ------------------------------ ações ------------------------------ */
  const slug = doc.name.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "palco";

  async function exportPng() {
    const svg = tab === "stage" ? stageSvg.current : trackSvg.current;
    if (!svg) return;
    try {
      const suffix = tab === "stage" ? `cena-${sceneIdx + 1}-quadro-${(frameIdx ?? Math.round(t)) + 1}` : "pista";
      await svgToPng(svg, `${slug}-${suffix}.png`, 6);
    } catch {
      addToast("Não foi possível gerar o PNG.");
    }
  }

  function exportJson() {
    download(new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" }), `${slug}.mapa-de-palco.json`);
  }

  const fileInput = useRef<HTMLInputElement>(null);
  async function importJson(file: File) {
    try {
      const d = sanitizeDoc(JSON.parse(await file.text()));
      if (!d) throw new Error();
      commit(d);
      goTo(0, 0);
      setSelection(null);
      addToast("Mapa de palco importado.");
    } catch {
      addToast("Arquivo inválido: não parece um Mapa de palco.");
    }
  }

  function importArena() {
    try {
      const raw = localStorage.getItem(ARENA_KEY);
      const p = raw ? sanitizeProject(JSON.parse(raw)) : null;
      if (!p || !p.boards.some((b) => b.tiles.some((tl) => tl.shape !== "empty"))) {
        addToast("Nenhum percurso salvo no Criador de Arenas deste navegador.");
        return;
      }
      commit({ ...doc, track: p, trackVisible: true });
      addToast(`Percurso “${p.name}” importado do Criador de Arenas.`);
    } catch {
      addToast("Não foi possível ler o Criador de Arenas.");
    }
  }

  function clearTrack() {
    if (!window.confirm("Apagar todas as linhas da pista?")) return;
    commit({
      ...doc,
      track: { ...doc.track, boards: doc.track.boards.map((b) => ({ ...b, tiles: b.tiles.map(() => emptyTile()) })) },
    });
  }

  function loadSample() {
    commit(sampleDoc());
    goTo(0, 0);
    setSelection(null);
    addToast("Exemplo carregado — repare na colisão marcada na cena 2.");
  }

  function reset() {
    if (!window.confirm("Limpar todo o mapa de palco (marcações, desenhos, pista, elenco e cenas)?")) return;
    commit(defaultDoc());
    goTo(0, 0);
    setSelection(null);
    addToast("Mapa de palco limpo.");
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-4 px-4">
      <header className="navbar min-h-0 flex-wrap gap-3 rounded-box bg-base-100 px-4 py-3 shadow-sm">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <label className="floating-label">
            <span>Nome da apresentação</span>
            <input
              aria-label="Nome da apresentação"
              className="input input-sm w-56"
              value={doc.name}
              placeholder="Nome da apresentação"
              onFocus={checkpoint}
              onChange={(e) => live({ ...doc, name: e.target.value })}
            />
          </label>
          <div role="tablist" className="tabs tabs-box tabs-sm w-fit bg-base-200">
            <button role="tab" className={`tab ${tab === "stage" ? "tab-active" : ""}`} onClick={() => setTab("stage")}>
              Palco e cenas
            </button>
            <button role="tab" className={`tab ${tab === "track" ? "tab-active" : ""}`} onClick={() => setTab("track")}>
              Seguidor de linha
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="join gap-0.5">
            <button className="btn btn-sm join-item" onClick={undo} disabled={!canUndo} title="Desfazer (Ctrl+Z)">
              <Undo2 size={16} />
            </button>
            <button className="btn btn-sm join-item" onClick={redo} disabled={!canRedo} title="Refazer (Ctrl+Shift+Z)">
              <Redo2 size={16} />
            </button>
          </div>
          <button className="btn btn-sm" onClick={loadSample}>
            Exemplo
          </button>
          <div className="join">
            <button className="btn btn-sm join-item" onClick={() => fileInput.current?.click()} title="Abrir arquivo .json">
              <Upload size={14} /> Abrir
            </button>
            <button className="btn btn-sm join-item" onClick={exportJson} title="Salvar arquivo .json para compartilhar com a equipe">
              <FileJson size={14} /> Salvar
            </button>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJson(f);
              e.target.value = "";
            }}
          />
          <button className="btn btn-sm btn-ghost text-error" onClick={reset}>
            Limpar tudo
          </button>
          <button onClick={exportPng} className="btn btn-sm btn-primary">
            <Download size={14} /> PNG ({tab === "stage" ? `quadro ${(frameIdx ?? Math.round(t)) + 1}` : "pista"})
          </button>
        </div>
      </header>

      {tab === "stage" ? (
        <div className="grid items-start gap-4 xl:grid-cols-[250px_1fr] 2xl:grid-cols-[250px_1fr_330px]">
          <div className="xl:sticky xl:top-4">
            <ToolsPanel
              doc={doc}
              commit={commit}
              live={live}
              checkpoint={checkpoint}
              tool={tool}
              setTool={pickTool}
              ink={ink}
              setInk={setInk}
              view={view}
              setView={setView}
            />
          </div>

          <main className="flex min-w-0 flex-col gap-3">
            <div className="card card-border overflow-auto bg-base-100">
              <StageCanvas
                doc={doc}
                docRef={docRef}
                live={live}
                commit={commit}
                checkpoint={checkpoint}
                sceneIdx={sceneIdx}
                t={t}
                frameIdx={frameIdx}
                tool={tool}
                ink={ink}
                view={view}
                selection={validSelection}
                setSelection={setSelection}
                issues={issues}
                svgRef={stageSvg}
              />
              {frameIdx !== null && scene.frames[frameIdx].note && (
                <div className="border-t border-base-300 px-4 py-2 text-sm">
                  <span className="badge badge-info badge-sm mr-2">Quadro {frameIdx + 1}</span>
                  {scene.frames[frameIdx].note}
                </div>
              )}
            </div>
            <Timeline
              doc={doc}
              commit={commit}
              live={live}
              checkpoint={checkpoint}
              sceneIdx={sceneIdx}
              goTo={goTo}
              t={t}
              frameIdx={frameIdx}
              playing={playing}
              togglePlay={togglePlay}
              playAll={playAll}
              setPlayAll={setPlayAll}
              loop={loop}
              setLoop={setLoop}
              issues={issues}
            />
          </main>

          <div className="xl:col-span-2 2xl:col-span-1">
            <SidePanel
              doc={doc}
              commit={commit}
              live={live}
              checkpoint={checkpoint}
              sceneIdx={sceneIdx}
              frameIdx={frameIdx}
              selection={validSelection}
              setSelection={setSelection}
              issues={issues}
              goTo={goTo}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="alert alert-soft alert-info flex flex-wrap items-center gap-3 text-sm">
            <span className="flex-1">
              Monte aqui as linhas que os robôs seguidores vão percorrer. Cada quadrícula tem 30 cm e cada peça 3×3 tem 90 cm, o mesmo
              tamanho dos painéis de MDF do palco. Só o que estiver dentro da área azul (o palco) aparece na aba <b>Palco e cenas</b>.
            </span>
            <button className="btn btn-sm" onClick={importArena}>
              Importar do Criador de Arenas
            </button>
            <button className="btn btn-sm btn-ghost text-error" onClick={clearTrack}>
              Limpar pista
            </button>
          </div>
          <PathEditor
            project={doc.track}
            commit={commitTrack}
            live={liveTrack}
            checkpoint={checkpoint}
            selection={trackSel}
            setSelection={setTrackSel}
            mode={trackMode}
            setMode={setTrackMode}
            brush={brush}
            setBrush={setBrush}
            svgRef={trackSvg}
            showRoom={false}
            boardLabel="Peça"
            area={{ w: doc.stage.width, h: doc.stage.depth, label: `palco ${doc.stage.width} × ${doc.stage.depth} cm` }}
          />
        </div>
      )}
    </div>
  );
}
